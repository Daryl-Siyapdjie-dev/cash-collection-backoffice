import { Menu, Bell } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

export function Header() {
  const { toggleSidebar, sidebarOpen } = useAppStore();

  return (
    <header className={cn(
      'fixed top-0 z-30 h-16 border-b bg-background transition-all',
      sidebarOpen ? 'left-64' : 'left-0',
      'right-0'
    )}>
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Cash Collection</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
