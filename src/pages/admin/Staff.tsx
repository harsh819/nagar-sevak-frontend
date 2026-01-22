import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface StaffMember {
  id: string;
  name: string;
  phone: string | null;
  designation: string | null;
  is_active: boolean;
  created_at: string;
}

const Staff = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    designation: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (staffMember?: StaffMember) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        phone: staffMember.phone || "",
        designation: staffMember.designation || "",
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: "", phone: "", designation: "" });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingStaff) {
        const { error } = await supabase
          .from("staff")
          .update({
            name: formData.name,
            phone: formData.phone || null,
            designation: formData.designation || null,
          })
          .eq("id", editingStaff.id);

        if (error) throw error;
        toast({ title: "Staff Updated", description: "Staff member updated successfully." });
      } else {
        const { error } = await supabase.from("staff").insert({
          name: formData.name,
          phone: formData.phone || null,
          designation: formData.designation || null,
        });

        if (error) throw error;
        toast({ title: "Staff Added", description: "New staff member added successfully." });
      }

      setShowDialog(false);
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast({
        title: "Error",
        description: "Failed to save staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (staffMember: StaffMember) => {
    try {
      const { error } = await supabase
        .from("staff")
        .update({ is_active: !staffMember.is_active })
        .eq("id", staffMember.id);

      if (error) throw error;
      
      toast({
        title: staffMember.is_active ? "Staff Deactivated" : "Staff Activated",
        description: `${staffMember.name} has been ${staffMember.is_active ? "deactivated" : "activated"}.`,
      });
      
      fetchStaff();
    } catch (error) {
      console.error("Error toggling staff status:", error);
    }
  };

  const handleDelete = async (staffMember: StaffMember) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.name}?`)) return;

    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffMember.id);

      if (error) throw error;
      toast({ title: "Staff Deleted", description: "Staff member has been removed." });
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: "Failed to delete staff member.",
        variant: "destructive",
      });
    }
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage office staff and assignments
          </p>
        </div>
        <Button variant="accent" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No staff members added yet
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.designation || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        member.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(member)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff Member" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Field Officer"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSubmit}>
                {editingStaff ? "Update" : "Add Staff"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
