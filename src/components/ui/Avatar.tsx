type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const displayName = name?.trim() || 'User';

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white ${sizeClass[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary-dark font-semibold text-white ring-2 ring-white ${sizeClass[size]} ${className}`}
      aria-hidden
    >
      {getInitials(displayName)}
    </div>
  );
}
