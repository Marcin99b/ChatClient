import { FC, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import AuthChecker from "./Auth/AuthChecker";
import { Box } from "@chakra-ui/react";

const Users = lazy(() => import("./Pages/Users"));
const Room = lazy(() => import("./Pages/Room"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));

const Router: FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense>
              <AuthChecker requireAuth={false}>
                <Box>Home page</Box>
              </AuthChecker>
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense>
              <AuthChecker requireAuth={false}>
                <Login />
              </AuthChecker>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense>
              <AuthChecker requireAuth={false}>
                <Register />
              </AuthChecker>
            </Suspense>
          }
        />
        <Route
          path="/users"
          element={
            <Suspense>
              <AuthChecker requireAuth={true}>
                <Users />
              </AuthChecker>
            </Suspense>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <Suspense>
              <AuthChecker requireAuth={true}>
                <Room />
              </AuthChecker>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default Router;
