import React, { useEffect, useState, Fragment } from 'react';

// --- Contexts ---
// Permet d'accéder aux informations d'authentification (comme le token)
import { useAuth } from '@/contexts/AuthContext';

// --- Services ---
// Fonction pour interroger l'API et récupérer les données du profil
import { getUserProfile } from '@/services/Api';

// --- Components ---
// Composants réutilisables pour la barre de navigation et le pied de page
import Navbar from '@/components/Navbar';
// IMPORTANT: Vérifiez ce chemin. Si votre Footer est un composant local,
// il devrait être dans '@/components/Footer' ou un chemin similaire.
// L'import depuis 'react-day-picker' est très inhabituel pour un pied de page général.
import Footer from '@/components/Footer'; // Chemin supposé, à adapter si besoin

// --- Constants ---
// Centralise les textes pour faciliter les modifications et la traduction éventuelle
const LOADING_MESSAGE = "Chargement du profil...";
const ERROR_MESSAGE_FETCH = "Impossible de récupérer le profil.";
const NO_PROFILE_DATA_MESSAGE = "Aucune donnée de profil disponible.";
const AVATAR_API_BASE_URL = "https://ui-avatars.com/api/";

/**
 * ============================================================================
 * Composant Profile
 * ============================================================================
 * Affiche les informations détaillées de l'utilisateur actuellement connecté.
 * Il récupère les données via un appel API sécurisé par un token.
 * Gère les états de chargement, d'erreur et l'affichage final des données.
 */
const Profile = () => {
  // --- State ---
  // useState est un Hook React pour gérer l'état local dans les composants fonctionnels.
  const [profile, setProfile] = useState(null); // Stocke les données du profil une fois récupérées
  const [error, setError] = useState('');     // Stocke un message d'erreur en cas de problème
  const [isLoading, setIsLoading] = useState(true); // Indicateur pour savoir si les données sont en cours de chargement

  // --- Context ---
  // useAuth est un Hook personnalisé (probablement) qui retourne le contexte d'authentification.
  const { token } = useAuth(); // Récupère le token nécessaire pour l'appel API

  // --- Effect ---
  // useEffect est un Hook React pour exécuter des effets de bord (appels API, abonnements, etc.).
  useEffect(() => {
    // On ne lance la récupération que si un token est présent.
    if (token) {
      const fetchProfileData = async () => {
        setIsLoading(true); // Indique que le chargement commence
        setError('');       // Réinitialise toute erreur précédente

        try {
          // Appel à la fonction du service API avec le token
          const profileData = await getUserProfile(token);
          setProfile(profileData); // Met à jour l'état avec les données reçues
        } catch (err) {
          // En cas d'échec de l'appel API
          setError(ERROR_MESSAGE_FETCH); // Met à jour l'état d'erreur
          console.error("Erreur lors de la récupération du profil:", err); // Affiche l'erreur technique dans la console pour le débogage
        } finally {
          // Ce bloc s'exécute toujours, que l'appel réussisse ou échoue.
          setIsLoading(false); // Indique que le chargement est terminé
        }
      };

      fetchProfileData(); // Exécute la fonction de récupération
    } else {
      // Si aucun token n'est trouvé (ex: utilisateur déconnecté)
      setIsLoading(false); // Arrête l'indicateur de chargement
      // Optionnel : rediriger vers la page de connexion ou afficher un message
      // setError("Veuillez vous connecter pour voir votre profil.");
    }
    // La dépendance [token] signifie que cet effet se ré-exécutera si la valeur du token change.
  }, [token]);

  // --- Render Logic ---

  // 1. Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* Peut être remplacé par un composant Spinner plus élaboré */}
        <p className="text-gray-500">{LOADING_MESSAGE}</p>
      </div>
    );
  }

  // 2. Affichage en cas d'erreur
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* Peut être remplacé par un composant Alert plus élaboré */}
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  // 3. Affichage si le profil n'a pas été chargé (après chargement réussi mais sans données)
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">{NO_PROFILE_DATA_MESSAGE}</p>
      </div>
    );
  }

  // 4. Affichage principal du profil (cas nominal)

  // Prépare le nom pour l'API d'avatar, avec des valeurs par défaut si vide
  const avatarName = `${profile.prenom || ''}+${profile.nom || 'User'}`;
  // Construit l'URL complète de l'avatar
  const avatarUrl = `${AVATAR_API_BASE_URL}?name=${encodeURIComponent(avatarName)}&background=random&color=fff&bold=true&size=128`;

  return (
    <Fragment> {/* Utilisation de Fragment pour éviter une div inutile au plus haut niveau */}
      <Navbar />

      {/* Conteneur principal de la page */}
      <main className="container mx-auto py-10 px-4 flex flex-col items-center">
        {/* Carte de profil stylisée avec Tailwind CSS */}
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg animate-fade-in transition-all duration-500 ease-out">
          {/* Section supérieure: Avatar, Nom, Rôle */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={avatarUrl}
              alt={`Avatar de ${profile.prenom || ''} ${profile.nom || 'Utilisateur'}`}
              className="w-28 h-28 rounded-full mb-4 shadow-lg border-4 border-gray-100" // Taille et style avatar améliorés
              loading="lazy" // Améliore les performances perçues
            />
            {/* Affichage Nom et Prénom */}
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {profile.prenom || ''} {profile.nom || 'Utilisateur Inconnu'}
            </h1>
            {/* Affichage du rôle avec fallback */}
            <p className="text-indigo-600 font-medium mb-4">{profile.role || 'Rôle non spécifié'}</p>
          </div>

          {/* Séparateur visuel */}
          <hr className="my-6" />

          {/* Section inférieure: Informations détaillées */}
          <div className="space-y-4 text-sm text-gray-700">
            {/* Utilisation du sous-composant pour chaque ligne d'info */}
            <InfoRow label="Prénom" value={profile.prenom} />
            <InfoRow label="Nom" value={profile.nom} />
            <InfoRow label="Email" value={profile.email} type="email" />
            <InfoRow label="Téléphone" value={profile.telephone} type="tel" />
            {/* Ajoutez ici d'autres informations si nécessaire */}
            {/* Exemple: <InfoRow label="Adresse" value={profile.adresse} /> */}
          </div>
        </div>
      </main>

      <Footer />
    </Fragment>
  );
};

/**
 * ============================================================================
 * Sous-composant InfoRow
 * ============================================================================
 * Affiche une ligne formatée "Label: Valeur" pour les détails du profil.
 * Gère l'affichage conditionnel et les liens pour email/téléphone.
 * @param {string} label - Le libellé à afficher (ex: "Email")
 * @param {string | null | undefined} value - La valeur à afficher
 * @param {'text' | 'email' | 'tel'} [type='text'] - Le type de donnée pour un formatage spécial (liens)
 */
const InfoRow = ({ label, value, type = 'text' }) => {
  // N'affiche rien si la valeur est absente ou vide
  if (!value) {
    return null;
  }

  // Fonction interne pour formater la valeur (texte simple ou lien)
  const renderValue = () => {
    switch (type) {
      case 'email':
        return <a href={`mailto:${value}`} className="text-blue-600 hover:underline break-all">{value}</a>;
      case 'tel':
        return <a href={`tel:${value}`} className="text-blue-600 hover:underline">{value}</a>;
      default:
        return <span className="text-gray-900">{value}</span>; // Valeur standard
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
      {/* Label */}
      <span className="font-semibold text-gray-600 w-full sm:w-1/3 mb-1 sm:mb-0">{label} :</span>
      {/* Valeur formatée */}
      <span className="w-full sm:w-2/3 text-left sm:text-right">
        {renderValue()}
      </span>
    </div>
  );
};

export default Profile;