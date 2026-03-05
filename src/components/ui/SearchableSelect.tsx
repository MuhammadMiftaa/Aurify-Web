import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  label?: string;
  grouped?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  required,
  label,
  grouped = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.group?.toLowerCase().includes(lower),
    );
  }, [options, search]);

  // Group filtered options if grouped mode
  const groupedOptions = useMemo(() => {
    if (!grouped) return null;
    const groups: Record<string, SelectOption[]> = {};
    for (const opt of filteredOptions) {
      const group = opt.group || "";
      if (!groups[group]) groups[group] = [];
      groups[group].push(opt);
    }
    return groups;
  }, [filteredOptions, grouped]);

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-(--foreground) opacity-80">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Hidden native input for form validation */}
        {required && (
          <input
            tabIndex={-1}
            autoComplete="off"
            value={value}
            required
            onChange={() => {}}
            className="absolute inset-0 opacity-0 pointer-events-none"
          />
        )}

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm outline-none transition-colors",
            "focus:border-(--ring) focus:ring-1 focus:ring-(--ring)",
            value ? "text-(--foreground)" : "text-(--muted-foreground)",
          )}
        >
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-(--muted-foreground) transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-(--border) bg-(--card) shadow-lg"
            style={{
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.3), 0 0 20px rgba(218,165,32,0.05)",
            }}
          >
            {/* Search input */}
            <div className="relative border-b border-(--border) p-2">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-(--border) bg-(--input) py-1.5 pl-8 pr-7 text-xs text-(--foreground) outline-none transition focus:border-(--ring) placeholder:text-(--muted-foreground)"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground)"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-(--muted-foreground)">
                  No results found
                </div>
              ) : grouped && groupedOptions ? (
                Object.entries(groupedOptions).map(([group, opts]) => (
                  <div key={group}>
                    {group && (
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        {group}
                      </div>
                    )}
                    {opts.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition",
                          opt.value === value
                            ? "bg-gold-400/10 text-gold-400"
                            : "text-(--foreground) hover:bg-(--muted)/50",
                          opt.disabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {opt.value === value && (
                          <Check size={12} className="shrink-0" />
                        )}
                        <span
                          className={cn(
                            "truncate",
                            opt.value !== value && "pl-5",
                          )}
                        >
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition",
                      opt.value === value
                        ? "bg-gold-400/10 text-gold-400"
                        : "text-(--foreground) hover:bg-(--muted)/50",
                      opt.disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {opt.value === value && (
                      <Check size={12} className="shrink-0" />
                    )}
                    <span
                      className={cn("truncate", opt.value !== value && "pl-5")}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
