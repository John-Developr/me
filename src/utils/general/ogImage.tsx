import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

// ----------------------
// Open Graph image renderer
// ----------------------
/**
 * Shared size for every generated Open Graph / Twitter image.
 * 1200x630 is the recommended size for large link previews.
 */
export const ogImageSize = { width: 1200, height: 630 };

/**
 * Colors mirror the `.dark` tokens in `src/styles/general/globals.css`.
 * They are duplicated here because ImageResponse cannot read CSS variables.
 */
const colors = {
  bg:          "#0d1117", // --bg
  container:   "#161b22", // --container-bg
  primary:     "#476fff", // --bg-primary
  text:        "#f8fafc", // --text
  textHeader:  "#e6edf3", // --text-header
  textMuted:   "#7d8590", // --text-muted
  divider:     "#30363d", // --divider-bottom
  online:      "#42dd88", // .online-indicator
};

interface OgImageProps {
  eyebrow:  string; // small uppercase label above the title
  title:    string; // main headline
  subtitle: string; // supporting line
}

/**
 * Renders a branded 1200x630 PNG for link previews.
 * Runs at build time (statically optimized) when used from an `opengraph-image.tsx` file.
 *
 * @example
 * export default function Image() {
 *   return renderOgImage({ eyebrow: "Contact", title: "Let's work together", subtitle: "..." });
 * }
 */
export function renderOgImage({ eyebrow, title, subtitle }: OgImageProps): ImageResponse {
  const avatar = fs.readFileSync(path.join(process.cwd(), "public/images/Avatar.jpg"));
  const avatarSrc = `data:image/jpeg;base64,${avatar.toString("base64")}`;

  // Long titles (e.g. blog posts) shrink so the card never overflows the image.
  const titleSize = title.length > 60 ? 44 : title.length > 36 ? 54 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 60,
          background: colors.bg,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            columnGap: 60,
            padding: "0 70px",
            borderRadius: 24,
            border: `1px solid ${colors.divider}`,
            background: colors.container,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 26,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: colors.primary,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.1,
                color: colors.textHeader,
              }}
            >
              {title}
            </div>
            <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.4, color: colors.textMuted }}>
              {subtitle}
            </div>
            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                columnGap: 12,
                fontSize: 24,
                color: colors.text,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 14, background: colors.online }} />
              johncarlo-portfolio.vercel.app
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports <img> */}
          <img
            src={avatarSrc}
            width={300}
            height={300}
            alt=""
            style={{ borderRadius: 40, objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    ogImageSize
  );
}
