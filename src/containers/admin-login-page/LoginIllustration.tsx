import styles from "@/styles/pages/admin.module.css";

/* ============================================================
   LOGIN ILLUSTRATION
   ------------------------------------------------------------
   Isometric "people setting up the dashboard" scene for the
   admin sign-in page. Inline SVG; every color comes from a
   theme token through the .art-* classes in admin.module.css,
   so it follows light and dark mode. Decorative (aria-hidden).
   ============================================================ */

// ─── Isometric helpers ───────────────────────────────────────

/** Skews a flat panel so it stands along an iso edge (2:1 slope). */
const STAND_RIGHT = "skewY(26.565)";
const STAND_LEFT  = "skewY(-26.565)";

interface BlockProps {
    /** Center of the top face. */
    cx:     number;
    cy:     number;
    /** Half-width of the top face (its half-height is w / 2). */
    w:      number;
    /** Height of the side faces. */
    d:      number;
    /** Optional class for the top face (defaults to the surface color). */
    top?:   string;
    className?: string;
}

/** An isometric box: top face plus the two visible side faces. */
function Block({ cx, cy, w, d, top, className }: BlockProps) {
    const h = w / 2;
    return (
        <g className={className}>
            <polygon className={styles["art-side-l"]} points={`${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + d} ${cx - w},${cy + d}`} />
            <polygon className={styles["art-side-r"]} points={`${cx},${cy + h} ${cx + w},${cy} ${cx + w},${cy + d} ${cx},${cy + h + d}`} />
            <polygon className={top ?? styles["art-top"]} points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`} />
        </g>
    );
}

interface PersonProps {
    /** Point between the feet. */
    x:     number;
    y:     number;
    /** Shirt color class. */
    shirt: string;
}

/** A small stylised figure standing on a tile. */
function Person({ x, y, shirt }: PersonProps) {
    const leg = 14;
    return (
        <g transform={`translate(${x} ${y})`}>
            <path className={styles["art-leg"]} d={`M-2.5 0 V${-leg} M2.5 0 V${-leg}`} />
            <path className={shirt} d={`M-5.5 ${-leg} L-4.5 ${-leg - 15} Q0 ${-leg - 18} 4.5 ${-leg - 15} L5.5 ${-leg} Z`} />
            <circle className={styles["art-skin"]} cx={0} cy={-leg - 21} r={4.5} />
            <path className={styles["art-hair"]} d={`M-4.6 ${-leg - 21.5} a4.6 4.6 0 0 1 9.2 0 Z`} />
        </g>
    );
}

/** Rows of "text" lines on a screen, in the screen's own coordinates. */
function ScreenLines({ x, y, widths }: { x: number; y: number; widths: number[] }) {
    return (
        <>
            {widths.map((width, i) => (
                <rect key={i} className={styles["art-ink"]} x={x} y={y + i * 6} width={width} height={2.5} rx={1.25} />
            ))}
        </>
    );
}

// ─── Scene ───────────────────────────────────────────────────

export default function LoginIllustration() {
    return (
        <svg
            className={styles["login-art-svg"]}
            viewBox="0 0 600 520"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="login-art-glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" className={styles["art-stop-soft"]} />
                    <stop offset="1" className={styles["art-stop-warm"]} />
                </linearGradient>
            </defs>

            {/* Connectors on the floor (drawn first, under the tiles) */}
            <g className={styles["art-wire"]}>
                <path d="M162 176 L212 201 V230" />
                <path d="M432 146 V196 L404 210" />
                <path d="M300 368 V398" />
                <path d="M446 346 L410 328" />
                <path d="M118 312 L170 286" />
            </g>
            <g className={styles["art-wire-dot"]}>
                <circle cx={212} cy={230} r={3} />
                <circle cx={404} cy={210} r={3} />
                <circle cx={300} cy={368} r={3} />
                <circle cx={410} cy={328} r={3} />
                <circle cx={170} cy={286} r={3} />
            </g>

            {/* Network tile (back) */}
            <Block cx={255} cy={100} w={34} d={8} />
            <g className={styles["art-net"]}>
                <path d="M238 46 L268 30 L288 58 L256 74 Z M238 46 L288 58 M256 74 L255 98" />
            </g>
            <Block cx={238} cy={46} w={5} d={5} top={styles["art-top-warm"]} />
            <Block cx={268} cy={30} w={5} d={5} top={styles["art-top-accent"]} />
            <Block cx={288} cy={58} w={5} d={5} top={styles["art-top-warm"]} />
            <Block cx={256} cy={74} w={5} d={5} top={styles["art-top-accent"]} />

            {/* Top-right tile: bar-chart board and two people */}
            <Block cx={470} cy={124} w={66} d={12} />
            <g transform={`translate(420 52) ${STAND_LEFT}`}>
                <rect className={styles["art-screen"]} x={0} y={0} width={42} height={58} rx={3} />
                <rect className={styles["art-bar-warm"]} x={7}  y={30} width={5} height={20} />
                <rect className={styles["art-bar-warm"]} x={15} y={20} width={5} height={30} />
                <rect className={styles["art-bar"]}      x={23} y={34} width={5} height={16} />
                <rect className={styles["art-bar-warm"]} x={31} y={14} width={5} height={36} />
                <ScreenLines x={7} y={7} widths={[22, 14]} />
            </g>
            <Person x={474} y={130} shirt={styles["art-shirt-accent"]} />
            <Person x={496} y={124} shirt={styles["art-shirt-light"]} />

            {/* Top-left tile: analyst at a line-chart board */}
            <Block cx={130} cy={152} w={62} d={12} />
            <g transform={`translate(138 64) ${STAND_RIGHT}`}>
                <rect className={styles["art-screen"]} x={0} y={0} width={46} height={58} rx={3} />
                <path className={styles["art-line"]} d="M6 40 L13 26 L20 33 L27 18 L34 28 L40 22" />
                <circle className={styles["art-ring"]} cx={14} cy={48} r={4} />
                <circle className={styles["art-ring"]} cx={26} cy={48} r={4} />
                <ScreenLines x={6} y={6} widths={[20, 12]} />
            </g>
            <Person x={116} y={164} shirt={styles["art-shirt-light"]} />

            {/* Central dashboard platform */}
            <Block cx={300} cy={270} w={160} d={14} />
            <g transform="matrix(1 -0.5 1 0.5 140 270)">
                <rect className={styles["art-screen"]} x={10} y={10} width={140} height={140} rx={10} />
                <g className={styles["art-grid"]}>
                    <path d="M45 18 V142 M80 18 V142 M115 18 V142" />
                </g>
                <path className={styles["art-area"]} d="M22 86 C38 86 46 56 64 58 S92 34 108 44 S130 76 138 86 Z" />
                <path className={styles["art-area-line"]} d="M22 86 C38 86 46 56 64 58 S92 34 108 44 S130 76 138 86" />
                <path className={styles["art-area-alt"]} d="M22 86 C40 80 52 70 70 74 S100 60 116 66 S132 82 138 86" />
                {[34, 76, 118].map((u, i) => (
                    <g key={u}>
                        <circle className={styles["art-donut-track"]} cx={u} cy={116} r={12} />
                        <circle
                            className={styles["art-donut"]}
                            cx={u}
                            cy={116}
                            r={12}
                            strokeDasharray={`${[46, 30, 58][i]} 100`} />
                    </g>
                ))}
                <ScreenLines x={20} y={20} widths={[34, 22]} />
                <ScreenLines x={96} y={20} widths={[38, 26]} />
                <ScreenLines x={20} y={136} widths={[50]} />
                <ScreenLines x={94} y={136} widths={[44]} />
            </g>

            {/* Left steps with cubes and a person carrying one */}
            <Block cx={70}  cy={286} w={22} d={60} />
            <Block cx={104} cy={314} w={22} d={40} />
            <Block cx={138} cy={342} w={22} d={20} />
            <Block cx={70}  cy={276} w={8} d={8} top={styles["art-top-warm"]} className={styles["art-float"]} />
            <Block cx={104} cy={304} w={8} d={8} top={styles["art-top-accent"]} />
            <Block cx={138} cy={332} w={8} d={8} top={styles["art-top-warm"]} />
            <Person x={182} y={326} shirt={styles["art-shirt-warm"]} />
            <Block cx={182} cy={290} w={6} d={6} top={styles["art-top-warm"]} />

            {/* Right tile: glass KPI tower and an operator */}
            <Block cx={492} cy={364} w={66} d={12} />
            <g opacity={0.9}>
                <polygon fill="url(#login-art-glass)" points="444,350 470,363 470,293 444,280" />
                <polygon fill="url(#login-art-glass)" points="470,363 496,350 496,280 470,293" opacity={0.75} />
                <polygon className={styles["art-top-warm"]} points="470,267 496,280 470,293 444,280" />
            </g>
            <g transform={`translate(512 308) ${STAND_LEFT}`}>
                <rect className={styles["art-screen"]} x={0} y={0} width={30} height={40} rx={3} />
                <circle className={styles["art-ring"]} cx={10} cy={12} r={5} />
                <circle className={styles["art-ring"]} cx={21} cy={12} r={5} />
                <ScreenLines x={6} y={24} widths={[18, 12]} />
            </g>
            <Person x={530} y={384} shirt={styles["art-shirt-warm"]} />

            {/* Bottom tile: developer at a desk */}
            <Block cx={300} cy={432} w={64} d={12} />
            <g transform={`translate(304 370) ${STAND_LEFT}`}>
                <rect className={styles["art-screen"]} x={0} y={0} width={30} height={36} rx={3} />
                <path className={styles["art-line"]} d="M5 26 L11 18 L17 22 L25 10" />
            </g>
            <Block cx={316} cy={420} w={18} d={12} />
            <Person x={288} y={444} shirt={styles["art-shirt-accent"]} />

            {/* Floating cubes */}
            <Block cx={560} cy={226} w={10} d={10} top={styles["art-top-accent"]} className={styles["art-float"]} />
            <Block cx={46}  cy={186} w={9}  d={9}  top={styles["art-top-warm"]}   className={styles["art-float-slow"]} />
            <Block cx={420} cy={470} w={14} d={4}  className={styles["art-float-slow"]} />
        </svg>
    );
}
