# SPEC 操作契約テーブルと references/contracts.md のフィールド一致性判定基準

> **原本**: 本ファイルは inspect-skills 診断観点「SPEC 操作契約テーブル ↔ references/contracts.md フィールド一致性」（REQ / AG-003）の判定基準詳細、対象 SPEC 範囲、フィールド対応規則を集約する運用ビューである（REQ 準拠）。
> 原本と内容が重複する場合は原本を優先する。

## 適用範囲

`/agentdev/inspect-skills` 診断で、SPEC 側に記載された操作契約テーブルと、対応する `references/contracts.md` のフィールド集合が過不足なく一致することを検証する。
両者は独立ファイルとして維持され（CR-001: 単一情報源化は導入しない）、本診断は両者の不一致を検出事項として報告するのみで、ファイル修正、自動再同期は行わない。

検出の前提: SPEC 操作契約テーブルは薄いルーティング入口として手続き名、入力、出力を要約し、`references/contracts.md` は手続きごとに入力、出力、エラー扱い、前提、後続等を詳細化する。
両者の手続き集合と主要フィールド（入力、出力）が一致することが整合性の要件である。

## 対象 SPEC 範囲

`## 操作契約`（または同等の操作契約テーブル）を含む SPEC ファイルを対象とする。
現在の対象は以下のとおり。

| 対象 SPEC | 対応 references/contracts.md |
|-----------|------------------------------|
| agentdev-gh-cli SPEC「## 操作契約」 | `src/opencode/skills/agentdev-gh-cli/references/contracts.md`（標準版）、`src/opencode-local/agentdev-gh-cli/references/contracts.md`（ローカル版） |

新規に `## 操作契約` セクションを持つ SPEC が追加された場合、本診断の対象に自動的に含まれる。
SPEC 内の「操作契約」見出しを走査し、対応する skill の `references/contracts.md` が存在するかを確認する。

ローカル版 `references/contracts.md` は標準版と手続き名、引数、戻り値を一致させる（REQ、各 contracts.md 先頭に明記）。
標準版、ローカル版ともに SPEC 操作契約テーブルとの一致が求められる。

## フィールド対応規則

SPEC 操作契約テーブルの列と `references/contracts.md` の手続きごとの表の行は、以下のように対応する。

### SPEC 操作契約テーブルの標準構造（`agentdev-gh-cli` 事例）

| 列 | 内容 |
|----|------|
| 手続き | 手続き名（Issue 作成、Issue 本文読込 等） |
| 入力 | 当該手続きの入力概要 |
| 出力 | 当該手続きの出力概要 |

SPEC 側は薄いルーティング入口として要約版を保持する。
詳細化は `references/contracts.md` に分離する（薄いルーティング入口と references 分離の原則、`agentdev-gh-cli` SPEC 参照）。

### references/contracts.md の手続きごとの表の標準構造

| 行 | 内容 |
|----|------|
| 入力 | 当該手続きの入力詳細 |
| 出力 | 当該手続きの出力詳細 |
| エラー扱い | 失敗条件とエラー分類 |
| 前提 | （任意）実行前に満たすべき条件 |
| 後続 | （任意）実行後に続行すべき手続き |
| 読替先 | （ローカル版のみ）Case ファイル対応セクション |

### 対応規則

1. **手続き集合の一致**: SPEC 操作契約テーブルの行数（手続き数）と `references/contracts.md` に記載される手続き数が一致すること。
contracts.md では I/O 手続きが `### {手続き名}` 見出しで並び、VERIFY 等のメタ手続きは独立した H2 セクション（`## VERIFY`）として記載される場合がある。
見出しレベルの違いは手続き集合の不一致とは扱わず、各手続きが contracts.md 内のいずれかのセクションに存在することを確認する
2. **手続き名の一致**: SPEC 操作契約テーブルの手続き名と contracts.md の対応セクション見出しが 1 対 1 で一致すること（表記ゆれ、過去名の残留がないこと）
3. **入力の一致**: SPEC 操作契約テーブルの「入力」列と contracts.md の該当セクションの「入力」行が、要約 vs 詳細の粒度差を許容したうえで、必須要素の集合として一致すること
4. **出力の一致**: SPEC 操作契約テーブルの「出力」列と contracts.md の該当セクションの「出力」行が、同様に要約 vs 詳細の粒度差を許容したうえで、必須要素の集合として一致すること
5. **エラー扱い、前提、後続、読替先の取り扱い**: SPEC 操作契約テーブルには含まれない項目である。これらは contracts.md 側の拡張項目として扱い、SPEC 側の欠落は不一致としない（要約 vs 詳細の役割分担）

## 診断手順

### 1. 対象 SPEC の特定

`docs/specs/` 配下を走査し、`## 操作契約` 見出しを含む SPEC ファイルを特定する。
現在は agentdev-gh-cli SPEC のみが該当する。
新規追加 SPEC が同見出しを持つ場合、自動的に対象に含める。

### 2. 対応 contracts.md の特定

SPEC から参照される skill の `references/contracts.md` を特定する。
標準版、ローカル版の両方を対象とする。
ファイルが存在しない場合は `spec-operation-contract-consistency` 分類で報告する（contracts.md 未配置）。

### 3. 手続き集合の比較

SPEC 操作契約テーブルから手続き名の集合を抽出する。
`references/contracts.md` から手続き名の集合を抽出する。
contracts.md では I/O 手続きは `### {手続き名}` 見出し、VERIFY 等のメタ手続きは独立した H2 セクション（`## VERIFY`）として記載される。
見出しレベルの違いを吸収し、両ファイルの見出し名の集合を比較する。
過不足を検出する。

- SPEC のみに存在する手続き → **不一致**（contracts.md への追記漏れ）
- contracts.md のみに存在する手続き → **不一致**（SPEC 操作契約テーブルへの追記漏れ）

### 4. 手続き名の表記比較

両ファイルの手続き名が完全一致することを確認する。
表記ゆれ（「Issue Close」と「Issue close」等）、過去名の残留（「Close Issue」と「Issue close」等）を検出する。

### 5. 入力、出力の比較

各手続きについて、SPEC の入力列、出力列と contracts.md の該当セクションの入力行、出力行を比較する。
要約 vs 詳細の粒度差は許容するが、必須要素の欠落、追加を検出する。

例: SPEC の「入力」列が「Issue 番号」であるのに、contracts.md の「入力」行が「Issue 番号、本文」である場合 → **不一致**（contracts.md 側で入力要素が追加されている）。
逆方向も同様。

### 6. 検出事項の報告

検出した不一致を `spec-operation-contract-consistency` 分類で報告する。
Recommended route は `references` または `spec` のいずれか（修正先が contracts.md 側か SPEC 側かによる）。

## 誤認パターンと診断分類

| 不一致パターン | 例 | 診断分類 |
|----------------|-----|----------|
| 手続きの欠落（contracts.md 側） | SPEC に「Issue close」があるが contracts.md に対応手続きがない | spec-operation-contract-consistency |
| 手続きの欠落（SPEC 側） | contracts.md に「Issue close」があるが SPEC 操作契約テーブルに対応行がない | spec-operation-contract-consistency |
| 手続き名の表記ゆれ | SPEC: 「Issue Close」、contracts.md: 「Issue close」 | spec-operation-contract-consistency |
| 入力の過不足 | SPEC 入力列が「Issue 番号」、contracts.md 入力行が「Issue 番号、本文」 | spec-operation-contract-consistency |
| 出力の過不足 | SPEC 出力列が「なし」、contracts.md 出力行が「マージ結果」 | spec-operation-contract-consistency |
| contracts.md 未配置 | SPEC は `## 操作契約` を持つが対応 skill の `references/contracts.md` が存在しない | spec-operation-contract-consistency |

## 出力形式

検出した不一致は SKILL.md「出力形式」セクションの Finding 形式で報告する。
Classification には `spec-operation-contract-consistency` を使用する。
Recommended route には `references`（contracts.md 側の修正）、`spec`（SPEC 側の修正）のいずれかを提示する。

報告例:

```markdown
- Finding: SPEC 操作契約テーブルと references/contracts.md の手続き集合が不一致
- Target: agentdev-gh-cli SPEC、src/opencode/skills/agentdev-gh-cli/references/contracts.md
- Classification: spec-operation-contract-consistency
- Evidence: SPEC 操作契約テーブルに「Issue close」手続きがあるが、contracts.md に該当手続きのセクションが存在しない
- Recommended route: references
```

## 単一情報源化の禁止（CR-001 適合）

本診断は SPEC 操作契約テーブルと references/contracts.md の不一致を検出するのみとする。
両者を単一情報源へ統合する生成スクリプト、ビルドステップ、自動同期機構は導入しない（CR-001）。
検出事項は推奨 route として提示し、修正実行は後続処理（ユーザー判断、別 Issue、別 PR）に委ねる。

## 対象外

- `## 操作契約` 見出しを持たない SPEC ファイル（操作契約テーブルを持たない command SPEC、横断 SPEC 等）
- contracts.md と無関係なスキル内部の整合性（変数名、内部アルゴリズム等）
- contracts.md 自体の記載内容の正確性（業務要件としての正確性は別途 reviews で担保）
- 操作契約テーブル自体のフォーマット妥当性（Markdown 表の構文、列数等は doc-writing 査読の対象）
