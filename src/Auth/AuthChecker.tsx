import { Navigate } from "react-router-dom";
import { FC } from "react";
import { useAuth } from "./AuthContext";

type AuthCheckerProps = {
  requireAuth: boolean;
  children: JSX.Element;
};

const AuthChecker: FC<AuthCheckerProps> = (props: AuthCheckerProps) => {
  const { requireAuth, children } = props;
  const auth = useAuth();
  if (requireAuth && !auth.isLoggedIn && auth.isChecked.current) {
    return <Navigate to={"/login"} />; //todo handle redirectTo
  }
  return children;
};

export default AuthChecker;
