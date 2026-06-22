# docs-check設計判断のSPEC化

## 背景

docs-check の設計判断（対象ファイル拡張子設計・項目役割範囲・NG ルール間依存関係）が SPEC に明示されていないため、checker 拡張時に毎回手動で副作用を評価する必要がある。PR #1012 で新検査カテゴリ追加を検討した際、skill-category-gap NG への副作用からバックエンド直接追加を回避したが、この判断基準が SPEC 化されていない。また PR #1010 で配布物 ID 除外のテストフィクスチャ例外を確認したが、.md のみ対象の設計判断も SPEC 化されていない。

## 問題

- docs-check 項目役割範囲（バックエンド対象=スクリプト修正を含める vs skill定義対象=含めない）が SPEC 化されていない
- docs-check 対象ファイル設計（.md のみ・テストコード・検証スクリプト内 ID パターンは正当使用例外）が SPEC 化されていない
- NG ルール間依存関係マップ（新カテゴリ追加時の影響 NG 一覧）が未整備

## 望ましい変更

1. docs-check 項目役割範囲（バックエンド vs skill定義）を SPEC 明文化
2. docs-check 対象ファイル設計（.mdのみ・正当使用例外）を SPEC 明文化
3. NG ルール間依存関係マップを integrity-rule-catalog.md に整備
4. repo-agentdev-integrity SKILL に新カテゴリ追加判定フローを追加

## 対象範囲

### 対象
- `docs/specs/integrity-rule-catalog.md`（docs-check 項目役割範囲・対象ファイル設計・NG 依存関係マップ）
- `src/opencode/skills/repo-agentdev-integrity/SKILL.md`（新カテゴリ追加判定フロー）

### 対象外
- 既存の検査カテゴリ定義（SKILL.md L52-76）の変更
- 既存の strict/heuristic/observation 分類の変更
- check_integrity.ts スクリプトの機能変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity-rule-catalog.md` | docs-check 項目役割範囲・対象ファイル設計（.mdのみ・正当使用例外）・NG ルール間依存関係マップを追加 |
| skill | `src/opencode/skills/repo-agentdev-integrity/SKILL.md` | 新カテゴリ追加判定フロー（既存 NG への副作用評価→追加可否）を追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `repo-agentdev-integrity/SKILL.md`（検査カテゴリ定義 L52-76）, `gate-levels.md`（skill-category-gap 定義 L46）, `integrity-rule-catalog.md`（IR-023 Integrity artifact validator drift, IR-020 baseline_status）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 検査カテゴリ・NG ルールの定義は既存だが、(a) バックエンド vs skill定義の役割範囲、(b) .mdのみ対象の設計判断、(c) NG ルール間依存関係マップが未文書化。

## 制約

- 既存の検査カテゴリ・NG ルール定義は維持
- check_integrity.ts スクリプトの機能変更は含めない（SPEC・SKILL の文書化のみ）
- AG-014（機能変更禁止）に準拠

## 受け入れ条件

- [ ] docs-check 項目役割範囲（バックエンド対象 vs skill定義対象）が integrity-rule-catalog.md に明文化されている
- [ ] docs-check 対象ファイル設計（.mdのみ・正当使用例外: テストコード・検証スクリプト内 ID パターン）が明文化されている
- [ ] NG ルール間依存関係マップが整備されている
- [ ] repo-agentdev-integrity SKILL に新カテゴリ追加判定フローが追加されている

## 元learning item / 根拠

- **要約**: docs-check の設計判断（項目役割範囲・対象ファイル・NG依存関係）が SPEC 化されておらず、checker 拡張時に毎回手動評価が必要
- **根拠**: PR #1012 で skill-category-gap NG 汚染リスクからバックエンド追加を回避。PR #1010 で .ts 内 ID パターンが正当使用例外だが設計判断が未文書化。
- **再発条件**: (1) 新検査カテゴリ追加要件発生 (2) 既存 NG ルールとの相互作用を SPEC 化していない (3) checker 対象ファイル拡張子設計が未文書化
- **横展開可能性**: 中。docs-check 固有だが、他 checker でも同パターン（対象範囲・項目役割の設計判断未文書化）が発生し得る

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: PR #1012 Issue #1011 (REQ-0142-006/007), PR #1010 Issue #1000 (OU-010 Stream C)
