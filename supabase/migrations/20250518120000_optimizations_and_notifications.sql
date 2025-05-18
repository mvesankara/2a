
-- Ajout d'index pour améliorer les performances

-- Index sur la date des articles pour améliorer le tri et filtrage
CREATE INDEX IF NOT EXISTS idx_articles_date ON public.articles(date);

-- Index sur les utilisateurs des projets pour améliorer les recherches
CREATE INDEX IF NOT EXISTS idx_personal_projects_user_id ON public.personal_projects(user_id);

-- Index sur les dates d'événements pour améliorer les filtres du calendrier
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON public.events(end_date);

-- Ajout de contraintes pour l'intégrité des données

-- Assurer que la date de fin d'un événement est après la date de début
ALTER TABLE public.events ADD CONSTRAINT chk_events_dates CHECK (
    end_date IS NULL OR end_date >= start_date
);

-- Assurer que les projets ont un statut valide
ALTER TABLE public.personal_projects ADD CONSTRAINT chk_personal_projects_status CHECK (
    status IN ('draft', 'in_progress', 'completed', 'archived')
);

-- Création d'une table pour les notifications

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_entity_id UUID,
    related_entity_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_notification_type CHECK (
        type IN ('event', 'project', 'message', 'system', 'article')
    )
);

-- Ajout de politiques RLS pour les notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
    
-- Politique permettant aux utilisateurs de marquer leurs propres notifications comme lues
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Création d'une table pour les catégories

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_category_type CHECK (
        type IN ('article', 'project', 'event')
    )
);

-- Ajout de politiques RLS pour les catégories (visibles par tous)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Politique permettant à tous les utilisateurs de voir les catégories
CREATE POLICY "Tous peuvent voir les catégories" ON public.categories
    FOR SELECT USING (true);
    
-- Politique permettant aux administrateurs de gérer les catégories
CREATE POLICY "Les administrateurs peuvent gérer les catégories" ON public.categories
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'administrateur'
        )
    );

-- Ajout d'une relation entre articles et catégories
CREATE TABLE IF NOT EXISTS public.article_categories (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

-- Ajout de politiques RLS pour les relations article-catégorie
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

-- Politique permettant à tous les utilisateurs de voir les relations article-catégorie
CREATE POLICY "Tous peuvent voir les relations article-catégorie" ON public.article_categories
    FOR SELECT USING (true);
    
-- Politique permettant aux propriétaires d'articles de gérer leurs catégories
CREATE POLICY "Les propriétaires d'articles peuvent gérer leurs catégories" ON public.article_categories
    USING (
        EXISTS (
            SELECT 1 FROM articles
            WHERE articles.id = article_id
            AND articles.user_id = auth.uid()
        )
    );

-- Ajout d'une relation entre projets et catégories
CREATE TABLE IF NOT EXISTS public.project_categories (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- Ajout de politiques RLS pour les relations projet-catégorie
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Politique permettant à tous les utilisateurs de voir les relations projet-catégorie
CREATE POLICY "Tous peuvent voir les relations projet-catégorie" ON public.project_categories
    FOR SELECT USING (true);

-- Insertion de catégories par défaut
INSERT INTO public.categories (name, description, type, color)
VALUES 
    ('Actualités', 'Nouvelles générales de l''association', 'article', '#3B82F6'),
    ('Événements', 'Informations sur les événements à venir', 'article', '#10B981'),
    ('Projets', 'Mises à jour sur les projets en cours', 'article', '#F59E0B'),
    
    ('Social', 'Projets à impact social', 'project', '#3B82F6'),
    ('Environnement', 'Projets environnementaux', 'project', '#10B981'),
    ('Éducation', 'Projets éducatifs', 'project', '#8B5CF6'),
    
    ('Formation', 'Ateliers de formation', 'event', '#3B82F6'),
    ('Réunion', 'Réunions d''équipe ou d''association', 'event', '#F59E0B'),
    ('Social', 'Événements sociaux et de réseautage', 'event', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Création de fonctions pour la gestion des notifications

-- Fonction pour créer une notification système
CREATE OR REPLACE FUNCTION public.create_system_notification(
    user_id UUID,
    title TEXT,
    message TEXT
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (user_id, title, message, 'system')
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une notification d'événement
CREATE OR REPLACE FUNCTION public.create_event_notification(
    user_id UUID,
    event_id UUID,
    title TEXT,
    message TEXT
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, related_entity_id, related_entity_type)
    VALUES (user_id, title, message, 'event', event_id, 'event')
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une notification d'article
CREATE OR REPLACE FUNCTION public.create_article_notification(
    user_id UUID,
    article_id UUID,
    title TEXT,
    message TEXT
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, related_entity_id, related_entity_type)
    VALUES (user_id, title, message, 'article', article_id, 'article')
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour envoyer des notifications lors de la création d'événements
CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS TRIGGER AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Envoi de notification à tous les membres actifs
    FOR profile_record IN SELECT id FROM profiles WHERE status = 'approved' LOOP
        PERFORM public.create_event_notification(
            profile_record.id,
            NEW.id,
            'Nouvel événement: ' || NEW.title,
            'Un nouvel événement a été créé: ' || NEW.title || '. Il aura lieu le ' || 
            to_char(NEW.start_date, 'DD/MM/YYYY')
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_notification_trigger
AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.notify_new_event();

-- Trigger pour envoyer des notifications lors de la publication d'articles
CREATE OR REPLACE FUNCTION public.notify_published_article()
RETURNS TRIGGER AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Seulement envoyer des notifications quand un article est publié
    IF NEW.published = TRUE AND (OLD IS NULL OR OLD.published = FALSE) THEN
        -- Envoi de notification à tous les membres actifs
        FOR profile_record IN SELECT id FROM profiles WHERE status = 'approved' LOOP
            PERFORM public.create_article_notification(
                profile_record.id,
                NEW.id,
                'Nouvel article: ' || NEW.title,
                'Un nouvel article a été publié: ' || NEW.title
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_notification_trigger
AFTER INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.notify_published_article();
