'use client';

import { useState, useEffect } from 'react';
import { Conversation, User } from '@/lib/types';
import { chatService } from '@/lib/chatService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  currentUser: User;
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateNew: () => void;
  refreshTrigger?: number;
}

export function ConversationList({
  currentUser,
  selectedConversation,
  onSelectConversation,
  onCreateNew,
  refreshTrigger = 0,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getUserConversations(currentUser._id);
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      console.error(' Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = conversations.filter((conv) => {
      const otherParticipant = conv.participants.find((p) => p._id !== currentUser._id);
      return otherParticipant?.username.toLowerCase().includes(query.toLowerCase());
    });
    setFilteredConversations(filtered);
  };

  const getOtherParticipant = (conversation: Conversation): User | undefined => {
    return conversation.participants.find((p) => p._id !== currentUser._id);
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="h-full w-full flex flex-col bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
          <Button
            onClick={onCreateNew}
            size="sm"
            variant="ghost"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No conversations found
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isSelected = selectedConversation?._id === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-colors duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium truncate',
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      )}>
                        {otherUser?.username}
                      </p>
                      <p className={cn(
                        'text-sm truncate',
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>
                        {conversation.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.lastMessage && (
                      <span className={cn(
                        'text-xs whitespace-nowrap',
                        isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      )}>
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
