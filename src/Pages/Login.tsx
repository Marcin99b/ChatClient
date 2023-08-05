import { Box, Button, Input } from "@chakra-ui/react";
import { FC, useState } from "react";
import { useUsersApi } from "../Hooks/useApi";
import { useAuth } from "../Auth/AuthContext";

const Login: FC = () => {
  const [username, setUsername] = useState("");
  const api = useUsersApi();
  const auth = useAuth();
  return (
    <Box>
      Username
      <Input placeholder="Username" onChange={(x) => setUsername(x.target.value)} />
      <Button colorScheme="teal" marginTop={5} width="100%" isDisabled={username.length <= 3} onClick={() => {}}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
