import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      }
    } catch (err: any) {
      if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Try logging in instead.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md space-y-8">

        {/* Animated Logo Section */}
        <div className="text-center space-y-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="mx-auto h-16 w-16 rounded-2xl bg-[#017792] flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(1,119,146,0.5)]"
          >
            <Calculator className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-[#664A48] tracking-tight">
              TaxTim <span className="text-[#017792]">Crypto</span>
            </h1>
            <p className="text-sm font-bold text-[#664A48]/50 uppercase tracking-widest">
              SARS-Compliant FIFO Engine
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-black text-[#664A48]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="font-medium text-[#664A48]/60">
              {isLogin ? 'Sign in to sync your calculations' : 'Start tracking your crypto taxes today'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[#664A48] font-bold ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#017792]" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-[#F8F8F8] border-[#A6DDDF] focus:ring-[#017792] focus-visible:ring-[#017792]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#664A48] font-bold ml-1">Secure Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#017792]" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-[#F8F8F8] border-[#A6DDDF] focus:ring-[#017792] focus-visible:ring-[#017792]"
                    required
                  />
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert className="bg-[#8C9F8B]/10 border-[#8C9F8B] rounded-xl text-[#664A48]">
                    <ShieldCheck className="h-4 w-4 text-[#8C9F8B]" />
                    <AlertDescription className="font-bold">{message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-[#017792] hover:bg-[#015f75] text-white text-lg font-black rounded-2xl shadow-xl transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up Free')}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMessage(null);
                }}
                className="text-[#017792] hover:text-[#664A48] font-black text-sm transition-colors underline underline-offset-4"
              >
                {isLogin ? "Need an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-bold text-[#664A48]/40 uppercase tracking-widest">
          SARS Compliant • Secure • FIFO Logic
        </p>
      </div>
    </div>
  );
}