import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  onClick: () => void;
}

const AddColumnButton = ({ onClick }: AddColumnButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center min-w-[60px] h-[44px] bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-primary rounded-lg transition-all"
      aria-label="Add new column"
    >
      <Plus className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
    </button>
  );
};

export default AddColumnButton;
