import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  History, 
  Trash2, 
  Upload, 
  Calendar, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SessionWithStats extends Session {
  transaction_count: number;
  coins: string[];
  total_gain_loss: number;
}

export default function Sessions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteSession, setDeleteSession] = useState<Session | null>(null);

  // Fetch sessions with transaction stats
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('transaction_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch stats for each session
      const sessionsWithStats: SessionWithStats[] = await Promise.all(
        (sessionsData || []).map(async (session) => {
          // Get transaction count and coins
          const { data: transactions } = await supabase
            .from('transactions')
            .select('coin')
            .eq('session_id', session.id);

          // Get calculated results for gain/loss
          const { data: results } = await supabase
            .from('calculated_results')
            .select('realized_gain_or_loss')
            .eq('session_id', session.id);

          const coins = [...new Set(transactions?.map(t => t.coin) || [])];
          const totalGainLoss = results?.reduce((sum, r) => sum + Number(r.realized_gain_or_loss), 0) || 0;

          return {
            ...session,
            transaction_count: transactions?.length || 0,
            coins,
            total_gain_loss: totalGainLoss,
          };
        })
      );

      return sessionsWithStats;
    },
    enabled: !!user,
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      // Delete in order due to foreign keys
      await supabase.from('calculated_results').delete().eq('session_id', sessionId);
      await supabase.from('transactions').delete().eq('session_id', sessionId);
      const { error } = await supabase.from('transaction_sessions').delete().eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setDeleteSession(null);
    },
  });

  // Handle loading session
  const handleLoadSession = async (sessionId: string) => {
    // Store session ID to load in Index page
    sessionStorage.setItem('loadSessionId', sessionId);
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert>
            <AlertDescription>
              Please <Link to="/auth" className="text-primary hover:underline font-medium">sign in</Link> to view your saved sessions.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Saved Sessions
                </h1>
                <p className="text-muted-foreground text-sm">
                  View, load, or delete your saved transaction imports
                </p>
              </div>
            </div>
            <Link to="/">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                New Import
              </Button>
            </Link>
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load sessions. Please try again.</AlertDescription>
            </Alert>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.created_at).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadSession(session.id)}
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteSession(session)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Transactions:</span>
                        <span className="font-medium">{session.transaction_count}</span>
                      </div>
                      {session.coins.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{session.coins.join(', ')}</span>
                        </div>
                      )}
                      {session.total_gain_loss !== 0 && (
                        <div className={`flex items-center gap-1 ${session.total_gain_loss >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {session.total_gain_loss >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            R {Math.abs(session.total_gain_loss).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Saved Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Import your first set of transactions to get started
                </p>
                <Link to="/">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSession?.name}"? This will permanently remove
              all transactions and calculated results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSession && deleteMutation.mutate(deleteSession.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
