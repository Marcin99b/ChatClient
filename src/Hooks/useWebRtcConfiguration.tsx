import { useRef } from "react";
import { baseAddress, getIceServers } from "../Requests";

export const useWebRtcConfiguration = () => {
  const configurationRef = useRef<RTCConfiguration>();

  const setupConfiguration = async () => {
    if (configurationRef.current !== undefined) {
      return;
    }
    const iceServers = await getIceServers(baseAddress);
    const configuration: RTCConfiguration = {
      iceServers: iceServers,
    };
    configurationRef.current = configuration;
  };

  return { setupConfiguration, configurationRef };
};
