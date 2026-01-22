import { Award, Users, Target, Heart } from "lucide-react";
import heroImage from "@/assets/hero-leader.jpg";

const achievements = [
  { icon: Award, label: "Years of Service", value: "15+" },
  { icon: Users, label: "Citizens Served", value: "50,000+" },
  { icon: Target, label: "Projects Completed", value: "200+" },
  { icon: Heart, label: "Community Programs", value: "75+" },
];

const About = () => {
  return (
    <div className="py-12 lg:py-16">
      <div className="container">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">About Your Nagar Sevak</span>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6">
              Dedicated to <span className="text-accent">Public Service</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              जनतेच्या सेवेसाठी समर्पित। With over 15 years of public service experience, 
              our Nagar Sevak has been at the forefront of transforming Ward 45 into 
              a model community with better infrastructure, cleaner streets, and 
              responsive governance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The vision is simple yet powerful: "जनसेवा प्रथम" - Public Service First. 
              Every decision, every project, and every initiative is driven by the 
              singular goal of improving the quality of life for every citizen in the ward.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Nagar Sevak"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground rounded-xl p-6 shadow-lg">
              <p className="text-3xl font-bold">Ward 45</p>
              <p className="text-sm opacity-90">Mumbai Municipal Corporation</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-card text-center"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-7 w-7 text-accent" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-primary-foreground/90 leading-relaxed mb-4">
              To create a ward that stands as a model of good governance, sustainable 
              development, and citizen-centric services. We envision a community where 
              every citizen has access to basic amenities, clean surroundings, and a 
              responsive administration.
            </p>
            <p className="text-primary-foreground/80 text-sm italic">
              "एक विकसित, स्वच्छ आणि नागरिक-केंद्रित वार्ड निर्माण करणे"
            </p>
          </div>
          <div className="bg-accent text-accent-foreground rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-accent-foreground/90 leading-relaxed mb-4">
              To serve the citizens with transparency, accountability, and efficiency. 
              Our mission is to resolve grievances promptly, execute development projects 
              on time, and maintain open communication with the community through digital 
              and in-person channels.
            </p>
            <p className="text-accent-foreground/80 text-sm italic">
              "पारदर्शकता, जबाबदारी आणि कार्यक्षमतेने नागरिकांची सेवा"
            </p>
          </div>
        </div>

        {/* Leadership Message */}
        <div className="bg-secondary rounded-2xl p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 border-4 border-accent">
              <img
                src={heroImage}
                alt="Nagar Sevak"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-6">A Message from Your Nagar Sevak</h2>
            <blockquote className="text-lg text-muted-foreground leading-relaxed mb-6">
              "माझ्या प्रिय नागरिकांनो, तुमची सेवा करणे हे माझे परम कर्तव्य आहे. 
              या डिजिटल पोर्टलद्वारे, मी तुमच्या समस्या जलद सोडवण्यास आणि विकास 
              कामांची माहिती देण्यास वचनबद्ध आहे. आपण सर्व मिळून एक उत्तम समाज 
              निर्माण करू या."
            </blockquote>
            <p className="text-muted-foreground">
              "Dear citizens, serving you is my highest duty. Through this digital 
              portal, I am committed to resolving your issues quickly and keeping 
              you informed about development works. Together, let us build a better 
              community."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
