import { Bell, Search, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store';
import type { AppView } from '@/components/layout/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SA';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products, customers, invoices..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none ml-1">
            <div className="flex items-center gap-2.5 pl-2 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.displayName || 'User'}</p>
                <Badge variant="outline" className="text-[9px] mt-1 h-4 px-1.5 uppercase tracking-wider">
                  {user?.role?.replace('_', ' ') || 'user'}
                </Badge>
              </div>
              <Avatar className="h-9 w-9 border-2 border-blue-500/20">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{user?.email || 'admin@shop.com'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onNavigate('profile')}>
                <User size={14} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onNavigate('settings')}>
                <Settings size={14} /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500 cursor-pointer">
              <LogOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
