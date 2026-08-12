// Tests for the strict text/binary classifier.
//
// Distribution artifacts are validated as strict UTF-8 text. Disguised
// binaries (NUL bytes, invalid UTF-8 sequences, BOM tricks) must be rejected
// so the boundary detector never silently skips them.

import { describe, expect, test } from "bun:test";
import {
  classifyBytes,
  decodeStrictUtf8,
  isBinaryBytes,
} from "./text-binary.ts";

describe("text-binary / decodeStrictUtf8", () => {
  test("decodes plain ASCII", () => {
    expect(decodeStrictUtf8(new TextEncoder().encode("hello"))).toBe("hello");
  });

  test("decodes valid 2-byte UTF-8", () => {
    expect(decodeStrictUtf8(new TextEncoder().encode("café"))).toBe("café");
  });

  test("decodes valid 3-byte CJK", () => {
    expect(decodeStrictUtf8(new TextEncoder().encode("日本語"))).toBe("日本語");
  });

  test("decodes valid 4-byte emoji", () => {
    expect(decodeStrictUtf8(new TextEncoder().encode("🚀"))).toBe("🚀");
  });

  test("rejects lone continuation byte", () => {
    // 0x80 is a continuation byte without a lead byte — invalid UTF-8.
    expect(() => decodeStrictUtf8(new Uint8Array([0x80]))).toThrow();
  });

  test("rejects overlong 2-byte encoding of ASCII", () => {
    // 0xC0 0x80 would encode NUL in overlong form — invalid.
    expect(() => decodeStrictUtf8(new Uint8Array([0xc0, 0x80]))).toThrow();
  });

  test("rejects invalid lead byte 0xFE", () => {
    expect(() => decodeStrictUtf8(new Uint8Array([0xfe]))).toThrow();
  });

  test("rejects truncated 2-byte sequence", () => {
    // 0xC3 with no continuation byte.
    expect(() => decodeStrictUtf8(new Uint8Array([0xc3]))).toThrow();
  });
});

describe("text-binary / isBinaryBytes", () => {
  test("returns false for plain text", () => {
    expect(isBinaryBytes(new TextEncoder().encode("plain text\n"))).toBe(false);
  });

  test("returns true for NUL byte", () => {
    expect(isBinaryBytes(new Uint8Array([0x00]))).toBe(true);
  });

  test("returns true for invalid UTF-8", () => {
    expect(isBinaryBytes(new Uint8Array([0xff, 0xfe]))).toBe(true);
  });

  test("returns false for empty bytes (treat as empty text)", () => {
    expect(isBinaryBytes(new Uint8Array([]))).toBe(false);
  });
});

describe("text-binary / classifyBytes", () => {
  test("classifies plain UTF-8 as text", () => {
    const r = classifyBytes(new TextEncoder().encode("# title\nbody\n"));
    expect(r.kind).toBe("text");
    expect(r.text).toBe("# title\nbody\n");
  });

  test("classifies NUL bytes as binary", () => {
    const r = classifyBytes(new Uint8Array([0x00, 0x01, 0x02]));
    expect(r.kind).toBe("binary");
    expect(r.text).toBeUndefined();
  });

  test("classifies invalid UTF-8 as binary", () => {
    const r = classifyBytes(new Uint8Array([0xff, 0xfe, 0xfd]));
    expect(r.kind).toBe("binary");
  });

  test("classifies empty bytes as text (empty string)", () => {
    const r = classifyBytes(new Uint8Array([]));
    expect(r.kind).toBe("text");
    expect(r.text).toBe("");
  });

  test("accepts valid CJK text", () => {
    const r = classifyBytes(new TextEncoder().encode("配布物"));
    expect(r.kind).toBe("text");
    expect(r.text).toBe("配布物");
  });
});
