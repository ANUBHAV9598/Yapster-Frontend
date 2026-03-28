import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

type Props = {
  authLoading: boolean;
  authMode: "login" | "signup";
  error: string;
  loginUsername: string;
  loginPassword: string;
  signupName: string;
  signupPassword: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSignup: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setAuthMode: (mode: "login" | "signup") => void;
  setError: (value: string) => void;
  setLoginUsername: (value: string) => void;
  setLoginPassword: (value: string) => void;
  setSignupName: (value: string) => void;
  setSignupPassword: (value: string) => void;
};

export const AuthScreen = ({
  authLoading,
  authMode,
  error,
  loginPassword,
  loginUsername,
  onLogin,
  onSignup,
  setAuthMode,
  setError,
  setLoginPassword,
  setLoginUsername,
  setSignupName,
  setSignupPassword,
  signupName,
  signupPassword,
}: Props) => {
  const fieldClass =
    "w-full rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-input-bg)] px-4 py-3 text-[var(--app-input-text)] outline-none transition duration-200 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-focus-ring)]";

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute left-[6%] top-[10%] h-44 w-44 rounded-full bg-[var(--app-orb-1)] blur-3xl" />
        <div className="absolute bottom-[12%] right-[8%] h-56 w-56 rounded-full bg-[var(--app-orb-2)] blur-3xl" />
      </motion.div>

      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-xl rounded-[32px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-8 text-[var(--app-text)] shadow-[0_24px_60px_rgba(78,45,16,0.12)] backdrop-blur-xl sm:p-10"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--app-text-soft)]">
            Realtime Workspace
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--app-text)] sm:text-5xl">
            {authMode === "login" ? "Welcome back." : "Create your account."}
          </h1>
        </div>

        <p className="mt-4 max-w-xl text-base text-[var(--app-text-muted)] sm:text-[1.05rem]">
          Sign in to access your conversations, or create a new account to start chatting.
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

        <AnimatePresence mode="wait">
          {authMode === "login" ? (
            <motion.form
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 grid gap-4"
              exit={{ opacity: 0, x: -16 }}
              initial={{ opacity: 0, x: 16 }}
              key="login"
              onSubmit={onLogin}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <label className="grid gap-2">
                <span className="text-sm text-[var(--app-text-muted)]">Username</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                  value={loginUsername}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-[var(--app-text-muted)]">Password</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter your password"
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
                {authLoading ? "Signing in..." : "Login"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 grid gap-4"
              exit={{ opacity: 0, x: 16 }}
              initial={{ opacity: 0, x: -16 }}
              key="signup"
              onSubmit={onSignup}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <label className="grid gap-2">
                <span className="text-sm text-[var(--app-text-muted)]">Username</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder="Choose a username"
                  required
                  value={signupName}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-[var(--app-text-muted)]">Password</span>
                <input
                  className={fieldClass}
                  minLength={6}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={signupPassword}
                />
              </label>
              <motion.button
                className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={authLoading}
                type="submit"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {authLoading ? "Creating account..." : "Sign up"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.button
          className="mt-4 rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-5 py-3 font-semibold text-[var(--app-button-subtle-text)]"
          onClick={() => {
            setError("");
            setAuthMode(authMode === "login" ? "signup" : "login");
          }}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          {authMode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </motion.button>
      </motion.section>
    </main>
  );
};
