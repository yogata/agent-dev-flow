---
title: backlog-review Design
status: accepted
created: 2026-06-21
updated: 2026-09-01
---

<!-- ADF-COVERS(implementation): REQ-021-021 -->
<!-- ADF-COVERS(implementation): REQ-015-008 -->
<!-- ADF-COVERS(implementation): REQ-039-001, REQ-039-002, REQ-039-003, REQ-039-004, REQ-039-005, REQ-039-006 -->

# backlog-review Design

## 目的

採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する。
ユーザー承認は RU 作成承認を兼ねる。

## HITL 境界、自動実行ルール（REQ-003-003/004/005/009）

- **HITL は「判断の確定」に限定**（REQ-003-003）: 統合、分割判定承認が主要な HITL 対象。
- **矛盾なしの場合の単一承認**（REQ-003-009）: 矛盾が検出されない場合、統合、分割判定承認を RU 生成承認としても扱い、単一承認で処理する。追加の HITL は不要。
- **矛盾検出時の追加判断**（REQ-003-009）: 矛盾が検出された場合のみ、ユーザーに追加判断を求める（矛盾する artifact を RU 化せず確認、矛盾しない artifact は通常通り RU 化）。
- **承認後の自動実行**（REQ-003-004）: 承認確定後の RU 生成、採用済み成果物削除、commit/push は自動実行する。
- **破壊的変更の明示承認維持**（REQ-003-005）: 矛盾解消、要件仕様スコープ変更、大量成果物削除等の破壊的操作は明示承認を維持する。

## 入力

- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`
- `.agentdev/inspect/promoted/*.md`
- 引数指定時: 指定ファイルのみ対象

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除

## 副作用

- git commit/push: `.agentdev/` 配下（明示パスステージング、v2:REQ-0137-002/005）
- 実行前同期: `git pull --ff-only`
- docs/knowledge/ 知識文書保存: learning 由来の分類結果が docs/knowledge/ への知識文書保存（REQ-056、REQ-039-006）に振り分けられた場合、利用者承認を経て docs/knowledge/ へ直接書き込む。docs/knowledge/ は git 管理対象（ドメイン状態の永続化対象）であり、当該書き込みは git 永続化対象の副作用である
- REQ ファイル保存: 行わない（req-save 責務）
- GitHub Issue 作成: 行わない（case-open 責務）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-backlog-review`）が正規情報源である。

- 実行前同期（`git pull --ff-only`）
- 成果物検出（引数有無切り替え（引数あり: 指定ファイルのみ / 引数なし: `promoted/` 全件））
- 成果物読込、分析 + 暫定分類付与（`agentdev-backlog-integration` 参照）。暫定分類は `docs/designs/foundations/document-model.md` の文書7分類モデルを参照して付与し、RU frontmatter `tentative_classification` に記録する（v2:REQ-0155-004）。`tentative_classification` の許容値、7値以外入力時、フィールド欠落時の取り扱いは v2:REQ-0155-008、後述「tentative_classification フィールド仕様」に定める。暫定分類は後続 `/agentdev/req-define` で最終確定される候補であり、本コマンドが確定しない
- 統合分割判定 + depends_on 依存解決 + ユーザー承認（判断の確定、REQ-003-003）（`agentdev-backlog-integration` 参照）
- 矛盾検出（矛盾検出時のみ追加判断を求める（REQ-003-009））。矛盾なしの場合、統合、分割判定承認を RU 生成承認として扱い、単一承認で処理する。自動解決しない
- RU 生成（採用済み成果物の単純コピー（パススルー）は禁止（REQ-008））
- 成果物削除（RU 生成失敗成果物は削除しない）
- Git 永続化
- 完了報告

## learning 由来プロジェクト知識の docs/knowledge/ 直接保存

learning-promote の反映先分類で docs/knowledge/ への知識文書保存（REQ-056、REQ-039-006）に振り分けられた採用済み成果物は、RU 化を経ずに以下の手順で処理する。

1. 知識候補の内容を知識文書契約（1知識1ファイル、kebab-case slug、必須内容5項目）へ整形する
2. 既存 docs/knowledge/ 配下ファイルとの重複・陳腐化を確認し、新規、更新、置換、削除の操作種別を判定する
3. 操作種別ごとの変更内容を利用者へ提示し、承認を得る。承認なしの書き込みは行わない
4. 承認後、docs/knowledge/ へファイルを書き込み、保存に成功した採用済み成果物を promoted から削除する

構造整合性（正規配置、命名、必須内容）は docs-check 系の機械検査が担保し、意味的妥当性は機械で確定しない（REQ-056）。

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/backlog-review.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（工程構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-backlog-review`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は Workflow Skill description の DO NOT USE FOR トリガーにより実効する（command 定義本文に soft guard 宣言節を持たない構成である）。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 候補探索（独立探索手段）

backlog-review は、入力成果物に含まれる REQ, Decision, Design, canonical owner 等の明示情報を起点として、README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で既存正規成果物との関係候補を探索する（REQ-021-021）。
agentdev-traceability の coverage, impact, check を一般文書探索、構造診断、依存関係探索の用途に利用しない。

- 候補には統合, 分割, depends_on 解決の補助 evidence を含める
- 統合, 分割, depends_on, 意味的重複の最終判断は正規成果物本文と独立探索手段での確認後に下す
- promoted artifact 自体を特定の探索機構の正規 node とすることは必須でない

## 参照する横断 Design

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU lifecycle、採用済み成果物 lifecycle）

## 対象外

- REQ ファイル保存（req-save 責務）
- GitHub Issue 作成（case-open 責務）
- 採用済み成果物の単純コピー（パススルー）（REQ-008）
- `.agentdev/intake/inbox/`, `.agentdev/learning/inbox.md`, `.agentdev/learning/deferred.md` の更新
- 矛盾検出時の自動解決
- RU 生成失敗成果物の削除
- depends_on への採用済み成果物パス指定（RU-ID のみ許容）

## 検証観点

- depends_on に RU-ID のみ許容
- 統合分割判定ロジック: `agentdev-backlog-integration` 参照

## tentative_classification と分類根拠伝播

backlog-review は採用済み成果物の分析時に tentative_classification（暫定分類）と分類根拠を RU へ付与して伝播させる（REQ-001-033、REQ-001）。
分類根拠は learning/intake 成果物から後続工程（req-define、design-save）へ引き継がれる情報であり、本 Design は backlog-review での扱いを規定する。

### 伝播させる分類根拠フィールド

backlog-review は採用済み成果物から読み取った次の分類根拠を RU frontmatter へ記録する。
詳細なフィールド定義は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」を参照。

- change_nature（変更の性質: 8種別のいずれか）
- req_impact（REQ影響の有無）
- target_stakeholder（対象ステークホルダー）
- user_visible_change（利用者可視変更の有無）
- canonical_owner（正規所有対象）
- destination_selection_reason（追記先選択理由）
- observed_evidence（観測根拠）

### tentative_classification との関係

tentative_classification（v2:REQ-0155-003 の7値）は文書種別の暫定分類であり、分類根拠は分類判断の根拠情報である。
両者は併存し、req-define が最終分類を確定する際の入力となる。

### 後方互換運用

分類根拠は soft-contract（DEC-003）として扱い、欠落時は unknown 既定値で警告する後方互換運用をとる。
分類根拠が欠落した旧 RU も unknown 既定値で受け入れる。
欠落により RU を拒否しない。
具体的なシリアライズ形式は `artifact-contracts.md`「分類根拠伝播契約」に従う。

### 暫定扱いの明記

backlog-review が付与する tentative_classification および分類根拠は暫定（tentative）扱いであり、req-define が最終確定する（REQ-004-010）。
backlog-review 自体は最終分類を確定しない。

## tentative_classification フィールド仕様

RU frontmatter の `tentative_classification` フィールドの仕様（v2:REQ-0155-008）。

### 許容値

v2:REQ-0155-003 が定義する文書7分類のいずれか1値。

| 値 | 分類 |
|---|---|
| `REQ` | 要件定義 |
| `挙動Design` | 挙動Design |
| `カタログDesign` | カタログDesign |
| `guide` | ガイド |
| `learning維持` | learning 維持 |
| `作業記録` | 作業記録 |
| `対象外` | 要件化対象外 |

### 7値以外の入力時の挙動

backlog-review が `tentative_classification` に7値以外の値を付与しようとした場合、RU 生成を停止し、訂正を求めること。
7値以外の値で RU を生成しないこと。

### フィールド欠落時の挙動

backlog-review は全 RU frontmatter に `tentative_classification` を付与すること。
フィールド欠落の RU は生成しないこと。

## 停止状態

- 矛盾検出時の追加判断をユーザーから得られない場合（REQ-003-009。矛盾する artifact の RU 化を保留し、判断を待つ）。
- adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残る場合（RU 生成、採用済み成果物削除、Git 永続化等の後続不可逆処理へ進まない、REQ-014-009）。
- RU frontmatter `tentative_classification` へ7値以外の値を付与しようとした場合（RU 生成を停止し、訂正を求める）。
- 実行前同期（`git pull --ff-only`）失敗時（エラーを報告して停止する）。

## See Also

- [intake-promote.md](intake-promote.md), [learning-promote.md](learning-promote.md), [inspect-promote.md](inspect-promote.md)（前段コマンド）
- [req-define.md](req-define.md)（後続コマンド（RU を入力として要件定義））
- `agentdev-workflow-backlog-review` skill（workflow 実装本体）
- `agentdev-backlog-integration` skill（分析基準、統合分割判定、depends_on 依存解決、矛盾検出、RU 生成ルール）
- REQ-008（RU lifecycle）
- REQ-039（バックログ統合）

## adversarial-review 挿入境界（backlog-review）

本節は backlog-review における adversarial-review caller integration（REQ-015-008）の挿入境界を正典として所有する（REQ-014-011）。
共通 caller integration 契約の正規所有者は adversarial-review Design であり（REQ-014-003）、本節は backlog-review 固有の挿入位置、発動条件、順序、矛盾取扱いのみを所有する。
adversarial-review 自身の振る舞い契約、再 review 条件、停止条件は adversarial-review Design を正とし、本節で再定義しない。
候補判断基準、内部手続き（候補確定位置、呼出タイミング、矛盾検出への引き渡し）の正規所有者は agentdev-backlog-integration Design とし、本節は参照する。

### 挿入境界と Step 構造（REQ-015-001）

backlog-review の処理段階へ review 挿入境界を次のとおり一意に特定する。
発動条件判定と review 呼出を分離する（REQ-015-001）。
本節は挿入境界の正典であり、Workflow Skill（`agentdev-workflow-backlog-review`）内の発動条件判定手順が実行時実装先となる。

| 段階 | 対応処理 | 役割 |
|---|---|---|
| 構成 | 分析 + 暫定分類付与、統合・分割判定 + depends_on 依存解決 | review 対象となる RU 構成案を確定する |
| 発動条件判定 | 構成完了直後、矛盾検出開始前 | default-on 原則と skip 条件を判定する |
| review 呼出 | 発動条件該当時、矛盾検出開始前 | adversarial-review を起動し、RU 構成案を審議対象へ渡す |
| 承認 | 構成承認（矛盾なし時の単一承認）、矛盾検出時の追加判断 | review 結果を踏まえユーザー承認を確定する |

### 構成、review、承認の順序（REQ-015-008）

backlog-review の統合は構成、review、承認の順で進む（REQ-015-008）。
review は構成（分析、統合・分割判定）の完了後、承認（構成承認、矛盾検出時追加判断）の前に挿入する。
review を構成前に、または承認後に挿入しない。

### 発動条件（REQ-015-002、REQ-015-003）

backlog-review は adversarial-review を原則実行する（default-on、REQ-015-002）。
ユーザー明示指定は通常発動の必須条件ではなく、RU 構成案（統合・分割判定、depends_on 依存解決）に意味的決定が存在する場合に発動する。

- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フロー（矛盾検出以降）を継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - RU 構成要素が1件のみ（統合・分割判定不要、depends_on 解決不要）で矛盾検出対象が存在しない場合
- **ユーザー明示指定時の必須実行**: ユーザーが backlog-review 実行中に adversarial-review の実施を明示的に指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。

### 従来フロー維持（REQ-015-003）

skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、従来フロー（実行前同期から完了報告まで）を維持する（REQ-015-003）。
review 挿入境界は既存処理段階を追加、削除、並べ替えせず、発動条件判定と review 呼出を分離した形で挿入する。

### 矛盾の扱い（REQ-015-008）

adversarial-review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は backlog-review の既存矛盾検出（agentdev-backlog-integration 矛盾検出ロジック）へ渡す。
adversarial-review 自身は矛盾を自動解決せず（REQ-015-008）、矛盾の解決、採用、却下、partial success 扱いは既存矛盾検出と HITL（REQ-003-009）へ委ねる。
review 内で矛盾が発生したことを理由に対象 RU を自動除外、自動承認しない。

### 戻り先と反映責務

accepted finding の RU 構成案への反映は backlog-review 呼出元の責務である（REQ-014-006）。
adversarial-review は finding を提示し、合意候補を形成するが、RU 本文、frontmatter、統合判定への反映を自身では行わない。
反映後に RU 構成案の意味内容が変更された場合、必要な既存検証（depends_on 再解決、矛盾検出の再実行）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる（REQ-014-007）。
unresolved な本質的争点またはユーザー判断事項が残る場合、RU 生成、採用済み成果物削除、Git 永続化等の後続不可逆処理へ進まない（REQ-014-009）。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、agentdev-backlog-integration Design「adversarial-review 候補判断と内部挿入」節との間で意味の重複、矛盾を生じない。
backlog-review command 固有の挿入境界（発動条件、挿入構造、順序、矛盾取扱い）のみを本節が所有し、候補判断基準、内部手続きの詳細は agentdev-backlog-integration Design を正とする。

