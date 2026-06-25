import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { RoleRoute } from "@/components/RoleRoute";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import TrackPage from "./pages/TrackPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChat from "./pages/AdminChat";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ReviewsPage from "./pages/ReviewsPage";
import FaqPage from "./pages/FaqPage";
import PricingPage from "./pages/PricingPage";
import CoveragePage from "./pages/CoveragePage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import CreateAdmin from "./pages/CreateAdmin";
import AdminSpaceDashboard from "./pages/AdminSpaceDashboard";
import NewClient from "./pages/NewClient";
import ClientDetail from "./pages/ClientDetail";
import AdminSettings from "./pages/AdminSettings";
import AdminMessages from "./pages/AdminMessages";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
      <AuthProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/coverage" element={<CoveragePage />} />
            {/* Unified RBAC login */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            {/* Super admin */}
            <Route path="/super-admin/dashboard" element={<RoleRoute role="super_admin"><SuperAdminDashboard /></RoleRoute>} />
            <Route path="/super-admin/create-admin" element={<RoleRoute role="super_admin"><CreateAdmin /></RoleRoute>} />
            {/* Admin personal space */}
            <Route path="/admin/dashboard" element={<RoleRoute role="admin"><AdminSpaceDashboard /></RoleRoute>} />
            <Route path="/admin/clients/new" element={<RoleRoute role="admin"><NewClient /></RoleRoute>} />
            <Route path="/admin/clients/:id" element={<RoleRoute role="admin"><ClientDetail /></RoleRoute>} />
            <Route path="/admin/messages" element={<RoleRoute role="admin"><AdminMessages /></RoleRoute>} />
            <Route path="/admin/settings" element={<RoleRoute role="admin"><AdminSettings /></RoleRoute>} />
            {/* Legacy shipment tools (kept for existing data) */}
            <Route path="/legacy-admin/login" element={<AdminLogin />} />
            <Route path="/legacy-admin" element={<AdminDashboard />} />
            <Route path="/legacy-admin/chat" element={<AdminChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AppProvider>
      </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
