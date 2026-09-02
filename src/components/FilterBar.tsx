import type { FormEvent, ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type FilterBarProps = {
  children?: ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSubmit?: () => void;
  searchLabel?: string;
};

export function FilterBar({
  children,
  searchValue,
  searchPlaceholder = 'Search…',
  onSearchChange,
  onSubmit,
  searchLabel = 'Search',
}: FilterBarProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit?.();
  }

  return (
    <div className="card mb-6 p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        {onSearchChange !== undefined && searchValue !== undefined && (
          <div className="min-w-[240px] flex-1">
            <Input
              label={searchLabel}
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        )}
        {children}
        {onSubmit && (
          <Button type="submit" size="sm" className="mb-0.5">
            Apply filters
          </Button>
        )}
      </form>
    </div>
  );
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field min-w-[160px] cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
