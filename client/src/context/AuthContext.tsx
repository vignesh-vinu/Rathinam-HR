import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OrganizationId } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  selectedOrgFilter: OrganizationId;
  setSelectedOrgFilter: (org: OrganizationId) => void;
  isSuperAdmin: boolean;
  canAccessOrg: (orgId: OrganizationId) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rathinam_hr_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('rathinam_hr_token');
  });

  const [selectedOrgFilter, setSelectedOrgFilter] = useState<OrganizationId>('ALL');

  useEffect(() => {
    if (user?.organizationId && user.role !== 'SUPER_ADMIN') {
      setSelectedOrgFilter(user.organizationId);
    }
  }, [user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('rathinam_hr_token', newToken);
    localStorage.setItem('rathinam_hr_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rathinam_hr_token');
    localStorage.removeItem('rathinam_hr_user');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const canAccessOrg = (orgId: OrganizationId) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (orgId === 'ALL') return true;
    return user.organizationId === orgId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        selectedOrgFilter,
        setSelectedOrgFilter,
        isSuperAdmin,
        canAccessOrg
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
