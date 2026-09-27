import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

/**
 * sendRiskNotification — sends an email to all ADMIN/MANAGER users
 * whenever a meaningful Risk event happens (Template created,
 * Draft created, Draft submitted/completed).
 *
 * Does NOT notify the person who performed the action themselves.
 *
 * @param action - Human-readable action description (e.g. "Template Created")
 * @param risk - The risk record (needs at least: id, ref, workActivity, state)
 * @param actorName - Name/email of the person who did the action
 * @param actorId - Clerk userId of the person who did the action (excluded from recipients)
 */
export async function sendRiskNotification({
  action,
  risk,
  actorName,
  actorId,
}: {
  action: string
  risk: { id: string; ref: string; workActivity: string; state: string }
  actorName: string
  actorId: string
}) {
  try {
    // Get all Admin/Manager users, excluding the person who did the action
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "MANAGER"] },
        id: { not: actorId },
      },
      select: { email: true },
    })

    if (recipients.length === 0) return

    const emails = recipients.map((r) => r.email)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://marineqhse.com"
    const riskUrl = `${appUrl}/dashboard/risks/${risk.id}`

    await resend.emails.send({
      from: "MarineGuard Notifications <notifications@marineqhse.com>",
      to: emails,
      subject: `[Risk Assessment] ${action} — ${risk.ref}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1A7A4A;">${risk.ref}</h2>
          <p style="color: #334155;">${risk.workActivity}</p>

          <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Action</td>
              <td style="padding: 6px 0; font-weight: bold;">${action}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">By</td>
              <td style="padding: 6px 0;">${actorName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">State</td>
              <td style="padding: 6px 0;">${risk.state}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Date</td>
              <td style="padding: 6px 0;">${new Date().toLocaleDateString("en-GB")}</td>
            </tr>
          </table>

          <a href="${riskUrl}" style="display: inline-block; background: #1A7A4A; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
            View Risk Assessment
          </a>
        </div>
      `,
    })
  } catch (error) {
    // Log but never throw — email failure should never break the actual DB operation
    console.error("sendRiskNotification error:", error)
  }
}