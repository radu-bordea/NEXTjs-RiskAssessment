/**
 * ObservationPDF — PDF version of ObservationView
 *
 * Uses @react-pdf/renderer components instead of HTML/Tailwind.
 * Mirrors the layout and "only show what has data" pattern of ObservationView.
 * No "use client" — this runs server-side in the route handler.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import {
  OBSERVATION_SOURCES,
  LIFE_SAVING_RULES,
  RISK_PRIORITIES,
  ROOT_CAUSES,
} from "../../../_components/observationOptions"

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding:         30,
    fontFamily:      "Helvetica",
    fontSize:        9,
    color:           "#1e293b",
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom:  16,
    paddingBottom: 10,
    borderBottom:  "2px solid #d97706",
  },
  headerLabel: {
    fontSize:      7,
    color:         "#d97706",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom:  4,
  },
  headerTitle: {
    fontSize:    16,
    fontFamily:  "Helvetica-Bold",
    color:       "#1e293b",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 9,
    color:    "#64748b",
  },
  stateBadge: {
    marginTop:         6,
    alignSelf:         "flex-start",
    paddingVertical:   3,
    paddingHorizontal: 8,
    borderRadius:      10,
    fontSize:          8,
    fontFamily:        "Helvetica-Bold",
    backgroundColor:   "#ecfdf5",
    color:             "#065f46",
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 10,
    border:       "1px solid #fde68a",
    borderRadius: 6,
    padding:      10,
  },
  sectionHeading: {
    fontSize:      8,
    fontFamily:    "Helvetica-Bold",
    color:         "#92400e",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom:  6,
    paddingBottom: 4,
    borderBottom:  "1px solid #fef3c7",
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           8,
  },
  gridItem: {
    width: "23%",
  },
  fieldLabel: {
    fontSize:      7,
    color:         "#94a3b8",
    marginBottom:  2,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize:   9,
    color:      "#1e293b",
    fontFamily: "Helvetica-Bold",
  },

  // ── Text box ──────────────────────────────────────────────────────────────
  textBox: {
    border:          "1px solid #fde68a",
    borderRadius:    4,
    padding:         6,
    backgroundColor: "#fffbeb",
    marginTop:       4,
    fontSize:        9,
    color:           "#334155",
  },

  // ── Tags (checkbox array items) ──────────────────────────────────────────
  tagRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           4,
    marginBottom:  4,
  },
  tag: {
    border:            "1px solid #fde68a",
    borderRadius:      10,
    paddingVertical:   2,
    paddingHorizontal: 6,
    fontSize:          7,
    color:             "#475569",
    backgroundColor:   "#fffbeb",
  },

  // ── Two column layout ────────────────────────────────────────────────────
  twoCol: {
    flexDirection: "row",
    gap:           10,
  },
  colHalf: {
    width: "50%",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position:       "absolute",
    bottom:         20,
    left:           30,
    right:          30,
    flexDirection:  "row",
    justifyContent: "space-between",
    borderTop:      "1px solid #fef3c7",
    paddingTop:     6,
  },
  footerText: {
    fontSize: 7,
    color:    "#94a3b8",
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLabel = (options: { value: string; label: string }[], value: string | null) => {
  if (!value) return "—"
  return options.find((o) => o.value === value)?.label ?? value
}

const getRiskColor = (value: string | null) => {
  const p = RISK_PRIORITIES.find((r) => r.value === value)
  if (!p) return "#94a3b8"
  if (p.value === "LOW")      return "#22c55e"
  if (p.value === "MEDIUM")   return "#eab308"
  if (p.value === "HIGH")     return "#ef4444"
  return "#991b1b"
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ObservationPDF({ observation }: { observation: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Observation Card</Text>
          <Text style={styles.headerTitle}>{observation.title}</Text>
          <Text style={styles.headerSub}>{observation.vesselProject}</Text>
          <View style={styles.stateBadge}>
            <Text>{observation.state}</Text>
          </View>
        </View>

        {/* ── Section 1 — Observation Details ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. Observation Details</Text>
          <View style={styles.grid}>
            {[
              { label: "Vessel / Project",   value: observation.vesselProject },
              { label: "Location",           value: observation.location ?? "—" },
              { label: "Weather / Sea State", value: observation.weatherSeaState ?? "—" },
              { label: "Date",                value: new Date(observation.date).toLocaleDateString("en-GB") },
              { label: "Time",                value: observation.time ?? "—" },
              { label: "Observer Name",       value: observation.observerName },
              { label: "Created By",          value: observation.createdByField ?? "—" },
            ].map(({ label, value }) => (
              <View key={label} style={styles.gridItem}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Section 2 — Observation Type ─────────────────────────────────── */}
        {observation.observationType && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>2. Observation Type</Text>
            <Text style={styles.fieldValue}>{observation.observationType}</Text>
            {observation.stopWorkUsed !== null && (
              <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>
                Stop Work Authority Used: {observation.stopWorkUsed ? "Yes" : "No"}
              </Text>
            )}
          </View>
        )}

        {/* ── Section 3 — Observation Source ───────────────────────────────── */}
        {(observation.observationSource || observation.observationSourceOther) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>3. Observation Source</Text>
            {observation.observationSource && (
              <Text style={styles.fieldValue}>
                {getLabel(OBSERVATION_SOURCES, observation.observationSource)}
              </Text>
            )}
            {observation.observationSourceOther && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.fieldLabel}>Other (Specify)</Text>
                <View style={styles.textBox}>
                  <Text>{observation.observationSourceOther}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Section 4 — Life Saving Rules (IOGP) ──────────────────────────── */}
        {(observation.lifeSavingRules?.length > 0 || observation.lifeSavingRulesOther) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>4. Life Saving Rules (IOGP)</Text>
            {observation.lifeSavingRules?.length > 0 && (
              <View style={styles.tagRow}>
                {observation.lifeSavingRules.map((rule: string) => (
                  <Text key={rule} style={styles.tag}>
                    {getLabel(LIFE_SAVING_RULES, rule)}
                  </Text>
                ))}
              </View>
            )}
            {observation.lifeSavingRulesOther && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.fieldLabel}>Other (Specify)</Text>
                <View style={styles.textBox}>
                  <Text>{observation.lifeSavingRulesOther}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Section 5 — Risk Priority ─────────────────────────────────────── */}
        {observation.riskPriority && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>5. Risk Priority</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getRiskColor(observation.riskPriority) }} />
              <Text style={styles.fieldValue}>{observation.riskPriority}</Text>
            </View>
            {observation.hiPo !== null && (
              <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>
                High Potential Event (HiPo): {observation.hiPo ? "Yes" : "No"}
              </Text>
            )}
          </View>
        )}

        {/* ── Section 6 — Observation Category ──────────────────────────────── */}
        {(observation.categoryOperations?.length > 0 ||
          observation.categorySurveyEquipment ||
          observation.categoryWorkActivities?.length > 0 ||
          observation.categoryHazards?.length > 0 ||
          observation.categoryEnvironment?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>6. Observation Category</Text>

            {observation.categoryOperations?.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.fieldLabel}>Operations</Text>
                <View style={styles.tagRow}>
                  {observation.categoryOperations.map((item: string) => (
                    <Text key={item} style={styles.tag}>{item}</Text>
                  ))}
                </View>
              </View>
            )}

            {observation.categorySurveyEquipment && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.fieldLabel}>Survey Equipment</Text>
                <Text style={styles.fieldValue}>{observation.categorySurveyEquipment}</Text>
              </View>
            )}

            {observation.categoryWorkActivities?.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.fieldLabel}>Work Activities</Text>
                <View style={styles.tagRow}>
                  {observation.categoryWorkActivities.map((item: string) => (
                    <Text key={item} style={styles.tag}>{item}</Text>
                  ))}
                </View>
              </View>
            )}

            {observation.categoryHazards?.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.fieldLabel}>Hazards / Conditions</Text>
                <View style={styles.tagRow}>
                  {observation.categoryHazards.map((item: string) => (
                    <Text key={item} style={styles.tag}>{item}</Text>
                  ))}
                </View>
              </View>
            )}

            {observation.categoryEnvironment?.length > 0 && (
              <View>
                <Text style={styles.fieldLabel}>Environment & Other</Text>
                <View style={styles.tagRow}>
                  {observation.categoryEnvironment.map((item: string) => (
                    <Text key={item} style={styles.tag}>{item}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Section 7 — Observation Description ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>7. Observation Description</Text>
          <View style={styles.textBox}>
            <Text>{observation.observationDescription}</Text>
          </View>
        </View>

        {/* ── Section 8 — Immediate Action Taken ────────────────────────────── */}
        {observation.immediateAction && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>8. Immediate Action Taken</Text>
            <View style={styles.textBox}>
              <Text>{observation.immediateAction}</Text>
            </View>
          </View>
        )}

        {/* ── Section 9 & 10 — Corrective Action + Root Cause ───────────────── */}
        {(observation.correctiveAction || observation.preventiveAction ||
          observation.rootCauses?.length > 0 || observation.rootCauseOther) && (
          <View style={styles.twoCol}>

            {(observation.correctiveAction || observation.preventiveAction) && (
              <View style={[styles.section, styles.colHalf]}>
                <Text style={styles.sectionHeading}>9. Corrective / Preventive Action</Text>
                {observation.correctiveAction && (
                  <View style={{ marginBottom: 4 }}>
                    <Text style={styles.fieldLabel}>Corrective Action</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.correctiveAction}</Text>
                    </View>
                    {observation.correctiveActionDate && (
                      <Text style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>
                        Target: {new Date(observation.correctiveActionDate).toLocaleDateString("en-GB")}
                      </Text>
                    )}
                  </View>
                )}
                {observation.preventiveAction && (
                  <View style={{ marginBottom: 4 }}>
                    <Text style={styles.fieldLabel}>Preventive Action</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.preventiveAction}</Text>
                    </View>
                    {observation.preventiveActionDate && (
                      <Text style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>
                        Target: {new Date(observation.preventiveActionDate).toLocaleDateString("en-GB")}
                      </Text>
                    )}
                  </View>
                )}
                {observation.responsiblePerson && (
                  <View>
                    <Text style={styles.fieldLabel}>Responsible Person / Team</Text>
                    <Text style={styles.fieldValue}>{observation.responsiblePerson}</Text>
                  </View>
                )}
              </View>
            )}

            {(observation.rootCauses?.length > 0 || observation.rootCauseOther) && (
              <View style={[styles.section, styles.colHalf]}>
                <Text style={styles.sectionHeading}>10. Root Cause</Text>
                {observation.rootCauses?.length > 0 && (
                  <View style={styles.tagRow}>
                    {observation.rootCauses.map((cause: string) => (
                      <Text key={cause} style={styles.tag}>
                        {getLabel(ROOT_CAUSES, cause)}
                      </Text>
                    ))}
                  </View>
                )}
                {observation.rootCauseOther && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.fieldLabel}>Other (Specify)</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.rootCauseOther}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── Section 11 & 12 — Potential Consequence + Lessons Learned ─────── */}
        {(observation.potentialConsequences?.length > 0 || observation.potentialConsequenceOther ||
          observation.lessonsLearned || observation.preventRecurrence) && (
          <View style={styles.twoCol}>

            {(observation.potentialConsequences?.length > 0 || observation.potentialConsequenceOther) && (
              <View style={[styles.section, styles.colHalf]}>
                <Text style={styles.sectionHeading}>11. Potential Consequence</Text>
                {observation.potentialConsequences?.length > 0 && (
                  <View style={styles.tagRow}>
                    {observation.potentialConsequences.map((item: string) => (
                      <Text key={item} style={styles.tag}>{item}</Text>
                    ))}
                  </View>
                )}
                {observation.potentialConsequenceOther && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.fieldLabel}>Other (Specify)</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.potentialConsequenceOther}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {(observation.lessonsLearned || observation.preventRecurrence) && (
              <View style={[styles.section, styles.colHalf]}>
                <Text style={styles.sectionHeading}>12. Lessons Learned / Good Practice</Text>
                {observation.lessonsLearned && (
                  <View style={{ marginBottom: 4 }}>
                    <Text style={styles.fieldLabel}>What can we learn?</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.lessonsLearned}</Text>
                    </View>
                  </View>
                )}
                {observation.preventRecurrence && (
                  <View>
                    <Text style={styles.fieldLabel}>How can we prevent recurrence?</Text>
                    <View style={styles.textBox}>
                      <Text>{observation.preventRecurrence}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── Section 13 — Close Out ─────────────────────────────────────────── */}
        {(observation.closedBy || observation.dateClosed || observation.closeOutName) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>13. Close Out</Text>
            <View style={styles.grid}>
              {observation.closedBy && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Closed By</Text>
                  <Text style={styles.fieldValue}>{observation.closedBy}</Text>
                </View>
              )}
              {observation.dateClosed && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Date Closed</Text>
                  <Text style={styles.fieldValue}>{new Date(observation.dateClosed).toLocaleDateString("en-GB")}</Text>
                </View>
              )}
              {observation.correctiveActionEffective !== null && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Corrective Action Effective?</Text>
                  <Text style={styles.fieldValue}>{observation.correctiveActionEffective ? "Yes" : "No"}</Text>
                </View>
              )}
              {observation.furtherActionRequired !== null && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Further Action Required?</Text>
                  <Text style={styles.fieldValue}>{observation.furtherActionRequired ? "Yes" : "No"}</Text>
                </View>
              )}
              {observation.closeOutName && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Text style={styles.fieldValue}>{observation.closeOutName}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Office Response ────────────────────────────────────────────────── */}
        {(observation.officeResponse || observation.effectiveDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Office Response</Text>
            <View style={styles.grid}>
              {observation.officeResponse && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Office Response</Text>
                  <Text style={styles.fieldValue}>{observation.officeResponse}</Text>
                </View>
              )}
              {observation.effectiveDate && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Effective Date</Text>
                  <Text style={styles.fieldValue}>{new Date(observation.effectiveDate).toLocaleDateString("en-GB")}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {observation.title} — {observation.state}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
          <Text style={styles.footerText}>
            Generated: {new Date().toLocaleDateString("en-GB")}
          </Text>
        </View>

      </Page>
    </Document>
  )
}