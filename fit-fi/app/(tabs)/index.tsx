import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash screen on app start
    router.replace('/splash');
  }, [router]);

  return null;
}
