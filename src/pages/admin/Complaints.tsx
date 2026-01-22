import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  Camera,
  X,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Complaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_address: string;
  booth_number: string;
  category: string;
  description: string | null;
  photo_url: string | null;
  status: string;
  assigned_staff_id: string | null;
  completion_photo_url: string | null;
  completion_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface Staff {
  id: string;
  name: string;
  designation: string | null;
}

const Complaints = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("id, name, designation")
        .eq("is_active", true);

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedComplaint || !selectedStaffId) return;

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          assigned_staff_id: selectedStaffId,
          status: "in_progress",
        })
        .eq("id", selectedComplaint.id);

      if (error) throw error;

      toast({
        title: "Staff Assigned",
        description: "Complaint has been assigned successfully.",
      });

      setShowAssignDialog(false);
      setSelectedStaffId("");
      fetchComplaints();
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast({
        title: "Error",
        description: "Failed to assign staff. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedComplaint) return;

    try {
      let photoUrl = null;

      if (completionPhoto) {
        const fileExt = completionPhoto.name.split(".").pop();
        const filePath = `completions/${selectedComplaint.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, completionPhoto, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(filePath);

        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("complaints")
        .update({
          status: "completed",
          completion_notes: completionNotes,
          completion_photo_url: photoUrl,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", selectedComplaint.id);

      if (error) throw error;

      toast({
        title: "Complaint Resolved",
        description: "Complaint has been marked as completed.",
      });

      setShowCompleteDialog(false);
      setCompletionNotes("");
      setCompletionPhoto(null);
      fetchComplaints();
    } catch (error) {
      console.error("Error completing complaint:", error);
      toast({
        title: "Error",
        description: "Failed to complete complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.complaint_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Complaints Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View, assign, and manage citizen complaints
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Citizen</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Booth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No complaints found
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">
                    {complaint.complaint_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{complaint.citizen_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {complaint.citizen_phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize">
                    {complaint.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    Booth {complaint.booth_number}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                        complaint.status
                      )}`}
                    >
                      {complaint.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {complaint.status === "new" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowAssignDialog(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      {complaint.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowCompleteDialog(true);
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Complaint Dialog */}
      <Dialog
        open={!!selectedComplaint && !showAssignDialog && !showCompleteDialog}
        onOpenChange={() => setSelectedComplaint(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {selectedComplaint.complaint_number}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(
                    selectedComplaint.status
                  )}`}
                >
                  {selectedComplaint.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Citizen Name</p>
                  <p className="font-medium">{selectedComplaint.citizen_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{selectedComplaint.citizen_phone}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </p>
                  <p className="font-medium">{selectedComplaint.citizen_address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedComplaint.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Booth Number</p>
                  <p className="font-medium">Booth {selectedComplaint.booth_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Submitted
                  </p>
                  <p className="font-medium">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedComplaint.resolved_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="font-medium">
                      {new Date(selectedComplaint.resolved_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedComplaint.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="bg-secondary/50 p-3 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>
              )}

              {selectedComplaint.photo_url && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Attached Photo</p>
                  <img
                    src={selectedComplaint.photo_url}
                    alt="Complaint"
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}

              {selectedComplaint.completion_notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completion Notes</p>
                  <p className="bg-green-50 p-3 rounded-lg text-green-800">
                    {selectedComplaint.completion_notes}
                  </p>
                </div>
              )}

              {selectedComplaint.completion_photo_url && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completion Photo</p>
                  <img
                    src={selectedComplaint.completion_photo_url}
                    alt="Completion"
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Assign a staff member to handle complaint{" "}
              <strong>{selectedComplaint?.complaint_number}</strong>
            </p>
            <div className="space-y-2">
              <Label>Select Staff Member</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.designation && `(${s.designation})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleAssignStaff} disabled={!selectedStaffId}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Completed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Complete complaint <strong>{selectedComplaint?.complaint_number}</strong>
            </p>
            <div className="space-y-2">
              <Label>Completion Notes</Label>
              <Textarea
                placeholder="Describe the resolution..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Completion Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCompletionPhoto(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleMarkComplete}>
                Mark Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaints;
