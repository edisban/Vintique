"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/components/ThemeRegistry";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { dark, toggle } = useThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AppBar position="sticky" elevation={scrolled ? 4 : 0} sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 80 }}>
            <Typography variant="h4" component={Link} href="/" sx={{ fontWeight: 700, letterSpacing: "0.25em", textDecoration: "none", color: "#B8943F", whiteSpace: "nowrap" }}>
              VINTIQUE
            </Typography>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, flexWrap: "nowrap", whiteSpace: "nowrap" }}>
              {navLinks.map((l) => (
                <Button key={l.label} component={Link} href={l.href} sx={{ color: "inherit", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
                  {l.label}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={toggle} color="inherit">
                {dark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton component={Link} href="/cart" color="inherit">
                <Badge badgeContent={cart.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Button component={Link} href="/" onClick={() => setTimeout(() => window.dispatchEvent(new Event("open-modal")), 100)} variant="outlined" size="small" sx={{ textTransform: "uppercase", fontSize: "0.75rem", color: "inherit", borderColor: "inherit" }}>
                + Add
              </Button>
              {user ? (
                <>
                  <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                    {user.name}
                  </Typography>
                  <Button onClick={logout} size="small" sx={{ textTransform: "uppercase", fontSize: "0.75rem", color: "inherit" }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} href="/login" size="small" sx={{ textTransform: "uppercase", fontSize: "0.75rem", color: "inherit" }}>
                    Login
                  </Button>
                  <Button component={Link} href="/register" size="small" variant="contained" color="secondary" sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}>
                    Register
                  </Button>
                </>
              )}
              <IconButton sx={{ display: { xs: "flex", md: "none" } }} onClick={() => setDrawerOpen(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {navLinks.map((l) => (
              <ListItem key={l.label} disablePadding>
                <ListItemButton component={Link} href={l.href} onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/cart" onClick={() => setDrawerOpen(false)}>
                <ListItemText primary={`Cart (${cart.length})`} />
              </ListItemButton>
            </ListItem>
            {user ? (
              <ListItem disablePadding>
                <ListItemButton onClick={() => { logout(); setDrawerOpen(false); }}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/register" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
