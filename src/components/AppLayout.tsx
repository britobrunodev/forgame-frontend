import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = () => (
  <div className="min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main className="flex-1 p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  </div>
);
