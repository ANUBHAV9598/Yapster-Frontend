import type { FormEvent } from "react";
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

export const ChatWorkspaceTailwind = ({
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
  const isSelectedChatAdmin = selectedChat?.admins.some((admin) => admin.id === authUser.id) ?? false;
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

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_24%),linear-gradient(180deg,#efe7da_0%,#e3d6c2_100%)] lg:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="grid h-auto content-start gap-4 border-r border-[#4c341e24] bg-[rgba(248,242,232,0.88)] p-4 lg:h-screen lg:overflow-auto">
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
          <button className={secondaryButtonClass} onClick={clearSession} type="button">
            Logout
          </button>
        </div>

        <div className="flex">
          <button
            className={`rounded-full px-4 py-2.5 font-semibold ${
              selectedView === "group-create"
                ? "bg-gradient-to-br from-[#c65d2e] to-[#8f3414] text-white"
                : "border border-[#c65d2e33] bg-white/60 text-[#8f3414]"
            }`}
            onClick={() => setSelectedView("group-create")}
            type="button"
          >
            New Group
          </button>
        </div>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#27170b]">Chats</h3>
            <span className="text-sm text-[#715c4a]">{loadingChats ? "Loading" : chats.length}</span>
          </div>
          <div className="grid gap-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left ${
                  selectedChatId === chat.id && selectedView === "chat"
                    ? "bg-[#c65d2e1a]"
                    : "bg-transparent hover:bg-[#c65d2e12]"
                }`}
                onClick={() => selectChat(chat.id)}
                type="button"
              >
                <div className="grid h-[50px] w-[50px] place-items-center rounded-full bg-gradient-to-br from-[#d8b58f] to-[#b87342] font-bold text-white">
                  {getChatLabel(chat).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{getChatLabel(chat)}</strong>
                    <small className="text-xs text-[#715c4a]">{formatDay(chat.updatedAt)}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#715c4a]">{getChatSubtitle(chat)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#27170b]">People</h3>
            <span className="text-sm text-[#715c4a]">{contacts.length}</span>
          </div>
          <div className="grid gap-2">
            {contacts.map((user) => (
              <button
                key={user.id}
                className="grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 rounded-[18px] px-3 py-2.5 text-left hover:bg-[#c65d2e12]"
                onClick={() => void openDirectChat(user.id)}
                type="button"
              >
                <div className="grid h-[50px] w-[50px] place-items-center rounded-full bg-gradient-to-br from-[#7b9a7f] to-[#49694d] font-bold text-white">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between gap-3">
                    <strong>{user.username}</strong>
                    <small className="text-xs capitalize text-[#715c4a]">{user.role}</small>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#715c4a]">{user.email ?? "No email"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="grid h-auto min-w-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-3 p-4 lg:h-screen lg:p-5">
        {error ? (
          <div className="rounded-full border border-[#8f34142e] bg-[rgba(255,241,236,0.95)] px-4 py-3 text-sm font-medium text-[#8f3414]">
            {error}
          </div>
        ) : null}

        {selectedView === "group-create" ? (
          <section className={`${panelClass} self-start`}>
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
                  className={`${inputClass} min-h-[160px]`}
                  multiple
                  onChange={(event) =>
                    setGroupMemberIds(Array.from(event.target.selectedOptions, (option) => option.value))
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
                  className={`${inputClass} min-h-[160px]`}
                  multiple
                  onChange={(event) =>
                    setGroupAdminIds(Array.from(event.target.selectedOptions, (option) => option.value))
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

              <button className="rounded-full bg-gradient-to-br from-[#c65d2e] to-[#8f3414] px-5 py-3 font-semibold text-[#fffaf4]" type="submit">
                Create Group
              </button>
            </form>
          </section>
        ) : selectedChat ? (
          <>
            <header className={`${panelClass} flex items-start justify-between gap-4`}>
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
                    : getChatSubtitle(selectedChat)}
                </p>
              </div>
            </header>

            {canManageGroup ? (
              <section className={`${panelClass} self-start`}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="font-serif text-xl font-semibold text-[#27170b]">Group Admin Controls</h3>
                  <button className={secondaryButtonClass} onClick={() => void saveGroupChanges()} type="button">
                    Save Changes
                  </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm text-[#715c4a]">Group name</span>
                    <input className={inputClass} onChange={(event) => setGroupTitle(event.target.value)} value={groupTitle} />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-[#715c4a]">Members</span>
                    <select
                      className={`${inputClass} min-h-[150px]`}
                      multiple
                      onChange={(event) =>
                        setGroupMemberIds(Array.from(event.target.selectedOptions, (option) => option.value))
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
                      className={`${inputClass} min-h-[150px]`}
                      multiple
                      onChange={(event) =>
                        setGroupAdminIds(Array.from(event.target.selectedOptions, (option) => option.value))
                      }
                      value={groupAdminIds}
                    >
                      {usersForGroupControls
                        .filter((user) => groupMemberIds.includes(user.id) || user.id === authUser.id)
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              </section>
            ) : null}

            <section className="grid min-h-0 content-start gap-3 overflow-auto pr-1">
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

              {messages.map((message) => {
                const mine = message.sender.id === selectedUserId;

                return (
                  <article
                    key={message.id}
                    className={`max-w-[72%] rounded-[18px] border border-[#4c341e14] px-4 py-3 ${
                      mine
                        ? "ml-auto rounded-br-[6px] bg-[rgba(182,224,180,0.7)]"
                        : "rounded-bl-[6px] bg-white/92"
                    }`}
                  >
                    <header className="mb-1.5 flex justify-between gap-3 text-xs text-[#715c4a]">
                      <strong>{mine ? "You" : message.sender.username}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </header>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </article>
                );
              })}
            </section>

            <div className="min-h-6 text-sm text-[#715c4a]">{typingLabel || " "}</div>

            <form className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]" onSubmit={sendMessage}>
              <textarea
                className={`${inputClass} min-h-[62px] resize-none`}
                onChange={(event) => handleComposerChange(event.target.value)}
                placeholder="Type a message"
                rows={2}
                value={messageText}
              />
              <button
                className="rounded-full bg-gradient-to-br from-[#c65d2e] to-[#8f3414] px-5 py-3 font-semibold text-[#fffaf4] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!messageText.trim()}
                type="submit"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <section className={`${panelClass} self-start`}>
            <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[#27170b]">
              Select a user or chat
            </h2>
            <p className="mt-2 text-[#715c4a]">
              Choose someone from the left panel to open a direct chat, or create a new group.
            </p>
          </section>
        )}
      </section>
    </main>
  );
};
