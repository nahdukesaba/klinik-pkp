"use client";

import { useEffect, useState } from "react";

interface AdminErrorAlertProps {
  message: string;
}

export function AdminErrorAlert({ message }: AdminErrorAlertProps) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDismissedMessage(message), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (dismissedMessage === message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}
