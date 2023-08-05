import { Button, ButtonGroup, Card, CardBody, CardFooter, Divider, Heading, Stack, Text } from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import { useRoomsApi, useUsersApi } from "../Hooks/useApi";
import { UserRoomDetails } from "../Models/ApiModels";

const Users: FC = () => {
  const [users, setUsers] = useState<UserRoomDetails[]>();
  const { getUsersList } = useUsersApi();
  const isMount = useRef(false);

  useEffect(() => {
    if (isMount.current) {
      return;
    }
    isMount.current = true;
    getUsersList({}).then((x) => setUsers(x.users!));
  }, [getUsersList]);

  const { proposeCall } = useRoomsApi();

  const call = async (userId: string) => {
    await proposeCall({ receivingUserId: userId });
  };

  return (
    <Stack direction="row" flexWrap="wrap" spacing={10}>
      {users !== undefined &&
        users.map((x) => (
          <Card width="md" key={x.user!.id}>
            <CardBody>
              <Stack mt="6" spacing="3">
                <Heading size="md">{x.user!.username}</Heading>
                <Text>Testowy opis</Text>
                <Text color="blue.600" fontSize="2xl">
                  3zł/min
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing="2">
                <Button variant="solid" colorScheme="blue" isDisabled={!x.isActive} onClick={() => call(x.user!.id!)}>
                  Zadzwoń
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>
        ))}
    </Stack>
  );
};

export default Users;
