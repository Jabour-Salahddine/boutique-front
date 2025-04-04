


       //  Ce composant vérifie l'authentification et le rôle avant d'afficher une page protégée.

// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Assurez-vous que le chemin est correct

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Rôle requis pour accéder à cette route
  redirectTo?: string; // Où rediriger si l'accès est refusé (par défaut /admin/login)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/admin', // Rediriger vers la page de login admin par défaut
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation(); // Pour potentiellement garder l'URL d'origine

  // 1. Attendre la fin du chargement de l'état d'authentification
  if (isLoading) {
    // Affichez un spinner ou un composant de chargement ici
    return <div>Loading authentication status...</div>;
  }

  // 2. Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion spécifiée (ou par défaut)
    // replace: évite d'ajouter l'URL protégée à l'historique avant la redirection
    // state: permet de potentiellement rediriger vers la page d'origine après connexion
    console.log('ProtectedRoute: Not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // 3. Vérifier si un rôle spécifique est requis ET si l'utilisateur a ce rôle
  if (requiredRole && (!user || !user.role || !user.role.includes(requiredRole))) {
    // L'utilisateur est authentifié mais n'a pas le bon rôle
    console.log(`ProtectedRoute: Role mismatch. Required: ${requiredRole}, User roles: ${user?.role}. Redirecting to ${redirectTo}`);
    // Rediriger vers la page de connexion admin (ou une page "accès refusé" dédiée)
     // Vous pouvez aussi afficher un toast ici pour informer l'utilisateur
     // toast({ title: "Access Denied", description: "You do not have permission to access this page.", variant: "destructive" });
    return <Navigate to={redirectTo} replace />;
  }

  // 4. Si authentifié et (aucun rôle requis OU bon rôle), afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
       