# 機械検査のパターンマッチ・網羅検査設計の標準規約（glob・部分一致・ID 接頭辞・silent skip）（spec 候補）

## 背景

PR #2147/#2153/#2154/#2174 で、機械検査・パースのパターンマッチ手段が検出対象の正確な構造と噛み合わないことによる検出漏れ・誤検出が4件発生した。(1) 宣言的ルールデータ（YAML）の自作パーサがコメント行でリストキー状態を破壊し、`forbidden_unconditional_patterns` の読み取り漏れがエラーにならなかった。(2) PowerShell の `-Path` 再帰 glob がスキル直下の SKILL.md を取りこぼした。(3) AUTOGEN ブロックマーカーの部分一致判定が本文中のマーカー言及行を誤発火した。(4) 階層 REQ-ID 体系で短い ID が長い行ID の一部に現れ、素朴な grep が行ID を対象 REQ 参照として誤検出した。

## 問題

checker-execution-contracts SPEC（draft）は「検出 glob による検出漏れと検出過剰は許容しない」原則と宣言的データ YAML の schema 原則を持つが、具体的なマッチ形式の標準（行全体マッチ統一、列挙ベース網羅検査、ID 前置一致除外、宣言データの silent skip 禁止+契約テスト固定）が未規定である。各 Issue・検証スクリプトが個別に試行錯誅し、検出漏れが下流（是正漏れの残存発覚）で手戻りを生んでいる。

## 望ましい変更

1. 機械判定スクリプトのブロック・マーカー判定は、generator 実装と同一の行全体マッチ形式を標準とする
2. 網羅検査は glob 依存の grep ではなく列挙ベース（`Get-ChildItem -Recurse -File` + `-LiteralPath`）でファイル集合を確定し、件数整合の二重確認（列挙ベース集計と再 grep の一致）を必須とする
3. REQ-ID 等の階層 ID を検索する場合は「対象 ID 単独」「行ID（-NNN 付き）」「前置一致の除外」の3点を区別した検索設計を標準とする
4. 宣言的データ（YAML 等）の checker 独自パースは読み取り漏れを silent skip させず、検出ビュー（YAML）と checker 実装の一致を契約テストで固定する

## 対象範囲

### 対象

- `docs/specs/integrity/checker-execution-contracts.md`（draft。検出基盤規則への具体手順追加）
- 機械判定スクリプト設計（`docs/specs/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` の機械判定手順）
- case-run・検証系 Issue の掃引手順（検索設計の標準化）

### 対象外

- 個別 checker（check_workflow_preventive.ts 等）の実装修正自体（PR #2147 で修正済み）
- grep・Select-String 以外のツール導入
- 一文一律の人手査読規範（japanese-tech-writing 範囲）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity/checker-execution-contracts.md` | 検出基盤規則へ行全体マッチ統一・列挙ベース+件数整合・ID 検索設計3点・silent skip 禁止+契約テスト固定を追記 |
| spec reference | `mechanical-replacement-rules.md` | 機械判定のブロック判定・網羅検査手順への反映 |
| skill reference | case-run 検証手順 | 網羅掃引時の検索設計標準（列挙ベース・前置一致除外） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/integrity/checker-execution-contracts.md`（draft。「検出 glob による検出漏れと検出過剰は許容しない」「宣言的データ YAML の schema 原則」）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 原則は存在するが、行全体マッチ統一・列挙ベース+件数整合・ID 前置一致除外・宣言データの silent skip 禁止+契約テスト固定の具体手順が未規定

## 制約

- 既存 checker のマッチ実装の一括変更を要求しない（新規・修正時の標準として適用）
- PowerShell と bun/node 系スクリプトで列挙手段が異なるため、環境別の代表手順を併記する

## 受け入れ条件

- [ ] ブロック・マーカー判定の行全体マッチ標準が規定されていること
- [ ] 列挙ベース網羅検査と件数整合の二重確認手順が規定されていること
- [ ] 階層 ID 検索の3点設計（単独/行ID/前置一致除外）が規定されていること
- [ ] 宣言的データの silent skip 禁止と契約テスト固定が規定されていること

## 元learning item / 根拠

- **要約**: 機械検査のマッチ形式・検索設計が対象構造と噛み合わない場合の検出漏れ・誤検出の4種とその標準手順化
- **根拠**: (1) PR #2147（OU-005、Issue #2139）: check_workflow_preventive.ts の collectForbiddenRegexes がコメント行で currentListKey をリセットし forbidden_unconditional_patterns を silent skip。新規契約テストが YAML と checker 実装の乖離を検出。（2） PR #2153（OU-010、Issue #2144）: `Select-String -Path '<dir>/**/*'` がスキル直下の SKILL.md を取りこぼし（intake 系の工程-N ラベル一時見落とし）。`Get-ChildItem -Recurse -File` + `-LiteralPath` 列挙で解消。（3） PR #2154（OU-009、Issue #2143）: AUTOGEN ブロック判定の部分一致が本文のマーカー言及（インラインコード例）を誤発火し 6 行の検出漏れ。generate_indexes.ts と同一の行全体マッチへ変更し是正。（4） PR #2174（OU-009、Issue #2166）: REQ-024（retired）の参照整理で REQ-024 が REQ-010-024 等の行ID 接頭辞と部分一致。「単独/行ID/前置一致除外」の検索設計で誤検出 0 件を達成
- **再発条件**: YAML 等の宣言的データを checker が独自パースする場合、PowerShell で再帰 glob により網羅検査する場合、マーカー行を本文に言及する文書へ機械判定を適用する場合、階層 ID の部分文字列が別行ID に現れる状態で文字列 grep する場合
- **横展開可能性**: 高い。機械検査・grep・checker を使う開発全般

## 推奨Issue分類

- **分類**: chore（SPEC・手順の整備）
- **推奨ラベル**: documentation, integrity, checker, verification
- **関連Issue**: #2139, #2144, #2143, #2166（いずれもクローズ済みの発生源）
