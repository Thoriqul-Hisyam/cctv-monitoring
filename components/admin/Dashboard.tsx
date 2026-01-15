import StatsCard from "./StatsCard";
import {
  LayoutDashboard,
  Camera,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Video,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const dashboardStats = [
  { label: "Total CCTV", value: "24", change: "+2", color: "blue" },
  { label: "Online", value: "22", change: "+1", color: "green" },
  { label: "Offline", value: "2", change: "-1", color: "red" },
  { label: "Total Users", value: "8", change: "+0", color: "purple" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitoring overview dan statistik sistem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} dari kemarin
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-${stat.color}-500`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Camera className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Tambah CCTV Baru
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Tambah User Baru
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Lihat Live Monitoring
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  CCTV Offline Detected
                </p>
                <p className="text-xs text-gray-500">
                  Main Lobby - 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New User Login
                </p>
                <p className="text-xs text-gray-500">
                  operator1 - 5 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Camera className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">CCTV Added</p>
                <p className="text-xs text-gray-500">
                  Parking Area B - 1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
