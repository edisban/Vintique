"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

const channels = [
  { icon: <PhoneOutlinedIcon />, title: "Phone", value: "+30 210 123 4567", href: "tel:+302101234567" },
  { icon: <MailOutlineIcon />, title: "Email", value: "info@vintique.com", href: "mailto:info@vintique.com" },
  { icon: <ScheduleOutlinedIcon />, title: "Hours", value: "Mon–Sat, 10:00–19:00" },
];

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="overline" color="secondary">
          Contact
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, mb: 2 }}>
          Get in touch
        </Typography>
        <Typography color="text.secondary">Questions about buying, selling or a listing you want us to review? We&apos;re happy to help.</Typography>
      </Box>
      <Grid container spacing={3}>
        {channels.map((c) => {
          const content = (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Box sx={{ width: 52, height: 52, mx: "auto", borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "action.hover", color: "secondary.main", mb: 2 }}>
                {c.icon}
              </Box>
              <Typography variant="overline" color="text.secondary">
                {c.title}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{c.value}</Typography>
            </Box>
          );
          return (
            <Grid key={c.title} size={{ xs: 12, sm: 4 }}>
              <Card sx={{ height: "100%" }}>{c.href ? <CardActionArea href={c.href} sx={{ height: "100%" }}>{content}</CardActionArea> : content}</Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
