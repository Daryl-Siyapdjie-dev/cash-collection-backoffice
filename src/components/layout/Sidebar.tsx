import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Building2,
  Radio,
  MapPin,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import logo from '../../assets/logo.png';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Transactions', href: '/transactions', icon: Receipt },
  { title: 'Agents', href: '/agents', icon: Users },
  { title: 'Dealers', href: '/dealers', icon: Building2 },
  { title: 'Operators', href: '/operators', icon: Radio },
  { title: 'Zones', href: '/zones', icon: MapPin },
  { title: 'Users', href: '/users', icon: UserCog, roles: ['ADMIN'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b px-6">
          <img src={logo} alt="Afriland First Bank" className="h-12 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;

            // Role-based filtering
            if (item.roles && user) {
              // In a real app, check user roles here
              // For now, we'll show all items
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.displayName || user?.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
