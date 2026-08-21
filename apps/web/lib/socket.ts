import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function getSocketClient(): Socket {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;

  return io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
}
