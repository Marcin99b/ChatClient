import { createContext, useContext, useState } from "react";

export interface AuthContextType {
  isLoggedIn: boolean;
  signin: (callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}
const authTokenCookie = "__access-token";

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(doesHttpOnlyCookieExist(authTokenCookie));

  const signin = (callback: VoidFunction) => {
    setIsLoggedIn(doesHttpOnlyCookieExist(authTokenCookie));
    callback();
  };

  const signout = (callback: VoidFunction) => {
    setIsLoggedIn(doesHttpOnlyCookieExist(authTokenCookie));
    callback();
  };

  const value = { isLoggedIn, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function doesHttpOnlyCookieExist(cookiename: string) {
  var d = new Date();
  d.setTime(d.getTime() + 1000);
  var expires = "expires=" + d.toUTCString();

  document.cookie = cookiename + "=new_value;path=/;" + expires;
  return document.cookie.indexOf(cookiename + "=") === -1;
}
