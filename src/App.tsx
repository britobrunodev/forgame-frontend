import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import PendingApproval from "./pages/PendingApproval.tsx";
import ManagementApprovals from "./pages/ManagementApprovals.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ChampionshipDetail from "./pages/ChampionshipDetail.tsx";
import Championships from "./pages/Championships.tsx";
import Reservations from "./pages/Reservations.tsx";
import ReservationDetail from "./pages/ReservationDetail.tsx";
import Payment from "./pages/Payment.tsx";
import ClassSchedule from "./pages/ClassSchedule.tsx";
import ChampionshipRegistration from "./pages/ChampionshipRegistration.tsx";
import SportPage from "./pages/SportPage.tsx";
import Schedule from "./pages/Schedule.tsx";
import ManagementDashboard from "./pages/ManagementDashboard.tsx";
import ManagementChampionships from "./pages/ManagementChampionships.tsx";
import ManagementPayments from "./pages/ManagementPayments.tsx";
import ManagementClasses from "./pages/ManagementClasses.tsx";
import ManagementClassCreate from "./pages/ManagementClassCreate.tsx";
import ManagementClassEdit from "./pages/ManagementClassEdit.tsx";
import ManagementCourtEdit from "./pages/ManagementCourtEdit.tsx";
import ManagementChampionshipEdit from "./pages/ManagementChampionshipEdit.tsx";
import ManagementUsers from "./pages/ManagementUsers.tsx";
import TournamentSettings from "./pages/TournamentSettings.tsx";
import SportComplexesManagement from "./pages/SportComplexesManagement.tsx";
import SportComplexSettings from "./pages/SportComplexSettings.tsx";
import CourtCreate from "./pages/CourtCreate.tsx";
import ComplexPreferences from "./pages/ComplexPreferences.tsx";
import StudentsManagement from "./pages/StudentsManagement.tsx";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import NotFound from "./pages/NotFound.tsx";
import { SessionProvider } from "./session.tsx";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not configured. Google login will be unavailable until this is set.');
}

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
};

const App = () => (
  <AppProviders>
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
              <Route path="/pending-approval" element={<PendingApproval />} />
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
                <Route path="/management/approvals" element={<ManagementApprovals />} />
                <Route path="/management/championships" element={<ManagementChampionships />} />
                <Route path="/management/classes" element={<ManagementClasses />} />
                <Route path="/management/classes/new" element={<ManagementClassCreate />} />
                <Route path="/management/classes/:id/edit" element={<ManagementClassEdit />} />
                <Route path="/management/courts/new" element={<CourtCreate />} />
                <Route path="/management/courts/:id/edit" element={<ManagementCourtEdit />} />
                <Route path="/management/championships/:id/edit" element={<ManagementChampionshipEdit />} />
                <Route path="/management/users" element={<ManagementUsers />} />
                <Route path="/management/payments" element={<ManagementPayments />} />
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
  </AppProviders>
);

export default App;
