import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { baseAddress } from "../Hooks/useApi";
import { Candidate, SdpData } from "../Models/ApiModels";

export interface SignalRContextType {
  hub: HubConnection | undefined;
  waitingForCallAccept: { callingUser: string } | undefined;
  callPropositionAccepted: { createdRoomId: string } | undefined;
  answerCandidateAddedToRoom: { candidate: Candidate } | undefined;
  answerAddedToRoom: { answer: SdpData } | undefined;
  clearWaitingForCallAccept: () => void;
  clearCallPropositionAccepted: () => void;
  clearAnswerCandidateAddedToRoom: () => void;
  clearAnswerAddedToRoom: () => void;
}
export const SignalRContext = createContext<SignalRContextType>(null!);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const isMount = useRef(false);
  const hub = useRef<HubConnection>();

  const [waitingForCallAccept, setWaitingForCallAccept] = useState<{ callingUser: string }>();
  const [callPropositionAccepted, setCallPropositionAccepted] = useState<{ createdRoomId: string }>();
  const [answerCandidateAddedToRoom, setAnswerCandidateAddedToRoom] = useState<{ candidate: Candidate }>();
  const [answerAddedToRoom, setAnswerAddedToRoom] = useState<{ answer: SdpData }>();

  const clearWaitingForCallAccept = () => {
    setWaitingForCallAccept(undefined);
  };
  const clearCallPropositionAccepted = () => {
    setCallPropositionAccepted(undefined);
  };
  const clearAnswerCandidateAddedToRoom = () => {
    setAnswerCandidateAddedToRoom(undefined);
  };
  const clearAnswerAddedToRoom = () => {
    setAnswerAddedToRoom(undefined);
  };

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
        setWaitingForCallAccept({ callingUser });
      });
      hub.current.on("CallPropositionAccepted", (createdRoomId: string) => {
        console.log("CallPropositionAccepted");
        setCallPropositionAccepted({ createdRoomId });
      });
      hub.current.on("AnswerCandidateAddedToRoom", (candidate: Candidate) => {
        console.log("AnswerCandidateAddedToRoom");
        setAnswerCandidateAddedToRoom({ candidate });
      });
      hub.current.on("AnswerAddedToRoom", (answer: SdpData) => {
        console.log("AnswerAddedToRoom");
        setAnswerAddedToRoom({ answer });
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

  const value = {
    hub: hub.current,

    waitingForCallAccept,
    callPropositionAccepted,
    answerCandidateAddedToRoom,
    answerAddedToRoom,

    clearWaitingForCallAccept,
    clearCallPropositionAccepted,
    clearAnswerCandidateAddedToRoom,
    clearAnswerAddedToRoom,
  };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
}

export function useSignalR() {
  return useContext(SignalRContext);
}
