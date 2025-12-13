import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const router = inject(Router);

    // Check if user is logged in via localStorage
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      router.navigate(['/login']);
      return false;
    }

    // Check user role from localStorage
    const userRole = localStorage.getItem('userRole') || 'service';

    if (allowedRoles.includes(userRole)) {
      return true;
    } else {
      // Redirect to lots page if role not allowed
      router.navigate(['/landing/lots']);
      return false;
    }
  };
};
