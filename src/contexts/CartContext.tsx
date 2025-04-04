// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Assurez-vous que les types importés sont les bons
import { CartItem, Product } from '@/types';
import { useToast } from '@/hooks/use-toast'; // Assurez-vous que le chemin est correct

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void; // CORRIGÉ: number
  updateQuantity: (productId: number, quantity: number) => void; // CORRIGÉ: number
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
         // TODO: Ajouter une validation plus robuste ici si la structure du panier stocké peut changer
         const parsedCart = JSON.parse(storedCart);
         if (Array.isArray(parsedCart)) { // Vérification simple
             setCartItems(parsedCart);
         } else {
             console.warn('Stored cart is not an array, resetting.');
             localStorage.removeItem('cart');
         }
      } catch (error) {
        console.error('Failed to parse stored cart', error);
        localStorage.removeItem('cart'); // Nettoyer le panier corrompu
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    if (!product || typeof product.id === 'undefined') {
        console.error("Attempted to add invalid product to cart:", product);
        toast({ title: "Error", description: "Could not add item to cart.", variant: "destructive" });
        return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        // Vérifier le stock avant d'augmenter la quantité
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantiteStock) {
             toast({
                 title: "Stock limit reached",
                 description: `Cannot add more ${product.nom}. Only ${product.quantiteStock} available.`,
                 variant: "destructive"
             });
             return prevItems; // Ne pas modifier le panier
         }
        toast({ title: "Cart updated", description: `Increased quantity of ${product.nom}` }); // CORRIGÉ: nom
        return prevItems.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      // Vérifier le stock avant d'ajouter un nouvel article
      if (quantity > product.quantiteStock) {
         toast({
             title: "Stock limit reached",
             description: `Cannot add ${quantity} of ${product.nom}. Only ${product.quantiteStock} available.`,
             variant: "destructive"
         });
         return prevItems; // Ne pas ajouter au panier
      }

      toast({ title: "Added to cart", description: `${product.nom} has been added to your cart` }); // CORRIGÉ: nom
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => { // CORRIGÉ: number
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
        toast({ title: "Removed from cart", description: `${itemToRemove.product.nom} has been removed` }); // CORRIGÉ: nom
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => { // CORRIGÉ: number
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.product.id === productId);
        if (!itemToUpdate) return prevItems; // Sécurité: item non trouvé

        // Vérifier le stock avant la mise à jour
        if (quantity > itemToUpdate.product.quantiteStock) {
            toast({
                 title: "Stock limit reached",
                 description: `Cannot set quantity of ${itemToUpdate.product.nom} to ${quantity}. Only ${itemToUpdate.product.quantiteStock} available.`,
                 variant: "destructive"
            });
             // Optionnel: Mettre à la quantité max possible au lieu de ne rien faire ?
             // return prevItems.map(item => item.product.id === productId ? { ...item, quantity: item.product.quantiteStock } : item);
             return prevItems; // Pour l'instant, on ne change rien si dépassement
         }

        return prevItems.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({ title: "Cart cleared", description: "All items have been removed" });
  };

  // Calculs (inchangés, utilisent product.prix)
  const cartTotal = cartItems.reduce((total, item) => total + item.product.prix * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }} >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};