// @ts-expect-error
import redis from "k6/experimental/redis";

const REDIS_ADDR = "redis://127.0.0.1:6379";

export const getRedisClient = () => new redis.Client(REDIS_ADDR);
