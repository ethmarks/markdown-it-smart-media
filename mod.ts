/**
 * Plugin for markdown-it to expand image syntax to support
 * audio, videos, and loop videos
 */

// We can only detect video/audio files from the extension in the URL.
// We default to video for ambiguous extensions (MPG, MP4, WebM)

/** Common browser-compatible audio extentions */
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
 * A mapping of messageKeys to actual message texts
 *
 * TODO: implement multilingual support
 */
const messages = {
  "html5 video not supported":
    "Your browser does not support playing HTML5 video.",
  "html5 audio not supported":
    "Your browser does not support playing HTML5 audio.",
  "html5 media fallback link":
    'You can <a href="%s" download>download the file</a> instead.',
  "html5 media description": "Here is a description of the content: %s",
};
