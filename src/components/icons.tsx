import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 28V4H16.4C18.9667 4 20.9417 4.675 22.325 6.025C23.7083 7.375 24.4 9.15833 24.4 11.375C24.4 13.5917 23.7083 15.375 22.325 16.725C20.9417 18.075 18.9667 18.75 16.4 18.75H12"
      fill="currentColor"
    />
    <path d="M16 28V18.75H12" stroke="currentColor" strokeWidth="0" />
    <path d="M20 28L28 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20L28 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StaciaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
