"use client";

import Header from "@/components/Header";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function AboutPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" sx={{ mb: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          About Vintique
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Vintique is a curated vintage and pre-loved boutique. We collect unique pieces with character and history,
          giving them a second life in your wardrobe and home.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Each item is hand-selected for quality and authenticity. Whether you are hunting for a timeless coat, a
          statement accessory, or a piece of vintage decor, you will find something special here.
        </Typography>
        <Typography variant="body1">
          Sustainability meets style — by choosing pre-loved, you reduce waste and celebrate craftsmanship that lasts.
        </Typography>
      </Container>
    </Box>
  );
}
