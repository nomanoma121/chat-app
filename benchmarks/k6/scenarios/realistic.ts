import { check, sleep } from "k6";
import redis from "k6/experimental/redis";
import { generateNewUser, generateNewGuild } from "../helpers/utils.ts";
import { HttpClient } from "../helpers/fetch.ts";
import { connect as wsConnect, WebSocketEvent, type WebSocketMessage } from "../helpers/websocket.ts";
import {
  CreateGuildInviteBody,
  CreateGuildInviteResponse,
  CreateGuildRequest,
  CreateGuildResponse,
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

export const options = {
  scenarios: {
    activeUser: {
      executor: "constant-vus",
      exec: "activeUser",
      vus: 1000,
      duration: "5m",
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
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

// ============================================
// Active User: 既存ユーザーがログインしてメッセージを読み書き
// ============================================
export const activeUser = async () => {
  const client = new HttpClient(API_BASE_URL);

  /* ======== ユーザー登録とログイン ======== */
  const newUser = generateNewUser();
  const registerRes = client.post<RegisterRequest, RegisterResponse>(
    "/api/auth/register",
    newUser
  );
  const user = {
    ...newUser,
    ...registerRes.user,
  };
  check(registerRes, {
    "register success": (r: RegisterResponse) => r.user.id !== undefined,
  });

  const loginRes = client.post<LoginRequest, LoginResponse>("/api/auth/login", {
    email: user.email,
    password: user.password,
  });
  check(loginRes, {
    "login success": (r: LoginResponse) => r.token !== undefined,
  });
  client.setToken(loginRes.token);

  /* ======== ギルド作成 ======== */
  const { guilds: myGuilds } = client.get<ListMyGuildsResponse>(
    `/api/users/me/guilds`
  );
  check(myGuilds, {
    "no guilds yet": () => myGuilds === undefined || myGuilds.length === 0,
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
    "guild created": (r: CreateGuildResponse) => r.guild.id !== undefined,
  });

  /* ======== 招待urlを作成 ======== */
  const inviteRes = client.post<
    CreateGuildInviteBody,
    CreateGuildInviteResponse
  >(`/api/guilds/${guildRes.guild.id}/invites`, {
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  check(inviteRes, {
    "invite created": (r: CreateGuildInviteResponse) => r.invite.inviteCode !== undefined,
  });

  // Redisに招待コードを保存
  await redisClient.sadd(`invite_codes`, inviteRes.invite.inviteCode);

  /* ======== 招待コードを使ってギルドに参加 ======== */
  const invitesRaw = await redisClient.srandmember("invite_codes", 3);
  const invites = Array.isArray(invitesRaw) ? invitesRaw : invitesRaw ? [invitesRaw] : [];
  let joinedGuildIds: string[] = [];
  if (invites) {
    for (let i = 0; i < invites.length; i++) {
      const code = invites[i];
      if (code !== inviteRes.invite.inviteCode) {
        const joinRes = client.post<JoinGuildBody, JoinGuildResponse>(
          `/api/invites/${code}/join`,
          {}
        );
        check(joinRes, {
          "joined guild via invite": (r: JoinGuildResponse) => r !== undefined,
        });
        if (joinRes.member) {
          joinedGuildIds.push(joinRes.member.guildId);
        }
      }
    }
  }

  const overviewRes = client.get<GetGuildOverviewResponse>(
    `/api/guilds/${guildRes.guild.id}/overview`
  );
  client.get(`/api/channels/${overviewRes.guild.defaultChannelId}/messages`);

  wsConnect(WS_BASE_URL, loginRes.token, {
    onAuth: (socket) => {
      socket.send({
        type: WebSocketEvent.SubscribeChannels,
        data: { channelId: overviewRes.guild.defaultChannelId },
      });

      joinedGuildIds.forEach((guildId) => {
        const res = client.get<GetGuildOverviewResponse>(
          `/api/guilds/${guildId}/overview`
        );
        socket.send({
          type: WebSocketEvent.SubscribeChannels,
          data: { channelId: res.guild.defaultChannelId },
        });
      });

      sleep(2);
      for (let i = 0; i < 10; i++) {
        const msgRes = client.post(
          `/api/channels/${overviewRes.guild.defaultChannelId}/messages`,
          { content: `Active user message ${i + 1} from ${user.displayId}` }
        );
        check(msgRes, {
          "message sent": (r) => r !== undefined && !r.error,
        });
        if (msgRes.error) {
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
