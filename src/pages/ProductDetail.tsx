// src/pages/ProductDetail.tsx 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchProductById, fetchProductsByCategory } from '@/services/Api'; // API réelle
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  Truck,        // Icônes du Code 2
  CreditCard,   // Icônes du Code 2
  RotateCcw,    // Icônes du Code 2
  Shield,       // Icônes du Code 2
  Star          // Pour les étoiles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types'; // Type réel

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Contexte du panier (inchangé)

  // États pour les données (Code 1)
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État quantité (Code 1/2)
  const [quantity, setQuantity] = useState(1);

  // --- Chargement Produit Principal (Code 1 - Inchangé) ---
  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setIsLoading(false);
      return;
    }
    // Vérifier si l'ID est un nombre valide si nécessaire
    if (isNaN(Number(id))) {
       setError("Invalid Product ID format.");
       setIsLoading(false);
       return;
    }

    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);
      setProduct(null);
      setRelatedProducts([]);
      setQuantity(1); // Réinitialiser quantité si on change de produit
      try {
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (err: any) {
        console.error("Failed to load product:", err);
        // Gérer spécifiquement l'erreur 404 (Not Found)
        if (err.message && err.message.includes('404')) {
            setError("Product not found.");
        } else {
            setError(err.message || "Failed to load product details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // --- Chargement Produits Liés (Code 1 - Inchangé, utilise l'ID de catégorie réelle) ---
  useEffect(() => {
    // --- 1. Vérification initiale (avec logs) ---
    if (!product) {
        console.log("Debug Related: Skipping fetch - 'product' is null or undefined.");
        // Si le produit principal disparaît, vider les produits liés
        if (relatedProducts.length > 0) setRelatedProducts([]);
        return;
    }
    if (!product.categorie) {
        console.log("Debug Related: Skipping fetch - 'product.categorie' is missing.", product);
        if (relatedProducts.length > 0) setRelatedProducts([]);
        return;
    }
    if (typeof product.categorie.id === 'undefined') {
        console.log("Debug Related: Skipping fetch - 'product.categorie.id' is undefined.", product.categorie);
        if (relatedProducts.length > 0) setRelatedProducts([]);
        return;
    }

    // Si on arrive ici, les prérequis sont (a priori) remplis
    const categoryId = product.categorie.id;
    const currentProductId = product.id; // Garder l'ID actuel pour la comparaison

    // --- 2. Fonction asynchrone pour charger les données ---
    const loadRelated = async () => {
        console.log(`Debug Related: Starting fetch for categoryId: ${categoryId}`);
        setIsRelatedLoading(true);
        // Réinitialiser explicitement pour éviter d'afficher d'anciens produits liés brièvement
        setRelatedProducts([]);

        try {
            // --- 3. Appel API ---
            const relatedData = await fetchProductsByCategory(categoryId, 5); // Limite à 5

            // --- 4. Log de la réponse BRUTE de l'API ---
            console.log("Debug Related: Raw data received from API:", relatedData);

            // --- 5. Vérification cruciale: est-ce un tableau ? ---
            if (!Array.isArray(relatedData)) {
                 console.error("Debug Related: fetchProductsByCategory did not return an array!", relatedData);
                 // Pas besoin de setRelatedProducts([]) ici car on l'a fait au début
                 return; // Arrêter le traitement ici
            }

            // --- 6. Filtrage et découpage (avec log) ---
            const filteredRelated = relatedData
                // Ajout d'une vérification : s'assurer que p existe et a un id avant de comparer
                .filter(p => p && typeof p.id !== 'undefined' && p.id !== currentProductId)
                .slice(0, 4);

            console.log("Debug Related: Filtered related products to display:", filteredRelated);

            // --- 7. Mise à jour de l'état ---
            setRelatedProducts(filteredRelated);

        } catch (err: any) {
            // --- 8. Log d'erreur amélioré ---
            console.error("Debug Related: Error during fetch or processing related products:", {
                message: err.message,
                stack: err.stack, // Peut aider à tracer l'origine
                errorObject: err     // Log complet de l'erreur
            });
             // L'état est déjà vide (reset au début de loadRelated)
        } finally {
            // --- 9. Fin du chargement ---
            setIsRelatedLoading(false);
            console.log("Debug Related: Fetch process finished.");
        }
    };

    loadRelated();

// --- Dépendance ---
// 'product' est la bonne dépendance ici. Quand le produit principal change, on relance la recherche des produits liés.
}, [product]);

  // --- Gestionnaires Quantité et Panier (Code 1 - Adaptés) ---
  const incrementQuantity = () => {
    // Vérifier product et product.quantiteStock
    if (product && typeof product.quantiteStock === 'number' && quantity < product.quantiteStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Optionnel: Afficher une notification/toast
      console.log(`${quantity} x ${product.nom} added to cart.`);
      // navigate('/cart'); // Ou rediriger vers le panier
    }
  };

  // --- Fonction pour afficher les étoiles (Inspiré du Code 2) ---
  const renderRatingStars = (ratingValue: number | undefined) => {
    if (typeof ratingValue !== 'number' || ratingValue < 0 || ratingValue > 5) {
        return <span className="text-sm text-gray-400">No rating</span>; // Ou null
    }
    const fullStars = Math.floor(ratingValue);
    const halfStar = ratingValue % 1 >= 0.5; // Simple demi-étoile
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
        {/* Pour l'instant, pas de demi-étoile pour simplifier, juste arrondi */}
        {/* {halfStar && <StarHalf key="half" className="w-5 h-5 text-yellow-400 fill-current" />} */}
        {[...Array(emptyStars + (halfStar ? 1 : 0))].map((_, i) => ( // Ajuster les étoiles vides
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" />
        ))}
         <span className="text-gray-600 ml-2 text-sm">({ratingValue.toFixed(1)})</span>
      </div>
    );
  };


  // --- Rendu Conditionnel (Code 1 - Amélioré pour "Not Found") ---
  if (isLoading) {
     return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-grow flex items-center justify-center">Loading product details...</div><Footer /></div>;
  }

  // Gérer l'erreur AVANT de vérifier si product est null
  if (error && error === "Product not found.") {
     return (
       <div className="min-h-screen flex flex-col">
         <Navbar />
         <div className="flex-grow container mx-auto px-4 py-16 text-center">
           <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
           <p className="text-gray-600 mb-8">The product you're looking for (ID: {id}) doesn't exist or has been removed.</p>
           <Button onClick={() => navigate('/products')}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
           </Button>
         </div>
         <div className="mt-auto"><Footer /></div>
       </div>
     );
  }

  // Gérer les autres erreurs
  if (error) {
     return (
         <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h1>
                <p className="text-gray-600 mb-8">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
                 <Button variant="link" onClick={() => navigate('/products')} className="ml-4">
                     Go to Products
                 </Button>
            </div>
            <div className="mt-auto"><Footer /></div>
         </div>
     );
  }

  // Si pas d'erreur mais produit toujours null (ne devrait pas arriver avec la gestion d'erreur ci-dessus)
  if (!product) {
     return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-grow flex items-center justify-center">Product data unavailable.</div><Footer /></div>;
  }

  // --- Rendu Normal (UI Code 2 intégrée avec données Code 1) ---
  const isOutOfStock = typeof product.quantiteStock !== 'number' || product.quantiteStock <= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb / Back Button (Style Code 2) */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-commerce-primary px-0 hover:bg-transparent" // Ajustement style
            onClick={() => navigate(-1)} // Simple retour arrière historique
            // Alternative: lien vers la catégorie
            // onClick={() => navigate(`/products?category=${encodeURIComponent(product.categorie.nom)}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Image (Code 1) */}
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm aspect-square flex items-center justify-center">
            <img
              // Utiliser imageUrl ou une image par défaut
              src={product.imageUrl || '/placeholder-image.png'} // AJOUTER une image par défaut
              alt={product.nom}
              className="w-full h-full object-contain mix-blend-multiply" // 'object-contain' pour voir toute l'image
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }} // Gestion erreur image
            />
          </div>

          {/* Product Info (UI Code 2 + Données Code 1) */}
          <div className="flex flex-col justify-center"> {/* Changé: bg-white p-6 shadow-sm */}
            {/* Badges et Nom */}
            <div className="mb-3">
               {/* Lien vers catégorie */}
              {product.categorie && product.categorie.nom && (
                  <Link to={`/products?category=${encodeURIComponent(product.categorie.nom)}`} className="inline-block mb-2">
                      <Badge variant="outline" className="text-commerce-primary border-commerce-primary hover:bg-commerce-primary/10 cursor-pointer">
                          {product.categorie.nom}
                      </Badge>
                  </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-commerce-dark mb-2">{product.nom}</h1>
              {/* Badges Stock / Featured (Logique Code 1) */}
               <div className="flex items-center gap-2 mt-1">
                    {/* Utiliser isOutOfStock */}
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : product.quantiteStock < 5 ? (
                       <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock ({product.quantiteStock} left)</Badge>
                    ): null }
                    {/* Badge Featured (Code 1) */}
                    {product.featured && (
                        <Badge className="bg-green-100 text-green-800 border border-green-200">Featured</Badge>
                    )}
                </div>
            </div>

            {/* Rating (Fonction renderRatingStars) */}
            <div className="mb-4">
              {renderRatingStars(product.rating)}
            </div>

            {/* Prix (Code 1) */}
            <p className="text-3xl font-bold text-commerce-accent mb-5">
              ${product.prix ? product.prix.toFixed(2) : 'N/A'}
            </p>

            {/* Description (Code 1) */}
            <div className="border-t pt-4 mb-6">
              <p className="text-gray-700 leading-relaxed">{product.description || "No description available."}</p>
            </div>

            {/* Quantity Selector (Style Code 2, logique Code 1) */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 mr-4 font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1 || isOutOfStock} // Désactiver si hors stock
                  className="h-9 w-9 rounded-r-none text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center font-medium text-gray-800">{quantity}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  // Désactiver si quantité max atteinte ou hors stock
                  disabled={isOutOfStock || (typeof product.quantiteStock === 'number' && quantity >= product.quantiteStock)}
                  className="h-9 w-9 rounded-l-none text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            {/* Affichage de la quantité en stock */}
{!isOutOfStock && typeof product.quantiteStock === 'number' && (
  <div className="ml-4">
    <span className="text-sm text-green-600">
      In stock: {product.quantiteStock}
    </span>
    {product.quantiteStock < 10 && (
      <span className="text-sm text-yellow-600 ml-2">
        (Only {product.quantiteStock} left!)
      </span>
    )}
  </div>
)}
            </div>

            {/* Add to Cart Button (Logique Code 1) */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock} // Utiliser isOutOfStock
              size="lg"
              className="w-full bg-commerce-primary hover:bg-commerce-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Additional Info (UI du Code 2) */}
            <div className="border-t mt-8 pt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Why Shop With Us?</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                    <Truck className="h-5 w-5 text-commerce-primary mr-2 flex-shrink-0" />
                    <span>Fast Shipping Options</span>
                    </div>
                    <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-commerce-primary mr-2 flex-shrink-0" />
                    <span>Secure Payments</span>
                    </div>
                    <div className="flex items-center">
                    <RotateCcw className="h-5 w-5 text-commerce-primary mr-2 flex-shrink-0" />
                    <span>Easy Returns Policy</span>
                    </div>
                    <div className="flex items-center">
                    <Shield className="h-5 w-5 text-commerce-primary mr-2 flex-shrink-0" />
                    <span>Quality Guarantee</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Related Products (Logique Code 1) */}
        {(relatedProducts.length > 0 || isRelatedLoading) && ( // Afficher la section même pendant le chargement
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-commerce-dark mb-6">You Might Also Like</h2>
            {isRelatedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                     {/* Squelettes de chargement */}
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <div className="bg-gray-200 h-40 rounded mb-3"></div>
                            <div className="bg-gray-200 h-5 w-3/4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : relatedProducts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map(relatedProduct => (
                         // Utiliser Link ici aussi pour la navigation
                        <Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`}>
                            <ProductCard product={relatedProduct} />
                        </Link>
                    ))}
                </div>
            ) : (
                 // Optionnel: message si aucun produit lié trouvé après chargement
                 // <p className="text-gray-500">No related products found for this category.</p>
                 null // Ou ne rien afficher
            )}
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