"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";

type Filter = "all" | "AVAILABLE" | "SOLD";

export default function ListingsPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!userId) return;
    fetch("/api/products?mine=1&limit=100")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { items: Product[] }) => setItems(data.items))
      .catch(() => setError("Could not load your listings"));
  }, [userId]);

  if (!isPending && !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Your listings
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to see and manage the pieces you&apos;re selling.
          </Typography>
          <Button component={Link} href="/login" variant="contained">
            Sign in
          </Button>
        </Card>
      </Container>
    );
  }

  const forSale = items?.filter((p) => p.status === "AVAILABLE") ?? [];
  const sold = items?.filter((p) => p.status === "SOLD") ?? [];
  const shown = filter === "all" ? items : filter === "AVAILABLE" ? forSale : sold;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, mb: 3 }}>
        <Box>
          <Typography variant="overline" color="secondary">
            Your closet
          </Typography>
          <Typography variant="h3">Your listings</Typography>
          {items && (
            <Typography color="text.secondary">
              {forSale.length} for sale · {sold.length} sold
              {sold.length > 0 && ` · ${formatPrice(sold.reduce((s, p) => s + p.price, 0))} in sales`}
            </Typography>
          )}
        </Box>
        <Button component={Link} href="/?add=1" variant="contained" startIcon={<AddIcon />}>
          Sell a piece
        </Button>
      </Stack>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 3 }}>
        <Tab value="all" label="All" />
        <Tab value="AVAILABLE" label="For sale" />
        <Tab value="SOLD" label="Sold" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {shown && shown.length === 0 ? (
        <Card sx={{ py: 8, px: 3, textAlign: "center" }}>
          <SellOutlinedIcon sx={{ fontSize: 48, color: "secondary.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            {filter === "SOLD" ? "No sales yet" : "Nothing listed yet"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {filter === "SOLD" ? "When a piece finds a buyer, mark it as sold and it will show up here." : "Got something you no longer wear? List it in a couple of minutes."}
          </Typography>
          {filter !== "SOLD" && (
            <Button component={Link} href="/?add=1" variant="contained">
              List your first piece
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {!shown
            ? Array.from({ length: 4 }, (_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCardSkeleton />
                </Grid>
              ))
            : shown.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCard product={p} isOwn />
                </Grid>
              ))}
        </Grid>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        Open a listing to mark it as sold, relist it or delete it.
      </Typography>
    </Container>
  );
}
