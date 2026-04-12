-- 1. Création de la table des profils (si elle n'existe pas)
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

-- 2. Création de la table des portefeuilles
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

-- 3. Création de la table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL,
    type TEXT NOT NULL, -- 'deposit', 'withdraw', 'transfer', etc.
    status TEXT DEFAULT 'pending',
    description TEXT,
    receiver_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. Nettoyage et Création des politiques de sécurité pour les profils
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Déclencheur automatique pour créer un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Politiques de sécurité pour les portefeuilles (Wallets)
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres portefeuilles" ON wallets;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres portefeuilles" 
ON wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres portefeuilles" ON wallets;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres portefeuilles" 
ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres portefeuilles" ON wallets;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres portefeuilles" 
ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- 8. Politiques de sécurité pour les transactions
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres transactions" ON transactions;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres transactions" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres transactions" ON transactions;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres transactions" 
ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
