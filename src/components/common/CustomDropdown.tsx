import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

interface CustomDropdownProps<T extends string> {
  options: Array<DropdownOption<T>>;
  value: T;
  placeholder?: string;
  onChange: (value: T) => void;
  widthClassName?: string;
  menuLabel?: string;
  align?: 'left' | 'right';
  disabled?: boolean;
}

export function CustomDropdown<T extends string>({
  options,
  value,
  placeholder,
  onChange,
  widthClassName,
  align = 'left',
  disabled,
}: CustomDropdownProps<T>) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  // Only one dropdown open at a time (simple global coordination)
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom?.detail?.id !== id) setOpen(false);
    };
    window.addEventListener('custom-dropdown-open', handler);
    return () => window.removeEventListener('custom-dropdown-open', handler);
  }, [id]);

  const openMenu = () => {
    if (disabled) return;
    window.dispatchEvent(new CustomEvent('custom-dropdown-open', { detail: { id } }));
    setOpen((v) => !v);
  };

  return (
    <div ref={rootRef} className={widthClassName ?? 'relative'}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={openMenu}
        className={`w-full flex items-center justify-between gap-3 pl-4 pr-4 py-2.5 bg-walnut-50 border border-walnut-200 rounded-lg text-walnut-800 focus:outline-none focus:ring-2 focus:ring-teak-500 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-teak-500'
        }`}
      >
        <span className="truncate text-sm font-medium">
          {selected?.label ?? placeholder ?? 'Select'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-walnut-500 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        }
      >
        <div
          role="listbox"
          aria-labelledby={id}
          className={`absolute mt-2 z-[60] w-full ${align === 'right' ? 'right-0' : 'left-0'} overflow-hidden bg-white border border-walnut-100 rounded-xl shadow-xl transition-all duration-200 origin-top`}
        >
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-walnut-50/70 ${
                      isSelected ? 'bg-teak-50 text-teak-800 font-semibold' : 'text-walnut-700'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected ? <Check className="w-4 h-4 text-teak-600" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

