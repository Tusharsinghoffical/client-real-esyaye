import { EventEmitter } from 'events';

declare global {
  var __realtimeEmitter: EventEmitter | undefined;
}

export function getRealtimeEmitter(): EventEmitter {
  if (!global.__realtimeEmitter) {
    global.__realtimeEmitter = new EventEmitter();
    global.__realtimeEmitter.setMaxListeners(200);
  }
  return global.__realtimeEmitter;
}

export const realtime = getRealtimeEmitter();
