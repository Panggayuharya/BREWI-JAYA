import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { createMenuItem } from "../actions";
import { getMenuOptions, MenuFields } from "../fields";

export const metadata: Metadata = { title: "Tambah menu" };

export default async function NewMenuPage() {
  await requireAdmin();
  const options = await getMenuOptions();

  return (
    <>
      <BackLink href="/admin/menu">Menu</BackLink>
      <PageHeader title="Tambah menu" />
      <ActionForm action={createMenuItem} className="flex flex-col gap-5">
        <FormMessage />
        <MenuFields options={options} />
        <div>
          <SubmitButton>Simpan menu</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
