// Ikon garis sederhana (24×24, stroke currentColor) untuk dashboard admin.
const paths = {
  status: "M4 20V10l8-6 8 6v10h-5v-6H9v6z",
  gallery: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L16 11l4 4M9 9.5h.01",
  menu: "M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 9h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2",
  book: "M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0zM12 5.5V19",
  news: "M5 4h11v16H6a1 1 0 0 1-1-1zM16 8h3v11a1 1 0 0 1-1 1h-2M8 8h5M8 12h5M8 16h3",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
