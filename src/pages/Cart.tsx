// src/pages/Cart.tsx
import React, { useState } from 'react'; // Importer useState (Conservé de Code 1)
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
// Ajouter Loader2 pour l'indicateur de chargement (Conservé de Code 1)
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Nécessaire pour le code promo (Présent dans les deux)
import { Separator } from '@/components/ui/separator'; // Nécessaire pour le résumé (Présent dans les deux)
import { useAuth } from '@/contexts/AuthContext';
// --- Importer depuis paiementApi.ts --- (Conservé de Code 1)
import { createCheckoutSession } from '@/services/paiementApi';
// --- Importer useToast --- (Conservé de Code 1)
import { useToast } from '@/hooks/use-toast'; // Assurez-vous que le chemin est correct

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialiser le hook (Conservé de Code 1)

  // --- AJOUT: État pour le chargement du bouton checkout --- (Conservé de Code 1)
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    // Assurer que la quantité ne descend pas en dessous de 1
    if (newQuantity < 1) return;
    // Trouver l'item pour vérifier le stock max si nécessaire (si non géré dans updateQuantity)
    const item = cartItems.find(i => i.product.id === productId);
    if (item && newQuantity > item.product.quantiteStock) {
        toast({
            title: "Stock Limit Reached",
            description: `Only ${item.product.quantiteStock} items available for ${item.product.nom}.`,
            variant: "destructive",
        });
        return; // Ne pas mettre à jour si dépassement stock
    }
    updateQuantity(productId, newQuantity);
  };

  // --- MODIFICATION: Logique de handleCheckout --- (Conservé et Amélioré de Code 1)
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      // Sauvegarder l'intention de redirection après login
      navigate('/login?redirect=/cart'); // On redirige vers le panier après login pour que l'utilisateur confirme
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "warning" }); // Utiliser warning au lieu de destructive
      return;
    }

    setIsCheckingOut(true); // Démarrer le chargement

    try {
      console.log("Calling createCheckoutSession with items:", cartItems);
      const response = await createCheckoutSession(cartItems);

      if (response && response.checkoutUrl) {
        console.log('Redirecting to Stripe Checkout:', response.checkoutUrl);
        window.location.href = response.checkoutUrl; // Redirection externe
        // Pas besoin de setIsCheckingOut(false) ici car la page va changer
      } else {
        throw new Error('Checkout URL was not returned by the server.');
      }
    } catch (error: any) {
      console.error('Checkout initiation failed:', error);
      // Essayer d'extraire un message d'erreur plus spécifique si disponible (ex: depuis response.data)
      const errorMessage = error?.response?.data?.message || error.message || "Could not initiate checkout. Please try again later.";
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsCheckingOut(false); // Arrêter le chargement en cas d'erreur
    }
  };
  // --- FIN MODIFICATION: handleCheckout ---

  // --- Calculs des coûts (pris de Code 2 / Logique standard) ---
  const shippingCost = cartTotal >= 50 ? 0 : 10;
  const finalTotal = cartTotal + shippingCost;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-commerce-primary mb-8">Your Shopping Cart</h1>
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne Gauche: Cart Items (Contenu détaillé pris de Code 2) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                 {/* --- AJOUTÉ DE CODE 2 : Header de la liste --- */}
                 <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-medium text-gray-500">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Total</div>
                 </div>
                 {/* --- FIN AJOUT --- */}

                 {/* --- AJOUTÉ DE CODE 2 : Cart Items List détaillée --- */}
                 <div className="space-y-4 divide-y">
                   {cartItems.map(item => (
                     <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
                       {/* Product Info */}
                       <div className="col-span-6 flex items-center">
                         <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                           <img
                             src={item.product.imageUrl || '/placeholder.png'} // Ajout fallback image
                             alt={item.product.nom}
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="ml-4 flex-grow min-w-0">
                           <Link
                             to={`/product/${item.product.id}`}
                             className="font-medium text-commerce-primary hover:underline line-clamp-1"
                           >
                             {item.product.nom}
                           </Link>
                           {/* Assurez-vous que item.product.categorie existe et a une propriété 'nom' */}
                           <p className="text-sm text-gray-500">{item.product.categorie?.nom || 'No Category'}</p>
                           <button
                             onClick={() => removeFromCart(item.product.id)}
                             className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1 md:hidden"
                           >
                             <Trash2 className="h-3 w-3 mr-1" /> Remove
                           </button>
                         </div>
                       </div>

                       {/* Price */}
                       <div className="col-span-2 text-center">
                         <span className="md:hidden text-gray-500 mr-2">Price:</span>
                         ${item.product.prix.toFixed(2)}
                       </div>

                       {/* Quantity */}
                       <div className="col-span-2 flex justify-center">
                          <div className="flex items-center border rounded-md">
                              <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 rounded-r-none" // Ajusté pour une meilleure apparence
                              >
                                  <Minus className="h-3 w-3" />
                              </Button>
                              {/* Input pour la quantité - Optionnel mais peut être utile */}
                              {/* <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                      const newQty = parseInt(e.target.value);
                                      if (!isNaN(newQty) && newQty >= 1) {
                                          handleQuantityChange(item.product.id, newQty);
                                      }
                                  }}
                                  className="w-12 h-8 text-center border-l-0 border-r-0 rounded-none focus-visible:ring-0"
                                  min="1"
                                  max={item.product.quantiteStock}
                              /> */}
                               <div className="w-10 text-center text-sm font-medium h-8 flex items-center justify-center border-l border-r">
                                {item.quantity}
                              </div>
                              <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.quantiteStock}
                                  className="h-8 w-8 rounded-l-none" // Ajusté pour une meilleure apparence
                              >
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                          {/* Afficher le stock si la quantité max est atteinte */}
                          {item.quantity >= item.product.quantiteStock && (
                              <p className="text-xs text-red-500 mt-1 text-center">Max stock</p>
                          )}
                       </div>

                       {/* Total */}
                       <div className="col-span-2 text-right md:text-center font-medium">
                         <span className="md:hidden text-gray-500 mr-2">Total:</span>
                         ${(item.product.prix * item.quantity).toFixed(2)}
                         <button
                           onClick={() => removeFromCart(item.product.id)}
                           className="hidden md:inline-flex ml-4 text-red-500 hover:text-red-700 p-1"
                           title="Remove item" // Ajout title pour accessibilité
                         >
                            <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
                 {/* --- FIN AJOUT --- */}

                 {/* --- AJOUTÉ DE CODE 2 : Actions Section --- */}
                 <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
                   <Button
                     variant="outline"
                     onClick={() => navigate('/products')}
                     className="text-commerce-primary border-commerce-primary hover:bg-commerce-primary hover:text-white w-full md:w-auto"
                   >
                     <ShoppingBag className="mr-2 h-4 w-4" />
                     Continue Shopping
                   </Button>
                   <Button
                     variant="ghost"
                     onClick={clearCart}
                     className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full md:w-auto"
                     disabled={cartItems.length === 0} // Désactiver si panier déjà vide
                   >
                     <Trash2 className="mr-2 h-4 w-4" />
                     Clear Cart
                   </Button>
                 </div>
                 {/* --- FIN AJOUT --- */}
              </div>
            </div> {/* Fin Colonne Gauche */}

            {/* Colonne Droite: Order Summary (Contenu détaillé pris de Code 2, Bouton Checkout conservé de Code 1) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-commerce-primary mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {/* --- AJOUTÉ DE CODE 2 : Subtotal, Shipping, Promo, Separator, Total --- */}
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shippingCost === 0 ? <span className="text-commerce-accent font-semibold">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="py-3">
                    <label htmlFor="promo" className="block text-sm font-medium text-gray-700 mb-1">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input id="promo" placeholder="Enter code" />
                      {/* TODO: Ajouter la logique d'application du code promo si nécessaire */}
                      <Button variant="outline" className="flex-shrink-0">Apply</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-commerce-primary">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                  {/* --- FIN AJOUT --- */}
                </div>

                {/* --- MODIFIÉ/CONSERVÉ DE CODE 1: Bouton Checkout avec état de chargement --- */}
                <Button
                  className="w-full mt-6 bg-commerce-primary hover:bg-commerce-dark transition-colors duration-200 ease-in-out" // Ajout transition
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0} // Désactiver si chargement OU panier vide
                >
                  {isCheckingOut ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> // Légèrement plus grand
                  ) : (
                    <ArrowRight className="mr-2 h-5 w-5" /> // Légèrement plus grand
                  )}
                  {isCheckingOut ? 'Processing Payment...' : 'Proceed to Checkout'}
                </Button>
                {/* --- FIN MODIFICATION/CONSERVATION --- */}

                {/* --- AJOUTÉ DE CODE 2 : Additional Info --- */}
                <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
                    <p>Free shipping on orders over $50</p>
                    <p>Secure payment processing via Stripe</p>
                </div>
                {/* --- FIN AJOUT --- */}
              </div>
            </div> {/* Fin Colonne Droite */}
          </div> // Fin grid principal
        ) : (
          // --- AJOUTÉ DE CODE 2 : Empty cart display ---
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8 px-4">
                Looks like you haven't added any products to your cart yet. Explore our products and find something you like!
              </p>
              <Button
                onClick={() => navigate('/products')}
                className="bg-commerce-primary hover:bg-commerce-dark"
                size="lg"
              >
                Start Shopping Now
              </Button>
            </div>
          </div>
          // --- FIN AJOUT ---
        )}
      </div> {/* Fin container */}
      <Footer />
    </div> // Fin div principal
  );
};

export default Cart;