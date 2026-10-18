import { describe, expect, test } from "bun:test";
import {
  parseThemes,
  parsePending,
  deriveThemeList,
  resolveOldId,
  carriedPending,
  findPending,
  assessAdoptionClaims,
  assessAdoptionInconsistency,
  assessAdoptionReflection,
} from "../lib/sections.ts";

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

describe("テーマと採用状態の整合", () => {
  const ADOPTION_THEMES = `# 検討テーマ正本

## THEME-101: 参考テーマのみ

- 状態: active
- 具体化: 実現手段として CLI スクリプトを案として記載した参考テーマ（採用主張なし）

## THEME-102: 根拠不足の採用主張

- 状態: active
- 採用根拠:
- 具体化: 技術候補を合意済みと主張するが根拠の記載がないテーマ

## THEME-103: 正規決定参照の採用主張

- 状態: active
- 採用根拠: DEC-070 で採用済み
- 具体化: 正規決定を根拠に採用を主張するテーマ

## THEME-104: 利用者判断の採用主張

- 状態: active
- 採用根拠: 利用者が 2026-10-15 の対話で明示採用した
- 具体化: 利用者の明示判断を根拠に採用を主張するテーマ
`;

  test("結果要件のみ採用・技術案未採用の入力で、未採用の技術案を合意済みとして扱わない", () => {
    const assessments = assessAdoptionClaims(parseThemes(ADOPTION_THEMES));
    const reference = assessments.find((assessment) => assessment.themeId === "THEME-101");
    expect(reference?.basisKind).toBe("none");
    expect(reference?.treatedAs).toBe("reference-only");
  });

  test("根拠不足の採用主張を確認不足または候補として示す（正式採用の主張を維持しない）", () => {
    const assessments = assessAdoptionClaims(parseThemes(ADOPTION_THEMES));
    const insufficient = assessments.find((assessment) => assessment.themeId === "THEME-102");
    expect(insufficient?.basisKind).toBe("insufficient");
    expect(insufficient?.treatedAs).toBe("candidate");
  });

  test("採用主張のない通常の参考テーマを根拠参照の不在だけで一律に無効化しない", () => {
    const list = deriveThemeList(parseThemes(ADOPTION_THEMES));
    expect(list.length).toBe(4);
    expect(list[0]?.id).toBe("THEME-101");
    expect(list[0]?.status).toBe("active");
    const assessments = assessAdoptionClaims(parseThemes(ADOPTION_THEMES));
    expect(assessments.map((assessment) => assessment.themeId)).toEqual([
      "THEME-101",
      "THEME-102",
      "THEME-103",
      "THEME-104",
    ]);
  });

  test("採用主張の照合前は正式採用とせず、正規成果物との照合を要する状態として示す", () => {
    const assessments = assessAdoptionClaims(parseThemes(ADOPTION_THEMES));
    const byDecision = assessments.find((assessment) => assessment.themeId === "THEME-103");
    const byUser = assessments.find((assessment) => assessment.themeId === "THEME-104");
    expect(byDecision?.basisKind).toBe("canonical-decision");
    expect(byDecision?.treatedAs).toBe("adopted-claim-unverified");
    expect(byUser?.basisKind).toBe("user-decision");
    expect(byUser?.treatedAs).toBe("adopted-claim-unverified");
  });

  test("テーマが合意済み・正規成果物が未採用候補の不整合を検出し、未確認として扱う", () => {
    const inconsistency = assessAdoptionInconsistency("THEME-104", "user-decision", "candidate");
    expect(inconsistency).not.toBeNull();
    expect(inconsistency?.kind).toBe("theme-adopted-canonical-not-adopted");
    expect(inconsistency?.action).toBe("treat-unconfirmed");
  });

  test("不整合の出力はテーマ記述だけを根拠にした正規成果物の採用状態の書換え提案を含まない", () => {
    const inconsistency = assessAdoptionInconsistency("THEME-103", "canonical-decision", "not-adopted");
    expect(inconsistency).not.toBeNull();
    expect(Object.keys(inconsistency ?? {}).sort()).toEqual([
      "action",
      "canonicalStatus",
      "kind",
      "themeClaim",
      "themeId",
    ]);
  });

  test("正規成果物が採用済みでテーマが採用主張なしの場合も逆方向の不整合を検出する", () => {
    const inconsistency = assessAdoptionInconsistency("THEME-101", "none", "adopted");
    expect(inconsistency?.kind).toBe("theme-not-adopted-canonical-adopted");
    expect(inconsistency?.action).toBe("treat-unconfirmed");
  });

  test("正規成果物側の状態が未知の場合は不整合に計上せず、一致する場合は不整合を返さない", () => {
    expect(assessAdoptionInconsistency("THEME-104", "user-decision", "unknown")).toBeNull();
    expect(assessAdoptionInconsistency("THEME-104", "user-decision", "adopted")).toBeNull();
    expect(assessAdoptionInconsistency("THEME-101", "none", "candidate")).toBeNull();
  });

  test("候補状態・採用判断成立直後・正規反映完了後の各状態を区別する", () => {
    const candidate = assessAdoptionReflection("none", "absent");
    const insufficient = assessAdoptionReflection("insufficient", "absent");
    const decided = assessAdoptionReflection("user-decision", "absent");
    const reflected = assessAdoptionReflection("user-decision", "present");
    expect(candidate.state).toBe("candidate");
    expect(candidate.reflectedToCanonical).toBe(false);
    expect(insufficient.state).toBe("candidate");
    expect(decided.state).toBe("decided");
    expect(decided.reflectedToCanonical).toBe(false);
    expect(reflected.state).toBe("reflected");
    expect(reflected.reflectedToCanonical).toBe(true);
  });

  test("正規決定参照の採用判断は正規成果物への反映完了前に反映完了と扱わない", () => {
    const decided = assessAdoptionReflection("canonical-decision", "absent");
    expect(decided.state).toBe("decided");
    expect(decided.reflectedToCanonical).toBe(false);
  });
});
