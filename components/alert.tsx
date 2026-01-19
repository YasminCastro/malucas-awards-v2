"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AlertProps {
    title: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

export function Alert({
    title,
    description,
    open,
    onOpenChange,
    confirmText,
    cancelText,
    onConfirm,
}: AlertProps) {
    const isConfirm = typeof onConfirm === "function" || typeof cancelText === "string";
    const actionLabel = confirmText ?? "OK";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription className="whitespace-pre-line">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {isConfirm && (
                        <AlertDialogCancel onClick={() => onOpenChange(false)}>
                            {cancelText ?? "Cancelar"}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm?.();
                            onOpenChange(false);
                        }}
                        className={actionLabel === "Deletar" ? "bg-red-600 hover:bg-red-700" : undefined}
                    >
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
