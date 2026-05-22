import MarkdownIt from "markdown-it";
import { inferMediaType, smartMediaPlugin } from "./mod.ts";
import {
  assertEquals,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";

Deno.test(
  "inferMediaType identifies example cases from documentation",
  () => {
    // Examples from the inferMediaType() description.
    assertEquals(inferMediaType("waterfall.png"), "image");
    assertEquals(inferMediaType("birdsong.mp3"), "audio");
    assertEquals(inferMediaType("code.py"), "image");
    assertEquals(inferMediaType("The HORSE is a noble animal."), "image");
  },
);

Deno.test(
  "inferMediaType identifies basic cases for all recognized audio formats",
  () => {
    // Basic cases for all recognized audio formats.
    assertEquals(inferMediaType("test.aac"), "audio");
    assertEquals(inferMediaType("test.flac"), "audio");
    assertEquals(inferMediaType("test.m4a"), "audio");
    assertEquals(inferMediaType("test.mp3"), "audio");
    assertEquals(inferMediaType("test.oga"), "audio");
    assertEquals(inferMediaType("test.opus"), "audio");
    assertEquals(inferMediaType("test.wav"), "audio");
  },
);

Deno.test(
  "inferMediaType identifies basic cases for all recognized video formats",
  () => {
    // Basic cases for all recognized video formats.
    assertEquals(inferMediaType("test.3gp"), "video");
    assertEquals(inferMediaType("test.av1"), "video");
    assertEquals(inferMediaType("test.m4v"), "video");
    assertEquals(inferMediaType("test.mkv"), "video");
    assertEquals(inferMediaType("test.mov"), "video");
    assertEquals(inferMediaType("test.mp4"), "video");
    assertEquals(inferMediaType("test.mpeg"), "video");
    assertEquals(inferMediaType("test.mpg"), "video");
    assertEquals(inferMediaType("test.ogv"), "video");
    assertEquals(inferMediaType("test.webm"), "video");
  },
);

Deno.test(
  "inferMediaType identifies basic cases for a few common image formats",
  () => {
    // Basic cases for a few common image formats.
    assertEquals(inferMediaType("test.jpg"), "image");
    assertEquals(inferMediaType("test.png"), "image");
    assertEquals(inferMediaType("test.webp"), "image");
    assertEquals(inferMediaType("test.tiff"), "image");
    assertEquals(inferMediaType("test.heic"), "image");
    assertEquals(inferMediaType("test.svg"), "image");
    assertEquals(inferMediaType("test.gif"), "image");
  },
);

Deno.test(
  "markdown-it-smart-media renders basic image syntax",
  () => {
    const md = new MarkdownIt().use(smartMediaPlugin);
    const result = md.render("![Alt text](test.png)");

    assertStringIncludes(result, "<img");
    assertStringIncludes(result, 'src="test.png"');
    assertStringIncludes(result, 'alt="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media renders basic audio syntax",
  () => {
    const md = new MarkdownIt().use(smartMediaPlugin);
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
    const md = new MarkdownIt().use(smartMediaPlugin);
    const result = md.render("![Alt text](test.mp4)");

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="test.mp4"');
    assertStringIncludes(result, "controls");
    assertStringIncludes(result, 'aria-label="Alt text"');
  },
);

Deno.test(
  "markdown-it-smart-media handles wrapInFigureTags enabled",
  () => {
    const md = new MarkdownIt().use(smartMediaPlugin, {
      wrapInFigureTags: true,
    });

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
  },
);

Deno.test(
  "markdown-it-smart-media handles wrapInFigureTags disabled",
  () => {
    const md = new MarkdownIt().use(smartMediaPlugin, {
      wrapInFigureTags: false,
    });

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
  },
);

Deno.test(
  "markdown-it-smart-media handles loop video rule",
  () => {
    const md = new MarkdownIt().use(smartMediaPlugin);
    const result = md.render(
      "![:LOOP Alt text](test.webm)",
    );

    assertStringIncludes(result, "<video");
    assertStringIncludes(result, 'src="test.webm"');
    assertStringIncludes(result, "autoplay loop muted playsinline");
    assertStringIncludes(result, 'aria-label="Alt text"');
  },
);
