"use client";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState } from "react";
import type { FormState } from "@/lib/form-state";
import { compressImage } from "@/lib/compress-image";
import { buttonClass } from "./ui";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const FormContext = createContext<{ state: FormState; busy: boolean }>({ state: null, busy: false });

/**
 * Form admin berbasis server action:
 * - isian TIDAK dikosongkan saat validasi gagal (form dikirim manual, bukan reset otomatis React);
 * - foto di input `data-max-side` diperkecil di browser dulu (lihat compressImage);
 * - pesan & error per field tersedia untuk <FormMessage>, <FieldError>, <SubmitButton>.
 */
export function ActionForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  /** Kosongkan form setelah berhasil (form tambah yang tetap di halaman yang sama) */
  resetOnSuccess?: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const [preparing, setPreparing] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const busy = pending || preparing;

  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form, (event.nativeEvent as SubmitEvent).submitter);
    setPreparing(true);
    try {
      for (const input of form.querySelectorAll<HTMLInputElement>("input[type=file][data-max-side]")) {
        const file = input.files?.[0];
        if (file) data.set(input.name, await compressImage(file, Number(input.dataset.maxSide)));
      }
    } finally {
      setPreparing(false);
    }
    startTransition(() => dispatch(data));
  }

  return (
    <form ref={ref} action={dispatch} onSubmit={onSubmit} className={className} aria-busy={busy}>
      <FormContext value={{ state, busy }}>{children}</FormContext>
    </form>
  );
}

/** Pesan umum hasil submit (sukses / gagal). */
export function FormMessage({ className = "" }: { className?: string }) {
  const { state } = useContext(FormContext);
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      } ${className}`}
    >
      {state.message}
    </p>
  );
}

export function FieldError({ name }: { name: string }) {
  const { state } = useContext(FormContext);
  const message = state?.errors?.[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="text-xs font-medium text-red-700">
      {message}
    </p>
  );
}

export function SubmitButton({
  children,
  busyLabel = "Menyimpan…",
  className = "",
}: {
  children: React.ReactNode;
  busyLabel?: string;
  className?: string;
}) {
  const { busy } = useContext(FormContext);
  return (
    <button type="submit" disabled={busy} className={buttonClass("primary", "md", className)}>
      {busy ? busyLabel : children}
    </button>
  );
}
