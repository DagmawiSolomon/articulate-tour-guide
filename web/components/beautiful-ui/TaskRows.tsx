"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * TASK ROWS — BUI #06 live agent task status
 *
 * Expandable rows showing running / completed / failed
 * agent tasks. Uses a spinning SVG ring counter for in-
 * progress tasks, a green check for completed, and a red
 * X for failed.  Direct implementation of the BeautifulUI
 * Task Rows primitive, adapted to Articulate tokens.
 * ───────────────────────────────────────────────────────── */

export type TaskStatus = "running" | "done" | "failed" | "waiting";

export type TaskRowItem = {
  id: string;
  label: string;
  detail?: string;
  status: TaskStatus;
  /** Sub-rows shown when expanded */
  subRows?: Array<{ label: string; value?: string }>;
};

interface TaskRowsProps {
  tasks: TaskRowItem[];
  className?: string;
}

function SpinnerRing({ step, total }: { step: number; total: number }) {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const dash = (step / total) * circ;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: 24, height: 24 }}
    >
      <svg
        width="24"
        height="24"
        className="absolute inset-0"
        style={{ animation: "spin 1.1s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
      <span className="relative text-[10.5px] font-semibold tabular-nums text-ink">
        {step}
      </span>
    </span>
  );
}

function CheckIcon() {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
      style={{
        background: "var(--green)",
        animation: "pop-in 300ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

function FailIcon() {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
      style={{
        background: "var(--red)",
        animation: "pop-in 300ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </span>
  );
}

function WaitIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line" />
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === "done")
    return (
      <span className="inline-flex h-5 items-center rounded-full px-2 text-[11.5px] font-medium"
        style={{ background: "var(--green-tint)", color: "var(--green)" }}>
        Done
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex h-5 items-center rounded-full px-2 text-[11.5px] font-medium"
        style={{ background: "var(--red-tint)", color: "var(--red)" }}>
        Failed
      </span>
    );
  if (status === "running")
    return (
      <span className="inline-flex h-5 items-center rounded-full px-2 text-[11.5px] font-medium"
        style={{ background: "var(--field)", color: "var(--ink-2)" }}>
        Running
      </span>
    );
  return (
    <span className="inline-flex h-5 items-center rounded-full px-2 text-[11.5px] font-medium"
      style={{ background: "var(--field)", color: "var(--ink-3)" }}>
      Waiting
    </span>
  );
}

function TaskRow({ task, index }: { task: TaskRowItem; index: number }) {
  const [open, setOpen] = React.useState(false);
  const hasSubRows = task.subRows && task.subRows.length > 0;
  const runningStep = task.status === "running" ? 1 : 0;

  return (
    <div
      className="self-stretch overflow-hidden transition-[border-radius,background-color] duration-300 hover:bg-inset"
      style={{
        background: "var(--surface)",
        borderRadius: 22,
        boxShadow: "var(--shadow-card)",
        animation: `fade-up 450ms cubic-bezier(0.23,1,0.32,1) ${index * 80}ms both`,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => hasSubRows && setOpen((v) => !v)}
        className="flex h-11 w-full items-center gap-2.5 px-2.5 text-left"
        style={{ cursor: hasSubRows ? "pointer" : "default" }}
      >
        {/* Status icon */}
        <span className="flex size-6 shrink-0 items-center justify-center">
          {task.status === "done" && <CheckIcon />}
          {task.status === "failed" && <FailIcon />}
          {task.status === "waiting" && <WaitIcon />}
          {task.status === "running" && (
            <SpinnerRing step={runningStep} total={4} />
          )}
        </span>

        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
          {task.label}
        </span>

        {task.detail && (
          <span className="text-[12.5px] tabular-nums" style={{ color: "var(--ink-2)" }}>
            {task.detail}
          </span>
        )}

        <StatusBadge status={task.status} />

        {hasSubRows && (
          <span
            aria-hidden="true"
            className="-ml-2 flex size-7 shrink-0 items-center justify-center rounded-full"
            style={{ color: "var(--ink-3)" }}
          >
            <ChevronDown open={open} />
          </span>
        )}
      </button>

      {/* Expandable sub-rows */}
      {hasSubRows && (
        <div
          className="grid transition-[grid-template-rows,opacity] duration-300"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          <div className="overflow-hidden">
            <div className="mb-2.5 grid grid-cols-[24px_1fr] gap-2.5 px-2.5">
              <span
                aria-hidden="true"
                className="mx-auto h-full w-px"
                style={{ background: "var(--line)" }}
              />
              <div className="flex flex-col gap-1.5">
                {task.subRows!.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: "var(--ink-2)" }}>
                      {sub.label}
                    </span>
                    {sub.value && (
                      <span
                        className="font-mono text-[11.5px] tabular-nums"
                        style={{ color: "var(--ink-3)" }}
                      >
                        {sub.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskRows({ tasks, className = "" }: TaskRowsProps) {
  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {tasks.map((task, i) => (
        <TaskRow key={task.id} task={task} index={i} />
      ))}
    </div>
  );
}
