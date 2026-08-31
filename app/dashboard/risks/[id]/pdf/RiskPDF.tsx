/**
 * RiskPDF — PDF version of RiskView
 *
 * Uses @react-pdf/renderer components instead of HTML/Tailwind.
 * Mirrors the layout of RiskView as closely as possible.
 * No "use client" — this runs server-side in the route handler.
 */

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Styles ──────────────────────────────────────────────────────────────────
/**
 * PDF uses its own styling system — no Tailwind, no CSS classes.
 * All values are numbers (points) or strings.
 */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "2px solid #1A7A4A",
  },
  headerLabel: {
    fontSize: 7,
    color: "#1A7A4A",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerRef: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerActivity: {
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
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 12,
    border: "1px solid #A8D5B5",
    borderRadius: 6,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#1A7A4A",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sectionHeaderText: {
    color: "white",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBody: {
    padding: 10,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  gridItem: {
    width: "22%",
  },
  fieldLabel: {
    fontSize: 7,
    color: "#94a3b8",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 9,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
  },

  // ── Text area field ───────────────────────────────────────────────────────
  textBox: {
    border: "1px solid #A8D5B5",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#F5FAF6",
    marginTop: 4,
    fontSize: 9,
    color: "#334155",
  },

  // ── Assessment table ──────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1A7A4A",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: "white",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #D4EAD9",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: "#F5FAF6",
  },
  tableCell: {
    fontSize: 8,
    color: "#334155",
  },

  colHazard: { width: "16%", paddingRight: 4 },
  colImpact: { width: "13%", paddingRight: 4 },
  colControls: { width: "13%", paddingRight: 4 },
  colResponsible: { width: "13%", paddingRight: 4 },
  colSct: { width: "8%", paddingRight: 4 },
  colC: { width: "4%", textAlign: "center" },
  colF: { width: "4%", textAlign: "center" },
  colRf: { width: "6%", textAlign: "center" },
  colMeasures: { width: "20%", paddingLeft: 4 },

  // ── RF color badge ────────────────────────────────────────────────────────
  rfBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  // ── Additional measure ────────────────────────────────────────────────────
  measure: {
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: "1px solid #D4EAD9",
  },
  measureText: {
    fontSize: 7,
    color: "#334155",
    marginBottom: 2,
  },
  measureMeta: {
    flexDirection: "row",
    gap: 6,
  },
  measureMetaText: {
    fontSize: 7,
    color: "#64748b",
  },

  // ── Pills (team members, responsible persons) ─────────────────────────────
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  pill: {
    border: "1px solid #A8D5B5",
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
    borderTop: "1px solid #D4EAD9",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const raTypeLabel: Record<string, string> = {
  ROUTINE: "Routine",
  NON_ROUTINE: "Non Routine",
};

/** Returns background and text color for RF badge */
const getRFColors = (color: string | null | undefined) => {
  if (color === "GREEN") return { bg: "#22c55e", text: "white" };
  if (color === "YELLOW") return { bg: "#facc15", text: "white" };
  if (color === "RED") return { bg: "#dc2626", text: "white" };
  return { bg: "#f1f5f9", text: "#94a3b8" };
};

/** Returns state badge colors */
const getStateColors = (state: string) => {
  if (state === "TEMPLATE") return { bg: "#eff6ff", text: "#1d4ed8" };
  if (state === "COMPLETED") return { bg: "#ecfdf5", text: "#065f46" };
  return { bg: "#fffbeb", text: "#92400e" };
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RiskPDF({ risk }: { risk: any }) {
  const stateColors = getStateColors(risk.state);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Risk Assessment</Text>
          <Text style={styles.headerRef}>{risk.ref}</Text>
          <Text style={styles.headerActivity}>{risk.workActivity}</Text>
          <View
            style={[styles.stateBadge, { backgroundColor: stateColors.bg }]}
          >
            <Text
              style={{
                color: stateColors.text,
                fontSize: 8,
                fontFamily: "Helvetica-Bold",
              }}
            >
              {risk.state}
            </Text>
          </View>
        </View>

        {/* ── Basic Information ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Basic Information</Text>
          </View>
          <View style={styles.sectionBody}>
            {/* Grid of fields */}
            <View style={styles.grid}>
              {[
                { label: "Ref", value: risk.ref },
                { label: "Initiator", value: risk.initiator },
                {
                  label: "Initiation Date",
                  value: new Date(risk.initiationDate).toLocaleDateString(
                    "en-GB",
                  ),
                },
                {
                  label: "Review Date",
                  value: risk.reviewDate
                    ? new Date(risk.reviewDate).toLocaleDateString("en-GB")
                    : "—",
                },
                {
                  label: "RA Type",
                  value: raTypeLabel[risk.raType] ?? risk.raType,
                },
                { label: "Category", value: risk.libraryCategory ?? "—" },
                { label: "Library Index", value: risk.libraryIndex ?? "—" },
                { label: "Vessel / Dept", value: risk.vesselDepartment ?? "—" },
                { label: "Fleet", value: risk.fleet ?? "—" },
                {
                  label: "Defect Related",
                  value: risk.defectRelated ? "Yes" : "No",
                },
                { label: "Clone of", value: risk.cloneOf ?? "—" },
                {
                  label: "Created By",
                  value: risk.createdBy?.name ?? risk.createdBy?.email ?? "—",
                },
                {
                  label: "Updated By",
                  value: risk.stateUpdatedBy?.name ?? "—",
                },
              ].map(({ label, value }) => (
                <View key={label} style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <Text style={styles.fieldValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Work Activity */}
            {risk.workActivity && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.fieldLabel}>
                  Work Activity Being Assessed
                </Text>
                <View style={styles.textBox}>
                  <Text>{risk.workActivity}</Text>
                </View>
              </View>
            )}

            {/* Initiator Comments */}
            {risk.initiatorComment && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.fieldLabel}>Initiator Comments</Text>
                <View style={styles.textBox}>
                  <Text>{risk.initiatorComment}</Text>
                </View>
              </View>
            )}

            {/* Emergency Response */}
            {risk.emergencyResponse && (
              <View style={{ marginTop: 6 }}>
                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={styles.fieldLabel}>General Requirements / </Text>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: "#dc2626", fontFamily: "Helvetica-Bold" },
                    ]}
                  >
                    EMERGENCY RESPONSE
                  </Text>
                </View>
                <View style={styles.textBox}>
                  <Text>{risk.emergencyResponse}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Assessment of Risk ────────────────────────────────────────── */}
        {risk.assessmentRows?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Assessment of Risk</Text>
            </View>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colHazard]}>
                Hazard
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colImpact]}>
                Impact
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colControls]}>
                Existing Controls
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colResponsible]}>
                Responsible
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSct]}>SCT</Text>
              <Text style={[styles.tableHeaderCell, styles.colC]}>C</Text>
              <Text style={[styles.tableHeaderCell, styles.colF]}>F</Text>
              <Text style={[styles.tableHeaderCell, styles.colRf]}>RF</Text>
              <Text style={[styles.tableHeaderCell, styles.colMeasures]}>
                Measures
              </Text>
            </View>

            {/* Table rows */}
            {risk.assessmentRows.map((row: any, index: number) => {
              const rfColors = getRFColors(row.rfColor);
              return (
                <View
                  key={row.id}
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colHazard]}>
                    {row.hazard}
                  </Text>
                  <Text style={[styles.tableCell, styles.colImpact]}>
                    {row.impact}
                  </Text>
                  <Text style={[styles.tableCell, styles.colControls]}>
                    {row.existingControls ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colResponsible]}>
                    {row.responsiblePerson ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSct]}>
                    {row.sct ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colC]}>
                    {row.c ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colF]}>
                    {row.f ?? "—"}
                  </Text>

                  {/* RF Badge */}
                  <View style={[styles.colRf, { alignItems: "center" }]}>
                    <View
                      style={[styles.rfBadge, { backgroundColor: rfColors.bg }]}
                    >
                      <Text style={{ color: rfColors.text, fontSize: 7 }}>
                        {row.rf ?? "—"}
                      </Text>
                    </View>
                  </View>

                  {/* Additional Measures */}
                  <View style={styles.colMeasures}>
                    {row.additionalMeasures?.map((m: any, mIndex: number) => {
                      const mRfColors = getRFColors(m.rfColor);
                      return (
                        <View key={m.id} style={styles.measure}>
                          <Text style={styles.measureText}>
                            {mIndex + 1}. {m.furtherAction ?? "—"}
                          </Text>
                          <View style={styles.measureMeta}>
                            <Text style={styles.measureMetaText}>
                              C: {m.c ?? "—"}
                            </Text>
                            <Text style={styles.measureMetaText}>
                              F: {m.f ?? "—"}
                            </Text>
                            <Text style={styles.measureMetaText}>RF:</Text>
                            <View
                              style={[
                                styles.rfBadge,
                                { backgroundColor: mRfColors.bg },
                              ]}
                            >
                              <Text
                                style={{ color: mRfColors.text, fontSize: 6 }}
                              >
                                {m.rf ?? "—"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Alternative Ways ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              Alternative Ways to Carry Out the Work
            </Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={[styles.fieldValue, { marginBottom: 4 }]}>
              {risk.alternativeWays ? "Yes" : "No"}
            </Text>
            {risk.alternativeWays && risk.alternativeWaysText && (
              <View style={styles.textBox}>
                <Text>{risk.alternativeWaysText}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Responsible Interfaces ────────────────────────────────────── */}
        {(risk.masterOowDpo ||
          risk.personInCharge ||
          risk.authorizedTeamLeader ||
          risk.equipmentOperator ||
          risk.attendeesWorkTeam) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                Responsible Interfaces
              </Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.grid}>
                {risk.masterOowDpo && (
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>Master / OOW / DPO</Text>
                    <Text style={styles.fieldValue}>{risk.masterOowDpo}</Text>
                  </View>
                )}
                {risk.personInCharge && (
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>
                      Person in Charge (PIC)
                    </Text>
                    <Text style={styles.fieldValue}>{risk.personInCharge}</Text>
                  </View>
                )}
                {risk.authorizedTeamLeader && (
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>
                      Authorized Team Leader / Survey Lead
                    </Text>
                    <Text style={styles.fieldValue}>
                      {risk.authorizedTeamLeader}
                    </Text>
                  </View>
                )}
                {risk.equipmentOperator && (
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>Equipment Operator</Text>
                    <Text style={styles.fieldValue}>
                      {risk.equipmentOperator}
                    </Text>
                  </View>
                )}
                {risk.attendeesWorkTeam && (
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>Attendees / Work Team</Text>
                    <Text style={styles.fieldValue}>
                      {risk.attendeesWorkTeam}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Risk Assessment Team ──────────────────────────────────────── */}
        {risk.teamMembers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Risk Assessment Team</Text>
            </View>
            <View style={[styles.sectionBody, styles.pillRow]}>
              {risk.teamMembers.map((m: any) => (
                <View key={m.id} style={styles.pill}>
                  <Text>{m.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Approved By ───────────────────────────────────────────────── */}
        {risk.approvedBy && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Approval</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.fieldLabel}>Approved by the office</Text>
              <Text style={styles.fieldValue}>{risk.approvedBy}</Text>
            </View>
          </View>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {risk.ref} — {risk.state}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          {/* <Text style={styles.footerText}>
            Generated: {new Date().toLocaleDateString("en-GB")}
          </Text> */}
        </View>
      </Page>
    </Document>
  );
}
