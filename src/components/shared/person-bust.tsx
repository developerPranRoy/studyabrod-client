import type { ReactNode, CSSProperties } from "react";

export type HairStyle = "short" | "long" | "bun" | "cap" | "curly" | "bob";

const HAIR: Record<HairStyle, ReactNode> = {
  short: <ellipse cx="100" cy="112" rx="53" ry="61" />,
  long: <rect x="43" y="54" width="114" height="214" rx="56" />,
  bob: <rect x="47" y="58" width="106" height="152" rx="52" />,
  bun: (
    <>
      <ellipse cx="100" cy="112" rx="53" ry="61" />
      <circle cx="100" cy="36" r="22" />
    </>
  ),
  cap: (
    <>
      <path d="M36 124a64 64 0 0 1 128 0z" />
      <rect x="118" y="116" width="64" height="16" rx="8" />
    </>
  ),
  curly: (
    <>
      <circle cx="63" cy="86" r="28" />
      <circle cx="100" cy="58" r="32" />
      <circle cx="137" cy="86" r="28" />
      <circle cx="53" cy="124" r="24" />
      <circle cx="147" cy="124" r="24" />
    </>
  ),
};

export function PersonBust({
  hair,
  fill,
  hairFill,
  style,
}: {
  hair: HairStyle;
  fill: string;
  hairFill?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="-70 0 340 400"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
    >
      <g fill={hairFill ?? fill}>{HAIR[hair]}</g>
      <g fill={fill}>
        <ellipse cx="100" cy="126" rx="44" ry="52" />
        <rect x="85" y="164" width="30" height="46" rx="14" />
        <path d="M6 360 L6 268 Q6 214 58 204 L142 204 Q194 214 194 268 L194 360 Z" />
      </g>
    </svg>
  );
}
