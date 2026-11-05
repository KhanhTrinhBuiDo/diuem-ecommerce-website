import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* Icon dựng lại bằng SVG đơn giản (chưa có file icon gốc từ Figma).
   TODO(icon): thay bằng icon xuất từ Figma khi có. */

export function SearchIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="7" />
      <path d="M13.2 13.2 17 17" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="20" cy="20" r="17" />
      <circle cx="20" cy="15" r="4.5" />
      <path d="M9 31c2-5 6-7.5 11-7.5S29 26 31 31" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 13h14c3 0 4 2 4.5 5l1.5 10c.4 3-1 4.5-3.5 4.5h-19C8 32.5 6.6 31 7 28l1.5-10c.5-3 1.5-5 4.5-5Z" />
      <path d="M15 13v-2.5a5 5 0 0 1 10 0V13" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 8h20M4 14h20M4 20h20" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M6 6l16 16M22 6 6 22" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true" {...props}>
      <rect width="80" height="64" rx="8" fill="currentColor" />
      <path d="M10 18l30 20 30-20" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true" {...props}>
      <rect width="50" height="50" fill="currentColor" />
      <path transform="translate(10 10) scale(1.25)" d="M14 8V6.5c0-.7.2-1 1-1h2V2h-3c-3 0-4 1.8-4 4v2H8v3.5h2V22h4V11.5h2.7L17 8h-3z" fill="#000" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true" {...props}>
      <rect width="50" height="50" fill="currentColor" />
      <path transform="translate(10 10) scale(1.25)" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" fill="#000" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true" {...props}>
      <rect width="50" height="50" fill="currentColor" />
      <circle cx="25" cy="26" r="9" fill="none" stroke="#000" strokeWidth="4" />
      <circle cx="37" cy="13" r="2.5" fill="#000" />
    </svg>
  );
}
