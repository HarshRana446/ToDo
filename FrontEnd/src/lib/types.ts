export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  text: string;
  attechment?: string[];
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}
