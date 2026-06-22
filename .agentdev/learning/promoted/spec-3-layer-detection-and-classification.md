# 3層検出構造と委譲契約分類表のSPEC化

## 背景

OU-001（PR #1022）で ulw-loop（command）を `load_skills=["ulw-loop"]` で skill として誤指定したバグが、REQ/ADR/SPEC で正規化済みだったにも関わらず、実装系（command/skill/references/AGENTS.md）7ファイルに横断波及した。OU-002（PR #1025 Epic #1018）で、この同型違反を3層検出構造（機械/意味/査読）の横断適用により零化した。しかし、3層検出構造の責務分担と req-define 段階での分類表必須化がSPEC化されていない。

## 問題

- 委譲契約設計段階で「adapter skill / command / subagent / harness」の4分類が必須テンプレートとして組み込まれていない
- 3層検出構造（機械的検出=docs-check+IR / 意味的診断=inspect-skills / 査読時観点=doc-writing）の責務分担がSPEC化されていない
- Wave分割パターン（基準正規化→実装系反映→横断適用）が case-open のサブ Wave テンプレートに組み込まれていない

## 望ましい変更

1. req-define の委譲契約・統合契約セクションに「実行主体分類表」を必須テンプレートとして組み込む
2. 3層検出構造の責務分担を SPEC レベルで明文化する
3. Wave分割パターンを case-open サブ Wave テンプレートに組み込むか検討する

## 対象範囲

### 対象
- `docs/specs/integrity-contracts.md` または `docs/specs/writing-style.md`（3層検出構造の責務分担）
- `docs/specs/workflows/delegation-contracts.md` または req-define 手順（実行主体分類表テンプレート）
- `src/opencode/skills/agentdev-doc-writing/`（査読観点の横断適用指針）
- `src/opencode/commands/agentdev/case-open.md`（Wave分割テンプレート候補）

### 対象外
- 既存の実行主体分類の定義自体（writing-style.md, execution-subject-classification.md は維持）
- 既存の strict/heuristic/observation 分類（integrity-contracts.md は維持）
- inspect-skills REQ-0125-010, integrity-rule-catalog IR-050/IR-051 の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity-contracts.md` または `docs/specs/writing-style.md` | 3層検出構造（機械/意味/査読）の責務分担を明文化 |
| spec | `docs/specs/workflows/delegation-contracts.md` | 委譲契約設計に実行主体分類表を必須テンプレートとして追加 |
| skill | `src/opencode/skills/agentdev-doc-writing/` | 査読観点の横断適用指針を追加 |
| command | `src/opencode/commands/agentdev/case-open.md` | Wave分割テンプレート（基準正規化→実装系反映→横断適用）の検討 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `writing-style.md`（実行主体分類の査読基準 行30-47）, `execution-subject-classification.md`（判定表・誤認パターン・検出チェックリスト）, `integrity-contracts.md`（strict/heuristic/observation 分類 行9-16）, `case-run.md` SPEC（委譲契約セクション 行14-23）, `case-run-execution-adapter/SKILL.md`（実行主体分類 行13-30）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 実行主体分類の定義・査読基準は既存だが、(a) req-define 段階での分類表必須化が未実施、(b) 3層検出構造（機械/意味/査読）の責務分担が1つのSPECにまとまっていない、(c) Wave分割パターンがテンプレート化されていない。

## 制約

- 既存の実行主体分類定義・査読基準（writing-style.md, execution-subject-classification.md）は維持
- 既存の strict/heuristic/observation 分類（integrity-contracts.md）は維持し、3層構造の責務分担として再構成
- AG-014（機能変更禁止）に準拠し、検証ルールの追加・文書化のみ

## 受け入れ条件

- [ ] req-define 手順または delegation-contracts SPEC に実行主体分類表テンプレートが必須項目として追加されている
- [ ] 3層検出構造（機械=docs-check+IR / 意味=inspect-skills / 査読=doc-writing）の責務分担が SPEC に明文化されている
- [ ] Wave分割パターン（基準正規化→実装系反映→横断適用）の記述が追加されている

## 元learning item / 根拠

- **要約**: 委譲契約の実行主体誤分類が横断波与し、3層検出構造で零化した。分類表の初期必須化と3層構造の責務分担SPEC化が未実施。
- **根拠**: PR #1022 で7ファイル修正が必要。PR #1025 で3層検出構造の横断適用が新規違反0件を達成。ただし構造自体はSPEC化されておず、暗黙の実践。
- **再発条件**: (1) 実行主体分類を初期要件で明示しない (2) 単発バグ是正で横断検出しない (3) 検出能力を単一層に限定
- **横展開可能性**: 高。委譲契約・統合契約全般で発生し得る（MCP server command と plugin skill の混同等）

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: PR #1022 Issue #1017 (OU-001), PR #1025 Issue #1021 (OU-002 Epic #1018), PR #1023 #1024 (Wave 1/2)
