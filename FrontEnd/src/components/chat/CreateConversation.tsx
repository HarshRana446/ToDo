'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { chatService } from '@/lib/chatService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateConversationDialogProps {
  currentUser: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: () => void;
}

export function CreateConversationDialog({
  currentUser,
  open,
  onOpenChange,
  onConversationCreated,
}: CreateConversationDialogProps) {
  const [receiverId, setReceiverId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!currentUser || !receiverId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    if (receiverId === currentUser._id) {
      toast({
        title: 'Error',
        description: 'You cannot create a conversation with yourself',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await chatService.createConversation(currentUser._id, receiverId);
      toast({
        title: 'Success',
        description: 'Conversation created successfully',
      });
      setReceiverId('');
      onOpenChange(false);
      onConversationCreated();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation. Check the user ID.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Enter the user ID of the person you want to chat with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter recipient user ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
            disabled={isLoading}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
