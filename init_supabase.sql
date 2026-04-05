-- 1. Table des Profils
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    country_code TEXT DEFAULT 'SN',
    preferred_currency TEXT DEFAULT 'XOF',
    kyc_status TEXT DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Portefeuilles (Wallets)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    currency TEXT NOT NULL,
    balance DECIMAL(20, 2) DEFAULT 0.00,
    country_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- 3. Table des Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL,
    type TEXT NOT NULL, -- 'deposit', 'withdraw', 'transfer'
    status TEXT DEFAULT 'pending',
    description TEXT,
    receiver_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activation de la Sécurité (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Lecture profil personnel" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Mise à jour profil personnel" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lecture portefeuilles personnels" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Lecture transactions personnelles" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- 5. Création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
