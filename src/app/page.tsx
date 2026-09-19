import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  if (user) {
    if (!user.onboarded) {
      redirect('/onboarding');
    }
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
