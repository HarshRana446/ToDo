import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDueSoon(dueDateString: string): boolean {
  try {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 5) return true;
    return false;
  } catch (error) {
    console.error("Invalid date string", dueDateString);
    return false;
  }
}
