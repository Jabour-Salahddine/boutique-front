// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // Pour le nom et le logout
import { LayoutDashboard, Package, Tags, Users, LogOut, Settings, ShoppingBag } from 'lucide-react'; // Icônes exemple

// Optionnel: Créez un layout admin dédié si besoin
// import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    // Utilisez AdminLayout si créé, sinon structure simple
    <div className="min-h-screen flex flex-col">
       {/* Optionnel: Navbar Admin */}
       <header className="bg-gray-800 text-white shadow-md">
         <div className="container mx-auto px-4 py-3 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <LayoutDashboard className="h-6 w-6" />
             <h1 className="text-xl font-semibold">Admin Dashboard</h1>
           </div>
           <div className="flex items-center gap-4">
             <span className="text-sm">Welcome, {user?.name || user?.email}</span>
             <Button onClick={logout} variant="destructive" size="sm">
               <LogOut className="mr-1 h-4 w-4" /> Logout
             </Button>
           </div>
         </div>
       </header>

       {/* Contenu Principal */}
       <main className="flex-grow container mx-auto px-4 py-8">
         <h2 className="text-2xl font-bold mb-6 text-gray-700">Management Sections</h2>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Exemple de cartes pour les sections CRUD */}
           <Link to="/admin/products"> {/* Définir cette route plus tard */}
             <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
               <Package className="h-8 w-8 text-blue-600" />
               <div>
                 <h3 className="text-lg font-semibold text-gray-800">Manage Products</h3>
                 <p className="text-sm text-gray-500">Add, edit, or remove products</p>
               </div>
             </div>
           </Link>

           <Link to="/admin/categories"> {/* Définir cette route plus tard */}
             <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
               <Tags className="h-8 w-8 text-green-600" />
               <div>
                 <h3 className="text-lg font-semibold text-gray-800">Manage Categories</h3>
                 <p className="text-sm text-gray-500">Organize product categories</p>
               </div>
             </div>
           </Link>

           <Link to="/admin/users"> {/* Définir cette route plus tard */}
             <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
               <Users className="h-8 w-8 text-purple-600" />
               <div>
                 <h3 className="text-lg font-semibold text-gray-800">Manage Users</h3>
                 <p className="text-sm text-gray-500">View and manage user accounts</p>
               </div>
             </div>
           </Link>

           <Link to="/admin/orders"> {/* Définir cette route plus tard */}
             <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
               <ShoppingBag className="h-8 w-8 text-orange-600" /> {/* ShoppingBag déjà utilisé ailleurs, peut-être autre icône */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-800">View Orders</h3>
                 <p className="text-sm text-gray-500">Check customer orders</p>
               </div>
             </div>
           </Link>

            <Link to="/admin/settings"> {/* Définir cette route plus tard */}
             <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
               <Settings className="h-8 w-8 text-gray-600" />
               <div>
                 <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
                 <p className="text-sm text-gray-500">Configure application settings</p>
               </div>
             </div>
           </Link>

         </div>
       </main>

       {/* Optionnel: Footer Admin */}
       <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
          Admin Panel - © {new Date().getFullYear()} Your Company
       </footer>
    </div>
  );
};

export default AdminDashboard;