"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Product = { id?: number; title: string; price: number; description: string; image: string; brand?: string };

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [form, setForm] = useState({ title: "", brand: "", image: "", price: "", description: "" });
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-modal", handler);
    return () => window.removeEventListener("open-modal", handler);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.title || !form.image || isNaN(price) || !form.description) return;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${form.title} (${form.brand})`, price, description: form.description, image: form.image }),
    });
    if (res.ok) {
      const newProduct = await res.json();
      setProducts((p) => [newProduct, ...p]);
      setModalOpen(false);
      setForm({ title: "", brand: "", image: "", price: "", description: "" });
      showToast("Added");
    }
  };

  const all = products;
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const visible = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 8, textAlign: "center" }}>
        <Typography variant="h2" sx={{ fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Vintique
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.8 }}>
          Curated Vintage &amp; Pre-loved Pieces
        </Typography>
      </Box>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {visible.map((p, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia component="img" image={p.image} alt={p.title} sx={{ height: 240, objectFit: "cover" }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {p.price.toFixed(2)} €
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button fullWidth variant="outlined" onClick={() => { addToCart(p.title, p.price); showToast("Added to cart"); }}>
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Typography sx={{ alignSelf: "center" }}>
            Page {page} / {totalPages}
          </Typography>
          <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Box>
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 4, textAlign: "center", opacity: 0.6 }}>
        <Typography variant="caption">&copy; 2025 Vintique</Typography>
      </Box>
      <Snackbar open={toastOpen} autoHideDuration={2500} onClose={() => setToastOpen(false)}>
        <Alert severity="success" onClose={() => setToastOpen(false)}>
          {toast}
        </Alert>
      </Snackbar>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Add Product</Typography>
            <Button onClick={() => setModalOpen(false)} sx={{ minWidth: 0, p: 0.5 }}>✕</Button>
          </Box>
          <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <TextField label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
            <TextField label="Image" type="file" slotProps={{ htmlInput: { accept: "image/*" } }} onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
              reader.readAsDataURL(file);
            }} required />
            {form.image && <img src={form.image} alt="preview" style={{ width: "100%", height: 100, objectFit: "cover" }} />}
            <TextField label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Button type="submit" variant="contained">
              Add
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
