// src/services/Api.ts
import type { Product, Category, User, /*ProductPayload*/ } from '@/types'; // Assurez-vous que le chemin est correct

const API_BASE_URL = 'http://localhost:8080/boutique_war/api'; // Vérifiez que c'est toujours correct

// La fonction fetchApi reste la même...
async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken'); // Récupérer le token si nécessaire

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Ajouter le token d'authentification s'il existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    let responseData: T;
    const contentType = response.headers.get("content-type");

    if (response.status === 204) { // Handle No Content responses
      return undefined as T; // Ou une valeur appropriée comme null ou un objet vide
    }

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      // Pour les erreurs non-JSON ou réponses texte
      const textResponse = await response.text();
      // Si la réponse n'est pas OK, on lance une erreur avec le texte
      if (!response.ok) {
        throw new Error(textResponse || response.statusText);
      }
      // Si la réponse est OK mais pas JSON (improbable pour une API REST typique)
      // On peut retourner le texte ou une structure d'erreur/succès simple
      // Ici, on suppose que si c'est OK, ça devrait être du JSON ou vide (204 traité au-dessus)
      // Donc, on peut considérer cela comme une erreur de format si on attendait du JSON.
      console.warn("Received non-JSON response:", textResponse);
      // Retourner quelque chose ou lancer une erreur selon la logique attendue
      // Pour cet exemple, on retourne undefined car on ne sait pas quoi faire du texte
      return undefined as T;

    }

    if (!response.ok) {
      // Si responseData a une propriété 'error' ou 'message', utilisez-la
      const errorMessage = (responseData as any)?.message || (responseData as any)?.error || `HTTP error! status: ${response.status}`;
      console.error('API Error Response:', responseData);
      throw new Error(errorMessage);
    }

    return responseData;

  } catch (error) {
    console.error('API call failed:', error);
    // Assurez-vous que l'erreur propagée a un message utile
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

// --- Fonctions spécifiques aux Endpoints ---

// LOGIN (inchangée)
export const loginUser = async (email: string, password: string): Promise<{ token: string }> => {
  const credentials = { email, motDePasse: password };
  // On spécifie le type de retour attendu
  return fetchApi<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// --- NOUVELLES FONCTIONS PRODUITS/CATEGORIES ---

/**
 * Récupère tous les produits depuis le backend.
 * @returns Une promesse résolue avec un tableau de produits.
 */
export const fetchAllProducts = async (): Promise<Product[]> => {
  // Assurez-vous que l'endpoint '/produits' existe dans votre ProduitResource
  return fetchApi<Product[]>('/produits');
};

/**
 * Récupère les produits "featured" depuis le backend.
 * @returns Une promesse résolue avec un tableau de produits "featured".
 */
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  // Endpoint hypothétique '/produits/featured'
  // Adaptez si votre endpoint est différent (ex: /produits?featured=true)
  return fetchApi<Product[]>('/produits/featured');
};

/**
 * Récupère un produit spécifique par son ID.
 * @param id - L'ID du produit.
 * @returns Une promesse résolue avec l'objet produit.
 */
export const fetchProductById = async (id: string | number): Promise<Product> => {
  return fetchApi<Product>(`/produits/${id}`);
};

/**
 * Récupère toutes les catégories depuis le backend.
 * @returns Une promesse résolue avec un tableau de catégories.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  // Assurez-vous que l'endpoint '/categories' existe dans une CategorieResource
  return fetchApi<Category[]>('/categories');
};

/**
 * Récupère les produits d'une catégorie spécifique (optionnel, pour optimiser "Related Products")
 * @param categoryId L'ID de la catégorie
 * @param limit Nombre maximum de produits à retourner
 * @returns Une promesse résolue avec un tableau de produits.
 */
export const fetchProductsByCategory = async (categoryId: number | string, limit?: number): Promise<Product[]> => {
  let endpoint = `/produits?categoryId=${categoryId}`; // Assurez-vous que votre API supporte ce paramètre
  if (limit) {
    endpoint += `&limit=${limit}`; // Si l'API supporte une limite
  }
  return fetchApi<Product[]>(endpoint);
};

export const getUserProfile = async (token: string): Promise<User> => {

  const response = await fetch('http://localhost:8080/boutique_war/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Token JWT pour l'authentification
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return response.json(); // Retourne les informations de l'utilisateur
};

// Ajoutez ici d'autres fonctions API si nécessaire...


export const registerUser = async (
  nom: string,
  prenom: string,
  email: string,
  telephone: string,
  password: string
): Promise<{ token: string }> => {
  const response = await fetch('http://localhost:8080/boutique_war/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nom,
      prenom,         // Ajout du prénom
      email,
      telephone,       // Ajout du téléphone
      motDePasse: password,
      role:"CLIENT"
      // Correspond au champ du backend
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json(); // Doit retourner { token: string }
};
export const loginAdmin = async (email: string, password: string): Promise<{ token: string }> => {
  const credentials = { email, motDePasse: password };
  // On spécifie le type de retour attendu
  return fetchApi<{ token: string }>('/auth/login/admin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// --- NOUVELLES FONCTIONS POUR LA GESTION DES PRODUITS (CRUD) ---





/**
 * Récupère tous les produits depuis le backend (pour l'admin).
 * @returns Une promesse résolue avec un tableau de produits.
 */
export const getProducts = async (token: string): Promise<Product[]> => {
  return fetchApi<Product[]>('/produits');
};

/**
 * Crée un nouveau produit.
 * @param productData - Les données du produit à créer.
 * @returns Une promesse résolue avec le produit créé.
 */
export const createProduct = async (productData: Omit<Product, 'id'>, token: string): Promise<Product> => {
  return fetchApi<Product>('/produits', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

/**
 * Met à jour un produit existant.
 * @param id - L'ID du produit à mettre à jour.
 * @param productData - Les nouvelles données du produit.
 * @returns Une promesse résolue avec le produit mis à jour.
 */
export const updateProduct = async (id: string | number, productData: Omit<Product, 'id'> & { id?: string | number }, token: string): Promise<Product> => {
  return fetchApi<Product>(`/produits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

/**
 * Supprime un produit.
 * @param id - L'ID du produit à supprimer.
 * @returns Une promesse résolue (généralement sans contenu, donc void ou undefined).
 */
export const deleteProduct = async (id: string | number, token: string): Promise<void> => {
  return fetchApi<void>(`/produits/${id}`, {
    method: 'DELETE',
  });
};

// --- NOUVELLES FONCTIONS POUR LA GESTION DES CLIENTS (AVEC LE NOMBRE DE COMMANDES) ---

/**
 * Récupère la liste des clients avec le nombre de commandes associées.
 * @param token - Le token d'authentification.
 * @returns Une promesse résolue avec un tableau d'objets contenant les informations du client et le nombre de commandes.
 */
export const getClientsWithOrderCount = async (token: string): Promise<
  { clientId: string | number; clientName: string; clientEmail: string; orderCount: number }[]
> => {
  return fetchApi<
    { clientId: string | number; clientName: string; clientEmail: string; orderCount: number }[]
  >('/clients/with-order-count'); // Assurez-vous que cet endpoint existe dans votre backend
};




