import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Shield, Calendar, User } from 'lucide-react';

export function ProfileView() {
  const { user } = useAuthStore();

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your account information and role details.</p>
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-500" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 -mt-10 shadow-lg">
            <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="mt-3">
            <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <Badge className="mt-2 bg-blue-600 capitalize">{user?.role?.replace('_', ' ') || 'user'}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Mail, label: 'Email', value: user?.email || '—' },
          { icon: Shield, label: 'Role', value: user?.role?.replace('_', ' ') || '—' },
          { icon: User, label: 'Status', value: user?.status || 'active' },
          { icon: Calendar, label: 'Member since', value: joined },
        ].map((item) => (
          <Card key={item.label} className="border border-slate-100 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm font-semibold capitalize">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account Security</CardTitle>
          <CardDescription>Password and authentication settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-500">
          <p>Contact your system administrator to change your password or update account permissions.</p>
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <Shield size={16} /> Session active
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
