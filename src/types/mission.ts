export type MissionStatus = 'pending' | 'completed';

export interface MissionRecord {
  id: string;
  title: string;
  reward_points: number;
  user_id: string;
  status: MissionStatus;
  created_at: string;
}
