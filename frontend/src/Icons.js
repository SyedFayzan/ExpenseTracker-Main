import React from 'react';

// Common SVG Wrapper
const SvgIcon = ({ children, size = 18, color = 'currentColor', className = '', style = {}, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ui-icon ${className}`}
        style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
        {...props}
    >
        {children}
    </svg>
);

// 1. KPI & Financial Icons
export const IconWallet = (props) => (
    <SvgIcon {...props}>
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </SvgIcon>
);

export const IconDiamond = (props) => (
    <SvgIcon {...props}>
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M11 3 8 9l4 12 4-12-3-6" />
        <path d="M2 9h20" />
    </SvgIcon>
);

export const IconTrendingUp = (props) => (
    <SvgIcon {...props}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </SvgIcon>
);

export const IconTrendingDown = (props) => (
    <SvgIcon {...props}>
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
    </SvgIcon>
);

export const IconTarget = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </SvgIcon>
);

export const IconArrowUpRight = (props) => (
    <SvgIcon {...props}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </SvgIcon>
);

export const IconArrowDownRight = (props) => (
    <SvgIcon {...props}>
        <line x1="7" y1="7" x2="17" y2="17" />
        <polyline points="17 7 17 17 7 17" />
    </SvgIcon>
);

export const IconZap = (props) => (
    <SvgIcon {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </SvgIcon>
);

export const IconFlame = (props) => (
    <SvgIcon {...props}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </SvgIcon>
);

export const IconPieChart = (props) => (
    <SvgIcon {...props}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </SvgIcon>
);

export const IconBot = (props) => (
    <SvgIcon {...props}>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8.01" y2="16" />
        <line x1="16" y1="16" x2="16.01" y2="16" />
    </SvgIcon>
);

export const IconRepeat = (props) => (
    <SvgIcon {...props}>
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </SvgIcon>
);

export const IconCalendar = (props) => (
    <SvgIcon {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </SvgIcon>
);

export const IconClock = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </SvgIcon>
);

export const IconSearch = (props) => (
    <SvgIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </SvgIcon>
);

export const IconTrash = (props) => (
    <SvgIcon {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </SvgIcon>
);

export const IconDownload = (props) => (
    <SvgIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </SvgIcon>
);

export const IconSun = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </SvgIcon>
);

export const IconMoon = (props) => (
    <SvgIcon {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </SvgIcon>
);

export const IconLogOut = (props) => (
    <SvgIcon {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </SvgIcon>
);

export const IconPlus = (props) => (
    <SvgIcon {...props}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </SvgIcon>
);

export const IconEdit = (props) => (
    <SvgIcon {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </SvgIcon>
);

export const IconCheck = (props) => (
    <SvgIcon {...props}>
        <polyline points="20 6 9 17 4 12" />
    </SvgIcon>
);

export const IconCheckCircle = (props) => (
    <SvgIcon {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </SvgIcon>
);

export const IconAlertCircle = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </SvgIcon>
);

export const IconAlertTriangle = (props) => (
    <SvgIcon {...props}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgIcon>
);

export const IconPause = (props) => (
    <SvgIcon {...props}>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </SvgIcon>
);

export const IconPlay = (props) => (
    <SvgIcon {...props}>
        <polygon points="5 3 19 12 5 21 5 3" />
    </SvgIcon>
);

export const IconRefreshCw = (props) => (
    <SvgIcon {...props}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </SvgIcon>
);

export const IconReceipt = (props) => (
    <SvgIcon {...props}>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
    </SvgIcon>
);

export const IconUser = (props) => (
    <SvgIcon {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </SvgIcon>
);

// 2. Spending Category Icons
export const IconUtensils = (props) => (
    <SvgIcon {...props}>
        <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
        <path d="M15 2v14a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V2" />
        <path d="M7 2v20" />
        <path d="M3 2v4a4 4 0 0 0 4 4 4 4 0 0 0 4-4V2" />
    </SvgIcon>
);

export const IconCar = (props) => (
    <SvgIcon {...props}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
    </SvgIcon>
);

export const IconHome = (props) => (
    <SvgIcon {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </SvgIcon>
);

export const IconShoppingBag = (props) => (
    <SvgIcon {...props}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </SvgIcon>
);

export const IconLightbulb = (props) => (
    <SvgIcon {...props}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </SvgIcon>
);

export const IconFilm = (props) => (
    <SvgIcon {...props}>
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
    </SvgIcon>
);

export const IconBriefcase = (props) => (
    <SvgIcon {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </SvgIcon>
);

export const IconPackage = (props) => (
    <SvgIcon {...props}>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </SvgIcon>
);

// Category Icon Resolver Helper
export const CategoryIcon = ({ category = 'Other', size = 16, color, className = '', style = {} }) => {
    switch (category) {
        case 'Food':
            return <IconUtensils size={size} color={color} className={className} style={style} />;
        case 'Transport':
            return <IconCar size={size} color={color} className={className} style={style} />;
        case 'Rent':
            return <IconHome size={size} color={color} className={className} style={style} />;
        case 'Shopping':
            return <IconShoppingBag size={size} color={color} className={className} style={style} />;
        case 'Utilities':
            return <IconLightbulb size={size} color={color} className={className} style={style} />;
        case 'Entertainment':
            return <IconFilm size={size} color={color} className={className} style={style} />;
        case 'Salary':
            return <IconBriefcase size={size} color={color} className={className} style={style} />;
        case 'Other':
        default:
            return <IconPackage size={size} color={color} className={className} style={style} />;
    }
};
