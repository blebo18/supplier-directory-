"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

export default function AdminPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin) return;

    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, [token, isAdmin]);

  if (authLoading) return null;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Access denied. Admin role required.</p>
          <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.id === user.id ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {u.role} (you)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
