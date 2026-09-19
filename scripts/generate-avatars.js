const fs = require('fs');
const path = require('path');

const avatars = [
  {
    name: 'avatar-scholar-boy.svg',
    from: '#FF704E',
    to: '#FFA053',
    glyph: '🧑‍🎓',
    glow: 'rgba(255, 112, 78, 0.4)',
  },
  {
    name: 'avatar-scholar-girl.svg',
    from: '#A78BFA',
    to: '#7C3AED',
    glyph: '👩‍🎓',
    glow: 'rgba(124, 58, 237, 0.4)',
  },
  {
    name: 'avatar-coder-pro.svg',
    from: '#06B6D4',
    to: '#3B82F6',
    glyph: '👨‍💻',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  {
    name: 'avatar-cyber-girl.svg',
    from: '#EC4899',
    to: '#8B5CF6',
    glyph: '👩‍💻',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  {
    name: 'avatar-astro-pilot.svg',
    from: '#4F46E5',
    to: '#1E1B4B',
    glyph: '👨‍🚀',
    glow: 'rgba(79, 70, 229, 0.4)',
  },
  {
    name: 'avatar-quantum-mind.svg',
    from: '#38BDF8',
    to: '#6366F1',
    glyph: '🧠',
    glow: 'rgba(56, 189, 248, 0.4)',
  },
  {
    name: 'avatar-rocket-pioneer.svg',
    from: '#F43F5E',
    to: '#FB923C',
    glyph: '🚀',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  {
    name: 'avatar-lightning-streak.svg',
    from: '#F59E0B',
    to: '#EF4444',
    glyph: '⚡',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  {
    name: 'avatar-golden-trophy.svg',
    from: '#FBBF24',
    to: '#D97706',
    glyph: '🏆',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  {
    name: 'avatar-diamond-focus.svg',
    from: '#10B981',
    to: '#06B6D4',
    glyph: '💎',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  {
    name: 'avatar-target-archer.svg',
    from: '#E11D48',
    to: '#F43F5E',
    glyph: '🎯',
    glow: 'rgba(225, 29, 72, 0.4)',
  },
  {
    name: 'avatar-nova-star.svg',
    from: '#FBBF24',
    to: '#F43F5E',
    glyph: '🌟',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  {
    name: 'avatar-lab-alchemist.svg',
    from: '#14B8A6',
    to: '#84CC16',
    glyph: '🔬',
    glow: 'rgba(20, 184, 166, 0.4)',
  },
  {
    name: 'avatar-book-sorcerer.svg',
    from: '#8B5CF6',
    to: '#C084FC',
    glyph: '📚',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  {
    name: 'avatar-wise-owl.svg',
    from: '#1E293B',
    to: '#3B82F6',
    glyph: '🦉',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  {
    name: 'avatar-focus-fox.svg',
    from: '#F97316',
    to: '#FB923C',
    glyph: '🦊',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  {
    name: 'avatar-discipline-tiger.svg',
    from: '#EA580C',
    to: '#DC2626',
    glyph: '🐯',
    glow: 'rgba(234, 88, 12, 0.4)',
  },
  {
    name: 'avatar-zen-panda.svg',
    from: '#059669',
    to: '#10B981',
    glyph: '🐼',
    glow: 'rgba(5, 150, 105, 0.4)',
  },
];

const targetDir = path.join(__dirname, '..', 'public', 'avatars');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

avatars.forEach((av, i) => {
  const gradId = `grad_${i}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${av.from}"/>
      <stop offset="100%" stop-color="${av.to}"/>
    </linearGradient>
    <filter id="shadow_${i}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${av.glow}" />
    </filter>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#${gradId})" />
  <rect x="2" y="2" width="116" height="116" rx="34" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.28" />
  <g filter="url(#shadow_${i})">
    <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold">${av.glyph}</text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(targetDir, av.name), svg, 'utf8');
  console.log('Created:', av.name);
});

console.log('All avatars generated successfully!');
