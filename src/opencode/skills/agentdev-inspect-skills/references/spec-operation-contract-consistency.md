<!-- ADF-COVERS(implementation): REQ-036-027 -->
# Design 操作契約テーブルと操作契約実体のフィールド一致性判定基準

> **原本**: 本ファイルは inspect-skills 診断観点「Design 操作契約テーブル ↔ 操作契約実体（contracts.ts）フィールド一致性」の判定基準詳細、対象 Design 範囲、フィールド対応規則を集約する運用ビューである。
> 原本と内容が重複する場合は原本を優先する。

## 適用範囲

`/agentdev/inspect-skills` 診断で、Design 側に記載された操作契約テーブルと、対応する操作契約実体 `contracts.ts`（`agentdev_gh` Tool 配下）のフィールド集合が過不足なく一致することを検証する。
両者は独立ファイルとして維持され（単一情報源化は導入しない）、本診断は両者の不一致を検出事項として報告するのみで、ファイル修正、自動再同期は行わない。

検出の前提: Design 操作契約テーブルは薄いルーティング入口として手続き名、入力、出力を要約し、操作契約実体は手続きごとに入力、出力、エラー扱い、前提、後続等を検証契約として詳細化する。
両者の手続き集合と主要フィールド（入力、出力）が一致することが整合性の要件である。

## 対象 Design 範囲

`## 操作契約`（または同等の操作契約テーブル）を含む Design ファイルを対象とする。
現在の対象は以下のとおり。

| 対象 Design | 対応 操作契約実体 |
|-----------|------------------------------|
| Design `custom-tool-contracts.md`「対象操作の境界（初期セット）」 | `src/opencode/tools/agentdev-gh/contracts.ts`（GitHub 実装と Local 実装で同一の操作契約） |

新規に `## 操作契約` セクションを持つ Design が追加された場合、本診断の対象に自動的に含まれる。
Design 内の「操作契約」見出しを走査し、対応する操作契約実体（`contracts.ts`）が存在するかを確認する。

操作契約実体は単一ファイルで維持し、標準版、ローカル版の分離は存在しない（Skill 解消により references 分離構造は解消済み）。
Design 操作契約テーブルとの一致が求められる。

## フィールド対応規則

Design 操作契約テーブルの列と操作契約実体の手続きごとの契約行は、以下のように対応する。

### Design 操作契約の標準構造（`custom-tool-contracts` 事例）

| 列 | 内容 |
|----|------|
| 手続き | 手続き名（Issue 作成、Issue 本文読込 等） |
| 入力 | 当該手続きの入力概要 |
| 出力 | 当該手続きの出力概要 |

Design 側は薄いルーティング入口として要約版を保持する。
操作契約の型は `contracts.ts` が単一所有する（Skill 解消により references 分離構造は解消。`custom-tool-contracts` Design 参照）。

### 操作契約実体の手続きごとの契約標準構造

| 行 | 内容 |
|----|------|
| 入力 | 当該手続きの入力詳細 |
| 出力 | 当該手続きの出力詳細 |
| エラー扱い | 失敗条件とエラー分類 |
| 前提 | （任意）実行前に満たすべき条件 |
| 後続 | （任意）実行後に続行すべき手続き |
| 読替先 | （ローカル版のみ）Case ファイル対応セクション |

### 対応規則

1. **手続き集合の一致**: Design 操作契約テーブルの行数（手続き数）と操作契約実体に定義される手続き数が一致すること。
操作契約実体では I/O 手続きが操作カタログの操作定義として並び、VERIFY 等のメタ手続きは独立した検証手順として記載される場合がある。
表現形式の違いは手続き集合の不一致とは扱わず、各手続きが操作契約実体内のいずれかの操作定義に存在することを確認する
2. **手続き名の一致**: Design 操作契約テーブルの手続き名と操作契約実体の対応操作名が 1 対 1 で一致すること（表記ゆれ、過去名の残留がないこと）
3. **入力の一致**: Design 操作契約テーブルの「入力」列と操作契約実体の該当操作の入力契約が、要約 vs 詳細の粒度差を許容したうえで、必須要素の集合として一致すること
4. **出力の一致**: Design 操作契約テーブルの「出力」列と操作契約実体の該当操作の出力契約が、同様に要約 vs 詳細の粒度差を許容したうえで、必須要素の集合として一致すること
5. **エラー扱い、前提、後続、読替先の取り扱い**: Design 操作契約テーブルには含まれない項目である。これらは操作契約実体側の拡張項目として扱い、Design 側の欠落は不一致としない（要約 vs 詳細の役割分担）

## 診断手順

### 1. 対象 Design の特定

`docs/designs/` 配下を走査し、`## 操作契約` 見出しを含む Design ファイルを特定する。
現在は custom-tool-contracts Design のみが該当する。
新規追加 Design が同見出しを持つ場合、自動的に対象に含める。

### 2. 対応 contracts.md の特定

Design から参照される操作契約実体（`contracts.ts`、`agentdev_gh` Tool 配下に配置）を特定する。
操作契約実体は単一ファイルで、標準版、ローカル版の分離は存在しない。
ファイルが存在しない場合は `spec-operation-contract-consistency` 分類で報告する（操作契約実体未配置）。

### 3. 手続き集合の比較

Design 操作契約テーブルから手続き名の集合を抽出する。
操作契約実体から手続き名の集合を抽出する。
操作契約実体では I/O 手続きは操作カタログの操作定義、VERIFY 等のメタ手続きは独立した検証操作として定義される。
表現形式の違いを吸収し、両者の手続き名の集合を比較する。
過不足を検出する。

- Design のみに存在する手続き → **不一致**（操作契約実体への追記漏れ）
- 操作契約実体のみに存在する手続き → **不一致**（Design 操作契約テーブルへの追記漏れ）

### 4. 手続き名の表記比較

両ファイルの手続き名が完全一致することを確認する。
表記ゆれ（「Issue Close」と「Issue close」等）、過去名の残留（「Close Issue」と「Issue close」等）を検出する。

### 5. 入力、出力の比較

各手続きについて、Design の入力列、出力列と操作契約実体の該当操作の入力契約、出力契約を比較する。
要約 vs 詳細の粒度差は許容するが、必須要素の欠落、追加を検出する。

例: Design の「入力」列が「Issue 番号」であるのに、操作契約実体の該当操作の入力契約が「Issue 番号、本文」である場合 → **不一致**（操作契約実体側で入力要素が追加されている）。
逆方向も同様。

### 6. 検出事項の報告

検出した不一致を `spec-operation-contract-consistency` 分類で報告する。
Recommended route は操作契約実体側（Tool 実装）または `spec`（Design 側）のいずれか（修正先による）。

## 誤認パターンと診断分類

| 不一致パターン | 例 | 診断分類 |
|----------------|-----|----------|
| 手続きの欠落（操作契約実体側） | Design に「Issue close」があるが操作契約実体に対応手続きがない | spec-operation-contract-consistency |
| 手続きの欠落（Design 側） | 操作契約実体に「Issue close」があるが Design 操作契約テーブルに対応行がない | spec-operation-contract-consistency |
| 手続き名の表記ゆれ | Design: 「Issue Close」、操作契約実体: 「Issue close」 | spec-operation-contract-consistency |
| 入力の過不足 | Design 入力列が「Issue 番号」、操作契約実体の入力契約が「Issue 番号、本文」 | spec-operation-contract-consistency |
| 出力の過不足 | Design 出力列が「なし」、操作契約実体の出力契約が「マージ結果」 | spec-operation-contract-consistency |
| 操作契約実体未配置 | Design は `## 操作契約` を持つが対応する操作契約実体が存在しない | spec-operation-contract-consistency |

## 出力形式

検出した不一致は SKILL.md「出力形式」セクションの Finding 形式で報告する。
Classification には `spec-operation-contract-consistency` を使用する。
Recommended route には操作契約実体（Tool 実装）側の修正、`spec`（Design 側の修正）のいずれかを提示する。

報告例:

```markdown
- Finding: Design 操作契約テーブルと操作契約実体の操作集合が不一致
- Target: Design docs/designs/responsibilities/custom-tool-contracts.md、src/opencode/tools/agentdev-gh/contracts.ts
- Classification: spec-operation-contract-consistency
- Evidence: Design 操作契約テーブルに「Issue close」手続きがあるが、操作契約実体に該当手続きの操作定義が存在しない
- Recommended route: 操作契約実体（src/opencode/tools/agentdev-gh/contracts.ts）
```

## 単一情報源化の禁止

本診断は Design 操作契約テーブルと操作契約実体の不一致を検出するのみとする。
両者を単一情報源へ統合する生成スクリプト、ビルドステップ、自動同期機構は導入しない。
検出事項は推奨 route として提示し、修正実行は後続処理（ユーザー判断、別 Issue、別 PR）に委ねる。

## 対象外

- `## 操作契約` 見出しを持たない Design ファイル（操作契約テーブルを持たない command Design、横断 Design 等）
- 操作契約実体と無関係なスキル内部の整合性（変数名、内部アルゴリズム等）
- 操作契約実体自体の記載内容の正確性（業務要件としての正確性は別途 reviews で担保）
- 操作契約テーブル自体のフォーマット妥当性（Markdown 表の構文、列数等は doc-writing 査読の対象）
