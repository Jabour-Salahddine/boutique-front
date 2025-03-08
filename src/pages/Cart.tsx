
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
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
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-medium text-gray-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Total</div>
                </div>
                
                {/* Cart Items */}
                <div className="space-y-4 divide-y">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex items-center">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <Link 
                            to={`/product/${item.product.id}`}
                            className="font-medium text-commerce-primary hover:underline line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
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
                        ${item.product.price.toFixed(2)}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 rounded-none"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-8 text-center text-sm">{item.quantity}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="h-8 w-8 rounded-none"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-2 text-right md:text-center font-medium">
                        <span className="md:hidden text-gray-500 mr-2">Total:</span>
                        ${(item.product.price * item.quantity).toFixed(2)}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="hidden md:inline-flex ml-4 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex justify-between items-center pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/products')}
                    className="text-commerce-primary border-commerce-primary hover:bg-commerce-primary hover:text-white"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-commerce-primary mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartTotal >= 50 ? (
                        <span className="text-commerce-accent">Free</span>
                      ) : (
                        `$${(10).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  {/* Promo Code */}
                  <div className="py-3">
                    <label htmlFor="promo" className="block text-sm font-medium text-gray-700 mb-1">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input id="promo" placeholder="Enter code" />
                      <Button variant="outline" className="flex-shrink-0">Apply</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg text-commerce-primary">
                      ${(cartTotal >= 50 ? cartTotal : cartTotal + 10).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-commerce-primary hover:bg-commerce-dark" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>Free shipping on orders over $50</p>
                  <p className="mt-1">Secure payment processing</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-commerce-primary hover:bg-commerce-dark"
                size="lg"
              >
                Start Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
