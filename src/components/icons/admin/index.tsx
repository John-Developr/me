import type { ReactNode, SVGProps } from "react";

/* ============================================================
   ADMIN ICONS
   ------------------------------------------------------------
   Lucide-style line icons for the admin dashboard (24×24 grid,
   round caps, currentColor). Kept in one file because they are
   tiny and share one stroke style; use as <AdminIcons.Bell />.
   Paths follow Lucide (ISC license) shapes, drawn inline — no
   icon library is installed.
   ============================================================ */

type IconProps = SVGProps<SVGSVGElement>;

const createIcon = (displayName: string, children: ReactNode) => {
    const Icon = (props: IconProps) => (
        <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {children}
        </svg>
    );
    Icon.displayName = displayName;
    return Icon;
};

export const AdminIcons = {
    LayoutGrid: createIcon("LayoutGrid", <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>),
    Eye: createIcon("Eye", <>
        <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.42 8.36 7.36 5 12 5s8.58 3.36 9.94 6.65a1 1 0 0 1 0 .7C20.58 15.64 16.64 19 12 19s-8.58-3.36-9.94-6.65" />
        <circle cx="12" cy="12" r="3" />
    </>),
    EyeOff: createIcon("EyeOff", <>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.64 0 8.58 3.36 9.94 6.65a1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49" />
        <path d="M14.08 14.16a3 3 0 0 1-4.24-4.24" />
        <path d="M17.48 17.5A10.75 10.75 0 0 1 12 19c-4.64 0-8.58-3.36-9.94-6.65a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14" />
        <path d="m2 2 20 20" />
    </>),
    Shield: createIcon("Shield", <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </>),
    Monitor: createIcon("Monitor", <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
    </>),
    User: createIcon("User", <>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
    </>),
    Folder: createIcon("Folder", <>
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </>),
    Briefcase: createIcon("Briefcase", <>
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect x="2" y="6" width="20" height="14" rx="2" />
    </>),
    Code: createIcon("Code", <>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
    </>),
    GraduationCap: createIcon("GraduationCap", <>
        <path d="M21.42 10.92a1 1 0 0 0-.02-1.84l-8.57-3.9a2 2 0 0 0-1.66 0l-8.57 3.9a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>),
    Award: createIcon("Award", <>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
    </>),
    Layers: createIcon("Layers", <>
        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </>),
    Quote: createIcon("Quote", <>
        <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
        <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </>),
    Mail: createIcon("Mail", <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>),
    BarChart: createIcon("BarChart", <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </>),
    Image: createIcon("Image", <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </>),
    Globe: createIcon("Globe", <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
    </>),
    Settings: createIcon("Settings", <>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </>),
    Search: createIcon("Search", <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </>),
    Bell: createIcon("Bell", <>
        <path d="M10.27 21a2 2 0 0 0 3.46 0" />
        <path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33" />
    </>),
    ExternalLink: createIcon("ExternalLink", <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>),
    LogOut: createIcon("LogOut", <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </>),
    PanelLeft: createIcon("PanelLeft", <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
    </>),
    Menu: createIcon("Menu", <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
    </>),
    Close: createIcon("Close", <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </>),
    ChevronDown: createIcon("ChevronDown", <>
        <path d="m6 9 6 6 6-6" />
    </>),
    GripVertical: createIcon("GripVertical", <>
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="19" r="1" />
    </>),
    Plus: createIcon("Plus", <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </>),
    Pencil: createIcon("Pencil", <>
        <path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
        <path d="m15 5 4 4" />
    </>),
    Refresh: createIcon("Refresh", <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </>),
    Activity: createIcon("Activity", <>
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </>),
    Clock: createIcon("Clock", <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </>),
    Check: createIcon("Check", <>
        <path d="M20 6 9 17l-5-5" />
    </>),
    AlertCircle: createIcon("AlertCircle", <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </>),
    Zap: createIcon("Zap", <>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </>),
    FileText: createIcon("FileText", <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </>),
    Lock: createIcon("Lock", <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>),
    Sun: createIcon("Sun", <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" /><path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </>),
    Moon: createIcon("Moon", <>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </>),
    ArrowLeft: createIcon("ArrowLeft", <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </>),
    Archive: createIcon("Archive", <>
        <rect x="2" y="3" width="20" height="5" rx="1" />
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
        <path d="M10 12h4" />
    </>),
    Inbox: createIcon("Inbox", <>
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>),
    MailOpen: createIcon("MailOpen", <>
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </>),
    Reply: createIcon("Reply", <>
        <path d="m9 17-5-5 5-5" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </>),
    // ─── Text formatting (Markdown editor toolbar) ───
    Bold: createIcon("Bold", <>
        <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
    </>),
    Italic: createIcon("Italic", <>
        <path d="M19 4h-9" />
        <path d="M14 20H5" />
        <path d="M15 4 9 20" />
    </>),
    Heading2: createIcon("Heading2", <>
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" />
        <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
    </>),
    Heading3: createIcon("Heading3", <>
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" />
        <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
        <path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />
    </>),
    List: createIcon("List", <>
        <path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" />
        <path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />
    </>),
    ListOrdered: createIcon("ListOrdered", <>
        <path d="M11 5h10" /><path d="M11 12h10" /><path d="M11 19h10" />
        <path d="M4 4h1v5" /><path d="M4 9h2" />
        <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />
    </>),
    Link: createIcon("Link", <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>),
    SquareCode: createIcon("SquareCode", <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m10 9-3 3 3 3" />
        <path d="m14 15 3-3-3-3" />
    </>),
    Trash: createIcon("Trash", <>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>),
};

export type AdminIconComponent = (typeof AdminIcons)[keyof typeof AdminIcons];
