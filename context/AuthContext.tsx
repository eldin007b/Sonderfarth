import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext({
  role: 'user',
  setRole: (_: string) => {},
});

export const AuthProvider = ({ children }: any) => {
  const [role, setRole] = useState('user');
  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
