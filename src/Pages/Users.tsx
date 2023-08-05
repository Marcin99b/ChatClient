import { Button, ButtonGroup, Card, CardBody, CardFooter, Divider, Heading, Stack, Text } from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import { useUsersApi } from "../Hooks/useApi";
import { User } from "../Models/ApiModels";

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>();
  const { getUsersList } = useUsersApi();
  const isMount = useRef(false);

  useEffect(() => {
    if (isMount.current) {
      return;
    }
    isMount.current = true;
    getUsersList({}).then((x) => setUsers(x.users!));
  }, [getUsersList]);

  return (
    <Stack direction="row" flexWrap="wrap" spacing={10}>
      {users !== undefined &&
        users.map((x) => (
          <Card width="md">
            <CardBody>
              <Stack mt="6" spacing="3">
                <Heading size="md">{x.username}</Heading>
                <Text>Testowy opis</Text>
                <Text color="blue.600" fontSize="2xl">
                  3zł/min
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing="2">
                <Button variant="solid" colorScheme="blue">
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
