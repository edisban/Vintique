"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { CATEGORIES, CONDITIONS, CONDITION_HINTS } from "@/lib/catalog";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import type { Product } from "@/lib/types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const EMPTY = { title: "", brand: "", category: "", size: "", condition: "", image: "", price: "", description: "" };

type Props = { open: boolean; onClose: () => void; onCreated: (p: Product) => void };

export default function AddProductDialog({ open, onClose, onCreated }: Props) {
  const { data: session } = useSession();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const readFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file");
    if (file.size > MAX_IMAGE_BYTES) return setError("Photo must be under 2 MB");
    setError("");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const close = () => {
    setError("");
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.image) return setError("Add a photo so buyers can see your piece");
    if (isNaN(price) || price <= 0) return setError("Please enter a price above €0");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Could not publish your listing");
      setForm(EMPTY);
      onCreated(data);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <IconButton onClick={close} aria-label="Close" sx={{ position: "absolute", right: 12, top: 12, zIndex: 1 }}>
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="overline" color="secondary">
          Sell on Vintique
        </Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>
          List a piece
        </Typography>
        {!session ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
            <Typography color="text.secondary">
              Listing is free. Create an account or sign in to start selling the pieces you no longer wear.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button component={Link} href="/register" variant="contained">
                Create account
              </Button>
              <Button component={Link} href="/login" variant="outlined" color="inherit">
                Sign in
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box component="form" onSubmit={submit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  component="label"
                  onDragOver={(e: React.DragEvent) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e: React.DragEvent) => {
                    e.preventDefault();
                    setDragging(false);
                    readFile(e.dataTransfer.files[0]);
                  }}
                  sx={{
                    aspectRatio: "4 / 5",
                    borderRadius: 4,
                    border: "2px dashed",
                    borderColor: dragging ? "secondary.main" : "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 2,
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    color: "text.secondary",
                    textAlign: "center",
                    transition: "border-color .2s",
                    "&:hover": { borderColor: "secondary.main" },
                  }}
                >
                  {form.image ? (
                    <Box component="img" src={form.image} alt="Preview" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <CloudUploadOutlinedIcon sx={{ fontSize: 40 }} />
                      <Typography sx={{ fontWeight: 600 }}>Drop a photo or browse</Typography>
                      <Typography variant="caption">Natural light and a plain background work best. JPG, PNG or WebP, up to 2 MB.</Typography>
                    </>
                  )}
                  <input hidden type="file" accept="image/*" onChange={(e) => readFile(e.target.files?.[0])} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="Title" placeholder="e.g. 1970s suede jacket" value={form.title} onChange={set("title")} required fullWidth />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Brand" placeholder="Or “Unbranded”" value={form.brand} onChange={set("brand")} fullWidth />
                  <TextField label="Size" placeholder="e.g. M, 38, One size" value={form.size} onChange={set("size")} fullWidth />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField select label="Category" value={form.category} onChange={set("category")} required fullWidth>
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Condition"
                    value={form.condition}
                    onChange={set("condition")}
                    required
                    fullWidth
                    slotProps={{ select: { renderValue: (v) => v as string } }}
                  >
                    {CONDITIONS.map((c) => (
                      <MenuItem key={c} value={c}>
                        <ListItemText primary={c} secondary={CONDITION_HINTS[c]} />
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={set("price")}
                  required
                  fullWidth
                  slotProps={{
                    htmlInput: { min: 0.5, step: "0.5" },
                    input: { startAdornment: <InputAdornment position="start">€</InputAdornment> },
                  }}
                />
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={set("description")}
                  required
                  fullWidth
                  placeholder="Tell buyers about it: era, measurements, materials, how it fits and any signs of wear."
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ alignSelf: "flex-start" }}>
                  {busy ? "Publishing…" : "Publish listing"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
