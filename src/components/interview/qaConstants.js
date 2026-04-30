// Shared constants for the Q&A library.
// Keep this in sync with the CHECK constraints in supabase/migration.sql.

export const ALL_CATEGORIES = [
  'Java', 'Database', 'DSA', 'JavaScript', 'React',
  'Angular', 'Web', 'Networking', 'Personal', 'Others',
]

const TECH_CATEGORIES = ALL_CATEGORIES.filter((c) => c !== 'Personal')
const HR_CATEGORIES   = ['Personal', 'Others']

// round value -> allowed category list
export const ROUND_CATEGORIES = {
  screening:  TECH_CATEGORIES,
  technical1: TECH_CATEGORIES,
  technical2: TECH_CATEGORIES,
  hr:         HR_CATEGORIES,
}

export function categoriesForRound(round) {
  if (!round || round === 'all') return ALL_CATEGORIES
  return ROUND_CATEGORIES[round] || ALL_CATEGORIES
}
