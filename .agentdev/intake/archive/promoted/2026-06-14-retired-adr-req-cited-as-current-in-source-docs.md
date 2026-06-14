# active 文書が retired ADR/REQ を current として引用している（多数・要個別判断）

## 観測

retired 済みの ADR-0001〜0023・REQ-0001/0004/0050/0111 が、非 retired 文書（REQ・current ADR・SPEC・guide・README・AGENTS.md）で current 文脈の参照として使われている。各参照の多くは移行履歴・supersedes 関係など歴史文脈と見られるが、機械検査では一律 warning となる。件数が多く（発生件数 >= 3）、かつ参照ごとの是正判断が必要なため intake+learning に振り向ける。

### 対象箇所（2026-06-10 追跡レポート由来を除く）

- `docs/requirements/REQ-0112.md`: ADR-0001, 0004, 0007, 0009, 0014, 0015, 0017, 0018, 0019, 0020
- `docs/requirements/REQ-0119.md`: REQ-0111
- `docs/adr/ADR-0101.md`: ADR-0005, 0004 / `ADR-0102.md`: ADR-0013 / `ADR-0103.md`: ADR-0014, 0017 / `ADR-0104.md`: ADR-0015, 0016, 0018 / `ADR-0105.md`: ADR-0019 / `ADR-0106.md`: ADR-0020 / `ADR-0107.md`: ADR-0001 / `ADR-0108.md`: ADR-0002 / `ADR-0109.md`: ADR-0006 / `ADR-0110.md`: ADR-0007, 0008, 0004, REQ-0004 / `ADR-0111.md`: ADR-0011
- `docs/specs/document-model.md`: ADR-0001, 0017 / `docs/specs/integrity-rule-catalog.md`: ADR-0001 / `docs/specs/patterns.md`: ADR-0001, REQ-0001, REQ-0111 / `docs/specs/system.md`: REQ-0001, REQ-0111
- `docs/guides/project-docs-and-specs.md`: ADR-0001, REQ-0001, 0050, 0111 / `docs/README.md`: REQ-0001, 0050, 0111 / `docs/requirements/README.md`: REQ-0111 / `AGENTS.md`: REQ-0111
- 件数: Warning 約 40（`retired-adr-as-current`、`retired-req-as-current`、`retired-req-primary-ref`）

## 影響

読者が retired 文書を現行の権威ある根拠と誤認しうる。AGENTS.md の「リタイア済み REQ を現在の権威として引用しないこと」方針とも関連する。

## 推奨対応

参照ごとに、歴史文脈であることを明示する（例: 「(retired)」「前身: ADR-0001」「supersedes ADR-0001」等の注記）、または現行の後継文書へ差し替える。current ADR 側の supersedes 表記は歴史参照として妥当かを併せて判断する。

## 分類

- finding category: broken-reference
- route: intake+learning
- 原因: 仮説（多くは意図的な歴史参照だが、各参照の妥当性は個別判断が必要）

## 根拠

- 検査: `retired-adr-as-current`、`retired-req-as-current`、`retired-req-primary-ref`（heuristic）
- 根拠: AGENTS.md（信頼できる情報源の優先順位・レガシー引用の扱い）
- 注記: 2026-06-10 追跡レポート由来の false positive は別 intake（tracked-integrity-report-violates-noncommit）で処理
