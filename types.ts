// types/index.ts

export type AdditionalMeasure = {
  id: string;
  furtherAction: string | null;
  c: number | null;
  f: number | null;
  rf: number | null;
  rfColor: "GREEN" | "YELLOW" | "RED" | null; // ← make sure this exists
  order: number;
};

export type AssessmentRow = {
  id: string;
  hazard: string;
  impact: string;
  existingControls: string | null;
  sct: string | null;
  c: number | null;
  f: number | null;
  rf: number | null;
  rfColor: "GREEN" | "YELLOW" | "RED" | null; // ← make sure this exists
  order: number;
  additionalMeasures: AdditionalMeasure[];
};

export type ResponsiblePerson = {
  id: string;
  name: string;
};

export type TeamMember = {
  id: string;
  name: string;
};

export type Risk = {
  id: string;
  ref: string;
  cloneOf: string | null;
  workActivity: string;
  initiator: string;
  initiationDate: Date;
  reviewDate: Date | null;
  vesselDepartment: string | null;
  fleet: string | null;
  raType: "ROUTINE" | "NON_ROUTINE";
  libraryCategory: string | null;
  libraryIndex: string | null;
  state: "TEMPLATE" | "DRAFT" | "COMPLETED";
  defectRelated: boolean;
  alternativeWays: boolean;
  alternativeWaysText: string | null;
  initiatorComment: string | null;
  emergencyResponse: string | null;
  createdById: string;
  createdBy: { name: string | null; email: string };
  stateUpdatedBy: { name: string | null } | null;
  approvedBy: string | null
  assessmentRows: AssessmentRow[];
  teamMembers: TeamMember[];
  responsiblePersons: ResponsiblePerson[];
};

export type User = {
  id: string;
  role: string;
  name: string | null;
  email: string;
} | null;


// ─── Observation types ─────────────────────────────────────────────────────

export type Observation = {
  id:                     string
  title:                  string
  observationDescription: string
  vesselProject:          string
  date:                   Date
  state:                  "DRAFT" | "COMPLETED"
}