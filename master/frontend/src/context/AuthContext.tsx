import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateDistrict: (district: string) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateDistrict: () => {},
  isAuthenticated: false,
  isAdmin: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('km_user');
    return saved ? JSON.parse(saved) : {
      id: 2,
      full_name: 'Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)',
      mobile_number: '9845012345',
      role: 'farmer',
      district: 'Mysuru',
      preferred_language: 'kn'
    };
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('km_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('km_user');
  };

  const updateDistrict = (district: string) => {
    if (user) {
      const updated = { ...user, district };
      setUser(updated);
      localStorage.setItem('km_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateDistrict,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
