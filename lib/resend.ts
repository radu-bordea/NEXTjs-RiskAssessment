import { Resend } from "resend"

/**
 * Resend client singleton — used to send transactional emails.
 * Falls back to a dummy key locally if RESEND_API_KEY isn't set,
 * so local builds don't crash. Emails simply won't send locally
 * without a real key — that's expected during local dev.
 */
export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")