import React, { useEffect, useState, useCallback } from "react";
import { Category } from "@/types"; // Assuming Category has { id: number; nom: string; description?: string | null }
// Remove the incorrect http import: import { get } from "http";
import { getCategories, updateCategory, createCategory, deleteCategory } from "./api";

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize fetchCategories if passed as dependency elsewhere
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Impossible de charger les catégories."); // User-friendly message
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Include fetchCategories in dependency array

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setError(null); // Also clear error on reset/cancel
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation before API call
    if (!formData.nom?.trim()) {
       setError("Le nom est requis.");
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await updateCategory(editingId, formData);
        // Optional: Check response if API indicates success/failure differently
        // if (updated) { ... }
      } else {
        const created = await createCategory(formData as Omit<Category, 'id'>); // Assert required fields if needed by API
        // Optional: Check response
        // if (created) { ... }
      }
      await fetchCategories(); // Refetch list on success
      resetForm(); // Reset form on success
    } catch (err) {
      console.error("Failed to save category:", err);
      setError(editingId ? "Erreur lors de la modification." : "Erreur lors de l'ajout.");
    } finally {
      // Keep loading false if fetchCategories sets it, otherwise set it here
      // setIsLoading(false); // fetchCategories will handle this if it's always called
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    // Ensure description is handled correctly if it can be null/undefined
    setFormData({ nom: cat.nom, description: cat.description || "" });
    setError(null); // Clear errors when starting an edit
  };

  const handleDelete = async (id: number) => {
    // Consider using a custom modal instead of confirm for better UX
    if (window.confirm("Supprimer cette catégorie ?")) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteCategory(id);
        await fetchCategories(); // Refetch list on successful delete
        // If the deleted item was being edited, reset the form
        if (editingId === id) {
            resetForm();
        }
      } catch (err) {
        console.error("Failed to delete category:", err);
        setError("Erreur lors de la suppression.");
      } finally {
         // Keep loading false if fetchCategories sets it, otherwise set it here
         // setIsLoading(false); // fetchCategories will handle this
      }
    }
  };


  return (
   

    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📂 Gestion des Catégories</h1>
      
      <div className="mb-6">
  <button
           onClick={() => window.location.href = "/admin/dashboard"} // ou utiliser navigate("/dashboard") si tu utilises react-router
               className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all"
      >
          ← Retour au tableau de bord
        </button>
   </div>



      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-pulse" role="alert">
          {error}
        </div>
      )}
  
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div>
          <label className="block mb-1 font-medium" htmlFor="nom">Nom</label>
          <input
            id="nom"
            type="text"
            name="nom"
            value={formData.nom || ""}
            onChange={handleChange}
            placeholder="Nom de la catégorie"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
  
        <div>
          <label className="block mb-1 font-medium" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Description (optionnelle)"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
          />
        </div>
  
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (editingId ? 'Modification...' : 'Ajout...') : (editingId ? "✅ Modifier" : "➕ Ajouter")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-xl transition-all"
              disabled={isLoading}
            >
              ❌ Annuler
            </button>
          )}
        </div>
      </form>
  
      {isLoading && categories.length === 0 && <p className="text-center text-gray-600">Chargement des catégories...</p>}
  
      {!isLoading && categories.length === 0 && !error && (
        <p className="text-center text-gray-500">Aucune catégorie trouvée.</p>
      )}
  
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-shadow flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{cat.nom}</h3>
              {cat.description && <p className="text-gray-600 text-sm mt-1">{cat.description}</p>}
            </div>
            <div className="flex gap-3 flex-shrink-0 mt-1">
              <button
                onClick={() => handleEdit(cat)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                disabled={isLoading}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                disabled={isLoading}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};
  
export default CategoryManager;