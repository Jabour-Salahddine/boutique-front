// src/pages/Cart.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext'; // Assurez-vous que le chemin est correct

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // La fonction attend un number, item.product.id est number. C'est OK.
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      // Rediriger vers login en gardant la cible checkout
      navigate('/login?redirect=/checkout'); // Assurez-vous que le redirect est bien géré au login
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-commerce-primary mb-8">Your Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Header (inchangé) */}
                {/* ... */}

                {/* Cart Items List */}
                <div className="space-y-4 divide-y">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex items-center">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100"> {/* Added background */}
                          <img
                            src={item.product.imageUrl} 
                            alt={item.product.nom}    
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow min-w-0"> {/* Added flex-grow and min-width */}
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-medium text-commerce-primary hover:underline line-clamp-1"
                          >
                            {item.product.nom} {/* CORRIGÉ */}
                          </Link>
                          {/* CORRIGÉ: Utiliser l'objet categorie */}
                          <p className="text-sm text-gray-500">{item.product.categorie.nom}</p>
                          <button
                            onClick={() => removeFromCart(item.product.id)} // OK (id is number)
                            className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1 md:hidden"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <span className="md:hidden text-gray-500 mr-2">Price:</span>
                        ${item.product.prix.toFixed(2)} {/* OK */}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 rounded-none"
                          > <Minus className="h-3 w-3" /> </Button>
                          <div className="w-8 text-center text-sm">{item.quantity}</div>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            // CORRIGÉ: quantiteStock
                            disabled={item.quantity >= item.product.quantiteStock}
                            className="h-8 w-8 rounded-none"
                          > <Plus className="h-3 w-3" /> </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right md:text-center font-medium">
                        <span className="md:hidden text-gray-500 mr-2">Total:</span>
                        ${(item.product.prix * item.quantity).toFixed(2)} {/* OK */}
                        <button
                          onClick={() => removeFromCart(item.product.id)} // OK
                          className="hidden md:inline-flex ml-4 text-red-500 hover:text-red-700 p-1" // Added padding
                        > <Trash2 className="h-4 w-4" /> </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions (inchangé) */}
                 <div className="mt-6 flex justify-between items-center pt-4 border-t">
                    {/* ... */}
                 </div>
              </div>
            </div>

            {/* Order Summary (inchangé) */}
            <div className="lg:col-span-1">
               {/* ... */}
            </div>
          </div>
        ) : (
          // Empty cart display (inchangé)
           <div className="text-center py-16 bg-white rounded-lg shadow-sm">
             {/* ... */}
           </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;