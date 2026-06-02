/* TypeScript types/interfaces for the ICPC platform */

// ─── Auth ────────────────────────────────────────────────
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  university?: string;
  faculty?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// ─── Users & Roles ───────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number | null;
  role_name: string;
  role_display: string;
  university: string;
  faculty: string;
  bio: string;
  is_active: boolean;
  date_joined: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

// ─── Problems ────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: number;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  sample_input: string;
  sample_output: string;
  difficulty: Difficulty;
  difficulty_display: string;
  time_limit_ms: number;
  memory_limit_kb: number;
  author: number;
  author_name: string;
  is_public: boolean;
  is_active: boolean;
  tags: string;
  sample_test_cases: TestCase[];
  created_at: string;
}

export interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_sample: boolean;
  order: number;
}

// ─── Contests ────────────────────────────────────────────
export type ContestStatus = 'pending' | 'active' | 'finished' | 'cancelled';

export interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: ContestStatus;
  status_display: string;
  created_by: number;
  created_by_name: string;
  is_public: boolean;
  scoring_type: string;
  penalty_time: number;
  problems: ContestProblem[];
  participant_count: number;
  created_at: string;
}

export interface ContestProblem {
  id: number;
  problem: number;
  problem_detail: Problem;
  label: string;
  order: number;
}

// ─── Submissions ─────────────────────────────────────────
export type Verdict = 'pending' | 'AC' | 'WA' | 'TLE' | 'RE' | 'CE';
export type Language = 'python' | 'java';

export interface Submission {
  id: number;
  user: number;
  username: string;
  problem: number;
  problem_title: string;
  contest: number | null;
  contest_title: string | null;
  language: Language;
  language_display: string;
  source_code: string;
  verdict: Verdict;
  verdict_display: string;
  execution_time_ms: number;
  memory_used_kb: number;
  error_message: string;
  test_cases_passed: number;
  total_test_cases: number;
  submitted_at: string;
}

// ─── Rankings ────────────────────────────────────────────
export interface RankingEntry {
  id: number;
  user: number;
  username: string;
  full_name: string;
  team: number | null;
  team_name: string | null;
  solved_count: number;
  total_penalty: number;
  score: number;
  rank_position: number;
  last_accepted_at: string | null;
}

// ─── Teams ───────────────────────────────────────────────
export interface Team {
  id: number;
  name: string;
  description: string;
  coach: number | null;
  coach_name: string | null;
  is_active: boolean;
  members: TeamMember[];
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  user: number;
  username: string;
  full_name: string;
  role: string;
  role_display: string;
  joined_at: string;
}

// ─── Trainings ───────────────────────────────────────────
export interface Training {
  id: number;
  title: string;
  description: string;
  created_by: number;
  created_by_name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  status_display: string;
  is_public: boolean;
  problems: TrainingProblem[];
  problem_count: number;
  created_at: string;
}

export interface TrainingProblem {
  id: number;
  problem: number;
  problem_detail: Problem;
  order: number;
}

export interface TrainingProgress {
  total: number;
  solved: number;
  percentage: number;
  problems: {
    problem_id: number;
    problem_title: string;
    order: number;
    solved: boolean;
  }[];
}

// ─── API ─────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
