// Round back button: pinned in the left margin on wide screens, above the title on phones.
export function BackLink({ label, onBack, className = '' }: { label: string; onBack: () => void; className?: string }) {
  return (
    <a
      href="/"
      className={'back-link ' + className}
      aria-label={label}
      onClick={(e) => { e.preventDefault(); onBack(); }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
      </svg>
    </a>
  );
}
