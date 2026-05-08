"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  resolve: (confirmed: boolean) => void;
}

const ConfirmDialogContext = createContext<
  ((options: ConfirmDialogOptions) => Promise<boolean>) | null
>(null);

export function useConfirmDialog() {
  const confirm = useContext(ConfirmDialogContext);
  if (!confirm) {
    throw new Error("useConfirmDialog must be used inside ConfirmDialogProvider.");
  }

  return confirm;
}

export function ConfirmDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dialogState, setDialogState] = useState<ConfirmDialogState | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (confirmed: boolean) => {
      dialogState?.resolve(confirmed);
      setDialogState(null);
    },
    [dialogState]
  );

  const contextValue = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={Boolean(dialogState)}
        onOpenChange={(open) => {
          if (!open) {
            handleClose(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogState?.title}</DialogTitle>
            <DialogDescription>{dialogState?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              {dialogState?.cancelLabel ?? "Batal"}
            </Button>
            <Button
              type="button"
              variant={dialogState?.destructive ? "destructive" : "default"}
              onClick={() => handleClose(true)}
            >
              {dialogState?.confirmLabel ?? "Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}
