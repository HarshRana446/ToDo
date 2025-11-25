import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import { X, Pencil } from "lucide-react";
import { cn, isDueSoon } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  isOverlay?: boolean;
}

const TaskCard = ({
  task,
  onDeleteTask,
  onEditTask,
  isOverlay = false,
}: TaskCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, disabled: isOverlay });

  const style = isOverlay
    ? {
        touchAction: "none",
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: "none",
      };

  const handleDelete = () => {
    onDeleteTask?.(task._id);
    setShowDeleteDialog(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEditTask?.(task);
  };

  const getBorderColor = () => {
    switch (task.columnId?.title) {
      case "pending":
        return "border-l-[hsl(var(--status-pending))]";
      case "in-progress":
        return "border-l-[hsl(var(--status-in-progress))]";
      case "done":
        return "border-l-[hsl(var(--status-done))]";
      default:
        return "border-l-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dueDateSoon = isDueSoon(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={cn(
        "relative group rounded-lg p-4 border-l-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 bg-[hsl(var(--card))]",
        getBorderColor(),
        dueDateSoon &&
          task.columnId?.title === "pending" &&
          !isDragging &&
          !isOverlay &&
          "bg-red-100 dark:bg-red-950/50"
      )}
    >
      {!isDragging && (
        <div className="hidden group-hover:flex absolute top-2 right-2 gap-1">
          {onEditTask && (
            <button
              onClick={handleEdit}
              className="p-0.5 hover:text-foreground hover:bg-secondary rounded transition-colors cursor-pointer"
              aria-label="Edit task"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" size={16} />
            </button>
          )}
          {onDeleteTask && (
            <button
              onClick={handleDeleteClick}
              className="p-0.5 hover:text-foreground hover:bg-secondary rounded transition-colors cursor-pointer"
              aria-label="Delete task"
            >
              <X className="w-4 h-4 text-muted-foreground" size={16} />
            </button>
          )}
        </div>
      )}

      <h3 className="font-semibold text-foreground mb-2 text-sm">
        {task.name}
      </h3>
      {task.description && (
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Due: {formatDate(task.dueDate)}
        </span>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.name}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskCard;
