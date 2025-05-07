
-- Création de la table articles
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter des politiques RLS pour les articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de lire tous les articles publiés
CREATE POLICY "Tous peuvent voir les articles publiés" ON public.articles
    FOR SELECT USING (published = true);

-- Politique permettant aux utilisateurs de voir leurs propres articles (publiés ou non)
CREATE POLICY "Les utilisateurs peuvent voir leurs propres articles" ON public.articles
    FOR SELECT USING (auth.uid() = user_id);

-- Politique permettant aux utilisateurs de créer leurs propres articles
CREATE POLICY "Les utilisateurs peuvent créer leurs propres articles" ON public.articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique permettant aux utilisateurs de mettre à jour leurs propres articles
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres articles" ON public.articles
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique permettant aux utilisateurs de supprimer leurs propres articles
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres articles" ON public.articles
    FOR DELETE USING (auth.uid() = user_id);

-- Politique permettant aux administrateurs de tout voir et modifier
CREATE POLICY "Les administrateurs peuvent tout gérer" ON public.articles
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'administrateur'
        )
    );

-- Ajout d'un trigger pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION update_articles_updated_at();

-- Création d'une relation entre articles et profils
ALTER TABLE public.articles ADD CONSTRAINT fk_articles_profiles
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
