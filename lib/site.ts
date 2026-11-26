// Update this file with the real company details and job offers before publishing.
// Keep missing contact or registration details as empty strings.

export type Txt = string | Partial<Record<"pl" | "en" | "fil" | "ru" | "id", string>>;
export type Job = {
  id: string; title: Txt; loc?: Txt; pay?: Txt; hours?: Txt;
  contract?: Txt; housing?: Txt; transport?: Txt; description?: Txt;
};

export const S = {
  name: "H2K",
  address: "",
  phone: "",
  email: "",
  nip: "",
  krs: "",
  regon: "",

  // Add only verified job offers. Copy one object for each open role.
  // Language-specific text format: { pl: "...", en: "...", fil: "...", ru: "...", id: "..." }
  jobs: [] as Job[],
};
