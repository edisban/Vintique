"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { SHIPPING_PER_PARCEL } from "@/lib/catalog";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const EMPTY = { name: "", address: "", city: "", postalCode: "", country: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { cart, subtotal, removeItem } = useCart();
  const [shipping, setShipping] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setShipping((s) => ({ ...s, [key]: e.target.value }));

  const sellers = new Set(cart.map((i) => i.sellerName || "Vintique member")).size;
  const shippingTotal = sellers * SHIPPING_PER_PARCEL;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: cart.map((i) => i.id), shipping }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && Array.isArray(data.unavailable)) {
        // Someone else bought these first (or they were removed): take them out of the bag
        const gone = cart.filter((i) => data.unavailable.includes(i.id));
        gone.forEach((i) => removeItem(i.id));
        setError(`Sorry, ${gone.map((i) => `"${i.title}"`).join(", ")} ${gone.length === 1 ? "is" : "are"} no longer available and ${gone.length === 1 ? "was" : "were"} removed from your bag. Please review and try again.`);
        return;
      }
      if (!res.ok) return setError(data.error || "Could not place your order");
      cart.forEach((i) => removeItem(i.id));
      router.push("/orders?placed=1");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!session || cart.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {!session ? "Sign in to check out" : "Your bag is empty"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {!session ? "You need an account to buy, so sellers know where to send your pieces." : "Add a piece to your bag to check out."}
          </Typography>
          <Button component={Link} href={!session ? "/login" : "/#shop"} variant="contained">
            {!session ? "Sign in" : "Start shopping"}
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Checkout
      </Typography>
      <Box component="form" onSubmit={placeOrder}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Shipping address
              </Typography>
              <Stack spacing={2}>
                <TextField label="Full name" autoComplete="name" value={shipping.name} onChange={set("name")} required fullWidth />
                <TextField label="Street address" autoComplete="street-address" value={shipping.address} onChange={set("address")} required fullWidth />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="City" autoComplete="address-level2" value={shipping.city} onChange={set("city")} required fullWidth />
                  <TextField label="Postal code" autoComplete="postal-code" value={shipping.postalCode} onChange={set("postalCode")} required fullWidth />
                </Stack>
                <TextField label="Country" autoComplete="country-name" value={shipping.country} onChange={set("country")} required fullWidth />
              </Stack>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Payment
              </Typography>
              <Alert severity="info" icon={<LockOutlinedIcon />}>
                Test mode: no card is charged. Placing the order reserves the pieces and notifies the sellers.
              </Alert>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, position: { md: "sticky" }, top: 100 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Your order
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {cart.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 48, aspectRatio: "4 / 5", borderRadius: 2, overflow: "hidden", flexShrink: 0, bgcolor: "action.hover" }}>
                      {item.image && <Box component="img" src={item.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        from {item.sellerName || "Vintique member"}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{formatPrice(item.price)}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Items</Typography>
                  <Typography>{formatPrice(subtotal)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    Shipping ({sellers} {sellers === 1 ? "parcel" : "parcels"})
                  </Typography>
                  <Typography>{formatPrice(shippingTotal)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">{formatPrice(subtotal + shippingTotal)}</Typography>
                </Stack>
              </Stack>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button type="submit" variant="contained" size="large" fullWidth disabled={busy} startIcon={<LockOutlinedIcon />} sx={{ mt: 3 }}>
                {busy ? "Placing order…" : `Place order · ${formatPrice(subtotal + shippingTotal)}`}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
