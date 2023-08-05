import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useRef } from "react";

export const useSignalR = () => {
  const signalrConnectionRef = useRef<HubConnection>();

  const connectSignalR = async () => {
    if (signalrConnectionRef.current !== undefined) {
      return;
    }
    const conn = new HubConnectionBuilder()
      .withUrl(""! + "/chatHub")
      .withAutomaticReconnect()
      .build();

    await conn.start();

    signalrConnectionRef.current = conn;
  };

  return { connectSignalR, signalrConnectionRef };
};
