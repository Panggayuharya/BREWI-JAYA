/** Hasil server action form admin (dipakai `useActionState`). */
export type FormState = {
  /** Pesan umum (error atau sukses) */
  message?: string;
  ok?: boolean;
  /** Error per field: nama input → pesan */
  errors?: Record<string, string>;
} | null;
