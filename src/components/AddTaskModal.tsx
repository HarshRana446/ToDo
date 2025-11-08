import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";
import { X } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdate?: (task: Task) => void;
  initialStatus: TaskStatus;
  editTask?: Task;
}

const AddTaskModal = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  initialStatus,
  editTask,
}: AddTaskModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  useEffect(() => {
    if (editTask) {
      setName(editTask.name);
      setDescription(editTask.description);
      setDueDate(editTask.dueDate);
      setStatus(editTask.status);
    } else {
      setName("");
      setDescription("");
      setDueDate("");
      setStatus(initialStatus);
    }
  }, [editTask, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) return;

    if (editTask && onUpdate) {
      onUpdate({
        ...editTask,
        name: name.trim(),
        description: description.trim(),
        dueDate,
        status,
      });
    } else {
      onAdd({
        name: name.trim(),
        description: description.trim(),
        dueDate,
        status,
      });
    }

    setName("");
    setDescription("");
    setDueDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-6">
          {editTask ? "Edit Task" : "Add New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Task Name *
            </label>
            <input
              id="task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="Enter task name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Due Date *
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>

          <div>
            <label
              htmlFor="task-status"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {editTask ? "Update Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
