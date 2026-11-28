/**
 * WorkPermitPDF — PDF for the 3 form permits (same sections as the forms)
 *
 * Location: app/workpermitsdashboard/[id]/pdf/WorkPermitPDF.tsx
 *
 *  - HotWorkPDF       → Form 34
 *  - ConfinedSpacePDF → Form 33
 *  - WorkingAloftPDF  → Form 31
 *
 * Questions and labels come from the same options files as the forms,
 * so a changed question shows up in the form AND the PDF.
 * No "use client" — rendered on the server by route.tsx.
 */

import { Text, View } from "@react-pdf/renderer"
import {
  FIRE_PREVENTION_MEASURES,
  HOT_WORK_CHECKS,
} from "@/app/workpermitsdashboard/_components/hotWorkOptions"
import {
  EMERGENCY_EQUIPMENT,
  ENTRANT_CHECKS,
  GAS_KEYS,
  GAS_LIMITS,
  OFFICER_CHECKS,
  gasStatus,
} from "@/app/workpermitsdashboard/_components/confinedSpaceOptions"
import {
  ALOFT_CHECKS,
  AUXILIARY_ITEMS,
  EQUIPMENT_ITEMS,
  OVERSIDE_CHECKS,
} from "@/app/workpermitsdashboard/_components/workingAloftOptions"
import { CS_EQUIPMENT_ITEMS } from "@/lib/validations/confinedSpacePermit.schema"
import type { HotWorkFormValues } from "@/lib/validations/hotWorkPermit.schema"
import type { ConfinedSpaceFormValues } from "@/lib/validations/confinedSpacePermit.schema"
import type { WorkingAloftFormValues } from "@/lib/validations/workingAloftPermit.schema"
import {
  AnswerBadge,
  AnswerList,
  AnswerRow,
  CheckList,
  CheckRow,
  NameList,
  PdfField,
  PdfFields,
  PdfSection,
  PdfTable,
  PdfTableSection,
  PermitPdfDocument,
  fmtLocal,
  hoursText,
  pdfText,
  s,
  yesNo,
  type PdfPermitInfo,
} from "./permitPdfParts"

// ═════════════════════════════════════════════════════════════════════════════
// HOT WORK — Form 34
// ═════════════════════════════════════════════════════════════════════════════
export function HotWorkPDF({ permit, f }: { permit: PdfPermitInfo; f: HotWorkFormValues }) {
  return (
    <PermitPdfDocument title="Hot Work Permit" formRef="Form 34 · Revision 001 · Last revised 20.05.25" permit={permit}>
      <PdfSection title="1. General">
        <PdfFields>
          <PdfField label="Date" value={fmtLocal(f.date)} />
          <PdfField label="Person responsible for safety" value={f.responsiblePerson} />
          <PdfField label="Location of work" value={f.location} full />
          <PdfField label="Description of work" value={f.description} full />
        </PdfFields>
      </PdfSection>

      <PdfSection title="2. Persons carrying out hot work">
        <NameList names={f.workers} />
      </PdfSection>

      <PdfSection title="3. Permit validity (max 8 hours)">
        <PdfFields>
          <PdfField label="Valid from" value={fmtLocal(f.validFrom)} />
          <PdfField label="Valid to" value={`${fmtLocal(f.validTo)}${f.validFrom && f.validTo ? `  (${hoursText(f.validFrom, f.validTo)})` : ""}`} />
        </PdfFields>
      </PdfSection>

      <PdfSection title="4. Related permits & toolbox meeting">
        <AnswerRow label="Has an Enclosed Space Entry Permit been issued, if necessary?" answer={f.enclosedSpacePermit} />
        <AnswerRow label="Are other work permits required for this job?" answer={f.otherPermitsRequired} />
        {f.otherPermitsRequired === "YES" && <PdfField label="Other permits (specify)" value={f.otherPermitsSpecify} full />}
        <AnswerRow label="Toolbox meeting discussed and agreed by persons undertaking the hot work?" answer={f.toolboxMeetingHeld} />
      </PdfSection>

      <PdfSection title="5. Check section">
        <AnswerList items={HOT_WORK_CHECKS} answers={f.checks} numbered />
        <View style={s.row} wrap={false}>
          <Text style={s.rowNo}>10.</Text>
          <Text style={s.rowLabel}>Type of ventilation?</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{f.ventilationType ? pdfText(f.ventilationType) : "—"}</Text>
        </View>
        <AnswerRow no={11} label="Are fire-watchmen nominated, instructed and standing by?" answer={f.fireWatchNominated} />
        {f.fireWatchNominated === "YES" && (
          <>
            <PdfField label="Fire-watchmen name(s)" value={f.fireWatchNames} full />
            <AnswerRow label="Is communication between fire-watchmen and bridge established?" answer={f.fireWatchBridgeComms} />
          </>
        )}
      </PdfSection>

      <PdfSection title="6. Personal protection required (item 12)">
        <NameList names={[...f.ppe, ...(f.ppeOther.trim() ? [`Other: ${f.ppeOther}`] : [])]} />
      </PdfSection>

      <PdfSection title="7. Special conditions or precautions (item 13)">
        <PdfField label="Special conditions" value={f.specialConditions || "None"} full />
      </PdfSection>

      <PdfSection title="8. Fire prevention measures (item 14)">
        <AnswerList items={FIRE_PREVENTION_MEASURES} answers={f.fireMeasures} />
        {f.fireMeasuresAdditional.trim() && <PdfField label="Additional measures" value={f.fireMeasuresAdditional} full />}
      </PdfSection>

      <PdfSection title="9. Authorization & acknowledgement">
        <PdfFields>
          <PdfField label="Master" value={f.masterName} />
          <PdfField label="Supervisor" value={f.supervisorName} />
        </PdfFields>
        <CheckRow
          label="Master / Supervisor fully satisfied that all safety checks and precautions have been taken and will be maintained for the duration of the hot work."
          checked={f.authorizationConfirmed}
        />
        <CheckRow
          label="Persons carrying out hot work acknowledge understanding the safety procedures, precautions taken and the emergency procedures for this task."
          checked={f.workersAcknowledged}
        />
      </PdfSection>

      <PdfSection title="10. Work progress & close-out">
        <PdfFields>
          <PdfField label="Work commenced" value={fmtLocal(f.workCommencedAt)} />
          <PdfField label="Extension granted to" value={fmtLocal(f.extensionTo)} />
          <PdfField label="Work completed" value={fmtLocal(f.workCompletedAt)} />
          <PdfField label="Close-out confirmed" value={yesNo(f.closeOutConfirmed)} />
          {f.closeOutConfirmed && <PdfField label="Authorized officer in charge" value={f.closeOutOfficer} />}
          {f.closeOutConfirmed && <PdfField label="Close-out date & time" value={fmtLocal(f.closeOutAt)} />}
        </PdfFields>
        {f.closeOutConfirmed && (
          <Text style={s.sectionNote}>
            The work has been completed and all persons under my supervision, materials and equipment have been withdrawn.
          </Text>
        )}
      </PdfSection>
    </PermitPdfDocument>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// CONFINED SPACE ENTRY — Form 33
// ═════════════════════════════════════════════════════════════════════════════
export function ConfinedSpacePDF({ permit, f }: { permit: PdfPermitInfo; f: ConfinedSpaceFormValues }) {
  const statuses = GAS_KEYS.map((g) => gasStatus(g, f.preEntry[g]))
  const overall = statuses.some((st) => st === "UNSAFE") ? "NOT SAFE" : statuses.every((st) => st === "SAFE") ? "SAFE FOR ENTRY" : ""

  return (
    <PermitPdfDocument title="Confined Space Entry Permit" formRef="Form 33 · Revision 001 · Last revised 20.05.25" permit={permit}>
      <PdfSection title="1. General">
        <PdfFields>
          <PdfField label="Location / name of enclosed space" value={f.location} full />
          <PdfField label="Reason for entry" value={f.reason} full />
        </PdfFields>
      </PdfSection>

      <PdfSection title="2. Permit validity (max 8 hours)">
        <PdfFields>
          <PdfField label="Valid from" value={fmtLocal(f.validFrom)} />
          <PdfField label="Valid to" value={`${fmtLocal(f.validTo)}${f.validFrom && f.validTo ? `  (${hoursText(f.validFrom, f.validTo)})` : ""}`} />
        </PdfFields>
        <CheckRow label="A copy of this permit is posted outside the enclosed space, with a “SAFE FOR ENTRY” tag." checked={f.permitPosted} />
      </PdfSection>

      <PdfSection title="A. Responsible officer to check" note="Checks before entering the enclosed space">
        <CheckList items={OFFICER_CHECKS} checks={f.officerChecks} />
      </PdfSection>

      <PdfSection title="B. Person entering space to check">
        <CheckList items={ENTRANT_CHECKS} checks={f.entrantChecks} />
        <PdfField label="Agreed reporting interval" value={f.reportingIntervalMin ? `${f.reportingIntervalMin} minutes` : ""} full />
      </PdfSection>

      <PdfSection title="C. SCBA and other equipment check">
        <CheckList items={CS_EQUIPMENT_ITEMS} checks={f.equipmentChecks} />
      </PdfSection>

      <PdfSection title="6. Pre-entry atmosphere test">
        <PdfTable
          columns={["Gas", "Reading", "Safe limit", "Result"]}
          widths={[2, 1.5, 3, 1.5]}
          rows={GAS_KEYS.map((g, i) => [
            GAS_LIMITS[g].label,
            f.preEntry[g] ? `${f.preEntry[g]} ${GAS_LIMITS[g].unit}` : "",
            GAS_LIMITS[g].limitText,
            statuses[i] === "SAFE" ? "Safe" : statuses[i] === "UNSAFE" ? "UNSAFE" : "",
          ])}
        />
        <View style={{ marginTop: 5 }}>
          <PdfFields>
            <PdfField label="Tested by" value={f.preEntryBy} />
            <PdfField label="Time of test" value={fmtLocal(f.preEntryAt)} />
            <PdfField label="Overall result" value={overall} />
          </PdfFields>
        </View>
      </PdfSection>

      <PdfSection title="7. Emergency equipment at entrance">
        <CheckList items={EMERGENCY_EQUIPMENT} checks={f.emergencyEquipment} />
      </PdfSection>

      <PdfSection title="8. Authorization & rescue team">
        <PdfTable
          columns={["Role", "Name", "Date & time"]}
          widths={[3, 3, 2]}
          rows={[
            ["Master or nominated personnel", f.master.name, fmtLocal(f.master.at)],
            ["Responsible for supervising entry", f.supervisor.name, fmtLocal(f.supervisor.at)],
            ["Responsible officer in charge", f.officerInCharge.name, fmtLocal(f.officerInCharge.at)],
          ]}
        />
        <View style={{ marginTop: 6 }}>
          <PdfFields>
            <PdfField label="Rescue team leader" value={f.rescueLeader} />
          </PdfFields>
          <NameList label="Rescue team members" names={f.rescueMembers} />
        </View>
        <CheckRow
          label="The responsible person in attendance, rescue team leader, responsible officer and Master (or nominated personnel) are fully satisfied that ALL safety checks and precautions have been taken and will be maintained for the duration of the work."
          checked={f.allSatisfied}
        />
      </PdfSection>

      <PdfSection title="9. Personnel entering space" note="Person 1 is the team leader">
        <NameList names={f.personnel} />
      </PdfSection>

      <PdfTableSection
        title="10. Entry log"
        columns={["#", "Person", "Date", "Time in", "Time out", "Remarks"]}
        widths={[0.4, 2.5, 1.6, 1, 1, 3]}
        rows={f.entryLog.map((r, i) => [String(i + 1), r.name, fmtLocal(r.date), r.timeIn, r.timeOut, r.remarks])}
        empty="No entries recorded"
      />

      <PdfTableSection
        title="11. Systematic regular check of tank atmosphere"
        columns={["Date & time", "O2 %", "HC % LFL", "CO ppm", "H2S ppm", "Toxic / other", "Sign / rank", "Result"]}
        widths={[2, 0.9, 1, 0.9, 0.9, 2, 1.8, 1]}
        rows={f.atmosphereChecks.map((r) => [
          fmtLocal(r.at),
          r.oxygen,
          r.hydrocarbon,
          r.co,
          r.h2s,
          [r.toxicGases, r.otherGases].filter((x) => x.trim()).join(" / "),
          r.signRank,
          GAS_KEYS.some((g) => gasStatus(g, r[g]) === "UNSAFE") ? "UNSAFE" : "Safe",
        ])}
        empty="No readings recorded"
      />

      <PdfSection title="12. Completion certificate">
        <PdfFields>
          <PdfField label="Completion confirmed" value={yesNo(f.completionConfirmed)} />
          {f.completionConfirmed && <PdfField label="Responsible officer in charge" value={f.completionOfficer} />}
          {f.completionConfirmed && <PdfField label="Date & time" value={fmtLocal(f.completionAt)} />}
        </PdfFields>
        {f.completionConfirmed && (
          <Text style={s.sectionNote}>
            Job has been completed and the space has been secured against entry, while the officer of the watch has been duly
            informed. All personnel who worked in the space are safe outside the space.
          </Text>
        )}
      </PdfSection>
    </PermitPdfDocument>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// WORKING ALOFT / OVERSIDE — Form 31
// ═════════════════════════════════════════════════════════════════════════════
export function WorkingAloftPDF({ permit, f }: { permit: PdfPermitInfo; f: WorkingAloftFormValues }) {
  return (
    <PermitPdfDocument title="Working Aloft / Overside Permit" formRef="Form 31 · Revision 001 · Last revised 20.05.25" permit={permit}>
      <PdfSection title="1. General">
        <PdfFields>
          <PdfField label="Location of work" value={f.location} full />
          <PdfField label="Job description" value={f.jobDescription} full />
        </PdfFields>
      </PdfSection>

      <PdfSection title="2. Persons involved">
        <NameList names={f.persons} />
      </PdfSection>

      <PdfSection title="3. Permit validity (max 8 hours)">
        <PdfFields>
          <PdfField label="Valid from" value={fmtLocal(f.validFrom)} />
          <PdfField label="Valid to" value={`${fmtLocal(f.validTo)}${f.validFrom && f.validTo ? `  (${hoursText(f.validFrom, f.validTo)})` : ""}`} />
        </PdfFields>
      </PdfSection>

      <PdfSection title="4. Other work permits">
        <AnswerRow label="Are other work permits issued / required for this job?" answer={f.otherPermitsRequired} />
        {f.otherPermitsRequired === "YES" && <NameList label="Reference no." names={f.otherPermitRefs} />}
      </PdfSection>

      <PdfSection title="Section 1 · Equipment" note="Availability and good condition of the following equipment">
        <AnswerList items={EQUIPMENT_ITEMS} answers={f.equipment} />
      </PdfSection>

      <PdfSection title="Section 1 · Auxiliary equipment & warnings">
        <AnswerList items={AUXILIARY_ITEMS} answers={f.auxiliary} />
        {f.auxOtherText.trim() && (
          <View style={s.row} wrap={false}>
            <Text style={s.rowLabel}>Other: {pdfText(f.auxOtherText)}</Text>
            <AnswerBadge answer={f.auxOtherAnswer} />
          </View>
        )}
      </PdfSection>

      <PdfSection title="Section 2 · For working aloft">
        <AnswerList items={ALOFT_CHECKS} answers={f.aloftChecks} numbered />
      </PdfSection>

      <PdfSection title="Section 2 · For working overside">
        <AnswerList items={OVERSIDE_CHECKS} answers={f.oversideChecks} numbered />
      </PdfSection>

      <PdfSection title="Authorization">
        <CheckRow
          label="All of the above has been discussed during a formal work plan meeting with all persons participating. A risk analysis and risk assessment has been created and acknowledged by the persons involved. It is considered safe to proceed."
          checked={f.discussedConfirmed}
        />
        <View style={{ marginTop: 5 }}>
          <PdfFields>
            <PdfField label="Authorized team leader carrying out the job" value={f.teamLeaderName} />
            <PdfField label="Responsible officer for work aloft / overside" value={f.responsibleOfficerName} />
            <PdfField label="Master" value={f.masterName} />
          </PdfFields>
        </View>
      </PdfSection>

      <PdfSection title="Section 3 · Completion">
        <PdfFields>
          <PdfField label="Completion confirmed" value={yesNo(f.withdrawnConfirmed)} />
          {f.withdrawnConfirmed && <PdfField label="Completed at" value={fmtLocal(f.completedAt)} />}
          {f.withdrawnConfirmed && <PdfField label="Responsible officer" value={f.completionOfficerName} />}
        </PdfFields>
        {f.withdrawnConfirmed && (
          <Text style={s.sectionNote}>
            This work aloft or overside has been completed, and all persons under my supervision, materials and equipment have
            been withdrawn.
          </Text>
        )}
        <Text style={s.sectionNote}>First copy to be displayed at place of work. Second copy to be retained in ship&apos;s file.</Text>
      </PdfSection>
    </PermitPdfDocument>
  )
}