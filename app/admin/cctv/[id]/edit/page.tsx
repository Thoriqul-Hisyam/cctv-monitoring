import { prisma } from "@/lib/prisma";
import CctvForm from "@/components/admin/CCTVForm";
import { notFound } from "next/navigation";

export default async function EditCctvPage({
  params,
}: {
  params: Promise<{ id: string }>; // Definisikan sebagai Promise
}) {
  // 1. Await params sebelum digunakan
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const cctv = await prisma.cctv.findUnique({
    where: { id: Number(id) },
  });

  if (!cctv) return notFound();

  return (
    <main className="container-fluid ">
      <CctvForm mode="edit" data={cctv} />
    </main>
  );
}
