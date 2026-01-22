import { HardHat, MapPin, Calendar, CheckCircle, Clock, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Work {
  id: string;
  title: string;
  location: string;
  description: string;
  budget?: string;
  contractor?: string;
  progress: number;
  status: "completed" | "ongoing" | "upcoming";
  startDate: string;
  endDate?: string;
}

const works: Work[] = [
  {
    id: "1",
    title: "Main Road Widening Project",
    location: "Main Market to Railway Station",
    description: "Widening of main road from 20ft to 40ft with proper drainage system.",
    budget: "₹45 Lakhs",
    contractor: "ABC Construction",
    progress: 75,
    status: "ongoing",
    startDate: "15 Nov 2023",
    endDate: "28 Feb 2024",
  },
  {
    id: "2",
    title: "LED Street Light Installation",
    location: "Sector 5 Colony",
    description: "Installation of 50 LED street lights to improve visibility and safety.",
    budget: "₹8 Lakhs",
    progress: 100,
    status: "completed",
    startDate: "01 Dec 2023",
    endDate: "20 Dec 2023",
  },
  {
    id: "3",
    title: "Community Park Development",
    location: "Near Government School",
    description: "Development of community park with walking track, benches, and playground equipment.",
    budget: "₹25 Lakhs",
    contractor: "Green Spaces Ltd",
    progress: 45,
    status: "ongoing",
    startDate: "01 Jan 2024",
    endDate: "31 Mar 2024",
  },
  {
    id: "4",
    title: "Underground Drainage System",
    location: "Sector 3 & 4",
    description: "Complete underground drainage network to prevent waterlogging during monsoon.",
    budget: "₹1.2 Crores",
    progress: 100,
    status: "completed",
    startDate: "01 Jun 2023",
    endDate: "30 Sep 2023",
  },
  {
    id: "5",
    title: "Water Tank Construction",
    location: "Hilltop Area",
    description: "Construction of 10 lakh liter capacity water storage tank for better water distribution.",
    budget: "₹35 Lakhs",
    progress: 0,
    status: "upcoming",
    startDate: "01 Mar 2024",
  },
  {
    id: "6",
    title: "School Building Renovation",
    location: "Government Primary School, Ward 45",
    description: "Complete renovation including new classrooms, toilets, and computer lab.",
    budget: "₹50 Lakhs",
    progress: 0,
    status: "upcoming",
    startDate: "15 Apr 2024",
  },
];

const WorkCard = ({ work }: { work: Work }) => {
  const getStatusBadge = () => {
    switch (work.status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case "ongoing":
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

  return (
    <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <HardHat className="h-6 w-6 text-primary" />
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{work.title}</h3>

      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
        <MapPin className="h-4 w-4" />
        {work.location}
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{work.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        {work.budget && (
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-semibold text-foreground">{work.budget}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Start Date</p>
          <p className="font-semibold text-foreground">{work.startDate}</p>
        </div>
      </div>

      {work.status !== "upcoming" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{work.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                work.progress === 100 ? "bg-green-500" : "bg-accent"
              }`}
              style={{ width: `${work.progress}%` }}
            />
          </div>
        </div>
      )}

      {work.contractor && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Contractor: <span className="text-foreground">{work.contractor}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const Works = () => {
  const completedWorks = works.filter((w) => w.status === "completed");
  const ongoingWorks = works.filter((w) => w.status === "ongoing");
  const upcomingWorks = works.filter((w) => w.status === "upcoming");

  return (
    <div className="py-12 lg:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <HardHat className="h-4 w-4" />
            <span className="text-sm font-medium">Development Works</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Ward Development Projects
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            विकास कामांची माहिती। Track all ongoing, completed, and upcoming development projects in your ward.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-10">
          <div className="bg-green-50 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-green-600">{completedWorks.length}</p>
            <p className="text-sm text-green-700">Completed</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-accent">{ongoingWorks.length}</p>
            <p className="text-sm text-accent">In Progress</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">{upcomingWorks.length}</p>
            <p className="text-sm text-blue-700">Upcoming</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-secondary p-1 rounded-lg">
            <TabsTrigger value="all" className="rounded-md">All Works</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-md">Ongoing</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-md">Completed</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-md">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ongoing">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Works;
