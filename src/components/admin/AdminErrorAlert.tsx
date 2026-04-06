interface AdminErrorAlertProps {
  message: string;
}

export function AdminErrorAlert({ message }: AdminErrorAlertProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}
