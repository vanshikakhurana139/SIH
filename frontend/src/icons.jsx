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

/* --- Added for the mockup-matched dashboard layout --- */

export function IconBell({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconChevronDown({ width = 12, height = 12, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconShield({ width = 20, height = 20, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M12 3 4 6v6c0 4.6 3.2 8.3 8 9 4.8-.7 8-4.4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconXCircle({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

export function IconDoc({ width = 16, height = 16, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12h5M9.5 15.5h5" />
    </svg>
  );
}

export function IconHeart({ width = 22, height = 22, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M12 20s-7-4.4-9.3-9C1.1 7.6 3 4.5 6.3 4.5c2 0 3.4 1.1 4.2 2.4.3.5.9.5 1.2 0 .8-1.3 2.2-2.4 4.2-2.4 3.3 0 5.2 3.1 3.6 6.5C19 15.6 12 20 12 20Z" />
      <path d="M4 11h3l1.5-3 2 5 1.5-3h4" />
    </svg>
  );
}

export function IconLungs({ width = 22, height = 22, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M12 3v9" />
      <path d="M12 12c-1-2-3-2.5-4.5-1.5C5.5 12 5 15 5.5 18c.3 1.7 2 2.5 3.2 1.3C10 18 10 15.5 10 13" />
      <path d="M12 12c1-2 3-2.5 4.5-1.5 2 1.5 2.5 4.5 2 7.5-.3 1.7-2 2.5-3.2 1.3C14 18 14 15.5 14 13" />
    </svg>
  );
}

export function IconStethoscope({ width = 22, height = 22, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M5 3v6a4 4 0 0 0 8 0V3" />
      <path d="M9 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="19" cy="10" r="2" />
    </svg>
  );
}

export function IconActivity({ width = 22, height = 22, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <path d="M2 12h4l2 7 4-14 2 7h8" />
    </svg>
  );
}
