export interface AvatarPreset {
  id: string;
  label: string;
  value: string; // URL path or emoji or data URI
  category: 'illustrated' | 'motivation' | 'stem' | 'mascots' | 'classic';
  description?: string;
}

export const HIGH_QUALITY_SVG_AVATARS: AvatarPreset[] = [
  {
    id: 'svg-scholar-boy',
    label: 'Scholar Boy',
    value: '/avatars/avatar-scholar-boy.svg',
    category: 'illustrated',
    description: 'Disciplined academic achiever',
  },
  {
    id: 'svg-scholar-girl',
    label: 'Scholar Girl',
    value: '/avatars/avatar-scholar-girl.svg',
    category: 'illustrated',
    description: 'Ambitious exam topper',
  },
  {
    id: 'svg-coder-pro',
    label: 'Cyber Coder',
    value: '/avatars/avatar-coder-pro.svg',
    category: 'illustrated',
    description: 'Algorithmic problem solver',
  },
  {
    id: 'svg-cyber-girl',
    label: 'Tech Pioneer',
    value: '/avatars/avatar-cyber-girl.svg',
    category: 'illustrated',
    description: 'Creative code architect',
  },
  {
    id: 'svg-astro-pilot',
    label: 'Astro Pioneer',
    value: '/avatars/avatar-astro-pilot.svg',
    category: 'illustrated',
    description: 'Aiming for the stars',
  },
  {
    id: 'svg-quantum-mind',
    label: 'Quantum Mind',
    value: '/avatars/avatar-quantum-mind.svg',
    category: 'illustrated',
    description: 'High neural compute focus',
  },
  {
    id: 'svg-rocket-pioneer',
    label: 'Rocket Launch',
    value: '/avatars/avatar-rocket-pioneer.svg',
    category: 'motivation',
    description: 'Exponential daily growth',
  },
  {
    id: 'svg-lightning-streak',
    label: 'Lightning Speed',
    value: '/avatars/avatar-lightning-streak.svg',
    category: 'motivation',
    description: 'Fast focus sprints',
  },
  {
    id: 'svg-golden-trophy',
    label: 'Champion Trophy',
    value: '/avatars/avatar-golden-trophy.svg',
    category: 'motivation',
    description: 'Top rank contender',
  },
  {
    id: 'svg-diamond-focus',
    label: 'Diamond Mind',
    value: '/avatars/avatar-diamond-focus.svg',
    category: 'motivation',
    description: 'Unbreakable concentration',
  },
  {
    id: 'svg-target-archer',
    label: 'Bullseye Target',
    value: '/avatars/avatar-target-archer.svg',
    category: 'motivation',
    description: 'Laser-focused on exam goals',
  },
  {
    id: 'svg-nova-star',
    label: 'Nova Star',
    value: '/avatars/avatar-nova-star.svg',
    category: 'motivation',
    description: 'Radiant knowledge spark',
  },
  {
    id: 'svg-lab-alchemist',
    label: 'Lab Alchemist',
    value: '/avatars/avatar-lab-alchemist.svg',
    category: 'stem',
    description: 'Experimental scientist',
  },
  {
    id: 'svg-book-sorcerer',
    label: 'Book Sorcerer',
    value: '/avatars/avatar-book-sorcerer.svg',
    category: 'stem',
    description: 'Master of deep reading',
  },
  {
    id: 'svg-wise-owl',
    label: 'Wise Owl',
    value: '/avatars/avatar-wise-owl.svg',
    category: 'mascots',
    description: 'Night study strategist',
  },
  {
    id: 'svg-focus-fox',
    label: 'Focus Fox',
    value: '/avatars/avatar-focus-fox.svg',
    category: 'mascots',
    description: 'Sharp agile learner',
  },
  {
    id: 'svg-discipline-tiger',
    label: 'Discipline Tiger',
    value: '/avatars/avatar-discipline-tiger.svg',
    category: 'mascots',
    description: 'Relentless consistency',
  },
  {
    id: 'svg-zen-panda',
    label: 'Zen Panda',
    value: '/avatars/avatar-zen-panda.svg',
    category: 'mascots',
    description: 'Calm stress-free study state',
  },
];

export const EMOJI_AVATARS: AvatarPreset[] = [
  // Classic Scholars
  { id: 'em-scholar', label: 'Student', value: '🧑‍🎓', category: 'classic' },
  { id: 'em-grad-girl', label: 'Graduate', value: '👩‍🎓', category: 'classic' },
  { id: 'em-coder-boy', label: 'Programmer', value: '👨‍💻', category: 'classic' },
  { id: 'em-coder-girl', label: 'Dev', value: '👩‍💻', category: 'classic' },
  { id: 'em-scientist', label: 'Scientist', value: '🧑‍🔬', category: 'classic' },
  { id: 'em-doctor', label: 'Medical', value: '👩‍⚕️', category: 'classic' },
  { id: 'em-astronaut', label: 'Astronaut', value: '👩‍🚀', category: 'classic' },
  { id: 'em-ninja', label: 'Silent Worker', value: '🥷', category: 'classic' },

  // Motivation Badges
  { id: 'em-rocket', label: 'Rocket', value: '🚀', category: 'motivation' },
  { id: 'em-lightning', label: 'Lightning', value: '⚡', category: 'motivation' },
  { id: 'em-brain', label: 'Brain Cortex', value: '🧠', category: 'motivation' },
  { id: 'em-star', label: 'Superstar', value: '🌟', category: 'motivation' },
  { id: 'em-flame', label: 'Fire Streak', value: '🔥', category: 'motivation' },
  { id: 'em-trophy', label: 'Trophy', value: '🏆', category: 'motivation' },
  { id: 'em-gem', label: 'Diamond', value: '💎', category: 'motivation' },
  { id: 'em-target', label: 'Target', value: '🎯', category: 'motivation' },

  // STEM Icons
  { id: 'em-microscope', label: 'Microscope', value: '🔬', category: 'stem' },
  { id: 'em-books', label: 'Book Stack', value: '📚', category: 'stem' },
  { id: 'em-atom', label: 'Physics Atom', value: '⚛️', category: 'stem' },
  { id: 'em-planet', label: 'Saturn Planet', value: '🪐', category: 'stem' },
  { id: 'em-dna', label: 'DNA Strand', value: '🧬', category: 'stem' },
  { id: 'em-bulb', label: 'Eureka Bulb', value: '💡', category: 'stem' },

  // Mascots
  { id: 'em-owl', label: 'Wise Owl', value: '🦉', category: 'mascots' },
  { id: 'em-fox', label: 'Quick Fox', value: '🦊', category: 'mascots' },
  { id: 'em-tiger', label: 'Power Tiger', value: '🐯', category: 'mascots' },
  { id: 'em-panda', label: 'Zen Panda', value: '🐼', category: 'mascots' },
  { id: 'em-lion', label: 'Brave Lion', value: '🦁', category: 'mascots' },
  { id: 'em-wolf', label: 'Lone Wolf', value: '🐺', category: 'mascots' },
  { id: 'em-eagle', label: 'Eagle Vision', value: '🦅', category: 'mascots' },
];

export const ALL_AVATARS = [...HIGH_QUALITY_SVG_AVATARS, ...EMOJI_AVATARS];

export function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/') ||
    url.startsWith('data:image/') ||
    url.startsWith('blob:')
  );
}

export function isCustomUpload(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith('data:image/') ||
    url.startsWith('blob:') ||
    url.includes('/uploads/') ||
    url.includes('custom-')
  );
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
