---
title: artifact_actions 生成とフィールド形式
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# artifact_actions 生成とフィールド形式

## artifact_actions 生成

req-define は新規 REQ CREATE の要件doc生成において、当該要件行の検証対応を任意とする場合に traceability/policy.yaml への登録判断を要件展開に含める。登録が必要な場合は当該登録を Definition 保存の作業項目として case-open へ引き継ぎ (REQ-021-028: 同一 Definition 変更として扱う)、不要な場合はその根拠を draft に記録する。

req-define は `artifact_actions` の producer である。
要件doc生成の artifact_actions 生成で要件展開の結果を `draft-data` の `artifact_actions` へ出力する。
本節は req-define 側の生成契約（operation の選択基準、`append` の生成、誤記との機械的区別）を規定する。
各 operation の `target_area` と `content` の出力形式は後段「[draft-data artifact_actions フィールド形式](#draft-data-artifact_actions-フィールド形式)」を参照。

### operation の選択基準

req-define は変更の性質に応じて Design operation を選択する。
Design operation の公式 enum（`create` / `append` / `update` の3値）は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「artifact_actions operation」が正規所有する。

| 変更の性質 | operation | 意図 |
|---|---|---|
| 新規 Design ファイル作成 | `create` | Design ファイルを新規作成する |
| 既存 Design ファイルへの新規セクション追加 | `append` | 既存 Design ファイルへ新規セクションを追加する |
| 既存 Design ファイルの既存セクション置換 | `update` | 既存セクション全体を新しい内容で置換する |

### append の生成契約

req-define は既存 Design ファイルへ新規セクションを追加する場合、`operation: append` として action を出力する。
入力フィールドは以下の通り。

| field | 必須性 | 形式 |
|---|---|---|
| `target` | 必須 | 既存 Design ファイルパス |
| `target_area` | 必須 | 追加する新規セクションの見出し（Markdown 見出し行形式。例: `### IR-044`） |
| `content` | 必須 | 追加する新規セクション全文（見出し行から始まる） |
| `placement` | 任意（省略時 `tail`） | `tail` / `after_anchor` / `before_anchor` のいずれか |
| `anchor` | `placement` が `tail` 以外は必須 | 挿入位置の基準となる見出し行（`target_area` と同一形式） |

`placement` 別の追加位置、`anchor` マッチング規則、anchor 未検出時の挙動、同名見出し時の挙動、合格基準は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「append operation」および [agentdev-design-file-manager.md](../skills/agentdev-design-file-manager.md)「APPEND 操作」節が正規所有する。
req-define 側は入力フィールドの選択と値の生成のみを規定し、配置実行の詳細は規定しない。

### 新規セクション追加と target_area 誤記の機械的区別

`append` を用いることで、意図的な新規セクション追加と `target_area` の誤字・古い見出し名・参照先間違いを機械的に区別できる。

- `update`: 既存セクションを置換する意図。`target_area` に一致する見出しが存在しない場合、consumer（Design 保存内部責務）は未検出として follow-up 報告を行う。`target_area` の誤字、古い見出し名、参照先間違いはこの経路で検出される
- `append`: 新規セクションを追加する意図。`target_area` は追加する新規セクションの見出しを示し、既存見出しとの一致を前提としない。配置位置は `placement` と `anchor` で指示する

両者を operation で明示することで、consumer 側は `target_area` が既存見出しと一致しない事象を「置換対象の誤記」と「新規セクション追加の意図」で区別して処理できる。

### 旧別名の不受理

Design operation の旧別名（`spec-create` / `spec-update` / `spec-append`）は出力も受理もしない（REQ-008-058）。
`target_area`、`placement`、`anchor` 等のフィールドを持たない旧形式 draft は consumer は入力として拒否しない。
操作契約の正規定義は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「Design operation enum」を参照。

### finding 由来 draft の target_design 実パス実在確認

finding 由来の draft で design 操作を artifact_actions へ転記する前に、target_design.domain / slug の
宣言と実配置（docs/designs/{domain}/ 配下の実ファイル）の一致を実パス実在確認（grep による本文一意性
確認を含む）で検証する。宣言と実配置が不一致の場合は、slug・該当行番号・文言の3点一致による機械的照合で
実配置を正と判定し、不在パスを正として採用しない（配置移動済み文書を旧配置の domain で参照する finding の
機械的転記による誤パス更新の防止）。

## draft-data artifact_actions フィールド形式

artifact_actions の各 entry が出力する `target_area` と `content` の扱いは operation 別に以下を規定する（REQ-004-033、REQ-008-058）。

Design operation の公式 enum は `create` / `append` / `update` の3値である（別名は持たない）。

| operation | target_area | content |
|-----------|-------------|---------|
| create | 任意（省略時は Design 保存内部責務が既存セクション構造から追加位置を判断） | 新規セクション本文 |
| append | 必須（anchor 見出し、Markdown 見出し行形式。例: `### IR-044`）。anchor 末尾への追加を示す `placement: tail`（既定）、anchor 直後を示す `placement: after_anchor`、anchor 直前を示す `placement: before_anchor` を action へ併せて出力できる（省略時は `tail`） | 追記する新規セクション本文（見出し行を含む） |
| update | 必須（対象セクション見出し、Markdown 見出し行形式。例: `### IR-044`） | 変更後セクション全文（対象セクションの見出し行から次の同レベル見出しの直前までの全内容） |

req-define 側は出力形式のみを規定する。
`target_area` の形式（Markdown 見出し行）、見出し階層の解釈規則、複数マッチ、未検出時の挙動、`append` の placement 別挙動は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「append operation」と [agentdev-design-file-manager.md](../skills/agentdev-design-file-manager.md)「APPEND 操作」節側に配置する。
