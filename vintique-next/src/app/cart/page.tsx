"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function CartPage() {
  const { cart, count, subtotal, removeItem, clearCart } = useCart();

  // Each seller ships their own items, so group the bag by seller
  const bySeller = cart.reduce<Record<string, CartItem[]>>((groups, item) => {
    const seller = item.sellerName || "Vintique member";
    (groups[seller] ||= []).push(item);
    return groups;
  }, {});
  const sellerCount = Object.keys(bySeller).length;

  if (cart.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
        <Card sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 56, color: "secondary.main", mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 1 }}>
            Your bag is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Every listing is one of a kind. When you find something you love, don&apos;t wait too long.
          </Typography>
          <Button component={Link} href="/#shop" variant="contained" size="large">
            Start shopping
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Your bag
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {count} {count === 1 ? "piece" : "pieces"} from {sellerCount} {sellerCount === 1 ? "seller" : "sellers"}
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {Object.entries(bySeller).map(([seller, items]) => (
              <Box key={seller}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                    {seller.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>Sold by {seller}</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {items.map((item) => (
                    <Card key={item.id} sx={{ p: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        component={Link}
                        href={`/products/${item.id}`}
                        sx={{ width: { xs: 76, sm: 96 }, aspectRatio: "4 / 5", borderRadius: 3, overflow: "hidden", flexShrink: 0, bgcolor: "action.hover" }}
                      >
                        {item.image && <Box component="img" src={item.image} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {item.brand && (
                          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {item.brand}
                          </Typography>
                        )}
                        <Typography sx={{ fontWeight: 600 }} noWrap>
                          {item.title}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{formatPrice(item.price)}</Typography>
                      </Box>
                      <Tooltip title="Remove">
                        <IconButton onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
            <Box>
              <Button color="inherit" onClick={clearCart} startIcon={<DeleteOutlineIcon />}>
                Empty bag
              </Button>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: { md: "sticky" }, top: 100 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Order summary
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography color="text.secondary">Items</Typography>
                <Typography>{formatPrice(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography color="text.secondary">Next step</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatPrice(subtotal)}</Typography>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Each seller ships their own pieces, so items from different sellers arrive separately.
            </Typography>
            <Button component={Link} href="/checkout" variant="contained" size="large" fullWidth startIcon={<LockOutlinedIcon />} sx={{ mt: 3 }}>
              Checkout
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
              Shipping is added per seller at checkout.
            </Typography>
            <Button component={Link} href="/#shop" fullWidth sx={{ mt: 1 }}>
              Keep shopping
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
