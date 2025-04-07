// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  // CardFooter,  // Optionnel si besoin d'un footer
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser } from "@/services/Api";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Rediriger si déjà connecté (en tant qu'admin)
  useEffect(() => {
    if (isAuthenticated && user?.role?.includes("ADMIN")) {
      console.log("Admin already logged in, redirecting to dashboard.");
      navigate("/admin/dashboard", { replace: true });
    } else if (isAuthenticated && !user?.role?.includes("ADMIN")) {
      // Si l'utilisateur est connecté mais n'est pas un admin, déconnectez-le et affichez un message
      logout();
      toast({
        title: "Accès Refusé",
        description: "Vous n'avez pas les privilèges d'administrateur.",
        variant: "destructive",
      });
      navigate("/admin"); // Ou une autre page appropriée
    }
  }, [isAuthenticated, navigate, user?.role, logout, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const responseData = await loginUser(email, password);
      console.log("loginUser response:", responseData);

      if (responseData && responseData.token) {
        await login(responseData.token);

        // Le contexte devrait maintenant être mis à jour après l'appel à login hhh
        // On vérifie directement le rôle de l'utilisateur depuis le contexte
        if (user?.role?.includes("ADMIN")) {
          console.log("Admin login successful, navigating to dashboard.");
          toast({
            title: "Connexion Admin Réussie",
            description: "Redirection vers le tableau de bord...",
          });
          navigate("/admin/dashboard");
        } else {
          console.warn(
            "Connexion réussie mais l'utilisateur n'est pas un ADMIN."
          );
          // Déconnexion et redirection vers la page de login si l'utilisateur n'est pas admin
          logout();
          navigate("/admin");
          toast({
            title: "Accès Refusé",
            description: "Vous n'avez pas les privilèges d'administrateur.",
            variant: "destructive",
          });
        }
      } else {
        setError("Échec de la connexion : Aucun token reçu.");
        toast({
          title: "Échec de la Connexion",
          description: "Problème avec le serveur d'authentification.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Erreur de connexion Admin :", err);
      setError(err.message || "Identifiants invalides ou erreur du serveur.");
      toast({
        title: "Échec de la Connexion",
        description:
          err.message || "Identifiants invalides ou erreur du serveur.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <img
              src="/path/to/your/admin-logo.png"
              alt="Admin Logo"
              className="w-20 h-20 mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold">Portail Admin</CardTitle>
            <CardDescription>
              Entrez vos identifiants d'administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se Connecter"}
                </Button>
              </div>
            </form>
          </CardContent>
          {/* Optionnel : ajouter un CardFooter pour un lien de retour */}
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
