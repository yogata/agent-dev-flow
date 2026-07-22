# spec-save における SPEC frontmatter 宣言付与フローの整備（主論理区分・正規所有対象）

## 背景

OU-007 で SPEC 再評価基準（主論理区分: `spec_logical_division`、正規所有対象: `canonical_owner`）が規定された。`docs/specs/foundations/document-model.md`（L399, 401）で宣言形式の規定を述べるが、全現行 SPEC 142ファイルで横断確認した結果、`foundations/document-model.md` のみが宣言を持ち、他 141 SPEC ファイル（基盤 SPEC、command SPEC、skill SPEC、横断 SPEC、IR-* ルール詳細）は frontmatter で主論理区分・正規所有対象を未宣言。現状は「後方互換運用（REQ-0136-035、ADR-0124 soft-contract）」に従い段階適用・警告モード扱いで、不合格理由ではない。しかし、spec-save 工程で新規 SPEC を作成する際、宣言形式の参考がない状態で起票される可能性があり、宣言付与の運用フローが未整備である。横断的再評価（QG-3/QG-4）でも宣言ベースの判定が機能しない。

## 問題

SPEC frontmatter の `spec_logical_division` / `canonical_owner` 宣言付与の運用フローが未整備で、141 SPEC ファイルが宣言未対応。spec-save 工程で新規 SPEC を作成する際、宣言形式の参考がない状態で起票される。`foundations/document-model.md` で規定を述べるが、spec-save command に宣言付与の具体手順が未規定。`spec-health-metrics` で宣言率を指標化する仕組みも未実装で、横断的再評価（QG-3/QG-4）で宣言ベースの判定が機能しない。

## 望ましい変更

`spec-save` command に、新規 SPEC 作成時の frontmatter 宣言付与フローを整備する。段階適用（REQ-0136-035、ADR-0124 soft-contract）を前提とし、既存 SPEC 141ファイルの一括更新は行わず、新規 SPEC から順次宣言付与を適用。具体的には以下を実装する:

1. **spec-save CREATE 手順に宣言付与ステップを追加**: 新規 SPEC 作成時、`spec_logical_division` / `canonical_owner` の frontmatter 宣言を必須ステップとして追加。`foundations/document-model.md` L399/401 の規定を参照し、SPEC 種別（foundations / commands / skills / 横断 / IR-* ルール詳細）ごとの推奨値をテンプレート化。
2. **spec-save UPDATE 機会での宣言付与推奨**: 既存 SPEC を UPDATE する際、宣言が未付与の場合は付与を推奨（強制ではない、後方互換運用維持）。spec-save 手順に「宣言未付与 SPEC の更新時は、併せて宣言付与を検討する」ステップを追加。
3. **spec-health-metrics で宣言率を指標化**: `docs/specs/skills/spec-health-metrics.md` に「`spec_logical_division` 宣言率」「`canonical_owner` 宣言率」の指標を追加し、横断的再評価（QG-3/QG-4）で宣言ベースの判定が機能するよう、段階的な宣言率向上を追跡可能にする。

## 対象範囲

### 対象

- `spec-save` command（CREATE 手順、UPDATE 手順）
- `docs/specs/skills/spec-health-metrics.md`（宣言率指標の追加）
- `docs/specs/foundations/document-model.md`（L399/401 の規定を、spec-save での運用フローと整合するよう補強。必要に応じて推奨値テンプレートを追記）
- spec-save template（新規 SPEC 作成時の frontmatter テンプレート、存在する場合）

### 対象外

- 既存 SPEC 141ファイルの一括宣言付与（後方互換運用維持。段階適用が前提。本件では手順整備のみ）
- `spec_logical_division` / `canonical_owner` の値域定義自体（`foundations/document-model.md` で既規定。本件は運用フロー整備が対象）
- spec-health-metrics 以外の指標化手法（本件では spec-health-metrics を使用）
- ADR-0124（soft-contract）の改廃（後方互換運用は維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/spec-save.md` | CREATE 手順に `spec_logical_division` / `canonical_owner` 宣言付与ステップを追加。UPDATE 手順に宣言未付与 SPEC の宣言付与推奨ステップを追加。 |
| spec | `docs/specs/skills/spec-health-metrics.md` | 「SPEC 横断診断」節等に `spec_logical_division` 宣言率・`canonical_owner` 宣言率の指標を追加。 |
| spec | `docs/specs/foundations/document-model.md` | L399/401 の規定を補強し、SPEC 種別ごとの推奨値テンプレートを追記（必要に応じて）。spec-save での運用フローとの整合性を明文化。 |
| template | `.opencode/skills/agentdev-workflow-templates/templates/spec_*.md`（該当 template が既存の場合） | 新規 SPEC 作成時の frontmatter テンプレートに `spec_logical_division` / `canonical_owner` のプレースホルダを追加。 |

## 既存対策確認

- **確認結果**: 既存対策あり（不完全）
- **該当ファイル**: `docs/specs/foundations/document-model.md`（L399, 401）、`.opencode/commands/agentdev/spec-save.md`、`docs/specs/skills/spec-health-metrics.md`、ADR-0124、REQ-0136-035
- **ギャップ分類**: fix gap
- **ギャップ詳細**: `foundations/document-model.md` で宣言形式の規定を述べるが、spec-save command に宣言付与の具体手順が未規定。spec-health-metrics に宣言率指標が未実装。結果、141 SPEC ファイルが宣言未対応のまま放置され、新規 SPEC も宣言なしで起票される可能性がある。横断的再評価（QG-3/QG-4）で宣言ベースの判定が機能しない。後方互換運用（REQ-0136-035、ADR-0124 soft-contract）は維持すべきだが、新規 SPEC からの段階適用手順が未整備。

## 制約

- **後方互換性**: 既存 SPEC 141ファイルの一括宣言付与は行わない。REQ-0136-035、ADR-0124（soft-contract）の後方互換運用を維持し、宣言未付与を不合格理由としない。新規 SPEC から段階適用する。
- **強制度**: CREATE 時の宣言付与は必須化するが、UPDATE 時の宣言付与は推奨（強制ではない）。宣言率指標は警告モードで運用し、不合格閾値は設けない（段階的向上の追跡目的）。
- **配布物改修**: `spec-save` command、`spec-health-metrics.md` SPEC は配布物。本成果物は `promoted/` から `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run` の昇華経路を経て改修される。直接 `src/` 配下を編集しない。
- **自動 REQ 化禁止**: 本成果物は REQ 化の候補であり、確定ではない。`/agentdev/req-define` で要件が確定し、`/agentdev/req-save` で REQ 化される。
- **推奨値の安定性**: SPEC 種別（foundations / commands / skills / 横断 / IR-* ルール詳細）ごとの `spec_logical_division` / `canonical_owner` 推奨値は、`foundations/document-model.md` の既規定と整合する必要がある。推奨値テンプレートの追加は、既規定の変更ではなく補強とする。
- **指標の機械化**: spec-health-metrics での宣言率指標は、機械的に算出可能（frontmatter の有無を grep / parse）であること。

## 受け入れ条件

- [ ] `spec-save` command の CREATE 手順に、新規 SPEC 作成時の `spec_logical_division` / `canonical_owner` 宣言付与が必須ステップとして追加されていること。
- [ ] `spec-save` command の UPDATE 手順に、宣言未付与 SPEC の更新時に宣言付与を推奨するステップが追加されていること（強制ではない、後方互換運用維持）。
- [ ] SPEC 種別ごとの `spec_logical_division` / `canonical_owner` 推奨値テンプレートが、`foundations/document-model.md` または spec-save の template に整備されていること。
- [ ] `docs/specs/skills/spec-health-metrics.md` に `spec_logical_division` 宣言率・`canonical_owner` 宣言率の指標が追加されていること。
- [ ] 宣言率指標が機械的に算出可能（frontmatter の有存を grep / parse で確認できる）であり、警告モードで運用されることが規定されていること（不合格閾値は設けない）。
- [ ] 既存 SPEC 141ファイルは一括更新せず、後方互換運用（REQ-0136-035、ADR-0124）が維持されていること。
- [ ] 新規 SPEC 作成時の宣言付与を検証する受け入れテスト（CREATE で宣言が付与されること、宣言なしでは spec-save が警告すること）が整備されていること。

## 元learning item / 根拠

- **要約**: OU-007 で SPEC 再評価基準（主論理区分、正規所有対象）の frontmatter 宣言が規定されたが、全現行 SPEC 142ファイル中 141ファイルが宣言未対応。`foundations/document-model.md` のみ宣言を持ち、他は未宣言。後方互換運用で段階適用・警告モード扱い（不合格理由ではない）だが、spec-save での宣言付与フローが未整備で、新規 SPEC も宣言なしで起票される可能性がある。
- **根拠**: PR #1750（Issue #1743、Epic #1736 Wave 4 最終 Wave）の Findings セクション F-2 で、全現行 SPEC 142ファイルの frontmatter 横断確認を実施。`foundations/document-model.md`（L399, 401 で規定を述べる）のみ `spec_logical_division` / `canonical_owner` 宣言を持ち、他 141 SPEC ファイル（基盤 SPEC、command SPEC、skill SPEC、横断 SPEC、IR-* ルール詳細）は未宣言。OU-007 で責務境界浄化の基準を規定した段階で、宣言形式の運用は「後方互護運用（REQ-0136-035、ADR-0124 soft-contract）」に従い段階適用・警告モード扱い。
- **再発条件**: spec-save 工程で新規 SPEC を作成する際、宣言形式の参考がない状態で起票される場合。既存 SPEC は spec-save UPDATE 機会で順次宣言付与が必要。
- **横展開可能性**: 限定。AgentDevFlow SPEC frontmatter 固有の宣言形式。ただし、宣言付与フロー整備のパターン（新規 from 必須化、既存は段階適用、指標化で推移追跡）は、他の frontmatter 運用フロー設計にも応用可能。

## 推奨Issue分類

- **分類**: feature（既存 command の機能拡張。spec-save への宣言付与フロー新設）
- **推奨ラベル**: `enhancement`, `spec-save`, `frontmatter`, `spec-health-metrics`, `gradual-rollout`
- **関連Issue**: #1743（Wave 4 元 Issue、宣言状況を検出）, Epic #1736（親 Epic）, OU-007（責務境界浄化基準）, REQ-0136-035（後方互換運用）, ADR-0124（soft-contract）。新規 Issue として起票し、#1743 は参照として記載。
