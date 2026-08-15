export const en = {
  common: {
    prev: 'Prev',
    next: 'Next',
    close: 'Close',
    language: 'Language',
  },
  nav: {
    education: 'Education',
    diplomas: 'Certifications',
    experience: 'Professional experience',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    navMenu: 'Navigation menu',
  },
  app: {
    loading: 'Loading…',
    missingData: 'Missing data',
    errorTitle: 'Something went wrong.',
    reload: 'Reload page',
  },
  landing: {
    eyebrow: 'Educational & Professional Journey',
    tagline: 'Interactive professional profile',
    explore: 'Explore my profile',
    rights:
      'All information and the design of this platform are my property. Any use of this content or design outside this platform requires my prior authorization and consent.',
    thanks: 'Thank you for viewing my professional profile.',
    stats: {
      diplomas: 'Diplomas',
      years: 'Years of training',
      countries: 'Countries',
      categories: 'Areas of specialization',
    },
  },
  education: {
    title: 'Education',
    subtitle: 'My academic journey in detail — from primary school to graduate studies.',
    enlarge: 'Enlarge diploma',
    viewDiploma: 'View diploma',
    pages: { one: '{{count}} page', other: '{{count}} pages' },
    verifiedBy: '{{provider}} Verified',
    viewCredential: 'View credential',
  },
  certifications: {
    title: 'Certifications & Courses',
    subtitle: 'Certifications and courses grouped by area of expertise.',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
  },
  experience: {
    title: 'Professional experience',
    subtitle: 'Chronological order (oldest at bottom, most recent at top).',
    cta: "Your company could be the next chapter in my professional journey, and I'm excited to make it happen. 🎉",
    responsibilities: 'Responsibilities',
    achievements: 'Achievements',
    showAllResponsibilities: 'Show all {{count}} responsibilities',
    showAllAchievements: 'Show all {{count}} achievements',
    showLess: 'Show less',
    viewReferenceLetter: 'View reference letter',
  },
  contact: {
    contactMe: 'Contact me',
    open: 'Show contact',
    close: 'Close contact',
    aria: 'Contact',
    linkedIn: 'LinkedIn profile',
  },
  detail: {
    diplomaAlt: 'Diploma {{n}} of {{total}}',
  },
  // Data label overrides are omitted for English: components fall back to the JSON labels.
  data: {
    categories: {} as Record<string, string>,
    milestones: {} as Record<string, string>,
  },
};

export type Locale = typeof en;
