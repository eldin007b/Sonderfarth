import React, { createContext, useState, ReactNode, useContext } from 'react';

interface AuthContextType {
  role: 'admin' | 'user';
  setRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType>({ role: 'user', setRole: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<'admin' | 'user'>('user');
  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
