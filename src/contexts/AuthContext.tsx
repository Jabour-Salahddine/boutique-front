// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode"; // Importation correcte pour jwt-decode v4+
import { useToast } from '@/hooks/use-toast';

// Adaptez cette interface User pour correspondre aux informations
// que vous pourriez vouloir extraire du token JWT ou obtenir d'une autre API
// Par exemple, le payload de votre token pourrait contenir: { sub: "user@email.com", userId: 1, role: "admin" }
interface User {
  id: string | number; // L'ID de l'utilisateur (souvent dans le token)
  email: string;      // L'email (souvent le 'sub' ou 'subject' du token)
  name?: string;      // Le nom (peut venir du token ou d'un appel API séparé)
  role: string;       // Le rôle (peut venir du token)
}

// Interface pour le payload décodé du JWT. Adaptez selon ce que votre backend met dans le token.
interface JwtPayload {
  sub: string;       // Subject (généralement l'email ou username)
  userId?: string | number; // Optionnel: ID utilisateur
  role?: string;      // Optionnel: Rôle utilisateur
  name?: string;      // Optionnel: Nom utilisateur
  iat?: number;       // Issued at (timestamp)
  exp: number;       // Expiration time (timestamp) - Important!
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Ajout du token dans le contexte
  isAuthenticated: boolean;
  isLoading: boolean; // Pour gérer l'état de chargement initial (vérification du token)
  login: (token: string) => Promise<void>; // Accepte maintenant le token !
  logout: () => void;
  // La fonction register est retirée ici, elle devrait être gérée par une page Register
  // qui appelle une fonction registerUser dans Api.ts, puis potentiellement appelle login() si l'API retourne un token.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken'; // Clé pour localStorage

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Commence à true pendant la vérification initiale
  const { toast } = useToast();

  // Fonction pour mettre à jour l'état basé sur un token valide
  const setAuthState = useCallback((newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken); // Décoder le token

      // Vérifier si le token a expiré (optionnel mais recommandé)
      // Date.now() donne des millisecondes, exp est en secondes.
      if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired");
          localStorage.removeItem(AUTH_TOKEN_KEY); // Nettoyer le token expiré
          setUser(null);
          setToken(null);
          return; // Ne pas définir l'état si expiré
      }

      // Créer l'objet User à partir du token décodé
      // Adaptez les clés (sub, userId, role) à ce que votre backend fournit réellement
      const currentUser: User = {
        id: decoded.userId || decoded.sub, // Utilise userId si présent, sinon sub
        email: decoded.sub,                // sub est souvent l'email
        role: decoded.role || 'customer',  // Fournit un rôle par défaut si absent
        name: decoded.name                // Nom si présent dans le token
      };

      localStorage.setItem(AUTH_TOKEN_KEY, newToken); // Stocker le nouveau token
      setToken(newToken);
      setUser(currentUser);

    } catch (error) {
      console.error("Failed to decode or process token:", error);
      // Si le token est invalide, nettoyer
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, []); // Pas de dépendances nécessaires si jwtDecode et localStorage sont globaux

  // Vérifier le token stocké au chargement initial de l'application
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      setAuthState(storedToken); // Tenter de restaurer l'état avec le token stocké
    }
    setIsLoading(false); // Fin du chargement initial
  }, [setAuthState]); // Dépend de setAuthState

  // Fonction LOGIN: Accepte le token, décode, met à jour l'état et stocke
  const login = useCallback(async (newToken: string): Promise<void> => {
    setAuthState(newToken); // Utilise la fonction centralisée
    // La fonction toast peut être appelée ici ou dans le composant Login après succès
    const decoded = jwtDecode<JwtPayload>(newToken);
    toast({
      title: "Login successful",
      description: `Welcome back, ${decoded.name || decoded.sub}!`, // Utilise le nom si disponible
    });
    // Pas besoin de retourner true/false, le succès est géré par l'appel API dans Login.tsx
  }, [setAuthState, toast]); // Dépendances

  // Fonction LOGOUT: Nettoie l'état et le stockage
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Optionnel: Rediriger vers la page de login ou d'accueil
    // navigate('/login'); // Si vous avez accès à navigate ici
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  }, [toast]); // Dépendance

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Expose le token
        isAuthenticated: !!user && !!token, // Authentifié si user ET token existent
        isLoading, // Expose l'état de chargement
        login,
        logout,
        
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