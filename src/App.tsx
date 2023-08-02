import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { createRoom, joinRoom } from "./WebRtc/RtcActions";
import {
  Tag,
  Box,
  Button,
  Text,
  ChakraProvider,
  Input,
  Stack,
  List,
  ListItem,
  Heading,
  FormControl,
  FormHelperText,
  FormLabel,
  ButtonGroup,
  Highlight,
} from "@chakra-ui/react";

const baseAddress = "https://monkfish-app-lzibp.ondigitalocean.app";

export const App = () => {
  const signalrConnectionRef = useRef<HubConnection>();

  const isMediaOpenRef = useRef(false);
  const localStreamRef = useRef<MediaStream>();
  const remoteStreamRef = useRef<MediaStream>();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const openMedia = async () => {
    if (isMediaOpenRef.current) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    if (localAudioRef.current === null || remoteAudioRef.current === null) {
      return;
    }
    localStreamRef.current = stream;
    remoteStreamRef.current = new MediaStream();
    localAudioRef.current!.srcObject = localStreamRef.current;
    remoteAudioRef.current!.srcObject = remoteStreamRef.current;
    isMediaOpenRef.current = true;
  };

  const connectToSignalR = async () => {
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

  useEffect(() => {}, []);

  const handleCreateRoom = async () => {
    if (baseAddress === undefined) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await createRoom(
      baseAddress,
      signalrConnectionRef,
      localStreamRef,
      remoteStreamRef,
      setIceGatheringState,
      setConnectionState,
      setSignalingState,
      setIceConnection,
      setRoomId
    );
    setJoined(true);
  };

  const handleJoinRoom = async () => {
    if (baseAddress === undefined || roomId === undefined || roomId.length < 5) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await joinRoom(
      roomId,
      baseAddress,
      signalrConnectionRef,
      localStreamRef,
      remoteStreamRef,
      setIceGatheringState,
      setConnectionState,
      setSignalingState,
      setIceConnection
    );
    setJoined(true);
  };

  const [iceGatheringState, setIceGatheringState] = useState<string>();
  const [connectionState, setConnectionState] = useState<string>();
  const [signalingState, setSignalingState] = useState<string>();
  const [iceConnection, setIceConnection] = useState<string>();
  const [roomId, setRoomId] = useState<string>();
  const [joined, setJoined] = useState(false);

  return (
    <ChakraProvider>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <Box width="800px" p={10}>
        <Text>Base address: {baseAddress}</Text>
        {!joined && (
          <Box marginTop={5}>
            <ButtonGroup variant="solid" spacing="6">
              <Button width="200px" onClick={handleCreateRoom} colorScheme="green">
                Create room
              </Button>
              <Button width="200px" onClick={handleJoinRoom} colorScheme="blue">
                Join room
              </Button>
            </ButtonGroup>
          </Box>
        )}

        <Box marginTop={5}>
          {!joined && (
            <FormControl>
              <FormLabel>Set room ID</FormLabel>
              <Input type="text" placeholder="Room ID" onChange={(x) => setRoomId(x.target.value)} />
            </FormControl>
          )}
          {roomId && joined && (
            <Stack spacing={2}>
              <Heading as="h4" size="md">
                Room id
              </Heading>
              <Highlight query={roomId ?? ""} styles={{ px: "2", py: "1", rounded: "full", bg: "red.100" }}>
                {roomId ?? ""}
              </Highlight>
            </Stack>
          )}
        </Box>
        {joined && (
          <Box marginTop={5}>
            <Heading marginTop={2} marginBottom={2}>
              States
            </Heading>
            <List spacing={3}>
              <ListItem>
                <Text>
                  iceGatheringState: <Tag p={1}>{iceGatheringState}</Tag>
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  connectionState: <Tag p={1}>{connectionState}</Tag>
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  signalingState: <Tag p={1}>{signalingState}</Tag>
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  iceConnection: <Tag p={1}>{iceConnection}</Tag>
                </Text>
              </ListItem>
            </List>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
};
