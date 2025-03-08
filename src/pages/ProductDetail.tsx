
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductById } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  Shield 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const product = getProductById(id || '');
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  // Get related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-600 hover:text-commerce-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
          
          {/* Product Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-commerce-primary text-white">
                  {product.category}
                </Badge>
                {product.stock < 5 && product.stock > 0 && (
                  <Badge className="bg-commerce-warning text-white">
                    Low Stock
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge className="bg-commerce-danger text-white">
                    Out of Stock
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-commerce-primary">{product.name}</h1>
              
              <div className="flex items-center mt-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-600 ml-2">({product.rating})</span>
                </div>
              </div>
              
              <p className="text-3xl font-bold text-commerce-accent mb-4">
                ${product.price.toFixed(2)}
              </p>
              
              <div className="border-t border-b py-4 my-4">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="text-gray-700 mr-4">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-12 text-center">{quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="h-9 w-9 rounded-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-500 ml-4">
                  {product.stock} available
                </span>
              </div>
              
              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="lg"
                className="w-full bg-commerce-primary hover:bg-commerce-dark transition-colors"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-commerce-primary mr-2" />
                  <span className="text-sm text-gray-600">Free shipping over $50</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-commerce-primary mr-2" />
                  <span className="text-sm text-gray-600">Secure payment</span>
                </div>
                <div className="flex items-center">
                  <RotateCcw className="h-5 w-5 text-commerce-primary mr-2" />
                  <span className="text-sm text-gray-600">30-day returns</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-commerce-primary mr-2" />
                  <span className="text-sm text-gray-600">Warranty included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-commerce-primary mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;
