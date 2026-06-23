---
source_type: chat
generated_by: session
generated_at: 2026-06-23T18:34:17+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-23-overridable-gh-cli-procedure
  - type: chat
    path: session:2026-06-23-local-gh-cli-link-mode
---

# agentdev-gh-cli手続き委譲とlink mode統一によるローカル版差し替え

## 背景

AgentDevFlow の既存 command / skill には、GitHub Issue / PR に対する `gh` 操作が直接記述されている。

一方で、ローカル版では GitHub Issue / PR を使わず、Case を `.agentdev/cases/case-{NNNN}.md` のローカルファイルとして扱う方針がある。

当初は、ローカル版 command / skill 全体を生成先 `.opencode/commands/` および `.opencode/skills/` に直接生成する方式が前提だった。しかし、本セッションでは、GitHub Issue / PR 相当の I/O を `agentdev-gh-cli` に集約し、ローカル版では `agentdev-gh-cli` のリンク先だけを local 版に差し替える方針へ見直した。

この見直しにより、通常版とローカル版で command / skill 全体を分岐させず、同じ command / skill 群を使いながら、永続 I/O の実装だけを差し替える構成にする。

## 問題

既存 command / skill が `gh issue create`、`gh issue view`、`gh issue edit`、`gh issue comment`、`gh pr view`、`gh pr merge`、`gh issue close` などを直接記述している場合、以下の問題が発生する。

1. GitHub CLI の具体的なフラグ、本文ファイル指定、一時ファイル、エンコーディング対策、再読込 VERIFY の責務が各 command / skill に混在する。
2. ローカル版で GitHub Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替えられない。
3. PR が存在しないローカル版で、PR本文、PR状態、merge結果、capture 入力源の扱いが command 側に漏れる。
4. GitHub版とローカル版の差分が command / skill 全体に拡散する。
5. ローカル版全体生成方式では、`transform/`、`generation-flow.md`、`case-schema/` など、`agentdev-gh-cli` 差し替え方式では不要または過剰な構成が残る。
6. 通常版が link / junction 運用で扱える一方、ローカル版だけを直接生成方式にすると、導入・更新方式が二系統化する。

## Source Summary

本セッションで合意した内容は以下である。

- `agentdev-gh-cli` は GitHub操作の既定実装として残す。
- 各 command / skill は `gh` コマンドを直接書かず、`agentdev-gh-cli` の手続きへ委譲する。
- ローカル版では `agentdev-gh-cli` を上書きし、同じ手続き名を `.agentdev/cases/case-{NNNN}.md` の読み書きへ読み替える。
- これは GitHub非依存の抽象 backend 新設ではなく、GitHub前提の `gh-cli` 手続き化と上書き可能化である。
- PR がないローカル版では、PR関連操作を単純にスキップしない。
- PR本文、PR作成済み状態、merge結果に相当する情報は、ローカルCaseファイル内の対応セクションへ読み替える。
- `agentdev-gh-cli` は I/O 手続きと VERIFY を担当し、本文生成、完了判定、Epic 依存判定、capture 分類は担当しない。
- `agentdev-gh-cli` は薄いルーティング入口とし、操作契約と標準版手順を references に分離する。
- `local-override-mapping.md` は作成しない。
- local 版は専用の `agentdev-gh-cli` を用意し、リンクまたは配置により `.opencode/skills/agentdev-gh-cli/` として扱う。
- local 版 `agentdev-gh-cli` は別名スキルとして参照させず、上位 command / skill は常に `agentdev-gh-cli` のみを参照する。
- 通常版とローカル版の両方を link mode に寄せる。
- 通常版では `.opencode/` 配下を `src/opencode/` に接続する。
- ローカル版では `agentdev-gh-cli` 以外を `src/opencode/` に接続し、`agentdev-gh-cli` だけ `src/opencode-local/agentdev-gh-cli/` に接続する。
- `src/opencode-local/agentdev-gh-cli/` は local 版 `agentdev-gh-cli` の原本とする。
- `runtime-overrides/` は設けない。
- `src/opencode-local/skills/` は作成しない。
- `case-schema/` は local 版 `agentdev-gh-cli` の一部に吸収する。
- `transform/` と `generation-flow.md` は、ローカル版全体生成をやめるなら廃止候補とする。
- ローカル版の主価値は、ローカル対応だけでなく、本体側の GitHub I/O 責務分離を進める点にもある。

## 統合理由

この RU は、ローカル版対応だけを目的とするものではない。

GitHub Issue / PR I/O を `agentdev-gh-cli` に集約することで、既存 GitHub版でも以下の保守性改善が得られる。

- GitHub CLI の実行手順を一箇所に集約できる。
- Windows / PowerShell / 文字化け / 一時ファイル / `--body-file` / VERIFY の扱いを各 command から排除できる。
- command は workflow の順序、停止条件、完了判定に集中できる。
- domain skill は本文生成、完了条件評価、Epic表解析、capture分類などの意味処理に集中できる。
- ローカル版は command を大きく分岐せず、`agentdev-gh-cli` の差し替えで対応できる。
- 通常版とローカル版の導入方式を link mode に統一できる。
- ローカル版全体生成に必要だった `transform/`、`generation-flow.md`、独立 `case-schema/` を縮小または廃止できる。

そのため、本件は単なるローカル版生成方式の変更ではなく、AgentDevFlow 本体の GitHub I/O 責務境界を整理する要件として扱う。

## 要件化の方向

GitHub操作を直接記述している command / skill を修正し、GitHub操作を `agentdev-gh-cli` の手続きへ委譲する。

標準版の `agentdev-gh-cli` は、既定実装として `gh` コマンドを実行する。

ローカル版の `agentdev-gh-cli` は、標準版と同一の手続き名を提供し、Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替える。

各 command / skill は GitHub版・ローカル版の分岐を直接持たず、`agentdev-gh-cli` の手続き結果を扱う。

通常版とローカル版は、`.opencode/` 配下を仕様管理リポジトリへ接続する link mode を利用する。

通常版では、`.opencode/commands/agentdev/` および `.opencode/skills/agentdev-*/` を `src/opencode/` 配下へ接続する。

ローカル版では、`agentdev-gh-cli` 以外の command / skill を `src/opencode/` 配下へ接続し、`.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する。

`src/opencode-local/agentdev-gh-cli/` は、local 版 `agentdev-gh-cli` の原本として扱う。

local 版 `agentdev-gh-cli` は、Case ファイルの作成、読込、更新、完了更新、PR相当情報の読込、merge相当結果の記録、capture入力源の読込、書込後 VERIFY を担当する。

Case ファイル仕様の正本は docs/specs に置く。local 版 `agentdev-gh-cli` 配下の case schema は、正本ではなく、local 版 `agentdev-gh-cli` が読み書き時に参照する操作用定義とする。

## 主対象REQまたは変更対象候補

主対象REQまたは変更対象候補は以下。

- case-open に関する既存REQ
- case-run に関する既存REQ
- case-close に関する既存REQ
- ローカル版 Case ファイル運用に関する既存REQ
- REQ-0141
- local-generation SPEC
- local-transform SPEC
- local-case-file SPEC
- `agentdev-gh-cli` の責務を定義する SPEC / skill
- GitHub Issue / PR 操作を直接記述している command / skill
- `src/opencode-local/README.md`
- `src/opencode-local/agentdev-gh-cli/`

具体的な REQ 番号、SPEC 名、対象ファイルの確定は後続の `req-define` で行う。

## 見直し対象候補

以下は見直し対象候補とする。

- `src/opencode-local/case-schema/`
  - local 版 `agentdev-gh-cli` 配下の操作用 schema へ吸収する。
- `src/opencode-local/transform/`
  - ローカル版全体生成を廃止する場合、廃止候補とする。
- `src/opencode-local/generation-flow.md`
  - 生成フローではなく link 構成へ寄せる場合、廃止候補とする。
- `generated_by: local-opencode-transform`
  - 直接生成方式の上書き管理であり、link mode では主制御にしない。
- `.opencode/` が `src/opencode/` 配下へ解決される場合の一律停止
  - 意図した link target であれば許可し、不正な link target であれば停止する方式へ見直す。
- `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す更新方式
  - link mode では unlink / relink による更新へ見直す。

## 対象外

以下はこの RU の対象外とする。

- GitHub非依存の新規 backend 抽象層の設計
- GitHub互換ローカルサーバの導入
- GitHub版 command とローカル版 command の丸ごと分岐
- `agentdev-local-issue` などの別名スキルを上位 command / skill から参照させる方式
- Issue本文生成ルールの変更
- 完了条件の達成判定ルールの変更
- Epic Wave の依存判定ルールの変更
- capture の採否判断ルールの変更
- req / spec / adr の整合判断ルールの変更
- Case ファイル仕様の正本を `agentdev-gh-cli` 配下へ移すこと
- 実装手順、コード差分、ファイル単位の修正計画
- 未確認の command / skill 一覧の確定
- ADF利用プロジェクト側の symlink / junction 運用事故の完全防止
- 複数利用者による同時実行時の排他制御

## 受け入れ条件

- GitHub Issue / PR 操作を行う command / skill は、`gh` コマンドを直接記述せず、`agentdev-gh-cli` の手続きへ委譲している。
- `agentdev-gh-cli` は、Issue作成、Issue本文読込、Issue本文更新、Issueコメント追加、PR本文読込、PR merge、Issue close、VERIFY に相当する手続きを提供している。
- 標準版の `agentdev-gh-cli` は、各手続きの既定実装として `gh` コマンドを実行する。
- ローカル版の `agentdev-gh-cli` は、標準版と同一の手続き名を提供し、Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替えられる。
- ローカル版では、PR関連手続きを単純にスキップせず、PR本文、PR作成済み状態、merge結果に相当する情報を Case ファイル上の対応セクションから読み書きできる。
- command は workflow 順序、停止条件、完了判定を担当し、GitHub CLI の具体的なフラグ、一時ファイル、エンコーディング対策、再読込 VERIFY を直接記述しない。
- domain skill は本文生成、完了条件評価、Epic表解析、capture分類などの意味処理を担当し、GitHub CLI の具体操作を直接記述しない。
- `agentdev-gh-cli` は I/O 手続きと VERIFY を担当し、本文生成、完了判定、Epic 依存判定、capture 分類を担当しない。
- GitHub版の既存 workflow は、`agentdev-gh-cli` 委譲後も従来と同等の Issue / PR 操作結果を維持する。
- 通常版では、`.opencode/commands/agentdev/` および `.opencode/skills/agentdev-*/` を `src/opencode/` 配下へ接続できる。
- ローカル版では、`.opencode/skills/agentdev-gh-cli/` の接続先を `src/opencode-local/agentdev-gh-cli/` にできる。
- ローカル版では、`agentdev-gh-cli` 以外の AgentDevFlow command / skill は `src/opencode/` 配下を接続先とする。
- `src/opencode-local/agentdev-gh-cli/SKILL.md` の frontmatter name は `agentdev-gh-cli` である。
- `src/opencode-local/skills/` は作成しない。
- `runtime-overrides/` は作成しない。
- `src/opencode-local/case-schema/` の内容は、local 版 `agentdev-gh-cli` 配下の操作用定義へ吸収される。
- Case ファイル仕様の正本は docs/specs に残る。
- `transform/` および `generation-flow.md` は、ローカル版全体生成を廃止する場合の廃止候補として整理される。
- `.opencode/` 実パス確認は、link mode を一律停止するのではなく、意図した link target かどうかを確認する方式へ見直される。
- 既存 REQ-0141 の直接生成、変換プロンプト、`generated_by` 上書き制御、全削除再生成に関する要件は、link mode 前提に合わせて再構成される。
