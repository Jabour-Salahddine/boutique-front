import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
// Les imports de données statiques sont bien supprimés, on garde les imports API
import { fetchFeaturedProducts, fetchCategories } from '@/services/Api'; // Importer les fonctions API
import type { Product, Category } from '@/types'; // Importer les types

const Index = () => {
  // États pour les données, le chargement et les erreurs (CONSERVÉ DU CODE 1)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effet pour charger les données au montage (CONSERVÉ DU CODE 1)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Charger les produits "featured" et les catégories en parallèle
        const [productsData, categoriesData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchCategories()
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error("Failed to load index data:", err);
        setError(err.message || "Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Le tableau vide assure l'exécution une seule fois

  // --- Rendu conditionnel (CONSERVÉ DU CODE 1) ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          {/* Vous pouvez mettre un spinner ici */}
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
     return (
       <div className="min-h-screen flex flex-col">
         <Navbar />
         <div className="flex-grow container mx-auto px-4 py-8 text-center">
            <h2 className="text-xl text-red-600">Error loading page</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
         </div>
         <Footer />
       </div>
     );
  }

  // --- Rendu normal (avec les données chargées) ---
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section (CONTENU INTÉGRÉ DU CODE 2, LIENS ADAPTÉS AU CODE 1) */}
      <section className="bg-gradient-to-r from-commerce-primary to-commerce-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              {/* Texte et style du Code 2 */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in">
                Shop Smarter, <br /> Live Better
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-lg animate-slide-up">
                Discover premium products at competitive prices. Your one-stop destination for all your shopping needs.
              </p>
              {/* Boutons avec style du Code 2 mais liens du Code 1 */}
              <div className="flex flex-wrap gap-4 animate-slide-up">
                <Link to="/products"> {/* Lien conservé du Code 1 */}
                  <Button size="lg" className="bg-commerce-accent hover:bg-commerce-accent/90 text-white">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products"> {/* Lien conservé du Code 1 */}
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-commerce-primary">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              {/* Image et style du Code 2 */}
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                alt="Shopping"
                className="rounded-lg shadow-2xl w-full animate-fade-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Utilise l'état `featuredProducts` (LOGIQUE CONSERVÉE DU CODE 1) */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-commerce-primary">Featured Products</h2>
            <Link to="/products" className="text-commerce-primary hover:text-commerce-accent transition-colors flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Utilisation des données réelles fetchées */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Utilise les données de l'état (venu du fetch API) */}
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <p className="text-center text-gray-500">No featured products available at the moment.</p>
          )}
        </div>
      </section>

      {/* Categories - Utilise l'état `categories` (LOGIQUE CONSERVÉE DU CODE 1) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-commerce-primary mb-8 text-center">Shop by Category</h2>

          {/* Utilisation des données réelles fetchées */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Utilise les données de l'état (venu du fetch API) */}
              {/* La structure du lien est celle du Code 1, adaptée aux données réelles (objets avec id/nom) */}
              {categories.map(category => (
                <Link
                  key={category.id} // Clé basée sur l'ID réel
                  // Le lien pointe vers /products avec un paramètre de catégorie (logique du Code 1)
                  to={`/products?category=${encodeURIComponent(category.nom)}`}
                  className="group block bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow" // Style visuel
                >
                  <div className="aspect-video flex items-center justify-center p-8 bg-gradient-to-br from-commerce-primary/10 to-commerce-primary/30 group-hover:from-commerce-primary/20 group-hover:to-commerce-primary/40 transition-all">
                    <h3 className="text-xl font-semibold text-commerce-primary group-hover:text-commerce-dark transition-colors">
                      {category.nom} {/* Affiche le nom réel de la catégorie */}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
           ) : (
             <p className="text-center text-gray-500">No categories found.</p>
           )}
        </div>
      </section>

      {/* CTA Section (CONTENU INTÉGRÉ DU CODE 2) */}
      <section className="py-16 bg-commerce-accent text-white">
         <div className="container mx-auto px-4 text-center">
          {/* Contenu et style du Code 2 */}
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Create an account today and get 10% off your first order. Join thousands of satisfied customers.
          </p>
          <Link to="/register"> {/* Lien du Code 2 */}
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