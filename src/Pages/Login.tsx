import { Box, Button, Input } from "@chakra-ui/react";
import { FC, useState } from "react";
import { useUsersApi } from "../Hooks/useApi";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
  const [username, setUsername] = useState("");
  const { login } = useUsersApi();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleButton = async () => {
    if (username.length <= 3) {
      return;
    }
    await login({ username: username });
    auth.refresh(() => navigate("/"));
  };
  return (
    <Box>
      Username
      <Input placeholder="Username" onChange={(x) => setUsername(x.target.value)} />
      <Button colorScheme="teal" marginTop={5} width="100%" isDisabled={username.length <= 3} onClick={handleButton}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
