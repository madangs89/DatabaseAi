import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Could not connect to Redis", err);
  });

export default client;
