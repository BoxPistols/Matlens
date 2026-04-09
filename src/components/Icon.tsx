const ICONS = {
  dashboard: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="3" height="6" rx="1"/></svg>,
  list:       <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>,
  plus:       <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm1 9H7V9H5V7h2V5h2v2h2v2H9v2z"/></svg>,
  search:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  vecSearch:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="4"/><path d="M9.5 9.5L14 14" strokeLinecap="round"/><circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/></svg>,
  rag:        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zm7 0h5v5H9zM2 9h5v5H2zm7 1l4 2-4 2z"/></svg>,
  similar:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="5" cy="5" r="3"/><circle cx="11" cy="11" r="3"/><path d="M7.5 7.5L8.5 8.5" strokeLinecap="round"/></svg>,
  mic:        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="5" y="1" width="6" height="9" rx="3" fill="currentColor" stroke="none"/><path d="M3 8a5 5 0 0010 0M8 13v2M6 15h4"/></svg>,
  help:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="7"/><path d="M6.2 6.2C6.2 5 7 4.2 8 4.2c1.1 0 1.8.8 1.8 1.8 0 .8-.4 1.3-1.1 1.7C8.1 8 7.8 8.4 7.8 9v.3"/><circle cx="7.8" cy="11" r=".6" fill="currentColor" stroke="none"/></svg>,
  about:      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h8v2H2zm0 4h10v2H2z"/></svg>,
  settings:   <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5a3 3 0 100 6A3 3 0 008 5zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/><path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z"/></svg>,
  chevronLeft:<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2L3 5l4 3"/></svg>,
  chevronRight:<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2l4 3-4 3"/></svg>,
  chevronDown:<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3l3 4 3-4"/></svg>,
  close:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  check:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>,
  edit:       <svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.7 2.3a1 1 0 011.4 1.4l-9 9L2 14l1.3-2.1 9-9.6z"/></svg>,
  trash:      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h4l1 2H5L6 2zM3 5h10l-1 9H4L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z"/></svg>,
  download:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>,
  upload:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10V2M5 5l3-3 3 3M3 13h10"/></svg>,
  copy:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M5 5V3a1 1 0 00-1-1H2a1 1 0 00-1 1v8a1 1 0 001 1h2"/></svg>,
  speaker:    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 5.5h2.5l3.5-3v11l-3.5-3H3a1 1 0 01-1-1v-3a1 1 0 011-1zm9 .5a4 4 0 010 4M10.5 4A6 6 0 0113 8a6 6 0 01-2.5 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  stop:       <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>,
  refresh:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a6 6 0 0110.5-4M14 2v4h-4"/><path d="M14 8a6 6 0 01-10.5 4M2 14v-4h4"/></svg>,
  play:       <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>,
  spark:      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5H15l-4.5 3.3 1.7 5.2L8 11.3l-4.2 3.2 1.7-5.2L1 6h5.5z"/></svg>,
  embed:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 7.5l4-2.5M6 8.5l4 2.5"/></svg>,
  warning:    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 14h14L8 1zm0 3l4.5 8h-9L8 4zm-.5 3v3h1V7h-1zm0 4v1h1v-1h-1z"/></svg>,
  info:       <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3zm-.5 3.5v1h1v-1h-1zm0 2v4h1v-4h-1z"/></svg>,
  filter:     <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14l-5 5v6l-4-2V8L1 3z"/></svg>,
  sort:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M4 8h8M6 12h4"/></svg>,
  pdf:        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h7l4 4v10H3V1zm7 0v4h4M6 8h4M6 10.5h4M6 13h2"/></svg>,
  json:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 3C3 3 2 4 2 5v2c0 1-1 1.5-1 2s1 1 1 2v2c0 1 1 2 2 2M12 3c1 0 2 1 2 2v2c0 1 1 1.5 1 2s-1 1-1 2v2c0 1-1 2-2 2"/></svg>,
  csv:        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h7l4 4v10H3V1zm7 0v4h4"/><path d="M5 9.5C5 8.7 5.7 8 6.5 8S8 8.7 8 9.5 7.3 11 6.5 11 5 10.3 5 9.5zM9 8.5l2 2-2 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  report:     <svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="1" width="12" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h6M5 7.5h6M5 10h4"/></svg>,
  ai:         <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/></svg>,
  scan:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 5V2h3M12 2h3v3M15 11v3h-3M4 14H1v-3"/><path d="M3 8h10" strokeDasharray="2 1.5"/></svg>,
};

export const Icon = ({ name, size = 16, className = '' }) => (
  <span
    role="img"
    aria-hidden="true"
    className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
    style={{ width: size, height: size }}
  >
    {ICONS[name] || null}
  </span>
);
