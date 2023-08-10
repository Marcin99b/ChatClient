import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useSignalR } from "../../SignalR/SignalRContext";
import { useState, useEffect } from "react";
import { User } from "../../Models/ApiModels";
import { useRoomsApi, useUsersApi } from "../../Hooks/useApi";
import { useNavigate } from "react-router-dom";

export const ReceivingCalls = () => {
  const signalR = useSignalR();
  const { getUser } = useUsersApi();
  const { acceptCall } = useRoomsApi();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [callingUser, setCallingUser] = useState<User>();
  const navigate = useNavigate();

  useEffect(() => {
    if (signalR.waitingForCallAccept === undefined) {
      setCallingUser(undefined);
      return;
    }
    if (callingUser !== undefined) {
      return;
    }
    getUser({ userId: signalR.waitingForCallAccept.callingUser }).then((x) => setCallingUser(x.user!));
  }, [callingUser, getUser, signalR.waitingForCallAccept]);

  useEffect(() => {
    if (callingUser === undefined) {
      onClose();
    } else {
      onOpen();
    }
  }, [callingUser, onClose, onOpen]);

  const handleButton = async () => {
    if (callingUser === undefined) {
      return;
    }
    const response = await acceptCall({ callingUserId: callingUser.id });
    signalR.clearWaitingForCallAccept();
    onClose();
    navigate(`/room/${response.createdRoomId}`);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => {}}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalOverlay />
        <ModalContent color="black">
          <ModalHeader>Użytkownik {callingUser?.username} dzwoni</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Naciśnij przycisk aby odebrać</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleButton}>
              Odbierz
            </Button>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Nie odbieraj
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
