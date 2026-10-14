"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "./icons";
import { buttonClass } from "./ui";

type FormActionFn = (formData: FormData) => void | Promise<void>;

function IconSubmit({ icon, label, disabled }: { icon: IconName; label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} aria-label={label} title={label} className={buttonClass("ghost", "sm", "w-8 px-0")}>
      <Icon name={icon} />
    </button>
  );
}

/** Tombol naik/turun urutan tampil. `move` menerima arah lewat field `dir` (-1 / 1). */
export function MoveButtons({ move, isFirst, isLast }: { move: FormActionFn; isFirst: boolean; isLast: boolean }) {
  return (
    <div className="flex">
      <form action={move}>
        <input type="hidden" name="dir" value="-1" />
        <IconSubmit icon="up" label="Naikkan urutan" disabled={isFirst} />
      </form>
      <form action={move}>
        <input type="hidden" name="dir" value="1" />
        <IconSubmit icon="down" label="Turunkan urutan" disabled={isLast} />
      </form>
    </div>
  );
}

function DeleteSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="submit"
      disabled={pending}
      // Klik pertama hanya meminta konfirmasi (tanpa dialog bawaan browser); klik kedua menghapus
      onClick={(e) => {
        if (armed) return;
        e.preventDefault();
        setArmed(true);
        setTimeout(() => setArmed(false), 3000);
      }}
      className={buttonClass("danger", "sm", armed ? "bg-red-600 text-white hover:bg-red-700" : "")}
    >
      {pending ? "Menghapus…" : armed ? "Yakin hapus?" : label}
    </button>
  );
}

export function DeleteButton({ action, label = "Hapus" }: { action: FormActionFn; label?: string }) {
  return (
    <form action={action}>
      <DeleteSubmit label={label} />
    </form>
  );
}

function ToggleSubmit({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="switch"
      aria-checked={on}
      disabled={pending}
      className={`inline-flex min-h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold transition-colors ${
        on ? "text-emerald-800 hover:bg-emerald-50" : "text-ink/50 hover:bg-ink/6"
      }`}
    >
      <span aria-hidden className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-emerald-600" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-[left] ${on ? "left-3.5" : "left-0.5"}`} />
      </span>
      {on ? onLabel : offLabel}
    </button>
  );
}

/** Saklar on/off satu klik (mis. Tersedia/Habis, Tayang/Draft). Nilai baru dikirim lewat field `value`. */
export function ToggleButton({ action, on, onLabel, offLabel }: { action: FormActionFn; on: boolean; onLabel: string; offLabel: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="value" value={on ? "false" : "true"} />
      <ToggleSubmit on={on} onLabel={onLabel} offLabel={offLabel} />
    </form>
  );
}
