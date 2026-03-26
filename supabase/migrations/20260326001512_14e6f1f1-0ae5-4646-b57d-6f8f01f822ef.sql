
-- CECRL levels enum
CREATE TYPE public.cecrl_level AS ENUM ('alpha', 'post_alpha', 'a1', 'a2', 'b1');

-- FLE module categories
CREATE TYPE public.fle_category AS ENUM ('quotidien', 'professionnel');

-- Exercise types
CREATE TYPE public.fle_exercise_type AS ENUM (
  'listen_repeat', 'listen_choose', 'oral_answer', 'vocal_recognition',
  'image_word_audio', 'reformulate', 'complete_dialogue', 'role_play',
  'interview_sim', 'safety_instruction', 'vocal_dialogue'
);

-- FLE Modules catalogue
CREATE TABLE public.fle_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category fle_category NOT NULL DEFAULT 'quotidien',
  cecrl_level cecrl_level NOT NULL DEFAULT 'a1',
  theme TEXT NOT NULL,
  sector TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '📖',
  duration_minutes INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  prerequisites UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fle_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active modules" ON public.fle_modules FOR SELECT USING (is_active = true);

-- FLE Exercises within modules
CREATE TABLE public.fle_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.fle_modules(id) ON DELETE CASCADE,
  exercise_type fle_exercise_type NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  prompt_text TEXT,
  prompt_audio_url TEXT,
  correct_answer TEXT,
  choices JSONB DEFAULT '[]',
  image_url TEXT,
  hint_text TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fle_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" ON public.fle_exercises FOR SELECT USING (true);

-- User FLE progress
CREATE TABLE public.fle_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estimated_level cecrl_level DEFAULT 'a1',
  total_xp INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  phrases_mastered INTEGER DEFAULT 0,
  oral_score INTEGER DEFAULT 0,
  comprehension_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  preferred_category fle_category DEFAULT 'quotidien',
  target_sector TEXT,
  total_time_minutes INTEGER DEFAULT 0,
  placement_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.fle_user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.fle_user_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own progress" ON public.fle_user_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.fle_user_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Module completion tracking
CREATE TABLE public.fle_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.fle_modules(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  exercises_done INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.fle_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own module progress" ON public.fle_module_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own module progress" ON public.fle_module_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own module progress" ON public.fle_module_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Exercise results
CREATE TABLE public.fle_exercise_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.fle_exercises(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.fle_modules(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN DEFAULT false,
  oral_score INTEGER,
  attempt_number INTEGER DEFAULT 1,
  time_spent_seconds INTEGER DEFAULT 0,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fle_exercise_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON public.fle_exercise_results FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own results" ON public.fle_exercise_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Admin policies for all FLE tables
CREATE POLICY "Admins can manage modules" ON public.fle_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage exercises" ON public.fle_exercises FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all progress" ON public.fle_user_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all module progress" ON public.fle_module_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all results" ON public.fle_exercise_results FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_fle_modules_updated_at BEFORE UPDATE ON public.fle_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fle_user_progress_updated_at BEFORE UPDATE ON public.fle_user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fle_module_progress_updated_at BEFORE UPDATE ON public.fle_module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
