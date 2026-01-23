import { getDashboardStats, getRecentActivities } from "@/actions/stats";
import DashboardComponent from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const [stats, activities] = await Promise.all([
        getDashboardStats(),
        getRecentActivities()
    ]);

    return (
        <DashboardComponent 
            stats={stats} 
            activities={activities} 
        />
    );
}
