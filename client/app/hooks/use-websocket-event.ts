import { useOutletContext } from "react-router";
import { WebSocketClient } from "~/api/websocket";
import { useEffect } from "react";

export const useWebSocketEvent = <T = any>(
  type: string,
  callback: (data: T) => void
) => {
  const { WSClient } = useOutletContext<{ WSClient: WebSocketClient }>();

  useEffect(() => {
    WSClient.SetListener(type, callback);
    return () => {
      WSClient.RemoveListener(type);
    };
  }, [WSClient, type, callback]);
};
  