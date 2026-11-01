"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/products?limit=100")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { items: Product[] }) => setProducts(data.items))
      .catch(() => setError("Could not load products"));
  }, [isAdmin]);

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (res.ok) setProducts((ps) => ps?.filter((x) => x.id !== p.id) ?? null);
    else setError((await res.json().catch(() => ({}))).error || "Delete failed");
  };

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Administrators only
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {session ? "Your account does not have access to this page." : "Please sign in with an admin account."}
          </Typography>
          <Button component={Link} href={session ? "/" : "/login"} variant="contained">
            {session ? "Back to shop" : "Sign in"}
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, mb: 4 }}>
        <Box>
          <Typography variant="overline" color="secondary">
            Moderation
          </Typography>
          <Typography variant="h3">All listings</Typography>
          <Typography color="text.secondary">{products ? `${products.length} for sale` : " "}</Typography>
        </Box>
        <Button component={Link} href="/?add=1" variant="contained" startIcon={<AddIcon />}>
          New listing
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Listing</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Listed</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {!products ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} color="secondary" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No listings yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Avatar variant="rounded" src={p.image} alt={p.title} sx={{ width: 48, height: 60, borderRadius: 2 }} />
                        <Typography component={Link} href={`/products/${p.id}`} sx={{ fontWeight: 600, color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                          {p.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{p.seller?.name ?? "–"}</TableCell>
                    <TableCell align="right">{formatPrice(p.price)}</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}
