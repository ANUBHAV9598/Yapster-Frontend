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

export const ChatWorkspace = ({
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

  return (
    <main className="wa-shell">
      <aside className="wa-sidebar">
        <div className="wa-sidebar-head">
          <div>
            <p className="section-kicker">Signed In</p>
            <h2>{authUser.username}</h2>
            <p className="profile-meta">
              {authUser.role === "admin" ? "Platform admin" : "Standard user"}
            </p>
          </div>
          <button className="secondary-button" onClick={clearSession} type="button">
            Logout
          </button>
        </div>

        <div className="wa-actions">
          <button
            className={`wa-action ${selectedView === "group-create" ? "active" : ""}`}
            onClick={() => setSelectedView("group-create")}
            type="button"
          >
            New Group
          </button>
        </div>

        <section className="wa-list-block">
          <div className="wa-list-head">
            <h3>Chats</h3>
            <span>{loadingChats ? "Loading" : chats.length}</span>
          </div>
          <div className="wa-list">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`wa-list-item ${selectedChatId === chat.id && selectedView === "chat" ? "active" : ""}`}
                onClick={() => selectChat(chat.id)}
                type="button"
              >
                <div className="wa-avatar">{getChatLabel(chat).slice(0, 1).toUpperCase()}</div>
                <div className="wa-list-copy">
                  <div className="wa-list-top">
                    <strong>{getChatLabel(chat)}</strong>
                    <small>{formatDay(chat.updatedAt)}</small>
                  </div>
                  <p>{getChatSubtitle(chat)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="wa-list-block">
          <div className="wa-list-head">
            <h3>People</h3>
            <span>{contacts.length}</span>
          </div>
          <div className="wa-list">
            {contacts.map((user) => (
              <button
                key={user.id}
                className="wa-list-item"
                onClick={() => void openDirectChat(user.id)}
                type="button"
              >
                <div className="wa-avatar user">{user.username.slice(0, 1).toUpperCase()}</div>
                <div className="wa-list-copy">
                  <div className="wa-list-top">
                    <strong>{user.username}</strong>
                    <small>{user.role}</small>
                  </div>
                  <p>{user.email ?? "No email"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="wa-main">
        {error ? <div className="banner">{error}</div> : null}

        {selectedView === "group-create" ? (
          <section className="wa-group-builder">
            <div className="wa-chat-head">
              <div>
                <p className="section-kicker">Group Setup</p>
                <h2>Create a group</h2>
              </div>
            </div>

            <form className="wa-builder-form" onSubmit={createGroup}>
              <label>
                <span>Group name</span>
                <input
                  onChange={(event) => setGroupTitle(event.target.value)}
                  placeholder="Weekend Team"
                  required
                  value={groupTitle}
                />
              </label>

              <label>
                <span>Members</span>
                <select
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

              <label>
                <span>Admins</span>
                <select
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

              <button className="primary-button" type="submit">
                Create Group
              </button>
            </form>
          </section>
        ) : selectedChat ? (
          <>
            <header className="wa-chat-head">
              <div>
                <p className="section-kicker">{selectedChat.isGroup ? "Group Chat" : "Direct Chat"}</p>
                <h2>{getChatLabel(selectedChat)}</h2>
                <p className="wa-chat-meta">
                  {selectedChat.isGroup
                    ? `${selectedChat.members.length} members • ${selectedChat.admins.length} admins`
                    : getChatSubtitle(selectedChat)}
                </p>
              </div>
            </header>

            {canManageGroup ? (
              <section className="wa-group-admin">
                <div className="wa-list-head">
                  <h3>Group Admin Controls</h3>
                  <button className="secondary-button" onClick={() => void saveGroupChanges()} type="button">
                    Save Changes
                  </button>
                </div>

                <div className="wa-group-grid">
                  <label>
                    <span>Group name</span>
                    <input onChange={(event) => setGroupTitle(event.target.value)} value={groupTitle} />
                  </label>

                  <label>
                    <span>Members</span>
                    <select
                      multiple
                      onChange={(event) =>
                        setGroupMemberIds(Array.from(event.target.selectedOptions, (option) => option.value))
                      }
                      value={groupMemberIds}
                    >
                      {contacts.concat(authUser).map((user, index, array) =>
                        array.findIndex((item) => item.id === user.id) === index ? (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ) : null,
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Admins</span>
                    <select
                      multiple
                      onChange={(event) =>
                        setGroupAdminIds(Array.from(event.target.selectedOptions, (option) => option.value))
                      }
                      value={groupAdminIds}
                    >
                      {contacts
                        .concat(authUser)
                        .filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index)
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

            <section className="wa-message-stream">
              {loadingMessages ? <p className="empty-state">Loading messages...</p> : null}
              {!loadingMessages && messages.length === 0 ? (
                <p className="empty-state">No messages yet. Send the first one.</p>
              ) : null}

              {messages.map((message) => {
                const mine = message.sender.id === selectedUserId;

                return (
                  <article key={message.id} className={`wa-bubble ${mine ? "mine" : ""}`}>
                    <header>
                      <strong>{mine ? "You" : message.sender.username}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </header>
                    <p>{message.text}</p>
                  </article>
                );
              })}
            </section>

            <div className="typing-row">{typingLabel || " "}</div>

            <form className="wa-composer" onSubmit={sendMessage}>
              <textarea
                onChange={(event) => handleComposerChange(event.target.value)}
                placeholder="Type a message"
                rows={2}
                value={messageText}
              />
              <button className="primary-button" disabled={!messageText.trim()} type="submit">
                Send
              </button>
            </form>
          </>
        ) : (
          <section className="wa-empty">
            <h2>Select a user or chat</h2>
            <p>Choose someone from the left panel to open a direct chat, or create a new group.</p>
          </section>
        )}
      </section>
    </main>
  );
};
