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
  eyebrow:  string;         // small uppercase label above the title
  title:    string;         // main headline
  subtitle: string;         // supporting line
  photo?:   string | null;  // profile photo: Media Library URL or /public path (default Avatar.jpg)
  host?:    string;         // site address shown at the bottom
}

/** Image types Satori (ImageResponse) can draw. */
const DRAWABLE = /^image\/(png|jpeg|gif)$/;
const FALLBACK_PHOTO = "/images/Avatar.jpg";

/**
 * Loads an image as a data URI for ImageResponse: a /public path from disk,
 * or an http(s) URL (e.g. the Media Library). Returns null when it can't be
 * loaded or isn't PNG/JPEG/GIF (Satori can't draw WebP/AVIF).
 */
export async function loadImageDataUri(src: string): Promise<string | null> {
  try {
    if (src.startsWith("/")) {
      const file = path.join(process.cwd(), "public", path.normalize(src).replace(/^(\.\.[/\\])+/, ""));
      if (!file.startsWith(path.join(process.cwd(), "public"))) return null;
      const ext  = path.extname(file).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : null;
      return mime ? `data:${mime};base64,${fs.readFileSync(file).toString("base64")}` : null;
    }

    if (!/^https?:\/\//.test(src)) return null;
    const res  = await fetch(src);
    const mime = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !DRAWABLE.test(mime)) return null;
    return `data:${mime};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * A custom share image (SEO Settings → page → Share image), drawn full-bleed
 * at 1200x630. Returns null if it can't be loaded, so the caller can fall
 * back to the generated card.
 */
export async function renderCustomOgImage(src: string): Promise<ImageResponse | null> {
  const dataUri = await loadImageDataUri(src);
  if (!dataUri) return null;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports <img>
      <img src={dataUri} width={ogImageSize.width} height={ogImageSize.height} alt="" style={{ objectFit: "cover" }} />
    ),
    ogImageSize,
  );
}

/**
 * Renders a branded 1200x630 PNG for link previews: text on the left, the
 * profile photo on the right (Personal Profile photo, else Avatar.jpg).
 *
 * @example
 * export default function Image() {
 *   return renderOgImage({ eyebrow: "Contact", title: "Let's work together", subtitle: "...", photo, host });
 * }
 */
export async function renderOgImage({ eyebrow, title, subtitle, photo, host = "johncarlo-portfolio.vercel.app" }: OgImageProps): Promise<ImageResponse> {
  const avatarSrc = (photo ? await loadImageDataUri(photo) : null) ?? (await loadImageDataUri(FALLBACK_PHOTO))!;

  // Long titles (e.g. blog posts) shrink so the card never overflows the image.
  const titleSize = title.length > 60 ? 44 : title.length > 36 ? 52 : 60;

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
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
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
              {host}
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports <img> */}
          <img
            src={avatarSrc}
            width={300}
            height={300}
            alt=""
            style={{ flexShrink: 0, borderRadius: 40, objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    ogImageSize
  );
}
