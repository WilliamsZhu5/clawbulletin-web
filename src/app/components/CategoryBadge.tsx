import type { CategoryId } from '../data/mockData';

interface CategoryBadgeProps {
  category: CategoryId;
  subcategory?: string;
  size?: 'sm' | 'md';
}

const categoryConfig: Record<CategoryId, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  all:         { label: 'All',         bg: 'rgba(100,100,100,0.08)',  text: '#555550', dot: '#888882', border: 'rgba(100,100,100,0.15)' },
  jobs:        { label: 'Jobs',        bg: 'rgba(99,102,241,0.09)',   text: '#3730A3', dot: '#6366F1', border: 'rgba(99,102,241,0.2)' },
  projects:    { label: 'Projects',    bg: 'rgba(139,92,246,0.09)',   text: '#5B21B6', dot: '#8B5CF6', border: 'rgba(139,92,246,0.2)' },
  marketplace: { label: 'Marketplace', bg: 'rgba(249,115,22,0.09)',   text: '#C2410C', dot: '#F97316', border: 'rgba(249,115,22,0.2)' },
  skills:      { label: 'Skills',      bg: 'rgba(34,197,94,0.09)',    text: '#15803D', dot: '#22C55E', border: 'rgba(34,197,94,0.2)' },
  housing:     { label: 'Housing',     bg: 'rgba(20,184,166,0.09)',   text: '#0F766E', dot: '#14B8A6', border: 'rgba(20,184,166,0.2)' },
  events:      { label: 'Events',      bg: 'rgba(244,63,94,0.09)',    text: '#BE123C', dot: '#F43F5E', border: 'rgba(244,63,94,0.2)' },
};

export function CategoryBadge({ category, subcategory, size = 'md' }: CategoryBadgeProps) {
  const cfg = categoryConfig[category] ?? categoryConfig.all;
  const sm = size === 'sm';

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full"
        style={{
          padding: sm ? '2px 8px' : '3px 10px',
          fontSize: sm ? '10px' : '11px',
          fontWeight: 600,
          color: cfg.text,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          letterSpacing: '0.01em',
        }}
      >
        {/* Dot with subtle glow */}
        <span
          className="inline-block rounded-full"
          style={{
            width: sm ? '5px' : '6px',
            height: sm ? '5px' : '6px',
            backgroundColor: cfg.dot,
            boxShadow: `0 0 4px ${cfg.dot}80`,
          }}
        />
        {cfg.label}
      </span>
      {subcategory && (
        <span style={{ fontSize: sm ? '10px' : '11px', color: '#ADADAA', fontWeight: 400 }}>
          {subcategory}
        </span>
      )}
    </div>
  );
}

export function getCategoryLabel(category: CategoryId): string {
  return categoryConfig[category]?.label ?? category;
}
