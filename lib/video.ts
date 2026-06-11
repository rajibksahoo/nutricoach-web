// Parse a coach-entered video URL into something the preview pane can embed.

export type VideoEmbed =
  | { kind: "youtube"; id: string; embedUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string }
  | { kind: "file"; url: string };

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
];

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

const FILE_PATTERN = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

export function parseVideoUrl(url: string | null | undefined): VideoEmbed | null {
  const u = url?.trim();
  if (!u) return null;

  for (const p of YOUTUBE_PATTERNS) {
    const m = u.match(p);
    if (m) {
      return {
        kind: "youtube",
        id: m[1],
        embedUrl: `https://www.youtube-nocookie.com/embed/${m[1]}`,
      };
    }
  }

  const vm = u.match(VIMEO_PATTERN);
  if (vm) {
    return {
      kind: "vimeo",
      id: vm[1],
      embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
    };
  }

  if (FILE_PATTERN.test(u)) return { kind: "file", url: u };

  return null;
}
