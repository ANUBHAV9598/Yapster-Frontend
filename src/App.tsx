import axios from "axios";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState, useEffectEvent } from "react";
import { motion } from "motion/react";
import { AdminAuthScreen } from "./components/AdminAuthScreen";
import { AdminPageThemed } from "./components/AdminPageThemed";
import { AuthScreen } from "./components/AuthScreen";
import { ChatWorkspaceEnhanced } from "./components/ChatWorkspaceEnhanced";
import { themeOptions } from "./theme/appTheme";
import type {
  AppTheme,
  AuthResponse,
  Chat,
  Message,
  MessagesReadPayload,
  ThemeMode,
  TypingPayload,
  User,
  UserStatusPayload,
} from "./types/types";
import { api, AUTH_TOKEN_KEY, setAuthToken, socket } from "./utils/conn";

const APP_THEME_KEY = "chat-app-theme";
const APP_THEME_MODE_KEY = "chat-app-theme-mode";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));

const isAdminPath = (pathname: string) =>
  pathname === "/admin/pages" || pathname === "/admin/page";

const isKnownTheme = (value: string | null): value is AppTheme =>
  themeOptions.some((option) => option.value === value);

const App = () => {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => {
    const storedTheme = window.localStorage.getItem(APP_THEME_KEY);
    return isKnownTheme(storedTheme) ? storedTheme : "sunset";
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const storedMode = window.localStorage.getItem(APP_THEME_MODE_KEY);
    return storedMode === "dark" ? "dark" : "light";
  });
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [typingLabel, setTypingLabel] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedView, setSelectedView] = useState<"chat" | "group-create">("chat");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [groupAdminIds, setGroupAdminIds] = useState<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const messageRequestRef = useRef(0);
  const adminRoute = isAdminPath(pathname);

  const selectedUserId = authUser?.id ?? "";

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  const otherUsers = useMemo(
    () => users.filter((user) => user.id !== selectedUserId),
    [selectedUserId, users],
  );

  const contacts = useMemo(
    () => [...otherUsers].sort((left, right) => left.username.localeCompare(right.username)),
    [otherUsers],
  );

  const persistSession = (token: string, user: User) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthToken(token);
    setAuthUser(user);
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("register_user", {
      userId: user.id,
      username: user.username,
    });
  };

  const clearSession = () => {
    if (authUser?.id) {
      socket.emit("unregister_user", {
        userId: authUser.id,
      });
    }
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setAuthUser(null);
    setUsers([]);
    setChats([]);
    setMessages([]);
    setSelectedChatId("");
    setTypingLabel("");
    setOnlineUserIds([]);
    setSelectedView("chat");
    setGroupTitle("");
    setGroupMemberIds([]);
    setGroupAdminIds([]);
    setError("");
  };

  const loadUsers = useEffectEvent(async () => {
    const response = await api.get<User[]>("/users");
    setUsers(response.data);
  });

  const loadChats = useEffectEvent(async () => {
    if (!selectedUserId) {
      setChats([]);
      setSelectedChatId("");
      return;
    }

    setLoadingChats(true);

    try {
      const response = await api.get<Chat[]>("/chats");
      setChats(response.data);
      setSelectedChatId((current) => {
        if (current && response.data.some((chat) => chat.id === current)) {
          return current;
        }

        return response.data[0]?.id ?? "";
      });
    } finally {
      setLoadingChats(false);
    }
  });

  const loadMessages = useEffectEvent(async (chatId: string) => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const requestId = messageRequestRef.current + 1;
    messageRequestRef.current = requestId;
    setLoadingMessages(true);

    try {
      const response = await api.get<Message[]>(`/messages/${chatId}`);
      if (messageRequestRef.current === requestId) {
        setMessages(response.data);
      }
    } finally {
      if (messageRequestRef.current === requestId) {
        setLoadingMessages(false);
      }
    }
  });

  useEffect(() => {
    window.localStorage.setItem(APP_THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(APP_THEME_MODE_KEY, themeMode);
    document.documentElement.dataset.mode = themeMode;
  }, [themeMode]);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const boot = async () => {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        setAuthToken(token);
        const response = await api.get<{ user: User }>("/auth/me");
        if (adminRoute) {
          if (response.data.user.role !== "admin") {
            clearSession();
            setError("Admin access required.");
          } else {
            await api.get("/admin/page");
            setAuthUser(response.data.user);
            socket.emit("register_user", {
              userId: response.data.user.id,
              username: response.data.user.username,
            });
          }
        } else {
          setAuthUser(response.data.user);
          socket.emit("register_user", {
            userId: response.data.user.id,
            username: response.data.user.username,
          });
        }
      } catch {
        clearSession();
      } finally {
        setAuthReady(true);
      }
    };

    void boot();
  }, [adminRoute]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    void loadUsers().catch(() => {
      setError("Unable to load users.");
    });
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    void loadChats().catch(() => {
      setError("Unable to load conversations.");
    });
  }, [authUser, selectedUserId]);

  useEffect(() => {
    if (!selectedChatId || !authUser) {
      messageRequestRef.current += 1;
      setMessages([]);
      setTypingLabel("");
      return;
    }

    setMessages([]);
    setTypingLabel("");
    setSelectedView("chat");
    socket.emit("join_chat", { chatId: selectedChatId });

    void loadMessages(selectedChatId).catch(() => {
      setError("Unable to load messages for the selected conversation.");
    });
    socket.emit("mark_messages_read", {
      chatId: selectedChatId,
      userId: authUser.id,
    });

    return () => {
      socket.emit("leave_chat", { chatId: selectedChatId });
    };
  }, [authUser, selectedChatId]);

  const handleReceiveMessage = useEffectEvent((incomingMessage: Message) => {
    setChats((currentChats) =>
      [...currentChats]
        .map((chat) =>
          chat.id === incomingMessage.chatId
            ? {
                ...chat,
                latestMessage: incomingMessage,
                updatedAt: incomingMessage.updatedAt,
              }
            : chat,
        )
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        ),
    );

    if (incomingMessage.chatId === selectedChatId) {
      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === incomingMessage.id)) {
          return currentMessages;
        }

        return [...currentMessages, incomingMessage];
      });

      if (incomingMessage.sender.id !== selectedUserId && authUser) {
        socket.emit("mark_messages_read", {
          chatId: incomingMessage.chatId,
          userId: authUser.id,
        });
      }
    }
  });

  const handleTyping = useEffectEvent((payload: TypingPayload) => {
    if (payload.chatId !== selectedChatId || payload.userId === selectedUserId) {
      return;
    }

    setTypingLabel(`${payload.username} is typing...`);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      setTypingLabel("");
    }, 1400);
  });

  const handleOnlineUsers = useEffectEvent((userIds: string[]) => {
    setOnlineUserIds(userIds);
  });

  const handleUserStatus = useEffectEvent((payload: UserStatusPayload) => {
    setOnlineUserIds((current) => {
      if (payload.status === "online") {
        return current.includes(payload.userId) ? current : [...current, payload.userId];
      }

      return current.filter((userId) => userId !== payload.userId);
    });
  });

  const handleMessagesRead = useEffectEvent((payload: MessagesReadPayload) => {
    if (payload.chatId !== selectedChatId) {
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        payload.messageIds.includes(message.id)
          ? {
              ...message,
              status: payload.status,
              readAt: payload.readAt,
            }
          : message,
      ),
    );
  });

  useEffect(() => {
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("online_users", handleOnlineUsers);
    socket.on("user_status", handleUserStatus);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_status", handleUserStatus);
      socket.off("messages_read", handleMessagesRead);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/signup", {
        username: signupName,
        password: signupPassword,
      });

      persistSession(response.data.token, response.data.user);
      setSignupName("");
      setSignupPassword("");
    } catch {
      setError("Could not create your account. Try another username.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        username: loginUsername,
        password: loginPassword,
        role: adminRoute ? "admin" : "user",
      });

      if (adminRoute) {
        await api.get("/admin/page", {
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        });
      }

      persistSession(response.data.token, response.data.user);
      setLoginUsername("");
      setLoginPassword("");
    } catch {
      setError(adminRoute ? "Invalid admin credentials." : "Invalid username or password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    setPasswordLoading(true);
    setError("");

    try {
      await api.patch("/auth/change-password", {
        newPassword,
      });
    } catch (changePasswordError) {
      if (axios.isAxiosError(changePasswordError)) {
        setError(changePasswordError.response?.data?.message ?? "Could not change password.");
      } else {
        setError("Could not change password.");
      }
      throw changePasswordError;
    } finally {
      setPasswordLoading(false);
    }
  };

  const openDirectChat = async (recipientId: string) => {
    if (!selectedUserId || !recipientId) {
      return;
    }

    try {
      setError("");
      setMessages([]);
      setTypingLabel("");
      const response = await api.post<Chat>("/chats/direct", {
        recipientId,
      });

      await loadChats();
      setSelectedChatId(response.data.id);
      setSelectedView("chat");
    } catch {
      setError("Could not open that conversation.");
    }
  };

  const createGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupTitle.trim() || groupMemberIds.length < 2) {
      setError("Choose a group title and at least two other members.");
      return;
    }

    try {
      setError("");
      const response = await api.post<Chat>("/chats/group", {
        title: groupTitle,
        memberIds: groupMemberIds,
        adminIds: groupAdminIds,
      });

      setGroupTitle("");
      setGroupMemberIds([]);
      setGroupAdminIds([]);
      await loadChats();
      setSelectedChatId(response.data.id);
      setSelectedView("chat");
    } catch {
      setError("Could not create that group.");
    }
  };

  const saveGroupChanges = async () => {
    if (!selectedChat?.isGroup || !authUser) {
      return;
    }

    try {
      setError("");
      const response = await api.patch<Chat>(`/chats/${selectedChat.id}/group`, {
        title: groupTitle,
        addMemberIds: groupMemberIds.filter(
          (memberId) => !selectedChat.members.some((member) => member.id === memberId),
        ),
        removeMemberIds: selectedChat.members
          .map((member) => member.id)
          .filter((memberId) => !groupMemberIds.includes(memberId) && memberId !== authUser.id),
        promoteAdminIds: groupAdminIds.filter(
          (adminId) => !selectedChat.admins.some((admin) => admin.id === adminId),
        ),
        demoteAdminIds: selectedChat.admins
          .map((admin) => admin.id)
          .filter((adminId) => !groupAdminIds.includes(adminId) && adminId !== authUser.id),
      });

      setChats((currentChats) =>
        currentChats.map((chat) => (chat.id === response.data.id ? response.data : chat)),
      );
      setSelectedChatId(response.data.id);
    } catch {
      setError("Could not update the group.");
    }
  };

  const selectChat = (chatId: string) => {
    const targetChat = chats.find((chat) => chat.id === chatId);
    setSelectedChatId(chatId);
    setSelectedView("chat");

    if (targetChat?.isGroup) {
      setGroupTitle(targetChat.title ?? "");
      setGroupMemberIds(targetChat.members.map((member) => member.id).filter((id) => id !== selectedUserId));
      setGroupAdminIds(targetChat.admins.map((admin) => admin.id).filter((id) => id !== selectedUserId));
      return;
    }

    setGroupTitle("");
    setGroupMemberIds([]);
    setGroupAdminIds([]);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!authUser || !selectedChatId || !trimmedMessage) {
      return;
    }

    socket.emit("send_message", {
      chatId: selectedChatId,
      senderId: authUser.id,
      text: trimmedMessage,
    });

    setMessageText("");
    setTypingLabel("");
  };

  const handleComposerChange = (value: string) => {
    setMessageText(value);

    if (!authUser || !selectedChatId || !value.trim()) {
      return;
    }

    socket.emit("typing", {
      chatId: selectedChatId,
      userId: authUser.id,
      username: authUser.username,
    });
  };

  const getChatLabel = (chat: Chat) => {
    if (chat.title) {
      return chat.title;
    }

    const names = chat.members
      .filter((member) => member.id !== selectedUserId)
      .map((member) => member.username);

    return names.join(", ") || "Solo chat";
  };

  const getChatSubtitle = (chat: Chat) => {
    if (chat.latestMessage?.text) {
      return chat.latestMessage.text;
    }

    if (chat.isGroup) {
      return `${chat.members.length} members`;
    }

    return chat.members
      .filter((member) => member.id !== selectedUserId)
      .map((member) => member.email ?? member.role)
      .join(", ");
  };

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-xl rounded-[28px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-8 text-[var(--app-text)] shadow-[0_24px_60px_rgba(78,45,16,0.12)] backdrop-blur-xl sm:p-10"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--app-text-soft)]">
            Realtime Workspace
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--app-text)]">
            Checking your session...
          </h1>
        </motion.section>
      </main>
    );
  }

  if (!authUser) {
    if (adminRoute) {
      return (
        <AdminAuthScreen
          authLoading={authLoading}
          error={error}
          loginPassword={loginPassword}
          loginUsername={loginUsername}
          onLogin={handleLogin}
          setError={setError}
          setLoginPassword={setLoginPassword}
          setLoginUsername={setLoginUsername}
        />
      );
    }

    return (
      <AuthScreen
        authLoading={authLoading}
        authMode={authMode}
        error={error}
        loginUsername={loginUsername}
        loginPassword={loginPassword}
        onLogin={handleLogin}
        onSignup={handleSignup}
        setAuthMode={setAuthMode}
        setError={setError}
        setLoginUsername={setLoginUsername}
        setLoginPassword={setLoginPassword}
        setSignupName={setSignupName}
        setSignupPassword={setSignupPassword}
        signupName={signupName}
        signupPassword={signupPassword}
      />
    );
  }

  if (adminRoute) {
    return (
      <AdminPageThemed
        authUser={authUser}
        changePassword={changePassword}
        clearSession={clearSession}
        passwordLoading={passwordLoading}
        setMode={setThemeMode}
        setTheme={setTheme}
        theme={theme}
        themeMode={themeMode}
      />
    );
  }

  return (
    <ChatWorkspaceEnhanced
      authUser={authUser}
      chats={chats}
      contacts={contacts}
      clearSession={clearSession}
      createGroup={createGroup}
      error={error}
      formatDay={formatDay}
      formatTime={formatTime}
      getChatLabel={getChatLabel}
      getChatSubtitle={getChatSubtitle}
      groupAdminIds={groupAdminIds}
      groupMemberIds={groupMemberIds}
      groupTitle={groupTitle}
      handleComposerChange={handleComposerChange}
      loadingChats={loadingChats}
      loadingMessages={loadingMessages}
      messageText={messageText}
      messages={messages}
      onlineUserIds={onlineUserIds}
      openDirectChat={openDirectChat}
      passwordLoading={passwordLoading}
      saveGroupChanges={saveGroupChanges}
      selectChat={selectChat}
      selectedChat={selectedChat}
      selectedChatId={selectedChatId}
      selectedUserId={selectedUserId}
      selectedView={selectedView}
      sendMessage={sendMessage}
      changePassword={changePassword}
      setGroupAdminIds={setGroupAdminIds}
      setGroupMemberIds={setGroupMemberIds}
      setGroupTitle={setGroupTitle}
      setMode={setThemeMode}
      setSelectedView={setSelectedView}
      setTheme={setTheme}
      typingLabel={typingLabel}
      theme={theme}
      themeMode={themeMode}
    />
  );
};

export default App;
