import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChampionshipDetail from "./pages/ChampionshipDetail";
import Championships from "./pages/Championships";
import Reservations from "./pages/Reservations";
import ReservationDetail from "./pages/ReservationDetail";
import Payment from "./pages/Payment";
import ClassSchedule from "./pages/ClassSchedule";
import ChampionshipRegistration from "./pages/ChampionshipRegistration";
import SportPage from "./pages/SportPage";
import Schedule from "./pages/Schedule";
import ManagementDashboard from "./pages/ManagementDashboard";
import ManagementChampionships from "./pages/ManagementChampionships";
import ManagementPayments from "./pages/ManagementPayments";
import TournamentSettings from "./pages/TournamentSettings";
import SportComplexesManagement from "./pages/SportComplexesManagement";
import SportComplexSettings from "./pages/SportComplexSettings";
import CourtCreate from "./pages/CourtCreate";
import ComplexPreferences from "./pages/ComplexPreferences";
import StudentsManagement from "./pages/StudentsManagement";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound.tsx";
import { SessionProvider } from "./session";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/championships" element={<Championships />} />
              <Route path="/championships/:id" element={<ChampionshipDetail />} />
              <Route path="/championships/:id/register" element={<ChampionshipRegistration />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/reservations/classes" element={<ClassSchedule />} />
              <Route path="/reservations/:placeId" element={<ReservationDetail />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/sports/:sportId" element={<SportPage />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/management" element={<ManagementDashboard />} />
              <Route path="/management/championships" element={<ManagementChampionships />} />
              <Route path="/management/payments" element={<ManagementPayments />} />
              <Route path="/management/courts/new" element={<CourtCreate />} />
              <Route path="/management/preferences" element={<ComplexPreferences />} />
              <Route path="/management/students" element={<StudentsManagement />} />
              <Route path="/settings" element={<TournamentSettings />} />
              <Route path="/settings/complex" element={<SportComplexesManagement />} />
              <Route path="/settings/complex/new" element={<SportComplexSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
