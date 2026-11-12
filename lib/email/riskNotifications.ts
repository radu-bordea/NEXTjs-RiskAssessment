import { resend } from "@/lib/resend";
import prisma from "@/lib/prisma";

/** Escapes user-typed text before putting it into the email HTML */
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Resend accepts max 100 emails per batch call */
const BATCH_SIZE = 100;

/**
 * sendRiskNotification — emails users when a Risk event happens
 * (Template created, Draft created, Draft submitted/completed).
 *
 * Recipients (client rule):
 *  - ADMIN + MANAGER → notified about EVERYTHING, all vessels
 *  - MEMBER (vessel) → notified ONLY about risks they own (ownerId)
 *    → other vessels never receive emails about someone else's risk
 *
 * Each recipient gets their OWN email (batch send), so nobody can see
 * the other recipients' email addresses.
 *
 * Never throws: an email failure must not break the database operation.
 *
 * @param action    - Human-readable action description (e.g. "Template Created")
 * @param risk      - The risk record (needs at least: id, ref, workActivity, state)
 * @param ownerId   - createdById of the risk — the vessel that owns it
 * @param actorName - Name/email of the person who did the action
 * @param actorId   - Not used for filtering right now. Kept so the actor can be
 *                    excluded later with: id: { not: actorId }
 */
export async function sendRiskNotification({
  action,
  risk,
  ownerId,
  actorName,
  actorId,
}: {
  action: string;
  risk: { id: string; ref: string; workActivity: string; state: string };
  ownerId: string;
  actorName: string;
  actorId: string;
}) {
  try {
    // Admins + Managers (everything) OR the owner of this risk
    const recipients = await prisma.user.findMany({
      where: {
        OR: [{ role: { in: ["ADMIN", "MANAGER"] } }, { id: ownerId }],
      },
      select: { email: true },
    });

    // Remove duplicates / empty values, just in case
    const emails: string[] = Array.from(
      new Set(recipients.map((r) => r.email).filter(Boolean)),
    );
    if (emails.length === 0) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://marineqhse.com";
    const riskUrl = `${appUrl}/dashboard/risks/${risk.id}`;

    // A deleted record has no page to link to
    const actionBlock =
      action === "Deleted"
        ? `<p style="color:#94a3b8;font-size:13px;">This record has been permanently deleted.</p>`
        : `<a href="${riskUrl}" style="display:inline-block;background:#1A7A4A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">View Risk Assessment</a>`;

    const subject = `[Risk Assessment] ${action} — ${risk.ref}`;
    const html = `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#1A7A4A;">${escapeHtml(risk.ref)}</h2>
          <p style="color:#334155;">${escapeHtml(risk.workActivity.slice(0, 200))}</p>

          <table style="width:100%;margin:16px 0;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:13px;">Action</td>
              <td style="padding:6px 0;font-weight:bold;">${escapeHtml(action)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:13px;">By</td>
              <td style="padding:6px 0;">${escapeHtml(actorName)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:13px;">State</td>
              <td style="padding:6px 0;">${risk.state}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:13px;">Date</td>
              <td style="padding:6px 0;">${new Date().toLocaleDateString("en-GB")}</td>
            </tr>
          </table>

          ${actionBlock}
        </div>
      `;

    // One email per recipient → addresses stay private
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE);
      const { error } = await resend.batch.send(
        chunk.map((to) => ({
          from: "MarineGuard Notifications <notifications@marineqhse.com>",
          to: [to],
          subject,
          html,
        })),
      );
      // Resend returns API errors instead of throwing them, so check explicitly
      if (error) console.error("sendRiskNotification Resend error:", error);
    }
  } catch (error) {
    console.error("sendRiskNotification error:", error);
  }
}