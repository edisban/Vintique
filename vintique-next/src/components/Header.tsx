"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useColorScheme } from "@mui/material/styles";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import { glass } from "@/theme";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const navLinks = [
  { href: "/", label: "Shop" },
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function ActiveNavButtons() {
  return <NavButtons pathname={usePathname()} />;
}

function NavButtons({ pathname }: { pathname: string | null }) {
  return navLinks.map((l) => {
    const active = !!pathname && (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href));
    return (
      <Button
        key={l.href}
        component={Link}
        href={l.href}
        sx={{ color: active ? "text.primary" : "text.secondary", fontWeight: active ? 700 : 500, "&:hover": { color: "text.primary" } }}
      >
        {l.label}
      </Button>
    );
  });
}

export default function Header() {
  const { count } = useCart();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);
  const userId = user?.id;

  // Poll the unread message count while signed in. Also refresh when the tab regains focus
  // and when a conversation is opened (the thread page fires "messages-read").
  useEffect(() => {
    if (!userId) return;
    const load = () =>
      fetch("/api/conversations/unread")
        .then((r) => r.json())
        .then((d) => setUnread(d.count ?? 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 20000);
    window.addEventListener("focus", load);
    window.addEventListener("messages-read", load);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", load);
      window.removeEventListener("messages-read", load);
    };
  }, [userId]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = async () => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={(theme) => ({
          transition: "all .25s ease",
          borderBottom: "1px solid transparent",
          ...(scrolled && { ...glass(theme), borderRadius: 0, borderWidth: "0 0 1px 0" }),
        })}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
            <Typography
              component={Link}
              href="/"
              variant="h5"
              sx={{ fontWeight: 600, letterSpacing: "0.28em", textDecoration: "none", color: "secondary.main", mr: 2 }}
            >
              VINTIQUE
            </Typography>
            <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, flexGrow: 1 }}>
              {/* usePathname is request data on dynamic routes, so it must sit inside Suspense */}
              <Suspense fallback={<NavButtons pathname={null} />}>
                <ActiveNavButtons />
              </Suspense>
            </Box>
            <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
                <IconButton onClick={() => setMode(isDark ? "light" : "dark")} aria-label="Toggle dark mode">
                  {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
              <Button
                component={Link}
                href="/?add=1"
                scroll={false}
                variant="contained"
                color="secondary"
                sx={{ display: { xs: "none", sm: "inline-flex" }, mr: 0.5 }}
              >
                Sell now
              </Button>
              {user && (
                <Tooltip title="Messages">
                  <IconButton component={Link} href="/messages" aria-label={`Messages, ${unread} unread`}>
                    <Badge badgeContent={unread} color="primary">
                      <ChatBubbleOutlineIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Bag">
                <IconButton component={Link} href="/cart" aria-label={`Bag, ${count} items`}>
                  <Badge badgeContent={count} color="secondary">
                    <ShoppingBagOutlinedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              {user ? (
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu" sx={{ ml: 0.5 }}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: 15, bgcolor: "primary.main", color: "primary.contrastText" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              ) : (
                !isPending && (
                  <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, ml: 1 }}>
                    <Button component={Link} href="/login" color="inherit">
                      Sign in
                    </Button>
                    <Button component={Link} href="/register" variant="outlined" color="inherit">
                      Join
                    </Button>
                  </Box>
                )
              )}
              <IconButton sx={{ display: { xs: "inline-flex", md: "none" } }} onClick={() => setDrawerOpen(true)} aria-label="Menu">
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
          <Typography sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href="/?add=1" scroll={false} onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          Sell a piece
        </MenuItem>
        <MenuItem component={Link} href="/orders" onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <ReceiptLongOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Orders
        </MenuItem>
        <MenuItem component={Link} href="/listings" onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <SellOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Your listings
        </MenuItem>
        {user?.role === "ADMIN" && (
          <MenuItem component={Link} href="/admin" onClick={() => setMenuAnchor(null)}>
            <ListItemIcon>
              <AdminPanelSettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Admin
          </MenuItem>
        )}
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "var(--font-serif)", letterSpacing: "0.2em", color: "secondary.main", px: 2, py: 1 }}>
            VINTIQUE
          </Typography>
          <List>
            {navLinks.map((l) => (
              <ListItemButton key={l.href} component={Link} href={l.href} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={Link} href="/cart" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
              <ListItemText primary={`Bag (${count})`} />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            {user ? (
              <>
                <ListItemButton component={Link} href="/?add=1" scroll={false} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Sell a piece" />
                </ListItemButton>
                <ListItemButton component={Link} href="/messages" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary={unread ? `Messages (${unread})` : "Messages"} />
                </ListItemButton>
                <ListItemButton component={Link} href="/orders" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Orders" />
                </ListItemButton>
                <ListItemButton component={Link} href="/listings" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Your listings" />
                </ListItemButton>
                {user.role === "ADMIN" && (
                  <ListItemButton component={Link} href="/admin" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                    <ListItemText primary="Admin" />
                  </ListItemButton>
                )}
                <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Sign out" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={Link} href="/login" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Sign in" />
                </ListItemButton>
                <ListItemButton component={Link} href="/register" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Create account" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
