import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, MoreVertical, Search, Plus, X } from "lucide-react";
import {
  useCreateConversation,
  useGetConversations,
  useSendMessage,
  useGetMessages,
  useMarkAsRead,
} from "@/hooks/chat-hooks";
import { useAuth } from "@/context/auth.context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "user" | "other";
  text: string;
  attachment?: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  unread: number;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: Date;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { data: conversationsData, isLoading: conversationsLoading } =
    useGetConversations();
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();
  const [activeConversationId, setActiveConversationId] = useState("");
  const { data: messagesData } = useGetMessages(activeConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const markAsReadMutation = useMarkAsRead();

  const [messageInput, setMessageInput] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  useEffect(() => {
    if (activeConversationId) {
      markAsReadMutation.mutate(activeConversationId);
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 0);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (conversationsData?.data && user?._id) {
      const formattedConversations = conversationsData.data.map((conv: any) => {
        const isSenderMe = conv.participants?.senderId?._id === user._id;
        const otherUser = isSenderMe
          ? conv.participants?.receiverId
          : conv.participants?.senderId;

        const otherName = otherUser?.username || "Unknown";

        return {
          id: conv._id,
          name: otherName,
          avatar: otherName.substring(0, 2).toUpperCase(),
          unread: conv.unreadCount || conv.unread || 0,
          messages: [],
          lastMessage: conv.lastMessage || "No messages",
          lastMessageTime: conv.lastMessageTime
            ? new Date(conv.lastMessageTime)
            : new Date(conv.createdAt),
        };
      });

      setConversations(formattedConversations);

      if (!activeConversationId && formattedConversations.length > 0) {
        setActiveConversationId(formattedConversations[0].id);
      }
    }
  }, [conversationsData, user?._id]);

  useEffect(() => {
    if (messagesData?.data) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: messagesData.data.map((msg: any) => ({
                  id: msg._id,
                  sender:
                    msg.sender ===
                    JSON.parse(localStorage.getItem("user") || "{}")._id
                      ? "user"
                      : "other",
                  text: msg.message,
                  timestamp: new Date(msg.createdAt),
                })),
                lastMessage:
                  messagesData.data.length > 0
                    ? messagesData.data[messagesData.data.length - 1].message
                    : conv.lastMessage,
                lastMessageTime:
                  messagesData.data.length > 0
                    ? new Date(
                        messagesData.data[messagesData.data.length - 1]
                          .createdAt,
                      )
                    : conv.lastMessageTime,
              }
            : conv,
        ),
      );
    }
  }, [messagesData, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachmentPreview) return;
    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      message: messageInput,
    });

    setMessageInput("");
    setAttachmentPreview(null);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachmentPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTimeDisplay = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 24) {
      return date.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return "now";
  };

  const handleStartNewChat = () => {
    if (!newChatEmail.trim()) return;

    createConversationMutation.mutate(newChatEmail, {
      onSuccess: () => {
        setNewChatEmail("");
        setIsNewChatOpen(false);
      },
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "email@example.com"}
              </p>
            </div>
            <button className="p-1 hover:bg-muted rounded-lg transition">
              <MoreVertical size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-muted text-foreground placeholder:text-muted-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveConversationId(conv.id);
                setConversations((prev) =>
                  prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
                );
              }}
              className={`p-3 border-b border-border cursor-pointer transition ${
                activeConversationId === conv.id
                  ? "bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-${conv.unread > 0 ? "semibold" : "medium"}`}
                    >
                      {conv.name}
                    </p>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs truncate ${
                      conv.unread > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTimeDisplay(conv.lastMessageTime)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium text-sm"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/")}> back to Todo </Button>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {activeConversation.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {activeConversation.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition">
                <MoreVertical size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(messagesData?.data || []).map((msg: any) => {
                const isMe = msg.sender === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.attachment && (
                        <div className="mb-2">
                          <img
                            src={msg.attachment}
                            alt="attachment"
                            className="rounded-lg max-h-48 max-w-xs"
                          />
                        </div>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-card p-4">
              {attachmentPreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={attachmentPreview}
                    alt="preview"
                    className="rounded-lg h-20 w-20 object-cover"
                  />
                  <button
                    onClick={() => setAttachmentPreview(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold hover:opacity-80"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAttachmentClick}
                  className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-muted text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() && !attachmentPreview}
                  className="flex-shrink-0 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {isNewChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Start New Chat
              </h2>
              <button
                onClick={() => {
                  setIsNewChatOpen(false);
                  setNewChatEmail("");
                }}
                className="p-2 hover:bg-muted rounded-lg transition text-foreground/70 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newChatEmail}
                  onChange={(e) => setNewChatEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStartNewChat();
                    }
                  }}
                  placeholder="Enter email to start conversation..."
                  className="w-full px-4 py-3 bg-input text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  autoFocus
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartNewChat}
                  disabled={!newChatEmail.trim()}
                  className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
