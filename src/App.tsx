import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Auth/AuthContext";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        bg: "#1a202c",
        color: "#F7FAFC",
      },
    },
  },
});

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};
