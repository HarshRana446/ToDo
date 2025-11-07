import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanColumn = ({ id, title, tasks, onAddTask, onDeleteTask }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  const getColumnColor = () => {
    switch (id) {
      case 'pending':
        return 'bg-[hsl(var(--status-pending))]';
      case 'in-progress':
        return 'bg-[hsl(var(--status-progress))]';
      case 'done':
        return 'bg-[hsl(var(--status-done))]';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--column-bg))] rounded-xl p-4 shadow-[var(--shadow-sm)] min-w-[280px] md:min-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getColumnColor()}`} />
          <h2 className="font-bold text-foreground text-lg">{title}</h2>
          <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Add task"
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex-1 space-y-3 min-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1"
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDeleteTask={onDeleteTask} />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
