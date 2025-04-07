// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/lib/api';
import { getUserProfile } from '@/services/Api';

// Définition de l'interface User utilisée dans l'application
export interface User {
  id: string | number;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (
    nom: string,
    prenom: string,
    email: string,
    telephone: string,
    password: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Plutôt que de décoder le token avec jwtDecode,
   * nous stockons le token et utilisons getUserProfile pour récupérer
   * l'ensemble des informations utilisateur.
   */
  const setAuthState = useCallback(async (newToken: string) => {
    try {
      // Sauvegarde du token dans le localStorage et dans l'état
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      
      // Récupération du profil complet via l'API
      const fetchedUser = await getUserProfile(newToken);
      
      // Mise à jour de l'état utilisateur avec les informations récupérées
      setUser({
        id: fetchedUser.id,
        email: fetchedUser.email,
        nom: fetchedUser.nom,
        prenom: fetchedUser.prenom,
        telephone: fetchedUser.telephone,
        role: fetchedUser.role,
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      // Au démarrage, si un token est stocké, on tente de récupérer le profil utilisateur
      setAuthState(storedToken);
    }
    setIsLoading(false);
  }, [setAuthState]);

  const login = useCallback(async (newToken: string): Promise<void> => {
    // Mise à jour de l'état d'authentification et récupération du profil
    await setAuthState(newToken);
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
  }, [setAuthState, toast]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  }, [toast]);

  const register = useCallback(async (
    nom: string,
    prenom: string,
    email: string,
    telephone: string,
    password: string
  ): Promise<void> => {
    try {
      const { token: newToken } = await registerUser(nom, prenom, email, telephone, password);
      // Connexion automatique après inscription
      //await login(newToken);
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      throw error;
    }
  }, [login, toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
