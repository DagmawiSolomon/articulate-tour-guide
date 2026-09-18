import * as React from "react";

export type HugeIconData =
  | Array<[string, Record<string, string | number>]>
  | ReadonlyArray<readonly [string, { readonly [key: string]: string | number }]>;

interface HugeIconProps extends React.SVGProps<SVGSVGElement> {
  icon: HugeIconData;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
}

export const HugeIcon = React.forwardRef<SVGSVGElement, HugeIconProps>(
  ({ icon, size = 16, color, strokeWidth, className = "", ...props }, ref) => {
    if (!icon || !Array.isArray(icon)) return null;

    const strokeColor = color ?? "currentColor";

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={`inline-flex shrink-0 ${className}`}
        aria-hidden="true"
        {...props}
      >
        {icon.map(([tag, attrs], index) => {
          const Tag = tag as any;
          const { key, strokeWidth: defaultStrokeWidth, stroke, ...restAttrs } = attrs;
          return (
            <Tag
              key={key ?? index}
              stroke={color ? color : (stroke !== undefined ? String(stroke) : "currentColor")}
              strokeWidth={strokeWidth ?? defaultStrokeWidth ?? 1.75}
              {...restAttrs}
            />
          );
        })}
      </svg>
    );
  }
);

HugeIcon.displayName = "HugeIcon";
