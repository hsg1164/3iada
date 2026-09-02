import { Router } from "express";
import { supabase } from "../lib/supabase";

/**
 * Site contact messages ("تواصل معنا").
 *
 * - POST /contact            → public (landing form), registered BEFORE authMiddleware
 * - /contact-messages CRUD   → admin only, behind authMiddleware
 */

export const publicContactRouter = Router();

const MESSAGE_MAX = 4000;

publicContactRouter.post("/contact", async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body ?? {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (cleanName.length < 2 || cleanName.length > 120)
      return res.status(400).json({ error: "الاسم غير صالح" });
    if (!/^[\d+\-\s()]{7,20}$/.test(cleanPhone))
      return res.status(400).json({ error: "رقم الجوال غير صالح" });
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
    if (cleanMessage.length < 5 || cleanMessage.length > MESSAGE_MAX)
      return res.status(400).json({ error: "نص الرسالة قصير جداً أو طويل جداً" });

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || null,
        subject: cleanSubject || "استفسار عام",
        message: cleanMessage,
      })
      .select("id")
      .single();

    if (error) throw error;
    return res.status(201).json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    req.log.error({ err }, "create contact message error");
    return res.status(500).json({ error: "تعذر إرسال الرسالة، حاول لاحقاً" });
  }
});

/* ------------------------------ Admin routes ----------------------------- */

export const contactMessagesRouter = Router();

const STATUSES = new Set(["new", "read", "replied", "archived"]);

contactMessagesRouter.get("/contact-messages", async (req, res) => {
  try {
    const { status, q } = req.query;
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (typeof status === "string" && STATUSES.has(status)) {
      query = query.eq("status", status);
    }
    if (typeof q === "string" && q.trim().length >= 2) {
      const term = q.trim();
      query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data ?? []);
  } catch (err) {
    req.log.error({ err }, "list contact messages error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

contactMessagesRouter.get("/contact-messages/summary", async (_req, res) => {
  try {
    const { count: total, error: e1 } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true });
    const { count: unread, error: e2 } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    const { count: replied, error: e3 } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "replied");
    if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;
    return res.json({ total: total ?? 0, unread: unread ?? 0, replied: replied ?? 0 });
  } catch (err) {
    _req.log.error({ err }, "contact summary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

contactMessagesRouter.patch("/contact-messages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "معرف غير صالح" });

    const { status, replyNote } = req.body ?? {};
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) {
      if (!STATUSES.has(status)) return res.status(400).json({ error: "حالة غير معروفة" });
      updates.status = status;
    }
    if (replyNote !== undefined) {
      updates.reply_note = typeof replyNote === "string" ? replyNote.slice(0, 2000) : null;
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "الرسالة غير موجودة" });
    return res.json(data);
  } catch (err) {
    req.log.error({ err }, "update contact message error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

contactMessagesRouter.delete("/contact-messages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "معرف غير صالح" });

    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete contact message error");
    return res.status(500).json({ error: "Internal server error" });
  }
});
