import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AppTheme, Chat, Message, ThemeMode, User } from "../types/types";
import { themeOptions } from "../theme/appTheme";

type Props = {
  authUser: User;
  chats: Chat[];
  changePassword: (newPassword: string) => Promise<void>;
  contacts: User[];
  error: string;
  groupAdminIds: string[];
  groupMemberIds: string[];
  groupTitle: string;
  loadingChats: boolean;
  loadingMessages: boolean;
  messageText: string;
  messages: Message[];
  onlineUserIds: string[];
  theme: AppTheme;
  themeMode: ThemeMode;
  selectedChat: Chat | null;
  selectedChatId: string;
  selectedUserId: string;
  selectedView: "chat" | "group-create";
  typingLabel: string;
  clearSession: () => void;
  createGroup: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  formatDay: (value: string) => string;
  formatTime: (value: string) => string;
  getChatLabel: (chat: Chat) => string;
  getChatSubtitle: (chat: Chat) => string;
  handleComposerChange: (value: string) => void;
  openDirectChat: (userId: string) => void | Promise<void>;
  passwordLoading: boolean;
  saveGroupChanges: () => void | Promise<void>;
  selectChat: (chatId: string) => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setMode: (value: ThemeMode) => void;
  setGroupAdminIds: (value: string[]) => void;
  setGroupMemberIds: (value: string[]) => void;
  setGroupTitle: (value: string) => void;
  setSelectedView: (value: "chat" | "group-create") => void;
  setTheme: (value: AppTheme) => void;
};

export const ChatWorkspaceEnhanced = ({
  authUser,
  chats,
  changePassword,
  clearSession,
  contacts,
  createGroup,
  error,
  formatDay,
  formatTime,
  getChatLabel,
  getChatSubtitle,
  groupAdminIds,
  groupMemberIds,
  groupTitle,
  handleComposerChange,
  loadingChats,
  loadingMessages,
  messageText,
  messages,
  onlineUserIds,
  openDirectChat,
  passwordLoading,
  saveGroupChanges,
  selectChat,
  selectedChat,
  selectedChatId,
  selectedUserId,
  selectedView,
  sendMessage,
  setMode,
  setGroupAdminIds,
  setGroupMemberIds,
  setGroupTitle,
  setSelectedView,
  setTheme,
  theme,
  themeMode,
  typingLabel,
}: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isSelectedChatAdmin =
    selectedChat?.admins.some((admin) => admin.id === authUser.id) ?? false;
  const canManageGroup = Boolean(selectedChat?.isGroup && isSelectedChatAdmin);
  const usersForGroupControls = [...contacts, authUser].filter(
    (user, index, array) => array.findIndex((item) => item.id === user.id) === index,
  );
  const panelClass =
    "rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-4 text-[var(--app-text)] shadow-[0_24px_60px_rgba(78,45,16,0.12)]";
  const inputClass =
    "w-full rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-input-bg)] px-4 py-3 text-[var(--app-input-text)] outline-none transition focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-focus-ring)]";
  const multiSelectClass =
    "w-full rounded-[24px] border border-[var(--app-border-strong)] bg-[var(--app-input-bg)] px-3 py-3 text-[var(--app-input-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] outline-none transition focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-focus-ring)]";
  const secondaryButtonClass =
    "rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-4 py-2.5 font-semibold text-[var(--app-button-subtle-text)]";
  const quickEmojis = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "❤️", "😎", "🤝"];
  const quickGifs = [
    { label: "Celebrate", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
    { label: "Thumbs Up", url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif" },
    { label: "Typing Cat", url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
    { label: "Mind Blown", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  ];

  const isUserOnline = (userId: string) => onlineUserIds.includes(userId);
  const getDirectChatMember = (chat: Chat) =>
    chat.members.find((member) => member.id !== selectedUserId) ?? null;
  const getDirectChatStatus = (chat: Chat) => {
    const otherMember = getDirectChatMember(chat);
    if (!otherMember) {
      return "Offline";
    }

    return isUserOnline(otherMember.id) ? "Online" : "Offline";
  };
  const isGifMessage = (text: string) =>
    /^https?:\/\/.+\.(gif)(\?.*)?$/i.test(text) || /giphy\.gif/i.test(text);
  const appendToComposer = (value: string) => {
    handleComposerChange(`${messageText}${messageText ? " " : ""}${value}`);
    setPickerOpen(false);
  };
  const getMessageStatusLabel = (message: Message) => {
    if (message.status === "read") {
      return "Read";
    }
    if (message.status === "delivered") {
      return "Delivered";
    }
    return "Sent";
  };
  const resetPasswordForm = () => {
    setNewPassword("");
    setConfirmPassword("");
  };
  const closeAccountPanels = () => {
    setAccountMenuOpen(false);
    setThemeDialogOpen(false);
    setPasswordDialogOpen(false);
  };
  const handleAccountMenuToggle = () => {
    setAccountMenuOpen((current) => {
      const next = !current;

      if (!next) {
        setThemeDialogOpen(false);
        setPasswordDialogOpen(false);
      }

      return next;
    });
  };
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    await changePassword(newPassword);
    resetPasswordForm();
    closeAccountPanels();
  };

  useEffect(() => {
    if (!isResizingSidebar) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(460, Math.max(260, event.clientX));
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-account-menu]")) {
        return;
      }

      closeAccountPanels();
      resetPasswordForm();
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [accountMenuOpen]);

  return (
    <main
      className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,var(--sidebar-width))_8px_minmax(0,1fr)]"
      style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}
    >
      <motion.aside
        animate={{ opacity: 1, x: 0 }}
        className="grid h-auto content-start gap-4 border-r border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 lg:h-screen lg:overflow-auto"
        initial={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative" data-account-menu>
              <motion.button
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="grid h-13 w-13 place-items-center rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] font-bold text-[var(--app-accent-contrast)]"
                onClick={handleAccountMenuToggle}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                {authUser.username.slice(0, 1).toUpperCase()}
              </motion.button>

              <AnimatePresence>
                {accountMenuOpen ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-15 z-40 min-w-[220px] overflow-hidden rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-xl"
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  >
                    <div className="border-b border-[var(--app-border)] px-3 py-2">
                      <p className="text-sm font-semibold text-[var(--app-text)]">
                        {authUser.username}
                      </p>
                      <p className="text-xs capitalize text-[var(--app-text-muted)]">
                        {authUser.role}
                      </p>
                    </div>

                    <div className="px-2 py-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                        Appearance
                      </p>
                      <div className="inline-flex rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] p-0.5">
                        <motion.button
                          className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
                            themeMode === "light"
                              ? "bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] text-[var(--app-accent-contrast)]"
                              : "text-[var(--app-button-subtle-text)]"
                          }`}
                          aria-label="Light mode"
                          onClick={() => setMode("light")}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span aria-hidden="true">☀</span>
                        </motion.button>
                        <motion.button
                          className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
                            themeMode === "dark"
                              ? "bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] text-[var(--app-accent-contrast)]"
                              : "text-[var(--app-button-subtle-text)]"
                          }`}
                          aria-label="Dark mode"
                          onClick={() => setMode("dark")}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span aria-hidden="true">☾</span>
                        </motion.button>
                      </div>

                      <motion.button
                        className="mt-3 w-full rounded-[16px] border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--app-button-subtle-text)] transition hover:bg-[var(--app-accent-soft)]"
                        onClick={() => {
                          setPasswordDialogOpen(false);
                          setThemeDialogOpen(true);
                        }}
                        type="button"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Themes
                      </motion.button>

                      <motion.button
                        className="mt-2 w-full rounded-[16px] border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--app-button-subtle-text)] transition hover:bg-[var(--app-accent-soft)]"
                        onClick={() => {
                          setThemeDialogOpen(false);
                          setPasswordDialogOpen(true);
                          resetPasswordForm();
                        }}
                        type="button"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Change Password
                      </motion.button>
                    </div>

                    <motion.button
                      className="mt-1 w-full rounded-[16px] px-3 py-2.5 text-left text-sm font-semibold text-[var(--app-danger-text)] transition hover:bg-[var(--app-danger-bg)]"
                      onClick={clearSession}
                      type="button"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {passwordDialogOpen ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-15 z-50 min-w-[280px] overflow-hidden rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                    data-account-menu
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--app-border)] px-3 py-2">
                      <p className="text-sm font-semibold text-[var(--app-text)]">
                        Change password
                      </p>
                      <motion.button
                        className="rounded-full px-2 py-1 text-xs font-semibold text-[var(--app-button-subtle-text)] hover:bg-[var(--app-accent-soft)]"
                        onClick={() => {
                          setPasswordDialogOpen(false);
                          resetPasswordForm();
                        }}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Close
                      </motion.button>
                    </div>
                    <form className="grid gap-3 px-2 py-3" onSubmit={handlePasswordSubmit}>
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
                        <p className="px-1 text-xs font-medium text-[var(--app-danger-text)]">
                          New passwords do not match.
                        </p>
                      ) : null}
                      <motion.button
                        className="rounded-[16px] bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-3 py-2.5 text-sm font-semibold text-[var(--app-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={
                          passwordLoading ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword
                        }
                        type="submit"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {themeDialogOpen ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-15 z-50 min-w-[240px] overflow-hidden rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                    data-account-menu
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--app-border)] px-3 py-2">
                      <p className="text-sm font-semibold text-[var(--app-text)]">Choose theme</p>
                      <motion.button
                        className="rounded-full px-2 py-1 text-xs font-semibold text-[var(--app-button-subtle-text)] hover:bg-[var(--app-accent-soft)]"
                        onClick={() => setThemeDialogOpen(false)}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Close
                      </motion.button>
                    </div>
                    <div className="grid max-h-72 gap-1 overflow-auto px-1 py-2">
                      {themeOptions.map((option) => (
                        <motion.button
                          className={`flex items-center justify-between rounded-[16px] px-3 py-2 text-left text-sm font-semibold transition ${
                            theme === option.value
                              ? "bg-[var(--app-accent-soft)] text-[var(--app-text)]"
                              : "text-[var(--app-button-subtle-text)] hover:bg-[var(--app-accent-soft)]"
                          }`}
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value);
                            closeAccountPanels();
                          }}
                          type="button"
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span>{option.label}</span>
                          <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))]" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
                {authUser.username}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex">
            <motion.button
              className={`rounded-full px-4 py-2.5 font-semibold ${
                selectedView === "group-create"
                ? "bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] text-[var(--app-accent-contrast)]"
                : "border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] text-[var(--app-button-subtle-text)]"
            }`}
            onClick={() => setSelectedView("group-create")}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            New Group
          </motion.button>
        </div>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[var(--app-text)]">Chats</h3>
            <span className="text-sm text-[var(--app-text-muted)]">{loadingChats ? "Loading" : chats.length}</span>
          </div>
          <motion.div className="grid gap-2" layout>
            {chats.map((chat) => (
              <motion.button
                layout
                key={chat.id}
                className={`grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left ${
                  selectedChatId === chat.id && selectedView === "chat"
                    ? "bg-[var(--app-accent-soft)]"
                    : "bg-transparent hover:bg-[var(--app-accent-soft)]"
                }`}
                onClick={() => selectChat(chat.id)}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="grid h-12.5 w-12.5 place-items-center rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] font-bold text-[var(--app-accent-contrast)]">
                  {getChatLabel(chat).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{getChatLabel(chat)}</strong>
                    <small className="text-xs text-[var(--app-text-muted)]">{formatDay(chat.updatedAt)}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                    {chat.isGroup ? getChatSubtitle(chat) : getDirectChatStatus(chat)}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[var(--app-text)]">People</h3>
            <span className="text-sm text-[var(--app-text-muted)]">{contacts.length}</span>
          </div>
          <motion.div className="grid gap-2" layout>
            {contacts.map((user) => (
              <motion.button
                layout
                key={user.id}
                className="grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left hover:bg-[var(--app-accent-soft)]"
                onClick={() => void openDirectChat(user.id)}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="relative grid h-12.5 w-12.5 place-items-center rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] font-bold text-[var(--app-accent-contrast)]">
                  {user.username.slice(0, 1).toUpperCase()}
                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--app-surface-soft)] ${
                      isUserOnline(user.id) ? "bg-[var(--app-online)]" : "bg-[var(--app-offline)]"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{user.username}</strong>
                    <small className="text-xs capitalize text-[var(--app-text-muted)]">{user.role}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                    {isUserOnline(user.id) ? "Online" : "Offline"}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>
      </motion.aside>

      <div
        aria-hidden="true"
        className={`hidden cursor-col-resize bg-transparent transition hover:bg-[var(--app-accent-soft)] lg:block ${
          isResizingSidebar ? "bg-[var(--app-accent-soft)]" : ""
        }`}
        onMouseDown={() => setIsResizingSidebar(true)}
      />

      <motion.section
        animate={{ opacity: 1, x: 0 }}
        className="grid h-auto min-w-0 grid-rows-[auto_minmax(0,1fr)_auto_auto_auto] gap-3 p-4 lg:h-screen lg:p-5"
        initial={{ opacity: 0, x: 18 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--app-danger-text)]"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
              key={error}
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedView === "group-create" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className={`${panelClass} self-start`}
              exit={{ opacity: 0, y: 14 }}
              initial={{ opacity: 0, y: 14 }}
              key="group-create"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--app-text-soft)]">
                  Group Setup
                </p>
                    <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
                  Create a group
                </h2>
              </div>

              <form className="mt-5 grid gap-4" onSubmit={createGroup}>
                <label className="grid gap-2">
                  <span className="text-sm text-[var(--app-text-muted)]">Group name</span>
                  <input
                    className={inputClass}
                    onChange={(event) => setGroupTitle(event.target.value)}
                    placeholder="Weekend Team"
                    required
                    value={groupTitle}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--app-text-muted)]">Members</span>
                  <select
                    className={`${multiSelectClass} min-h-40`}
                    multiple
                    onChange={(event) =>
                      setGroupMemberIds(
                        Array.from(event.target.selectedOptions, (option) => option.value),
                      )
                    }
                    value={groupMemberIds}
                  >
                    {contacts.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--app-text-muted)]">Admins</span>
                  <select
                    className={`${multiSelectClass} min-h-40`}
                    multiple
                    onChange={(event) =>
                      setGroupAdminIds(
                        Array.from(event.target.selectedOptions, (option) => option.value),
                      )
                    }
                    value={groupAdminIds}
                  >
                    {contacts
                      .filter((user) => groupMemberIds.includes(user.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                </label>

                <motion.button
                  className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)]"
                  type="submit"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Create Group
                </motion.button>
              </form>
            </motion.section>
          ) : selectedChat ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="contents"
              exit={{ opacity: 0, y: 14 }}
              initial={{ opacity: 0, y: 14 }}
              key={selectedChat.id}
            >
              <motion.header className={`${panelClass} flex items-start justify-between gap-4`} layout>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--app-text-soft)]">
                    {selectedChat.isGroup ? "Group Chat" : "Direct Chat"}
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
                    {getChatLabel(selectedChat)}
                  </h2>
                  {selectedChat.isGroup ? (
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                      {`${selectedChat.members.length} members • ${selectedChat.admins.length} admins`}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">{getDirectChatStatus(selectedChat)}</p>
                  )}
                </div>
              </motion.header>

              {canManageGroup ? (
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className={`${panelClass} self-start`}
                  initial={{ opacity: 0, y: 14 }}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-serif text-xl font-semibold text-[var(--app-text)]">
                      Group Admin Controls
                    </h3>
                    <motion.button
                      className={secondaryButtonClass}
                      onClick={() => void saveGroupChanges()}
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Save Changes
                    </motion.button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <label className="grid gap-2">
                      <span className="text-sm text-[var(--app-text-muted)]">Group name</span>
                      <input
                        className={inputClass}
                        onChange={(event) => setGroupTitle(event.target.value)}
                        value={groupTitle}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-[var(--app-text-muted)]">Members</span>
                      <select
                        className={`${multiSelectClass} min-h-37.5`}
                        multiple
                        onChange={(event) =>
                          setGroupMemberIds(
                            Array.from(event.target.selectedOptions, (option) => option.value),
                          )
                        }
                        value={groupMemberIds}
                      >
                        {usersForGroupControls.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-[var(--app-text-muted)]">Admins</span>
                      <select
                        className={`${multiSelectClass} min-h-37.5`}
                        multiple
                        onChange={(event) =>
                          setGroupAdminIds(
                            Array.from(event.target.selectedOptions, (option) => option.value),
                          )
                        }
                        value={groupAdminIds}
                      >
                        {usersForGroupControls
                          .filter(
                            (user) =>
                              groupMemberIds.includes(user.id) || user.id === authUser.id,
                          )
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.username}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </motion.section>
              ) : null}

              <motion.section
                animate={{ opacity: 1 }}
                className="grid min-h-0 content-start gap-3 overflow-auto pr-1"
                initial={{ opacity: 0 }}
              >
                {loadingMessages ? (
                  <p className="rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-6 text-[var(--app-text-muted)]">
                    Loading messages...
                  </p>
                ) : null}
                {!loadingMessages && messages.length === 0 ? (
                  <p className="rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-6 text-[var(--app-text-muted)]">
                    No messages yet. Send the first one.
                  </p>
                ) : null}

                <AnimatePresence initial={false}>
                  {messages.map((message) => {
                    const mine = message.sender.id === selectedUserId;

                    return (
                      <motion.article
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`max-w-[72%] rounded-[18px] border border-[var(--app-border)] px-4 py-3 ${
                          mine
                            ? "ml-auto rounded-br-md bg-[var(--app-message-mine)]"
                            : "rounded-bl-md bg-[var(--app-message-other)]"
                        }`}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        key={message.id}
                        transition={{ duration: 0.2 }}
                      >
                        <header className="mb-1.5 flex justify-between gap-3 text-xs text-[var(--app-text-muted)]">
                          <strong>{mine ? "You" : message.sender.username}</strong>
                          <span>{formatTime(message.createdAt)}</span>
                        </header>
                        {isGifMessage(message.text) ? (
                          <img
                            alt="GIF message"
                            className="max-h-60 w-full rounded-2xl object-cover"
                            src={message.text}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        )}
                        <footer className="mt-2 flex justify-end text-[11px] text-[var(--app-text-muted)]">
                          <span>{getMessageStatusLabel(message)}</span>
                        </footer>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.section>

              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="min-h-6 text-sm text-[var(--app-text-muted)]"
                  initial={{ opacity: 0 }}
                  key={typingLabel || "empty-typing"}
                >
                  {typingLabel || " "}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {pickerOpen ? (
                  <motion.section
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[22px] border border-[var(--app-border-strong)] bg-[var(--app-surface-strong)] p-4 shadow-[0_18px_40px_rgba(78,45,16,0.12)]"
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 8 }}
                    key="picker"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--app-text-soft)]">
                          Emoji
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {quickEmojis.map((emoji) => (
                            <button
                              className="rounded-2xl bg-[var(--app-input-bg)] px-3 py-2 text-2xl shadow-sm"
                              key={emoji}
                              onClick={() => appendToComposer(emoji)}
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--app-text-soft)]">
                          GIF
                        </p>
                        <div className="mt-3 grid gap-2">
                          {quickGifs.map((gif) => (
                            <button
                              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-input-bg)] px-3 py-2 text-left text-sm font-semibold text-[var(--app-input-text)]"
                              key={gif.url}
                              onClick={() => appendToComposer(gif.url)}
                              type="button"
                            >
                              {gif.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>

              <motion.form
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                initial={{ opacity: 0, y: 12 }}
                onSubmit={sendMessage}
              >
                <textarea
                  className={`${inputClass} min-h-15.5 resize-none`}
                  onChange={(event) => handleComposerChange(event.target.value)}
                  placeholder="Type a message"
                  rows={2}
                  value={messageText}
                />
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                  <motion.button
                    className="rounded-full border border-[var(--app-button-subtle-border)] bg-[var(--app-button-subtle-bg)] px-5 py-3 font-semibold text-[var(--app-button-subtle-text)]"
                    onClick={() => setPickerOpen((current) => !current)}
                    type="button"
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Emoji / GIF
                  </motion.button>
                  <motion.button
                    className="rounded-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-accent-strong))] px-5 py-3 font-semibold text-[var(--app-accent-contrast)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!messageText.trim()}
                    type="submit"
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Send
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          ) : (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className={`${panelClass} self-start`}
              exit={{ opacity: 0, y: 14 }}
              initial={{ opacity: 0, y: 14 }}
              key="empty-state"
            >
              <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
                Select a user or chat
              </h2>
              <p className="mt-2 text-[var(--app-text-muted)]">
                Choose someone from the left panel to open a direct chat, or create a new group.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
};
