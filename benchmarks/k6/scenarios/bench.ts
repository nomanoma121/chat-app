// @ts-expect-error
import { check, sleep } from "k6";
import { Client, type ResponseStatus } from "../helpers/client.ts";
import { generateBenchOptions } from "../helpers/options.ts";
import { getRedisClient } from "../helpers/redis.ts";
import { generateNewGuild, generateNewUser } from "../helpers/utils.ts";
import {
	WebSocketEvent,
	type WebSocketMessage,
	connect as wsConnect,
} from "../helpers/websocket.ts";

const API_BASE_URL = "http://localhost:8000";
const WS_BASE_URL = "ws://localhost:50054/ws";

const VUS = 5000;
const DURATION_MINUTES = 15;

export const options = generateBenchOptions({
	vus: VUS,
	durationMinutes: DURATION_MINUTES,
});

export function setup() {
	const redisClient = getRedisClient();
	redisClient.del("invite_codes");

	console.log("Starting warmup... Wait for 50 seconds.");
	const warmupStart = Date.now();
	const warmupDuration = 50 * 1000;

	while (Date.now() - warmupStart < warmupDuration) {
		const client = new Client(API_BASE_URL);
		const user = generateNewUser();

		client.register(user);
		client.login(user.email, user.password);

		const guild = generateNewGuild();
		const guildResult = client.createGuild(guild);

		const { defaultChannelId } = client.getGuildOverview(guildResult.guildId);
		client.sendMessage(defaultChannelId, "Warmup message");

		if (guildResult.guildId) {
			const categoryResult = client.createCategory(
				guildResult.guildId,
				"Warmup Category",
			);
			if (categoryResult.categoryId) {
				client.createChannel(categoryResult.categoryId, "warmup-channel");
			}

			const inviteResult = client.createInvite(
				guildResult.guildId,
				new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
			);
			if (inviteResult.inviteCode) {
				redisClient.sadd("invite_codes", inviteResult.inviteCode);
			}
		}

		if (Date.now() - warmupStart >= warmupDuration / 2) {
			console.log("Warmup is halfway done...");
		}

		sleep(0.1);
	}

	console.log("Warmup completed!");
}

export const activeUser = async () => {
	const redisClient = getRedisClient();
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

// ============================================
// New User: 新規ユーザーが初めてアプリを使う
// ============================================
export const newUser = async () => {
	const redisClient = getRedisClient();
	const client = new Client(API_BASE_URL);

	const newUser = generateNewUser();
	const registerResult = client.register(newUser);
	check(
		{ success: registerResult.success },
		{
			"new user register": (r: ResponseStatus) => r.success,
		},
	);

	const loginResult = client.login(newUser.email, newUser.password);
	check(
		{ success: loginResult.success },
		{
			"new user login": (r: ResponseStatus) => r.success,
		},
	);

	const myGuildsResult = client.getMyGuilds();
	check(
		{ success: myGuildsResult.success },
		{
			"new user get guilds": (r: ResponseStatus) => r.success,
		},
	);

	// Redisから招待コードを取得してギルドに参加
	const invitesRaw = await redisClient.srandmember("invite_codes", 1);
	const inviteCode = Array.isArray(invitesRaw) ? invitesRaw[0] : invitesRaw;

	if (inviteCode) {
		const inviteDetail = client.getInvite(inviteCode);
		check(
			{ success: inviteDetail.success },
			{
				"new user get invite": (r: ResponseStatus) => r.success,
			},
		);

		const joinResult = client.joinGuild(inviteCode);
		check(
			{ success: joinResult.success },
			{
				"new user join guild": (r: ResponseStatus) => r.success,
			},
		);

		if (joinResult.guildId) {
			const overviewResult = client.getGuildOverview(joinResult.guildId);
			check(
				{ success: overviewResult.success },
				{
					"new user get overview": (r: ResponseStatus) => r.success,
				},
			);

			// 数件メッセージを送信
			for (let i = 0; i < 3; i++) {
				const msgResult = client.sendMessage(
					overviewResult.defaultChannelId,
					`New user message ${i + 1}`,
				);
				check(
					{ success: msgResult },
					{
						"new user send message": (r: ResponseStatus) => r.success,
					},
				);
				sleep(2);
			}
		}
	}
};

// ============================================
// Spike Load: 短時間で大量のリクエスト
// ============================================
export const spikeLoad = async () => {
	const redisClient = getRedisClient();
	const client = new Client(API_BASE_URL);

	const newUser = generateNewUser();
	client.register(newUser);
	client.login(newUser.email, newUser.password);

	// Redisから招待コード取得
	const invitesRaw = await redisClient.srandmember("invite_codes", 1);
	const inviteCode = Array.isArray(invitesRaw) ? invitesRaw[0] : invitesRaw;

	if (inviteCode) {
		const joinResult = client.joinGuild(inviteCode);
		if (joinResult.guildId) {
			const overviewResult = client.getGuildOverview(joinResult.guildId);

			// 短時間に集中してメッセージ送信
			for (let i = 0; i < 5; i++) {
				client.sendMessage(
					overviewResult.defaultChannelId,
					`Spike load message ${i + 1}`,
				);
				sleep(0.1); // 短い間隔
			}
		}
	}
};

// ============================================
// Lurkers: 読み取り専用ユーザー
// ============================================
export const luckers = async () => {
	const redisClient = getRedisClient();
	const client = new Client(API_BASE_URL);

	const newUser = generateNewUser();
	const registerResult = client.register(newUser);
	check(
		{ success: registerResult.success },
		{
			"lurker register": (r: ResponseStatus) => r.success,
		},
	);

	const loginResult = client.login(newUser.email, newUser.password);
	check(
		{ success: loginResult.success },
		{
			"lurker login": (r: ResponseStatus) => r.success,
		},
	);

	// Redisから招待コード取得
	const invitesRaw = await redisClient.srandmember("invite_codes", 1);
	const inviteCode = Array.isArray(invitesRaw) ? invitesRaw[0] : invitesRaw;

	if (inviteCode) {
		const joinResult = client.joinGuild(inviteCode);
		if (joinResult.guildId) {
			const overviewResult = client.getGuildOverview(joinResult.guildId);

			// WebSocket接続してメッセージを受信するだけ
			wsConnect(WS_BASE_URL, loginResult.token, {
				onAuth: (socket, userId) => {
					socket.send({
						type: WebSocketEvent.SubscribeChannels,
						data: {
							user_id: userId,
							channel_ids: [overviewResult.defaultChannelId],
						},
					});

					// 定期的にメッセージ履歴を取得（読むだけ）
					for (let i = 0; i < 10; i++) {
						client.getMessages(overviewResult.defaultChannelId);
						sleep(5);
					}
				},
				onMessage: (_socket, data) => {
					check(data, {
						"lurker received message": (d: WebSocketMessage) =>
							d !== undefined,
					});
				},
				timeout: 60000,
			});
		}
	}
};
