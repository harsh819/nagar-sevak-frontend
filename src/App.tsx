import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout><Index /></Layout>} path="/" />
          <Route element={<Layout><Grievance /></Layout>} path="/grievance" />
          <Route element={<Layout><Track /></Layout>} path="/track" />
          <Route element={<Layout><Works /></Layout>} path="/works" />
          <Route element={<Layout><About /></Layout>} path="/about" />
          <Route element={<Layout><Contact /></Layout>} path="/contact" />
          <Route element={<Layout><Auth /></Layout>} path="/auth" />
          
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
