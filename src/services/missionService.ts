import { supabase } from '@/lib/supabase';
import type { MissionRecord, MissionStatus } from '@/types/mission';

function requireSupabase() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Periksa file .env.');
  return supabase;
}

// SELECT: mengambil misi milik user aktif.
export async function getMyMissions(userId: string): Promise<MissionRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MissionRecord[];
}

// INSERT: user_id berasal dari user yang sedang terautentikasi.
export async function createMission(userId: string, title: string, rewardPoints = 100): Promise<MissionRecord> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .insert({
      title: title.trim(),
      reward_points: rewardPoints,
      user_id: userId,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MissionRecord;
}

// UPDATE: ubah status misi (pending/completed).
export async function updateMyMissionStatus(
  missionId: string,
  userId: string,
  status: MissionStatus,
): Promise<MissionRecord> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .update({ status })
    .eq('id', missionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data as MissionRecord;
}

// DELETE: menghapus misi milik user aktif.
export async function deleteMyMission(missionId: string, userId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from('missions')
    .delete()
    .eq('id', missionId)
    .eq('user_id', userId);

  if (error) throw error;
}
