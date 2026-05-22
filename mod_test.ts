import MarkdownIt from "markdown-it";
import { guessMediaType, smartMedia } from "./mod.ts";
import { assertEquals, assertStringIncludes } from "@std/assert";

Deno.test(
  "guessMediaType identifies example cases from documentation",
  () => {
    // Examples from the guessMediaType() description.
    assertEquals(guessMediaType("waterfall.png"), "image");
    assertEquals(guessMediaType("birdsong.mp3"), "audio");
    assertEquals(guessMediaType("code.py"), "image");
    assertEquals(guessMediaType("The HORSE is a noble animal."), "image");
  },
);

Deno.test(
  "guessMediaType identifies basic cases for all recognized audio formats",
  () => {
    // Basic cases for all recognized audio formats.
    assertEquals(guessMediaType("test.aac"), "audio");
    assertEquals(guessMediaType("test.flac"), "audio");
    assertEquals(guessMediaType("test.m4a"), "audio");
    assertEquals(guessMediaType("test.mp3"), "audio");
    assertEquals(guessMediaType("test.oga"), "audio");
    assertEquals(guessMediaType("test.opus"), "audio");
    assertEquals(guessMediaType("test.wav"), "audio");
  },
);

Deno.test(
  "guessMediaType identifies basic cases for all recognized video formats",
  () => {
    // Basic cases for all recognized video formats.
    assertEquals(guessMediaType("test.3gp"), "video");
    assertEquals(guessMediaType("test.av1"), "video");
    assertEquals(guessMediaType("test.m4v"), "video");
    assertEquals(guessMediaType("test.mkv"), "video");
    assertEquals(guessMediaType("test.mov"), "video");
    assertEquals(guessMediaType("test.mp4"), "video");
    assertEquals(guessMediaType("test.mpeg"), "video");
    assertEquals(guessMediaType("test.mpg"), "video");
    assertEquals(guessMediaType("test.ogv"), "video");
    assertEquals(guessMediaType("test.webm"), "video");
  },
);

Deno.test(
  "guessMediaType identifies basic cases for a few common image formats",
  () => {
    // Basic cases for a few common image formats.
    assertEquals(guessMediaType("test.jpg"), "image");
    assertEquals(guessMediaType("test.png"), "image");
    assertEquals(guessMediaType("test.webp"), "image");
    assertEquals(guessMediaType("test.tiff"), "image");
    assertEquals(guessMediaType("test.heic"), "image");
    assertEquals(guessMediaType("test.svg"), "image");
    assertEquals(guessMediaType("test.gif"), "image");
  },
);

Deno.test(
  "smartMedia renders basic image syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Description of the image](image.png)");

    assertStringIncludes(result, "<img");
    assertStringIncludes(result, 'src="image.png"');
    assertStringIncludes(result, 'alt="Description of the image"');
  },
);

Deno.test(
  "smartMedia renders basic audio syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Description of the audio](audio.mp3)");

    assertStringIncludes(result, "<audio");
    assertStringIncludes(result, 'src="audio.mp3"');
    assertStringIncludes(result, "controls");
    assertStringIncludes(result, 'aria-label="Description of the audio"');
  },
);

Deno.test(
  "smartMedia renders basic video syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Description of the video](video.mp4)");

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="video.mp4"');
    assertStringIncludes(result, "controls");
    assertStringIncludes(result, 'aria-label="Description of the video"');
  },
);

Deno.test(
  "smartMedia renders loop video syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render(
      "![LOOP Description of the loop video](loop.webm)",
    );

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="loop.webm"');
    assertStringIncludes(result, "autoplay loop muted playsinline");
    assertStringIncludes(result, 'aria-label="Description of the loop video"');
  },
);
