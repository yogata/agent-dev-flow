---
name: agentdev-artifact-validation
description: Owns document-type-crosscutting deterministic verification scripts (check-frontmatter-consistency, check-entry-existence, check-change-impact), their shared lib, and the public verification contract (REQ-0103-159/160, AG-003/009/019, RU-20260722-01). USE FOR: invoking the public verification contract for REQ/ADR frontmatter id↔filename consistency, README/DOC-MAP/mapping-table entry existence, or change-scope validation against an allowed path list. DO NOT USE FOR: REQ/ADR/SPEC content judgment, file editing, save, user approval, commit, push, REQ/ADR/row ID allocation, or target_area search.
---

# 文書種別横断検証（artifact-validation）

このスキルは複数文書種別で共有する決定的検証 script と共有 lib の**正規所有者**として機能する（AG-003、AG-009、AG-019、CR-002、RU-20260722-01 合意）。

- **このスキル（検証基盤）**: 3つの共通検証 script とそれらが利用する共有 lib、対応 test、公開検証契約、JSON 結果契約
- **適用先**: `req-save`、`spec-save`（共通検証 script 呼出 Step）、各 file-manager skill（委譲経由）、`agentdev-req-file-manager`（公開検証契約経由）

---

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-artifact-validation` SPEC](../../../../docs/specs/skills/agentdev-artifact-validation.md) である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う。

1. **前提とする固定知識の範囲**: `docs/` ディレクトリ構成（requirements/adr/specs）と公開検証契約（argv/stdin → stdout JSON）のみを前提とする
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先する
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行する

## 責務

本スキルは**決定的検証のみ**を所有する。検証対象の内容判断、文書の編集、保存、採番、ユーザー承認、commit、push は対象外（各 file-manager skill、各 command の責務）。

| 責務 | 本スキル | 対象外（他 skill/command の責務） |
|------|----------|----------------------------------|
| 共通検証 script の所有と運用 | ✓ | — |
| 公開検証契約の提供 | ✓ | — |
| 共有 lib と対応 test の所有 | ✓ | — |
| REQ/ADR/SPEC 内容判断 | — | `agentdev-req-file-manager`、`agentdev-adr-file-manager`、`agentdev-spec-file-manager` |
| REQ/ADR 番号、要件行 ID 採番 | — | `agentdev-req-file-manager`、`agentdev-adr-file-manager` |
| target_area 検索 | — | `agentdev-spec-file-manager` |
| 文書作成、更新、削除 | — | 各 file-manager skill |
| 保存、commit、push、承認 | — | 各 command |

---

## Scripts（決定的検証）

`scripts/` 配下の決定的スクリプトが、文書種別横断の検証処理を機械的に実行する（design-principles.md 第5節「Script は決定的でテスト可能な処理を担う」、REQ-0103-159/160、AG-003/009/019）。

配置先: `src/opencode/skills/agentdev-artifact-validation/scripts/`。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）。

### I/O 契約（共通）

| 項目 | 規約 |
|------|------|
| 入力 | argv（ファイル/ディレクトリパス）または stdin（JSON） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ |
| 副作用 | なし（純粋関数、ファイル I/O は入力読み込みのみ） |

### 公開検証契約（スクリプト一覧）

| スクリプト | 役割 | 入力 | 出力 JSON |
|-----------|------|------|-----------|
| `check-frontmatter-consistency.ts` | frontmatter id ↔ ファイル名整合性（REQ/ADR 横断） | argv[2]=dir, argv[3]=kind(req\|adr) | `{ ok, errors[], warnings[] }` |
| `check-entry-existence.ts` | README/DOC-MAP/mapping-table エントリ存在 | argv[2]=id, argv[3..]=files、または stdin JSON | `{ ok, errors[], warnings[], found[] }` |
| `check-change-impact.ts` | 変更範囲検証（許可パスリストとの積集合） | argv[2]=changed-list-file, argv[3]=allowed-list-file、または stdin JSON | `{ ok, errors[], warnings[], violations[] }` |

利用側 command、skill は内部 lib パスを直接参照せず、上記公開検証契約（script の argv/stdin → stdout JSON）へ委譲する（AG-009、AG-019）。同一 script または共有 lib を複数 skill へ複製しない（AG-003）。

### 実行方法

```bash
# bun 経由で直接実行（command は bash 経由で呼び出し）
bun .opencode/skills/agentdev-artifact-validation/scripts/src/check-frontmatter-consistency.ts docs/requirements req

# stdin JSON 入力
echo '{"id":"REQ-0103","files":["docs/requirements/README.md"]}' | bun .opencode/skills/agentdev-artifact-validation/scripts/src/check-entry-existence.ts

# テスト実行
cd .opencode/skills/agentdev-artifact-validation/scripts && bun test
```

### req-save / spec-save からの呼び出し

`req-save` と `spec-save` は本スキルの公開検証契約を bash 経由で呼び出し、JSON 結果を parse して意味判断（NG 時の対応等）を行う。これにより frontmatter id↔ファイル名整合性確認、エントリ存在確認、変更範囲検証を LLM 推論ではなく機械的に実行する（design-principles.md 第5節「決定的処理の Script 委譲原則」）。

REQ/ADR 番号採番、要件行 ID 採番、target_area 検索は本スキルの対象外（それぞれ `agentdev-req-file-manager`、`agentdev-adr-file-manager`、`agentdev-spec-file-manager` の責務）。

---

## 主要な不変条件

- 全 script は同じ入力に対して同じ結果を返す（決定性）
- 全 script はファイル I/O を入力読み込みのみに限定し、書き込みやネットワーク通信を行わない（副作用なし）
- 公開検証契約（操作名、入力、JSON 結果契約、エラー契約）は安定。後方互換性を保持して変更する
- 共有 lib は本スキル内でのみ所有し、兄弟 skill からの直接 import を受け付けない（AG-009）

## 必要な reference の選択条件

現状、SKILL.md 本文と SPEC で完結するため `references/` 配下に追加資料を置かない。SPEC への参照のみを正とする。將来的に検証契約の詳細（拡張入力形式、追加 kind、エラー分類）が必要になった場合は `references/` 配下へ分離する（REQ-0113-010）。

---

## See Also

- **agentdev-req-file-manager**: REQ ファイル管理、REQ 番号/要件行 ID 採番（REQ 固有 script 所有）
- **agentdev-adr-file-manager**: ADR ファイル管理、ADR 番号採番（ADR 固有 script 所有）
- **agentdev-spec-file-manager**: SPEC ファイル管理、target_area 検索（SPEC 固有 script 所有）
- **req-save** / **spec-save**: 共通検証 script 呼出 Step を持つ command
