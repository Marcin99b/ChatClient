import { Outlet } from "react-router-dom";
import { FC } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Box } from "@chakra-ui/react";
import { ReceivingCalls } from "../ReceivingCalls/ReceivingCalls";

const Layout: FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" width="100%" padding={20}>
    <Navbar />
    <Outlet />
    <ReceivingCalls />
  </Box>
);

export default Layout;
