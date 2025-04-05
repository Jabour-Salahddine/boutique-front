
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import  UserProfile  from "./pages/userProfil";


// --- AJOUTS ---
// Importer les nouveaux composants Admin et Protection
import AdminLogin from '@/pages/admin/AdminLogin'; // Assurez-vous que le chemin est correct
import AdminDashboard from '@/pages/admin/AdminDashboard'; // Assurez-vous que le chemin est correct
import ProtectedRoute from '@/components/ProtectedRoute'; // Assurez-vous que le chemin est correct
// --- FIN AJOUTS ---

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<ProductList />} />
              <Route path="/categories/:category" element={<ProductList />} />
              <Route path="/search" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/userProfail" element={<UserProfile />} />
              <Route
                path="/admin/dashboard"
                element={
                  // Utilise ProtectedRoute pour vérifier le rôle 'ADMIN'
                  // Redirige vers /admin (login admin) si non autorisé
                  <ProtectedRoute requiredRole="ADMIN" redirectTo="/admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
           </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
