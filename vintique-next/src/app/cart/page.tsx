"use client";

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

export default function CartPage() {
  const { cart, removeItem, clearCart } = useCart();
  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Cart
        </Typography>
        {cart.length === 0 ? (
          <Typography color="text.secondary">Your cart is empty.</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {cart.map((item, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                  <Card>
                    <CardMedia component="img" image="https://via.placeholder.com/400" alt="product" sx={{ height: 200, objectFit: "cover" }} />
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.price.toFixed(2)} €
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button fullWidth variant="outlined" color="error" onClick={() => removeItem(i)}>
                        Remove
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="h6">Total: {total.toFixed(2)} €</Typography>
              <Button variant="contained" color="error" onClick={clearCart}>
                Clear Cart
              </Button>
            </Box>
          </>
        )}
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 4, textAlign: "center", opacity: 0.6 }}>
        <Typography variant="caption">&copy; 2025 Vintique</Typography>
      </Box>
    </Box>
  );
}
