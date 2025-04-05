// src/lib/api.ts

// Fonction d'inscription qui envoie les données au backend
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
      prenom,           // Ajout du prénom
      email,
      telephone,        // Ajout du téléphone
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



