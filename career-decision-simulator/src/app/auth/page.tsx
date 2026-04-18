import { redirect } from 'next/navigation';

/**
 * Legacy /auth route — redirect permanently to /login
 * This preserves backward compatibility for any existing links.
 */
export default function AuthRedirect() {
  redirect('/login');
}
