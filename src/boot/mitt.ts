import mitt from 'mitt';
import type { WebsocketMessage } from 'src/api/websocket';

type Events = {
  'ws:open': void;
  'ws:close': void;
  'ws:error': Error;
  'ws:message': WebsocketMessage;
};

export const emitter = mitt<Events>();
