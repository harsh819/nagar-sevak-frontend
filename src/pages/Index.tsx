import { Link } from "react-router-dom";
import { ArrowRight, FileText, Search, Phone, CheckCircle, HardHat, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-leader.jpg";
import { useTenant } from "@/lib/TenantContext";

const HeroSection = () => {
  const { office } = useTenant();

  return (
    <section className="relative overflow-hidden gradient-hero min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/20 translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">{office?.wardName ? `${office.wardName} Office` : "Nagar Sevak Office"} • जनसेवा</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
              {office?.nagarSevakName || "Nagar Sevak Office"}
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary-foreground/90 mb-6">
              डिजिटल सुविधा तुमच्या दारात
            </p>
            <p className="text-base lg:text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Transforming public service through digital innovation. Register complaints,
              track progress, and stay connected with your local representative.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/grievance">
                  <FileText className="h-5 w-5" />
                  Register Complaint
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/track">
                  <Search className="h-5 w-5" />
                  Track Status
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden lg:flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10 flex items-center justify-center">
                {office?.profilePic || (office as any)?.profilePicture ? (
                  <img
                    src={office.profilePic || (office as any)?.profilePicture}
                    alt={office.nagarSevakName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroImage;
                    }}
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={heroImage}
                      alt="Leader Fallback"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <span className="text-8xl font-black text-white opacity-40">
                        {office?.nagarSevakName?.substring(0, 1) || "N"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Active Portal</p>
                    <p className="text-xs text-muted-foreground">{office?.wardName || "Verified Office"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const QuickActions = () => {
  const actions = [
    {
      icon: FileText,
      title: "Register Complaint",
      titleMr: "तक्रार नोंदवा",
      description: "Submit your grievance online",
      href: "/grievance",
      color: "bg-accent",
    },
    {
      icon: Search,
      title: "Track Complaint",
      titleMr: "तक्रार शोधा",
      description: "Check your complaint status",
      href: "/track",
      color: "bg-primary",
    },
    {
      icon: Phone,
      title: "Contact Office",
      titleMr: "कार्यालय संपर्क",
      description: "Get in touch with us",
      href: "/contact",
      color: "bg-green-600",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-card">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 -mt-24 relative z-20">
          {actions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-sm text-accent font-medium mb-2">{action.titleMr}</p>
              <p className="text-muted-foreground text-sm">{action.description}</p>
              <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:text-accent transition-colors">
                Learn more
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { value: "2,500+", label: "Complaints Solved", labelMr: "तक्रारी सोडवल्या" },
    { value: "45+", label: "Ongoing Works", labelMr: "चालू कामे" },
    { value: "12", label: "Booths Covered", labelMr: "बूथ कव्हर" },
    { value: "50,000+", label: "Citizens Served", labelMr: "नागरिक सेवित" },
  ];

  return (
    <section className="py-16 lg:py-20 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Our Impact in Numbers
          </h2>
          <p className="text-muted-foreground">आमच्या सेवेचे परिणाम</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card text-center"
            >
              <p className="text-3xl lg:text-4xl font-bold text-accent mb-2">{stat.value}</p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.labelMr}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RecentWorks = () => {
  const works = [
    {
      title: "Road Repair Work",
      location: "Main Market Area",
      progress: 85,
      status: "In Progress",
    },
    {
      title: "Street Light Installation",
      location: "Sector 5 Colony",
      progress: 100,
      status: "Completed",
    },
    {
      title: "Drainage System Upgrade",
      location: "Near Railway Station",
      progress: 60,
      status: "In Progress",
    },
  ];

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Development Works
            </h2>
            <p className="text-muted-foreground">विकास कामांची प्रगती</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/works">
              View All Works
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HardHat className="h-6 w-6 text-primary" />
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${work.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-accent/10 text-accent"
                    }`}
                >
                  {work.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{work.title}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                <MapPin className="h-4 w-4" />
                {work.location}
              </div>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Patil",
      text: "My water supply issue was resolved within 48 hours. The tracking system kept me informed throughout.",
      location: "Booth 3",
    },
    {
      name: "Sunita Sharma",
      text: "The new digital grievance system has made it so easy to report issues. Very responsive team!",
      location: "Booth 7",
    },
    {
      name: "Mohammad Khan",
      text: "Street lights in our area were installed promptly after filing complaint. Great service!",
      location: "Booth 5",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            What Citizens Say
          </h2>
          <p className="text-primary-foreground/70">नागरिकांचे मत</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-primary-foreground/90 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-primary-foreground/60">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="bg-gradient-to-r from-accent to-orange-500 rounded-3xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Have a Concern? We're Here to Help!
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            आपली तक्रार नोंदवा आणि आमच्या कार्यालयाशी संपर्क साधा। Register your complaint today
            and let us work together for a better community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-accent hover:bg-white/90" asChild>
              <Link to="/grievance">Register Complaint Now</Link>
            </Button>
            <Button size="lg" variant="hero-outline" asChild>
              <Link to="/contact">Contact Office</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <>
      <HeroSection />
      <QuickActions />
      {/* <StatsSection /> */}
      {/* <RecentWorks /> */}
      <Testimonials />
      <CTASection />
    </>
  );
};

export default Index;
