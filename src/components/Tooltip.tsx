import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export const Tooltip = ({ label, placement = 'bottom', children, className = '' }) => {
  const triggerRef = useRef(null);
  const timerRef   = useRef(null);
  const [pos, setPos]       = useState(null);
  const [visible, setVisible] = useState(false);
  const DELAY = 500;
  const GAP   = 8;
  const MARGIN = 10;

  const calcPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r   = el.getBoundingClientRect();
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const TW = 180;
    const TH = 28;
    let top, left, arrowLeft = '50%', placementUsed = placement;

    if (placement === 'bottom') {
      top  = r.bottom + GAP;
      left = r.left + r.width / 2 - TW / 2;
    } else if (placement === 'top') {
      top  = r.top - TH - GAP;
      left = r.left + r.width / 2 - TW / 2;
    } else {
      top  = r.top + r.height / 2 - TH / 2;
      left = r.right + GAP;
      arrowLeft = '50%';
    }

    if (placement !== 'right' && left + TW > vw - MARGIN) {
      const overflow = (left + TW) - (vw - MARGIN);
      arrowLeft = Math.max(12, TW/2 - overflow) + 'px';
      left = Math.max(MARGIN, vw - MARGIN - TW);
    }
    if (left < MARGIN) {
      arrowLeft = Math.max(12, r.left + r.width/2 - MARGIN) + 'px';
      left = MARGIN;
    }
    if (placement === 'bottom' && top + TH > vh - MARGIN) {
      top = r.top - TH - GAP;
      placementUsed = 'top';
    }

    setPos({ top, left, arrowLeft, placement: placementUsed });
  }, [placement]);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      calcPos();
      setVisible(true);
    }, DELAY);
  }, [calcPos]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setPos(null);
  }, []);

  if (!label) return <span ref={triggerRef} className={className}>{children}</span>;

  const portal = pos && createPortal(
    <div
      role="tooltip"
      className={`tt-portal tt-${pos.placement}${visible ? ' tt-visible' : ''}`}
      style={{
        top:  pos.top,
        left: pos.left,
        '--tt-arrow': pos.arrowLeft,
      }}
    >
      {label}
    </div>,
    document.body
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={`tt-wrap ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {portal}
    </>
  );
};
