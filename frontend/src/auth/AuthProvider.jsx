import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    return sessionStorage.getItem("user_id") || null;
  });

  const authLogin = (usrId) => {
    setUserId(usrId);
    sessionStorage.setItem("user_id", usrId);
  };
  const authLogout = () => {
    setUserId(null);
    sessionStorage.removeItem("user_id");
  };
  return (
    <AuthContext.Provider value={{ userId, authLogin, authLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
