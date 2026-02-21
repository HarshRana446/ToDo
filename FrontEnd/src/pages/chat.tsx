'use client';

import { useEffect, useState } from 'react';
import { Conversation, User } from '@/lib/types';
import { initializeSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatDisplay } from '@/components/chat/ChatDisplay';
import { CreateConversationDialog } from '@/components/chat//CreateConversation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize socket and load user
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get current user from localStorage (you can modify this to get from API)
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
          // For demo purposes, create a test user
          const demoUser: User = {
            _id: 'user1',
            username: 'John Doe',
            email: 'john@example.com',
          };
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          setCurrentUser(demoUser);
          console.log('[v0] Demo user created:', demoUser);
        } else {
          setCurrentUser(JSON.parse(userStr));
        }

        // Initialize socket connection
        const userId = JSON.parse(userStr || '{}')._id || 'user1';
        initializeSocket(userId);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize chat',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    disconnectSocket();
    setCurrentUser(null);
  };

  const handleCreateConversation = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'w-full sm:w-96 h-full border-r transition-transform duration-300 transform',
          'sm:relative sm:translate-x-0 fixed sm:z-auto z-40',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ConversationList
          currentUser={currentUser}
          selectedConversation={selectedConversation}
          onSelectConversation={(conv) => {
            setSelectedConversation(conv);
            setSidebarOpen(false);
          }}
          onCreateNew={() => setCreateDialogOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="sm:hidden px-4 py-3 border-b bg-background flex items-center justify-between">
          <div className="flex-1">
            {selectedConversation && (
              <div>
                <h2 className="font-bold text-foreground">
                  {selectedConversation.participants.find((p) => p._id !== currentUser._id)?.username}
                </h2>
                <p className="text-xs text-muted-foreground">Chat</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Chat Display */}
        <ChatDisplay conversation={selectedConversation} currentUser={currentUser} />

        {/* User Info Footer - Desktop */}
        <div className="hidden sm:flex items-center justify-between p-4 border-t bg-muted text-muted-foreground text-sm">
          <div>
            <p className="font-medium text-foreground">{currentUser.username}</p>
            <p className="text-xs">{currentUser.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 px-4 py-3 border-t bg-muted text-muted-foreground text-sm flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{currentUser.username}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Conversation Dialog */}
      <CreateConversationDialog
        currentUser={currentUser}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConversationCreated={handleCreateConversation}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
