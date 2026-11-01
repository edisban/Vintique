"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { CATEGORIES } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import AddProductDialog from "@/components/AddProductDialog";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const PER_PAGE = 12;

const steps = [
  { icon: <PhotoCameraOutlinedIcon />, title: "Snap it", text: "Take a clear photo of something you no longer wear and describe it honestly." },
  { icon: <SellOutlinedIcon />, title: "Price it", text: "Set your own price. Listing on Vintique is free." },
  { icon: <FavoriteBorderIcon />, title: "Pass it on", text: "Buyers discover your piece, and it gets a second life in someone else's wardrobe." },
];

// Only this part reads ?add=1, so the rest of the page can be prerendered as static HTML.
function AddDialogFromUrl({ onCreated }: { onCreated: (p: Product) => void }) {
  const router = useRouter();
  const open = useSearchParams().get("add") === "1";
  const close = () => router.replace("/", { scroll: false });
  return (
    <AddProductDialog
      open={open}
      onClose={close}
      onCreated={(p) => {
        close();
        onCreated(p);
      }}
    />
  );
}

export default function HomeClient() {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [reload, setReload] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const key = `page=${page}&limit=${PER_PAGE}&sort=${sort}&category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}&r=${reload}`;
  const loading = loadedKey !== key;
  const filtered = !!query || !!category;

  // Debounce the search box so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products?${key}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { items: Product[]; total: number }) => {
        if (cancelled) return;
        setProducts(data.items);
        setTotal(data.total);
        setLoadedKey(key);
        if (!filtered && sort === "newest" && page === 1) setFeatured(data.items[0] ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadedKey(key);
        setToast({ msg: "Could not load listings", error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [key, filtered, sort, page]);

  const add = (p: Product) => {
    const added = addToCart({ id: p.id, title: p.title, brand: p.brand, price: p.price, image: p.image, sellerName: p.seller?.name });
    setToast({ msg: added ? `${p.title} added to your bag` : `${p.title} is already in your bag` });
  };

  const pickCategory = (c: string) => {
    setCategory(c);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="overline" color="secondary">
              The marketplace for vintage &amp; pre-loved fashion
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: "2.75rem", sm: "3.75rem", md: "4.5rem" }, lineHeight: 1.05, mt: 1, mb: 3 }}>
              Give your wardrobe
              <Box component="span" sx={{ display: "block", fontStyle: "italic", color: "secondary.main" }}>
                a second story.
              </Box>
            </Typography>
            <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 540, mb: 4 }}>
              Buy one-of-a-kind pieces from people who loved them first, and sell the clothes you no longer wear. Listing is free.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button href="#shop" variant="contained" size="large">
                Start shopping
              </Button>
              <Button component={Link} href="/?add=1" scroll={false} variant="outlined" size="large" color="inherit">
                Sell a piece
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 1.5, transform: { md: "rotate(2deg)" }, transition: "transform .4s ease", "&:hover": { transform: "rotate(0deg)" } }}>
              {featured ? (
                <Box component={Link} href={`/products/${featured.id}`} sx={{ display: "block", color: "inherit", textDecoration: "none" }}>
                  <Box component="img" src={featured.image} alt={featured.title} sx={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 3.5, display: "block" }} />
                  <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="overline" color="text.secondary">
                        Just listed{featured.seller && ` by ${featured.seller.name}`}
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }} noWrap>
                        {featured.title}
                      </Typography>
                    </Box>
                    <Typography variant="h6">{formatPrice(featured.price)}</Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    aspectRatio: "4 / 5",
                    borderRadius: 3.5,
                    background: "linear-gradient(145deg, rgba(134,92,28,.35), rgba(110,44,36,.4))",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 4,
                    gap: 1,
                  }}
                >
                  <Typography variant="h3" sx={{ fontStyle: "italic" }}>
                    Your piece here.
                  </Typography>
                  <Typography color="text.secondary">The first listings are waiting to be made.</Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How it works */}
      <Container id="how" maxWidth="lg" sx={{ scrollMarginTop: 80 }}>
        <Card sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
          <Typography variant="overline" color="secondary">
            How selling works
          </Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>
            From your closet to someone&apos;s favourite
          </Typography>
          <Grid container spacing={4}>
            {steps.map((s, i) => (
              <Grid key={s.title} size={{ xs: 12, md: 4 }} sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "action.hover", color: "secondary.main", flexShrink: 0 }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {i + 1}. {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* Shop */}
      <Container id="shop" maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: 3 }}>
          <Box>
            <Typography variant="overline" color="secondary">
              Shop the community
            </Typography>
            <Typography variant="h3">{category || "Fresh listings"}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {loading ? " " : `${total} ${total === 1 ? "piece" : "pieces"} for sale`}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="Search items or brands"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { sm: 260 } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <TextField
              select
              size="small"
              label="Sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="newest">Newest listings</MenuItem>
              <MenuItem value="price-asc">Price, low to high</MenuItem>
              <MenuItem value="price-desc">Price, high to low</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
          {["", ...CATEGORIES].map((c) => (
            <Chip
              key={c || "all"}
              label={c || "All"}
              onClick={() => pickCategory(c)}
              color={category === c ? "primary" : "default"}
              variant={category === c ? "filled" : "outlined"}
              sx={{ flexShrink: 0 }}
            />
          ))}
        </Stack>

        {!loading && products.length === 0 ? (
          <Card sx={{ py: 10, px: 3, textAlign: "center" }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>
              {filtered ? "Nothing here yet" : "Be the first to sell"}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {filtered ? "Try another search or category, or check back soon as new pieces are listed every day." : "The shop fills up as members list their pieces. Start it off with one of yours."}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "center" }}>
              {filtered && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setSearch("");
                    pickCategory("");
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Button component={Link} href="/?add=1" scroll={false} variant="contained">
                Sell a piece
              </Button>
            </Stack>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {loading && products.length === 0
              ? Array.from({ length: 8 }, (_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <ProductCardSkeleton />
                  </Grid>
                ))
              : products.map((p) => (
                  <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ opacity: loading ? 0.5 : 1, transition: "opacity .2s" }}>
                    <ProductCard product={p} onAdd={add} isOwn={!!session && p.sellerId === session.user.id} />
                  </Grid>
                ))}
          </Grid>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              shape="rounded"
              onChange={(_, p) => {
                setPage(p);
                document.getElementById("shop")?.scrollIntoView();
              }}
            />
          </Box>
        )}
      </Container>

      {/* Sell banner */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 } }}>
        <Card sx={{ p: { xs: 4, md: 6 }, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Clothes you don&apos;t wear? Someone&apos;s looking for them.
            </Typography>
            <Typography color="text.secondary">List a piece in a couple of minutes. It&apos;s free, and it keeps good clothes in use.</Typography>
          </Box>
          <Button component={Link} href="/?add=1" scroll={false} variant="contained" size="large" sx={{ flexShrink: 0 }}>
            Sell a piece
          </Button>
        </Card>
      </Container>

      <Suspense>
        <AddDialogFromUrl
          onCreated={(p) => {
            setSearch("");
            setSort("newest");
            pickCategory("");
            setReload((n) => n + 1);
            setToast({ msg: `${p.title} is now listed` });
          }}
        />
      </Suspense>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast?.error ? "error" : "success"} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 3 }}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
