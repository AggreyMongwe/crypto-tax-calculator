import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, HelpCircle, FileText, LogOut, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { user, signOut } = useAuth();

  // Get initials from email (e.g., "no" from nozipho)
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 bg-[#A6DDDF]/80 backdrop-blur-md border-b border-[#017792]/20 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
            <div className="h-10 w-10 rounded-xl bg-[#00C853] flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
              <Calculator className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="font-sans font-extrabold text-xl text-[#664A48] tracking-tight">
                <span className="font-serif">TaxTim</span>{' '}
                <span className="text-[#017792] font-bold">Crypto</span>
              </h1>
              <p className="text-[10px] uppercase font-bold text-[#664A48]/60">SARS-Compliant FIFO</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex gap-1 mr-4">
              {user && <HeaderNav to="/sessions" icon={<History size={16} />} label="History" />}
              <HeaderNav to="/docs" icon={<FileText size={16} />} label="Docs" />
              <HeaderNav to="/help" icon={<HelpCircle size={16} />} label="Help" />
            </nav>

            {user ? (
              <div className="flex items-center gap-3 bg-white/40 p-1 pl-3 rounded-full border border-white/50 shadow-inner">
                <Avatar className="h-8 w-8 border-2 border-[#00C853] shadow-sm">
                  <AvatarFallback className="bg-[#017792] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-[#E35335] hover:bg-red-50 rounded-full h-8 w-8 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-[#00C853] hover:bg-[#E35335] text-white shadow-lg font-bold rounded-full px-6 transition-all">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderNav({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="text-[#664A48] hover:bg-white/60 hover:text-[#017792] font-semibold rounded-lg transition-colors">
      <Link to={to} className="gap-2">{icon} {label}</Link>
    </Button>
  );
}