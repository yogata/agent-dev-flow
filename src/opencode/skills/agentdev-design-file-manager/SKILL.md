---
name: agentdev-design-file-manager
description: Manages Design file operations (CREATE/APPEND/UPDATE), placement resolution, target_area section replacement, Design-specific integrity, and Design-specific script invocation contract. USE FOR: creating Design files, appending sections, updating Designs via target_area, Design lifecycle (draft/accepted) application. DO NOT USE FOR: REQ/ADR operations, Design content inference, accepted promotion, user approval, commit, push.
---

# Designファイル管理

このスキルは Design ファイル（`* Design`）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: Design ファイル操作モード、配置先解決、`target_area` マッチング規則、Design ライフサイクル適用、Design 固有整合性確認、Design 固有 script 呼出契約
- **適用先**: `design-save`（Design 保存時）

---

## 責務境界

本スキルは Design 操作（作成、更新、配置判断、target_area 処理、Design 固有整合性確認、Design 固有 script 呼出契約）のみを担う。
REQ 操作、ADR 操作、Design 内容推論、accepted 昇格判断、ユーザー承認、commit、push は対象外。

| 操作 | 本スキル | 他スキル |
|------|----------|----------|
| Design 作成、追記、target_area 置換 | ✓ | |
| Design 配置先解決（既存 vs 新規） | ✓ | |
| Design ライフサイクル適用（draft 付与、status 维持） | ✓ | |
| `search-target-area.ts` 呼出契約 | ✓ | |
| REQ 番号採番、REQ ファイル操作 | | `agentdev-req-file-manager` |
| Decision 番号採番、Decision ファイル操作 | | `agentdev-decision-file-manager` |
| Design 内容の新規推論 | | `agentdev-req-analysis`（req-define 経由） |
| accepted 昇格判断 | | `case-close` |
| 共通検証（frontmatter 整合性、エントリ存在、変更範囲） | | `agentdev-artifact-validation` の公開検証契約へ委譲 |
| docs 横断診断 | | `agentdev-doc-diagnostics` |

---

## ファイル操作モード

Design ファイルは CREATE（新規）、APPEND（既存追記）、UPDATE（target_area 置換）の3モードで操作する。

| 状況 | モード | target_area | status 扱い |
|------|--------|-------------|-------------|
| 新規 Design（`target_design.operation: create`） | CREATE | 使用しない | `draft` を付与 |
| 既存 Design へ新規セクション追加（`operation: append`） | APPEND | anchor として使用する | 変更しない |
| 既存 Design セクション置換（`operation: update`、target_area 指定） | UPDATE | 使用する | 変更しない |

`target_area` マッチング規則、複数マッチ時の挙動、未検出時の挙動の詳細は [references/target-area-matching.md](references/target-area-matching.md) 参照。

---

## Design ライフサイクル適用

Design frontmatter の `status`（`draft` / `accepted` の2値）を本スキルの操作で次のように適用する。

- **CREATE**: frontmatter に `title`、`status: draft`、`created`、`updated` を必ず付与する（design-save 不変条件・前出出力検証表 STEP-5）
- **APPEND / UPDATE**: 既存 Design の `status` を変更しない。`accepted` 昇格は case-close の責務
- 置換済み Design は現行 Design ツリーへ保持しない。置換時は旧 Design を現行ツリーから除外し、履歴は Git、Issue、Decision 等の既存履歴手段から確認する

詳細は [references/design-lifecycle-application.md](references/design-lifecycle-application.md) 参照。

---

## 配置先解決

各 Design action の `target`（または `target_design: {operation, domain, slug}` 構造化）から配置先 Design を解決する:

- 既存 Design パス（例: `docs/designs/{domain}/<existing-design>.md`）→ 当該 Design へ追記（`update` 操作）
- `target_design: {operation: create, domain, slug}` → 新規 Design 作成。ファイル名は `docs/designs/{domain}/{slug}.md`
- 重複候補の統合: 同一 `target` の action は1つの Design へ集約する

新規 Design 作成時の frontmatter は `title`, `status: draft`, `created`, `updated` の4フィールドを付与する。

---

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、本スキルが規定する Design 固有処理を機械的に実行する（design-principles.md 第5節、AG-{NNN}/{NNN}）。
LLM 推論で実行していた決定的処理をスクリプトへ委譲することで、target_area マッチングのばらつきを確実に防止する。

配置先: 本スキル配下の `scripts/`（Design 固有）。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）。

共通検証 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `agentdev-artifact-validation` が所有し、本スキルは公開検証契約経由で委譲する。
本スキル配下には Design 固有 script のみを配置する。

### I/O 契約（REQ）

| 項目 | 規約 |
|------|------|
| 入力 | argv（ファイルパス）または stdin（JSON） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ |
| 副作用 | なし（純粋関数、ファイル I/O は入力読み込みのみ） |

### スクリプト一覧

| スクリプト | 役割 | 入力 | 出力 JSON |
|-----------|------|------|-----------|
| `search-target-area.ts` | Design ファイル内 target_area 見出し検索 | argv[2]=target_area, argv[3..]=design files、または stdin JSON | `{ ok, matches: [{file, line, text}] }` |

### 実行方法

```bash
# bun 経由で直接実行（REQ: LLM は bash 経由で呼び出し）
bun src/opencode/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts "target_area文字列" docs/designs/{domain}/<existing-design>.md

# stdin JSON 入力
echo '{"target_area":"パターン","files":["docs/designs/{domain}/<existing-design>.md"]}' | bun src/opencode/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts

# テスト実行
cd src/opencode/skills/agentdev-design-file-manager/scripts && bun test
```

### design-save からの呼び出し

design-save は本スクリプト群を bash 経由で呼び出し、JSON 結果を parse して意味判断（複数マッチ時の warning、未検出時のスキップ判定等）を行う。
これにより target_area 見出し検索を LLM 推論ではなく機械的に実行する（design-principles.md 第5節「決定的処理の Script 委譲原則」）。

---

## 主要な不変条件

- 新規 Design 作成時の frontmatter 完全性（`title`, `status: draft`, `created`, `updated`）
- 既存 Design 追記時の `status` 変更がないこと
- target_area マッチング規則の適用結果（単一マッチ採用、複数マッチ時の warn、未検出時のスキップ + follow-up）
- Design 固有 script が単一の正規所有者（本スキル）に集約されていること
- 共通検証を重複実装せず `agentdev-artifact-validation` の公開検証契約へ委譲すること

---

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Capability Skill として、design-save Workflow Skill が所有する STEP から呼び出される（`<workflows/workflow-skill-model>` Design）。
本スキル自身は STEP を所有しない。

### 永続成果物と Input Resolution

本スキルが操作する Design ファイル群は永続状態の最上位（SSoT 再構成）に位置する。
Design `status`（`draft` / `accepted`）は最小 scalar 相当の状態値として扱う。
優先順位の詳細は `<workflows/input-resolution-and-durable-state>` Design 参照。

呼出元 STEP（design-save）は本スキルの操作結果（Design ファイル作成、target_area 置換結果）を STEP の result evidence として扱い、次 STEP の Input Resolution で SSoT 再構成から再取得できる。
STEP reference 8 要素は `<workflows/step-reference-contract>` Design 参照。

## See Also

- **agentdev-req-file-manager**: REQ ファイル管理（REQ ↔ Design 整合性の境界）
- **agentdev-decision-file-manager**: Decision ファイル管理
- **agentdev-artifact-validation**: 共通検証 script の公開検証契約（委譲先）
- **agentdev-doc-diagnostics**: docs 横断診断
- **agentdev-doc-writing**: Design 横断の文書品質査読ゲート
- Design ライフサイクルと design-save の導入（本体 ADR 参照）
- REQ/Design 責務分離、script 所有権（本体 REQ 参照）

## 参考文献

SKILL.md 本文から遅延読み込みされる詳細資料。
各ファイルの冒頭に本文への文脈宣言を備える。

| ファイル | 内容 |
|----------|------|
| [references/target-area-matching.md](references/target-area-matching.md) | target_area マッチング規則、見出し階層解釈、複数マッチ時の挙動、未検出時の挙動、機械置換手順の3段階適用と参照検査観点（参照実在確認、変動値分離）、後方互換（target_area 未指定） |
| [references/design-lifecycle-application.md](references/design-lifecycle-application.md) | Design lifecycle（draft/accepted）適用、CREATE/APPEND/UPDATE ごとの status 扱い、Design 一覧表（`docs/designs/README.md` 相当）登録 |
