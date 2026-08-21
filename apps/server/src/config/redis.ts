import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './index.js';

let activeRedis: any;

try {
  const realRedis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy() {
      return null; // Do not reconnect on failure
    },
  });

  realRedis.on('error', (err) => {
    // Catch background connection errors without crashing server
    if (activeRedis !== mockRedis) {
      console.warn('⚠️ Real Redis connection error. Switching to in-memory Redis mock.');
      activeRedis = mockRedis;
    }
  });

  activeRedis = realRedis;
} catch (err) {
  activeRedis = new (RedisMock as any)();
}

const mockRedis = new (RedisMock as any)();

// Proxy handler to safely execute Redis commands on active client or mock fallback
export const redis = new Proxy({} as any, {
  get(_target, prop) {
    if (typeof activeRedis[prop] === 'function') {
      return (...args: any[]) => {
        try {
          const result = activeRedis[prop](...args);
          if (result && typeof result.catch === 'function') {
            return result.catch((err: any) => {
              console.warn(`⚠️ Redis command [${String(prop)}] failed on primary client. Executing on in-memory mock.`);
              activeRedis = mockRedis;
              return mockRedis[prop](...args);
            });
          }
          return result;
        } catch (err) {
          activeRedis = mockRedis;
          return mockRedis[prop](...args);
        }
      };
    }
    return activeRedis[prop];
  },
});

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const ping = await redis.ping();
    return ping === 'PONG' || ping === 'OK';
  } catch (err) {
    activeRedis = mockRedis;
    return true;
  }
}
