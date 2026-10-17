import React, { useEffect, useRef, useState } from "react";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// "₹12.5K" -> { pre:"₹", num:12.5, suf:"K", dec:1 } | "1,234" | 56 | "—" (null => no animation)
const parse = (v) => {
  if (typeof v === "number") return { pre: "", num: v, suf: "", dec: Number.isInteger(v) ? 0 : 1 };
  if (typeof v !== "string") return null;
  const m = v.match(/^([^\d-]*)(\d[\d,]*(?:\.(\d+))?)(.*)$/);
  if (!m) return null;
  return { pre: m[1], num: parseFloat(m[2].replace(/,/g, "")), suf: m[4], dec: m[3] ? m[3].length : 0 };
};

const AnimatedNumber = ({ value, duration = 850 }) => {
  const p = parse(value);
  const target = p ? p.num : 0;
  const [cur, setCur] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (!p) return;
    if (reduced()) {
      setCur(target);
      from.current = target;
      return;
    }
    let raf;
    let t0;
    const start = from.current;
    const step = (ts) => {
      if (t0 === undefined) t0 = ts;
      const k = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      const v = start + (target - start) * eased;
      setCur(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  if (!p) return <>{value ?? "—"}</>;
  const shown = cur.toLocaleString("en-IN", { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec });
  return <>{p.pre}{shown}{p.suf}</>;
};

export default AnimatedNumber;