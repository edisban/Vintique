"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/catalog";
import type { Order } from "@/lib/types";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

type Role = "buyer" | "seller";

const STATUS_COLOR = { PAID: "warning", SHIPPED: "info", COMPLETED: "success" } as const;

export default function OrdersClient() {
  const placed = useSearchParams().get("placed") === "1";
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState<Role>("buyer");
  const [result, setResult] = useState<{ role: Role; orders: Order[] } | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const signedIn = !!session;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch(`/api/orders?as=${role}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((orders: Order[]) => !cancelled && setResult({ role, orders }))
      .catch(() => !cancelled && setError("Could not load your orders"));
    return () => {
      cancelled = true;
    };
  }, [role, signedIn]);

  const update = async (order: Order, status: Order["status"]) => {
    setBusyId(order.id);
    const res = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusyId(null);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error || "Could not update the order");
    setResult((r) => r && { ...r, orders: r.orders.map((o) => (o.id === order.id ? { ...o, status } : o)) });
  };

  if (!isPending && !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Your orders
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to see your purchases and sales.
          </Typography>
          <Button component={Link} href="/login" variant="contained">
            Sign in
          </Button>
        </Card>
      </Container>
    );
  }

  const orders = result?.role === role ? result.orders : null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Orders
      </Typography>
      {placed && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you! Your order is placed and the sellers have been notified. You&apos;ll see it here as it ships.
        </Alert>
      )}
      <Tabs value={role} onChange={(_, v) => setRole(v)} sx={{ mb: 3 }}>
        <Tab value="buyer" label="Purchases" />
        <Tab value="seller" label="Sales" />
      </Tabs>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!orders ? (
        <Stack spacing={2}>
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 5 }} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <Card sx={{ py: 8, px: 3, textAlign: "center" }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: "secondary.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            {role === "buyer" ? "No purchases yet" : "No sales yet"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {role === "buyer" ? "When you buy a piece, you can follow it here." : "When someone buys one of your pieces, it shows up here with their shipping address."}
          </Typography>
          <Button component={Link} href={role === "buyer" ? "/#shop" : "/?add=1"} variant="contained">
            {role === "buyer" ? "Start shopping" : "Sell a piece"}
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {orders.map((o) => (
            <Card key={o.id} sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    Order #{o.id} · {role === "buyer" ? `from ${o.seller.name}` : `to ${o.buyer.name}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
                <Chip label={ORDER_STATUS_LABELS[o.status]} color={STATUS_COLOR[o.status]} variant="outlined" sx={{ alignSelf: { xs: "flex-start", sm: "center" } }} />
              </Stack>
              <Stack spacing={1.5}>
                {o.items.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 52, aspectRatio: "4 / 5", borderRadius: 2, overflow: "hidden", flexShrink: 0, bgcolor: "action.hover" }}>
                      {item.product?.image && <Box component="img" src={item.product.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    </Box>
                    <Typography
                      component={item.productId ? Link : "span"}
                      href={item.productId ? `/products/${item.productId}` : undefined}
                      sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", "&:hover": { textDecoration: item.productId ? "underline" : "none" } }}
                    >
                      {item.title}
                    </Typography>
                    <Typography>{formatPrice(item.price)}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Ship to
                  </Typography>
                  <Typography variant="body2">
                    {o.shipName}
                    <br />
                    {o.shipAddress}, {o.shipPostalCode} {o.shipCity}, {o.shipCountry}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { sm: "right" } }}>
                  <Typography variant="body2" color="text.secondary">
                    Items {formatPrice(o.itemsTotal)} · Shipping {formatPrice(o.shipping)}
                  </Typography>
                  <Typography variant="h6">{formatPrice(o.total)}</Typography>
                </Box>
              </Stack>
              {role === "seller" && o.status === "PAID" && (
                <Button variant="contained" startIcon={<LocalShippingOutlinedIcon />} disabled={busyId === o.id} onClick={() => update(o, "SHIPPED")} sx={{ mt: 2 }}>
                  Mark as shipped
                </Button>
              )}
              {role === "buyer" && o.status === "SHIPPED" && (
                <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} disabled={busyId === o.id} onClick={() => update(o, "COMPLETED")} sx={{ mt: 2 }}>
                  I&apos;ve received it
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
