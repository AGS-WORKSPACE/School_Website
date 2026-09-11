import { siteConfig } from "@/constants/site";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.5l.5-3h-3V9.05c0-.87.25-1.55 1.6-1.55H17V4.75A23 23 0 0 0 14.7 4.6c-2.2 0-3.7 1.35-3.7 3.8V11H8.5v3H11v7h2.5Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.75 4h2.66l-5.82 6.65L21.5 20h-5.36l-4.2-5.49L7.1 20H4.43l6.23-7.12L4.5 4h5.5l3.8 5.02L17.75 4Zm-.93 14.37h1.47L8.36 5.53H6.77l10.05 12.84Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H3.75V20.5h3.19V8.5ZM5.34 7.1a1.85 1.85 0 1 0 0-3.7 1.85 1.85 0 0 0 0 3.7ZM20.25 13.6c0-3.4-1.81-5-4.24-5a3.66 3.66 0 0 0-3.3 1.82V8.5H9.53v12h3.18v-6.36c0-1.68.79-2.67 2.28-2.67 1.37 0 2.08.94 2.08 2.67v6.36h3.18V13.6Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12c0 1.62.13 3.24.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77c.27-1.56.4-3.18.4-4.8s-.13-3.24-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z" />
    </svg>
  );
}

export const socialIcons = [
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
  { label: "X (Twitter)", href: siteConfig.social.twitter, Icon: XIcon },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedInIcon },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: YouTubeIcon },
];
