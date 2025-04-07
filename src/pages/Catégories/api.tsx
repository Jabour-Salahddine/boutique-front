import { Category } from "@/types";

const API_URL = "http://localhost:8080/boutique_war/api/categories";

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_URL);
  return res.json();
};

export const createCategory = async (category: Partial<Category>) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  return res.ok ? res.json() : null;
};

export const updateCategory = async (id: number, category: Partial<Category>) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  return res.ok ? res.json() : null;
};

export const deleteCategory = async (id: number) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};
