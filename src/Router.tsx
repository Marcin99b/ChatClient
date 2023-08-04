import { FC, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Components/Layout/Layout";

const Users = lazy(() => import("./Pages/Users"));
const Room = lazy(() => import("./Pages/Room"));

const Router: FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense>
              <Users />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/room"
        element={
          <Suspense>
            <Room />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default Router;
