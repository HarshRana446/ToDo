'use client';

import { useState } from 'react';
import { Message, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MoreVertical, Trash2, Edit2 } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  currentUser: User;
  isEditing: boolean;
  editedText: string;
  onEditChange: (text: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

export function MessageItem({
  message,
  currentUser,
  isEditing,
  editedText,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onEdit,
  onDelete,
}: MessageItemProps) {
  const isOwn = message.sender._id === currentUser._id;
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('flex gap-2 mb-3', isOwn && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
        isOwn ? 'bg-primary' : 'bg-muted-foreground'
      )}>
        {message.sender.username.charAt(0).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-xs sm:max-w-md', isOwn && 'items-end')}>
        {/* User Info (only for other users) */}
        {!isOwn && (
          <p className="text-xs font-medium text-muted-foreground">
            {message.sender.username}
          </p>
        )}

        {/* Message Bubble */}
        <div className={cn(
          'rounded-lg px-4 py-2 break-words',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editedText}
                onChange={(e) => onEditChange(e.target.value)}
                className={cn(
                  'bg-transparent border rounded px-2 py-1 outline-none text-sm',
                  isOwn ? 'border-primary-foreground/50 text-primary-foreground' : 'border-foreground/50 text-foreground'
                )}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onEditCancel}
                  className={cn(
                    'text-xs px-2 py-1 rounded',
                    isOwn ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30' : 'bg-foreground/20 text-foreground hover:bg-foreground/30'
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={onEditSubmit}
                  className={cn(
                    'text-xs px-2 py-1 rounded font-medium',
                    isOwn ? 'bg-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/40' : 'bg-foreground/30 text-foreground hover:bg-foreground/40'
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{message.text}</p>
          )}
        </div>

        {/* Time and Actions */}
        <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', isOwn && 'flex-row-reverse')}>
          <span>{formatTime(message.createdAt)}</span>
          {message.updatedAt !== message.createdAt && (
            <span className="text-xs opacity-70">(edited)</span>
          )}

          {/* Menu Button - Only for own messages */}
          {isOwn && !isEditing && (
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    onEdit(message);
                    setShowMenu(false);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onDelete(message);
                    setShowMenu(false);
                  }}
                  className="gap-2 cursor-pointer text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
