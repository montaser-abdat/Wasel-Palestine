export function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/Html/signin_signup.html';
  }
}
