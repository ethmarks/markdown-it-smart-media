import type MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";
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
  "webm", // WebM Video/Audio container
];

/** The three different types of media that MarkdownItSmartMedia can handle. */
export type MediaType = "image" | "audio" | "video";

export interface MarkdownItSmartMediaRule {
  /** The media types that the rule applies to. */
  mediaTypes: MediaType[];

  /** The regex to match against the input. */
  regex: RegExp;

  /**
   * The property of the media token to match against the regex to determine
   * whether or not the rule applies.
   *
   * - alt: Tries to match the alt text with the regex. If a match is found, the capture group is removed from the alt text before rendering.
   * - source: Tries to match the source URI with the regex. If a match is found, the capture group is removed from the source before rendering.
   */
  inputType: "alt" | "source";

  /**
   * How to process the part of the input matched by the capture group of the
   * regex.
   *
   * - strip: Remove the capture group. Example: "apple banana cherry" + `/apple (banana)/` = "apple cherry".
   * - isolate: Remove everything except for the capture group. Example: "apple banana cherry" + `/apple (banana)/` = "banana".
   *
   * To preserve the input without stripping or isolating, use a regex without a capture group.
   */
  inputCapture: "strip" | "isolate";

  /**
   * The property that the rule affects.
   *
   * - attr: Overrides the attributes of the media HTML tag.
   * - template: Overrides the default template used to generate the media
   *             HTML.
   */
  effectType: "attr" | "template";

  /**
   * The value of the rule's effect. Behavior depends on outputType.
   *
   * - if outputType is "attr": The string to inject into the attributes of
   * the media HTML tag.
   *    - Example: "autoplay loop muted playsinline"
   * - if outputType is "template": the template used to render the generate
   *   the media HTML. You can use placeholders wrapped in double curly
   *   braces for dynamic values.
   *    - {{src}}: The processed source URI. Example: `watefall.mp4`.
   *    - {{title}}: The processed title. Optional.
   *                 Example: `Waterfall Timelapse`.
   *    - {{alt}}: The processed description, typically used in the alt or
   *               aria-label attributes. Example: `Alt text`.
   *    - {{attrs}}: The processed attributes. Example: `controls`.
   *    - Example:
   *     `<video src="{{src}}" title="{{title}}" aria-label="{{alt}}" {{attrs}}></video>`
   *    - Output of Example:
   *     `<video src="waterfall.mp4" title="Waterfall Timelapse" aria-label="Alt text" controls></video>`
   */
  value: string;
}

/**
 * The options and configuration for markdown-it-smart-media.
 */
export interface MarkdownItSmartMediaOptions {
  imageTemplate?: string;
  imageAttrs?: string;

  audioTemplate?: string;
  audioAttrs?: string;

  videoTemplate?: string;
  videoAttrs?: string;

  /**
   * Whether or not to wrap media tags in <figure> tags.
   *
   * Default is true
   */
  wrapInFigureTags?: boolean;

  rules?: MarkdownItSmartMediaRule[];
}

const defaultImageTemplate = '<img src="{{src}}" alt="{{alt}}">';
const defaultImageAttrs = "";

const defaultAudioTemplate =
  '<audio src="{{src}}" title="{{title}}" aria-label="{{alt}}" {{attrs}}></audio>';
const defaultAudioAttrs = "controls";

const defaultVideoTemplate =
  '<video src="{{src}}" title="{{title}}" aria-label="{{alt}}" {{attrs}}></video>';
const defaultVideoAttrs = "controls";

/** The default value of wrapInFigureTags if no override is specified. */
const defaultwrapInFigureTags = true;

const defaultRules: MarkdownItSmartMediaRule[] = [
  // Loop video rule
  {
    // Only applies to videos
    mediaTypes: ["video"],

    // Searches for the text ":LOOP " and captures it
    regex: /(:LOOP )/,

    // Uses alt text as input
    inputType: "alt",

    // Strip the ":LOOP " from the final alt text
    inputCapture: "strip",

    // Overrides the attributes
    effectType: "attr",

    // Uses GIF-like video attributes
    value: "autoplay loop muted playsinline",
  },
];

/**
 * Guess the media type based on the file extension of the URI.
 *
 * Defaults to "image" if URI isn't _clearly_ an audio or video file.
 *
 * Examples:
 *
 * - "waterfall.png" -> "image"
 * - "birdsong.mp3" -> "audio"
 * - "timelapse.mp4" -> "video"
 * - "code.py" -> "image"
 * - "The HORSE is a noble animal." -> "image"
 */
export function guessMediaType(uri: string): MediaType {
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

/**
 * Fill in the placeholders of a template.
 */
function processTemplate(template: string, data: Record<string, string>) {
  let result = template;
  for (const key in data) {
    result = result.replaceAll(`{{${key}}}`, data[key]);
  }
  return result;
}

/**
 * Plugin for markdown-it to expand Markdown image syntax to support audio,
 * videos, and loop videos.
 */
export function smartMediaPlugin(
  md: MarkdownIt,
  options: MarkdownItSmartMediaOptions = {},
): MarkdownIt {
  const imageTemplate = options.imageTemplate ?? defaultImageTemplate;
  const imageAttrs = options.imageAttrs ?? defaultImageAttrs;
  const audioTemplate = options.audioTemplate ?? defaultAudioTemplate;
  const audioAttrs = options.audioAttrs ?? defaultAudioAttrs;
  const videoTemplate = options.videoTemplate ?? defaultVideoTemplate;
  const videoAttrs = options.videoAttrs ?? defaultVideoAttrs;
  const wrapInFigureTags = options.wrapInFigureTags ?? defaultwrapInFigureTags;
  const rules = options.rules ?? defaultRules;

  // Override the image rule
  md.renderer.rules.image = (
    tokens: Token[],
    idx: number,
    _renderOptions: MarkdownItOptions,
    _env: any,
    _self: Renderer,
  ) => {
    const token = tokens[idx];

    // Extract src
    const srcIndex = token.attrIndex("src");
    let src = srcIndex >= 0 ? token.attrs![srcIndex][1] : "";

    // Extract title (e.g., ![alt](url "title"))
    const titleIndex = token.attrIndex("title");
    const title = titleIndex >= 0 ? token.attrs![titleIndex][1] : "";

    // The alt text is stored in token.content
    let alt = token.content || "";

    // Guess the mediaType from the URI
    const mediaType = guessMediaType(src);

    // Set the initial template (before rules are applied) to the template
    // corresponding to the mediaType.
    let template: string = mediaType === "video"
      ? videoTemplate
      : mediaType === "audio"
      ? audioTemplate
      : imageTemplate;

    // Set the initial attribute string (before rules are applied) to the
    // attribute string corresponding to the mediaType.
    let attrs: string = mediaType === "video"
      ? videoAttrs
      : mediaType === "audio"
      ? audioAttrs
      : imageAttrs;

    // Apply all rules.
    rules
      // Filter to rules that apply to the token's mediaType.
      .filter((r) => r.mediaTypes.includes(mediaType))
      // Iterate over each rule.
      .forEach((rule) => {
        // Define the effect function to be called if the rule applies.
        const effectFunc = () => {
          if (rule.effectType === "attr") {
            // Override the attribute string.
            attrs = rule.value;
          } else {
            // Override the template.
            template = rule.value;
          }
        };

        if (rule.inputType === "alt") {
          // The rule uses the alt text as input.

          // Attempt to match the alt text with the regex.
          const match = alt.match(rule.regex);

          // If a match couldn't be found, the rule doesn't apply and we should
          // return early.
          if (match === null) return;

          // We select the match index 1 to isolate the capture group.
          const capture = match[1];

          // If the regex captured something, process it according to the
          // inputCapture type.
          if (capture !== undefined) {
            if (rule.inputCapture === "strip") {
              // remove the capture from the alt text
              alt = alt.replaceAll(capture, "");
            } else {
              // set the alt text to the capture
              alt = capture;
            }
          }

          // Call the effect function to override either the attribute string
          // or the template.
          effectFunc();
        } else {
          // The rule uses the source URI as input.

          // Attempt to match the URI with the regex.
          const match = src.match(rule.regex);

          // If a match couldn't be found, the rule doesn't apply and we should
          // return early.
          if (match === null) return;

          // We select the match index 1 to isolate the capture group.
          const capture = match[1];

          // If the regex captured something, process it according to the
          // inputCapture type.
          if (capture !== undefined) {
            if (rule.inputCapture === "strip") {
              // remove the capture from the URI
              src = src.replaceAll(capture, "");
            } else {
              // set the URI text to the capture
              src = capture;
            }
          }

          // Call the effect function to override either the attribute string
          // or the template.
          effectFunc();
        }
      });

    // Escape HTML to prevent XSS
    const escapedSrc = md.utils.escapeHtml(src);
    const escapedTitle = md.utils.escapeHtml(title);
    const escapedAlt = md.utils.escapeHtml(alt);

    const innerHTML = processTemplate(template, {
      src: escapedSrc,
      title: escapedTitle,
      alt: escapedAlt,
      attrs,
    });

    if (wrapInFigureTags) {
      const figCaptionHTML = title
        ? `<figcaption>${escapedTitle}</figcaption>`
        : "";
      return `<figure>${innerHTML}${figCaptionHTML}</figure>`;
    }
    return innerHTML;
  };

  return md;
}
