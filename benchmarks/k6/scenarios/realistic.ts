import { check, sleep } from "k6";
import redis from "k6/experimental/redis";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
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

export const options = {
  scenarios: {
    activeUser: {
      executor: "constant-vus",
      exec: "activeUser",
      vus: 2000,
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
  summaryTrendStats: ['count', 'avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],

    'http_req_duration{name:POST /api/auth/register}': ["p(95)<300"],
    'http_req_duration{name:POST /api/auth/login}': ["p(95)<200"],
    'http_req_duration{name:GET /api/users/me/guilds}': ["p(95)<150"],
    'http_req_duration{name:POST /api/guilds}': ["p(95)<300"],
    'http_req_duration{name:POST /api/guilds/:id/invites}': ["p(95)<200"],
    'http_req_duration{name:POST /api/invites/:code/join}': ["p(95)<300"],
    'http_req_duration{name:GET /api/guilds/:id/overview}': ["p(95)<200"],
    'http_req_duration{name:GET /api/channels/:id/messages}': ["p(95)<250"],
    'http_req_duration{name:POST /api/channels/:id/messages}': ["p(95)<300"],
  },
};

// ============================================
// Active User: 既存ユーザーがログインしてメッセージを読み書き
// ============================================
export const activeUser = async () => {
  const client = new HttpClient(API_BASE_URL);

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

  const inviteRes = client.post<
    CreateGuildInviteBody,
    CreateGuildInviteResponse
  >(`/api/guilds/${guildRes.guild.id}/invites`, {
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  check(inviteRes, {
    "invite created": (r: CreateGuildInviteResponse) => r.invite.inviteCode !== undefined,
  });

  await redisClient.sadd(`invite_codes`, inviteRes.invite.inviteCode);

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
    onAuth: (socket, userId) => {
      socket.send({
        type: WebSocketEvent.SubscribeChannels,
        data: { user_id: userId, channel_ids: [overviewRes.guild.defaultChannelId] },
      });

      joinedGuildIds.forEach((guildId) => {
        const res = client.get<GetGuildOverviewResponse>(
          `/api/guilds/${guildId}/overview`
        );
        socket.send({
          type: WebSocketEvent.SubscribeChannels,
          data: { user_id: userId, channel_ids: [res.guild.defaultChannelId] },
        });
      });

      sleep(2);
      for (let i = 0; i < 10; i++) {
        const msgRes = client.post<CreateBody, CreateResponse>(
          `/api/channels/${overviewRes.guild.defaultChannelId}/messages`,
          { content: `Active user message ${i + 1} from ${user.displayId}` }
        );
        check(msgRes, {
          "message sent": (r) => r.message !== undefined,
        });
        if (!msgRes.message) {
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

// エンドポイントごとのメトリクスを表示するカスタムサマリー
export function handleSummary(data: Record<string, unknown>) {
  const metrics = data.metrics as Record<string, {
    type: string;
    values: Record<string, number>;
    contains?: string;
  }>;

  // http_req_duration メトリクスからタグ別のデータを抽出
  const endpointMetrics: Record<string, { count: number; avg: number; p95: number; p99: number; min: number; max: number; med: number }> = {};

  for (const [key, metric] of Object.entries(metrics)) {
    // http_req_duration{name:エンドポイント名} 形式のメトリクスを抽出
    const match = key.match(/^http_req_duration\{name:(.+)\}$/);
    if (match && metric.type === 'trend') {
      const endpoint = match[1];

      endpointMetrics[endpoint] = {
        count: metric.values.count || 0,
        avg: metric.values.avg || 0,
        med: metric.values.med || 0,
        p95: metric.values['p(95)'] || 0,
        p99: metric.values['p(99)'] || 0,
        min: metric.values.min || 0,
        max: metric.values.max || 0,
      };
    }
  }

  // 閾値を取得
  const getThreshold = (endpoint: string): number | null => {
    const thresholdKey = `http_req_duration{name:${endpoint}}`;
    const thresholds = options.thresholds as Record<string, string[]> | undefined;
    const threshold = thresholds?.[thresholdKey];
    if (!threshold || !Array.isArray(threshold)) return null;

    // "p(95)<500" のような形式から数値を抽出
    const p95Match = threshold.find((t: string) => t.includes('p(95)<'));
    if (!p95Match) return null;
    const match = p95Match.match(/p\(95\)<(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  let output = '\n\n█ ENDPOINT METRICS (Response Time)\n\n';
  const sortedEndpoints = Object.entries(endpointMetrics).sort((a, b) => b[1].p95 - a[1].p95);

  for (const [endpoint, stats] of sortedEndpoints) {
    const threshold = getThreshold(endpoint);
    const exceedsThreshold = threshold !== null && stats.p95 > threshold;

    // 閾値超えの場合は赤色にする
    const p95Color = exceedsThreshold ? '\x1b[31m' : '';
    const resetColor = '\x1b[0m';

    output += `  ${endpoint}\n`;
    output += `    Requests: ${stats.count}\n`;
    output += `    Avg: ${stats.avg.toFixed(2)}ms | Med: ${stats.med.toFixed(2)}ms\n`;
    output += `    Min: ${stats.min.toFixed(2)}ms | Max: ${stats.max.toFixed(2)}ms\n`;
    output += `    p95: ${p95Color}${stats.p95.toFixed(2)}ms${resetColor} | p99: ${stats.p99.toFixed(2)}ms`;
    if (exceedsThreshold && threshold !== null) {
      output += ` ${p95Color}(threshold: ${threshold}ms)${resetColor}`;
    }
    output += '\n\n';
  }

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }) + output,
    'summary.json': JSON.stringify(data, null, 2),
  };
}
