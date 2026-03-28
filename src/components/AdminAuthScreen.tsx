import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

type Props = {
  authLoading: boolean;
  error: string;
  loginUsername: string;
  loginPassword: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setError: (value: string) => void;
  setLoginUsername: (value: string) => void;
  setLoginPassword: (value: string) => void;
};

export const AdminAuthScreen = ({
  authLoading,
  error,
  loginUsername,
  loginPassword,
  onLogin,
  setError,
  setLoginUsername,
  setLoginPassword,
}: Props) => {
  const fieldClass =
    "w-full rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-input-bg)] px-4 py-3 text-[var(--app-input-text)] outline-none transition duration-200 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-focus-ring)]";

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg rounded-4xl border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-8 text-[var(--app-text)] shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-10"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--app-text-soft)]">
            Admin Access
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--app-text)] sm:text-5xl">
            Sign in to continue.
          </h1>
        </div>
        <p className="mt-4 text-base text-[var(--app-text-muted)]">
          This page is reserved for administrators with a valid admin account.
        </p>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-full border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--app-danger-text)]"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
              key={error}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.form
          animate={{ opacity: 1, x: 0 }}
          className="mt-6 grid gap-4"
          initial={{ opacity: 0, x: 14 }}
          onSubmit={onLogin}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <label className="grid gap-2">
            <span className="text-sm text-[var(--app-text-muted)]">Admin username</span>
            <input
              className={fieldClass}
              onChange={(event) => setLoginUsername(event.target.value)}
              placeholder="Enter admin username"
              required
              value={loginUsername}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-[var(--app-text-muted)]">Password</span>
            <input
              className={fieldClass}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter admin password"
              required
              type="password"
              value={loginPassword}
            />
          </label>

          <motion.button
            className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={authLoading}
            type="submit"
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {authLoading ? "Signing in..." : "Admin Login"}
          </motion.button>
        </motion.form>

        <motion.button
          className="mt-4 rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-5 py-3 font-semibold text-[var(--app-button-subtle-text)]"
          onClick={() => {
            setError("");
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          Back To Chat App
        </motion.button>
      </motion.section>
    </main>
  );
};
