import { motion } from "motion/react";
import { themeOptions } from "../theme/appTheme";
import type { AppTheme, ThemeMode } from "../types/types";
import { ModernDropdown } from "./ModernDropdown";

type Props = {
  mode: ThemeMode;
  theme: AppTheme;
  compact?: boolean;
  setMode: (value: ThemeMode) => void;
  setTheme: (value: AppTheme) => void;
};

export const ThemeControls = ({
  compact = false,
  mode,
  setMode,
  setTheme,
  theme,
}: Props) => {
  const wrapperClass = compact
    ? "flex flex-wrap items-center justify-end gap-2"
    : "flex flex-wrap items-center gap-3";
  const buttonClass =
    "rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-button-subtle-text)] transition";
  return (
    <div className={wrapperClass}>
      <div className="flex rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] p-1">
        <motion.button
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            mode === "light"
              ? "bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] text-[var(--app-accent-contrast)]"
              : "text-[var(--app-button-subtle-text)]"
          }`}
          onClick={() => setMode("light")}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Light
        </motion.button>
        <motion.button
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            mode === "dark"
              ? "bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] text-[var(--app-accent-contrast)]"
              : "text-[var(--app-button-subtle-text)]"
          }`}
          onClick={() => setMode("dark")}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Dark
        </motion.button>
      </div>

      <ModernDropdown
        ariaLabel="Theme"
        compact={compact}
        onChange={(value) => setTheme(value as AppTheme)}
        options={themeOptions.map((option) => ({
          value: option.value,
          label: option.label,
          description: compact ? undefined : `${option.label} palette`,
        }))}
        value={theme}
      />

      {compact ? null : (
        <motion.button
          className={buttonClass}
          onClick={() => {
            setTheme("sunset");
            setMode("light");
          }}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Reset
        </motion.button>
      )}
    </div>
  );
};
