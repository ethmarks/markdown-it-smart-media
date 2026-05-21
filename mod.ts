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
 * The mapping of messageKeys to actual message texts
 */
interface MessageMap {
  /**
   * The message to display if the HTML5 <video> tag is not supported.
   *
   * Default is "Your browser does not support playing HTML5 video."
   */
  "html5 video not supported": string;

  /**
   * The message to display if the HTML5 <audio> tag is not supported.
   *
   * Default is "Your browser does not support playing HTML5 audio."
   */
  "html5 audio not supported": string;

  /**
   * The message that provides a fallback link to the media.
   * Use "%s" as the placeholder for the link.
   *
   * Default is "You can <a href="%s" download>download the file</a> instead."
   */
  "html5 media fallback link": string;

  /**
   * The message that provides a fallback description of the media.
   * Use "%s" as the placeholder for the description
   *
   * Default is "Here is a description of the content: %s"
   */
  "html5 media description": string;
}

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

  /** The text of fallback messages  */
  messages?: MessageMap;
}

/** The audio attributes to default to if no override is specified. */
const defaultAudioAttrs = "controls";

/** The video attributes to default to if no override is specified. */
const defaultVideoAttrs = "controls";

/** The loop video attributes to default to if no override is specified. */
const defaultLoopVideoAttrs = "autoplay loop muted playsinline";

/** The messages to default to if no override is specified. */
const defaultMessages: MessageMap = {
  "html5 video not supported":
    "Your browser does not support playing HTML5 video.",
  "html5 audio not supported":
    "Your browser does not support playing HTML5 audio.",
  "html5 media fallback link":
    'You can <a href="%s" download>download the file</a> instead.',
  "html5 media description": "Here is a description of the content: %s",
};

export function markdownItSmartMedia(
  md: MarkdownIt,
  options: MarkdownItSmartMediaOptions = {},
): MarkdownIt {
  const audioAttrs = options.audioAttrs ?? defaultAudioAttrs;
  const videoAttrs = options.videoAttrs ?? defaultVideoAttrs;
  const loopVideoAttrs = options.loopVideoAttrs ?? defaultLoopVideoAttrs;
  const messages = options.messages ?? defaultMessages;

  return md;
}
