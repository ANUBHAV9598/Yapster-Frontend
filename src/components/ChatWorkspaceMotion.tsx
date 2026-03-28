import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Chat, Message, User } from "../types/types";

type Props = {
  authUser: User;
  chats: Chat[];
  contacts: User[];
  error: string;
  groupAdminIds: string[];
  groupMemberIds: string[];
  groupTitle: string;
  loadingChats: boolean;
  loadingMessages: boolean;
  messageText: string;
  messages: Message[];
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
  saveGroupChanges: () => void | Promise<void>;
  selectChat: (chatId: string) => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setGroupAdminIds: (value: string[]) => void;
  setGroupMemberIds: (value: string[]) => void;
  setGroupTitle: (value: string) => void;
  setSelectedView: (value: "chat" | "group-create") => void;
};

export const ChatWorkspaceMotion = ({
  authUser,
  chats,
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
  openDirectChat,
  saveGroupChanges,
  selectChat,
  selectedChat,
  selectedChatId,
  selectedUserId,
  selectedView,
  sendMessage,
  setGroupAdminIds,
  setGroupMemberIds,
  setGroupTitle,
  setSelectedView,
  typingLabel,
}: Props) => {
  const isSelectedChatAdmin =
    selectedChat?.admins.some((admin) => admin.id === authUser.id) ?? false;
  const canManageGroup = Boolean(selectedChat?.isGroup && isSelectedChatAdmin);
  const usersForGroupControls = [...contacts, authUser].filter(
    (user, index, array) => array.findIndex((item) => item.id === user.id) === index,
  );
  const panelClass =
    "rounded-[22px] border border-[#4c341e29] bg-[rgba(255,251,244,0.82)] p-4 shadow-[0_24px_60px_rgba(78,45,16,0.12)]";
  const inputClass =
    "w-full rounded-2xl border border-[#4c341e29] bg-white/80 px-4 py-3 text-[#27170b] outline-none transition focus:border-[#c65d2e7a] focus:ring-4 focus:ring-[#c65d2e14]";
  const secondaryButtonClass =
    "rounded-full border border-[#c65d2e38] bg-white/60 px-4 py-2.5 font-semibold text-[#8f3414]";
  const getDirectChatMeta = (chat: Chat) =>
    chat.members
      .filter((member) => member.id !== selectedUserId)
      .map((member) => member.email ?? member.role ?? "User")
      .join(", ");

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_24%),linear-gradient(180deg,#efe7da_0%,#e3d6c2_100%)] lg:grid-cols-[380px_minmax(0,1fr)]">
      <motion.aside
        animate={{ opacity: 1, x: 0 }}
        className="grid h-auto content-start gap-4 border-r border-[#4c341e24] bg-[rgba(248,242,232,0.88)] p-4 lg:h-screen lg:overflow-auto"
        initial={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f3414]">
              Signed In
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-[-0.03em] text-[#27170b]">
              {authUser.username}
            </h2>
            <p className="mt-1 text-sm text-[#715c4a]">
              {authUser.role === "admin" ? "Platform admin" : "Standard user"}
            </p>
          </div>
          <motion.button
            className={secondaryButtonClass}
            onClick={clearSession}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            Logout
          </motion.button>
        </div>

        <div className="flex">
          <motion.button
            className={`rounded-full px-4 py-2.5 font-semibold ${
              selectedView === "group-create"
                ? "bg-linear-to-br from-[#c65d2e] to-[#8f3414] text-white"
                : "border border-[#c65d2e33] bg-white/60 text-[#8f3414]"
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
            <h3 className="font-serif text-xl font-semibold text-[#27170b]">Chats</h3>
            <span className="text-sm text-[#715c4a]">{loadingChats ? "Loading" : chats.length}</span>
          </div>
          <motion.div className="grid gap-2" layout>
            {chats.map((chat) => (
              <motion.button
                layout
                key={chat.id}
                className={`grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left ${
                  selectedChatId === chat.id && selectedView === "chat"
                    ? "bg-[#c65d2e1a]"
                    : "bg-transparent hover:bg-[#c65d2e12]"
                }`}
                onClick={() => selectChat(chat.id)}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="grid h-12.5 w-12.5 place-items-center rounded-full bg-linear-to-br from-[#d8b58f] to-[#b87342] font-bold text-white">
                  {getChatLabel(chat).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{getChatLabel(chat)}</strong>
                    <small className="text-xs text-[#715c4a]">{formatDay(chat.updatedAt)}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#715c4a]">{getChatSubtitle(chat)}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#27170b]">People</h3>
            <span className="text-sm text-[#715c4a]">{contacts.length}</span>
          </div>
          <motion.div className="grid gap-2" layout>
            {contacts.map((user) => (
              <motion.button
                layout
                key={user.id}
                className="grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left hover:bg-[#c65d2e12]"
                onClick={() => void openDirectChat(user.id)}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="grid h-12.5 w-12.5 place-items-center rounded-full bg-linear-to-br from-[#7b9a7f] to-[#49694d] font-bold text-white">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{user.username}</strong>
                    <small className="text-xs capitalize text-[#715c4a]">{user.role}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#715c4a]">{user.email ?? "No email"}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>
      </motion.aside>

      <motion.section
        animate={{ opacity: 1, x: 0 }}
        className="grid h-auto min-w-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-3 p-4 lg:h-screen lg:p-5"
        initial={{ opacity: 0, x: 18 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full border border-[#8f34142e] bg-[rgba(255,241,236,0.95)] px-4 py-3 text-sm font-medium text-[#8f3414]"
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f3414]">
                  Group Setup
                </p>
                <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#27170b]">
                  Create a group
                </h2>
              </div>

              <form className="mt-5 grid gap-4" onSubmit={createGroup}>
                <label className="grid gap-2">
                  <span className="text-sm text-[#715c4a]">Group name</span>
                  <input
                    className={inputClass}
                    onChange={(event) => setGroupTitle(event.target.value)}
                    placeholder="Weekend Team"
                    required
                    value={groupTitle}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[#715c4a]">Members</span>
                  <select
                    className={`${inputClass} min-h-40`}
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
                  <span className="text-sm text-[#715c4a]">Admins</span>
                  <select
                    className={`${inputClass} min-h-40`}
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
                  className="rounded-full bg-linear-to-br from-[#c65d2e] to-[#8f3414] px-5 py-3 font-semibold text-[#fffaf4]"
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f3414]">
                    {selectedChat.isGroup ? "Group Chat" : "Direct Chat"}
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#27170b]">
                    {getChatLabel(selectedChat)}
                  </h2>
                  <p className="mt-1 text-sm text-[#715c4a]">
                    {selectedChat.isGroup
                      ? `${selectedChat.members.length} members • ${selectedChat.admins.length} admins`
                      : getDirectChatMeta(selectedChat)}
                  </p>
                </div>
              </motion.header>

              {canManageGroup ? (
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className={`${panelClass} self-start`}
                  initial={{ opacity: 0, y: 14 }}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-serif text-xl font-semibold text-[#27170b]">
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
                      <span className="text-sm text-[#715c4a]">Group name</span>
                      <input
                        className={inputClass}
                        onChange={(event) => setGroupTitle(event.target.value)}
                        value={groupTitle}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-[#715c4a]">Members</span>
                      <select
                        className={`${inputClass} min-h-37.5`}
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
                      <span className="text-sm text-[#715c4a]">Admins</span>
                      <select
                        className={`${inputClass} min-h-37.5`}
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
                  <p className="rounded-[22px] border border-[#4c341e29] bg-[rgba(255,251,244,0.82)] p-6 text-[#715c4a]">
                    Loading messages...
                  </p>
                ) : null}
                {!loadingMessages && messages.length === 0 ? (
                  <p className="rounded-[22px] border border-[#4c341e29] bg-[rgba(255,251,244,0.82)] p-6 text-[#715c4a]">
                    No messages yet. Send the first one.
                  </p>
                ) : null}

                <AnimatePresence initial={false}>
                  {messages.map((message) => {
                    const mine = message.sender.id === selectedUserId;

                    return (
                      <motion.article
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`max-w-[72%] rounded-[18px] border border-[#4c341e14] px-4 py-3 ${
                          mine
                            ? "ml-auto rounded-br-md bg-[rgba(182,224,180,0.7)]"
                            : "rounded-bl-md bg-white/92"
                        }`}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        key={message.id}
                        transition={{ duration: 0.2 }}
                      >
                        <header className="mb-1.5 flex justify-between gap-3 text-xs text-[#715c4a]">
                          <strong>{mine ? "You" : message.sender.username}</strong>
                          <span>{formatTime(message.createdAt)}</span>
                        </header>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.section>

              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="min-h-6 text-sm text-[#715c4a]"
                  initial={{ opacity: 0 }}
                  key={typingLabel || "empty-typing"}
                >
                  {typingLabel || " "}
                </motion.div>
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
                <motion.button
                  className="rounded-full bg-linear-to-br from-[#c65d2e] to-[#8f3414] px-5 py-3 font-semibold text-[#fffaf4] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!messageText.trim()}
                  type="submit"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Send
                </motion.button>
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
              <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[#27170b]">
                Select a user or chat
              </h2>
              <p className="mt-2 text-[#715c4a]">
                Choose someone from the left panel to open a direct chat, or create a new group.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
};
