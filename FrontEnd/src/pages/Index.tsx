import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth.context";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus, Column } from "@/types/task";
import KanbanColumn from "@/components/KanbanColumn";
import AddTaskModal from "@/components/AddTaskModal";
import AddColumnModal from "@/components/AddColumnModel";
import AddColumnButton from "@/components/AddColumnButton";
import SearchBar from "@/components/SearchBar";
import TaskCard from "@/components/TaskCard";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { Button } from "@/components/ui/button";

const defaultColumns: Column[] = [
  {
    id: "pending",
    title: "Pending",
    tasks: [
      {
        id: "1",
        name: "Design new landing page",
        description: "Create mockups for the new marketing landing page",
        dueDate: "2025-11-09",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Review pull requests",
        description: "Check and merge pending PRs from the team",
        dueDate: "2025-11-08",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "3",
        name: "Implement authentication",
        description: "Add user login and registration functionality",
        dueDate: "2025-11-30",
        status: "in-progress",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "4",
        name: "Setup project structure",
        description: "Initialize the React project with all dependencies",
        dueDate: "2025-11-25",
        status: "done",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const STORAGE_KEY = "kanban-board-columns";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("pending");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const [columns, setColumns] = useState<Column[]>(() => {
    try {
      const savedColumns = localStorage.getItem(STORAGE_KEY);
      if (savedColumns) {
        return JSON.parse(savedColumns);
      }
    } catch (error) {
      console.error("Failed to parse columns from localStorage", error);
    }

    return defaultColumns;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch (error) {
      console.error("Failed to save columns to localStorage", error);
    }
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns;

    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  }, [columns, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id)
      return;

    setColumns((prevColumns) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;

      const activeIndex = activeItems.findIndex((task) => task.id === activeId);

      if (activeIndex === -1) {
        return prevColumns;
      }

      const overIndex = overItems.findIndex((task) => task.id === overId);

      const activeTask = activeItems[activeIndex];
      const updatedTask = {
        ...activeTask,
        status: overColumn.id as TaskStatus,
      };

      return prevColumns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const newTasks = [...col.tasks];
          if (overIndex >= 0) {
            newTasks.splice(overIndex, 0, updatedTask);
          } else {
            newTasks.push(updatedTask);
          }
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    setColumns((prevColumns) => {
      const activeColumn = prevColumns.find((col) =>
        col.tasks.some((task) => task.id === activeId)
      );

      const overColumn = prevColumns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
        const activeIndex = activeColumn.tasks.findIndex(
          (task) => task.id === activeId
        );
        const overIndex = activeColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (activeIndex !== -1 && overIndex !== -1) {
          return prevColumns.map((col) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                tasks: arrayMove(col.tasks, activeIndex, overIndex),
              };
            }
            return col;
          });
        }
      }

      return prevColumns;
    });
  };

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === taskData.status
          ? { ...col, tasks: [newTask, ...col.tasks] }
          : col
      )
    );
  };

  const handleDeleteTask = (taskId: string, status: TaskStatus) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const handleOpenModal = (status: TaskStatus) => {
    setEditingTask(null);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedStatus(task.status);
    setIsModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      }))
    );
  };

  const handleAddColumn = (title: string) => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      tasks: [],
    };
    setColumns((prevColumns) => [...prevColumns, newColumn]);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--board-bg))]">
      {/* Header */}
      <div className="bg-card shadow-[var(--shadow-sm)] sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Task Board
            </h1>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => handleOpenModal("pending")}
                className="shadow-[var(--shadow-sm)]"
              >
                Add New Task
              </Button>

              <SearchBar value={searchQuery} onChange={setSearchQuery} />

              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-col lg:flex-row gap-6 pb-4">
              {filteredColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={column.tasks}
                  onAddTask={handleOpenModal}
                  onDeleteTask={(taskId: string) =>
                    handleDeleteTask(taskId, column.id)
                  }
                  onEditTask={handleEditTask}
                />
              ))}

              <AddColumnButton onClick={() => setIsColumnModalOpen(true)} />
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onAdd={handleAddTask}
        onUpdate={handleUpdateTask}
        initialStatus={selectedStatus}
        editTask={editingTask || undefined}
      />

      <AddColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onAdd={handleAddColumn}
      />
    </div>
  );
};

export default Index;
