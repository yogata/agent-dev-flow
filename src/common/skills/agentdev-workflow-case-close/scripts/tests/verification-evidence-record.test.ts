import { describe, expect, test } from "bun:test";
import * as mod from "../src/verification-evidence-record";

const {
  VERIFICATION_EVIDENCE_ELEMENTS,
  createVerificationEvidenceRecord,
  parseEvidenceMaterial,
  serializeEvidenceMaterial,
  EvidenceInputError,
  EvidenceMaterialFormatError,
} = mod;

function validRecord(): mod.VerificationEvidenceRecord {
  return {
    input: "bun test ./src/common/skills/agentdev-workflow-case-close/scripts/tests/",
    targetRevision: "main @ 0275e2d7b（基準 commit。2026-11-05 時点）",
    operation: "case-close scripts のユニットテスト一式を実行",
    actualResult: "72 pass / 0 fail（終了コード 0）",
    failure: null,
    correction: null,
    judgmentReason: "全完了条件の検証方法が合格し、不合格・証拠不足は観測されていない",
  };
}

describe("検証結果の証跡保存形式（保存と読み戻し）", () => {
  describe("7要素の構造と必須検証", () => {
    test("証跡の要素は入力、対象版、操作、実結果、失敗、訂正、判定理由の7要素である", () => {
      expect([...VERIFICATION_EVIDENCE_ELEMENTS]).toEqual([
        "入力",
        "対象版",
        "操作",
        "実結果",
        "失敗",
        "訂正",
        "判定理由",
      ]);
    });

    test("7要素をすべて持つレコードを構築できる", () => {
      const record = createVerificationEvidenceRecord({
        input: "bun test ./scripts/tests/",
        targetRevision: "main @ 0275e2d7b",
        operation: "ユニットテスト実行",
        actualResult: "72 pass / 0 fail",
        failure: null,
        correction: null,
        judgmentReason: "全項目合格",
      });
      expect(record.input).toBe("bun test ./scripts/tests/");
      expect(record.targetRevision).toBe("main @ 0275e2d7b");
      expect(record.judgmentReason).toBe("全項目合格");
    });

    test("失敗と訂正は検出された場合に記録する", () => {
      const record = createVerificationEvidenceRecord({
        input: "bun test ./scripts/tests/",
        targetRevision: "main @ 0275e2d7b",
        operation: "ユニットテスト実行",
        actualResult: "71 pass / 1 fail",
        failure: "台帳回収の単体テストが失敗（回収後の状態確認が不一致）",
        correction: "回収後の状態確認をファイル不在の読み戻しで検証するよう修正",
        judgmentReason: "訂正後の再実行で全項目合格",
      });
      expect(record.failure).not.toBeNull();
      expect(record.correction).not.toBeNull();
    });

    test("必須要素（入力・対象版・操作・実結果・判定理由）の欠落は構築を拒否する", () => {
      for (const field of ["input", "targetRevision", "operation", "actualResult", "judgmentReason"] as const) {
        const broken = validRecord() as unknown as Record<string, unknown>;
        broken[field] = "";
        expect(() => createVerificationEvidenceRecord(broken)).toThrow(EvidenceInputError);
      }
    });

    test("失敗・訂正に非 null で空文字を与えたレコードも拒否する（記録する場合は実内容を要求）", () => {
      const broken = validRecord() as unknown as Record<string, unknown>;
      broken.failure = "  ";
      expect(() => createVerificationEvidenceRecord(broken)).toThrow(EvidenceInputError);
    });
  });

  describe("本体Issue/PRへの記録生成材料（既存チャネル契約の材料）", () => {
    test("材料には7要素すべてが含まれ、検証証跡であることを示すセンチネルを持つ", () => {
      const material = serializeEvidenceMaterial(validRecord());
      for (const element of VERIFICATION_EVIDENCE_ELEMENTS) {
        expect(material).toContain(`- ${element}:`);
      }
      expect(material).toContain("verification-evidence:v1");
    });

    test("失敗・訂正なしは材料へ「なし」として記録する（欠落記載と区別できる）", () => {
      const material = serializeEvidenceMaterial(validRecord());
      expect(material).toContain("- 失敗: なし");
      expect(material).toContain("- 訂正: なし");
    });

    test("失敗・訂正ありは実内容を材料へ記録する", () => {
      const record = validRecord();
      const withFailure = { ...record, failure: "回収後の台帳状態が不一致", correction: "確認経路を修正" };
      const material = serializeEvidenceMaterial(withFailure);
      expect(material).toContain("- 失敗: 回収後の台帳状態が不一致");
      expect(material).toContain("- 訂正: 確認経路を修正");
    });
  });

  describe("回収後の読み戻し（一時資材へのアクセスなしでの7要素復元）", () => {
    test("保存材料から7要素を復元できる（回収した一時資材を参照しない）", () => {
      const material = serializeEvidenceMaterial(validRecord());
      const restored = parseEvidenceMaterial(material);
      expect(restored.input).toBe(validRecord().input);
      expect(restored.targetRevision).toBe(validRecord().targetRevision);
      expect(restored.operation).toBe(validRecord().operation);
      expect(restored.actualResult).toBe(validRecord().actualResult);
      expect(restored.failure).toBeNull();
      expect(restored.correction).toBeNull();
      expect(restored.judgmentReason).toBe(validRecord().judgmentReason);
    });

    test("失敗・訂正ありの材料からも実内容を復元できる", () => {
      const record = {
        ...validRecord(),
        failure: "1件の単体テストが失敗",
        correction: "判定経路を修正して再実行",
      };
      const restored = parseEvidenceMaterial(serializeEvidenceMaterial(record));
      expect(restored.failure).toBe("1件の単体テストが失敗");
      expect(restored.correction).toBe("判定経路を修正して再実行");
    });

    test("複数行の要素値を含む材料からも復元できる（継続行は要素値に含める）", () => {
      const record = {
        ...validRecord(),
        judgmentReason: "全完了条件の検証方法が合格。\n不合格・証拠不足は観測されていない。",
      };
      const restored = parseEvidenceMaterial(serializeEvidenceMaterial(record));
      expect(restored.judgmentReason).toContain("全完了条件の検証方法が合格。");
      expect(restored.judgmentReason).toContain("不合格・証拠不足は観測されていない。");
    });

    test("センチネル欠落の材料は読み戻しを拒否する（証跡材料の誤読防止）", () => {
      const material = serializeEvidenceMaterial(validRecord()).replace("<!-- verification-evidence:v1 -->", "");
      expect(() => parseEvidenceMaterial(material)).toThrow(EvidenceMaterialFormatError);
    });

    test("7要素が欠落した材料は読み戻しを拒否する（欠落要素を補完しない）", () => {
      const material = serializeEvidenceMaterial(validRecord())
        .split("\n")
        .filter((line) => !line.startsWith("- 判定理由:"))
        .join("\n");
      expect(() => parseEvidenceMaterial(material)).toThrow(EvidenceMaterialFormatError);
    });

    test("「なし」記載の失敗は null として復元される（失敗なしと失敗記録を区別する）", () => {
      const material = serializeEvidenceMaterial(validRecord());
      expect(parseEvidenceMaterial(material).failure).toBeNull();
    });
  });

  describe("別保管庫・恒久保持方式が存在しないことの構造確認", () => {
    test("モジュールの公開 API に別保管庫への転送・恒久保持の経路が存在しない", () => {
      const exportedNames = Object.keys(mod).filter((name) => name !== "EvidenceMaterialFormatError" && name !== "EvidenceInputError");
      const forbiddenPatterns = [
        /archive/i,
        /permanent/i,
        /bundle/i,
        /upload/i,
        /storeRaw/i,
        /rawLog/i,
        /environmentSnapshot/i,
      ];
      for (const name of exportedNames) {
        for (const pattern of forbiddenPatterns) {
          expect(name).not.toMatch(pattern);
        }
      }
    });

    test("材料生成は本体Issue/PR記載向けのテキスト生成のみであり、ローカル生ログの永久保持を要求しない", () => {
      // 材料は文字列として返すだけの純粋関数であり、I/O を行わない。
      const material = serializeEvidenceMaterial(validRecord());
      expect(typeof material).toBe("string");
    });
  });
});
