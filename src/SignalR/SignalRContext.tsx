import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { baseAddress } from "../Hooks/useApi";
import { WebRtcRoom } from "../Models/ApiModels";

export interface SignalRContextType {
  hub: HubConnection | undefined;
  waitingForCallAccept: { callingUser: string } | undefined;
  callPropositionAccepted: { createdRoomId: string } | undefined;
  roomConfiguredByReceiver: { rtcRoom: WebRtcRoom } | undefined;
  roomConfiguredByCaller: { rtcRoom: WebRtcRoom } | undefined;
  clearWaitingForCallAccept: () => void;
  clearCallPropositionAccepted: () => void;
  clearRoomConfiguredByReceiver: () => void;
  clearRoomConfiguredByCaller: () => void;
}
export const SignalRContext = createContext<SignalRContextType>(null!);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const isMount = useRef(false);
  const hub = useRef<HubConnection>();

  const [waitingForCallAccept, setWaitingForCallAccept] = useState<{ callingUser: string }>();
  const [callPropositionAccepted, setCallPropositionAccepted] = useState<{ createdRoomId: string }>();
  const [roomConfiguredByReceiver, setRoomConfiguredByReceiver] = useState<{ rtcRoom: WebRtcRoom }>();
  const [roomConfiguredByCaller, setRoomConfiguredByCaller] = useState<{ rtcRoom: WebRtcRoom }>();

  const clearWaitingForCallAccept = () => {
    setWaitingForCallAccept(undefined);
  };
  const clearCallPropositionAccepted = () => {
    setCallPropositionAccepted(undefined);
  };
  const clearRoomConfiguredByReceiver = () => {
    setRoomConfiguredByReceiver(undefined);
  };
  const clearRoomConfiguredByCaller = () => {
    setRoomConfiguredByCaller(undefined);
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
      hub.current.on("RoomConfiguredByReceiver", (rtcRoom: WebRtcRoom) => {
        console.log("RoomConfiguredByReceiver");
        setRoomConfiguredByReceiver({ rtcRoom });
      });
      hub.current.on("RoomConfiguredByCaller", (rtcRoom: WebRtcRoom) => {
        console.log("RoomConfiguredByCaller");
        setRoomConfiguredByCaller({ rtcRoom });
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
    roomConfiguredByReceiver,
    roomConfiguredByCaller,

    clearWaitingForCallAccept,
    clearCallPropositionAccepted,
    clearRoomConfiguredByReceiver,
    clearRoomConfiguredByCaller,
  };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
}

export function useSignalR() {
  return useContext(SignalRContext);
}
