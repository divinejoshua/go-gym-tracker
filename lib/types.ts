export const WORKOUT_TYPES = [
  { value: "upper_body", label: "Upper body", emoji: "💪" },
  { value: "leg_day", label: "Leg day", emoji: "🦵" },
  { value: "cardio", label: "Cardio", emoji: "🏃" },
  { value: "other", label: "Other", emoji: "🏋️" },
] as const;

export const DURATIONS = [
  { value: "30m", label: "30 minutes" },
  { value: "45m", label: "45 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h+", label: "3 hours +" },
] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number]["value"];
export type Duration = (typeof DURATIONS)[number]["value"];
export type MediaType = "image" | "video";

export function workoutTypeLabel(value: string) {
  return WORKOUT_TYPES.find((t) => t.value === value) ?? WORKOUT_TYPES[3];
}

export function durationLabel(value: string) {
  return DURATIONS.find((d) => d.value === value)?.label ?? value;
}

export type Challenge = {
  id: string;
  name: string;
  workouts_per_week: number;
  rules: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Participant = {
  id: string;
  challenge_id: string;
  name: string;
  created_at: string;
};

export type Workout = {
  id: string;
  challenge_id: string;
  participant_id: string;
  media_url: string;
  media_type: MediaType;
  workout_type: WorkoutType;
  duration: Duration;
  routine: string;
  venue: string;
  created_at: string;
};

/** A workout joined with the names needed to render a feed card. */
export type FeedWorkout = Workout & {
  participant_name: string;
  challenge_name: string;
};

/**
 * Minimal hand-written schema so Supabase queries are type-checked.
 * `Relationships` is required by the client's generic constraint — leaving it
 * out silently collapses every table type to `never`. It also teaches the
 * client how `gogym_workouts` embeds the other two tables.
 */
export type Database = {
  public: {
    Tables: {
      gogym_challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, "id" | "created_at">;
        Update: Partial<Omit<Challenge, "id" | "created_at">>;
        Relationships: [];
      };
      gogym_participants: {
        Row: Participant;
        Insert: Omit<Participant, "id" | "created_at">;
        Update: Partial<Omit<Participant, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "gogym_participants_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "gogym_challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      gogym_workouts: {
        Row: Workout;
        Insert: Omit<Workout, "id" | "created_at">;
        Update: Partial<Omit<Workout, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "gogym_workouts_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "gogym_challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gogym_workouts_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "gogym_participants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
