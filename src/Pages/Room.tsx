import { useEffect, useRef, useState } from "react";
import { Tag, Box, Button, Text, Heading } from "@chakra-ui/react";
import { RoomsList } from "../Components/RoomsList/RoomsList";
import { createRoom, joinRoom } from "../WebRtc/RtcActions";
import { useMedia } from "../Hooks/useMedia";
import { useSignalR } from "../Hooks/useSignalR";
import { useWebRtcConfiguration } from "../Hooks/useWebRtcConfiguration";

const Room = () => {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>();

  const mountRef = useRef(false);
  const [roomIds, setRoomIds] = useState<string[]>();
  //const { getRooms } = useApi();
  useEffect(() => {
    if (mountRef.current === true) {
      return;
    }
    mountRef.current = true;
    //getRooms().then((x) => setRoomIds(x.ids ?? []));
  }, []);

  const refreshRooms = async () => {
    //const ids = await getRoomIds(baseAddress);
    //setRoomIds(ids);
  };

  const { openMedia, localStreamRef, remoteStreamRef, localAudioRef, remoteAudioRef } = useMedia();
  const { connectSignalR, signalrConnectionRef } = useSignalR();
  const { setupConfiguration, configurationRef } = useWebRtcConfiguration();

  const prepareDependencies = async () => {
    await openMedia();
    await setupConfiguration();
    await connectSignalR();
  };

  const handleCreateRoom = async () => {
    await prepareDependencies();
    await createRoom(
      configurationRef.current!,
      "",
      signalrConnectionRef.current!,
      localStreamRef,
      remoteStreamRef,
      setConnectionState
    );
    await refreshRooms();
  };

  const handleJoinRoom = async (tempRoomId: string) => {
    await prepareDependencies();
    await joinRoom(
      configurationRef.current!,
      tempRoomId,
      "",
      signalrConnectionRef.current!,
      localStreamRef,
      remoteStreamRef,
      setConnectionState
    );
    await refreshRooms();
  };

  return (
    <>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <Box display="flex" justifyContent="center">
        <Box display="inline-block" p={10}>
          <Box marginTop={5}>
            <Button colorScheme="blue" onClick={handleCreateRoom}>
              Create
            </Button>
            <Button colorScheme="red" onClick={() => window.location.reload()}>
              Leave
            </Button>
          </Box>

          <Box marginTop={5}>
            <Heading as="h4" size="md" marginTop={2} marginBottom={2}>
              States
            </Heading>
            <Text>
              connectionState:{" "}
              {connectionState && (
                <Tag
                  p={1}
                  colorScheme={
                    connectionState === "connected"
                      ? "green"
                      : connectionState === "connecting"
                      ? "yellow"
                      : connectionState === "new"
                      ? undefined
                      : "red"
                  }
                >
                  {connectionState}
                </Tag>
              )}
            </Text>
          </Box>

          {roomIds !== undefined && (
            <RoomsList baseAddress={""} ids={roomIds} refreshRooms={refreshRooms} joinRoom={handleJoinRoom} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default Room;
