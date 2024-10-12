import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { createSocketCallback } from "./socket-callback";

let socket: Socket | null = null;
let isCallbacksSet = false;

// Create a custom event for socket connection status
const socketStatusEvent = new EventTarget();

export const connectSocket = () => {
  if (socket) {
    return;
  }

  console.log("Connecting socket");
  const socketUrl = "http://localhost:8080";

  socket = io(socketUrl, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    socketStatusEvent.dispatchEvent(
      new CustomEvent("socketStatus", { detail: true })
    );
  });

  socket.on("disconnect", () => {
    socketStatusEvent.dispatchEvent(
      new CustomEvent("socketStatus", { detail: false })
    );
  });

  return socket;
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const handleSocketStatus = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsConnected(customEvent.detail);
    };

    socketStatusEvent.addEventListener("socketStatus", handleSocketStatus);

    if (socket) {
      setupSocketCallbacks(toast);
    }

    return () => {
      socketStatusEvent.removeEventListener("socketStatus", handleSocketStatus);
    };
  }, []);

  const emit = (eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, data);
    }
  };

  return { isConnected, emit };
};

// Add any react callbacks to socket
export const setupSocketCallbacks = (toast: Function) => {
  if (isCallbacksSet || !socket) {
    return;
  }

  const socketCallback = createSocketCallback(toast);

  socket.onAny((eventName, ...args) => {
    if (socket) {
      socketCallback(socket, { type: eventName, ...args[0] });
    }
  });

  isCallbacksSet = true;
};
