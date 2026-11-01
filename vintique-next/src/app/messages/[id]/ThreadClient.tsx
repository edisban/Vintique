"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import type { ConversationThread } from "@/lib/types";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

const POLL_MS = 4000;

export default function ThreadClient() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [thread, setThread] = useState<ConversationThread | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  // Poll for new messages. Simple and reliable; a WebSocket would be the next step at scale.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = () =>
      fetch(`/api/conversations/${id}`)
        .then((r) => {
          if (r.status === 404) {
            if (!cancelled) setNotFound(true);
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then((t: ConversationThread | null) => {
          if (!t || cancelled) return;
          setThread(t);
          // Opening the thread marks messages as read on the server; tell the header badge
          window.dispatchEvent(new Event("messages-read"));
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id, userId]);

  // Scroll to the newest message when one arrives
  useEffect(() => {
    const count = thread?.messages.length ?? 0;
    if (count !== lastCount.current) bottomRef.current?.scrollIntoView({ behavior: lastCount.current ? "smooth" : "auto" });
    lastCount.current = count;
  }, [thread]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error || "Message not sent");
    const message = await res.json();
    setText("");
    setThread((t) => t && { ...t, messages: [...t.messages, message] });
  };

  if (notFound) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Conversation not found
        </Typography>
        <Button component={Link} href="/messages" variant="contained">
          Back to messages
        </Button>
      </Container>
    );
  }

  if (!thread || !userId) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const other = thread.buyerId === userId ? thread.seller : thread.buyer;
  const iAmSeller = thread.sellerId === userId;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Card sx={{ display: "flex", flexDirection: "column", height: { xs: "calc(100vh - 140px)", md: "calc(100vh - 200px)" }, minHeight: 480 }}>
        {/* Header with the other person and the listing */}
        <Stack direction="row" spacing={1.5} sx={{ p: 2, alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
          <IconButton component={Link} href="/messages" aria-label="Back to messages">
            <ArrowBackIcon />
          </IconButton>
          {thread.product && (
            <Box
              component={Link}
              href={`/products/${thread.product.id}`}
              sx={{ width: 44, aspectRatio: "4 / 5", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}
            >
              <Box component="img" src={thread.product.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </Box>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {other.name}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {iAmSeller ? "Buyer" : "Seller"}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {thread.product ? `${thread.product.title} · ${formatPrice(thread.product.price)}` : "Listing removed"}
            </Typography>
          </Box>
          {thread.product?.status === "SOLD" && <Chip label="Sold" size="small" />}
        </Stack>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {thread.messages.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: "center", my: "auto" }}>
              {iAmSeller ? "Say hello to your buyer." : `Ask ${other.name} about size, condition or anything else.`}
            </Typography>
          )}
          {thread.messages.map((m) => {
            const mine = m.senderId === userId;
            return (
              <Box
                key={m.id}
                sx={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  px: 2,
                  py: 1.25,
                  borderRadius: 4,
                  borderBottomRightRadius: mine ? 6 : undefined,
                  borderBottomLeftRadius: mine ? undefined : 6,
                  bgcolor: mine ? "primary.main" : "action.hover",
                  color: mine ? "primary.contrastText" : "text.primary",
                }}
              >
                <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: "block", textAlign: "right", mt: 0.25 }}>
                  {new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  {mine && m.readAt && " · Seen"}
                </Typography>
              </Box>
            );
          })}
          <div ref={bottomRef} />
        </Box>

        {/* Composer */}
        <Box component="form" onSubmit={send} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
            <TextField
              placeholder="Write a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              multiline
              maxRows={4}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { maxLength: 2000, "aria-label": "Message" } }}
            />
            <IconButton type="submit" disabled={!text.trim() || sending} aria-label="Send" sx={{ bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Card>
    </Container>
  );
}
