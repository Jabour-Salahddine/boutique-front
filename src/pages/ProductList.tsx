// src/pages/ProductList.tsx (ou chemin équivalent)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // Ajout de Link et useNavigate
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { fetchAllProducts, fetchCategories } from '@/services/Api'; // API réelle
import type { Product, Category } from '@/types'; // Types réels
import { Search, SlidersHorizontal, X } from 'lucide-react';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Pour la navigation et potentiellement pour nettoyer les params URL
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  // États des données (Code 1)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // États des filtres (Code 1, initialisation adaptée)
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    categoryParam ? [decodeURIComponent(categoryParam)] : [] // Décoder au cas où
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]); // Valeur initiale large
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000); // Sera mis à jour après fetch
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');

  // État pour l'affichage mobile des filtres (Code 2)
  const [showFilters, setShowFilters] = useState(false);

  // États de chargement/erreur (Code 1)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Chargement initial des données (Code 1 - Inchangé) ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchAllProducts(),
          fetchCategories()
        ]);

        setAllProducts(productsData);
        // Ne pas définir filteredProducts ici, le filtre s'appliquera via useEffect

        setCategories(categoriesData);

        if (productsData.length > 0) {
          const prices = productsData.map(p => p.prix);
          const min = Math.floor(Math.min(...prices)); // Utiliser Math.floor pour des entiers
          const max = Math.ceil(Math.max(...prices));   // Utiliser Math.ceil pour des entiers
          setMinPrice(min);
          setMaxPrice(max);
          // Mettre à jour la valeur initiale de priceRange SEULEMENT si elle n'a pas été modifiée par l'utilisateur entre temps
          // Si les filtres sont déjà actifs (ex: via URL), on ne veut pas écraser le range
          if (selectedCategoryNames.length === 0 && !searchTerm) { // Condition simple pour réinitialiser
             setPriceRange([min, max]);
          }
        } else {
             setMinPrice(0);
             setMaxPrice(2000);
             setPriceRange([0, 2000]);
        }

      } catch (err: any) {
        console.error("Failed to load product list data:", err);
        setError(err.message || "Failed to load products. Please try again later.");
        setAllProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois

   // --- Mise à jour des filtres depuis l'URL (Code 1 - Amélioré) ---
   useEffect(() => {
       const currentCategoryParam = searchParams.get('category');
       const currentSearchQuery = searchParams.get('q');

       // Gérer le paramètre de catégorie
       const newSelectedCategories = currentCategoryParam ? [decodeURIComponent(currentCategoryParam)] : [];
       // Mettre à jour seulement si différent pour éviter boucle infinie potentielle
       if (JSON.stringify(newSelectedCategories) !== JSON.stringify(selectedCategoryNames)) {
           setSelectedCategoryNames(newSelectedCategories);
       }

       // Gérer le paramètre de recherche
       const newSearchTerm = currentSearchQuery || '';
       if (newSearchTerm !== searchTerm) {
           setSearchTerm(newSearchTerm);
       }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchParams]); // Dépend seulement de searchParams

  // --- Logique de Filtrage (Code 1 - Inchangée, déjà correcte) ---
  const filterProducts = useCallback(() => {
    if (isLoading || !allProducts) return; // Attendre chargement et données

    let result = [...allProducts];

    // Filtrer par catégorie (nom)
    if (selectedCategoryNames.length > 0) {
      result = result.filter(product =>
        product.categorie && selectedCategoryNames.includes(product.categorie.nom)
      );
    }

    // Filtrer par prix
    result = result.filter(
      product => product.prix >= priceRange[0] && product.prix <= priceRange[1]
    );

    // Filtrer par terme de recherche
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        product =>
          product.nom.toLowerCase().includes(lowercaseSearchTerm) ||
          (product.description && product.description.toLowerCase().includes(lowercaseSearchTerm))
      );
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategoryNames, priceRange, searchTerm, isLoading]);

  // Appliquer le filtre quand les dépendances changent
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);


  // --- Gestionnaires d'événements (Code 1 - Inchangés, sauf clearFilters) ---
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategoryNames(prev => {
      const newSelection = prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName];

      // Optionnel : Mettre à jour l'URL sans recharger la page
      // const params = new URLSearchParams(searchParams);
      // if (newSelection.length > 0) {
      //    params.set('category', encodeURIComponent(newSelection[0])); // Exemple simple : prend la première
      // } else {
      //    params.delete('category');
      // }
      // navigate(`?${params.toString()}`, { replace: true });

      return newSelection;
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Le filtrage est déclenché par useEffect sur searchTerm.
    // Mettre à jour l'URL si on veut que la recherche soit partageable
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
        params.set('q', searchTerm);
    } else {
        params.delete('q');
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setSelectedCategoryNames([]);
    setPriceRange([minPrice, maxPrice]); // Réinitialiser avec les vrais min/max
    setSearchTerm('');
    setShowFilters(false); // Fermer les filtres mobiles
    // Nettoyer l'URL
    navigate('/products', { replace: true });
  };

  // --- Rendu ---
  if (isLoading) {
     return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-grow flex items-center justify-center">Loading products...</div><Footer /></div>;
  }

  if (error) {
     return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-grow flex flex-col items-center justify-center"><h2 className="text-xl text-red-600">Error loading products</h2><p className="text-gray-600 mb-4">{error}</p><Button onClick={() => window.location.reload()}>Try Again</Button></div><Footer /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filters Button (UI du Code 2) */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-commerce-primary">
              {searchQuery ? `Search: "${searchQuery}"` : categoryParam ? `Category: ${decodeURIComponent(categoryParam)}` : 'All Products'}
            </h1>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filters Sidebar (UI du Code 2 intégrée avec logique Code 1) */}
          <div
            className={`lg:w-1/4 ${
              showFilters ? 'block' : 'hidden'
            } lg:block bg-white p-4 rounded-lg shadow-sm h-fit sticky top-24 border lg:border-0`} // Ajout bordure pour visibilité mobile/debug
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {/* Bouton Clear All (Style Code 2, fonction Code 1) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-commerce-primary hover:text-commerce-accent"
              >
                Clear All
              </Button>
              {/* Bouton Close Mobile (Style Code 2) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search (UI Code 2, logique Code 1) */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Search</h3>
              {/* Utiliser onSubmit pour la soumission explicite (ex: touche Entrée) */}
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                {/* Icône dans l'input (Style Code 2) */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 w-full" // Padding pour l'icône
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour directe pour filtrage live
                  />
                </div>
                 {/* Optionnel: Bouton de recherche explicite si pas de filtrage live */}
                 {/* <Button type="submit" size="icon" className="ml-2"><Search className="h-4 w-4"/></Button> */}
              </form>
            </div>

            {/* Categories (Logique Code 1, données réelles) */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Categories</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Ajout scroll si beaucoup de catégories */}
                {categories.length > 0 ? categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategoryNames.includes(category.nom)}
                      onCheckedChange={() => handleCategoryChange(category.nom)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.nom}
                    </Label>
                  </div>
                )) : <p className="text-sm text-gray-500">No categories loaded.</p>}
              </div>
            </div>

            {/* Price Range (Logique Code 1, données réelles) */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Price Range</h3>
              {allProducts.length > 0 ? (
                <div className="px-1"> {/* Ajusté padding */}
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={1} // Pas de 1 pour prix précis
                    value={priceRange}
                    onValueChange={handlePriceChange} // Se déclenche pendant le glissement
                    // onValueCommit={handlePriceChange} // Alternative: se déclenche à la fin du glissement
                    className="mb-4"
                    minStepsBetweenThumbs={1} // Évite que les pouces se superposent
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span> {/* Pas besoin de toFixed ici si step=1 */}
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
          </div>

          {/* Product Grid (Logique Code 1, affichage `filteredProducts`) */}
          <div className="lg:w-3/4">
            {/* Header Desktop (Style Code 2, logique Code 1) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
               <h1 className="text-2xl font-bold text-commerce-primary">
                  {searchQuery ? `Search: "${searchQuery}"` : categoryParam ? `Category: ${decodeURIComponent(categoryParam)}` : 'All Products'}
               </h1>
              <div className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {allProducts.length} products
              </div>
            </div>

            {/* Grille de produits */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  // AJOUT DU LIEN VERS LA PAGE DETAIL
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>
            ) : (
              // Message "No products found" (Style Code 2)
              <div className="text-center py-12 lg:py-24 bg-gray-50 rounded-lg">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
                <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer doit être collé en bas */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ProductList;