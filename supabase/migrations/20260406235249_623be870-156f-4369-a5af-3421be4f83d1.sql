
-- 1. Add columns to fle_user_progress
ALTER TABLE public.fle_user_progress
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS weekly_xp_target integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS badges_earned jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS daily_mission_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_streak_date date;

-- 2. Create fle_badges table
CREATE TABLE public.fle_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '🏅',
  category text NOT NULL DEFAULT 'general',
  condition_type text NOT NULL,
  condition_value integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fle_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view badges"
  ON public.fle_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.fle_badges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Create fle_user_badges table
CREATE TABLE public.fle_user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_key text NOT NULL REFERENCES public.fle_badges(key) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

ALTER TABLE public.fle_user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.fle_user_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own badges"
  ON public.fle_user_badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all user badges"
  ON public.fle_user_badges FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create fle_review_items table
CREATE TABLE public.fle_review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  module_id uuid NOT NULL,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  interval_days integer NOT NULL DEFAULT 1,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  repetitions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE public.fle_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own review items"
  ON public.fle_review_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own review items"
  ON public.fle_review_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own review items"
  ON public.fle_review_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own review items"
  ON public.fle_review_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all review items"
  ON public.fle_review_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Seed badges
INSERT INTO public.fle_badges (key, title, description, icon, category, condition_type, condition_value) VALUES
  ('first_exercise', 'Premier pas', 'Terminer votre premier exercice', '🎯', 'milestone', 'exercises_done', 1),
  ('first_module', 'Module terminé', 'Terminer votre premier module complet', '📗', 'milestone', 'modules_completed', 1),
  ('five_modules', 'Cinq étoiles', 'Terminer 5 modules', '⭐', 'milestone', 'modules_completed', 5),
  ('ten_modules', 'Expert', 'Terminer 10 modules', '🏆', 'milestone', 'modules_completed', 10),
  ('streak_3', 'Régulier', '3 jours consécutifs', '🔥', 'streak', 'streak_days', 3),
  ('streak_7', 'Assidu', '7 jours consécutifs', '💪', 'streak', 'streak_days', 7),
  ('streak_14', 'Inarrêtable', '14 jours consécutifs', '🚀', 'streak', 'streak_days', 14),
  ('streak_30', 'Champion', '30 jours consécutifs', '👑', 'streak', 'streak_days', 30),
  ('xp_100', 'Centenaire', 'Gagner 100 XP', '💯', 'xp', 'total_xp', 100),
  ('xp_500', 'Demi-mille', 'Gagner 500 XP', '🌟', 'xp', 'total_xp', 500),
  ('xp_1000', 'Millionnaire', 'Gagner 1000 XP', '💎', 'xp', 'total_xp', 1000),
  ('oral_80', 'Bon orateur', 'Score oral supérieur à 80%', '🗣️', 'skill', 'oral_score', 80),
  ('comprehension_80', 'Bonne écoute', 'Score compréhension supérieur à 80%', '👂', 'skill', 'comprehension_score', 80),
  ('words_50', 'Vocabulaire', 'Apprendre 50 mots', '📚', 'vocabulary', 'words_learned', 50),
  ('words_200', 'Dictionnaire', 'Apprendre 200 mots', '📖', 'vocabulary', 'words_learned', 200);
