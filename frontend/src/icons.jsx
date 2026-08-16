const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconGrid({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconLog({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconSettings({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.11.36.51.64 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconUsers({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <circle cx="17.5" cy="8.5" r="2.4" />
      <path d="M16 14.2c2.7.4 4.7 2.4 4.7 5.8" />
    </svg>
  );
}

export function IconSliders({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M4 21V14M4 10V3M12 21v-8M12 9V3M20 21v-4M20 13V3" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="11" r="2" />
      <circle cx="20" cy="15" r="2" />
    </svg>
  );
}

export function IconArrow({ width = 14, height = 14, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconAlertTriangle({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconCheckCircle({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

export function IconDial({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15 16 9" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBolt({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}