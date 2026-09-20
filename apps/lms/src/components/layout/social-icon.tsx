export type SocialPlatform = "facebook" | "twitter" | "instagram" | "youtube";

const paths: Record<SocialPlatform, React.ReactNode> = {
  facebook: <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.87.24-1.46 1.5-1.46H16.5V4.36C16.2 4.32 15.2 4.24 14.03 4.24c-2.44 0-4.11 1.49-4.11 4.22V10.5H7.4v3h2.52V21h3.58Z" />,
  twitter: <path d="M21 6.7c-.6.27-1.24.45-1.9.53a3.3 3.3 0 0 0 1.45-1.83 6.6 6.6 0 0 1-2.1.8 3.3 3.3 0 0 0-5.62 3 9.34 9.34 0 0 1-6.78-3.44 3.3 3.3 0 0 0 1.02 4.4c-.53-.02-1.03-.16-1.47-.4v.04a3.3 3.3 0 0 0 2.64 3.23 3.3 3.3 0 0 1-1.48.06 3.3 3.3 0 0 0 3.08 2.29A6.62 6.62 0 0 1 4 16.58a9.32 9.32 0 0 0 5.05 1.48c6.06 0 9.38-5.02 9.38-9.38l-.01-.43A6.7 6.7 0 0 0 21 6.7Z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" />
    </>
  ),
  youtube: <path d="M21.5 8.3a2.9 2.9 0 0 0-2.05-2.05C17.7 5.75 12 5.75 12 5.75s-5.7 0-7.45.5A2.9 2.9 0 0 0 2.5 8.3 30 30 0 0 0 2 12a30 30 0 0 0 .5 3.7 2.9 2.9 0 0 0 2.05 2.05c1.75.5 7.45.5 7.45.5s5.7 0 7.45-.5a2.9 2.9 0 0 0 2.05-2.05A30 30 0 0 0 22 12a30 30 0 0 0-.5-3.7ZM10 14.9V9.1l5 2.9-5 2.9Z" />,
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const isInstagram = platform === "instagram";
  return (
    <svg viewBox="0 0 24 24" fill={isInstagram ? "none" : "currentColor"} stroke={isInstagram ? "currentColor" : "none"} className={className} aria-hidden>
      {paths[platform]}
    </svg>
  );
}
