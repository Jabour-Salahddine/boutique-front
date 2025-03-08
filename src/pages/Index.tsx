
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, categories } from '@/data/products';

const Index = () => {
  const featuredProducts = getFeaturedProducts();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-commerce-primary to-commerce-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in">
                Shop Smarter, <br /> Live Better
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-lg animate-slide-up">
                Discover premium products at competitive prices. Your one-stop destination for all your shopping needs.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up">
                <Link to="/products">
                  <Button size="lg" className="bg-commerce-accent hover:bg-commerce-accent/90 text-white">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-commerce-primary">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                alt="Shopping" 
                className="rounded-lg shadow-2xl w-full animate-fade-in"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-commerce-primary">Featured Products</h2>
            <Link to="/products" className="text-commerce-primary hover:text-commerce-accent transition-colors flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-commerce-primary mb-8 text-center">Shop by Category</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <Link 
                key={category}
                to={`/categories/${category.toLowerCase()}`}
                className="group block bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video flex items-center justify-center p-8 bg-gradient-to-br from-commerce-primary/10 to-commerce-primary/30 group-hover:from-commerce-primary/20 group-hover:to-commerce-primary/40 transition-all">
                  <h3 className="text-xl font-semibold text-commerce-primary group-hover:text-commerce-dark transition-colors">
                    {category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-commerce-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Create an account today and get 10% off your first order. Join thousands of satisfied customers.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-commerce-accent hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
