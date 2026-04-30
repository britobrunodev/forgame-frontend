import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto animate-fade-in px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  </div>
);
