-- Supabase Schema for ImpactGolf Platform

-- 1. Custom Types
CREATE TYPE draw_type AS ENUM ('5-match', '4-match', '3-match');
CREATE TYPE draw_status AS ENUM ('simulation', 'published');
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'rejected');
CREATE TYPE sub_status AS ENUM ('active', 'inactive', 'past_due', 'canceled');

-- 2. Extended Users Table (Depends on auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stripe_customer_id TEXT,
  subscription_status sub_status DEFAULT 'inactive',
  charity_id UUID, -- References charities.id
  charity_percentage NUMERIC DEFAULT 10.0 CHECK (charity_percentage >= 10.0 AND charity_percentage <= 100.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Charities Table
CREATE TABLE public.charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles now that charities exists
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_charity FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;

-- 4. Scores Table
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date_played DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function/trigger to enforce the 5-score limit per user
CREATE OR REPLACE FUNCTION maintain_rolling_scores() RETURNS TRIGGER AS $$
BEGIN
  -- Delete all scores for this user except the newest 5 (including the one just inserted)
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY date_played DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_score_limit
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION maintain_rolling_scores();

-- 5. Draws Table
CREATE TABLE public.draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year VARCHAR(7) NOT NULL, -- e.g., '2026-03'
  status draw_status DEFAULT 'simulation',
  total_pool NUMERIC DEFAULT 0,
  active_subscribers_count INTEGER DEFAULT 0,
  winning_numbers INTEGER[] DEFAULT '{}',
  jackpot_carryover NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 6. Winnings Table
CREATE TABLE public.winnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  match_type draw_type NOT NULL,
  prize_amount NUMERIC NOT NULL,
  status payout_status DEFAULT 'pending',
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

-- Basic Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Basic Scores Policies
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- basic Charities Policies
CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT USING (true);
