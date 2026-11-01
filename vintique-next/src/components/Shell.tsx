"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Header from "@/components/Header";

const blob = (color: string, size: number, pos: object, delay = 0) => ({
  position: "absolute",
  width: size,
  height: size,
  borderRadius: "50%",
  background: color,
  filter: "blur(90px)",
  animation: `float 22s ease-in-out ${delay}s infinite alternate`,
  ...pos,
});

function Backdrop() {
  return (
    <Box
      aria-hidden
      sx={(theme) => ({
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: "linear-gradient(160deg, #F6EFE3 0%, #EFE4D1 55%, #F2E7D6 100%)",
        ...theme.applyStyles("dark", { background: "linear-gradient(160deg, #120D0A 0%, #1A130F 55%, #15110C 100%)" }),
        // Fine paper grain for an aged, printed feel
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          mixBlendMode: "multiply",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          ...theme.applyStyles("dark", { mixBlendMode: "screen", opacity: 0.04 }),
        },
        "@keyframes float": { to: { transform: "translate3d(60px, 40px, 0) scale(1.1)" } },
        "@media (prefers-reduced-motion: reduce)": { "& > div": { animation: "none" } },
        "& > div": { opacity: 0.5, ...theme.applyStyles("dark", { opacity: 0.22 }) },
      })}
    >
      <Box sx={blob("#E2B49C", 520, { top: -160, left: -120 })} />
      <Box sx={blob("#E6C98C", 460, { top: "30%", right: -140 }, -6)} />
      <Box sx={blob("#C9C79E", 420, { bottom: -160, left: "25%" }, -12)} />
    </Box>
  );
}

const footerLinks = [
  { title: "Shop", links: [{ href: "/#shop", label: "Fresh listings" }, { href: "/cart", label: "Your bag" }] },
  { title: "Sell", links: [{ href: "/?add=1", label: "Sell a piece" }, { href: "/#how", label: "How it works" }, { href: "/listings", label: "Your listings" }] },
  { title: "Vintique", links: [{ href: "/about", label: "Our story" }, { href: "/contact", label: "Contact us" }] },
  ];

function Footer() {
  return (
    <Box component="footer" sx={{ mt: 10, borderTop: 1, borderColor: "divider", backdropFilter: "blur(12px)" }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h5" sx={{ letterSpacing: "0.2em", color: "secondary.main", mb: 1.5 }}>
              VINTIQUE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
              The community marketplace for vintage and pre-loved fashion. Every listing is one of a kind, sold by someone who loved it first.
            </Typography>
          </Grid>
          {footerLinks.map((col) => (
            <Grid size={{ xs: 6, md: "grow" }} key={col.title}>
              <Typography variant="overline" color="text.secondary">
                {col.title}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {col.links.map((l) => (
                  <MuiLink key={l.href} component={Link} href={l.href} underline="hover" color="text.primary" variant="body2">
                    {l.label}
                  </MuiLink>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="caption" color="text.secondary">
          &copy; 2026 Vintique. Wear it again.
        </Typography>
      </Container>
    </Box>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", color: "text.primary", position: "relative", isolation: "isolate" }}>
      <Backdrop />
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", textAlign: "center", py: 0.75, px: 2 }}>
        <Typography variant="caption" sx={{ letterSpacing: "0.12em", fontWeight: 500 }}>
          Buy and sell vintage &amp; pre-loved fashion · Listing is free
        </Typography>
      </Box>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
