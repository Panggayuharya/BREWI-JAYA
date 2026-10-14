"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ACCEPT_IMAGE, IMAGE_PRESETS, MAX_UPLOAD_MB, type ImagePreset } from "@/lib/upload-rules";
import { FieldError } from "./ActionForm";
import { hintClass, labelClass } from "./ui";

/**
 * Input foto + pratinjau. Saat edit, foto lama tampil dan input boleh dikosongkan (foto tidak diganti).
 * `data-max-side` dibaca ActionForm untuk memperkecil foto sebelum dikirim.
 */
export function ImageField({
  preset,
  label = "Foto",
  name = "image",
  currentUrl,
  required = false,
  hint,
  previewClass = "aspect-square w-28",
}: {
  preset: ImagePreset;
  label?: string;
  name?: string;
  currentUrl?: string;
  required?: boolean;
  hint?: string;
  /** Rasio & lebar kotak pratinjau (kelas Tailwind) */
  previewClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Form dikosongkan (setelah berhasil) → pratinjau ikut hilang
  useEffect(() => {
    const form = inputRef.current?.form;
    const onReset = () => setPreview(null);
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const shown = preview ?? currentUrl;

  return (
    <div className="@container flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {/* Kolom sempit (mis. sidebar form): pratinjau di atas input; kolom lebar: berdampingan */}
      <div className="flex flex-col gap-3 @md:flex-row @md:items-start">
        <div className={`relative shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-cream ${previewClass}`}>
          {shown ? (
            <Image src={shown} alt="" fill sizes="160px" unoptimized={shown.startsWith("blob:")} className="object-contain" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-center text-[11px] text-ink/40">
              Belum ada foto
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="file"
            accept={ACCEPT_IMAGE}
            required={required && !currentUrl}
            data-max-side={IMAGE_PRESETS[preset].maxSide}
            aria-describedby={`${name}-error`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="block w-full text-sm text-ink/70 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-semibold file:text-warm hover:file:bg-deep"
          />
          <FieldError name={name} />
          <p className={hintClass}>
            JPG, PNG, WebP, atau AVIF · maks {MAX_UPLOAD_MB} MB (foto besar otomatis diperkecil).
            {currentUrl && " Kosongkan bila foto tidak diganti."}
            {hint && <> {hint}</>}
          </p>
        </div>
      </div>
    </div>
  );
}
