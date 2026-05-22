# markdown-it-smart-media

A Deno-native `markdown-it` plugin that extends Markdown image syntax.

## Features

- Automatically detects media type from file extension and renders to HTML5
  `<video>` and `<audio>` tags.
- Supports GIF-like loop videos via the ":LOOP" keyword.
- Wraps media in `<figure>` tags and renders titles to `<figcaption>` tags.
- Fully configurable.

## Basic Usage

```ts
import MarkdownIt from "npm:markdown-it";
import { smartMediaPlugin } from "jsr:@ethmarks/markdown-it-smart-media";

const md = new MarkdownIt();

md.use(smartMediaPlugin);

const html = md.render('![Alt text](waterfall.mp4 "Waterfall Timelapse")');
console.log(html);
```

Output (formatted for ease of reading):

```html
<p>
  <figure>
    <video
      src="waterfall.mp4"
      title="Waterfall Timelapse"
      controls
      aria-label="Alt text"
    >
    </video>
    <figcaption>Waterfall Timelapse</figcaption>
  </figure>
</p>
```

## Syntax Guide

### Media Types

`markdown-it-smart-media` infers the media type of the source based on the file
extension.

If the source ends in one of these following extensions, it will be treated as a
video: `.mp4`, `.webm`, `.mov`, `.av1`, `.m4v`, `.mkv`, `.mpeg`, `.mpg`, `.ogv`,
`.3gp`.

If the source ends in one of these following extensions, it will be treated as
audio: `.mp3`, `.opus`, `.m4a`, `.wav`, `.aac`, `.flac`, `.oga`.

If the source doesn't have a file extension or if the extension doesn't match
any recognized audio or video extensions, `markdown-it-smart-media` defaults to
treating it like an image.

Examples of media type inference:

| Source                       | Media Type |
| ---------------------------- | ---------- |
| waterfall.png                | image      |
| birdsong.mp3                 | audio      |
| timelapse.mp4                | video      |
| code.py                      | image      |
| The HORSE is a noble animal. | image      |

Examples of output for each media type:

| Markdown                  | HTML                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `![Alt](img.png)`         | `<img src="img.png" alt="Alt">`                                                    |
| `![Alt](audio.mp3)`       | `<audio src="audio.mp3" controls aria-label="Alt"></audio>`                        |
| `![Alt](video.mp4)`       | `<video src="video.mp4" controls aria-label="Alt"></video>`                        |
| `![:LOOP Alt](video.mp4)` | `<video src="video.mp4" autoplay loop muted playsinline aria-label="Alt"></video>` |

### Figure Tags

If the `wrapInFigureTags` option is enabled (as is the default), the `<img>`,
`<audio>`, or `<video>` will be wrapped in `<figure>` tags. If a title is
provided, it is rendered in `<figcaption>` tags.

| Markdown                  | HTML                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `![Alt](img.png)`         | `<figure><img src="img.png" alt="Alt"></figure>`                               |
| `![Alt](img.png "Title")` | `<figure><img src="img.png" alt="Alt"><figcaption>Title</figcaption></figure>` |

## Loop Videos

If the alt text of a video begins with ":LOOP", `markdown-it-smart-media`
processes it as a loop video. The ":LOOP" text is stripped from the final alt
text.

| Category  | Normal Videos                                               | GIFs                            | Loop Videos                                                                       |
| --------- | ----------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| HTML      | `<video src="video.mp4" controls aria-label="Alt"></video>` | `<img src="img.gif" alt="Alt">` | `<video src="loop.mp4" autoplay loop muted playsinline aria-label="Alt"></video>` |
| Behavior  | Acts like a normal video                                    | Acts like a GIF                 | Acts like a GIF                                                                   |
| File Size | Small (Efficient)                                           | Large (Inefficient)             | Small (Efficient)                                                                 |

This is often preferable to using an actual GIF because the GIF format is
notoriously inefficient and low-quality. By using a video file behind the scenes
and using HTML attributes to make the video behave like a GIF, you can
dramatically reduce the file size and increase the quality.

### Example

```md
![:LOOP A cartoon dog wearing a hat sitting at a table while its house is actively ablaze](this-is-fine.webm)
```

Output:

```html
<p>
  <figure>
    <video
      src="this-is-fine.webm"
      autoplay
      loop
      muted
      playsinline
      aria-label="A cartoon dog wearing a hat sitting at a table while its house is actively ablaze"
    >
    </video>
  </figure>
</p>
```

## Credits

This plugin is largely just a modern rewrite of
[`markdown-it-html5-media`](https://github.com/eloquence/markdown-it-html5-media).
Key differences:

- Deno-native and written in TypeScript.
- Supports loop videos.
- Supports `<figure>` wrapping and `<figcaption>`.

## License

This project is under a Creative Commons Zero dedication. See [LICENSE](LICENSE)
for more information.
