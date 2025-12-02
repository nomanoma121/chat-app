// @ts-expect-error
import redis from "k6/experimental/redis";

export const redisClient = new redis.Client("localhost:6379");
