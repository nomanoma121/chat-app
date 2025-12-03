// @ts-expect-error
import { sleep } from "k6";
import { Client } from "../helpers/client.ts";
import { generateBenchOptions } from "../helpers/options.ts";
import { getRedisClient } from "../helpers/redis.ts";
import { generateNewGuild, generateNewUser } from "../helpers/utils.ts";
import { activeUser, luckers, newUser, spikeLoad } from "./bench.ts";

const API_BASE_URL = "http://localhost:8000";

const VUS = 300;
const DURATION_MINUTES = 3;

export const options = generateBenchOptions({
	vus: VUS,
	durationMinutes: DURATION_MINUTES,
});

export function setup() {
	const redisClient = getRedisClient();
	redisClient.del("invite_codes");

	console.log("Starting warmup...");
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

		sleep(0.1);
	}

	console.log("Warmup completed!");
}

export { activeUser, luckers, newUser, spikeLoad };
