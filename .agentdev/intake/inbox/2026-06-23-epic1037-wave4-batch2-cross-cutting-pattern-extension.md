# AG-009 Wave 4 Batch 2 横断規範逸脱パターン（拡張）: 残カタログでの確認と新規パターン

## 発生源

- Epic: #1037 (Wave 4 Batch 2 close・Epic 完了)
- Issues: #1046, #1047 (AG-009 カタログ作成・全 completed)
- PRs: #1056, #1057 (全 squash merged)
- カタログ（`.agentdev/inspect/inbox/`）:
  - compliance-catalog-requirements.md (10 件 F-001〜F-010)
  - compliance-catalog-specs.md (12 件 F-001〜F-012)
- 発生日: 2026-06-23
- 関連 intake: `2026-06-23-epic1037-wave4-batch1-cross-cutting-norm-patterns.md`

## 内容

AG-009 Wave 4 Batch 2 の残り 2 カタログ作成 (#1046/#1047) が完了し、Epic #1037 の Phase 2（7 ディレクトリ）が完結した。Batch 1 で抽出した横断パターン (X-1 中黒・X-2 em-dash・X-3 LLM 形容・X-4 複数文併置・X-5 空虚動詞) が docs/requirements/・docs/specs/ でも出現することを確認した。加えて、REQ/SPEC ディレクトリ固有の新規パターン 3 件を検出した。

### 横断パターンの拡張確認

| Batch 1 ID | パターン | docs/requirements/ (#1046) | docs/specs/ (#1047) | 状態 |
|-----------|---------|---------------------------|---------------------|------|
| X-1 | 中黒（・）並列 | F-001 出現 | F-002 出現 | **7/7 ディレクトリで確認** → 横断 Issue の優先度を上げる根拠 |
| X-2 | em-dash（—）使用 | （REQ 適用サブセット外） | F-001 出現・**496 件 / 59 ファイル**（高頻度） | docs/specs/ が最多出現先。機械的修正 Issue の高優先度根拠 |
| X-3 | LLM 表現「包括的」「不可欠」 | 出現（F-006） | 出現 | 7/7 で確認 |
| X-4 | 複数文併置 | 出現 | 出現 | 7/7 で確認 |
| X-5 | 空虚動詞 | 出現 | 出現 | 7/7 で確認 |

**結論**: X-1〜X-5 は 7/7 ディレクトリで共通出現する。横断 Issue 化（Batch 1 提案選択肢 1 または 2）を backlog-review で検討する根拠が確定した。

### 新規パターン（docs/requirements/・docs/specs/ 固有）

| ID | パターン | 出現 | 規範 | 推奨対応 |
|----|---------|------|------|---------|
| X-6 | 「において」使用 | #1046 F-006（REQ-0140 L10/L17/L41 を含む） | LLM 表現禁止（において濫用） | 用語政策横断 Issue で一括対応。REQ-0140 自身の自己準拠矛盾（L10/L17/L41）が象徴的 |
| X-7 | 識別子と散文普通名詞の境界揺れ（backticks 有無混用・散文英単語） | #1047 F-003・F-010 | 識別子と散文の区別（SPEC 適用サブセット） | SPEC 運用基準の SPEC 化。runtime-package-boundary.md が良いパターン（表の Type ID 列は識別子、本文は日本語）だが展開基準が未 SPEC 化 |
| X-8 | Issue 本文のファイル数記載と実態の乖離 | #1046（「約96件」対 実 41 ファイル）・#1042 と同種（Batch 1 既出） | 要件性・粒度（Issue 本文の正確性） | case-open での対象範囲記載精度向上。本 intake・`2026-06-23-epic1037-wave4-issue1042-file-count-discrepancy.md` と併せて学習候補 |

## 推奨対応先

X-1〜X-8 は横断パターンとして backlog-review で RU 化を検討する。整備判断は backlog-review を経る。本 Epic の子 Issue 範囲（見える化カタログ作成）は完結しており、本 intake は後続 Issue の検討材料である。

## 現在の追跡状態

- 7 カタログすべて `.agentdev/inspect/inbox/compliance-catalog-{commands,skills,opencode-local,adr,guides,requirements,specs}.md` に作成済み
- Epic #1037 は全子Issue クローズ・Epic 自体もクローズ済み
- 横断パターン X-1〜X-8: 本 intake（Batch 2 拡張）と Batch 1 intake に集約済み

## 関連 intake

- `2026-06-23-epic1037-wave4-batch1-cross-cutting-norm-patterns.md` — X-1〜X-5 初出（Batch 1）
- `2026-06-23-epic1037-wave4-issue1042-file-count-discrepancy.md` — X-8 の初出（#1042）
- `2026-06-23-epic1037-wave2-ag009-ai-slop-coverage-mapping.md` — X-3（LLM 表現）と查読基準の安定化候補
