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
import { api } from "@/lib/api.js";

function groupTasks(tasks) {
  const mappedTasks = tasks.map((task) => ({
    id: task._id,
    name: task.title,
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate : null,
    status: task.status || "pending",
    createdAt: task.createdAt || new Date().toISOString(),
  }));

  return [
    {
      id: "pending",
      title: "Pending",
      tasks: mappedTasks.filter((t) => t.status === "pending"),
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: mappedTasks.filter((t) => t.status === "in-progress"),
    },
    {
      id: "done",
      title: "Done",
      tasks: mappedTasks.filter((t) => t.status === "done"),
    },
  ];
}

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

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    api("/task")
      .then((res) => {
        console.log("Backend Tasks", res.tasks);
        setColumns(groupTasks(res.tasks));
      })
      .catch((err) => {
        console.error("Failed to fetch tasks from backend", err);
      });
  }, []);

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

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    const overColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) return;

    const activeTasks = activeColumn.tasks;
    const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
    const activeIndex = activeTasks.findIndex((t) => t.id === activeId);

    if (activeIndex !== overIndex) {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === activeColumn.id
            ? {
                ...col,
                tasks: arrayMove(col.tasks, activeIndex, overIndex),
              }
            : col
        )
      );
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;

    const dropColumnDirect = columns.find((col) => col.id === over.id);
    const dropColumnByTask = columns.find((col) =>
      col.tasks.some((t) => t.id === over.id)
    );

    const finalColumn = dropColumnDirect || dropColumnByTask;
    if (!finalColumn) return;

    const newStatus = finalColumn.id;

    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );

    const task = activeColumn?.tasks.find((t) => t.id === activeId);
    if (!task) return;

    if (task.status === newStatus) return;

    try {
      await api(`/task/${activeId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks:
          col.id === activeColumn.id
            ? col.tasks.filter((t) => t.id !== activeId)
            : col.id === newStatus
            ? [{ ...task, status: newStatus }, ...col.tasks]
            : col.tasks,
      }))
    );
  };

  const handleAddTask = async (taskData) => {
    try {
      const res = await api("/task", {
        method: "POST",
        body: JSON.stringify({
          title: taskData.name,
          description: taskData.description,
          dueDate: taskData.dueDate,
          status: taskData.status,
        }),
      });

      const newTask = {
        id: res.task._id,
        name: res.task.title,
        description: res.task.description,
        dueDate: res.task.dueDate,
        status: res.task.status,
        createdAt: res.task.createdAt,
      };

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === newTask.status
            ? { ...col, tasks: [newTask, ...col.tasks] }
            : col
        )
      );
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId, status) => {
    try {
      await api(`/task/${taskId}`, { method: "DELETE" });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
        }))
      );
    } catch (error) {
      console.error("Failed to delete task", error);
    }
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

  const handleUpdateTask = async (updatedTask) => {
    try {
      const res = await api(`/task/${updatedTask.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updatedTask.name,
          description: updatedTask.description,
          dueDate: updatedTask.dueDate,
          status: updatedTask.status,
        }),
      });

      const backendTask = res.task;

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === backendTask._id
              ? {
                  id: backendTask._id,
                  name: backendTask.title,
                  description: backendTask.description,
                  status: backendTask.status,
                  dueDate: backendTask.dueDate,
                  createdAt: backendTask.createdAt,
                }
              : t
          ),
        }))
      );
    } catch (err) {
      console.error("Failed to update task", err);
    }
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
