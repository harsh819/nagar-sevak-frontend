import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  ClipboardList,
  HardHat,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalComplaints: number;
  newComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalStaff: number;
  pendingTasks: number;
  activeWorks: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    newComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalStaff: 0,
    pendingTasks: 0,
    activeWorks: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints
      const { data: complaints } = await supabase
        .from("complaints")
        .select("id, status");

      // Fetch staff
      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("is_active", true);

      // Fetch tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("status", "pending");

      // Fetch development works
      const { data: works } = await supabase
        .from("development_works")
        .select("id")
        .eq("status", "ongoing");

      // Fetch recent complaints
      const { data: recent } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      const complaintsList = complaints || [];
      setStats({
        totalComplaints: complaintsList.length,
        newComplaints: complaintsList.filter((c) => c.status === "new").length,
        inProgressComplaints: complaintsList.filter((c) => c.status === "in_progress").length,
        resolvedComplaints: complaintsList.filter((c) => c.status === "completed").length,
        totalStaff: staff?.length || 0,
        pendingTasks: tasks?.length || 0,
        activeWorks: works?.length || 0,
      });

      setRecentComplaints(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Complaints",
      value: stats.totalComplaints,
      icon: FileText,
      color: "bg-primary",
      href: "/admin/complaints",
    },
    {
      label: "New Complaints",
      value: stats.newComplaints,
      icon: AlertCircle,
      color: "bg-red-500",
      href: "/admin/complaints?status=new",
    },
    {
      label: "In Progress",
      value: stats.inProgressComplaints,
      icon: Clock,
      color: "bg-accent",
      href: "/admin/complaints?status=in_progress",
    },
    {
      label: "Resolved",
      value: stats.resolvedComplaints,
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/admin/complaints?status=completed",
    },
    {
      label: "Active Staff",
      value: stats.totalStaff,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/staff",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: ClipboardList,
      color: "bg-purple-500",
      href: "/admin/tasks",
    },
    {
      label: "Active Works",
      value: stats.activeWorks,
      icon: HardHat,
      color: "bg-cyan-500",
      href: "/admin/works",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-red-100 text-red-700",
      in_progress: "bg-amber-100 text-amber-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of complaints, tasks, and development works
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="bg-card rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Complaints */}
      <div className="bg-card rounded-xl shadow-sm">
        <div className="p-4 lg:p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Complaints
          </h2>
          <Link
            to="/admin/complaints"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="p-4 lg:p-6">
          {recentComplaints.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No complaints yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">
                        {complaint.complaint_number}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {complaint.citizen_name} • {complaint.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
