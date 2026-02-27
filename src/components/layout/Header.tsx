import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/lib/TenantContext";

const Header = () => {
  const { office } = useTenant();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home", labelMr: "मुख्यपृष्ठ" },
    // { href: "/about", label: "About", labelMr: "माहिती" },
    { href: "/grievance", label: "Grievance", labelMr: "तक्रार" },
    { href: "/track", label: "Track", labelMr: "स्थिती" },
    { href: "/works", label: "Works", labelMr: "कामे" },
    { href: "/contact", label: "Contact", labelMr: "संपर्क" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-sm">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {office?.phoneNumber || "+91 98765 43210"}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {office?.wardName || "Ward No. 00, City"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/80">EN</span>
            <span className="text-primary-foreground/40">|</span>
            <span className="text-accent font-medium">मराठी</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center overflow-hidden bg-slate-100 border border-slate-200 shadow-sm p-1.5 hover:scale-105 transition-transform">
                {office?.logo ? (
                  <img src={office.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-primary font-black text-sm">{office?.nagarSevakName?.substring(0, 1).toUpperCase() || "N"}</span>
                )}
              </div>
              <div className="flex flex-col -space-y-1">
                <h1 className="text-base lg:text-lg font-black text-primary tracking-tight">
                  {office?.nagarSevakName || "Nagar Sevak"}
                </h1>
                <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {office?.wardName || "Janseva Office"} {office?.wardName ? "Office" : ""}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`transition-colors duration-200 font-medium ${isActive(link.href)
                    ? "text-accent"
                    : "text-foreground/80 hover:text-accent"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Admin Login</Link>
              </Button> */}
              <Button variant="accent" asChild>
                <Link to="/grievance">Register Complaint</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg animate-slide-in-right">
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`py-3 px-4 rounded-lg transition-colors ${isActive(link.href)
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-foreground hover:bg-muted"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <span className="text-muted-foreground ml-2 text-sm">({link.labelMr})</span>
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border">
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/grievance" onClick={() => setIsMenuOpen(false)}>
                    Register Complaint
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
