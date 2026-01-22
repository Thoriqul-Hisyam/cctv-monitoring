import { getUsers } from "@/actions/user";
import UserTable from "@/components/admin/UserTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const users = await getUsers();
    return <UserTable data={users} />;
}
