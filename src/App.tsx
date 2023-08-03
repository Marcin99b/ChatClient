import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { createRoom, joinRoom } from "./WebRtc/RtcActions";
import {
  Tag,
  Box,
  Button,
  Text,
  ChakraProvider,
  Stack,
  List,
  ListItem,
  Heading,
  ButtonGroup,
  Highlight,
  extendTheme,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import { RoomsList } from "./Components/RoomsList/RoomsList";
import { getIceServers, getRoomIds } from "./Requests";

export const baseAddress = "https://monkfish-app-lzibp.ondigitalocean.app";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        bg: "gray.50",
      },
    },
  },
});

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

  const handleCreateRoom = async () => {
    if (baseAddress === undefined || configuration === undefined) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await createRoom(
      configuration,
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
    await refreshRooms();
    setJoined(true);
  };

  const handleJoinRoom = async (tempRoomId: string) => {
    if (baseAddress === undefined || configuration === undefined) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await joinRoom(
      configuration,
      tempRoomId,
      baseAddress,
      signalrConnectionRef,
      localStreamRef,
      remoteStreamRef,
      setIceGatheringState,
      setConnectionState,
      setSignalingState,
      setIceConnection
    );
    await refreshRooms();
    setRoomId(tempRoomId);
    setJoined(true);
  };

  const [iceGatheringState, setIceGatheringState] = useState<string>();
  const [connectionState, setConnectionState] = useState<string>();
  const [signalingState, setSignalingState] = useState<string>();
  const [iceConnection, setIceConnection] = useState<string>();
  const [roomId, setRoomId] = useState<string>();
  const [joined, setJoined] = useState(false);

  const mountRef = useRef(false);
  const [configuration, setConfiguration] = useState<RTCConfiguration>();
  useEffect(() => {
    if (mountRef.current === true) {
      return;
    }
    mountRef.current = true;
    if (configuration !== undefined) {
      return;
    }

    getIceServers(baseAddress).then((config) => {
      const configuration: RTCConfiguration = {
        iceServers: config,
      };

      setConfigurationString(JSON.stringify(configuration, null, 3));
      setConfiguration(configuration);
    });

    getRoomIds(baseAddress).then((ids) => setRoomIds(ids));
  }, [configuration]);

  const [configurationString, setConfigurationString] = useState("");
  const [isConfigurationValid, setIsConfigurationValid] = useState(true);

  useEffect(() => {
    if (configuration === undefined) {
      return;
    }
    try {
      setConfiguration(JSON.parse(configurationString));
      setIsConfigurationValid(true);
    } catch {
      setIsConfigurationValid(false);
    }
  }, [configurationString, configuration]);

  const [roomIds, setRoomIds] = useState<string[]>();

  const refreshRooms = async () => {
    const ids = await getRoomIds(baseAddress);
    setRoomIds(ids);
  };

  return (
    <ChakraProvider theme={theme}>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <Box display="flex" justifyContent="center">
        <Box display="inline-block" p={10}>
          <Heading marginBottom={2} as="h5" size="sm">
            Configuration
          </Heading>
          <Textarea
            isInvalid={!isConfigurationValid}
            onChange={(x) => setConfigurationString(x.target.value)}
            height="300px"
            resize="vertical"
            value={configurationString}
          />
          <Badge colorScheme={isConfigurationValid ? "green" : "red"}>
            Configuration is {isConfigurationValid ? "valid" : "invalid"}
          </Badge>
          <Heading marginTop={2} marginBottom={2} as="h5" size="sm">
            Base address:
          </Heading>
          <Tag>{baseAddress}</Tag>

          <Box marginTop={5}>
            {!joined ? (
              <ButtonGroup variant="solid" spacing="6">
                <Button
                  width="200px"
                  onClick={handleCreateRoom}
                  colorScheme="green"
                  isDisabled={isConfigurationValid === false}
                >
                  Create room
                </Button>
              </ButtonGroup>
            ) : (
              <Button colorScheme="red" onClick={() => window.location.reload()}>
                Leave
              </Button>
            )}
          </Box>

          <Box marginTop={5}>
            {roomId && joined && (
              <Stack spacing={2}>
                <Heading as="h4" size="md">
                  Room id
                </Heading>
                <Box>
                  <Highlight query={roomId ?? ""} styles={{ px: "2", py: "1", rounded: "full", bg: "red.100" }}>
                    {roomId ?? ""}
                  </Highlight>
                </Box>
              </Stack>
            )}
          </Box>
          {joined && (
            <Box marginTop={5}>
              <Heading as="h4" size="md" marginTop={2} marginBottom={2}>
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
          {roomIds !== undefined && (
            <RoomsList baseAddress={baseAddress} ids={roomIds} refreshRooms={refreshRooms} joinRoom={handleJoinRoom} />
          )}
        </Box>
      </Box>
    </ChakraProvider>
  );
};
