import { getCurrentUser } from './authService.js';

export async function redirectUser() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      window.location.href = '/Html/signin_signup.html';
      return;
    }

    if (user.role === 'admin') {
      window.location.href = '/components_Admin/header/header.html#admin-dashboard';
    }
    else if (user.role === 'citizen' || user.role === 'user') {
      // Added both 'citizen' and 'user' for safety, but DB uses 'citizen'
      window.location.href = '/components/header/header.html#home';
    }
    else {
      console.warn('Unknown user role:', user.role);
      window.location.href = '/Html/signin_signup.html';
    }
  } catch (error) {
    console.error('Failed to check user identity', error);
    window.location.href = '/Html/signin_signup.html';
  }
}
