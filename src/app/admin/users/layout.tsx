import { requireAdminAccess } from '@/lib/auth-guards';

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /forbidden if not admin
  await requireAdminAccess();
  
  return <>{children}</>;
}