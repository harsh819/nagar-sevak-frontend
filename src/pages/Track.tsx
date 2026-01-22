import { useState } from "react";
import { Search, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface TimelineEvent {
  date: string;
  status: string;
  description: string;
}

interface ComplaintData {
  id: string;
  category: string;
  status: "Pending" | "In Progress" | "Resolved";
  submittedDate: string;
  description: string;
  timeline: TimelineEvent[];
}

// Category mapping from backend enum to display name
const categoryMap: Record<string, string> = {
  WATER: "Water Supply",
  ROAD: "Road & Pothole",
  GARBAGE: "Garbage Collection",
  STREET_LIGHT: "Street Light",
  DRAINAGE: "Drainage",
  OTHER: "Other",
};

// Mock data for demo
const mockComplaint: ComplaintData = {
  id: "NS-847291",
  category: "Water Supply",
  status: "In Progress",
  submittedDate: "05 Jan 2024",
  description: "Water supply issue in Sector 5 area. No water since morning.",
  timeline: [
    {
      date: "05 Jan 2024, 10:30 AM",
      status: "Complaint Registered",
      description: "Your complaint has been registered successfully.",
    },
    {
      date: "05 Jan 2024, 02:00 PM",
      status: "Assigned to Team",
      description: "Complaint assigned to Water Department team.",
    },
    {
      date: "06 Jan 2024, 09:00 AM",
      status: "In Progress",
      description: "Team is working on resolving the issue.",
    },
  ],
};

const Track = () => {
  const [complaintId, setComplaintId] = useState("");
  const [searched, setSearched] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a complaint ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/complaints/check/${complaintId.trim()}`;
      const response = await axios.get(apiUrl);

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Transform API response to ComplaintData format
        const transformedComplaint: ComplaintData = {
          id: data.complaintId,
          category: categoryMap[data.complaintCategory] || data.complaintCategory,
          status: data.status,
          submittedDate: data.createdAt ? formatDate(data.createdAt) : "N/A",
          description: data.complaintDescription,
          timeline: [
            {
              date: data.createdAt ? formatDate(data.createdAt) : "N/A",
              status: "Complaint Registered",
              description: "Your complaint has been registered successfully.",
            },
          ],
        };

        setComplaint(transformedComplaint);
        toast({
          title: "Complaint Found",
          description: `Complaint ${data.complaintId} retrieved successfully`,
        });
      } else {
        setComplaint(null);
        toast({
          title: "Not Found",
          description: "No complaint found with this ID",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching complaint:", error);
      setComplaint(null);

      if (error.response?.status === 404) {
        toast({
          title: "Complaint Not Found",
          description: `No complaint found with ID "${complaintId}"`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch complaint details",
          variant: "destructive",
        });
      }
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-accent/10 text-accent border-accent/20";
      case "Pending":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="h-5 w-5" />;
      case "In Progress":
        return <Clock className="h-5 w-5" />;
      case "Pending":
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="py-12 lg:py-16 min-h-[80vh]">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Track Complaint Status</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Track Your Complaint
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            तुमच्या तक्रारीची स्थिती तपासा। Enter your complaint ID to see the current status and updates.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter Complaint ID (e.g., NS-847291)"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              className="h-14 text-lg"
            />
            <Button type="submit" variant="accent" size="lg" disabled={loading}>
              {loading ? "Searching..." : "Track"}
            </Button>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in">
            {complaint ? (
              <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
                {/* Status Header */}
                <div className="bg-secondary p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Complaint ID</p>
                      <p className="text-xl font-bold text-foreground">{complaint.id}</p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {getStatusIcon(complaint.status)}
                      <span className="font-medium capitalize">
                        {complaint.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 lg:p-8 border-b border-border">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{complaint.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium text-foreground">{complaint.submittedDate}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-foreground">{complaint.description}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 lg:p-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Progress Timeline</h3>
                  <div className="space-y-6">
                    {complaint.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${index === complaint.timeline.length - 1
                              ? "bg-accent text-accent-foreground"
                              : "bg-green-100 text-green-600"
                              }`}
                          >
                            {index === complaint.timeline.length - 1 ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </div>
                          {index < complaint.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="text-xs text-muted-foreground mb-1">{event.date}</p>
                          <p className="font-semibold text-foreground">{event.status}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-8 lg:p-12 text-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Complaint Not Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  No complaint found with ID "{complaintId}". Please check the ID and try again.
                </p>
                <Button variant="outline" onClick={() => setSearched(false)}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        {!searched && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Enter your complaint ID to track its status</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
