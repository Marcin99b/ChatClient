import { Outlet } from "react-router-dom";
import { FC } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Box } from "@chakra-ui/react";

const Layout: FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" width="100%">
    <Navbar />
    <Outlet />
  </Box>
);

export default Layout;
