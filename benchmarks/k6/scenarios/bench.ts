// @ts-expect-error
import { check, sleep } from "k6";
// @ts-expect-error
import redis from "k6/experimental/redis";
import { Client, type ResponseStatus } from "../helpers/client.ts";
import { generateNewGuild, generateNewUser } from "../helpers/utils.ts";
import {
	WebSocketEvent,
	type WebSocketMessage,
	connect as wsConnect,
} from "../helpers/websocket.ts";

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
			vus: 100,
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
	summaryTrendStats: ["count", "avg", "min", "med", "max", "p(95)", "p(99)"],
	thresholds: {
		http_req_duration: ["p(95)<500", "p(99)<1000"],
		http_req_failed: ["rate<0.01"],

		"http_req_duration{name:POST /api/auth/register}": ["p(95)<500"],
		"http_req_duration{name:POST /api/auth/login}": ["p(95)<500"],
		"http_req_duration{name:GET /api/auth/me}": ["p(95)<500"],
		"http_req_duration{name:GET /api/users/me/guilds}": ["p(95)<500"],
		"http_req_duration{name:POST /api/guilds}": ["p(95)<500"],
		"http_req_duration{name:POST /api/guilds/:id/invites}": ["p(95)<500"],
		"http_req_duration{name:POST /api/invites/:code/join}": ["p(95)<500"],
		"http_req_duration{name:GET /api/guilds/:id/overview}": ["p(95)<500"],
		"http_req_duration{name:GET /api/channels/:id/messages}": ["p(95)<500"],
		"http_req_duration{name:POST /api/channels/:id/messages}": ["p(95)<500"],
		"http_req_duration{name:GET /api/guilds/:id/invites}": ["p(95)<500"],
		"http_req_duration{name:GET /api/guilds/:id}": ["p(95)<500"],
		"http_req_duration{name:GET /api/invites/:code}": ["p(95)<500"],
		"http_req_duration{name:POST /api/guilds/:id/categories}": ["p(95)<500"],
		"http_req_duration{name:POST /api/categories/:id/channels}": ["p(95)<500"],
	},
};

export const activeUser = async () => {
	const client = new Client(API_BASE_URL);

	const newUser = generateNewUser();
	const registerResult = client.register(newUser);
	check(
		{ success: registerResult.success },
		{
			"register success": (r: ResponseStatus) => r.success,
		},
	);

	const loginResult = client.login(newUser.email, newUser.password);
	check(
		{ success: loginResult.success },
		{
			"login success": (r: ResponseStatus) => r.success,
		},
	);

	const authMeResult = client.authMe();
	check(
		{ success: authMeResult.success },
		{
			"auth me success": (r: ResponseStatus) => r.success,
		},
	);

	const myGuildsResult = client.getMyGuilds();
	check(
		{ success: myGuildsResult.success },
		{
			"get my guilds": (r: ResponseStatus) => r.success,
		},
	);

	const guild = generateNewGuild();
	const guildResult = client.createGuild(guild);
	check(
		{ success: guildResult.success },
		{
			"guild created": (r: ResponseStatus) => r.success,
		},
	);

	const overviewResult = client.getGuildOverview(guildResult.guildId);
	check(
		{ success: overviewResult.success },
		{
			"get guild overview": (r: ResponseStatus) => r.success,
		},
	);

	const getGuildRes = client.getGuild(guildResult.guildId);
	check(
		{ success: getGuildRes.success },
		{
			"get guild": (r: ResponseStatus) => r.success,
		},
	);

	for (let i = 1; i <= 3; i++) {
		const categoryResult = client.createCategory(
			guildResult.guildId,
			`Category ${i}`,
		);
		check(
			{ success: categoryResult.success },
			{
				"category created": (r: ResponseStatus) => r.success,
			},
		);

		for (let j = 1; j <= 3; j++) {
			const channelResult = client.createChannel(
				categoryResult.categoryId,
				`channel-${j}`,
			);
			check(
				{ success: channelResult.success },
				{
					"text channel created": (r: ResponseStatus) => r.success,
				},
			);
		}
	}

	const getInvitesRes = client.getInvites(guildResult.guildId);
	check(
		{ success: getInvitesRes.success },
		{
			"get invites": (r: ResponseStatus) => r.success,
		},
	);

	const inviteResult = client.createInvite(
		guildResult.guildId,
		new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
	);
	check(
		{ success: inviteResult.success },
		{
			"invite created": (r: ResponseStatus) => r.success,
		},
	);

	await redisClient.sadd(`invite_codes`, inviteResult.inviteCode);

	const invitesRaw = await redisClient.srandmember("invite_codes", 3);
	const invites = Array.isArray(invitesRaw)
		? invitesRaw
		: invitesRaw
			? [invitesRaw]
			: [];
	const joinedGuildIds: string[] = [];
	if (invites) {
		for (let i = 0; i < invites.length; i++) {
			const code = invites[i];
			const inviteDetail = client.getInvite(code);
			check(
				{ success: inviteDetail.success },
				{
					"get invite detail": (r: ResponseStatus) => r.success,
				},
			);

			if (code !== inviteResult.inviteCode) {
				const joinResult = client.joinGuild(code);
				check(
					{ success: joinResult.success },
					{
						"joined guild via invite": (r: ResponseStatus) => r.success,
					},
				);
				if (joinResult.guildId) {
					joinedGuildIds.push(joinResult.guildId);
				}
			}
		}
	}

	const messagesResult = client.getMessages(overviewResult.defaultChannelId);
	check(
		{ success: messagesResult.success },
		{
			"get messages": (r: ResponseStatus) => r.success,
		},
	);

	wsConnect(WS_BASE_URL, loginResult.token, {
		onAuth: (socket, userId) => {
			socket.send({
				type: WebSocketEvent.SubscribeChannels,
				data: { user_id: userId, channel_ids: [client.getCurrentChannelId()] },
			});

			joinedGuildIds.forEach((guildId) => {
				client.getGuildOverview(guildId);
				socket.send({
					type: WebSocketEvent.SubscribeChannels,
					data: {
						user_id: userId,
						channel_ids: [client.getCurrentChannelId()],
					},
				});
			});

			sleep(2);
			for (let i = 0; i < 10; i++) {
				const channelId = client.getCurrentChannelId();
				if (!channelId) {
					console.error("No current channel ID");
					continue;
				}
				const msgResult = client.sendMessage(
					channelId,
					`Active user message ${i + 1} from ${registerResult.userId}`,
				);
				check(
					{ success: msgResult },
					{
						"message sent": (r: ResponseStatus) => r.success,
					},
				);
				if (!msgResult) {
					console.error(`Message ${i + 1} failed`);
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
