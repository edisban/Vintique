"use client";

import Header from "@/components/Header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

export default function ContactPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h3" sx={{ mb: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Contact
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          <Button startIcon={<PhoneIcon />} href="tel:+302101234567" variant="contained" size="large">
            +30 210 123 4567
          </Button>
          <Button startIcon={<EmailIcon />} href="mailto:info@vintique.com" variant="outlined" size="large">
            info@vintique.com
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
