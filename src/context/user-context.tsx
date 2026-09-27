
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { hashPassword, verifyPassword } from '@/lib/password-hash';


interface User {
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  role?: string;
  company?: string;
  website?: string;
  location?: string;
  passwordHash?: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  logout: (deleteAccount?: boolean) => void;
  login: (name: string, pass: string) => Promise<boolean>;
  setPassword: (name: string, pass: string) => Promise<void>;
  hasPassword: () => boolean;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  forgotPassword: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  name: '0xdun0',
  email: '0xdun0@rovex.local',
  avatar: '',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(defaultUser);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const syncServerUser = (u: User) => {
    try {
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(u),
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    let localFound: User | null = null;
    try {
      // le usuario salvo do rovex
      const keysToTry = [
        'rovex-user',
        'user',
        'rovex_user',
        'auth_user',
        'pentester-user',
        'pentester',
      ];
      for (const k of keysToTry) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              if (parsed.email && !parsed.email.includes('rovex')) {
                parsed.email = '0xdun0@rovex.local';
              }
              // preserva 0xdun0 e recupera se foi alterado indevidamente
              if (parsed.name === 'Auditor' || !parsed.name) {
                parsed.name = '0xdun0';
              }
              localFound = parsed;
              localStorage.setItem('rovex-user', JSON.stringify(parsed));
              break;
            }
          } catch {
            // continua tentando
          }
        }
      }
      if (localFound) {
        setUserState(localFound);
      } else {
        setUserState(defaultUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUserState(defaultUser);
    } finally {
      setIsLoaded(true);
    }

    // sincroniza com servidor /api/user para persistencia definitiva
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(serverUser => {
        if (serverUser && serverUser.name) {
          setUserState(prev => {
            const merged = { ...prev, ...serverUser };
            localStorage.setItem('rovex-user', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const setUser = (newUser: User) => {
    // preserva passwordHash se ja existir
    const updatedUser: User = {
      ...user,
      ...newUser,
      passwordHash: user.passwordHash ?? newUser.passwordHash,
    };
    localStorage.setItem('rovex-user', JSON.stringify(updatedUser));
    setUserState(updatedUser);
    syncServerUser(updatedUser);
  };
  
  const logout = (deleteAccount = false) => {
    sessionStorage.removeItem('rovex-authenticated');
    if (deleteAccount) {
      localStorage.clear();
      setUserState({ ...defaultUser }); 
      try {
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => {});
      } catch {}
    }
    router.push('/');
    window.location.href = '/'; 
  };

  const login = async (name: string, pass: string): Promise<boolean> => {
    let currentUser = user;
    // se nao possui hash em memoria, tenta obter do servidor
    if (!currentUser.passwordHash) {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const sUser = await res.json();
          if (sUser && sUser.passwordHash) {
            currentUser = { ...currentUser, ...sUser };
            setUserState(currentUser);
            localStorage.setItem('rovex-user', JSON.stringify(currentUser));
          }
        }
      } catch {}
    }

    if (!currentUser.passwordHash) {
      return false;
    }
    const valid = await verifyPassword(pass, currentUser.passwordHash);
    if (currentUser.name.toLowerCase() !== name.toLowerCase() || !valid) {
      return false;
    }
    sessionStorage.setItem('rovex-authenticated', 'true');
    const upgradedHash = await hashPassword(pass);
    const updatedUser = { ...currentUser, passwordHash: upgradedHash };
    localStorage.setItem('rovex-user', JSON.stringify(updatedUser));
    setUserState(updatedUser);
    syncServerUser(updatedUser);
    return true;
  };

  const setPassword = async (name: string, pass: string) => {
    const passHash = await hashPassword(pass);
    const email = `${name.toLowerCase().replace(/\s/g, '.')}@rovex.local`;
    const updatedUser = { ...user, name, email, passwordHash: passHash };
    localStorage.setItem('rovex-user', JSON.stringify(updatedUser));
    setUserState(updatedUser);
    syncServerUser(updatedUser);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!user.passwordHash || !(await verifyPassword(oldPass, user.passwordHash))) {
      return false;
    }
    const newHash = await hashPassword(newPass);
    const updatedUser = { ...user, passwordHash: newHash };
    localStorage.setItem('rovex-user', JSON.stringify(updatedUser));
    setUserState(updatedUser);
    syncServerUser(updatedUser);
    return true;
  };
  
  const forgotPassword = () => {
    const updatedUser = { ...user };
    delete updatedUser.passwordHash;
    localStorage.setItem('rovex-user', JSON.stringify(updatedUser));
    setUserState(updatedUser);
    syncServerUser(updatedUser);
  };

  const hasPassword = () => !!user.passwordHash;
  
  if (!isLoaded) {
      return null; // or a loading spinner
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, login, setPassword, hasPassword, changePassword, forgotPassword }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
