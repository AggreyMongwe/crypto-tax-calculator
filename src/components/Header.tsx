import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, HelpCircle, FileText, LogIn, LogOut, User, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#A6DDDF]/80 backdrop-blur-md border-b border-[#017792]/20 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
            {/* Calculator Icon with Green Background */}
            <div className="h-10 w-10 rounded-xl bg-[#00C853] flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
              <Calculator className="h-5 w-5 text-white" />
            </div>

            <div>
              {/* TaxTim Name with Custom Font */}
              <h1 className="font-sans font-extrabold text-xl text-[#664A48] tracking-tight">
                <span className="font-[‘Poppins’,sans-serif]">TaxTim</span>{' '}
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
              <div className="flex items-center gap-3">
                <span className="hidden lg:block text-xs font-medium text-[#664A48]">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-[#664A48] hover:bg-[#E6C5C9]/30">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-[#00C853] hover:bg-[#E35335] text-white shadow-pop font-semibold">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-2" /> Sign In</Link>
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
    <Button asChild variant="ghost" size="sm" className="text-[#664A48] hover:bg-white/40">
      <Link to={to} className="gap-2">{icon} {label}</Link>
    </Button>
  );
}
