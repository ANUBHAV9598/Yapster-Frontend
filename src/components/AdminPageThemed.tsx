import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { AppTheme, Chat, Message, ThemeMode, User } from "../types/types";
import { api } from "../utils/conn";
import { ModernDropdown } from "./ModernDropdown";
import { ThemeControls } from "./ThemeControls";

type Props = {
  authUser: User;
  changePassword: (newPassword: string) => Promise<void>;
  clearSession: () => void;
  passwordLoading: boolean;
  setMode: (value: ThemeMode) => void;
  setTheme: (value: AppTheme) => void;
  theme: AppTheme;
  themeMode: ThemeMode;
};

type DashboardStats = {
  users: number;
  chats: number;
  messages: number;
};

export const AdminPageThemed = ({
  authUser,
  changePassword,
  clearSession,
  passwordLoading,
  setMode,
  setTheme,
  theme,
  themeMode,
}: Props) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "user">("user");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, usersResponse, chatsResponse, messagesResponse] =
        await Promise.all([
          api.get<{ stats: DashboardStats }>("/admin/dashboard"),
          api.get<User[]>("/admin/users"),
          api.get<Chat[]>("/admin/chats"),
          api.get<Message[]>("/admin/messages"),
        ]);

      setStats(dashboardResponse.data.stats);
      setUsers(usersResponse.data);
      setChats(chatsResponse.data);
      setMessages(messagesResponse.data);
    } catch {
      setError("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      await api.post("/admin/users", {
        username: createUsername,
        password: createPassword,
        role: createRole,
      });
      setCreateUsername("");
      setCreatePassword("");
      setCreateRole("user");
      await loadAdminData();
    } catch {
      setError("Could not create the user.");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setError("");
      await api.delete(`/admin/users/${userId}`);
      await loadAdminData();
    } catch {
      setError("Could not delete that user.");
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      setError("");
      await api.delete(`/admin/chats/${chatId}`);
      await loadAdminData();
    } catch {
      setError("Could not delete that chat.");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setError("");
      await api.delete(`/admin/messages/${messageId}`);
      await loadAdminData();
    } catch {
      setError("Could not delete that message.");
    }
  };
  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setError("");
      await changePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      return;
    }
  };

  const cardClass =
    "rounded-[28px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-6 text-[var(--app-text)] shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl";
  const inputClass =
    "w-full rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-input-bg)] px-4 py-3 text-[var(--app-input-text)] outline-none transition duration-200 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-focus-ring)]";
  const subtleButtonClass =
    "rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-button-subtle-text)]";
  const dangerButtonClass =
    "rounded-full border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-danger-text)]";

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} relative z-30 overflow-visible`}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--app-text-soft)]">
                Admin Page
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
                Welcome, {authUser.username}
              </h1>
              <p className="mt-4 max-w-2xl text-[var(--app-text-muted)]">
                Manage users, chats, and messages from one place. These actions are protected by the admin token.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 md:items-end">
              <ThemeControls
                compact
                mode={themeMode}
                setMode={setMode}
                setTheme={setTheme}
                theme={theme}
              />
              <motion.button
                className="rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-5 py-3 font-semibold text-[var(--app-button-subtle-text)]"
                onClick={clearSession}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                Logout
              </motion.button>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-full border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--app-danger-text)]">
              {error}
            </div>
          ) : null}
        </motion.section>

        <section className="relative z-0 grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-text-soft)]">Users</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--app-text)]">
              {loading ? "..." : stats?.users ?? 0}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-text-soft)]">Chats</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--app-text)]">
              {loading ? "..." : stats?.chats ?? 0}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-text-soft)]">Messages</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--app-text)]">
              {loading ? "..." : stats?.messages ?? 0}
            </p>
          </div>
        </section>

        <section className="relative z-0 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid h-fit gap-6">
            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--app-text-soft)]">
                Change Password
              </p>
              <form className="mt-5 grid gap-4" onSubmit={handlePasswordChange}>
                <input
                  className={inputClass}
                  minLength={6}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                  required
                  type="password"
                  value={newPassword}
                />
                <input
                  className={inputClass}
                  minLength={6}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  required
                  type="password"
                  value={confirmPassword}
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword ? (
                  <p className="text-sm text-[var(--app-danger-text)]">
                    New passwords do not match.
                  </p>
                ) : null}
                <motion.button
                  className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    passwordLoading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  type="submit"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </motion.button>
              </form>
            </div>

            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--app-text-soft)]">
                Create User
              </p>
              <form className="mt-5 grid gap-4" onSubmit={createUser}>
                <input
                  className={inputClass}
                  onChange={(event) => setCreateUsername(event.target.value)}
                  placeholder="Username"
                  required
                  value={createUsername}
                />
                <input
                  className={inputClass}
                  minLength={6}
                  onChange={(event) => setCreatePassword(event.target.value)}
                  placeholder="Password"
                  required
                  type="password"
                  value={createPassword}
                />
                <ModernDropdown
                  ariaLabel="Create user role"
                  onChange={(value) => setCreateRole(value as "admin" | "user")}
                  options={[
                    { value: "user", label: "User", description: "Standard account access" },
                    { value: "admin", label: "Admin", description: "Full management access" },
                  ]}
                  value={createRole}
                />
                <motion.button
                  className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)]"
                  type="submit"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Create User
                </motion.button>
              </form>
            </div>
          </div>

          <div className="grid gap-6">
            <section className={cardClass}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold text-[var(--app-text)]">Users</h2>
                <button
                  className={subtleButtonClass}
                  onClick={() => void loadAdminData()}
                  type="button"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {users.map((user) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-button-subtle-bg)] p-4 md:flex-row md:items-center md:justify-between"
                    key={user.id}
                  >
                    <div>
                      <p className="font-semibold text-[var(--app-text)]">{user.username}</p>
                      <p className="text-sm capitalize text-[var(--app-text-muted)]">{user.role}</p>
                    </div>
                    <motion.button
                      className={`${dangerButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                      disabled={user.id === authUser.id}
                      onClick={() => void deleteUser(user.id)}
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Delete User
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="font-serif text-2xl font-semibold text-[var(--app-text)]">Chats</h2>
              <div className="mt-4 grid gap-3">
                {chats.map((chat) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-button-subtle-bg)] p-4 md:flex-row md:items-center md:justify-between"
                    key={chat.id}
                  >
                    <div>
                      <p className="font-semibold text-[var(--app-text)]">
                        {chat.title ?? chat.members.map((member) => member.username).join(", ")}
                      </p>
                      <p className="text-sm text-[var(--app-text-muted)]">
                        {chat.isGroup ? "Group chat" : "Direct chat"} - {chat.members.length} members
                      </p>
                    </div>
                    <motion.button
                      className={dangerButtonClass}
                      onClick={() => void deleteChat(chat.id)}
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Delete Chat
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="font-serif text-2xl font-semibold text-[var(--app-text)]">Messages</h2>
              <div className="mt-4 grid gap-3">
                {messages.map((message) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-button-subtle-bg)] p-4 md:flex-row md:items-center md:justify-between"
                    key={message.id}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--app-text)]">{message.sender.username}</p>
                      <p className="truncate text-sm text-[var(--app-text-muted)]">{message.text}</p>
                    </div>
                    <motion.button
                      className={dangerButtonClass}
                      onClick={() => void deleteMessage(message.id)}
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Delete Message
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};
