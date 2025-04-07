// src/pages/OrderSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { verifyCheckoutSession } from '@/services/paiementApi'; // Importer la nouvelle fonction
import type { Commande } from '@/types'; // Assurez-vous que ce type existe et est correct
import { useToast } from '@/hooks/use-toast';

// Définir une interface pour le retour possible de l'API verify
// (Adaptez si votre backend retourne autre chose)
type VerificationResult = Commande | { message: string; status: string };

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart(); // Pour vider le panier après succès
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Commande | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour vérifier la session
    const verifySession = async (id: string) => {
      setIsLoading(true);
      setError(null);
      setOrder(null);
      setVerificationMessage(null);

      try {
        const result: VerificationResult = await verifyCheckoutSession(id);

        // Analyser le résultat de l'API backend
        if (typeof result === 'object' && result !== null && 'id' in result && 'statut' in result) {
            // C'est probablement une Commande valide
            const confirmedOrder = result as Commande;
            // Vérifier le statut retourné par le backend (il DOIT avoir mis à jour la BDD)
            if (confirmedOrder.statut === 'PAID' || confirmedOrder.statut === 'PROCESSING') { // Adaptez les statuts si nécessaire
                setOrder(confirmedOrder);
                console.log("Order confirmed:", confirmedOrder);
                clearCart(); // Vider le panier seulement si le paiement est confirmé par NOTRE backend
                toast({ title: "Payment Successful!", description: "Your order has been confirmed." });
            } else {
                 // Le backend a retourné une commande mais le statut n'est pas 'PAID'/'PROCESSING'
                 console.warn("Order status is not PAID/PROCESSING:", confirmedOrder.statut);
                 setError(`Order status: ${confirmedOrder.statut}. Please contact support if payment was made.`);
                 setVerificationMessage(`Order found, but status is ${confirmedOrder.statut}.`);
            }
        } else if (typeof result === 'object' && result !== null && 'message' in result) {
            // Le backend a retourné un message (ex: paiement en attente)
            console.log("Verification result message:", result.message);
            setVerificationMessage(result.message); // Afficher le message
            setError("Payment verification is pending or encountered an issue."); // Message d'erreur générique
        }
         else {
            // Réponse inattendue du backend
            throw new Error('Invalid response received from verification endpoint.');
        }

      } catch (err: any) {
        console.error("Failed to verify checkout session:", err);
        setError(err.message || "Failed to verify your payment. Please contact support.");
        toast({ title: "Verification Error", description: err.message || "Could not verify payment.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (!sessionId) {
      console.error("No session_id found in URL.");
      setError("Payment session information is missing.");
      setIsLoading(false);
      // Optionnel : rediriger vers la page d'accueil ou une page d'erreur
      // return <Navigate to="/" replace />;
    } else {
      // Appeler la vérification seulement si sessionId existe
      verifySession(sessionId);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, clearCart, toast]); // Dépend de sessionId, clearCart, toast


  // --- Rendu conditionnel ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-commerce-primary mb-4" />
          <h1 className="text-2xl font-semibold text-gray-700">Verifying your payment...</h1>
          <p className="text-gray-500 mt-2">Please wait while we confirm your order.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-16 text-center">
        {order && ( // Affichage si succès et commande confirmée
          <>
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-4">Thank you for your purchase.</p>
            <p className="text-gray-500 mb-8">
              Your Order ID is: <strong className="text-gray-700">{order.id}</strong>.
              You will receive an email confirmation shortly.
            </p>
            {/* Afficher d'autres détails de 'order' si nécessaire */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/orders"> {/* Lien vers l'historique des commandes (page à créer) */}
                <Button variant="outline" className="w-full sm:w-auto">View My Orders</Button>
              </Link>
              <Link to="/">
                <Button className="w-full sm:w-auto bg-commerce-primary hover:bg-commerce-dark">Continue Shopping</Button>
              </Link>
            </div>
          </>
        )}

        {error && ( // Affichage si erreur
          <>
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Verification Failed</h1>
            <p className="text-lg text-red-600 mb-8">{error}</p>
            {verificationMessage && <p className="text-gray-500 mb-8">{verificationMessage}</p>}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/contact"> {/* Lien vers le support */}
                 <Button variant="outline" className="w-full sm:w-auto">Contact Support</Button>
               </Link>
               <Link to="/cart">
                 <Button className="w-full sm:w-auto bg-commerce-primary hover:bg-commerce-dark">Return to Cart</Button>
               </Link>
            </div>
          </>
        )}

         {!isLoading && !order && !error && verificationMessage && ( // Cas où paiement en attente ou autre message
            <>
              <ShoppingBag className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-3">Order Status</h1>
              <p className="text-lg text-gray-600 mb-8">{verificationMessage}</p>
               <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                   <Link to="/orders">
                     <Button variant="outline" className="w-full sm:w-auto">Check My Orders</Button>
                   </Link>
                  <Link to="/">
                     <Button className="w-full sm:w-auto bg-commerce-primary hover:bg-commerce-dark">Continue Shopping</Button>
                   </Link>
               </div>
            </>
          )}

      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;