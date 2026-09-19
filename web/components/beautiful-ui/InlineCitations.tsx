import * as React from "react";
import styles from "./InlineCitations.module.css";

export type CiteRef = { n: number; label: string; host: string; url: string };

function CiteArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
  );
}

export function InlineCitations({
  text = "",
  refs = [],
  showFooter = true,
  className = "",
}: {
  text?: string;
  refs?: CiteRef[];
  showFooter?: boolean;
  className?: string;
}) {
  // Markers like [1] in the text become small numbered chips that link to
  // the source and reveal the reference name in a tooltip on hover.
  const parts = text.split(/(\[\d+\])/g);
  return (
    <div className={`${styles.citeProse} ${className}`.trim()}>
      <p>
        {parts.map((part, i) => {
          const m = part.match(/^\[(\d+)\]$/);
          if (!m) return <span key={i}>{part}</span>;
          const r = refs.find((x) => x.n === Number(m[1]));
          return r ? (
            <span key={i} className={styles.citeTip}>
              <a className={styles.citeMark} href={r.url} target="_blank" rel="noreferrer">{r.n}</a>
              <span className={styles.citeTipBox} role="tooltip">{r.label}</span>
            </span>
          ) : (
            <span key={i} className={styles.citeMark}>{m[1]}</span>
          );
        })}
      </p>
      {showFooter && refs.length > 0 && (
        <div className={styles.citeFooter}>
          {refs.map((r) => (
            <a key={r.n} className={styles.citeRef} href={r.url} target="_blank" rel="noreferrer">
              <span className={styles.citeMark}>{r.n}</span>
              <span className={styles.citeRefLabel}>{r.label}</span>
              <span className={styles.citeSep}>·</span>
              <span className={styles.citeRefHost}>{r.host}</span>
              <span className={styles.citeArrow} aria-hidden><CiteArrow /></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
