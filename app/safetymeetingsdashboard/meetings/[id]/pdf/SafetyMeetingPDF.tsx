/**
 * SafetyMeetingPDF — PDF version of SafetyMeetingView
 *
 * Uses @react-pdf/renderer components instead of HTML/Tailwind.
 * Mirrors the "only show what has data" pattern of SafetyMeetingView.
 * No "use client" — this runs server-side in the route handler.
 *
 * Note: Selected Toolbox Talk Cards show code/title/tags only —
 * no images, per client's decision.
 */

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 55, // leaves room for the fixed footer so content never runs under it
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "2px solid #dc2626",
  },
  headerLabel: {
    fontSize: 7,
    color: "#dc2626",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 9,
    color: "#64748b",
  },
  stateBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 10,
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: 10,
  },
  sectionHeading: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#991b1b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: "1px solid #fee2e2",
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "23%",
  },
  fieldLabel: {
    fontSize: 7,
    color: "#94a3b8",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 9,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
  },

  // ── Text box ──────────────────────────────────────────────────────────────
  textBox: {
    border: "1px solid #fecaca",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#fef2f2",
    marginTop: 4,
    fontSize: 9,
    color: "#334155",
  },

  // ── Tags ──────────────────────────────────────────────────────────────────
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    border: "1px solid #fecaca",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 7,
    color: "#475569",
    backgroundColor: "#fef2f2",
  },

  // ── Cards list ────────────────────────────────────────────────────────────
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    borderBottom: "1px solid #fee2e2",
  },
  cardCode: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    width: 45,
  },
  cardTitle: {
    fontSize: 8,
    color: "#334155",
    flex: 1,
  },

  // ── Confirmations list ────────────────────────────────────────────────────
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  confirmCheck: {
    fontSize: 9,
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },
  confirmLabel: {
    fontSize: 8,
    color: "#334155",
  },

  // ── Pills (team members) ─────────────────────────────────────────────────
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  pill: {
    border: "1px solid #fecaca",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    color: "#475569",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #fee2e2",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

// ─── Confirm with the Team — labels ────────────────────────────────────────────
const TEAM_CONFIRMATION_LABELS: Record<string, string> = {
  taskSequenceRoles: "Task sequence and individual roles are understood",
  criticalHazards: "Critical hazards and controls have been discussed",
  stopMakeSafe: "Stop / Make Safe / Reassess criteria are understood",
  emergencyActions: "Emergency actions and communication method are understood",
  lmraRequired: "LMRA Required at work site",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SafetyMeetingPDF({ meeting }: { meeting: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Safety Meeting / Toolbox Talk</Text>
          <Text style={styles.headerTitle}>{meeting.projectSurvey}</Text>
          <Text style={styles.headerSub}>{meeting.activityTask}</Text>
          <View style={styles.stateBadge}>
            <Text>{meeting.state}</Text>
          </View>
        </View>

        {/* ── Task & Project Information ───────────────────────────────── */}
        {/* Left wrap-enabled: this section is the longest and is fine to split across pages */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Task & Project Information</Text>
          <View style={styles.grid}>
            {[
              { label: "Project / Survey", value: meeting.projectSurvey },
              { label: "Contract No.", value: meeting.contractNo ?? "—" },
              {
                label: "Vessel / Installation",
                value: meeting.vesselInstallation,
              },
              {
                label: "Date",
                value: new Date(meeting.date).toLocaleDateString("en-GB"),
              },
              {
                label: "Location / Area / Deck",
                value: meeting.locationAreaDeck,
              },
              { label: "Start Time", value: meeting.startTime ?? "—" },
              {
                label: "Expected Finish",
                value: meeting.expectedFinish ?? "—",
              },
              {
                label: "Toolbox Talk Leader",
                value: meeting.toolboxTalkLeader,
              },
              {
                label: "First time / non-routine task",
                value: meeting.firstTimeNonRoutine ? "Yes" : "No",
              },
              {
                label: "SIMOPS involved",
                value: meeting.simopsInvolved ? "Yes" : "No",
              },
            ].map(({ label, value }) => (
              <View key={label} style={styles.gridItem}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 6 }}>
            <Text style={styles.fieldLabel}>
              Task Objective / Brief Description
            </Text>
            <View style={styles.textBox}>
              <Text>{meeting.taskObjective}</Text>
            </View>
          </View>
        </View>

        {/* ── Operational Context ──────────────────────────────────────── */}
        {(meeting.vesselStatus ||
          meeting.weatherSeaState ||
          meeting.workAreaStatus ||
          meeting.dayNight ||
          meeting.nearbyOperations) && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>Operational Context</Text>
            <View style={styles.grid}>
              {meeting.vesselStatus && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Vessel status</Text>
                  <Text style={styles.fieldValue}>{meeting.vesselStatus}</Text>
                </View>
              )}
              {meeting.weatherSeaState && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Weather / Sea State</Text>
                  <Text style={styles.fieldValue}>
                    {meeting.weatherSeaState}
                  </Text>
                </View>
              )}
              {meeting.workAreaStatus && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Work area status</Text>
                  <Text style={styles.fieldValue}>
                    {meeting.workAreaStatus}
                  </Text>
                </View>
              )}
              {meeting.dayNight && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Day / Night</Text>
                  <Text style={styles.fieldValue}>{meeting.dayNight}</Text>
                </View>
              )}
              {meeting.nearbyOperations && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Nearby operations</Text>
                  <Text style={styles.fieldValue}>
                    {meeting.nearbyOperations}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Responsible Interfaces ───────────────────────────────────── */}
        {(meeting.masterOowDpo ||
          meeting.deckPic ||
          meeting.surveyLead ||
          meeting.equipmentOperator ||
          meeting.responsibleInterfacesOther) && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>Responsible Interfaces</Text>
            <View style={styles.grid}>
              {meeting.masterOowDpo && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Master / OOW / DPO</Text>
                  <Text style={styles.fieldValue}>{meeting.masterOowDpo}</Text>
                </View>
              )}
              {meeting.deckPic && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Deck PIC</Text>
                  <Text style={styles.fieldValue}>{meeting.deckPic}</Text>
                </View>
              )}
              {meeting.surveyLead && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Survey Lead</Text>
                  <Text style={styles.fieldValue}>{meeting.surveyLead}</Text>
                </View>
              )}
              {meeting.equipmentOperator && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Equipment Operator</Text>
                  <Text style={styles.fieldValue}>
                    {meeting.equipmentOperator}
                  </Text>
                </View>
              )}
            </View>
            {meeting.responsibleInterfacesOther && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.fieldLabel}>Others</Text>
                <View style={styles.textBox}>
                  <Text>{meeting.responsibleInterfacesOther}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Selected Toolbox Talk Cards — code/title/tags only ────────── */}
        {meeting.selectedCards?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>
              Selected Toolbox Talk Cards
            </Text>
            {meeting.selectedCards.map((sc: any) => (
              <View key={sc.id} style={styles.cardRow} wrap={false}>
                <Text style={styles.cardCode}>{sc.card.code}</Text>
                <Text style={styles.cardTitle}>{sc.card.title}</Text>
                <View style={styles.tagRow}>
                  {sc.card.tags.map((tag: string) => (
                    <Text key={tag} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Confirm with the Team ────────────────────────────────────── */}
        {(meeting.teamConfirmations?.length > 0 ||
          meeting.teamConfirmationsOther) && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>Confirm with the Team</Text>
            {meeting.teamConfirmations?.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                {meeting.teamConfirmations.map((key: string) => (
                  <View key={key} style={styles.confirmRow} wrap={false}>
                    <Text style={styles.confirmCheck}>✓</Text>
                    <Text style={styles.confirmLabel}>
                      {TEAM_CONFIRMATION_LABELS[key] ?? key}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {meeting.teamConfirmationsOther && (
              <View>
                <Text style={styles.fieldLabel}>Others</Text>
                <View style={styles.textBox}>
                  <Text>{meeting.teamConfirmationsOther}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Team Members ──────────────────────────────────────────────── */}
        {meeting.teamMembers?.length > 0 && (
          <View style={styles.section} wrap={false} minPresenceAhead={80}>
            <Text style={styles.sectionHeading}>Team Members</Text>
            <View style={styles.pillRow}>
              {meeting.teamMembers.map((m: any) => (
                <Text key={m.id} style={styles.pill}>
                  {m.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {meeting.projectSurvey} — {meeting.state}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={styles.footerText}>
            Generated: {new Date().toLocaleDateString("en-GB")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}