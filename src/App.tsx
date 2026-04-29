import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChampionshipDetail from "./pages/ChampionshipDetail";
import Championships from "./pages/Championships";
import Reservations from "./pages/Reservations";
import SportPage from "./pages/SportPage";
import Schedule from "./pages/Schedule";
import ManagementDashboard from "./pages/ManagementDashboard";
import TournamentSettings from "./pages/TournamentSettings";
import SportComplexSettings from "./pages/SportComplexSettings";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/championships" element={<Championships />} />
            <Route path="/championships/:id" element={<ChampionshipDetail />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/sports/:sportId" element={<SportPage />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/management" element={<ManagementDashboard />} />
            <Route path="/settings" element={<TournamentSettings />} />
            <Route path="/settings/complex" element={<SportComplexSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
