import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode"; // Pour jwt-decode v4+
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/lib/api';

// Interfaces utilisateur et payload JWT
interface User {
  id: string | number; // L'ID de l'utilisateur (souvent dans le token)
  email: string;       // L'email (souvent le 'sub' du token)
  name?: string;       // Le nom (optionnel)
  role: string;        // Le rôle (optionnel, par exemple 'customer' par défaut)
}

interface JwtPayload {
  sub: string;                   // Généralement l'email ou username
  userId?: string | number;      // Optionnel: ID utilisateur
  role?: string;                 // Optionnel: Rôle utilisateur
  name?: string;                 // Optionnel: Nom utilisateur
  iat?: number;                  // Issued at (timestamp)
  exp: number;                   // Expiration time (timestamp)
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Le token JWT
  isAuthenticated: boolean;
  isLoading: boolean;   // Pour la vérification initiale du token
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (nom: string,prenom: string,email: string,
    telephone: string,password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mise à jour de l'état à partir d'un token valide
  const setAuthState = useCallback((newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken);
      // Vérification de l'expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired");
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
        return;
      }

      const currentUser: User = {
        id: decoded.userId || decoded.sub,
        email: decoded.sub,
        role: decoded.role || 'customer',
        name: decoded.name,
      };

      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(currentUser);
    } catch (error) {
      confirm(error)
      console.error("Failed to decode or process token:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  // Vérification initiale lors du chargement de l'app
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      setAuthState(storedToken);
    }
    setIsLoading(false);
  }, [setAuthState]);

  // Fonction login qui met à jour l'état et affiche un toast
  const login = useCallback(async (newToken: string): Promise<void> => {
    setAuthState(newToken);
    const decoded = jwtDecode<JwtPayload>(newToken);
    toast({
      title: "Login successful",
      description: `Welcome back, ${decoded.name || decoded.sub}!`,
    });
  }, [setAuthState, toast]);

  // Fonction logout qui nettoie l'état et le stockage
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  }, [toast]);

  // Fonction register qui appelle l'API d'inscription et connecte l'utilisateur automatiquement
  const register = useCallback(async (
    nom: string,
    prenom: string,
    email: string,
    telephone: string,
    password: string
  ): Promise<void> => {
    try {
      const { token } = await registerUser(nom, prenom, email, telephone, password);
      await login(token);  
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

// Hook pour accéder au contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
