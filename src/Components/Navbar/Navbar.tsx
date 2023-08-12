import { Box, Text, Button, Stack } from "@chakra-ui/react";
import { FC } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUsersApi } from "../../Hooks/useApi";

export const Navbar: FC = () => {
  const auth = useAuth();
  const usersApi = useUsersApi();
  const navigate = useNavigate();
  const logout = async () => {
    await usersApi.logout({});
    auth.refresh(() => navigate("/login"), true);
  };
  return (
    <Box padding={10}>
      <Stack spacing={5} direction="row">
        {auth.isLoggedIn === false && (
          <Button colorScheme="telegram" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
        {auth.isLoggedIn === false && (
          <Button colorScheme="telegram" onClick={() => navigate("/register")}>
            Register
          </Button>
        )}
        {auth.isLoggedIn === true && (
          <Button colorScheme="telegram" onClick={() => navigate("/users")}>
            Users list
          </Button>
        )}
        {auth.isLoggedIn === true && <Button onClick={logout}>Logout</Button>}
        <Text color={auth.isLoggedIn ? "green" : "red"}>
          {auth.isLoggedIn ? `Logged in as ${auth.user?.username}` : "Not logged in"}
        </Text>
      </Stack>
    </Box>
  );
};
