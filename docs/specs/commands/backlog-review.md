---
title: backlog-review SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# backlog-review SPEC

## 目的

採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する。
ユーザー承認は RU 作成承認を兼ねる。

## HITL 境界、自動実行ルール（REQ-003-003/004/005/009）

- **HITL は「判断の確定」に限定**（REQ-003-003）: Step 5 の統合、分割判定承認が主要な HITL 対象。
- **矛盾なしの場合の単一承認**（REQ-003-009）: Step 5 で矛盾が検出されない場合、Step 5 の統合、分割判定承認を RU 生成承認（Step 6/7）としても扱い、単一承認で処理する。追加の HITL は不要。
- **矛盾検出時の追加判断**（REQ-003-009）: Step 6 で矛盾が検出された場合のみ、ユーザーに追加判断を求める（矛盾する artifact を RU 化せず確認、矛盾しない artifact は通常通り RU 化）。
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
- REQ ファイル保存: 行わない（G01）
- GitHub Issue 作成: 行わない（G02）

## 現在の動作

- Step 1: 実行前同期（`git pull --ff-only`）
- Step 2: 成果物検出（引数有無切り替え（引数あり: 指定ファイルのみ / 引数なし: `promoted/` 全件））
- Step 3: 成果物読込、分析 + 暫定分類付与（`agentdev-backlog-integration` 参照）。暫定分類は `docs/specs/foundations/document-model.md` の文書7分類モデルを参照して付与し、RU frontmatter `tentative_classification` に記録する（v2:REQ-0155-004）。`tentative_classification` の許容値、7値以外入力時、フィールド欠落時の取り扱いは v2:REQ-0155-008、後述「tentative_classification フィールド仕様」に定める。暫定分類は後続 `/agentdev/req-define` で最終確定される候補であり、本コマンドが確定しない
- Step 4: 統合分割判定 + depends_on 依存解決 + ユーザー承認（判断の確定、REQ-003-003）（`agentdev-backlog-integration` 参照）
- Step 5: 矛盾検出（矛盾検出時のみ追加判断を求める（REQ-003-009））。矛盾なしの場合、Step 4 の統合、分割判定承認を RU 生成承認として扱い、単一承認で処理する。自動解決しない（G05）
- Step 6: RU 生成（採用済み成果物の単純コピー（パススルー）は禁止（G03、REQ-008））
- Step 7: 成果成果物削除（RU 生成失敗成果物は削除しない（G06））
- Step 8: Git 永続化
- Step 9: 完了報告

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU lifecycle、採用済み成果物 lifecycle）

## 対象外

- REQ ファイル保存（G01、req-save 責務）
- GitHub Issue 作成（G02、case-open 責務）
- 採用済み成果物の単純コピー（パススルー）（G03、REQ-008）
- `.agentdev/intake/inbox/`, `.agentdev/learning/inbox.md`, `.agentdev/learning/deferred.md` の更新（G04）
- 矛盾検出時の自動解決（G05）
- RU 生成失敗成果物の削除（G06）
- depends_on への採用済み成果物パス指定（G07、RU-ID のみ許容）

## 検証観点

- depends_on に RU-ID のみ許容（G07）
- 統合分割判定ロジック: `agentdev-backlog-integration` 参照

## tentative_classification と分類根拠伝播

backlog-review は採用済み成果物の分析時に tentative_classification（暫定分類）と分類根拠を RU へ付与して伝播させる（REQ-001-033、REQ-001）。分類根拠は learning/intake 成果物から後続工程（req-define、spec-save）へ引き継がれる情報であり、本 SPEC は backlog-review での扱いを規定する。

### 伝播させる分類根拠フィールド

backlog-review は採用済み成果物から読み取った次の分類根拠を RU frontmatter へ記録する。詳細なフィールド定義は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」を参照。

- change_nature（変更の性質: 8種別のいずれか）
- req_impact（REQ影響の有無）
- target_stakeholder（対象ステークホルダー）
- user_visible_change（利用者可視変更の有無）
- spec_logical_division（SPEC論理区分: 5区分のいずれか）
- canonical_owner（正規所有対象）
- destination_selection_reason（追記先選択理由）
- observed_evidence（観測根拠）

### tentative_classification との関係

tentative_classification（v2:REQ-0155-003 の7値）は文書種別の暫定分類であり、分類根拠は分類判断の根拠情報である。両者は併存し、req-define が最終分類を確定する際の入力となる。

### 後方互換運用

分類根拠は soft-contract（ADR-003）として扱い、欠落時は unknown 既定値で警告する後方互換運用をとる。分類根拠が欠落した旧 RU も unknown 既定値で受け入れる。欠落により RU を拒否しない。具体的なシリアライズ形式は `artifact-contracts.md`「分類根拠伝播契約」に従う。

### 暫定扱いの明記

backlog-review が付与する tentative_classification および分類根拠は暫定（tentative）扱いであり、req-define が最終確定する（REQ-004-087）。backlog-review 自体は最終分類を確定しない。

## tentative_classification フィールド仕様

RU frontmatter の `tentative_classification` フィールドの仕様（v2:REQ-0155-008）。

### 許容値

v2:REQ-0155-003 が定義する文書7分類のいずれか1値。

| 値 | 分類 |
|---|---|
| `REQ` | 要件定義 |
| `挙動SPEC` | 挙動SPEC |
| `カタログSPEC` | カタログSPEC |
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

## See Also

- [intake-promote.md](intake-promote.md), [learning-promote.md](learning-promote.md), [inspect-promote.md](inspect-promote.md)（前段コマンド）
- [req-define.md](req-define.md)（後続コマンド（RU を入力として要件定義））
- `agentdev-backlog-integration` skill（分析基準、統合分割判定、depends_on 依存解決、矛盾検出、RU 生成ルール）
- REQ-008（RU lifecycle）
- REQ-010（Backlog-review）

## adversarial-review 挿入境界（経路E）

本節は backlog-review における adversarial-review caller integration（REQ-015 経路E）の挿入境界を正典として所有する（REQ-014-011）。共通 caller integration 契約の正規所有者は adversarial-review SPEC であり（REQ-014-003）、本節は経路E 固有の挿入位置、発動条件、順序、矛盾取扱いのみを所有する。adversarial-review 自身の振る舞い契約、再 review 条件、停止条件は adversarial-review SPEC を正とし、本節で再定義しない。候補判断基準、内部手続き（候補確定位置、呼出タイミング、矛盾検出への引き渡し）の正規所有者は agentdev-backlog-integration SPEC とし、本節は参照する。

### 挿入境界と Step 構造（REQ-015-001）

backlog-review の現行 Step 構造へ review 挿入境界を次のとおり一意に特定する。発動条件判定 Step と review 呼出 Step を分離する（REQ-015-001）。本節は挿入境界の正典であり、`.opencode/commands/agentdev/backlog-review.md` の Step 4-1 が実行時投影先となる。

| 段階 | 対応 Step | 役割 |
|---|---|---|
| 構成 | Step 3（分析 + 暫定分類付与）、Step 4（統合・分割判定 + depends_on 依存解決） | review 対象となる RU 構成案を確定する |
| 発動条件判定 | Step 4 完了直後、Step 5 開始前（Step 4-1） | default-on 原則と skip 条件を判定する |
| review 呼出 | 発動条件該当時、Step 5 開始前（Step 4-1） | adversarial-review を起動し、RU 構成案を審議対象へ渡す |
| 承認 | Step 4 承認（矛盾なし時の単一承認）、Step 5（矛盾検出時の追加判断） | review 結果を踏まえユーザー承認を確定する |

### 構成、review、承認の順序（REQ-015-008）

経路E は構成、review、承認の順で進む（REQ-015-008）。review は構成（Step 3、Step 4）の完了後、承認（Step 4 承認、Step 5 追加判断）の前に挿入する。review を構成前に、または承認後に挿入しない。

### 発動条件（REQ-015-002、REQ-015-003）

backlog-review は adversarial-review を原則実行する（default-on、REQ-015-002）。ユーザー明示指定は通常発動の必須条件ではなく、RU 構成案（統合・分割判定、depends_on 依存解決）に意味的決定が存在する場合に発動する。

- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フロー（Step 5 以降）を継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - RU 構成要素が1件のみ（統合・分割判定不要、depends_on 解決不要）で矛盾検出対象が存在しない場合
- **ユーザー明示指定時の必須実行**: ユーザーが backlog-review 実行中に adversarial-review の実施を明示的に指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。

### 従来フロー維持（REQ-015-003）

skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、従来フロー（Step 1〜9）を維持する（REQ-015-003）。review 挿入境界は既存 Step を追加、削除、並べ替えせず、発動条件判定と review 呼出 Step を分離した形で現行 Step 構造へ挿入する。

### 矛盾の扱い（REQ-015-008）

adversarial-review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は backlog-review の既存矛盾検出（Step 5、agentdev-backlog-integration 矛盾検出ロジック）へ渡す。adversarial-review 自身は矛盾を自動解決せず（REQ-015-008）、矛盾の解決、採用、却下、partial success 扱いは既存矛盾検出と HITL（REQ-003-009）へ委ねる。review 内で矛盾が発生したことを理由に対象 RU を自動除外、自動承認しない。

### 戻り先と反映責務

accepted finding の RU 構成案への反映は backlog-review 呼出元の責務である（REQ-014-006）。adversarial-review は finding を提示し、合意候補を形成するが、RU 本文、frontmatter、統合判定への反映を自身では行わない。反映後に RU 構成案の意味内容が変更された場合、必要な既存検証（depends_on 再解決、矛盾検出の再実行）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる（REQ-014-007）。unresolved な本質的争点またはユーザー判断事項が残る場合、RU 生成（Step 6）、採用済み成果物削除（Step 7）、Git 永続化（Step 8）等の後続不可逆処理へ進まない（REQ-014-009）。

### 正規所有者マトリックス参照

本節と adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts SPEC「adversarial-review との委譲契約接続」節、agentdev-backlog-integration SPEC「adversarial-review 候補判断と内部挿入」節との間で意味の重複、矛盾を生じない。backlog-review command 固有の挿入境界（発動条件、Step 構造、順序、矛盾取扱い）のみを本節が所有し、候補判断基準、内部手続きの詳細は agentdev-backlog-integration SPEC を正とする。

