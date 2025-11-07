import { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialStatus: TaskStatus;
}

const AddTaskModal = ({ isOpen, onClose, onAdd, initialStatus }: AddTaskModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      dueDate,
      status: initialStatus,
    });

    setName('');
    setDescription('');
    setDueDate('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-xl shadow-[var(--shadow-lg)] w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Add New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Task Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder="Enter task name"
                required
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-2">
                Due Date *
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none"
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-primary-foreground rounded-lg transition-colors font-medium"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
