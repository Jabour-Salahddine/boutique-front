import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/services/Api'; // Importez la fonction API

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth(); // Gardez useAuth pour stocker l'état d'authentification après le succès de l'API
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // Correction pour la redirection: s'assurer que le chemin est relatif ou absolu correct
  const redirectToRaw = queryParams.get('redirect');
  const redirectTo = redirectToRaw ? (redirectToRaw.startsWith('/') ? redirectToRaw : `/${redirectToRaw}`) : '/';


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
     
    try {
      // Appel de la fonction API centralisée
      const responseData = await loginUser(email, password); // Ex: { token: "jwt.token.string" }

      if (responseData && responseData.token) {
        console.log(responseData);
        // --- CORRECTION ICI ---
        // Si l'API réussit et retourne un token:
        // Appelle la fonction login du contexte AVEC le token
        await login(responseData.token); // <- Passe le token reçu à la fonction du contexte

        // La fonction login du contexte s'occupe maintenant de stocker le token,
        // de décoder l'utilisateur, et de mettre à jour l'état global.
        // Le toast de succès est maintenant géré DANS le AuthContext.

        // Navigue vers la page de redirection ou la page d'accueil APRES la mise à jour du contexte
        navigate(redirectTo);
        // --- FIN DE LA CORRECTION ---

      } 
      
      else {
        // Cas où l'API retourne 200 OK mais pas de token (improbable avec votre backend actuel)
        setError('Login successful, but no token received.');
        console.warn('API returned OK but no token.'); // Log pour débug
     }
   } catch (err: any) {
     setError(err.message || 'An unexpected error occurred during login.');
     console.error('Login error:', err);
   } finally {
     setIsLoading(false);
   }
 };

  // Le reste du JSX reste exactement le même qu'avant
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-required="true"
                      aria-describedby={error ? "login-error" : undefined}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-commerce-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-required="true"
                      aria-describedby={error ? "login-error" : undefined}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-commerce-primary hover:bg-commerce-dark"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
               {/* Message d'erreur pour l'accessibilité */}
               {error && <p id="login-error" className="sr-only">Error: {error}</p>}

              <div className="mt-4 text-center text-sm">
                <p>
                  Demo credentials: <br />
                  Admin: admin@example.com / admin123 <br />
                  Customer: customer@example.com / customer123
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-commerce-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;