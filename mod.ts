import type MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

/**
 * Plugin for markdown-it to expand image syntax to support
 * audio, videos, and loop videos
 */

// We can only detect video/audio files from the extension in the URL.
// We default to video for ambiguous extensions (MPG, MP4, WebM)

/** Common browser-compatible audio extensions */
const validAudioExtensions = [
  "aac", // Advanced Audio Coding
  "flac", // Free Lossless Audio Codec
  "m4a", // MPEG-4 Audio (The audio-only sibling to .mp4)
  "mp3", // MPEG-1 Audio Layer III
  "oga", // Ogg Audio
  "opus", // Opus-specific Ogg container
  "wav", // Waveform Audio File Format
];

/** Common browser-compatible video extensions */
const validVideoExtensions = [
  "3gp", // Mobile legacy video
  "av1", // AV1 Video bitstream
  "m4v", // Apple video-specific container
  "mkv", // Matroska Video
  "mov", // QuickTime Movie
  "mp4", // MPEG-4 Part 14 (Unified container)
  "mpeg", // MPEG-1 or MPEG-2 video
  "mpg", // MPEG video
  "ogv", // Ogg Video
  "ts", // MPEG Transport Stream
  "webm", // WebM Video/Audio container
];

/**
 * The options and configuration for markdown-it-smart-media.
 */
interface MarkdownItSmartMediaOptions {
  /**
   * The HTML attributes to apply to audio tags.
   *
   * Default is "controls"
   */
  audioAttrs?: string;

  /**
   * The HTML attributes to apply to video tags.
   *
   * Default is "controls"
   */
  videoAttrs?: string;

  /**
   * The HTML attributes to apply to loop video tags.
   *
   * Default is "autoplay loop muted playsinline"
   */
  loopVideoAttrs?: string;
}

/** The audio attributes to default to if no override is specified. */
const defaultAudioAttrs = "controls";

/** The video attributes to default to if no override is specified. */
const defaultVideoAttrs = "controls";

/** The loop video attributes to default to if no override is specified. */
const defaultLoopVideoAttrs = "autoplay loop muted playsinline";

function guessMediaType(uri: string): "image" | "audio" | "video" {
  // Use a regex to isolate the file extension following a dot at
  // the end of the string.
  const extensionMatch = uri.match(/\.([^/.]+)$/);

  // If the match is null, the regex couldn't find any matches.
  // This indicates that the string didn't end in a file extension. We just fall
  // back to default behaviour in this case.
  if (extensionMatch === null) {
    return "image";
  }

  // We select the match index 1 to isolate the capture group.
  // This results in the bare extension, without a prefixed dot.
  // For example, "mp4" instead of ".mp4".
  const extension = extensionMatch[1].toLowerCase();

  // We check for video extensions first so that they take priority over audio
  // extensions.
  if (validVideoExtensions.includes(extension)) {
    return "video";
  }

  if (validAudioExtensions.includes(extension)) {
    return "audio";
  }

  // If the URI has a trailing file extension that wasn't in
  // validAudioExtensions or validVideoExtensions, it's probably an image
  // extension like "png" or "webp".
  // It could also be an extension like "txt" that isn't an image, video, or
  // audio file, but that's none of our business.
  return "image";
}

export function markdownItSmartMedia(
  md: MarkdownIt,
  options: MarkdownItSmartMediaOptions = {},
): MarkdownIt {
  const audioAttrs = options.audioAttrs ?? defaultAudioAttrs;
  const videoAttrs = options.videoAttrs ?? defaultVideoAttrs;
  const loopVideoAttrs = options.loopVideoAttrs ?? defaultLoopVideoAttrs;

  return md;
}
