import { Socket } from "socket.io-client";

export const createSocketCallback = (toast: Function) => {
  return async (
    socket: Socket,
    requestData: { message_type: string; data: any; repo_path: string }
  ) => {
    const { message_type: messageType, data } = requestData;
    console.log(messageType, data);
  };
};
