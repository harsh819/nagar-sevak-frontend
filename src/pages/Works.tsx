import { useState, useEffect } from "react";
import axios from "axios";
import { HardHat, MapPin, Calendar, CheckCircle, Clock, Hammer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Work {
  _id: string;
  devId: number;
  title: string;
  location: string;
  description: string;
  budget: number;
  contractor: string;
  progress: number;
  status: string; // "Upcoming" | "In Progress" | "Completed"
  startDate: string;
}

const WorkCard = ({ work }: { work: Work }) => {
  const getStatusBadge = () => {
    const status = work.status.toLowerCase();
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case "in progress":
        return (
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
            <Hammer className="h-3 w-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" /> Upcoming
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Crores`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <HardHat className="h-6 w-6 text-primary" />
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">{work.title}</h3>

      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="line-clamp-1">{work.location}</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{work.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-muted-foreground">Budget</p>
          <p className="font-semibold text-foreground">{formatBudget(work.budget)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Start Date</p>
          <p className="font-semibold text-foreground">{formatDate(work.startDate)}</p>
        </div>
      </div>

      {work.status !== "Upcoming" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{work.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${work.progress === 100 ? "bg-green-500" : "bg-accent"
                }`}
              style={{ width: `${work.progress}%` }}
            />
          </div>
        </div>
      )}

      {work.contractor && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Contractor: <span className="text-foreground font-medium">{work.contractor}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const Works = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/development/all-development`);
      if (response.data.success) {
        setWorks(response.data.data);
      } else {
        setError("Failed to fetch works");
      }
    } catch (err) {
      console.error("Error fetching works:", err);
      setError("Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const completedWorks = works.filter((w) => w.status === "Completed");
  const ongoingWorks = works.filter((w) => w.status === "In Progress");
  const upcomingWorks = works.filter((w) => w.status === "Upcoming");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium text-lg">Loading development projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive font-semibold text-lg">{error}</p>
        <Button onClick={fetchWorks} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HardHat className="h-4 w-4" />
            <span className="text-sm font-medium">Development Works</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Ward Development Projects
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            विकास कामांची माहिती। Track all ongoing, completed, and upcoming development projects in your ward.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 mb-12">
          <div className="bg-card border border-green-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl lg:text-4xl font-extrabold text-green-600 mb-1">{completedWorks.length}</p>
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-card border border-accent/20 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Hammer className="h-6 w-6 text-accent" />
            </div>
            <p className="text-3xl lg:text-4xl font-extrabold text-accent mb-1">{ongoingWorks.length}</p>
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">In Progress</p>
          </div>
          <div className="bg-card border border-blue-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-3xl lg:text-4xl font-extrabold text-blue-600 mb-1">{upcomingWorks.length}</p>
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Upcoming</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-muted/50 p-1 rounded-xl border border-border">
              <TabsTrigger value="all" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">All Works</TabsTrigger>
              <TabsTrigger value="ongoing" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Ongoing</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Completed</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Upcoming</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {works.length === 0 ? (
              <NoDataFound />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {works.map((work) => (
                  <WorkCard key={work._id} work={work} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ongoing" className="mt-0">
            {ongoingWorks.length === 0 ? (
              <NoDataFound />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {ongoingWorks.map((work) => (
                  <WorkCard key={work._id} work={work} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedWorks.length === 0 ? (
              <NoDataFound />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {completedWorks.map((work) => (
                  <WorkCard key={work._id} work={work} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {upcomingWorks.length === 0 ? (
              <NoDataFound />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {upcomingWorks.map((work) => (
                  <WorkCard key={work._id} work={work} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const NoDataFound = () => (
  <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
    <HardHat className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
    <p className="text-muted-foreground">There are currently no projects in this category.</p>
  </div>
);


export default Works;
