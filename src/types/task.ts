export type TaskStatus = string;

export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
