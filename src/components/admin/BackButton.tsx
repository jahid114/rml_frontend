import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Fallback destination when there is no previous history entry (e.g. deep link). */
  to: string;
  label?: string;
}

/** Goes to the previous page, falling back to `to` when history is empty. */
export function BackButton({ to, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-1 text-sm text-primary hover:text-accent"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
