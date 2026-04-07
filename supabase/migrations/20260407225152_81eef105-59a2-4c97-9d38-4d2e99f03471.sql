
-- Add new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'formateur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'directeur';

-- Create enums for new tables
CREATE TYPE public.assignment_status AS ENUM ('a_faire', 'en_cours', 'termine', 'en_retard');
CREATE TYPE public.audio_review_status AS ENUM ('pending', 'validated', 'rework');

-- Add new exercise types
ALTER TYPE public.fle_exercise_type ADD VALUE IF NOT EXISTS 'scenario_tree';
ALTER TYPE public.fle_exercise_type ADD VALUE IF NOT EXISTS 'drag_match';
