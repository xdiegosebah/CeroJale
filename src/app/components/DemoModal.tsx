import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

/** Shared accessible shell: focus trapping, Escape and focus restoration. */
export function DemoModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="block max-h-[90dvh] overflow-y-auto rounded-3xl border-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
