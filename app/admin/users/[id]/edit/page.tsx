import { getUserById } from "@/actions/user";
import UserForm from "@/components/admin/UserForm";
import { notFound } from "next/navigation";

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const user = await getUserById(Number(resolvedParams.id));

    if (!user) return notFound();

    return <UserForm mode="edit" data={user} />;
}
