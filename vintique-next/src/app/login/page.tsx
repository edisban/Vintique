"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "next/link";
import Paper from "@mui/material/Paper";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Login failed"); return; }
    login(data.token, data.user);
    window.location.href = "/";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 10, display: "flex", justifyContent: "center" }}>
        <Paper elevation={6} sx={{ p: 5, width: "100%", maxWidth: 420, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em", color: "primary.main" }}>
            Login
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}>
            Welcome back to Vintique
          </Typography>
          <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            {err && <Typography color="error" variant="body2">{err}</Typography>}
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Sign In
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#B8943F", fontWeight: 600 }}>
              Register
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
