import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "../Auth/AuthContext";
import { baseAddress } from "../Hooks/useApi";
import { Candidate, SdpData } from "../Models/ApiModels";

export interface SignalRContextType {
  hub: HubConnection | undefined;
}
export const SignalRContext = createContext<SignalRContextType>(null!);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const isMount = useRef(false);
  const hub = useRef<HubConnection>();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      return;
    }
    if (isMount.current) {
      return;
    }
    isMount.current = true;

    const conn = new HubConnectionBuilder()
      .withUrl(baseAddress + "/roomsHub")
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => {
      hub.current = conn;
      console.log(hub.current.connectionId);
      hub.current.on("WaitingForCallAccept", (callingUser: string) => {
        console.log("WaitingForCallAccept");
      });
      hub.current.on("CallPropositionAccepted", (createdRoomId: string) => {
        console.log("CallPropositionAccepted");
      });
      hub.current.on("AnswerCandidateAddedToRoom", (candidate: Candidate) => {
        console.log("AnswerCandidateAddedToRoom");
      });
      hub.current.on("AnswerAddedToRoom", (answer: SdpData) => {
        console.log("AnswerAddedToRoom");
      });
    });
  }, [auth.isLoggedIn]);

  useEffect(() => {
    if (auth.isLoggedIn && auth.isChecked) {
      return;
    }
    if (hub.current === undefined) {
      return;
    }
    hub.current.stop();
    console.log("Stopped connection");
  }, [auth.isChecked, auth.isLoggedIn]);

  const value = { hub: hub.current };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
}

export function useSignalR() {
  return useContext(SignalRContext);
}
