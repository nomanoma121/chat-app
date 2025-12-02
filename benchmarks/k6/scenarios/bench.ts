import { check, sleep } from "k6";
import redis from "k6/experimental/redis";
import { generateNewUser, generateNewGuild } from "../helpers/utils.ts";
import { HttpClient } from "../helpers/fetch.ts";
import { connect as wsConnect, WebSocketEvent, type WebSocketMessage } from "../helpers/websocket.ts";
import {
  CreateBody,
  CreateGuildInviteBody,
  CreateGuildInviteResponse,
  CreateGuildRequest,
  CreateGuildResponse,
  CreateResponse,
  GetGuildOverviewResponse,
  JoinGuildBody,
  JoinGuildResponse,
  ListMyGuildsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/Api.ts";

const API_BASE_URL = "http://localhost:8000";
const WS_BASE_URL = "ws://localhost:50054/ws";
const REDIS_ADDR = "redis://127.0.0.1:6379";

// vus間でデータを共有するためのRedisクライアント
const redisClient = new redis.Client(REDIS_ADDR);

// テスト開始前にRedisをクリア
export function setup() {
  redisClient.del("invite_codes");
}

export const options = {
  scenarios: {
    activeUser: {
      executor: "constant-vus",
      exec: "activeUser",
      vus: 500,
      duration: "1m",
    },
  //   newUser: {
  //     executor: "ramping-vus",
  //     exec: "newUser",
  //     vus: 1000,
  //   },
  //   spikeLoad: {
  //     executor: "ramping-vus",
  //     exec: "spikeLoad",
  //     vus: 1000,
  //   },
  //   luckers: {
  //     executor: "constant-arrival-rate",
  //     exec: "luckers",
  //     vus: 1000,
  //   },
  },
  summaryTrendStats: ['count', 'avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],

    'http_req_duration{name:POST /api/auth/register}': ["p(95)<500"],
    'http_req_duration{name:POST /api/auth/login}': ["p(95)<500"],
    'http_req_duration{name:GET /api/users/me/guilds}': ["p(95)<500"],
    'http_req_duration{name:POST /api/guilds}': ["p(95)<500"],
    'http_req_duration{name:POST /api/guilds/:id/invites}': ["p(95)<500"],
    'http_req_duration{name:POST /api/invites/:code/join}': ["p(95)<500"],
    'http_req_duration{name:GET /api/guilds/:id/overview}': ["p(95)<500"],
    'http_req_duration{name:GET /api/channels/:id/messages}': ["p(95)<500"],
    'http_req_duration{name:POST /api/channels/:id/messages}': ["p(95)<500"],
  },
};

export const activeUser = async () => {
  const client = new HttpClient(API_BASE_URL);

  const newUser = generateNewUser();
  const registerRes = client.post<RegisterRequest, RegisterResponse>(
    "/api/auth/register",
    newUser
  );
  const user = {
    ...newUser,
    ...registerRes.data.user,
  };
  check(registerRes, {
    "register success": (r) => r.status >= 200 && r.status < 300,
  });

  const loginRes = client.post<LoginRequest, LoginResponse>("/api/auth/login", {
    email: user.email,
    password: user.password,
  });
  check(loginRes, {
    "login success": (r) => r.status >= 200 && r.status < 300,
  });
  client.setToken(loginRes.data.token);

  const myGuildsRes = client.get<ListMyGuildsResponse>(
    `/api/users/me/guilds`
  );
  check(myGuildsRes, {
    "get my guilds": (r) => r.status >= 200 && r.status < 300,
  });

  const guild = generateNewGuild();
  const guildRes = client.post<CreateGuildRequest, CreateGuildResponse>(
    "/api/guilds",
    {
      name: guild.name,
      description: guild.description,
      iconUrl: guild.iconUrl,
    }
  );
  check(guildRes, {
    "guild created": (r) => r.status >= 200 && r.status < 300,
  });

  const inviteRes = client.post<
    CreateGuildInviteBody,
    CreateGuildInviteResponse
  >(`/api/guilds/${guildRes.data.guild.id}/invites`, {
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  check(inviteRes, {
    "invite created": (r) => r.status >= 200 && r.status < 300,
  });

  await redisClient.sadd(`invite_codes`, inviteRes.data.invite.inviteCode);
  sleep(1);

  const invitesRaw = await redisClient.srandmember("invite_codes", 3);
  const invites = Array.isArray(invitesRaw) ? invitesRaw : invitesRaw ? [invitesRaw] : [];
  let joinedGuildIds: string[] = [];
  if (invites) {
    for (let i = 0; i < invites.length; i++) {
      const code = invites[i];
      if (code !== inviteRes.data.invite.inviteCode) {
        const joinRes = client.post<JoinGuildBody, JoinGuildResponse>(
          `/api/invites/${code}/join`,
          {}
        );
        check(joinRes, {
          "joined guild via invite": (r) => r.status >= 200 && r.status < 300,
        });
        if (joinRes.data.member) {
          joinedGuildIds.push(joinRes.data.member.guildId);
        }
      }
    }
  }

  const overviewRes = client.get<GetGuildOverviewResponse>(
    `/api/guilds/${guildRes.data.guild.id}/overview`
  );
  client.get(`/api/channels/${overviewRes.data.guild.defaultChannelId}/messages`);

  wsConnect(WS_BASE_URL, loginRes.data.token, {
    onAuth: (socket, userId) => {
      socket.send({
        type: WebSocketEvent.SubscribeChannels,
        data: { user_id: userId, channel_ids: [overviewRes.data.guild.defaultChannelId] },
      });

      joinedGuildIds.forEach((guildId) => {
        const res = client.get<GetGuildOverviewResponse>(
          `/api/guilds/${guildId}/overview`
        );
        socket.send({
          type: WebSocketEvent.SubscribeChannels,
          data: { user_id: userId, channel_ids: [res.data.guild.defaultChannelId] },
        });
      });

      sleep(2);
      for (let i = 0; i < 10; i++) {
        const msgRes = client.post<CreateBody, CreateResponse>(
          `/api/channels/${overviewRes.data.guild.defaultChannelId}/messages`,
          { content: `Active user message ${i + 1} from ${user.displayId}` }
        );
        check(msgRes, {
          "message sent": (r) => r.status >= 200 && r.status < 300,
        });
        if (!msgRes.data.message) {
          console.error(`Message ${i + 1} failed: ${JSON.stringify(msgRes)}`);
        }
        sleep(1);
      }
    },

    onMessage: (_socket, data) => {
      check(data, {
        "received websocket message": (d: WebSocketMessage) => d !== undefined,
      });
    },
    timeout: 120000,
  });
};

export const newUser = () => {};

export const spikeLoad = () => {};

export const luckers = () => {};
