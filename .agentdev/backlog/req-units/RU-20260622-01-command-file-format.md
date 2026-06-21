---
source_type: chat
generated_by: session
generated_at: 2026-06-22T08:39:17+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-22-command-file-format
---

# command ファイルフォーマット標準化

## 背景

AgentDevFlow が管理する command 定義ファイルの Markdown 構成がコマンドごとにばらついている。

特に `## 手順` 配下の記述形式に差があり、`backlog-review` の `### Step N: タイトル` 形式へ寄せる方針が合意された。

ただし、現行 `backlog-review` 自体にも `Step 0` 始まりが存在するため、標準化後の基準では `Step 1` 始まりへ修正する。

## 問題

command ファイル間で以下の形式が混在している。

- `### Step N: タイトル`
- numbered list による主手順
- `Step 0` 始まり
- `0-1` などゼロ起点のサブステップ
- `## 手順` 配下でのフェーズ見出し混在
- ガードレール番号形式のばらつき
- 個別 command SPEC と横断フォーマット規約の配置候補混在

この状態では、command 定義の読み取り、レビュー、整合性検査、後続修正の基準が不明確になる。

## Source Summary

チャット上で以下が合意された。

- command ファイルの `## 手順` は `backlog-review` の `### Step N: タイトル` 形式を基準にする。
- Step 番号は必ず `1` から始める。
- `Step 0` は禁止する。
- サブステップは `Step N-M` 形式に統一する。
- ゼロ起点サブステップは禁止する。
- 横断的な command フォーマット規約は `docs/specs/commands/` 配下に置かない。
- `docs/specs/commands/` は個別 command SPEC と対応づける位置づけを維持する。
- command 専用の横断フォーマット規約は `docs/specs/command-file-format.md` に置く。
- `docs/specs/patterns.md` へ吸収する案は採用しない。
- 機械的に判定可能な command format 違反は `/repo/docs-check` で検出する。
- command file format の適用対象は AgentDevFlow が管理する command 定義に限定する。
- AgentDevFlow 適用プロジェクトの独自 command には強制しない。

## 統合理由

本件は、個別 command の処理仕様変更ではなく、AgentDevFlow が管理する command 定義ファイル全体に適用する横断フォーマット規約である。

そのため、個別 command ごとに分散して修正する前に、共通フォーマットの原則、禁止形式、検査観点を基盤 SPEC として定義する必要がある。

また、フォーマット違反の多くは機械的に判定できるため、レビュー依存ではなく `/repo/docs-check` で継続検査できる状態にする。

## 要件化の方向

REQ では細かい Markdown 書式を列挙しない。

REQ には、AgentDevFlow が管理する command 定義が基盤 SPEC で定義された command file format に従うことを要求する粒度で記述する。

詳細な見出し順、Step 表記、サブステップ表記、ガードレール番号、禁止形式、検査観点は `docs/specs/command-file-format.md` に定義する。

機械判定できる違反は `/repo/docs-check` の検査対象にする。

## 適用範囲

本 RU の command file format は、AgentDevFlow が管理する command 定義ファイルに適用する。

対象は以下とする。

- `src/opencode/commands/agentdev/*.md`
- `src/opencode/commands/repo/*.md`

AgentDevFlow 導入プロジェクトでは、AgentDevFlow 提供 command または AgentDevFlow 生成 command のみに適用する。

プロジェクトローカル command には強制しない。

## 主対象REQまたは変更対象候補

主対象REQまたは変更対象候補は不明。

既存 REQ のうち、command 定義、配布物、文書責務境界、SPEC 配置、repo-local 検査に関わる REQ が候補になるが、今回のチャットでは特定の REQ 番号までは合意していない。

変更対象候補は以下。

- `docs/specs/command-file-format.md`
  - 新規作成候補
- `docs/specs/README.md`
  - `docs/specs/command-file-format.md` の位置づけ追記候補
- `src/opencode/commands/agentdev/*.md`
  - command file format への整合対象
- `src/opencode/commands/repo/*.md`
  - command file format への整合対象
- `/repo/docs-check`
  - command file format の機械検査追加候補
- `docs/specs/commands/*.md`
  - 個別 command SPEC としての位置づけ維持

## 対象外

以下は本 RU の対象外とする。

- 各 command の処理内容変更
- コマンドの実装計画
- command の責務再設計
- 個別 command SPEC の内容再設計
- `docs/specs/commands/` のディレクトリ構成変更
- `docs/specs/patterns.md` への統合
- consumer プロジェクトの独自 command への強制適用
- 非 AgentDevFlow OpenCode プロジェクトへの適用
- `/repo/docs-check` の実装詳細
- 未確認の既存 REQ 番号への紐づけ
- 未合意の表記改善

## 受け入れ条件

- `docs/specs/command-file-format.md` として、command ファイル横断のフォーマット規約が定義されている。
- `docs/specs/commands/` は個別 command SPEC と対応づく位置づけを維持している。
- command file format の適用対象が AgentDevFlow 管理 command に限定されている。
- 対象範囲に `src/opencode/commands/agentdev/*.md` が含まれている。
- 対象範囲に `src/opencode/commands/repo/*.md` が含まれている。
- consumer プロジェクトの独自 command が強制対象外であることが明記されている。
- command file format では、`## 手順` 配下の Step 見出し形式が `### Step N: タイトル` として定義されている。
- Step 番号は `1` から開始することが定義されている。
- `Step 0` が禁止形式として定義されている。
- サブステップは `Step N-M` 形式として定義されている。
- ゼロ起点のサブステップが禁止形式として定義されている。
- numbered list による主手順表現を使わないことが定義されている。
- `## 手順` 配下で別軸のフェーズ見出しを混在させないことが定義されている。
- ガードレール番号は `G01` 形式で統一されている。
- command file format の機械的に判定可能な違反は、`/repo/docs-check` で検出できる。
- `/repo/docs-check` の command format 検査対象が `src/opencode/commands/agentdev/*.md` および `src/opencode/commands/repo/*.md` に限定されている。
- `/repo/docs-check` は `Step 0`、非連番 Step、ゼロ起点サブステップ、numbered list 主手順、`G01` 形式以外のガードレール番号を検出する。
- REQ には詳細な Markdown 書式ではなく、基盤 SPEC の command file format に従うことが要件化されている。
- 未合意の既存 REQ 番号が RU 本文に混入していない。
