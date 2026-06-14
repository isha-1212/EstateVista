import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseClient';
import { api } from '../services/api';

import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const refreshUser = async () => {
    const response = await api.me();
    setUser(response.data || null);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let didCancel = false;
    const latestOp = { id: 0 };

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      const opId = ++latestOp.id;

      try {
        if (didCancel) return;

        if (!firebaseUser) {
          // If we are switching users/signing in, ignore intermediate nulls that arrive
          // before the final authenticated state settles.
          if (auth && auth.currentUser) return;
          localStorage.removeItem('token');
          setUser(null);
          return;
        }

        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);

        // Only apply results for the latest auth callback.
        if (didCancel) return;
        if (opId !== latestOp.id) return;

        await refreshUser();
      } catch {
        if (opId === latestOp.id && !didCancel) setUser(null);
      } finally {
        if (opId === latestOp.id && !didCancel) setLoading(false);
      }
    });

    return () => {
      didCancel = true;
      unsubscribe();
    };
  }, []);



  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

