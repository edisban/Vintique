"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import type { ConversationSummary } from "@/lib/types";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function MessagesPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const load = () =>
      fetch("/api/conversations")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setConversations)
        .catch(() => setError("Could not load your messages"));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [userId]);

  if (!isPending && !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Messages
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to chat with buyers and sellers.
          </Typography>
          <Button component={Link} href="/login" variant="contained">
            Sign in
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Messages
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!conversations ? (
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 5 }} />
          ))}
        </Stack>
      ) : conversations.length === 0 ? (
        <Card sx={{ py: 8, px: 3, textAlign: "center" }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: "secondary.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            No conversations yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Have a question about a piece? Open it and tap &ldquo;Message seller&rdquo;.
          </Typography>
          <Button component={Link} href="/#shop" variant="contained">
            Browse listings
          </Button>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {conversations.map((c) => {
            const other = c.buyerId === userId ? c.seller : c.buyer;
            const mine = c.lastMessage?.senderId === userId;
            return (
              <Card key={c.id}>
                <CardActionArea component={Link} href={`/messages/${c.id}`} sx={{ p: 2, display: "flex", gap: 2, justifyContent: "flex-start" }}>
                  <Badge color="primary" badgeContent={c.unread} overlap="circular">
                    <Avatar variant="rounded" src={c.product?.image} sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: "action.hover" }}>
                      {other.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontWeight: c.unread ? 700 : 600 }} noWrap>
                        {other.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {timeAgo(c.lastMessage?.createdAt ?? c.updatedAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.product?.title ?? "Listing removed"}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: c.unread ? 600 : 400, color: c.unread ? "text.primary" : "text.secondary" }}>
                      {c.lastMessage ? `${mine ? "You: " : ""}${c.lastMessage.body}` : "No messages yet"}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
