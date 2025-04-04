// src/components/ProductCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
// Assurez-vous que le type Product importé est bien celui de '@/types' mis à jour
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; // Assurez-vous que le chemin est correct
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  // Accepte un objet Product (qui peut être null/undefined si le parent le passe ainsi avant chargement)
  product: Product | null | undefined;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  // Sécurité : Si le produit n'est pas fourni, ne rien rendre ou rendre un placeholder
  if (!product) {
    // Vous pouvez retourner un spinner léger ou null
    return null; // Ou <Card><CardContent>...</CardContent></Card>;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // product est garanti d'être défini ici
    addToCart(product);
  };

  // Vérifier si le prix est un nombre avant d'appeler toFixed
  const displayPrice = typeof product.prix === 'number'
    ? `$${product.prix.toFixed(2)}`
    : 'N/A'; // Fallback si le prix n'est pas valide

  // Vérifier si rating existe
  const hasRating = typeof product.rating === 'number';

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group animate-fade-in">
      {/* Utiliser product.id pour le lien - OK */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.quantiteStock < 5 && product.quantiteStock > 0 && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded">
              Low Stock
            </Badge>
          )}
          {/* CORRIGÉ: quantiteStock */}
          {product.quantiteStock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
          {/* Utiliser product.featured - OK */}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
              Featured
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Utiliser product.nom - CORRIGÉ */}
          <h3 className="font-semibold text-lg line-clamp-1">{product.nom}</h3>
          {/* Utiliser product.description - OK */}
          <p className="text-gray-500 text-sm line-clamp-2 mt-1 h-10">{product.description}</p> {/* Fixed height for description */}

          {/* Affichage Rating - OK (vérifie hasRating) */}
          {hasRating && (
             <div className="flex items-center mt-3">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${ i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300' }`} fill="currentColor" viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                {/* Utiliser product.rating - OK (ajout de ! car vérifié par hasRating) */}
                <span className="text-gray-600 text-sm ml-1">({product.rating!.toFixed(1)})</span>
             </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Utiliser displayPrice qui contient la vérification - CORRIGÉ */}
          <span className="text-commerce-primary font-bold">{displayPrice}</span>
          <Button
            onClick={handleAddToCart}
            disabled={product.quantiteStock === 0} // CORRIGÉ: quantiteStock
            variant="secondary"
            size="sm"
            className="group-hover:bg-commerce-primary group-hover:text-white transition-colors"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;