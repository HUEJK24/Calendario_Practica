import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authRepository } from '../../data/repositories/authRepository';
import {
  deleteAuthToken,
  getAuthToken,
  saveAuthToken,
} from '../../services/secureStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const currentUser = await authRepository.me();
          if (isMounted) setUser(currentUser);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('No se pudo restaurar la sesión:', error.message);
        }
        await deleteAuthToken();
      } finally {
        if (isMounted) setIsRestoring(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { user: authenticatedUser, token } = await authRepository.login({ email, password });
    await saveAuthToken(token);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const signUp = useCallback(async ({ email, password }) => {
    const { user: newUser, token } = await authRepository.register({ email, password });
    await saveAuthToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const signOut = useCallback(async () => {
    await deleteAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isRestoring, signIn, signUp, signOut }),
    [user, isRestoring, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return context;
}
