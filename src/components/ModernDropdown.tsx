import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Option = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  ariaLabel: string;
  compact?: boolean;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export const ModernDropdown = ({
  ariaLabel,
  compact = false,
  onChange,
  options,
  value,
}: Props) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className={`relative ${compact ? "min-w-[152px]" : "min-w-[188px]"}`} ref={wrapperRef}>
      <motion.button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-3 rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-4 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition focus-visible:border-[var(--app-accent)] focus-visible:ring-4 focus-visible:ring-[var(--app-focus-ring)] focus-visible:outline-none ${
          open ? "border-[var(--app-accent)]" : ""
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))]" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[var(--app-button-subtle-text)]">
              {selectedOption?.label}
            </span>
            {selectedOption?.description && !compact ? (
              <span className="block truncate text-xs text-[var(--app-text-muted)]">
                {selectedOption.description}
              </span>
            ) : null}
          </span>
        </span>
        <span className="text-xs font-semibold text-[var(--app-button-subtle-text)]">
          {open ? "^" : "v"}
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 z-40 mt-2 w-full overflow-hidden rounded-[24px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-2 shadow-[0_22px_55px_rgba(0,0,0,0.16)] backdrop-blur-xl"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            <div aria-label={ariaLabel} className="grid gap-1" role="listbox">
              {options.map((option) => (
                <motion.button
                  aria-selected={option.value === value}
                  className={`w-full rounded-[18px] px-3 py-2.5 text-left transition ${
                    option.value === value
                      ? "bg-[var(--app-accent-soft)]"
                      : "hover:bg-[var(--app-accent-soft)]"
                  }`}
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  role="option"
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="block text-sm font-semibold text-[var(--app-text)]">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                      {option.description}
                    </span>
                  ) : null}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
