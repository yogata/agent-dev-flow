import { describe, expect, test } from "bun:test";
import { parseThemes, parsePending, deriveThemeList, resolveOldId, carriedPending, findPending } from "../lib/sections.ts";

const THEMES = `# 検討テーマ正本

## THEME-001: 反映対象の整理

- 状態: deprecated
- 後継: THEME-003（統合により引き継ぎ）
- 具体化: 反映対象の整理の検討
- 未決: PEND-001

## THEME-002: 検証範囲の整理

- 状態: deprecated
- 後継: THEME-003
- 具体化: 検証範囲の検討

## THEME-003: 反映と検証の統合テーマ

- 状態: active
- 具体化: 統合後の検討
`;

const PENDING = `# 未決事項と判断根拠

## PEND-001: 反映順序の未決

- 状態: carried
- 関連テーマ: THEME-001 から THEME-003 へ引き継ぎ
- 判断根拠: 反映順序は利用者判断が保留中であり自動解消しない

## PEND-002: 廃止テーマの付帯事項

- 状態: unresolved
- 関連テーマ: THEME-001
- 判断根拠: 対象外とする根拠が未確定のため未決のまま保持する
`;

describe("テーマ一覧の導出", () => {
  test("テーマ正本のセクションから一覧を導出し、状態と後継と未決参照を含む", () => {
    const list = deriveThemeList(parseThemes(THEMES));
    expect(list.length).toBe(3);
    expect(list.map((entry) => entry.id)).toEqual(["THEME-001", "THEME-002", "THEME-003"]);
    expect(list[0]?.status).toBe("deprecated");
    expect(list[0]?.successor).toBe("THEME-003");
    expect(list[0]?.pendingRefs).toEqual(["PEND-001"]);
    expect(list[2]?.status).toBe("active");
  });

  test("同一入力から同一 JSON を返す（決定的）", () => {
    const first = deriveThemeList(parseThemes(THEMES));
    const second = deriveThemeList(parseThemes(THEMES));
    expect(first).toEqual(second);
  });

  test("テーマ識別の重複は例外で拒否する（silent skip しない）", () => {
    const duplicated = `${THEMES}\n## THEME-001: 重複テーマ\n\n- 状態: active\n`;
    expect(() => parseThemes(duplicated)).toThrow(/重複/);
  });
});

describe("旧新対応の解決", () => {
  test("旧識別の後継チェーンを辿り現行 active テーマに解決する", () => {
    const resolution = resolveOldId(parseThemes(THEMES), "THEME-001");
    expect(resolution.status).toBe("resolved");
    if (resolution.status === "resolved") {
      expect(resolution.chain).toEqual(["THEME-001", "THEME-003"]);
      expect(resolution.resolvedId).toBe("THEME-003");
    }
  });

  test("複数段階の後継チェーンも解決する", () => {
    const chained = `## THEME-010: 旧テーマ\n\n- 状態: deprecated\n- 後継: THEME-011\n\n## THEME-011: 中間テーマ\n\n- 状態: deprecated\n- 後継: THEME-012\n\n## THEME-012: 現行テーマ\n\n- 状態: active\n`;
    const resolution = resolveOldId(parseThemes(chained), "THEME-010");
    expect(resolution.status).toBe("resolved");
    if (resolution.status === "resolved") {
      expect(resolution.resolvedId).toBe("THEME-012");
      expect(resolution.chain).toEqual(["THEME-010", "THEME-011", "THEME-012"]);
    }
  });

  test("後継を持たない旧テーマは terminal として区別する", () => {
    const terminal = `## THEME-020: 廃止テーマ\n\n- 状態: deprecated\n`;
    const resolution = resolveOldId(parseThemes(terminal), "THEME-020");
    expect(resolution.status).toBe("terminal");
  });

  test("未知の識別は unknown として区別する", () => {
    const resolution = resolveOldId(parseThemes(THEMES), "THEME-999");
    expect(resolution.status).toBe("unknown");
  });

  test("後継参照の循環は cycle として解決せず報告する（fail-closed）", () => {
    const cyclic = `## THEME-030: 循環A\n\n- 状態: deprecated\n- 後継: THEME-031\n\n## THEME-031: 循環B\n\n- 状態: deprecated\n- 後継: THEME-030\n`;
    const resolution = resolveOldId(parseThemes(cyclic), "THEME-030");
    expect(resolution.status).toBe("cycle");
  });
});

describe("未決の連携", () => {
  test("carried 状態の未決を抽出する", () => {
    const pending = parsePending(PENDING);
    const carried = carriedPending(pending);
    expect(carried.length).toBe(1);
    expect(carried[0]?.id).toBe("PEND-001");
    expect(carried[0]?.relatedThemes).toEqual(["THEME-001", "THEME-003"]);
  });

  test("未決識別で未決を検索でき、判断根拠を保持する", () => {
    const pending = parsePending(PENDING);
    const found = findPending(pending, "PEND-002");
    expect(found?.status).toBe("unresolved");
    expect(found?.basis.includes("未確定")).toBe(true);
  });

  test("未決識別の重複は例外で拒否する（silent skip しない）", () => {
    const duplicated = `${PENDING}\n## PEND-001: 重複未決\n\n- 状態: unresolved\n`;
    expect(() => parsePending(duplicated)).toThrow(/重複/);
  });
});
