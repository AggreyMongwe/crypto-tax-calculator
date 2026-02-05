-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create transaction_sessions table to group transaction imports
CREATE TABLE public.transaction_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Session',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transaction_sessions
ALTER TABLE public.transaction_sessions ENABLE ROW LEVEL SECURITY;

-- Transaction sessions policies
CREATE POLICY "Users can view their own sessions" 
  ON public.transaction_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.transaction_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.transaction_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.transaction_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create transactions table for storing raw transaction data
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.transaction_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'TRADE')),
  coin TEXT NOT NULL,
  amount DECIMAL(20, 10) NOT NULL,
  price_per_unit DECIMAL(18, 2) NOT NULL,
  total_value DECIMAL(18, 2) NOT NULL,
  fee DECIMAL(18, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create calculated_results table for storing FIFO calculation results
CREATE TABLE public.calculated_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.transaction_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year TEXT NOT NULL,
  coin TEXT NOT NULL,
  total_bought DECIMAL(20, 10) NOT NULL DEFAULT 0,
  total_sold DECIMAL(20, 10) NOT NULL DEFAULT 0,
  current_balance DECIMAL(20, 10) NOT NULL DEFAULT 0,
  total_cost_basis DECIMAL(18, 2) NOT NULL DEFAULT 0,
  total_proceeds DECIMAL(18, 2) NOT NULL DEFAULT 0,
  realized_gain_or_loss DECIMAL(18, 2) NOT NULL DEFAULT 0,
  unrealized_cost_basis DECIMAL(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, tax_year, coin)
);

-- Enable RLS on calculated_results
ALTER TABLE public.calculated_results ENABLE ROW LEVEL SECURITY;

-- Calculated results policies
CREATE POLICY "Users can view their own results" 
  ON public.calculated_results FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own results" 
  ON public.calculated_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results" 
  ON public.calculated_results FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results" 
  ON public.calculated_results FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_transactions_session_id ON public.transactions(session_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_calculated_results_session_id ON public.calculated_results(session_id);
CREATE INDEX idx_calculated_results_tax_year ON public.calculated_results(tax_year);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transaction_sessions_updated_at
  BEFORE UPDATE ON public.transaction_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();