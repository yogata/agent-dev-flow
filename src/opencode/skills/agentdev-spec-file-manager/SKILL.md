---
name: agentdev-spec-file-manager
description: Manages SPEC file operations (CREATE/APPEND/UPDATE), placement resolution, target_area section replacement, SPEC-specific integrity, and SPEC-specific script invocation contract. USE FOR: creating SPEC files, appending sections, updating existing SPECs via target_area, SPEC lifecycle (draft/accepted/superseded) application, invoking search-target-area.ts. DO NOT USE FOR: REQ/ADR operations, SPEC content inference, accepted promotion, user approval, commit, push, or duplicating common validation scripts.
---

# SPECファイル管理

このスキルは SPEC ファイル（`* SPEC`）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: SPEC ファイル操作モード、配置先解決、`target_area` マッチング規則、SPEC ライフサイクル適用、SPEC 固有整合性確認、SPEC 固有 script 呼出契約
- **適用先**: `spec-save`（SPEC 保存時）

---

## 原本（SSoT）

本スキルの原本仕様は `agentdev-spec-file-manager` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 責務境界

本スキルは SPEC 操作（作成、更新、配置判断、target_area 処理、SPEC 固有整合性確認、SPEC 固有 script 呼出契約）のみを担う。REQ 操作、ADR 操作、SPEC 内容推論、accepted 昇格判断、ユーザー承認、commit、push は対象外。

| 操作 | 本スキル | 他スキル |
|------|----------|----------|
| SPEC 作成、追記、target_area 置換 | ✓ | |
| SPEC 配置先解決（既存 vs 新規） | ✓ | |
| SPEC ライフサイクル適用（draft 付与、status 维持） | ✓ | |
| `search-target-area.ts` 呼出契約 | ✓ | |
| REQ 番号採番、REQ ファイル操作 | | `agentdev-req-file-manager` |
| ADR 番号採番、ADR ファイル操作 | | `agentdev-adr-file-manager` |
| SPEC 内容の新規推論 | | `agentdev-req-analysis`（req-define 経由） |
| accepted 昇格判断 | | `case-close` |
| 共通検証（frontmatter 整合性、エントリ存在、変更範囲） | | `agentdev-artifact-validation` の公開検証契約へ委譲 |
| docs 横断診断 | | `agentdev-doc-diagnostics` |

---

## ファイル操作モード

SPEC ファイルは CREATE（新規）、APPEND（既存追記）、UPDATE（target_area 置換）の3モードで操作する。

| 状況 | モード | target_area | status 扱い |
|------|--------|-------------|-------------|
| 新規 SPEC（`target_spec.operation: create`） | CREATE | 使用しない | `draft` を付与 |
| 既存 SPEC へ追記（`operation: update`、target_area 未指定） | APPEND | 使用しない | 変更しない |
| 既存 SPEC セクション置換（`operation: update/spec-update`、target_area 指定） | UPDATE | 使用する | 変更しない |

`target_area` マッチング規則、複数マッチ時の挙動、未検出時の挙動の詳細は [references/target-area-matching.md](references/target-area-matching.md) 参照。

---

## SPEC ライフサイクル適用

SPEC frontmatter の `status`（`draft` / `accepted` / `superseded`）を本スキルの操作で次のように適用する。

- **CREATE**: frontmatter に `status: draft` を必ず付与する（G05）
- **APPEND / UPDATE**: 既存 SPEC の `status` を変更しない（G06）。`accepted` 昇格は case-close の責務
- ** superseded 遷移**: 後継 SPEC への移行確定時に元 SPEC へ `status: superseded` と `superseded_by` を設定する

詳細は [references/spec-lifecycle-application.md](references/spec-lifecycle-application.md) 参照。

---

## 配置先解決

各 SPEC action の `target`（または `target_spec: {operation, domain, slug}` 構造化）から配置先 SPEC を解決する:

- 既存 SPEC パス（例: `docs/specs/{domain}/<existing-spec>.md`）→ 当該 SPEC へ追記（`update` 操作）
- `target_spec: {operation: create, domain, slug}` → 新規 SPEC 作成。ファイル名は `docs/specs/{domain}/{slug}.md`
- 重複候補の統合: 同一 `target` の action は1つの SPEC へ集約する

新規 SPEC 作成時の frontmatter は `title`, `status: draft`, `created`, `updated` の4フィールドを付与する。

---

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、本スキルが規定する SPEC 固有処理を機械的に実行する（design-principles.md 第5節、AG-002/006）。
LLM 推論で実行していた決定的処理をスクリプトへ委譲することで、target_area マッチングのばらつきを確実に防止する。

配置先: 本スキル配下の `scripts/`（SPEC 固有）。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）。

共通検証 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `agentdev-artifact-validation` が所有し、本スキルは公開検証契約経由で委譲する。本スキル配下には SPEC 固有 script のみを配置する。

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
| `search-target-area.ts` | SPEC ファイル内 target_area 見出し検索 | argv[2]=target_area, argv[3..]=spec files、または stdin JSON | `{ ok, matches: [{file, line, text}] }` |

### 実行方法

```bash
# bun 経由で直接実行（REQ: LLM は bash 経由で呼び出し）
bun src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts "target_area文字列" docs/specs/{domain}/<existing-spec>.md

# stdin JSON 入力
echo '{"target_area":"パターン","files":["docs/specs/{domain}/<existing-spec>.md"]}' | bun src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts

# テスト実行
cd src/opencode/skills/agentdev-spec-file-manager/scripts && bun test
```

### spec-save からの呼び出し

spec-save は本スクリプト群を bash 経由で呼び出し、JSON 結果を parse して意味判断（複数マッチ時の warning、未検出時のスキップ判定等）を行う。
これにより target_area 見出し検索を LLM 推論ではなく機械的に実行する（design-principles.md 第5節「決定的処理の Script 委譲原則」）。

---

## 主要な不変条件

- 新規 SPEC 作成時の frontmatter 完全性（`title`, `status: draft`, `created`, `updated`）
- 既存 SPEC 追記時の `status` 変更がないこと（G06）
- target_area マッチング規則の適用結果（単一マッチ採用、複数マッチ時の warn、未検出時のスキップ + follow-up）
- SPEC 固有 script が単一の正規所有者（本スキル）に集約されていること
- 共通検証を重複実装せず `agentdev-artifact-validation` の公開検証契約へ委譲すること

---

## See Also

- **agentdev-req-file-manager**: REQ ファイル管理（REQ ↔ SPEC 整合性の境界）
- **agentdev-adr-file-manager**: ADR ファイル管理
- **agentdev-artifact-validation**: 共通検証 script の公開検証契約（委譲先）
- **agentdev-doc-diagnostics**: docs 横断診断
- **agentdev-doc-writing**: SPEC 横断の文書品質査読ゲート
- SPEC lifecycle と spec-save の導入（本体 ADR 参照）
- REQ/SPEC 責務分離、script 所有権（本体 REQ 参照）

## references 一覧

SKILL.md 本文から遅延読み込みされる詳細資料。各ファイルの冒頭に本文への文脈宣言を備える。

| ファイル | 内容 |
|----------|------|
| [references/target-area-matching.md](references/target-area-matching.md) | target_area マッチング規則、見出し階層解釈、複数マッチ時の挙動、未検出時の挙動、後方互換（target_area 未指定） |
| [references/spec-lifecycle-application.md](references/spec-lifecycle-application.md) | SPEC lifecycle（draft/accepted/superseded）適用、CREATE/APPEND/UPDATE ごとの status 扱い、SPEC 一覧表（`docs/specs/README.md` 相当）登録 |
