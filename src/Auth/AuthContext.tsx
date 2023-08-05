import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUsersApi } from "../Hooks/useApi";
import { User } from "../Models/ApiModels";

export interface AuthContextType {
  user: User | undefined;
  isLoggedIn: boolean;
  refresh: (callback: VoidFunction) => void;
}
export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isMount = useRef(false);

  const [user, setUser] = useState<User>();
  const isLoggedIn = user !== undefined;

  const { getCurrentUser } = useUsersApi();

  useEffect(() => {
    if (isMount.current) {
      return;
    }
    isMount.current = true;
    getCurrentUser({})
      .then((x) => setUser(x.user))
      .catch(() => setUser(undefined));
  }, [getCurrentUser, user]);

  const refresh = (callback: VoidFunction) => {
    getCurrentUser({})
      .then((x) => setUser(x.user))
      .catch(() => setUser(undefined));

    callback();
  };

  const value = { user: user, isLoggedIn, refresh };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
