// Shared helpers for candidate evaluation flow.

const TECH_KEYWORDS = {
  frontend: ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'next', 'nuxt', 'frontend', 'front-end', 'ui', 'ux'],
  backend: ['node', 'express', 'nest', 'spring', 'django', 'flask', '.net', 'dotnet', 'c#', 'go', 'golang', 'rust', 'php', 'laravel', 'backend', 'back-end', 'api'],
  database: ['mysql', 'postgres', 'postgresql', 'mongo', 'mongodb', 'oracle', 'sql', 'redis', 'cassandra', 'dynamodb', 'database', 'db'],
  java: ['java', 'jvm', 'kotlin', 'scala'],
  devops: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'jenkins', 'devops'],
}

const SUB_LABELS = {
  java: 'Java',
  database: 'Database',
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  other: 'Other',
}

// Parse tech_stack string → ordered list of sub-skill keys
export function deriveTechSubSkills(techStack) {
  if (!techStack || !techStack.trim()) {
    return ['java', 'database', 'frontend', 'backend']
  }
  const lower = techStack.toLowerCase()
  const matched = new Set()
  for (const [key, words] of Object.entries(TECH_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) matched.add(key)
  }
  if (matched.size === 0) return ['java', 'database', 'frontend', 'backend']
  return Array.from(matched)
}

export function subSkillLabel(key) {
  return SUB_LABELS[key] || key
}

// Average of an object of numeric values
export function avg(obj) {
  const vals = Object.values(obj || {}).filter((v) => typeof v === 'number')
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// Overall = avg(technical_avg, communication, attitude, confidence)
export function overallScore(evaluation) {
  if (!evaluation) return 0
  const techAvg = avg(evaluation.technical)
  return avg({
    tech: techAvg,
    communication: evaluation.communication,
    attitude: evaluation.attitude,
    confidence: evaluation.confidence,
  })
}

// Color tier for a 1-5 score
export function scoreColor(score) {
  if (score >= 4.5) return { bg: 'rgba(0,158,96,0.18)', text: '#009E60', border: 'rgba(0,158,96,0.4)' }
  if (score >= 3.5) return { bg: 'rgba(0,69,173,0.15)', text: '#0045AD', border: 'rgba(0,69,173,0.35)' }
  if (score >= 2.5) return { bg: 'rgba(255,213,0,0.18)', text: '#B8860B', border: 'rgba(255,213,0,0.4)' }
  return { bg: 'rgba(196,30,58,0.15)', text: '#C41E3A', border: 'rgba(196,30,58,0.35)' }
}

export function formatScore(n) {
  if (!n) return '–'
  return Number(n).toFixed(1)
}
