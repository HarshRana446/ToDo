'use client';

import { useEffect, useRef, useState } from 'react';
import { Conversation, Message, User } from '@/lib/types';
import { chatService } from '@/lib/chatService';
import { getSocket } from '@/lib/socket';
import { MessageItem } from '@/components/chat/Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatDisplayProps {
  conversation: Conversation | null;
  currentUser: User;
}

export function ChatDisplay({ conversation, currentUser }: ChatDisplayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (data: Message) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleMessageEdited = (data: Message) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data._id ? data : msg))
        );
      }
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [conversation?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      const data = await chatService.getMessages(conversation._id);
      setMessages(data);
    } catch (error) {
      console.error('[v0] Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!conversation || !newMessage.trim()) return;

    try {
      const socket = getSocket();
      if (!socket) {
        toast({
          title: 'Error',
          description: 'Connection lost. Please refresh.',
          variant: 'destructive',
        });
        return;
      }

      const messageData = {
        conversationId: conversation._id,
        senderId: currentUser._id,
        text: newMessage.trim(),
        attachment: null,
      };

      // Emit via socket
      socket.emit('message:send', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('[v0] Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message._id);
    setEditedText(message.text);
  };

  const handleEditSubmit = async () => {
    if (!editingMessageId || !editedText.trim()) return;

    try {
      await chatService.editMessage(editingMessageId, editedText.trim());
      const socket = getSocket();
      socket?.emit('message:edited', {
        messageId: editingMessageId,
        text: editedText.trim(),
        conversationId: conversation?._id,
      });
      setEditingMessageId(null);
      setEditedText('');
      toast({
        title: 'Success',
        description: 'Message updated successfully',
      });
    } catch (error) {
      console.error('[v0] Error editing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = (message: Message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await chatService.deleteMessage(messageToDelete._id);
      const socket = getSocket();
      socket?.emit('message:deleted', {
        messageId: messageToDelete._id,
        conversationId: conversation?._id,
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageToDelete._id));
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('[v0] Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const getOtherParticipant = () => {
    return conversation?.participants.find((p) => p._id !== currentUser._id);
  };

  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <>
      <div className="h-full w-full flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <h2 className="font-bold text-lg text-foreground">
            {otherUser?.username}
          </h2>
          <p className="text-xs text-muted-foreground">
            {otherUser?.email}
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Loading messages...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No messages yet. Start the conversation!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUser={currentUser}
                  isEditing={editingMessageId === message._id}
                  editedText={editedText}
                  onEditChange={setEditedText}
                  onEditSubmit={handleEditSubmit}
                  onEditCancel={() => {
                    setEditingMessageId(null);
                    setEditedText('');
                  }}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Message</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this message? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
