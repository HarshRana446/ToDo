export type TaskStatus = string;

export interface Task {
  _id: string;
  name: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  columnId: {
    _id: string;
    title: string;
  };
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
