# markdown-it-smart-media

A Deno-native `markdown-it` plugin that extends Markdown image syntax.

## Features

- Automatically detects media type from file extension and renders to HTML5
  `<video>` and `<audio>` tags.
- Supports GIF-like loop videos via the ":LOOP" keyword.
- Supports YouTube embed iframes.
- Wraps media in `<figure>` tags and renders titles to `<figcaption>` tags.
- Fully configurable with custom rule engine.

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

| Markdown            | HTML                                                        |
| ------------------- | ----------------------------------------------------------- |
| `![Alt](img.png)`   | `<img src="img.png" alt="Alt">`                             |
| `![Alt](audio.mp3)` | `<audio src="audio.mp3" controls aria-label="Alt"></audio>` |
| `![Alt](video.mp4)` | `<video src="video.mp4" controls aria-label="Alt"></video>` |

### Figure Tags

If the `wrapInFigureTags` option is enabled (as is the default), the `<img>`,
`<audio>`, or `<video>` will be wrapped in `<figure>` tags. If a title is
provided, it is rendered in `<figcaption>` tags.

| Markdown                  | HTML                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `![Alt](img.png)`         | `<figure><img src="img.png" alt="Alt"></figure>`                               |
| `![Alt](img.png "Title")` | `<figure><img src="img.png" alt="Alt"><figcaption>Title</figcaption></figure>` |

## Rules

`markdown-it-smart-media` features a rule engine that can be used to inject
attributes or override the HTML template if certain conditions are met.

It comes with a few rules by default. These can be disabled by passing an empty
array into the `rules` configuration field:

```ts
import MarkdownIt from "npm:markdown-it";
import { smartMediaPlugin } from "jsr:@ethmarks/markdown-it-smart-media";

const md = new MarkdownIt().use(smartMediaPlugin, {
  rules: [],
});
```

To add new rules without disabling the default ones, import the default rules
and use a spread operator.

```ts
import MarkdownIt from "npm:markdown-it";
import {
  defaultRules,
  type MarkdownItSmartMediaRule,
  smartMediaPlugin,
} from "jsr:@ethmarks/markdown-it-smart-media";

const customRule1: MarkdownItSmartMediaRule = {
  // ...
};

const customRule2: MarkdownItSmartMediaRule = {
  // ...
};

const md = new MarkdownIt().use(smartMediaPlugin, {
  rules: [...defaultRules, customRule1, customRule2],
});
```

See the configuration section for information on how to write custom rules.

### Loop Videos

One of the default `markdown-it-smart-media` rules is the loop video rule. If
the alt text of a video contains ":LOOP ", the rule injects the
`autoplay loop muted playsinline` attributes to make the `<video>` tag behave
like a GIF.

Using loop videos is often preferable to using an actual GIF because the GIF
format is notoriously inefficient and low-quality. By using a video file behind
the scenes and using HTML attributes to make the video behave like a GIF, you
can dramatically reduce the file size and increase the quality.

| Category  | Normal Videos                                               | GIFs                            | Loop Videos                                                                       |
| --------- | ----------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| HTML      | `<video src="video.mp4" controls aria-label="Alt"></video>` | `<img src="img.gif" alt="Alt">` | `<video src="loop.mp4" autoplay loop muted playsinline aria-label="Alt"></video>` |
| Behavior  | Acts like a normal video                                    | Acts like a GIF                 | Acts like a GIF                                                                   |
| File Size | Light (Efficient)                                           | Heavy (Inefficient)             | Light (Efficient)                                                                 |
| Quality   | High (16.7 million colors)                                  | Low (256 colors)                | High (16.7 million colors)                                                        |

Example:

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

Rule definition:

```ts
const loopVideoRule: MarkdownItSmartMediaRule = {
  // Only applies to videos
  mediaTypes: ["video"],

  // Searches for the text ":LOOP " and captures it
  regex: /(:LOOP )/,

  // Uses alt text as input
  inputType: "alt",

  // Strip the ":LOOP " from the final alt text
  inputCapture: "strip",

  // Overrides the attributes
  effectType: "attrs",

  // Uses GIF-like video attributes
  value: "autoplay loop muted playsinline",
};
```

### YouTube Embed Rule

One of the default `markdown-it-smart-media` rules is the YouTube embed rule. If
the source URI is a YouTube URL (i.e. it matches a regex designed to match
YouTube URLs), the rule captures the video ID and sets the HTML template to a
YouTube embed iframe.

Example:

```md
!["Never Gonna Give You Up" by Rick Astley](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```

Output:

```html
<p>
  <figure>
    <iframe
      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
      title="&quot;Never Gonna Give You Up&quot; by Rick Astley"
      class="youtube-embed"
      style="aspect-ratio: 16/9; width: 100%; border: 0"
      allow="autoplay; encrypted-media;"
      allowfullscreen
    ></iframe>
  </figure>
</p>
```

Rule definition:

```ts
const youtubeEmbedRule: MarkdownItSmartMediaRule = {
  // YouTube URLs don't have file extensions, so they are inferred as images.
  mediaTypes: ["image"],

  // Captures the video ID from the URL.
  regex:
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,

  // Uses the source as input.
  inputType: "source",

  // Isolates the video ID from the full URL.
  inputCapture: "isolate",

  // Overrides the HTML template.
  effectType: "template",

  // Renders a youtube-nocookie iframe.
  // We use title="{{alt}}" because iframes don't support alt text, and the
  // title attribute is the next best place.
  value:
    '<iframe src="https://www.youtube-nocookie.com/embed/{{src}}" title="{{alt}}" class="youtube-embed" style="aspect-ratio: 16/9; width: 100%; border: 0;" allow="autoplay; encrypted-media;" allowfullscreen></iframe>',
};
```

## Configuration

`markdown-it-smart-media` can be heavily configured via the `params` field in
the `MarkdownIt.use(plugin, params)` method.

Example:

```ts
import MarkdownIt from "npm:markdown-it";
import {
  defaultRules,
  type MarkdownItSmartMediaOptions,
  type MarkdownItSmartMediaRule,
  smartMediaPlugin,
} from "jsr:@ethmarks/markdown-it-smart-media";

const customRule: MarkdownItSmartMediaRule = {
  // ...
};

const options: MarkdownItSmartMediaOptions = {
  imageTemplate:
    '<img src="{{src}}" alt="{{alt}}" class="smart-image" {{attrs}}>',
  imageAttrs: 'decoding="async" fetchpriority="high"',

  audioTemplate:
    '<audio src="{{src}}" title="{{title}}" aria-label="{{alt}}" class="smart-audio" {{attrs}}></audio>',
  audioAttrs: "controls loop",

  videoTemplate:
    '<video src="{{src}}" title="{{title}}" aria-label="{{alt}}" class="smart-video" {{attrs}}></video>',
  videoAttrs: "controls muted",

  wrapInFigureTags: false,

  rules: [...defaultRules, customRule],
};

const md = new MarkdownIt().use(smartMediaPlugin, options);
```

Configuration must be of the `MarkdownItSmartMediaOptions` type, which has the
following fields:

- `{image/audio/video}Template`: This determines what the default template is
  for each of the media types. It can be overridden by rules with an
  `effectType` of "template". See the template syntax section for more
  information.
  - `imageTemplate`: default is `<img src="{{src}}" alt="{{alt}}" {{attrs}}>`.
  - `audioTemplate`: default is
    `<audio src="{{src}}" title="{{title}}" aria-label="{{alt}}" {{attrs}}></audio>`.
  - `videoTemplate`: default is
    `<video src="{{src}}" title="{{title}}" aria-label="{{alt}}" {{attrs}}></video>`.
- `{image/audio/video}Attrs`: This determines what the default attribute string
  is for each of the media types. It can be overridden by rules with an
  `effectType` of "attrs".
  - `imageAttrs`: default is an empty string.
  - `audioAttrs`: default is `controls`.
  - `videoAttrs`: default is `controls`.
- `wrapInFigureTags`: This determines whether or not to wrap media tags in
  `<figure>` tags, and also whether or not to use `<figcaption>` to render the
  title (if one is provided).
- `rules`: An array of `MarkdownItSmartMediaRule` rules that list all of the
  rules to apply. See the rule syntax section for more information.

### Template Syntax

`markdown-it-smart-media` uses template strings to render the final HTML tags.
These are just normal strings but where dynamic values are replaced with named
placeholders surrounded by double curly braces.

When a template is rendered, the following dynamic values are supplied and are
available:

- `{{src}}`: The source URI. This is what goes in the parenthesis of the
  Markdown element. It typically goes in the `src` attribute.
- `{{title}}`: The title. This is what goes in quotes inside the parenthesis of
  the Markdown element. If a title isn't provided, this will be an empty string.
- `{{alt}}`: The description of the media. This is what goes in the square
  brackets of the Markdown element. It typically goes in the `alt` attribute for
  `<img>` tags, and in the `aria-label` attribute for `<audio>` and `<video>`
  tags.
- `{{attrs}}`: The attributes. These are initialized to the value of
  `{image/audio/video}Attrs` (depending on the inferred media type), but can be
  overridden by rules.

For example, if we assume that no rules are active and `imageAttr` is set to
`controls`, the following Markdown...

```md
![A description of the video](video.mp4 "A caption for the video")
```

...will result in the following values being supplied to template...

| Value       | Supplied                     |
| ----------- | ---------------------------- |
| `{{src}}`   | `video.mp4`                  |
| `{{title}}` | `A caption for the video`    |
| `{{alt}}`   | `A description of the video` |
| `{{attrs}}` | `controls`                   |

...so if the template is...

```html
<video
  src="{{src}}"
  title="{{title}}"
  aria-label="{{alt}}"
  {{attrs}}
>
</video>
```

...the rendered output will be:

```html
<video
  src="video.mp4"
  title="A caption for the video"
  aria-label="A description of the video"
  controls
>
</video>
```

### Rule Syntax

`markdown-it-smart-media` rules must be of the `MarkdownItSmartMediaRule` type,
which has the following fields:

- `mediaTypes`: An array of strings, each of which must be one of "image",
  "audio", or "video". This determines which media types the rule applies to.
- `regex`: A regular expression used to determine whether or not the rule
  applies. If the regex matches the input, the rule applies. For example, if the
  input is "apple banana cherry" and the regex is `/banana/`, the rule would
  apply.
- `inputType`: Either "alt" or "src". This determines which property is used as
  the input.
- `inputCapture`: Either "strip" or "isolate". This determines what the capture
  group of the regex (if one is present) does to the input if the rule is
  applicable.
  - strip: Removes the capture group from the input. For example, if the input
    is "apple banana cherry" and the regex is `/apple (banana )/`, the returned
    input will be "apple cherry". "banana " was removed from the input because\
    it was captured by the capture group.
  - isolate: Removes everything except for the capture group from the input. For
    example, if the input is "apple banana cherry" and the regex is
    `/apple (banana)/`, the returned input will be "banana". "apple " and "
    cherry" weren't captured by the capture group, so they were removed.
- `effectType`: Either "attrs" or "template". This determines what property the
  rule affects, based on the `value`.
  - attrs: Affects the attributes of the media tag. If this is the first rule
    being applied, the `value` completely overrides the attributes, replacing
    the default ones. If rules have already been applied, the `value` is
    appended.
  - template: Affects the template used to render the media HTML. See the
    template syntax section for more information.
- `value`: The string that is applied based on the `effectType`.

## Credits

This plugin is largely just a modern rewrite of
[`markdown-it-html5-media`](https://github.com/eloquence/markdown-it-html5-media).
Key differences:

- Deno-native and written in TypeScript.
- Supports loop videos.
- Supports YouTube embeds.
- Has a versatile rule engine for custom rules.
- Supports `<figure>` wrapping and `<figcaption>`.

## License

This project is under a Creative Commons Zero dedication. See [LICENSE](LICENSE)
for more information.
