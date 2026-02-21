

interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  text: string;
  attechment?: string[];
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    email: string;
  }>;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  // Create or get conversation
  async createConversation(senderId: string, receiverId: string): Promise<Conversation> {
    const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/chat/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderId, receiverId }),
    });

    if (!response.ok) throw new Error('Failed to create conversation');
    const data = await response.json();
    return data.data;
  },

  // Get user conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/chat/conversation/${userId}`);

    if (!response.ok) throw new Error('Failed to fetch conversations');
    const data = await response.json();
    return data.data;
  },

  // Get messages for conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/message/${conversationId}`);

    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.data;
  },

  // Edit message
  async editMessage(messageId: string, text: string): Promise<Message> {
    const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/message/edit/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error('Failed to edit message');
    const data = await response.json();
    return data.data;
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/message/delete/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete message');
  },
};
