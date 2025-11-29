import { check, sleep } from "k6";
import redis from "k6/experimental/redis";
import { generateNewUser, generateNewGuild } from "../helpers/utils.ts";
import { HttpClient } from "../helpers/fetch.ts";
import { WebSocketClient, WebSocketEvent } from "../helpers/websocket.ts";
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
const REDIS_ADDR = "localhost:6379";

// vus間でデータを共有するためのRedisクライアント
const redisClient = new redis.Client(REDIS_ADDR);

export const options = {
  scenarios: {
    activeUser: {
      executor: "constant-vus",
      exec: "activeUser",
      vus: 100,
      duration: "5m",
    },
    newUser: {
      executor: "ramping-vus",
      exec: "newUser",
      vus: 1000,
    },
    spikeLoad: {
      executor: "ramping-vus",
      exec: "spikeLoad",
      vus: 1000,
    },
    luckers: {
      executor: "constant-arrival-rate",
      exec: "luckers",
      vus: 1000,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

// ============================================
// Active User: 既存ユーザーがログインしてメッセージを読み書き
// ============================================
export const activeUser = () => {
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
    "register success": (r) => r.status === 200,
  });

  const loginRes = client.post<LoginRequest, LoginResponse>("/api/auth/login", {
    email: user.email,
    password: user.password,
  });
  check(loginRes, {
    "login success": (r) => r.status === 200 && loginRes.token !== undefined,
  });
  client.setToken(loginRes.token);

  /* ======== ギルド作成 ======== */
  const { guilds: myGuilds } = client.get<ListMyGuildsResponse>(
    `/api/users/${registerRes.user.id}/guilds`
  );
  check(myGuilds.length === 0, {
    "no guilds yet": () => myGuilds.length === 0,
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
    "guild created": (r) => r.status === 200,
  });

  /* ======== 招待urlを作成 ======== */
  const inviteRes = client.post<
    CreateGuildInviteBody,
    CreateGuildInviteResponse
  >(`/api/guilds/${guildRes.guild.id}/invites`, {
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  check(inviteRes, {
    "invite created": (r) => r.status === 200,
  });

  // Redisに招待コードを保存
  redisClient.sadd(`invite_codes`, inviteRes.invite.inviteCode);

  /* ======== 招待コードを使ってギルドに参加 ======== */
  const invites = redisClient.srandmember("inveite_codes", 3) as string[];
  let joinedGuildIds: string[] = [];
  invites.forEach((code) => {
    if (code !== inviteRes.invite.inviteCode) {
      const joinRes = client.post<JoinGuildBody, JoinGuildResponse>(
        `/api/invites/${code}/join`,
        {}
      );
      check(joinRes, {
        "joined guild via invite": (r) => r.status === 200,
      });
      if (joinRes.member) {
        joinedGuildIds.push(joinRes.member.guildId);
      }
    }
  });

  const overviewRes = client.get<GetGuildOverviewResponse>(
    `/api/guilds/${guildRes.guild.id}/overview`
  );
  client.get(`/api/channels/${overviewRes.guild.defaultChannelId}/messages`);

  const wsClient = new WebSocketClient(WS_BASE_URL, loginRes.token);
  wsClient.connect((data) => {
    check(data, {
      "received websocket message": (data) => data !== undefined,
    });
  });

  wsClient.send({
    type: WebSocketEvent.SubscribeChannels,
    data: {
      channelId: overviewRes.guild.defaultChannelId,
    },
  });
  joinedGuildIds.forEach((guildId) => {
    const res = client.get<GetGuildOverviewResponse>(
      `/api/guilds/${guildId}/overview`
    );
    wsClient.send({
      type: WebSocketEvent.SubscribeChannels,
      data: {
        channelId: res.guild.defaultChannelId,
      },
    });
  });

  sleep(2);

  for (let i = 0; i < 10; i++) {
    client.post(
      `/api/channels/${overviewRes.guild.defaultChannelId}/messages`,
      {
        content: `Active user message ${i + 1} from ${user.displayId}`,
      }
    );
    sleep(1);
  }

  sleep(120);
  wsClient.close();
};

export const newUser = () => {};

export const spikeLoad = () => {};

export const luckers = () => {};
