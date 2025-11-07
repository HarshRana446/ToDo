import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task.ts";
import { X } from "lucide-react";
import { cn, isDueSoon } from "@/lib/utils.ts";

interface TaskCardProps {
  task: Task;
  onDeleteTask?: (taskId: string) => void;
  isOverlay?: boolean;
}

const TaskCard = ({ task, onDeleteTask, isOverlay = false }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isOverlay });

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteTask?.(task.id);
  };

  const getBorderColor = () => {
    switch (task.status) {
      case "pending":
        return "border-l-[hsl(var(--status-pending))]";
      case "in-progress":
        return "border-l-[hsl(var(--status-progress))]";
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
          task.status === "pending" &&
          !isDragging &&
          !isOverlay &&
          "bg-destructive/30"
      )}
    >
      {!isDragging && onDeleteTask && (
        <button
          onClick={handleDelete}
          className="hidden group-hover:block absolute top-2 right-2 p-0.5 hover:text-foreground hover:bg-secondary rounded transition-colors cursor-pointer"
          aria-label="Delete task"
        >
          <X className="w-4 h-4 text-muted-foreground" size={16} />
        </button>
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
    </div>
  );
};

export default TaskCard;
