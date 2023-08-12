import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUsersApi } from "../Hooks/useApi";
import { User } from "../Models/ApiModels";

export interface AuthContextType {
  user: User | undefined;
  isLoggedIn: boolean;
  refresh: (callback: VoidFunction, isLogout?: boolean) => void;
  isChecked: React.MutableRefObject<boolean>;
}
export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isMount = useRef(false);
  const isChecked = useRef(false);
  const [user, setUser] = useState<User>();
  const isLoggedIn = user !== undefined;

  const { getCurrentUser } = useUsersApi();

  useEffect(() => {
    if (isMount.current) {
      return;
    }
    isMount.current = true;
    getCurrentUser({})
      .then((x) => {
        setUser(x.user);
        isChecked.current = true;
      })
      .catch(() => {
        setUser(undefined);
        isChecked.current = true;
      });
  }, [getCurrentUser, user]);

  const refresh = (callback: VoidFunction, isLogout?: boolean) => {
    if (isLogout === true) {
      setUser(undefined);
      isChecked.current = true;
    } else {
      getCurrentUser({})
        .then((x) => {
          setUser(x.user);
          isChecked.current = true;
        })
        .catch(() => {
          setUser(undefined);
          isChecked.current = true;
        });
    }

    callback();
  };

  const value = { user: user, isLoggedIn, isChecked, refresh };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
