import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useSocketEvents(events: { [event: string]: () => void }) {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    // Connect to the NestJS Gateway
    socketRef.current = io(API_URL);

    // Register event listeners dynamically reading from ref
    const eventNames = Object.keys(eventsRef.current);
    
    eventNames.forEach((event) => {
      socketRef.current?.on(event, () => {
        if (eventsRef.current[event]) {
          eventsRef.current[event]();
        }
      });
    });

    return () => {
      if (socketRef.current) {
        eventNames.forEach((event) => {
          socketRef.current?.off(event);
        });
        socketRef.current.disconnect();
      }
    };
  }, []);
}
