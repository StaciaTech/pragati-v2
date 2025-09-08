
'use client';

import * as React from 'react';

export function HydrationSafeContent({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // You can return a loader or null here if you prefer
    return null;
  }

  return <>{children}</>;
}
