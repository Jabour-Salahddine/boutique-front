// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Contexte d'authentification
import { loginUser } from '@/services/Api'; // API de connexion (réutilisée)
import { useToast } from '@/hooks/use-toast'; // Pour les messages d'erreur/succès

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isAuthenticated, logout } = useAuth(); // Obtenir login ET user/isAuthenticated/logout
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Rediriger si déjà connecté EN TANT QU'ADMIN
  useEffect(() => {
    if (isAuthenticated && user?.role?.includes('ADMIN')) {
      console.log('Admin already logged in, redirecting to dashboard.');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const responseData = await loginUser(email, password);

      if (responseData && responseData.token) {
        // 1. Mettre à jour l'état d'authentification via le contexte
        await login(responseData.token); // Attend que le contexte mette à jour l'état

        // 2. VÉRIFIER LE RÔLE APRÈS MISE À JOUR DU CONTEXTE
        // Il faut accéder à l'état MIS À JOUR. `login` ayant été `await`, `user` *devrait* être à jour.
        // Utiliser un léger délai ou une relecture de `user` peut être plus sûr dans certains cas complexes,
        // mais essayons directement d'abord.
        // Note: On utilise un état local `updatedUser` pour s'assurer qu'on a bien l'info post-login.
        const updatedAuthInfo = await new Promise<{ user: typeof user }>((resolve) => {
           // On utilise un micro-délai pour laisser React propager la mise à jour de l'état du contexte
           setTimeout(() => resolve({ user }), 0);
           // Alternative plus complexe : observer les changements du contexte.
        });


        if (updatedAuthInfo.user?.role?.includes('customer')) {
          console.log('Admin login successful, navigating to dashboard.');
          // Afficher un toast de succès spécifique admin si voulu
          toast({ title: "Admin Login Successful", description: "Redirecting to dashboard..." });
          navigate('/admin/dashboard'); // Redirection vers le tableau de bord
        } else {
          // Connecté mais PAS admin
          console.warn('Login successful but user is not an ADMIN.');
          setError('Access Denied. Administrator privileges required.');
          toast({ title: "Access Denied", description: "You do not have administrator privileges.", variant: "destructive" });
          // Déconnecter l'utilisateur car il n'est pas admin et a tenté via la page admin
          logout();
        }
      } else {
        // Cas improbable où l'API retourne 200 OK sans token
        setError('Login failed: No token received.');
        toast({ title: "Login Failed", description: "Authentication server issue.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error('Admin Login error:', err);
      setError(err.message || 'Invalid credentials or server error.');
      toast({ title: "Login Failed", description: err.message || 'Invalid credentials or server error.', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Pas de Navbar/Footer ici pour une page de login admin distincte ? A adapter.
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <img src="/path/to/your/admin-logo.png" alt="Admin Logo" className="w-20 h-20 mx-auto mb-4"/> {/* Optionnel: Logo Admin */}
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>
              Enter your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email" type="email" placeholder="admin@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoFocus // Focus sur l'email au chargement
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password" type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
          {/* Optionnel: Lien retour site principal ? */}
          {/* <CardFooter className="text-center text-sm">
            <Link to="/" className="text-blue-600 hover:underline">Back to main site</Link>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;