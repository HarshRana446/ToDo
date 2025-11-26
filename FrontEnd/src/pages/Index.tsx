import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth.context";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import KanbanColumn from "@/components/KanbanColumn";
import AddTaskModal from "@/components/AddTaskModal";
import AddColumnModal from "@/components/AddColumnModel";
import AddColumnButton from "@/components/AddColumnButton";
import SearchBar from "@/components/SearchBar";
import TaskCard from "@/components/TaskCard";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api.js";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  function fetch() {
    Promise.all([api("/tasks"), api("/columns")])
      .then(([tasksRes, columnsRes]) => {
        const cols = columnsRes.columns;
        const tasks = tasksRes.tasks;

        const formatted = cols.map((col) => ({
          id: col._id,
          title: col.title,
          tasks: tasks
            .filter((t) => String(t.columnId?._id) === String(col._id))
            .map((task) => ({
              id: task._id,
              _id: task._id,
              name: task.title,
              description: task.description || "",
              dueDate: task.dueDate || null,
              columnId: task.columnId,
            })),
        }));

        setColumns(formatted);
      })
      .catch((err) => console.error("Failed To load", err));
  }
  useEffect(() => {
    fetch();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
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

  const handleDragStart = (event) => {
    const activeId = event.active.id;

    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t._id === activeId);

    setActiveTask(task || null);
  };

  const handleDragOver = (event) => {
    //
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const dropTargetId = over.id;

    const fromColumn = columns.find((col) =>
      col.tasks.some((t) => t._id === activeId)
    );
    if (!fromColumn) return;

    const task = fromColumn.tasks.find((t) => t._id === activeId);
    if (!task) return;

    const dropColumn =
      columns.find((c) => c.id === dropTargetId) ||
      columns.find((c) => c.tasks.some((t) => t._id === dropTargetId));
    if (!dropColumn) return;

    const newColumnId = dropColumn.id;

    if (fromColumn.id === dropColumn.id) {
      const oldIndex = fromColumn.tasks.findIndex((t) => t._id === activeId);
      const newIndex = dropColumn.tasks.findIndex(
        (t) => t._id === dropTargetId
      );
      if (oldIndex === newIndex) return;

      const reordered = arrayMove(fromColumn.tasks, oldIndex, newIndex);

      setColumns((prev) =>
        prev.map((col) =>
          col.id === fromColumn.id ? { ...col, tasks: reordered } : col
        )
      );

      try {
        await api("/tasks/reorder", {
          method: "PUT",
          body: JSON.stringify({
            tasks: reordered.map((t: any, index: number) => ({
              _id: t._id,
              order: index,
            })),
          }),
        });
      } catch (err) {
        console.error("Failed to reorder:", err);
      }

      return;
    }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromColumn.id)
          return { ...col, tasks: col.tasks.filter((t) => t._id !== activeId) };

        if (col.id === dropColumn.id)
          return {
            ...col,
            tasks: [
              ...col.tasks,
              {
                ...task,
                columnId: { _id: dropColumn.id, title: dropColumn.title },
              },
            ],
          };

        return col;
      })
    );

    try {
      await api(`/tasks/${activeId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ columnId: newColumnId }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }

    fetch();
  };

  const handleAddTask = async (taskData) => {
    try {
      const res = await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskData.name,
          description: taskData.description,
          dueDate: taskData.dueDate,
          columnId: taskData.columnId,
        }),
      });

      const t = res.task;

      const newTask = {
        _id: t._id,
        name: t.title,
        description: t.description,
        dueDate: t.dueDate,
        columnId: t.columnId,
      };

      setColumns((prev) =>
        prev.map((col) =>
          col.id === newTask.columnId
            ? { ...col, tasks: [newTask, ...col.tasks] }
            : col
        )
      );
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api(`/tasks/${taskId}`, { method: "DELETE" });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t._id !== taskId),
        }))
      );
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleOpenModal = (columnId) => {
    setEditingTask(null);
    setSelectedStatus(columnId);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setSelectedStatus(task.columnId);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const res = await api(`/tasks/${updatedTask.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updatedTask.name,
          description: updatedTask.description,
          dueDate: updatedTask.dueDate,
          columnId:
            typeof updatedTask.columnId === "object"
              ? updatedTask.columnId._id
              : updatedTask.columnId,
        }),
      });

      const backendTask = res.task;

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t._id === backendTask._id
              ? {
                  id: backendTask._id,
                  name: backendTask.title,
                  description: backendTask.description,
                  dueDate: backendTask.dueDate,
                  columnId: backendTask.columnId,
                }
              : t
          ),
        }))
      );
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleAddColumn = async (title) => {
    try {
      const exists = columns.some(
        (col) => col.title.toLowerCase() === title.toLowerCase()
      );

      if (exists) {
        alert("Column name already exists!");
        return;
      }
      const res = await api("/columns", {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      setColumns((prev) => [
        ...prev,
        { id: res.column._id, title: res.column.title, tasks: [] },
      ]);
    } catch (err) {
      console.error("Failed to add column", err);
    }
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
                onClick={() => handleOpenModal(columns[0]?.id || "pending")}
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
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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
                  onDeleteTask={(taskId) => handleDeleteTask(taskId)}
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

      {/* Modals */}
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
