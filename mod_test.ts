import MarkdownIt from "markdown-it";
import { guessMediaType, smartMedia } from "./mod.ts";
import {
  assertEquals,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";

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
  "markdown-it-smart-media renders basic image syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Alt text](test.png)");

    assertStringIncludes(result, "<img");
    assertStringIncludes(result, 'src="test.png"');
    assertStringIncludes(result, 'alt="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media renders basic audio syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Alt text](test.mp3)");

    assertStringIncludes(result, "<audio");
    assertStringIncludes(result, 'src="test.mp3"');
    assertStringIncludes(result, "controls");
    assertStringIncludes(result, 'aria-label="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media renders basic video syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render("![Alt text](test.mp4)");

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="test.mp4"');
    assertStringIncludes(result, "controls");
    assertStringIncludes(result, 'aria-label="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media renders loop video syntax",
  () => {
    const md = new MarkdownIt().use(smartMedia);
    const result = md.render(
      "![LOOP Alt text](test.webm)",
    );

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="test.webm"');
    assertStringIncludes(result, "autoplay loop muted playsinline");
    assertStringIncludes(result, 'aria-label="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media handles wrapInFigureTags enabled",
  () => {
    const md = new MarkdownIt().use(smartMedia, { wrapInFigureTags: true });

    const result1 = md.render(
      "![Alt text](test.png)",
    );
    assertStringIncludes(result1, "<figure>");
    assertNotMatch(result1, /<figcaption>/);

    const result2 = md.render(
      '![Alt text](test.png "Title")',
    );
    assertStringIncludes(result2, "<figure>");
    assertStringIncludes(result2, "<figcaption>");
    assertStringIncludes(result2, "Title");

    const result3 = md.render(
      "![Alt text](test.mp3)",
    );
    assertStringIncludes(result3, "<figure>");
    assertNotMatch(result3, /<figcaption>/);

    const result4 = md.render(
      '![Alt text](test.mp3 "Title")',
    );
    assertStringIncludes(result4, "<figure>");
    assertStringIncludes(result4, "<figcaption>");
    assertStringIncludes(result4, "Title");

    const result5 = md.render(
      "![Alt text](test.mp4)",
    );
    assertStringIncludes(result5, "<figure>");
    assertNotMatch(result5, /<figcaption>/);

    const result6 = md.render(
      '![Alt text](test.mp4 "Title")',
    );
    assertStringIncludes(result6, "<figure>");
    assertStringIncludes(result6, "<figcaption>");
    assertStringIncludes(result6, "Title");

    const result7 = md.render(
      "![LOOP Alt text](test.mp4)",
    );
    assertStringIncludes(result7, "<figure>");
    assertNotMatch(result7, /<figcaption>/);

    const result8 = md.render(
      '![LOOP Alt text](test.mp4 "Title")',
    );
    assertStringIncludes(result8, "<figure>");
    assertStringIncludes(result8, "<figcaption>");
    assertStringIncludes(result8, "Title");
  },
);

Deno.test(
  "markdown-it-smart-media handles wrapInFigureTags disabled",
  () => {
    const md = new MarkdownIt().use(smartMedia, { wrapInFigureTags: false });

    const result1 = md.render(
      "![Alt text](test.png)",
    );
    assertNotMatch(result1, /<figure>/);
    assertNotMatch(result1, /<figcaption>/);

    const result2 = md.render(
      '![Alt text](test.png "Title")',
    );
    assertNotMatch(result2, /<figure>/);
    assertNotMatch(result2, /<figcaption>/);
    assertNotMatch(result2, /Title/);

    const result3 = md.render(
      "![Alt text](test.mp3)",
    );
    assertNotMatch(result3, /<figure>/);
    assertNotMatch(result3, /<figcaption>/);

    const result4 = md.render(
      '![Alt text](test.mp3 "Title")',
    );
    assertNotMatch(result4, /<figure>/);
    assertNotMatch(result4, /<figcaption>/);

    const result5 = md.render(
      "![Alt text](test.mp4)",
    );
    assertNotMatch(result5, /<figure>/);
    assertNotMatch(result5, /<figcaption>/);

    const result6 = md.render(
      '![Alt text](test.mp4 "Title")',
    );
    assertNotMatch(result6, /<figure>/);
    assertNotMatch(result6, /<figcaption>/);

    const result7 = md.render(
      "![LOOP Alt text](test.mp4)",
    );
    assertNotMatch(result7, /<figure>/);
    assertNotMatch(result7, /<figcaption>/);

    const result8 = md.render(
      '![LOOP Alt text](test.mp4 "Title")',
    );
    assertNotMatch(result8, /<figure>/);
    assertNotMatch(result8, /<figcaption>/);
  },
);
