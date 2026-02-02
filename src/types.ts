export interface Credential {
  id: string;
  numericId: number;
  title: string;
  year: number;
  date: string | null;
  institution: string;
  location: string;
  duration: string | null;
  categories: string[];
  notes: string | null;
  /** Optional: paths to diploma/certificate images (e.g. /images/diplomas/cred-1.jpg). Multiple images supported. */
  imageUrls?: string[];
}

export interface Category {
  id: string;
  label: string;
  type: 'topic' | 'geographic';
}

/** Optional contact for floating CTA (call / email / LinkedIn). */
export interface ProfileContact {
  phone?: string;
  email?: string;
  linkedIn?: string;
}

export interface Profile {
  name: string;
  /** Short name for headers/titles (e.g. "Alexis Garcia"). Falls back to name if not set. */
  shortName?: string;
  title: string;
  recordPeriod: string;
  /** Optional: shown in floating contact bar so visitors can call or email. */
  contact?: ProfileContact;
}

export interface CredentialsData {
  profile: Profile;
  credentials: Credential[];
}

export interface CategoriesData {
  categories: Category[];
}

export interface Milestone {
  id: string;
  year: number;
  label: string;
  /** Optional: open this credential when the milestone is clicked (e.g. "56" for Project Management). */
  credentialId?: string;
}

export interface MilestonesData {
  milestones: Milestone[];
}

/** Segment between two milestones (inclusive year range). */
export interface Segment {
  fromYear: number;
  toYear: number;
  credentialIds: string[];
}

/** One professional position for the experience timeline (oldest first in array). */
export interface ExperiencePosition {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  achievements: string[];
}

export interface ExperienceData {
  positions: ExperiencePosition[];
}
