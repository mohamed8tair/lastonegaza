import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { systemUsersService } from '../services/supabaseService';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  permissions?: string[];
  associated_type?: 'organization' | 'family' | null;
  associated_id?: string | null;
  status: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface AuthContextType {
  loggedInUser: AuthUser | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setLoggedInUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await loadUserData(session.user.email);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (email: string) => {
    try {
      const user = await systemUsersService.getByEmail(email);
      if (user) {
        setLoggedInUser(user as AuthUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string = 'dummy-password') => {
    try {
      const user = await systemUsersService.getByEmail(email);

      if (user && user.status === 'active') {
        await systemUsersService.update(user.id, {
          last_login: new Date().toISOString()
        });

        const updatedUser = {
          ...user,
          last_login: new Date().toISOString()
        } as AuthUser;

        setLoggedInUser(updatedUser);
      } else if (user && user.status !== 'active') {
        throw new Error('المستخدم غير نشط. يرجى التواصل مع الإدارة.');
      } else {
        throw new Error('البريد الإلكتروني غير مسجل في النظام.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setLoggedInUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (loggedInUser) {
      setLoggedInUser({
        ...loggedInUser,
        ...updates
      });
    }
  };

  const value = {
    loggedInUser,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};