import { getGroupById } from "@/actions/group";
import GroupForm from "@/components/admin/GroupForm";
import { notFound } from "next/navigation";

export default async function EditGroupPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const group = await getGroupById(Number(resolvedParams.id));

    if (!group) return notFound();

    return <GroupForm mode="edit" data={group} />;
}
