import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

const KanbanColumn = ({
  id,
  title,
  tasks,
  onDeleteTask,
  onEditTask,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {title}
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col min-h-[200px] bg-gray-200 rounded-lg p-3"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[700px]">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
