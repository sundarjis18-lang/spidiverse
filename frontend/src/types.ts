export type Difficulty = 'Beginner' | 'Intermediate' | 'Hard';

export interface TestCase {
  input: string;
  expected: string;
  hidden?: boolean;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  stdout: string;
  error?: string | null;
  runtime_ms: number;
  hidden?: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  difficulty: Difficulty;
  points: number;
  category: string;
  story: string;
  description: string;
  instructions: string;
  hints: string[];
  starter_code: string;
  starterCode: string;
  function_name: string;
  functionName?: string;
  test_cases: TestCase[];
  testCases: TestCase[];
  expectedOutput: string;
  expected_output?: string;
  is_unlocked: boolean;
  isUnlocked?: boolean;
  is_completed: boolean;
  isCompleted?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  reg_number: string;
  avatar: string;
  points: number;
  completed_challenges: number[];
  time_spent_seconds: number;
  role: 'student' | 'admin';
}

export interface SubmissionResponse {
  all_passed: boolean;
  passed_count: number;
  total_count: number;
  results: TestResult[];
  general_error?: string | null;
  stdout?: string;
  points_awarded: number;
  base_points?: number;
  hints_used?: number;
  hint_penalty?: number;
  next_unlocked_challenge?: number | null;
  is_all_cleared?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  reg_number?: string;
  masked_reg: string;
  avatar: string;
  points: number;
  completed_count: number;
  is_finished?: boolean;
  completion_time: string;
  time_seconds: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  icon: string;
}

export interface StudentProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    reg_number: string;
    masked_reg: string;
    avatar: string;
    points: number;
    completed_challenges: number[];
    completed_count: number;
    rank: number;
    time_spent: string;
    time_spent_seconds: number;
  };
  achievements: Achievement[];
  history: Array<{
    challenge_id: number;
    title: string;
    difficulty: Difficulty;
    passed: boolean;
    score: string;
    runtime_ms: number;
    timestamp: string;
  }>;
  skill_stats: {
    syntax: number;
    data_types: number;
    logic: number;
    algorithms: number;
    architecture: number;
  };
}

export interface CompetitionStatus {
  unlocked: boolean;
  status: 'UNLOCKED' | 'LOCKED' | string;
  message: string;
  start_time?: number;
  elapsed_seconds?: number;
}

export interface AdminStudent {
  id: number;
  name: string;
  email: string;
  reg_number: string;
  registration_date?: string;
  created_at?: string;
  account_status?: string;
  status?: string;
  points: number;
  completed_count: number;
  completed_ids: number[];
  is_finished?: boolean;
  time_spent: string;
  time_spent_seconds?: number;
}

export interface AdminOverviewData {
  total_registered: number;
  total_participants: number;
  currently_active: number;
  students_started: number;
  students_completed_all: number;
  global_unlocked: boolean;
  total_submissions?: number;
  pass_rate?: number;
  students: AdminStudent[];
}

