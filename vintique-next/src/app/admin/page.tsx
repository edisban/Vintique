"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setIsAdmin(localStorage.getItem("admin") === "true");
  }, []);

  const login = () => {
    if (email === "admin@vintique.com") {
      localStorage.setItem("admin", "true");
      setIsAdmin(true);
    } else {
      alert("Not admin");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin");
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <h2 className="text-2xl font-light tracking-widest uppercase mb-8">Admin</h2>
        {!isAdmin ? (
          <div className="max-w-md space-y-4">
            <input className="w-full border-b border-black dark:border-white bg-transparent py-2 focus:outline-none" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={login} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 text-xs uppercase tracking-widest hover:opacity-80 transition">Login as admin</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest">You are admin.</p>
            <button onClick={logout} className="border border-black dark:border-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">Logout</button>
          </div>
        )}
      </main>
      <footer className="border-t border-black dark:border-white py-10 text-center text-xs uppercase tracking-widest opacity-60">
        <p>&copy; 2025 Vintique</p>
      </footer>
    </div>
  );
}
