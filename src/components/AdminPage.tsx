import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Chat, Message, User } from "../types/types";
import { api } from "../utils/conn";

type Props = {
  authUser: User;
  clearSession: () => void;
};

type DashboardStats = {
  users: number;
  chats: number;
  messages: number;
};

export const AdminPage = ({ authUser, clearSession }: Props) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "user">("user");

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

  const cardClass =
    "rounded-[28px] border border-[#ffffff14] bg-[rgba(31,20,14,0.86)] p-6 text-[#f7efe7] shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl";
  const inputClass =
    "w-full rounded-2xl border border-[#3a271843] bg-white/90 px-4 py-3 text-[#20140a] outline-none transition duration-200 focus:border-[#8f3414] focus:ring-4 focus:ring-[#8f34141a]";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(205,125,82,0.16),transparent_30%),linear-gradient(180deg,#1e140e_0%,#120b07_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d8a07e]">
                Admin Page
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-white">
                Welcome, {authUser.username}
              </h1>
              <p className="mt-4 max-w-2xl text-[#d8c4b7]">
                Manage users, chats, and messages from one place. These actions are
                protected by the admin token.
              </p>
            </div>
            <motion.button
              className="rounded-full border border-[#ffffff1f] bg-white/5 px-5 py-3 font-semibold text-[#f2d5c8]"
              onClick={clearSession}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
            >
              Logout
            </motion.button>
          </div>

          {error ? (
            <div className="mt-5 rounded-full border border-[#e6997a3b] bg-[rgba(143,52,20,0.18)] px-4 py-3 text-sm font-medium text-[#ffd4c3]">
              {error}
            </div>
          ) : null}
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[#d8a07e]">Users</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {loading ? "..." : stats?.users ?? 0}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[#d8a07e]">Chats</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {loading ? "..." : stats?.chats ?? 0}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-sm uppercase tracking-[0.2em] text-[#d8a07e]">Messages</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {loading ? "..." : stats?.messages ?? 0}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className={`${cardClass} h-fit`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d8a07e]">
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
              <select
                className={inputClass}
                onChange={(event) => setCreateRole(event.target.value as "admin" | "user")}
                value={createRole}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <motion.button
                className="rounded-full bg-gradient-to-br from-[#d78154] to-[#8f3414] px-5 py-3 font-semibold text-white"
                type="submit"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Create User
              </motion.button>
            </form>
          </div>

          <div className="grid gap-6">
            <section className={cardClass}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold text-white">Users</h2>
                <button
                  className="rounded-full border border-[#ffffff1f] bg-white/5 px-4 py-2 text-sm font-semibold text-[#f2d5c8]"
                  onClick={() => void loadAdminData()}
                  type="button"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {users.map((user) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[#ffffff12] bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    key={user.id}
                  >
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-sm capitalize text-[#d8c4b7]">{user.role}</p>
                    </div>
                    <motion.button
                      className="rounded-full border border-[#ffb39c3d] bg-[rgba(143,52,20,0.18)] px-4 py-2 text-sm font-semibold text-[#ffd4c3] disabled:cursor-not-allowed disabled:opacity-50"
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
              <h2 className="font-serif text-2xl font-semibold text-white">Chats</h2>
              <div className="mt-4 grid gap-3">
                {chats.map((chat) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[#ffffff12] bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    key={chat.id}
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {chat.title ?? chat.members.map((member) => member.username).join(", ")}
                      </p>
                      <p className="text-sm text-[#d8c4b7]">
                        {chat.isGroup ? "Group chat" : "Direct chat"} • {chat.members.length} members
                      </p>
                    </div>
                    <motion.button
                      className="rounded-full border border-[#ffb39c3d] bg-[rgba(143,52,20,0.18)] px-4 py-2 text-sm font-semibold text-[#ffd4c3]"
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
              <h2 className="font-serif text-2xl font-semibold text-white">Messages</h2>
              <div className="mt-4 grid gap-3">
                {messages.map((message) => (
                  <div
                    className="flex flex-col gap-3 rounded-[22px] border border-[#ffffff12] bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    key={message.id}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{message.sender.username}</p>
                      <p className="truncate text-sm text-[#d8c4b7]">{message.text}</p>
                    </div>
                    <motion.button
                      className="rounded-full border border-[#ffb39c3d] bg-[rgba(143,52,20,0.18)] px-4 py-2 text-sm font-semibold text-[#ffd4c3]"
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
