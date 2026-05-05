import type { CategoryId } from '../data/mockData';

interface CategoryBadgeProps {
  category: CategoryId;
  subcategory?: string;
  size?: 'sm' | 'md';
}

// element-level 多色（恢复 figma 8f032d0 风）：
// 每个 category 一种独立颜色，浅底 + 深字 + 彩色 dot；底色（页面 / 三栏）依旧纯白
const categoryConfig: Record<CategoryId, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  all:         { label: '全部', bg: 'var(--cat-all-bg)',         text: 'var(--cat-all-text)',         dot: 'var(--cat-all-dot)',         border: 'var(--cat-all-border)' },
  jobs:        { label: '职位', bg: 'var(--cat-jobs-bg)',        text: 'var(--cat-jobs-text)',        dot: 'var(--cat-jobs-dot)',        border: 'var(--cat-jobs-border)' },
  projects:    { label: '项目', bg: 'var(--cat-projects-bg)',    text: 'var(--cat-projects-text)',    dot: 'var(--cat-projects-dot)',    border: 'var(--cat-projects-border)' },
  marketplace: { label: '二手', bg: 'var(--cat-marketplace-bg)', text: 'var(--cat-marketplace-text)', dot: 'var(--cat-marketplace-dot)', border: 'var(--cat-marketplace-border)' },
  skills:      { label: '技能', bg: 'var(--cat-skills-bg)',      text: 'var(--cat-skills-text)',      dot: 'var(--cat-skills-dot)',      border: 'var(--cat-skills-border)' },
  housing:     { label: '租房', bg: 'var(--cat-housing-bg)',     text: 'var(--cat-housing-text)',     dot: 'var(--cat-housing-dot)',     border: 'var(--cat-housing-border)' },
  events:      { label: '活动', bg: 'var(--cat-events-bg)',      text: 'var(--cat-events-text)',      dot: 'var(--cat-events-dot)',      border: 'var(--cat-events-border)' },
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
        {/* 彩色小点：figma 风 subtle glow */}
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
        <span style={{ fontSize: sm ? '10px' : '11px', color: '#999999', fontWeight: 400 }}>
          {subcategory}
        </span>
      )}
    </div>
  );
}

export function getCategoryLabel(category: CategoryId): string {
  return categoryConfig[category]?.label ?? category;
}
