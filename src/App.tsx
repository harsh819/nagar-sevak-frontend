import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./lib/TenantContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Grievance from "./pages/Grievance";
import Track from "./pages/Track";
import Works from "./pages/Works";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Complaints from "./pages/admin/Complaints";
import Staff from "./pages/admin/Staff";
import Tasks from "./pages/admin/Tasks";
import DevelopmentWorks from "./pages/admin/DevelopmentWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => (
  <Routes>
    {/* Multi-tenant Routes */}
    <Route path="/office/:slug" element={<Layout><Index /></Layout>} />
    <Route path="/office/:slug/grievance" element={<Layout><Grievance /></Layout>} />
    <Route path="/office/:slug/track" element={<Layout><Track /></Layout>} />
    <Route path="/office/:slug/works" element={<Layout><Works /></Layout>} />
    <Route path="/office/:slug/about" element={<Layout><About /></Layout>} />
    <Route path="/office/:slug/contact" element={<Layout><Contact /></Layout>} />

    {/* Fallback to default or show office selector */}
    <Route path="/" element={<Layout><Index /></Layout>} />
    <Route path="/grievance" element={<Layout><Grievance /></Layout>} />
    <Route path="/track" element={<Layout><Track /></Layout>} />
    <Route path="/works" element={<Layout><Works /></Layout>} />
    <Route path="/about" element={<Layout><About /></Layout>} />
    <Route path="/contact" element={<Layout><Contact /></Layout>} />
    <Route path="/auth" element={<Layout><Auth /></Layout>} />

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="complaints" element={<Complaints />} />
      <Route path="staff" element={<Staff />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="works" element={<DevelopmentWorks />} />
    </Route>

    <Route path="*" element={<Layout><NotFound /></Layout>} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TenantProvider>
          <AppContent />
        </TenantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
