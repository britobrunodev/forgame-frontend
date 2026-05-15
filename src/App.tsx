import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import ClassSchedule from "./pages/ClassSchedule.tsx";
import ChampionshipRegistration from "./pages/ChampionshipRegistration.tsx";
import Bookings from "./pages/Bookings.tsx";
import ManagementDashboard from "./pages/ManagementDashboard.tsx";
import ManagementChampionships from "./pages/ManagementChampionships.tsx";
import ManagementChampionshipApprovals from "./pages/ManagementChampionshipApprovals.tsx";
import ManagementChampionshipUsers from "./pages/ManagementChampionshipUsers.tsx";
import ManagementComplexUsers from "./pages/ManagementComplexUsers.tsx";
import ManagementPayments from "./pages/ManagementPayments.tsx";
import ManagementClasses from "./pages/ManagementClasses.tsx";
import ManagementClassCreate from "./pages/ManagementClassCreate.tsx";
import ManagementClassEdit from "./pages/ManagementClassEdit.tsx";
import ManagementCourtEdit from "./pages/ManagementCourtEdit.tsx";
import ChampionshipSettings from "./pages/ChampionshipSettings.tsx";
import ManagementUsers from "./pages/ManagementUsers.tsx";
import ManagementAdminAccess from "./pages/ManagementAdminAccess.tsx";
import AdminApprovals from "./pages/AdminApprovals.tsx";
import AdminComplexes from "./pages/AdminComplexes.tsx";
import ManagementHub from "./pages/ManagementHub.tsx";
import AdminHub from "./pages/AdminHub.tsx";
import TournamentSettings from "./pages/TournamentSettings.tsx";
import SportComplexesManagement from "./pages/SportComplexesManagement.tsx";
import SportComplexSettings from "./pages/SportComplexSettings.tsx";
import CourtCreate from "./pages/CourtCreate.tsx";
import ComplexPreferences from "./pages/ComplexPreferences.tsx";
import StudentsManagement from "./pages/StudentsManagement.tsx";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import { SessionProvider } from "./session.tsx";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID ?? '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('Google client ID is not configured. Google login will be unavailable until this is set.');
}

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'not-configured'}>
    {children}
  </GoogleOAuthProvider>
);

const App = () => (
  <AppProviders>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <SessionProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
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
                <Route path="/reservations/complexes/:complexId" element={<ReservationDetail />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/:paymentId" element={<Payment />} />
                <Route path="/payment/:paymentId/success" element={<PaymentSuccess />} />
                <Route path="/schedule" element={<Navigate to="/bookings" replace />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/management" element={<ManagementHub />} />
                <Route path="/management/courts" element={<ManagementDashboard />} />
                <Route path="/management/approvals" element={<ManagementApprovals />} />
                <Route path="/management/championships" element={<ManagementChampionships />} />
                <Route path="/management/championships/payments" element={<ManagementPayments />} />
                <Route path="/management/championships/users" element={<ManagementChampionshipUsers />} />
                <Route path="/management/classes" element={<ManagementClasses />} />
                <Route path="/management/classes/new" element={<ManagementClassCreate />} />
                <Route path="/management/classes/:id/edit" element={<ManagementClassEdit />} />
                <Route path="/management/courts/new" element={<CourtCreate />} />
                <Route path="/management/courts/:id/edit" element={<ManagementCourtEdit />} />
                <Route path="/management/championships/new" element={<ChampionshipSettings />} />
                <Route path="/management/championships/:championshipId/edit" element={<ChampionshipSettings />} />
                <Route path="/management/championships/:championshipId/approvals" element={<ManagementChampionshipApprovals />} />
                <Route path="/management/users" element={<ManagementUsers />} />
                <Route path="/admin/access" element={<ManagementAdminAccess />} />
                <Route path="/admin" element={<AdminHub />} />
                <Route path="/admin/approvals" element={<AdminApprovals />} />
                <Route path="/admin/complexes" element={<AdminComplexes />} />
                <Route path="/management/payments" element={<ManagementPayments />} />
                <Route path="/management/complexes" element={<SportComplexesManagement />} />
                <Route path="/management/complexes/payments" element={<ManagementPayments />} />
                <Route path="/management/complexes/users" element={<ManagementComplexUsers />} />
                <Route path="/management/complexes/new" element={<SportComplexSettings />} />
                <Route path="/management/complexes/:complexId/edit" element={<SportComplexSettings />} />
                <Route path="/management/complexes/:complexId/preferences" element={<ComplexPreferences />} />
                <Route path="/management/students" element={<StudentsManagement />} />
                <Route path="/settings" element={<TournamentSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppProviders>
);

export default App;
