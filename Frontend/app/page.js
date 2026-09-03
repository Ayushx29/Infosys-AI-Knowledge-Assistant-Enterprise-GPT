'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    window.location.href = '/login';
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: 'white' }}>
      <p>Redirecting to Enterprise Portal...</p>
    </div>
  );
}
