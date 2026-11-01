"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product; onAdd?: (p: Product) => void; isOwn?: boolean };

export default function ProductCard({ product: p, onAdd, isOwn }: Props) {
  const sold = p.status === "SOLD";
  const details = [p.size && `Size ${p.size}`, p.condition].filter(Boolean).join(" · ");
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform .3s ease",
        "&:hover": { transform: "translateY(-4px)" },
        "&:hover img": { transform: "scale(1.06)" },
      }}
    >
      <CardActionArea component={Link} href={`/products/${p.id}`} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Box sx={{ aspectRatio: "4 / 5", overflow: "hidden", m: 1.25, mb: 0, borderRadius: 3.5, position: "relative" }}>
          <Box
            component="img"
            src={p.image}
            alt={p.title}
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease", filter: sold ? "grayscale(.7)" : "none" }}
          />
          {(sold || isOwn) && (
            <Chip
              label={sold ? "Sold" : "Your listing"}
              size="small"
              color={sold ? "default" : "secondary"}
              sx={{ position: "absolute", top: 10, left: 10, fontWeight: 600, bgcolor: sold ? "background.paper" : undefined }}
            />
          )}
        </Box>
        <Box sx={{ p: 2, pb: 1, flexGrow: 1 }}>
          {p.brand && (
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6, display: "block" }} noWrap>
              {p.brand}
            </Typography>
          )}
          <Typography sx={{ fontWeight: 500 }} noWrap>
            {p.title}
          </Typography>
          {details && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {details}
            </Typography>
          )}
        </Box>
      </CardActionArea>
      <Box sx={{ px: 2, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="p">
            {formatPrice(p.price)}
          </Typography>
          {p.seller && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              by {p.seller.name}
            </Typography>
          )}
        </Box>
        {onAdd && !isOwn && !sold && (
          <Tooltip title="Add to bag">
            <IconButton
              onClick={() => onAdd(p)}
              aria-label={`Add ${p.title} to bag`}
              sx={{ bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }}
            >
              <AddShoppingCartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card sx={{ p: 1.25 }}>
      <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 5", height: "auto", borderRadius: 3.5 }} />
      <Box sx={{ p: 1 }}>
        <Skeleton width="40%" />
        <Skeleton width="80%" />
        <Skeleton width="30%" height={32} />
      </Box>
    </Card>
  );
}
