import { useRef } from "react";

export const useMedia = () => {
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
    if (stream === null) {
      return;
    }
    if (localAudioRef.current === null || remoteAudioRef.current === null) {
      return;
    }
    localStreamRef.current = stream;
    remoteStreamRef.current = new MediaStream();
    localAudioRef.current!.srcObject = localStreamRef.current;
    remoteAudioRef.current!.srcObject = remoteStreamRef.current;
    isMediaOpenRef.current = true;
  };

  return { openMedia, localStreamRef, remoteStreamRef, localAudioRef, remoteAudioRef };
};
