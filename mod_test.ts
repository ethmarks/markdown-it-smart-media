import { assertEquals } from "@std/assert";
import { guessMediaType } from "./mod.ts";

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
