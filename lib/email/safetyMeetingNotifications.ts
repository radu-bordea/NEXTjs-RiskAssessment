import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

/** Escapes user-typed text before putting it into the email HTML */
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Resend accepts max 100 emails per batch call */
const BATCH_SIZE = 100

/**
 * sendSafetyMeetingNotification — emails users when something happens to a
 * Safety Meeting / Toolbox Talk.
 *
 * Recipients (client rule):
 *  - ADMIN + MANAGER → notified about EVERY action, by anyone, on all vessels
 *  - MEMBER (vessel)  → NO notifications at all
 *    (a Member is a vessel account shared by several crew members)
 *
 * Each recipient gets their OWN email (batch send), so nobody can see
 * the other recipients' email addresses.
 *
 * Never throws: an email failure must not break the database operation.
 */
export async function sendSafetyMeetingNotification({
  action,
  meeting,
  actorName,
}: {
  action: string
  meeting: { id: string; projectSurvey: string; activityTask: string; state: string }
  actorName: string
}) {
  try {
    // Only Admins + Managers — Members (vessels) get no emails
    const recipients = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] } },
      select: { email: true },
    })

    // Remove duplicates / empty values, just in case
    const emails: string[] = Array.from(
      new Set(recipients.map((r) => r.email).filter(Boolean)),
    )
    if (emails.length === 0) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://marineqhse.com"
    const meetingUrl = `${appUrl}/safetymeetingsdashboard/meetings/${meeting.id}`

    // A deleted record has no page to link to
    const actionBlock =
      action === "Deleted"
        ? `<p style="color:#94a3b8;font-size:13px;">This record has been permanently deleted.</p>`
        : `<a href="${meetingUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">View Toolbox Talk</a>`

    const subject = `[Safety Meeting] ${action} — ${meeting.projectSurvey}`
    const html = `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#2563eb;">${escapeHtml(meeting.projectSurvey)}</h2>
          <p style="color:#334155;">${escapeHtml(meeting.activityTask)}</p>

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
              <td style="padding:6px 0;">${meeting.state}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:13px;">Date</td>
              <td style="padding:6px 0;">${new Date().toLocaleDateString("en-GB")}</td>
            </tr>
          </table>

          ${actionBlock}
        </div>
      `

    // One email per recipient → addresses stay private
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE)
      const { error } = await resend.batch.send(
        chunk.map((to) => ({
          from: "MarineGuard Notifications <notifications@marineqhse.com>",
          to: [to],
          subject,
          html,
        })),
      )
      // Resend returns API errors instead of throwing them, so check explicitly
      if (error) console.error("sendSafetyMeetingNotification Resend error:", error)
    }
  } catch (error) {
    console.error("sendSafetyMeetingNotification error:", error)
  }
}