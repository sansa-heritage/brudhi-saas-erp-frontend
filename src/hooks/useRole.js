import { useState, useEffect } from 'react';

export function useRole() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    // Default to 'admin' if no role found
    setRole(userRole || 'admin');
    setIsLoading(false);
  }, []);

  return { role, isLoading };
}