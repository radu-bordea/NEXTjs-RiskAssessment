import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

/** Escapes user-typed text before putting it into the email HTML */
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/**
 * sendSafetyMeetingNotification — emails MANAGER and MEMBER users when
 * something happens to a Safety Meeting / Toolbox Talk.
 *
 * Recipients: Managers and Members, including the person who did the action.
 * ADMIN is excluded for now (client request) — add "ADMIN" to the role
 * list below to include admins later.
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
    const recipients = await prisma.user.findMany({
      where: { role: { in: ["MANAGER", "MEMBER"] } },
      select: { email: true },
    })

    if (recipients.length === 0) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://marineqhse.com"
    const meetingUrl = `${appUrl}/safetymeetingsdashboard/meetings/${meeting.id}`

    // A deleted record has no page to link to
    const actionBlock =
      action === "Deleted"
        ? `<p style="color:#94a3b8;font-size:13px;">This record has been permanently deleted.</p>`
        : `<a href="${meetingUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">View Toolbox Talk</a>`

    const { error } = await resend.emails.send({
      from: "MarineGuard Notifications <notifications@marineqhse.com>",
      to: recipients.map((r) => r.email),
      subject: `[Safety Meeting] ${action} — ${meeting.projectSurvey}`,
      html: `
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
      `,
    })

    if (error) console.error("sendSafetyMeetingNotification Resend error:", error)
  } catch (error) {
    console.error("sendSafetyMeetingNotification error:", error)
  }
}