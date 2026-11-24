import { Stack } from 'expo-router';
import { COLORS } from '@/constants/styles';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.cream } }} />;
}
