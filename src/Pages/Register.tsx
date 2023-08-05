import { Input, Button, Box } from "@chakra-ui/react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersApi } from "../Hooks/useApi";

const Register: FC = () => {
  const [username, setUsername] = useState("");
  const { register } = useUsersApi();
  const navigate = useNavigate();

  const handleButton = async () => {
    if (username.length <= 3) {
      return;
    }
    await register({ username: username });
    navigate("/login");
  };
  return (
    <Box>
      Username
      <Input placeholder="Username" onChange={(x) => setUsername(x.target.value)} />
      <Button colorScheme="teal" marginTop={5} width="100%" isDisabled={username.length <= 3} onClick={handleButton}>
        Register
      </Button>
    </Box>
  );
};

export default Register;
