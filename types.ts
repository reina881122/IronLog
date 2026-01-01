
export interface SetGroup {
  id: string;
  weight: number;
  setsCount: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface Exercise {
  id: string;
  name: string;
  setGroups: SetGroup[];
  review?: string;
}

export interface WorkoutPlan {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string; // e.g. "臀腿", "背部"
  exercises: Exercise[];
  isCompleted?: boolean; 
}

export interface CoachingNote {
  id: string;
  date: string;
  techniqueName: string;
  feedback: string;
  videoUrl?: string;
  videoBlob?: Blob;
}

export type ViewType = 'plan' | 'train' | 'stats' | 'coach';

export interface FlattenedSet {
  id: string;
  groupId: string;
  weight: number;
  reps: number;
  setIndex: number; 
  completed: boolean;
}
