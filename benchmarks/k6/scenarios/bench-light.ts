// @ts-expect-error
import redis from "k6/experimental/redis";
import { generateBenchOptions } from "../helpers/options.ts";
import { activeUser, luckers, newUser, spikeLoad } from "./bench.ts";

const REDIS_ADDR = "redis://127.0.0.1:6379";

const VUS = 100;
const DURATION_MINUTES = 5;

// vus間でデータを共有するためのRedisクライアント
const redisClient = new redis.Client(REDIS_ADDR);

// テスト開始前にRedisをクリア
export function setup() {
	redisClient.del("invite_codes");
}

export const options = generateBenchOptions({
	vus: VUS,
	durationMinutes: DURATION_MINUTES,
});

export { activeUser, luckers, newUser, spikeLoad };
