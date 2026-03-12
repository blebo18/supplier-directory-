"use client";

import { useState, useEffect, useRef } from "react";
import { Supplier } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

interface SupplierEditFormProps {
  supplier: Supplier;
  onSave: (updated: Supplier) => void;
  onCancel: () => void;
}

export default function SupplierEditForm({ supplier, onSave, onCancel }: SupplierEditFormProps) {
  const { token, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>(supplier.categories || []);
  const [categoryInput, setCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/suppliers?pageSize=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setAllCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const filteredSuggestions = categoryInput.trim()
    ? allCategories.filter(
        (c) =>
          c.toLowerCase().includes(categoryInput.toLowerCase()) &&
          !categories.includes(c)
      ).slice(0, 10)
    : [];

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    setCategoryInput("");
    setShowSuggestions(false);
    categoryInputRef.current?.focus();
  };

  const removeCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const [form, setForm] = useState({
    company: supplier.company,
    website: supplier.website || "",
    phone: supplier.phone || "",
    fax: supplier.fax || "",
    street: supplier.street || "",
    city: supplier.city || "",
    state: supplier.state || "",
    zip: supplier.zip || "",
    employees: supplier.employees?.toString() || "",
    squareFeet: supplier.squareFeet || "",
    description: supplier.description || "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: form.company,
          website: form.website || null,
          phone: form.phone || null,
          fax: form.fax || null,
          street: form.street || null,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
          employees: form.employees ? parseInt(form.employees, 10) : null,
          squareFeet: form.squareFeet || null,
          description: form.description || null,
          categories,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      const data = await res.json();
      onSave({
        ...supplier,
        ...form,
        website: form.website || null,
        phone: form.phone || null,
        fax: form.fax || null,
        street: form.street || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        employees: form.employees ? parseInt(form.employees, 10) : null,
        squareFeet: form.squareFeet || null,
        description: form.description || null,
        categories: data.categories || categories,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          required
          value={form.company}
          onChange={(e) => handleChange("company", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="text"
            value={form.website}
            onChange={(e) => handleChange("website", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
          <input
            type="text"
            value={form.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
          <input
            type="number"
            value={form.employees}
            onChange={(e) => handleChange("employees", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facility Size (sq ft)</label>
          <input
            type="text"
            value={form.squareFeet}
            onChange={(e) => handleChange("squareFeet", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="hover:text-blue-900 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="flex gap-2">
            <input
              ref={categoryInputRef}
              type="text"
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (categoryInput.trim()) addCategory(categoryInput);
                }
              }}
              placeholder="Type to search or add a category..."
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => {
                if (categoryInput.trim()) addCategory(categoryInput);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shrink-0"
            >
              Add
            </button>
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addCategory(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>

      {isAdmin && (
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={supplier.featured || false}
              onChange={async () => {
                const newFeatured = !supplier.featured;
                try {
                  const res = await fetch(`/api/suppliers/${supplier.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ featured: newFeatured }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    onSave({ ...supplier, ...data, categories: data.categories || supplier.categories });
                  }
                } catch {}
              }}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Featured on home page</span>
          </label>
          <button
            type="button"
            disabled={archiving}
            onClick={async () => {
              const isArchived = supplier.archived;
              const action = isArchived ? "unarchive" : "archive";
              if (!confirm(`Are you sure you want to ${action} "${supplier.company}"?`)) return;

              setArchiving(true);
              setError("");
              try {
                const res = await fetch(`/api/suppliers/${supplier.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ archived: !isArchived }),
                });
                if (!res.ok) {
                  const data = await res.json();
                  setError(data.error || `Failed to ${action}`);
                  return;
                }
                const data = await res.json();
                onSave({ ...supplier, ...data, categories: data.categories || supplier.categories });
              } finally {
                setArchiving(false);
              }
            }}
            className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
              supplier.archived
                ? "text-green-700 bg-green-50 border border-green-300 hover:bg-green-100"
                : "text-red-700 bg-red-50 border border-red-300 hover:bg-red-100"
            }`}
          >
            {archiving
              ? (supplier.archived ? "Unarchiving..." : "Archiving...")
              : (supplier.archived ? "Unarchive Supplier" : "Archive Supplier")}
          </button>
        </div>
      )}
    </form>
  );
}
