import React, { useEffect, useState } from "react";
import { Product, Category } from "@/types";
import {
  fetchAllProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  fetchCategories,
} from "@/services/Api";

const initialProduct: Omit<Product, "id"> = {
  nom: "",
  description: "",
  prix: 0,
  quantiteStock: 0,
  imageUrl: "",
  rating: 0,
  featured: false,
  categorie: { id: 0, nom: "", description: "" },
};

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id">>({ ...initialProduct });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("authToken") || ""; // Assure-toi d'avoir stocké le token

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const products = await fetchAllProducts();
    const cats = await fetchCategories();
    setProducts(products);
    setCategories(cats);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setForm({ ...product, categorie: product.categorie });
      setEditingId(product.id);
    } else {
      setForm({ ...initialProduct });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ ...initialProduct });
    setEditingId(null);
  };
  
  
  const handleSubmit = async (e: React.FormEvent) => {  // ici 
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, { ...form }, token);
      } else {
        await createProduct({ ...form }, token);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  



  /*
  // correction :

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // --- CORRECTION : Créer un payload simplifié ---
      const productPayload = {
        nom: form.nom,
        description: form.description,
        prix: form.prix,
        quantiteStock: form.quantiteStock,
        imageUrl: form.imageUrl,
        rating: form.rating, // Assurez-vous que rating est bien dans le formulaire ou gérez sa valeur par défaut
        featured: form.featured,
        // Envoyer SEULEMENT l'ID de la catégorie dans un objet imbriqué simple
        // que Jackson peut mapper à la relation @ManyToOne
        categorie: {
          id: form.categorie.id // Important: l'objet categorie doit avoir un id
        }
        // Ne PAS inclure form.categorie.produits ou autres champs de categorie ici
      };
      // --- FIN CORRECTION ---

      if (!productPayload.categorie.id) {
          alert("Please select a category."); // Validation simple
          return;
      }

      console.log("Payload sent to backend:", productPayload); // Pour déboguer le payload

      if (editingId) {
        // Pour l'update, on peut envoyer l'ID du produit en plus si l'API l'attend
        await updateProduct(editingId, productPayload, token);
      } else {
        await createProduct(productPayload, token);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error("Error submitting product:", err); // Log détaillé de l'erreur
      // Afficher une erreur plus user-friendly si possible
      alert("Error saving product. Check console for details.");
    }
  };
  */
//----------------




  const handleDelete = async (id: number) => {
    if (confirm("Confirmer la suppression ?")) {
      await deleteProduct(id, token);
      fetchData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <button
          onClick={() => openModal()}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter un Produit
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-10">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 mb-4"
            >
              <input
                type="text"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Prix"
                value={form.prix}
                onChange={(e) =>
                  setForm({ ...form, prix: parseFloat(e.target.value) })
                }
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Quantité en stock"
                value={form.quantiteStock}
                onChange={(e) =>
                  setForm({ ...form, quantiteStock: parseInt(e.target.value) })
                }
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={form.categorie.id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categorie:
                      categories.find(
                        (cat) => cat.id === parseInt(e.target.value)
                      ) || form.categorie,
                  })
                }
                className="border p-2 rounded"
              >
                <option value="">-- Catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Produit en vedette
              </label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border p-2 rounded"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingId ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border text-left shadow-md rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 font-semibold text-gray-700">Nom</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Prix</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Stock</th>
              <th className="py-3 px-4 font-semibold text-gray-700">
                Catégorie
              </th>
              <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{prod.nom}</td>
                <td className="py-3 px-4">{prod.prix} €</td>
                <td className="py-3 px-4">{prod.quantiteStock}</td>
                <td className="py-3 px-4">{prod.categorie?.nom}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openModal(prod)}
                    className="text-blue-500 hover:text-blue-700 mr-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828 9 18.7V16h-2a2 2 0 01-2-2V7a2 2 0 012-2h2v-2.414a2 2 0 112.828 2.828L11.828 5.828 14 3.414z"
                      />
                    </svg>
                    <span className="sr-only">Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="sr-only">Supprimer</span>
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="py-3 px-4 text-center" colSpan={5}>
                  Aucun produit trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
//mohamed
