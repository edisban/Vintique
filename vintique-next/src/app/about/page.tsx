"use client";

import Link from "next/link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RecyclingIcon from "@mui/icons-material/Recycling";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const values = [
  { icon: <AutoAwesomeOutlinedIcon />, title: "One of a kind", text: "Every listing is a single piece from someone's wardrobe, not mass-produced stock." },
  { icon: <VerifiedOutlinedIcon />, title: "Honest listings", text: "Sellers describe size, condition and any signs of wear, and listings that break the rules are removed." },
  { icon: <RecyclingIcon />, title: "Circular by design", text: "Buying pre-loved keeps good clothes in use and out of landfill. The greenest garment is one that already exists." },
];

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 760, mx: "auto", textAlign: "center", mb: { xs: 6, md: 10 } }}>
        <Typography variant="overline" color="secondary">
          Our story
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.5rem", md: "3.75rem" }, mb: 3 }}>
          Fashion worth <Box component="span" sx={{ fontStyle: "italic", color: "secondary.main" }}>keeping</Box>
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.7 }}>
          Vintique is a community marketplace built on a simple belief: well-made clothes deserve more than one life. Members
          list the vintage and pre-loved pieces they no longer wear, from a perfectly worn-in jacket to a silk scarf with decades
          of stories, and other members give them a new home. Listing is free. No fast fashion, just pieces made to last.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {values.map((v) => (
          <Grid key={v.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 4, height: "100%" }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "action.hover", color: "secondary.main", mb: 2 }}>
                {v.icon}
              </Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {v.title}
              </Typography>
              <Typography color="text.secondary">{v.text}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Button component={Link} href="/#shop" variant="contained" size="large">
          Start shopping
        </Button>
        <Button component={Link} href="/?add=1" variant="outlined" color="inherit" size="large" sx={{ ml: 2 }}>
          Sell a piece
        </Button>
      </Box>
    </Container>
  );
}
