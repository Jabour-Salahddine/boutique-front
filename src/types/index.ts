
/*
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
*/


          

// src/types/index.ts    : changement pour faire la cnx avec le backend

// NOUVELLE Interface pour les catégories (correspond à Categorie.java)
export interface Category {
  id: number;       // Correspond à Long ID
  nom: string;      // Correspond à String nom
  description?: string; // Correspond à String description (optionnel)
}

// Interface Produit MISE À JOUR
export interface Product {
  id: number;           // Correspond à Long id (transmis comme number)
  nom: string;          // Correspond à String nom
  description: string;  // Correspond à String description
  prix: number;         // Correspond à BigDecimal prix (transmis comme number)
  quantiteStock: number;// Correspond à int quantiteStock
  imageUrl: string;     // Correspond à String imageUrl (RENOMMÉ de 'image')
  rating?: number;      // Correspond à BigDecimal rating (optionnel, transmis comme number)
  featured: boolean;    // Correspond à boolean featured
  categorie: Category;  // Correspond à l'objet Categorie imbriqué (MODIFIÉ de 'string')
  // avis?: any[]; // Décommentez si vous gérez les avis et définissez une interface Avis
}

// Interface CartItem (utilise Product, donc mise à jour implicitement)
// Vous pouvez la garder telle quelle SI elle utilise la nouvelle interface Product.
// Si elle stockait des champs spécifiques, vérifiez la compatibilité.
export interface CartItem {
  product: Product; // Assurez-vous que c'est bien la NOUVELLE interface Product
  quantity: number;
}

// Interface User (vérifiez la cohérence avec le contenu de votre JWT)
// Ce que nous avons mis dans le token : 'sub' (email), 'roles' (List<String>)
// Ce que AuthContext essaie d'extraire : 'sub', 'userId', 'role', 'name'
// Adaptons pour mieux correspondre au token actuel :
export interface User {
  // id?: string | number; // L'ID n'est PAS dans le token actuel, rendez-le optionnel ou supprimez
  email: string;         // Provient de la claim 'sub' du JWT
  name?: string;         // Le nom n'est PAS dans le token actuel, rendez-le optionnel
  roles: string[];       // Provient de la claim 'roles' (une liste/set de strings)
}
// Note : Vous devrez peut-être adapter AuthContext pour gérer `roles: string[]` au lieu de `role: string`

// Interface Order (pas directement affectée pour l'instant)
export interface Order {
  id: string; // Ou number selon votre backend
  userId: string; // Ou number
  items: CartItem[]; // Utilise CartItem, qui utilise Product (indirectement affecté)
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered'; // Ou les statuts de votre backend
  createdAt: string; // Ou Date
}