/** Product mark: piston-and-injector badge. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="13" fill="rgb(var(--panel))" stroke="rgb(var(--cool))" strokeWidth="2.500" />
      <path d="M32 9v9M27 13l5 5 5-5" stroke="rgb(var(--amber))" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="19" y="21" width="26" height="6" rx="1.500" fill="rgb(var(--cool))" />
      <rect x="22" y="27" width="20" height="17" rx="2" fill="none" stroke="rgb(var(--ink))" strokeWidth="3" />
      <rect x="25" y="33" width="14" height="5" fill="rgb(var(--amber))" />
      <path d="M32 44v9" stroke="rgb(var(--ink))" strokeWidth="3" />
      <circle cx="32" cy="54" r="3" fill="rgb(var(--ink))" />
    </svg>
  );
}
