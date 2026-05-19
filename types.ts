export type Risk = {
  assessmentRows: any;
  id: string;
  ref: string;
  cloneOf: string | null;
  workActivity: string;
  initiator: string;
  initiationDate: Date;
  reviewDate: Date | null;
  vesselDepartment: string | null;
  fleet: string | null;
  raType: string;
  sct: number | null;
  libraryIndex: string | null;
  state: string;
  defectRelated: boolean;
  createdBy: { name: string | null; email: string };
  stateUpdatedBy: { name: string | null } | null;
};

export type User = {
  id: string;
  role: string;
  name: string | null;
  email: string;
} | null;
