---
name: agentdev-artifact-validation
description: Owns document-type-crosscutting deterministic verification scripts, their shared lib, and the public verification contract. USE FOR: invoking the verification contract for REQ/Decision frontmatter id↔filename consistency, README entry existence, or change-scope validation against an allowed path list. DO NOT USE FOR: REQ/Decision/Design content judgment, file editing, save, user approval, commit, push, or ID allocation.
---

# 文書種別横断検証（artifact-validation）

このスキルは複数文書種別で共有する決定的検証 script と共有 lib の**正規所有者**として機能する（AG-{NNN}、AG-{NNN}、AG-{NNN}、CR-{NNN}、RU-{NNNN}-01 合意）。

- **このスキル（検証基盤）**: 3つの共通検証 script とそれらが利用する共有 lib、対応 test、公開検証契約、JSON 結果契約
- **適用先**: Definition 保存内部責務、Design 保存内部責務（共通検証 script 呼出 Step）、各 file-manager skill（委譲経由）

---

## 責務

本スキルは**決定的検証のみ**を所有する。
検証対象の内容判断、文書の編集、採番は対象外（各 file-manager skill の責務）。ユーザー承認、commit、push は対象外（上流工程の責務）。

| 責務 | 本スキル | 対象外（他 skill/command の責務） |
|------|----------|----------------------------------|
| 共通検証 script の所有と運用 | ✓ | - |
| 公開検証契約の提供 | ✓ | - |
| 共有 lib と対応 test の所有 | ✓ | - |
| REQ/Decision/Design 内容判断 | - | `agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-design-file-manager` |
| REQ/Decision 番号、要件行 ID 採番 | - | `agentdev-req-file-manager`、`agentdev-decision-file-manager` |
| target_area 検索 | - | `agentdev-design-file-manager` |
| 文書作成、更新、削除 | - | 各 file-manager skill |
| 保存、commit、push、承認 | - | 各 command |

---

## Scripts（決定的検証）

`scripts/` 配下の決定的スクリプトが、文書種別横断の検証処理を機械的に実行する（design-principles.md 第5節「Script は決定的でテスト可能な処理を担う」、AG-{NNN}/{NNN}/{NNN}）。

配置先: `agentdev-artifact-validation skill`。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）である。

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
| `check-frontmatter-consistency.ts` | frontmatter id ↔ ファイル名整合性（REQ/Decision 横断） | argv[2]=dir, argv[3]=kind(req\|decision、adr はレガシー互換) | `{ ok, errors[], warnings[] }` |
| `check-entry-existence.ts` | README エントリ存在 | argv[2]=id, argv[3..]=files、または stdin JSON | `{ ok, errors[], warnings[], found[] }` |
| `check-change-impact.ts` | 変更範囲検証（許可パスリストとの積集合） | argv[2]=changed-list-file, argv[3]=allowed-list-file、または stdin JSON | `{ ok, errors[], warnings[], violations[] }` |
| `check-req-row-existence.ts` | 書込み時引用識別子実在検証（第4共通検証）。REQ/Decision/Design の本文・表中に引用する要件行 ID（桁数を固定しない許容書式）が docs/requirements の要件行テーブルに実在することを、同一変更で作成される参照先を含む適用後状態で検査する | argv: `--root <repo-root> --file <repo-relative-path> [--file ...] [--id-pattern <regex>]`、または stdin JSON `{ root, files: [{ path, content? }], idPattern? }`（content ありは未ディスクの適用後本文） | `{ ok, errors[], warnings[], checkedFiles, missing: [{id, file, line}] }` |

利用側 command、skill は内部 lib パスを直接参照せず、上記公開検証契約（script の argv/stdin → stdout JSON）へ委譲する（AG-{NNN}、AG-{NNN}）。
同一 script または共有 lib を複数 skill へ複製しない（AG-{NNN}）。

### 実行方法

```bash
# bun 経由で直接実行（command は bash 経由で呼び出し）
bun .opencode/skills/agentdev-artifact-validation/scripts/src/check-frontmatter-consistency.ts docs/requirements req

# stdin JSON 入力
echo '{"id":"REQ-{NNNN}","files":["docs/requirements<README>.md"]}' | bun .opencode/skills/agentdev-artifact-validation/scripts/src/check-entry-existence.ts

# テスト実行
cd .opencode/skills/agentdev-artifact-validation/scripts && bun test
```

### 保存内部責務からの呼び出し

Definition 保存内部責務と Design 保存内部責務は本スキルの公開検証契約を bash 経由で呼び出し、JSON 結果を解析して意味判断（NG 時の対応等）を行う。
これにより frontmatter id↔ファイル名整合性確認、エントリ存在確認、変更範囲検証を LLM 推論ではなく機械的に実行する（design-principles.md 第5節「決定的処理の Script 委譲原則」）。

`check-req-row-existence.ts`（書込み時引用識別子実在検証）は、REQ、Decision、Design の初回作成・増分更新の保存経路（req-file-manager、design-file-manager、decision-file-manager、phase-artifacts-update 経由の保存）で、書込み直前の適用後本文に対して実行する。

- 検証対象は書込み本文であり、`files` には書込み対象の適用後本文を渡す。同じ変更で REQ の要件行テーブルを作成・更新する場合は、その REQ ファイルの適用後本文を `files` に併せて渡す（検査は同じ変更で作成される参照先を含む適用後状態で評価され、参照先の保存順序だけを理由に不合格にならない）
- `content` を省略したエントリは root 配下のディスク上の現行本文で評価する（既にディスクへ適用済みの状態での検証に使う）
- 免除規則（code span、code block、AUTOGEN ブロック、テンプレート領域、整合性ルール説明文、履歴領域、v2: 歴史識別子プレフィックス、プレースホルダー様式例示）は script 側で適用される。既定の検出対象は数値セグメントが最小1桁の REQ 行IDであり、桁数上限を設けない。プロジェクトの採番に従って `idPattern` で上書きできる
- `ok: false` の場合は保存を完了扱いにせず、`missing` の内容（実在しない要件行 ID と箇所）を修正対象として報告する。検証の実行結果は保存操作の報告に含める

REQ/Decision 番号採番、要件行 ID 採番、target_area 検索は本スキルの対象外（それぞれ `agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-design-file-manager` の責務）。

---

## 主要な不変条件

- 全 script は同じ入力に対して同じ結果を返す（決定性）
- 全 script はファイル I/O を入力読み込みのみに限定し、書き込みやネットワーク通信を行わない（副作用なし）
- 公開検証契約（操作名、入力、JSON 結果契約、エラー契約）は安定。後方互換性を保持して変更する
- 共有 lib は本スキル内でのみ所有し、兄弟 skill からの直接 import を受け付けない（AG-{NNN}）

## 必要な reference の選択条件

現状、SKILL.md 本文と Design で完結するため `references/` 配下に追加資料を置かない。
正規原本は Design である。
将来的に検証契約の詳細（拡張入力形式、追加 kind、エラー分類）が必要になった場合は `references/` 配下へ分離する。

---

## See Also

- **agentdev-req-file-manager**: REQ ファイル管理、REQ 番号/要件行 ID 採番（REQ 固有 script 所有）
- **agentdev-decision-file-manager**: Decision ファイル管理、Decision 番号採番（Decision 固有 script 所有）
- **agentdev-design-file-manager**: Design ファイル管理、target_area 検索（Design 固有 script 所有）
