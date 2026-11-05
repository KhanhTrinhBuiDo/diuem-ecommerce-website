import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement>;

export const CartPlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M2 3h3l2.4 11h10.2L20 6H6" />
    <circle cx="9" cy="19" r="1.4" />
    <circle cx="17" cy="19" r="1.4" />
  </svg>
);
export const ShareIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" />
    <path d="m8.3 10.7 7.4-4.4M8.3 13.3l7.4 4.4" />
  </svg>
);
export const TruckIcon = (p: P) => (
  <svg viewBox="0 0 30 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M1 2h17v14H1zM18 7h6l5 4.5V16H18z" /><circle cx="7" cy="18" r="2.6" fill="#fff" /><circle cx="23" cy="18" r="2.6" fill="#fff" />
  </svg>
);
export const PhoneOutlineIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M6.6 3.5 4 4.2c-.8 8.8 5.3 16 15.8 15.8l.7-2.6-4-2.2-2 1.7c-2.4-1-4.4-3-5.4-5.4l1.7-2z" />
  </svg>
);
export const GiftIcon = (p: P) => (
  <svg viewBox="0 0 37 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="11" width="31" height="6" /><path d="M5 17h27v13H5zM18.5 11v19M18.5 11c-3-8-10-8-8-4s8 4 8 4zm0 0c3-8 10-8 8-4s-8 4-8 4z" />
  </svg>
);
export const TrashIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
);
export const FlagIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M6 21V4h11l-2 4 2 4H6" />
  </svg>
);
export const ThumbIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M7 11v10H3V11zM7 11l4-8c2 0 3 1 3 3v4h6l-1.5 9c-.2 1-1 2-2 2H7" />
  </svg>
);
export const EyeIcon = ({ off, ...p }: P & { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export const GoogleLogo = (p: P) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.2 7-10.3 7-17.6z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);
export const FacebookLogo = (p: P) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
    <circle cx="24" cy="24" r="24" fill="#1877F2" />
    <path fill="#fff" d="M33 30.8 34.2 24H27.8v-4.4c0-1.9.9-3.7 3.9-3.7h3.2v-5.8s-2.9-.5-5.7-.5c-5.7 0-9.4 3.4-9.4 9.7V24h-6.4v6.8h6.4V48a24 24 0 0 0 8 0V30.8z" />
  </svg>
);
