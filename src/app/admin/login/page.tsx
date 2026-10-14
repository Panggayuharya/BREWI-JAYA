import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/auth";
import { login } from "@/app/admin/auth-actions";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { Field, inputClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-4 py-10">
      {/* Cahaya biru tipis di belakang kartu, senada dengan latar menu di situs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_198_255/0.16),transparent_65%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3 text-warm">
          <BrandLogo size="md" />
          <div className="flex flex-col leading-tight">
            <span className="font-brand text-lg font-bold tracking-[0.12em]">BREWi JAYA</span>
            <span className="font-display text-sm font-light text-accent italic">Dashboard admin</span>
          </div>
        </div>

        <ActionForm action={login} className="flex flex-col gap-4 rounded-2xl bg-warm p-6 shadow-raised sm:p-7">
          <h1 className="text-lg font-semibold text-ink">Masuk ke dashboard</h1>
          <FormMessage />
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              className={inputClass}
            />
          </Field>
          <SubmitButton busyLabel="Memeriksa…" className="mt-1 w-full">
            Masuk
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
