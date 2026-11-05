/** Dải hồng ngăn các khối lớn (Figma ~14px, full width). */
export function PinkBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-[14px] w-full bg-line ${className}`} />;
}
