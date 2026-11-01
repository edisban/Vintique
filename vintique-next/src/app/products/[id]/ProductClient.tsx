"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { formatPrice, memberSince } from "@/lib/format";
import { CONDITION_HINTS } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StraightenIcon from "@mui/icons-material/Straighten";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import RecyclingIcon from "@mui/icons-material/Recycling";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const tips = [
  { icon: <StraightenIcon />, text: "Check the size, measurements and condition in the description before you buy." },
  { icon: <FlagOutlinedIcon />, text: "Something not right with this listing? Contact us and we'll review it." },
  { icon: <RecyclingIcon />, text: "Buying pre-loved keeps good clothes in use and out of landfill." },
];

export default function ProductClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [result, setResult] = useState<{ id: string; product: Product | null } | null>(null);
  const [toast, setToast] = useState<{ msg: string; bag?: boolean; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((product) => !cancelled && setResult({ id, product }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = result?.id !== id;
  const product = loading ? null : result.product;
  const isOwner = !!session && !!product && product.sellerId === session.user.id;
  const canManage = isOwner || session?.user.role === "ADMIN";
  const sold = product?.status === "SOLD";

  const setStatus = async (status: Product["status"]) => {
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(false);
    if (!res.ok) return setToast({ msg: "Could not update the listing", error: true });
    setResult({ id, product: await res.json() });
    setToast({ msg: status === "SOLD" ? "Marked as sold" : "Listed for sale again" });
  };

  const messageSeller = async () => {
    if (!session) return router.push("/login");
    setBusy(true);
    const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: Number(id) }) });
    setBusy(false);
    if (!res.ok) return setToast({ msg: "Could not open a conversation", error: true });
    router.push(`/messages/${(await res.json()).id}`);
  };

  const remove = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return setToast({ msg: "Could not delete the listing", error: true });
    router.push(isOwner ? "/listings" : "/");
  };

  if (!loading && !product) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          This listing is no longer available
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The seller may have removed it. There&apos;s plenty more to discover.
        </Typography>
        <Button component={Link} href="/#shop" variant="contained">
          Browse listings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} href="/#shop" underline="hover" color="inherit">
          Shop
        </MuiLink>
        {product?.category && <Typography color="text.secondary">{product.category}</Typography>}
        <Typography color="text.primary">{product?.title ?? "…"}</Typography>
      </Breadcrumbs>
      <Grid container spacing={{ xs: 4, md: 8 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 1.5, position: "relative" }}>
            {product ? (
              <Box
                component="img"
                src={product.image}
                alt={product.title}
                sx={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 3.5, display: "block", filter: sold ? "grayscale(.7)" : "none" }}
              />
            ) : (
              <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 5", height: "auto", borderRadius: 3.5 }} />
            )}
            {sold && <Chip label="Sold" sx={{ position: "absolute", top: 28, left: 28, fontWeight: 700, bgcolor: "background.paper" }} />}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ position: { md: "sticky" }, top: 100 }}>
            {product ? (
              <>
                {product.brand && (
                  <Typography variant="overline" color="secondary">
                    {product.brand}
                  </Typography>
                )}
                <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 2 }}>
                  {product.title}
                </Typography>
                <Typography variant="h4" component="p" sx={{ fontFamily: "inherit", fontWeight: 600, mb: 2 }}>
                  {formatPrice(product.price)}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: 3 }}>
                  {product.size && <Chip label={`Size ${product.size}`} variant="outlined" />}
                  <Chip label={product.condition} variant="outlined" title={CONDITION_HINTS[product.condition as keyof typeof CONDITION_HINTS]} />
                  <Chip label={product.category} variant="outlined" />
                </Stack>
                <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", mb: 4, lineHeight: 1.8 }}>
                  {product.description}
                </Typography>

                {canManage ? (
                  <Card sx={{ p: 2.5 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{isOwner ? "This is your listing" : "Admin controls"}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {sold ? "It's marked as sold and hidden from the shop." : "It's live in the shop. Mark it as sold once it has found a buyer."}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button
                        variant="contained"
                        disabled={busy}
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => setStatus(sold ? "AVAILABLE" : "SOLD")}
                      >
                        {sold ? "Relist for sale" : "Mark as sold"}
                      </Button>
                      <Button variant="outlined" color="error" disabled={busy} startIcon={<DeleteOutlineIcon />} onClick={remove}>
                        Delete listing
                      </Button>
                    </Stack>
                  </Card>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={sold}
                    startIcon={<ShoppingBagOutlinedIcon />}
                    onClick={() => {
                      const added = addToCart({
                        id: product.id,
                        title: product.title,
                        brand: product.brand,
                        price: product.price,
                        image: product.image,
                        sellerName: product.seller?.name,
                      });
                      setToast({ msg: added ? "Added to your bag" : "Already in your bag", bag: true });
                    }}
                  >
                    {sold ? "Sold" : "Add to bag"}
                  </Button>
                )}
                {!canManage && product.seller && (
                  <Button variant="outlined" color="inherit" size="large" fullWidth disabled={busy} startIcon={<ChatBubbleOutlineIcon />} onClick={messageSeller} sx={{ mt: 1.5 }}>
                    Message seller
                  </Button>
                )}
              </>
            ) : (
              <>
                <Skeleton width="30%" />
                <Skeleton height={64} />
                <Skeleton width="25%" height={48} sx={{ mb: 2 }} />
                <Skeleton />
                <Skeleton />
                <Skeleton width="70%" />
              </>
            )}

            {product?.seller && (
              <Card sx={{ mt: 3, p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main", color: "primary.contrastText" }}>
                  {product.seller.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    Sold by
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{product.seller.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {memberSince(product.seller.createdAt)}
                  </Typography>
                </Box>
              </Card>
            )}

            <Card sx={{ mt: 3, p: 2.5 }}>
              <Stack spacing={2} divider={<Divider flexItem />}>
                {tips.map((t) => (
                  <Stack key={t.text} direction="row" spacing={2} sx={{ alignItems: "center", color: "text.secondary" }}>
                    <Box sx={{ color: "secondary.main", display: "flex" }}>{t.icon}</Box>
                    <Typography variant="body2">{t.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          severity={toast?.error ? "error" : "success"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 3 }}
          action={
            toast?.bag ? (
              <Button component={Link} href="/cart" color="inherit" size="small">
                View bag
              </Button>
            ) : undefined
          }
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
