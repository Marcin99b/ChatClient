import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { baseAddress } from "../Requests";
import { useRef } from "react";

export const useSignalR = () => {
  const signalrConnectionRef = useRef<HubConnection>();

  const connectSignalR = async () => {
    if (signalrConnectionRef.current !== undefined) {
      return;
    }
    const conn = new HubConnectionBuilder()
      .withUrl(baseAddress! + "/chatHub")
      .withAutomaticReconnect()
      .build();

    await conn.start();

    signalrConnectionRef.current = conn;
  };

  return { connectSignalR, signalrConnectionRef };
};
