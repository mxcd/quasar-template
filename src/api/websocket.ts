import { emitter } from 'src/boot/mitt';

export type WebsocketMessage = {
  object: string;
  action: string;
  data: any;
};

let websocket: WebSocket;

export function isConnected() {
  if (!websocket) {
    return false;
  }
  return websocket.readyState === WebSocket.OPEN;
}

const URL = process.env.DEV
  ? `ws://${window.location.hostname}:${window.location.port}/api/v1/ws`
  : `wss://${window.location.hostname}/api/v1/ws`;

export function connect() {
  websocket = new WebSocket(URL);

  websocket.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    emitter.emit('ws:message', {
      object: payload.object,
      action: payload.action,
      data: payload.data,
    });
  };

  websocket.onopen = () => {
    console.log('connected via websocket');
    emitter.emit('ws:open');
  };

  websocket.onerror = (error) => {
    console.log('websocket error: ', error);
    try {
      websocket.close();
    } catch (e) {
      console.log('error closing websocket: ', e);
    }
    setTimeout(connect, 1000);
  };

  websocket.onclose = () => {
    console.log('websocket got disconnected');
    emitter.emit('ws:close');
  };
}

export function disconnect() {
  websocket.close();
}

export default {
  isConnected,
  connect,
  disconnect,
};
