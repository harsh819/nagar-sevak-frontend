import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Calendar, Upload } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DevelopmentWork {
  id: string;
  title: string;
  description: string | null;
  location: string;
  budget: number | null;
  contractor_name: string | null;
  progress: number;
  status: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const DevelopmentWorks = () => {
  const { toast } = useToast();
  const [works, setWorks] = useState<DevelopmentWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingWork, setEditingWork] = useState<DevelopmentWork | null>(null);
  const [filter, setFilter] = useState("all");
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    contractor_name: "",
    progress: "0",
    status: "upcoming",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const { data, error } = await supabase
        .from("development_works")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (work?: DevelopmentWork) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        title: work.title,
        description: work.description || "",
        location: work.location,
        budget: work.budget?.toString() || "",
        contractor_name: work.contractor_name || "",
        progress: work.progress.toString(),
        status: work.status,
        start_date: work.start_date || "",
        end_date: work.end_date || "",
      });
    } else {
      setEditingWork(null);
      setFormData({
        title: "",
        description: "",
        location: "",
        budget: "",
        contractor_name: "",
        progress: "0",
        status: "upcoming",
        start_date: "",
        end_date: "",
      });
    }
    setBeforePhoto(null);
    setAfterPhoto(null);
    setShowDialog(true);
  };

  const uploadPhoto = async (file: File, type: "before" | "after", workId: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `works/${workId}/${type}.${fileExt}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.location.trim()) {
      toast({
        title: "Error",
        description: "Title and location are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const workData: any = {
        title: formData.title,
        description: formData.description || null,
        location: formData.location,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        contractor_name: formData.contractor_name || null,
        progress: parseInt(formData.progress),
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      let workId = editingWork?.id;

      if (editingWork) {
        const { error } = await supabase
          .from("development_works")
          .update(workData)
          .eq("id", editingWork.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("development_works")
          .insert(workData)
          .select("id")
          .single();

        if (error) throw error;
        workId = data.id;
      }

      // Upload photos if provided
      if (workId) {
        if (beforePhoto) {
          const beforeUrl = await uploadPhoto(beforePhoto, "before", workId);
          await supabase
            .from("development_works")
            .update({ before_photo_url: beforeUrl })
            .eq("id", workId);
        }

        if (afterPhoto) {
          const afterUrl = await uploadPhoto(afterPhoto, "after", workId);
          await supabase
            .from("development_works")
            .update({ after_photo_url: afterUrl })
            .eq("id", workId);
        }
      }

      toast({
        title: editingWork ? "Work Updated" : "Work Created",
        description: `Development work has been ${editingWork ? "updated" : "created"} successfully.`,
      });

      setShowDialog(false);
      fetchWorks();
    } catch (error) {
      console.error("Error saving work:", error);
      toast({
        title: "Error",
        description: "Failed to save development work.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (work: DevelopmentWork) => {
    if (!confirm("Are you sure you want to delete this work?")) return;

    try {
      const { error } = await supabase
        .from("development_works")
        .delete()
        .eq("id", work.id);

      if (error) throw error;
      toast({ title: "Work Deleted" });
      fetchWorks();
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  };

  const filteredWorks = works.filter((work) => {
    if (filter === "all") return true;
    return work.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-amber-100 text-amber-700",
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
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Development Works
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage construction and development projects
          </p>
        </div>
        <Button variant="accent" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Work
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "upcoming", "ongoing", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "accent" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Works Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No development works found
          </div>
        ) : (
          filteredWorks.map((work) => (
            <div
              key={work.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Photo */}
              {work.before_photo_url || work.after_photo_url ? (
                <div className="h-40 bg-muted overflow-hidden">
                  <img
                    src={work.after_photo_url || work.before_photo_url || ""}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No photo</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(
                      work.status
                    )}`}
                  >
                    {work.status}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenDialog(work)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDelete(work)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{work.title}</h3>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  {work.location}
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{work.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        work.progress === 100 ? "bg-green-500" : "bg-accent"
                      }`}
                      style={{ width: `${work.progress}%` }}
                    />
                  </div>
                </div>

                {work.budget && (
                  <p className="text-sm text-muted-foreground">
                    Budget: ₹{work.budget.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWork ? "Edit Development Work" : "Add Development Work"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Work title"
                />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Work location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Work description..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Contractor</Label>
                <Input
                  value={formData.contractor_name}
                  onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                  placeholder="Contractor name"
                />
              </div>
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Before Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>After Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSubmit}>
                {editingWork ? "Update" : "Create Work"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevelopmentWorks;
