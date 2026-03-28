export type Role = "admin" | "user";
export type AppTheme =
  | "sunset"
  | "forest"
  | "ocean"
  | "rose"
  | "lavender"
  | "midnight"
  | "graphite"
  | "emerald"
  | "coral"
  | "amber"
  | "mint"
  | "indigo"
  | "stone"
  | "ruby"
  | "aurora";
export type ThemeMode = "light" | "dark";

export type User = {
  id: string;
  username: string;
  email: string | null;
  role: Role;
};

export type MessageStatus = "sent" | "delivered" | "read";

export type Message = {
  id: string;
  chatId: string;
  sender: User;
  text: string;
  status: MessageStatus;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Chat = {
  id: string;
  title: string | null;
  isGroup: boolean;
  members: User[];
  admins: User[];
  latestMessage: Message | null;
  updatedAt: string;
};

export type TypingPayload = {
  chatId: string;
  userId: string;
  username: string;
};

export type UserStatusPayload = {
  userId: string;
  status: "online" | "offline";
};

export type MessagesReadPayload = {
  chatId: string;
  readerId: string;
  messageIds: string[];
  status: "read";
  readAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};
