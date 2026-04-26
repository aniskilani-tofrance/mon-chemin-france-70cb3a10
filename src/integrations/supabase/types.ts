export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      afest_observations: {
        Row: {
          appreciation: number
          commentaire: string | null
          competences: Json
          created_at: string
          formateur_id: string
          id: string
          learner_id: string
          observation_date: string
          situation: string
          updated_at: string
        }
        Insert: {
          appreciation?: number
          commentaire?: string | null
          competences?: Json
          created_at?: string
          formateur_id: string
          id?: string
          learner_id: string
          observation_date?: string
          situation: string
          updated_at?: string
        }
        Update: {
          appreciation?: number
          commentaire?: string | null
          competences?: Json
          created_at?: string
          formateur_id?: string
          id?: string
          learner_id?: string
          observation_date?: string
          situation?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          language: string | null
          page: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          language?: string | null
          page?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          language?: string | null
          page?: string | null
          session_id?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          learner_id: string
          module_id: string
          score: number | null
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          learner_id: string
          module_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          learner_id?: string
          module_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_submissions: {
        Row: {
          audio_url: string
          created_at: string
          exercise_id: string | null
          formateur_comment: string | null
          id: string
          learner_id: string
          module_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["audio_review_status"]
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          exercise_id?: string | null
          formateur_comment?: string | null
          id?: string
          learner_id: string
          module_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["audio_review_status"]
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          exercise_id?: string | null
          formateur_comment?: string | null
          id?: string
          learner_id?: string
          module_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["audio_review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_submissions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "fle_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_submissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_text_version: string
          consent_type: Database["public"]["Enums"]["consent_type"]
          consented: boolean
          consented_at: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          updated_at: string
        }
        Insert: {
          consent_text_version?: string
          consent_type: Database["public"]["Enums"]["consent_type"]
          consented?: boolean
          consented_at?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          updated_at?: string
        }
        Update: {
          consent_text_version?: string
          consent_type?: Database["public"]["Enums"]["consent_type"]
          consented?: boolean
          consented_at?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          request_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          request_type?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          request_type?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          attempts: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          http_status: number | null
          id: string
          metadata: Json
          recipient: string
          source_function: string | null
          status: string
          subject: string | null
          template: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          metadata?: Json
          recipient: string
          source_function?: string | null
          status: string
          subject?: string | null
          template: string
        }
        Update: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          metadata?: Json
          recipient?: string
          source_function?: string | null
          status?: string
          subject?: string | null
          template?: string
        }
        Relationships: []
      }
      fle_badges: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string | null
          icon: string
          id: string
          key: string
          title: string
        }
        Insert: {
          category?: string
          condition_type: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key: string
          title: string
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key?: string
          title?: string
        }
        Relationships: []
      }
      fle_exercise_results: {
        Row: {
          ai_feedback: string | null
          attempt_number: number | null
          created_at: string
          exercise_id: string
          id: string
          is_correct: boolean | null
          module_id: string
          oral_score: number | null
          time_spent_seconds: number | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          attempt_number?: number | null
          created_at?: string
          exercise_id: string
          id?: string
          is_correct?: boolean | null
          module_id: string
          oral_score?: number | null
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          attempt_number?: number | null
          created_at?: string
          exercise_id?: string
          id?: string
          is_correct?: boolean | null
          module_id?: string
          oral_score?: number | null
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fle_exercise_results_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "fle_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fle_exercise_results_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      fle_exercises: {
        Row: {
          choices: Json | null
          correct_answer: string | null
          created_at: string
          difficulty: number | null
          exercise_type: Database["public"]["Enums"]["fle_exercise_type"]
          hint_text: string | null
          id: string
          image_url: string | null
          module_id: string
          prompt_audio_url: string | null
          prompt_text: string | null
          sort_order: number
        }
        Insert: {
          choices?: Json | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: number | null
          exercise_type: Database["public"]["Enums"]["fle_exercise_type"]
          hint_text?: string | null
          id?: string
          image_url?: string | null
          module_id: string
          prompt_audio_url?: string | null
          prompt_text?: string | null
          sort_order?: number
        }
        Update: {
          choices?: Json | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: number | null
          exercise_type?: Database["public"]["Enums"]["fle_exercise_type"]
          hint_text?: string | null
          id?: string
          image_url?: string | null
          module_id?: string
          prompt_audio_url?: string | null
          prompt_text?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "fle_exercises_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      fle_level_history: {
        Row: {
          changed_at: string
          id: string
          level: Database["public"]["Enums"]["cecrl_level"]
          previous_level: Database["public"]["Enums"]["cecrl_level"] | null
          reason: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          level: Database["public"]["Enums"]["cecrl_level"]
          previous_level?: Database["public"]["Enums"]["cecrl_level"] | null
          reason?: string
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          level?: Database["public"]["Enums"]["cecrl_level"]
          previous_level?: Database["public"]["Enums"]["cecrl_level"] | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      fle_module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          exercises_done: number | null
          exercises_total: number | null
          id: string
          module_id: string
          score: number | null
          started_at: string | null
          unlocked: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exercises_done?: number | null
          exercises_total?: number | null
          id?: string
          module_id: string
          score?: number | null
          started_at?: string | null
          unlocked?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exercises_done?: number | null
          exercises_total?: number | null
          id?: string
          module_id?: string
          score?: number | null
          started_at?: string | null
          unlocked?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fle_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      fle_modules: {
        Row: {
          category: Database["public"]["Enums"]["fle_category"]
          cecrl_level: Database["public"]["Enums"]["cecrl_level"]
          created_at: string
          description: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          prerequisites: string[] | null
          sector: string | null
          sort_order: number
          theme: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["fle_category"]
          cecrl_level?: Database["public"]["Enums"]["cecrl_level"]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          sector?: string | null
          sort_order?: number
          theme: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["fle_category"]
          cecrl_level?: Database["public"]["Enums"]["cecrl_level"]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          sector?: string | null
          sort_order?: number
          theme?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fle_review_items: {
        Row: {
          created_at: string
          ease_factor: number
          exercise_id: string
          id: string
          interval_days: number
          module_id: string
          next_review_at: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          exercise_id: string
          id?: string
          interval_days?: number
          module_id: string
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          exercise_id?: string
          id?: string
          interval_days?: number
          module_id?: string
          next_review_at?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fle_sessions: {
        Row: {
          activity_type: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          module_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          module_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          module_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fle_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "fle_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      fle_user_badges: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fle_user_badges_badge_key_fkey"
            columns: ["badge_key"]
            isOneToOne: false
            referencedRelation: "fle_badges"
            referencedColumns: ["key"]
          },
        ]
      }
      fle_user_progress: {
        Row: {
          comprehension_score: number | null
          created_at: string
          daily_goal_minutes: number
          daily_mission_completed_at: string | null
          estimated_level: Database["public"]["Enums"]["cecrl_level"] | null
          id: string
          last_activity_at: string | null
          last_streak_date: string | null
          oral_score: number | null
          phrases_mastered: number | null
          placement_completed: boolean | null
          preferred_category: Database["public"]["Enums"]["fle_category"] | null
          streak_days: number | null
          total_time_minutes: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
          weekly_xp_target: number
          words_learned: number | null
        }
        Insert: {
          comprehension_score?: number | null
          created_at?: string
          daily_goal_minutes?: number
          daily_mission_completed_at?: string | null
          estimated_level?: Database["public"]["Enums"]["cecrl_level"] | null
          id?: string
          last_activity_at?: string | null
          last_streak_date?: string | null
          oral_score?: number | null
          phrases_mastered?: number | null
          placement_completed?: boolean | null
          preferred_category?:
            | Database["public"]["Enums"]["fle_category"]
            | null
          streak_days?: number | null
          total_time_minutes?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          weekly_xp_target?: number
          words_learned?: number | null
        }
        Update: {
          comprehension_score?: number | null
          created_at?: string
          daily_goal_minutes?: number
          daily_mission_completed_at?: string | null
          estimated_level?: Database["public"]["Enums"]["cecrl_level"] | null
          id?: string
          last_activity_at?: string | null
          last_streak_date?: string | null
          oral_score?: number | null
          phrases_mastered?: number | null
          placement_completed?: boolean | null
          preferred_category?:
            | Database["public"]["Enums"]["fle_category"]
            | null
          streak_days?: number | null
          total_time_minutes?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          weekly_xp_target?: number
          words_learned?: number | null
        }
        Relationships: []
      }
      formateur_learners: {
        Row: {
          created_at: string
          formateur_id: string
          id: string
          learner_id: string
        }
        Insert: {
          created_at?: string
          formateur_id: string
          id?: string
          learner_id: string
        }
        Update: {
          created_at?: string
          formateur_id?: string
          id?: string
          learner_id?: string
        }
        Relationships: []
      }
      hubspot_diagnostic_sync_logs: {
        Row: {
          created_at: string
          diagnostic_id: string
          diagnostic_type: string
          error_message: string | null
          hubspot_company_id: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          id: string
          payload_summary: Json
          score_qualification: number | null
          status: string
        }
        Insert: {
          created_at?: string
          diagnostic_id: string
          diagnostic_type: string
          error_message?: string | null
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          payload_summary?: Json
          score_qualification?: number | null
          status: string
        }
        Update: {
          created_at?: string
          diagnostic_id?: string
          diagnostic_type?: string
          error_message?: string | null
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          payload_summary?: Json
          score_qualification?: number | null
          status?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          consent_id: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          first_name: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          id: string
          match_score: number | null
          notes: string | null
          phone: string | null
          price_charged: number | null
          profile_id: string | null
          provider_id: string
          purchased_at: string | null
          source_campaign: string | null
          source_location_id: string | null
          source_name: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["lead_status"]
          status_updated_at: string | null
          status_updated_from: string | null
          statut_lead: string | null
          training_id: string | null
          updated_at: string
        }
        Insert: {
          consent_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          first_name?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          match_score?: number | null
          notes?: string | null
          phone?: string | null
          price_charged?: number | null
          profile_id?: string | null
          provider_id: string
          purchased_at?: string | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          training_id?: string | null
          updated_at?: string
        }
        Update: {
          consent_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          first_name?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          match_score?: number | null
          notes?: string | null
          phone?: string | null
          price_charged?: number | null
          profile_id?: string | null
          provider_id?: string
          purchased_at?: string | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          training_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "consents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "training_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "training_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      marianne_access_code_audit_logs: {
        Row: {
          access_code_id: string | null
          code: string
          created_at: string
          id: string
          ip_address: unknown
          reason: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_code_id?: string | null
          code: string
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_code_id?: string | null
          code?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marianne_access_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          label: string | null
          last_used_at: string | null
          max_uses: number
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          max_uses?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          max_uses?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      onboarding_checkpoints: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_step: string
          email: string | null
          id: string
          language: string
          partial_answers: Json
          reminder_1h_sent: boolean
          reminder_24h_sent: boolean
          reminder_72h_sent: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: string
          email?: string | null
          id?: string
          language?: string
          partial_answers?: Json
          reminder_1h_sent?: boolean
          reminder_24h_sent?: boolean
          reminder_72h_sent?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: string
          email?: string | null
          id?: string
          language?: string
          partial_answers?: Json
          reminder_1h_sent?: boolean
          reminder_24h_sent?: boolean
          reminder_72h_sent?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_results: {
        Row: {
          answers: Json
          barriers: string[] | null
          completed_at: string | null
          created_at: string
          distance_to_job: number | null
          email: string | null
          first_name: string | null
          french_level_cecrl: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          id: string
          language: string
          lead_route: string | null
          lead_score: number | null
          literacy: string | null
          main_goal: string | null
          phone: string | null
          source_campaign: string | null
          source_location_id: string | null
          source_name: string | null
          source_type: string | null
          status_updated_at: string | null
          status_updated_from: string | null
          statut_lead: string | null
          target_sector: string | null
          user_id: string | null
          work_right: string | null
        }
        Insert: {
          answers?: Json
          barriers?: string[] | null
          completed_at?: string | null
          created_at?: string
          distance_to_job?: number | null
          email?: string | null
          first_name?: string | null
          french_level_cecrl?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          language?: string
          lead_route?: string | null
          lead_score?: number | null
          literacy?: string | null
          main_goal?: string | null
          phone?: string | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          target_sector?: string | null
          user_id?: string | null
          work_right?: string | null
        }
        Update: {
          answers?: Json
          barriers?: string[] | null
          completed_at?: string | null
          created_at?: string
          distance_to_job?: number | null
          email?: string | null
          first_name?: string | null
          french_level_cecrl?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          language?: string
          lead_route?: string | null
          lead_score?: number | null
          literacy?: string | null
          main_goal?: string | null
          phone?: string | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          target_sector?: string | null
          user_id?: string | null
          work_right?: string | null
        }
        Relationships: []
      }
      placement_test_sessions: {
        Row: {
          access_code: string
          candidate_email: string | null
          candidate_name: string | null
          completed_at: string | null
          created_at: string
          formateur_id: string
          id: string
          learner_id: string | null
          status: string
          test_result_id: string | null
          updated_at: string
        }
        Insert: {
          access_code: string
          candidate_email?: string | null
          candidate_name?: string | null
          completed_at?: string | null
          created_at?: string
          formateur_id: string
          id?: string
          learner_id?: string | null
          status?: string
          test_result_id?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          candidate_email?: string | null
          candidate_name?: string | null
          completed_at?: string | null
          created_at?: string
          formateur_id?: string
          id?: string
          learner_id?: string | null
          status?: string
          test_result_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_status: string | null
          barriers: string[] | null
          city: string | null
          contact_48h: boolean | null
          created_at: string
          distance_to_job: number | null
          email: string | null
          first_name: string | null
          fle_format: string | null
          fle_type: string | null
          french_level: number | null
          french_level_cecrl: string | null
          full_name: string | null
          funding_status: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          id: string
          immediate_availability: boolean | null
          last_name: string | null
          lead_route: string | null
          lead_score: number | null
          literacy: string | null
          main_goal: string | null
          mobility: string | null
          mobility_km: string | null
          origin_country: string | null
          phone: string | null
          postal_code: string | null
          previous_job: string | null
          real_comprehension_score: string | null
          skills: string[] | null
          source_campaign: string | null
          source_location_id: string | null
          source_name: string | null
          source_type: string | null
          status_updated_at: string | null
          status_updated_from: string | null
          statut_lead: string | null
          target_sector: string | null
          training_duration: string | null
          updated_at: string
          user_id: string | null
          work_right: string | null
          work_schedule: string | null
          worked_in_france: string | null
        }
        Insert: {
          admin_status?: string | null
          barriers?: string[] | null
          city?: string | null
          contact_48h?: boolean | null
          created_at?: string
          distance_to_job?: number | null
          email?: string | null
          first_name?: string | null
          fle_format?: string | null
          fle_type?: string | null
          french_level?: number | null
          french_level_cecrl?: string | null
          full_name?: string | null
          funding_status?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          immediate_availability?: boolean | null
          last_name?: string | null
          lead_route?: string | null
          lead_score?: number | null
          literacy?: string | null
          main_goal?: string | null
          mobility?: string | null
          mobility_km?: string | null
          origin_country?: string | null
          phone?: string | null
          postal_code?: string | null
          previous_job?: string | null
          real_comprehension_score?: string | null
          skills?: string[] | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          target_sector?: string | null
          training_duration?: string | null
          updated_at?: string
          user_id?: string | null
          work_right?: string | null
          work_schedule?: string | null
          worked_in_france?: string | null
        }
        Update: {
          admin_status?: string | null
          barriers?: string[] | null
          city?: string | null
          contact_48h?: boolean | null
          created_at?: string
          distance_to_job?: number | null
          email?: string | null
          first_name?: string | null
          fle_format?: string | null
          fle_type?: string | null
          french_level?: number | null
          french_level_cecrl?: string | null
          full_name?: string | null
          funding_status?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          immediate_availability?: boolean | null
          last_name?: string | null
          lead_route?: string | null
          lead_score?: number | null
          literacy?: string | null
          main_goal?: string | null
          mobility?: string | null
          mobility_km?: string | null
          origin_country?: string | null
          phone?: string | null
          postal_code?: string | null
          previous_job?: string | null
          real_comprehension_score?: string | null
          skills?: string[] | null
          source_campaign?: string | null
          source_location_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status_updated_at?: string | null
          status_updated_from?: string | null
          statut_lead?: string | null
          target_sector?: string | null
          training_duration?: string | null
          updated_at?: string
          user_id?: string | null
          work_right?: string | null
          work_schedule?: string | null
          worked_in_france?: string | null
        }
        Relationships: []
      }
      shared_diagnostic_answers: {
        Row: {
          answer_fr: string | null
          answer_native: string | null
          created_at: string
          diagnostic_id: string
          id: string
          question_key: string
          updated_at: string
          validated_at: string | null
          validated_by_formateur: boolean
          validated_by_learner: boolean
        }
        Insert: {
          answer_fr?: string | null
          answer_native?: string | null
          created_at?: string
          diagnostic_id: string
          id?: string
          question_key: string
          updated_at?: string
          validated_at?: string | null
          validated_by_formateur?: boolean
          validated_by_learner?: boolean
        }
        Update: {
          answer_fr?: string | null
          answer_native?: string | null
          created_at?: string
          diagnostic_id?: string
          id?: string
          question_key?: string
          updated_at?: string
          validated_at?: string | null
          validated_by_formateur?: boolean
          validated_by_learner?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "shared_diagnostic_answers_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "shared_diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_diagnostics: {
        Row: {
          access_code: string | null
          completed_at: string | null
          created_at: string
          formateur_id: string
          id: string
          learner_id: string | null
          learner_language: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          completed_at?: string | null
          created_at?: string
          formateur_id: string
          id?: string
          learner_id?: string | null
          learner_language?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          completed_at?: string | null
          created_at?: string
          formateur_id?: string
          id?: string
          learner_id?: string | null
          learner_language?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          conflict_resolution: string | null
          created_at: string
          diagnostic_id: string | null
          direction: string
          entity_type: string
          error_message: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          hubspot_dealstage: string | null
          id: string
          lead_id: string | null
          new_status: string
          payload_summary: Json
          previous_status: string | null
          profile_id: string | null
          source_system: string
          status: string
          target_system: string
        }
        Insert: {
          conflict_resolution?: string | null
          created_at?: string
          diagnostic_id?: string | null
          direction: string
          entity_type?: string
          error_message?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_dealstage?: string | null
          id?: string
          lead_id?: string | null
          new_status: string
          payload_summary?: Json
          previous_status?: string | null
          profile_id?: string | null
          source_system: string
          status?: string
          target_system: string
        }
        Update: {
          conflict_resolution?: string | null
          created_at?: string
          diagnostic_id?: string | null
          direction?: string
          entity_type?: string
          error_message?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_dealstage?: string | null
          id?: string
          lead_id?: string | null
          new_status?: string
          payload_summary?: Json
          previous_status?: string | null
          profile_id?: string | null
          source_system?: string
          status?: string
          target_system?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          answers: Json
          candidate_email: string
          candidate_name: string
          candidate_phone: string | null
          created_at: string
          duration_seconds: number
          gdpr_consent: boolean
          id: string
          level: string
          score: number
          trainer_name: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json
          candidate_email: string
          candidate_name: string
          candidate_phone?: string | null
          created_at?: string
          duration_seconds?: number
          gdpr_consent?: boolean
          id?: string
          level?: string
          score?: number
          trainer_name?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          candidate_email?: string
          candidate_name?: string
          candidate_phone?: string | null
          created_at?: string
          duration_seconds?: number
          gdpr_consent?: boolean
          id?: string
          level?: string
          score?: number
          trainer_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_providers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          is_active: boolean | null
          latitude: number | null
          lead_price: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          lead_price?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          lead_price?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string
          end_date: string | null
          enrolled: number | null
          id: string
          location: string | null
          max_seats: number | null
          notes: string | null
          start_date: string
          training_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          enrolled?: number | null
          id?: string
          location?: string | null
          max_seats?: number | null
          notes?: string | null
          start_date: string
          training_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          enrolled?: number | null
          id?: string
          location?: string | null
          max_seats?: number | null
          notes?: string | null
          start_date?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          certification_type:
            | Database["public"]["Enums"]["certification_type"]
            | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          min_french_level: number | null
          provider_id: string
          target_sectors: string[] | null
          title: string
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at: string
        }
        Insert: {
          certification_type?:
            | Database["public"]["Enums"]["certification_type"]
            | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          min_french_level?: number | null
          provider_id: string
          target_sectors?: string[] | null
          title: string
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at?: string
        }
        Update: {
          certification_type?:
            | Database["public"]["Enums"]["certification_type"]
            | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          min_french_level?: number | null
          provider_id?: string
          target_sectors?: string[] | null
          title?: string
          training_type?: Database["public"]["Enums"]["training_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "training_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "training_providers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      training_providers_public: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          postal_code: string | null
          provider_type: Database["public"]["Enums"]["provider_type"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          provider_type?: Database["public"]["Enums"]["provider_type"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          provider_type?: Database["public"]["Enums"]["provider_type"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_marianne_access_code: { Args: { _code: string }; Returns: Json }
      generate_access_code: { Args: never; Returns: string }
      get_lead_price: {
        Args: { cert_type: Database["public"]["Enums"]["certification_type"] }
        Returns: number
      }
      get_lead_price_scored: {
        Args: {
          cert_type: Database["public"]["Enums"]["certification_type"]
          score: number
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_formateur_for: { Args: { _learner_id: string }; Returns: boolean }
      is_provider_for_profile: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      normalize_marianne_access_code: {
        Args: { _code: string }
        Returns: string
      }
      validate_marianne_access_code:
        | { Args: { _code: string }; Returns: Json }
        | {
            Args: { _code: string; _ip_address?: string; _user_agent?: string }
            Returns: Json
          }
    }
    Enums: {
      app_role: "admin" | "provider" | "user" | "formateur" | "directeur"
      assignment_status: "a_faire" | "en_cours" | "termine" | "en_retard"
      audio_review_status: "pending" | "validated" | "rework"
      cecrl_level: "alpha" | "post_alpha" | "a1" | "a2" | "b1"
      certification_type: "language" | "cqp" | "tp"
      consent_type: "lead_sharing" | "marketing" | "analytics"
      fle_category: "quotidien" | "professionnel" | "certification" | "culture"
      fle_exercise_type:
        | "listen_repeat"
        | "listen_choose"
        | "oral_answer"
        | "vocal_recognition"
        | "image_word_audio"
        | "reformulate"
        | "complete_dialogue"
        | "role_play"
        | "interview_sim"
        | "safety_instruction"
        | "vocal_dialogue"
        | "scenario_tree"
        | "drag_match"
        | "fill_in_blank"
      lead_status:
        | "pending"
        | "contacted"
        | "converted"
        | "rejected"
        | "a_qualifier"
        | "qualifie_fle"
        | "qualifie_of"
        | "qualifie_employeur"
        | "sas_insertion"
        | "transmis_partenaire"
        | "rdv_fixe"
        | "entre_formation"
        | "recrute"
        | "perdu_injoignable"
      provider_type: "employer" | "training_org"
      training_type: "language" | "professional" | "both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "provider", "user", "formateur", "directeur"],
      assignment_status: ["a_faire", "en_cours", "termine", "en_retard"],
      audio_review_status: ["pending", "validated", "rework"],
      cecrl_level: ["alpha", "post_alpha", "a1", "a2", "b1"],
      certification_type: ["language", "cqp", "tp"],
      consent_type: ["lead_sharing", "marketing", "analytics"],
      fle_category: ["quotidien", "professionnel", "certification", "culture"],
      fle_exercise_type: [
        "listen_repeat",
        "listen_choose",
        "oral_answer",
        "vocal_recognition",
        "image_word_audio",
        "reformulate",
        "complete_dialogue",
        "role_play",
        "interview_sim",
        "safety_instruction",
        "vocal_dialogue",
        "scenario_tree",
        "drag_match",
        "fill_in_blank",
      ],
      lead_status: [
        "pending",
        "contacted",
        "converted",
        "rejected",
        "a_qualifier",
        "qualifie_fle",
        "qualifie_of",
        "qualifie_employeur",
        "sas_insertion",
        "transmis_partenaire",
        "rdv_fixe",
        "entre_formation",
        "recrute",
        "perdu_injoignable",
      ],
      provider_type: ["employer", "training_org"],
      training_type: ["language", "professional", "both"],
    },
  },
} as const
