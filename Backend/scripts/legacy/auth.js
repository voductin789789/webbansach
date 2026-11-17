// Legacy compatibility redirect for the retired static auth pages.
// Authentication is implemented in Frontend/src/providers/AuthProvider.tsx.
(() => {
  const isRegisterPage = window.location.pathname.toLowerCase().endsWith('/register.html');
  window.location.replace(isRegisterPage ? '/register' : '/login');
})();
