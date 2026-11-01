"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import Visibility from "@mui/icons-material/VisibilityOutlined";
import VisibilityOff from "@mui/icons-material/VisibilityOffOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const icon = (node: React.ReactNode) => ({ input: { startAdornment: <InputAdornment position="start">{node}</InputAdornment> } });

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = isRegister
      ? await signUp.email({ name: name.trim() || email, email, password })
      : await signIn.email({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, display: "flex", justifyContent: "center" }}>
      <Card sx={{ p: { xs: 3, sm: 5 }, width: "100%", maxWidth: 460 }}>
        <Typography variant="overline" color="secondary" sx={{ display: "block", textAlign: "center" }}>
          Vintique
        </Typography>
        <Typography variant="h3" sx={{ textAlign: "center", mb: 1 }}>
          {isRegister ? "Join Vintique" : "Welcome back"}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
          {isRegister ? "Join the community to buy one-of-a-kind pieces and sell your own for free." : "Sign in to shop and manage your listings."}
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {isRegister && (
            <TextField label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth slotProps={icon(<PersonOutlineIcon fontSize="small" />)} />
          )}
          <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth slotProps={icon(<MailOutlineIcon fontSize="small" />)} />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText={isRegister ? "At least 8 characters" : undefined}
            slotProps={{
              htmlInput: { minLength: isRegister ? 8 : undefined },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" fullWidth disabled={busy} sx={{ mt: 1 }}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          {isRegister ? "Already have an account? " : "New to Vintique? "}
          <MuiLink sx={{ fontWeight: 600 }} component={Link} href={isRegister ? "/login" : "/register"} color="secondary" underline="hover">
            {isRegister ? "Sign in" : "Create an account"}
          </MuiLink>
        </Typography>
      </Card>
    </Container>
  );
}
