// services/paiement.ts

import { CartItem , Commande } from "@/types";

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




// fontions : 



// fonctionanlité pour proceder at chekout : 

/**
 * Crée une session de paiement Stripe via le backend.
 * Le backend est responsable de créer la commande (statut PENDING),
 * de vérifier les prix, et de générer la session Stripe.
 * @param items - Le tableau des articles du panier (CartItem[])
 * @returns Une promesse résolue avec un objet contenant l'URL de checkout Stripe.
 *          Ex: { checkoutUrl: "https://checkout.stripe.com/..." }
 * @throws Une erreur si la création de la session échoue côté backend ou API.
 */
export const createCheckoutSession = async (items: CartItem[]): Promise<{ checkoutUrl: string }> => {
    // 1. Préparer les données à envoyer : SEULEMENT ID et quantité.
    //    La sécurité impose que le backend VÉRIFIE les prix depuis la BDD.
    const lineItemsPayload = items.map(item => ({
      productId: item.product.id, // Envoyer l'ID numérique
      quantity: item.quantity,
    }));
  
    // 2. Définir l'endpoint backend (à créer côté Jakarta EE)
    //    Exemple: /api/checkout/create-session
    //    Assurez-vous que le préfixe /api correspond à votre config JAX-RS
    const endpoint = '/checkout/create-session'; // Adaptez si nécessaire
  
    console.log("Sending to backend for checkout:", { items: lineItemsPayload });
  
    // 3. Appeler l'API backend via la méthode POST
    return fetchApi<{ checkoutUrl: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ items: lineItemsPayload }), // Envoyer les données sous une clé "items"
    });
  };



  // ajout pour la verification de session de paiement waa damii jmm3 rassk chwiiya tandiir liik cmt bach tfhm :



  /**
 * Vérifie le statut d'une session Stripe Checkout auprès du backend.
 * Le backend récupère la session Stripe, vérifie le statut de paiement,
 * met à jour la commande et le paiement en BDD si nécessaire.
 * @param sessionId - L'ID de la session Stripe (provenant de l'URL de succès)
 * @returns Une promesse résolue avec les détails de la commande mise à jour,
 *          ou un objet indiquant un statut en attente/erreur.
 *          (Le type exact dépendra de ce que votre endpoint /verify-session retourne)
 * @throws Une erreur si l'appel API échoue.
 */
export const verifyCheckoutSession = async (sessionId: string): Promise<Commande | { message: string; status: string }> => {
  // 1. Définir l'endpoint backend (doit correspondre à CheckoutResource)
  const endpoint = `/checkout/verify-session?session_id=${encodeURIComponent(sessionId)}`;

  console.log("Calling backend to verify session:", sessionId);

  // 2. Appeler l'API backend via la méthode GET
  // Le type de retour <Commande | { message: string; status: string }> est un exemple,
  // adaptez-le à ce que votre backend renvoie réellement en cas de succès et d'attente/erreur.
  return fetchApi<Commande | { message: string; status: string }>(endpoint, {
    method: 'GET', // GET est approprié pour une vérification basée sur un ID
  });
};


