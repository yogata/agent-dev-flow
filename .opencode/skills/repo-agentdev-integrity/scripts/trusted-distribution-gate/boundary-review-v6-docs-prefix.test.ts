import { describe, it, expect } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser";

describe("boundary-docs-path-parser v6 docs prefix strict grammar", () => {
  const CAP = 10;

  describe("Markdown links and brackets", () => {
    it("should detect docs path in Markdown link [text](docs/specs/foo.md)", () => {
      const result = extractDocsPaths("[text](docs/specs/foo.md)", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toContain("docs/specs/foo.md");
    });

    it("should detect docs path in Markdown bracket [docs/specs/foo.md](url)", () => {
      const result = extractDocsPaths("[docs/specs/foo.md](url)", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toContain("docs/specs/foo.md");
    });
  });

  describe("URL query assignments", () => {
    it("should detect docs path in query assignment path=docs/specs/foo.md", () => {
      const result = extractDocsPaths("path=docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toContain("docs/specs/foo.md");
    });

    it("should detect docs path after ampersand ref=other&docs/specs/foo.md", () => {
      const result = extractDocsPaths("ref=other&docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toContain("docs/specs/foo.md");
    });
  });

  describe("Strict dot-segment patterns", () => {
    it("should detect single-dot prefix ./docs/specs/foo.md", () => {
      const result = extractDocsPaths("./docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect double-dot prefix ../docs/specs/foo.md", () => {
      const result = extractDocsPaths("../docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect triple-dot-segment prefix ../../docs/specs/foo.md", () => {
      const result = extractDocsPaths("../../docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });
  });

  describe("Reject invalid dot patterns", () => {
    it("should NOT detect .../docs (three dots is invalid)", () => {
      const result = extractDocsPaths(".../docs/specs/foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });

    it("should NOT detect ..../docs (four dots is invalid)", () => {
      const result = extractDocsPaths(".... /docs/specs/foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });
  });

  describe("Encoded separators in relative prefix", () => {
    it("should detect ..%2Fdocs/specs/foo.md (encoded forward slash)", () => {
      const result = extractDocsPaths("..%2Fdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect .%5Cdocs/specs/foo.md (encoded backslash)", () => {
      const result = extractDocsPaths(".%5Cdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });
  });

  describe("Reject patterns without dot prefix", () => {
    it("should NOT detect %2Fdocs/... (no dot prefix)", () => {
      const result = extractDocsPaths("%2Fdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });

    it("should NOT detect a/../docs/... (identifier prefix)", () => {
      const result = extractDocsPaths("a/../docs/specs/foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });
  });

  describe("Reject absolute paths", () => {
    it("should NOT detect /docs/... (absolute path)", () => {
      const result = extractDocsPaths("/docs/specs/foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });

    it("should NOT detect \\docs\\... (absolute path on Windows)", () => {
      const result = extractDocsPaths("\\docs\\specs\\foo.md", CAP);
      expect(result.paths.length).toBe(0);
    });
  });

  describe("Control: plain docs at line start", () => {
    it("should detect plain docs/specs/foo.md at line start", () => {
      const result = extractDocsPaths("docs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });
  });

  describe("Case-insensitive percent encoding", () => {
    it("should detect .%2fdocs with lowercase f", () => {
      const result = extractDocsPaths(".%2fdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect .%5cdocs with lowercase hex", () => {
      const result = extractDocsPaths(".%5cdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect ..%2fdocs with lowercase hex", () => {
      const result = extractDocsPaths("..%2fdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });

    it("should detect ..%5cdocs with lowercase hex", () => {
      const result = extractDocsPaths("..%5cdocs/specs/foo.md", CAP);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths[0]?.value).toBe("docs/specs/foo.md");
    });
  });
});