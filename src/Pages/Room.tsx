const Room = () => {
  /*
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>();

  const mountRef = useRef(false);
  //const [roomIds, setRoomIds] = useState<string[]>();
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
*/
  return (
    <>
      {/* <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio> */}
    </>
  );
};

export default Room;
