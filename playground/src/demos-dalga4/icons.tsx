// Dalga 4 örneklerinde kullanılan yer tutucu simgeler (çizgi simgeler, currentColor).
import type { ReactNode } from "react";

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const make = (path: ReactNode) => () => <svg {...base} aria-hidden="true">{path}</svg>;

export const HomeIcon = make(<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />);
export const BookmarkIcon = make(<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />);
export const InboxIcon = make(<path d="M4 13 6 5h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 13h4l1 2h6l1-2h4" />);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></>);
export const TaskIcon = make(<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>);
export const NoteIcon = make(<path d="M6 4h9l3 3v13H6zM9 11h6M9 15h6" />);
export const PinIcon = make(<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7" />);
export const ShareIcon = make(<><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" /></>);
export const TrashIcon = make(<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />);
export const BoxIcon = make(<path d="M4 8 12 4l8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" />);
export const DatabaseIcon = make(<><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></>);
export const BoltIcon = make(<path d="M13 3 5 13h6l-1 8 8-10h-6z" />);
export const ChartIcon = make(<path d="M5 20V10M12 20V4M19 20v-7" />);
export const BellIcon = make(<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4" />);
export const LayersIcon = make(<path d="m12 4 8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" />);
