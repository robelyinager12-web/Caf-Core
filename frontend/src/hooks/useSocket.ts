import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from '../config/serviceUrls';
import { useAuthStore } from '../store/authStore';

export function useSocket(events: Record<string, (payload: any) => void>) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(API_ORIGIN, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return socketRef;
}