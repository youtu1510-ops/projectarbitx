
import React from 'react';

export const SoccerBall: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a5.5 5.5 0 00-4.76 2.76L5.22 8.52a5.5 5.5 0 000 6.96l2.02 3.76A5.5 5.5 0 0012 22a5.5 5.5 0 004.76-2.76l2.02-3.76a5.5 5.5 0 000-6.96L16.76 4.76A5.5 5.5 0 0012 2z" />
    <path d="M12 2L8.24 4.76" />
    <path d="M12 22l3.76-2.76" />
    <path d="M5.22 8.52L2.6 10.4" />
    <path d="M18.78 15.48l2.62-1.88" />
    <path d="M5.22 15.48l-2.62 1.88" />
    <path d="M18.78 8.52l-2.62-1.88" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M8.24 4.76l-3.02 6.64" />
    <path d="M15.76 19.24l3.02-6.64" />
    <path d="M8.24 19.24l-3.02-6.64" />
    <path d="M15.76 4.76l3.02 6.64" />
  </svg>
);
