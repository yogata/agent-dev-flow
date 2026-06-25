---
source_type: chat
generated_by: session
generated_at: "2026-06-25T23:59:00+09:00"
status: draft
sources:
  - type: chat
    path: session:2026-06-25-maximal-parallel-execution
---

# 最大並列実行を阻害しない execution_unit / Wave 実行モデルへの整理

## 背景

AgentDevFlow の `req-define` → `case-auto` → `case-open` → `case-run` → `case-close` の一連の構造的実行フェーズでは、複数の RU / OU / Issue / Epic / Wave を扱う。

現行整理では、`case-run` は Epic Wave 内の ready 子Issueを最大5件まで並列実行する方向に寄っている。一方で、`req-define` の `depends_on` の意味、`case-open` の OU 複数時の扱い、`case-auto` の execution_unit 群 orchestration、`case-close` の Epic Wave クローズ処理には、最大並列実行を阻害し得る直列化要因が残っている。

今回の合意では、ファイル行単位のマージコンフリクトは基本的に稀であり、過大に恐れて事前直列化するよりも、積極的に並列実行する方針を採る。

## 問題

現状の問題は、実行上の必須依存ではない要素まで直列化要因として扱われ得ることである。

具体的には、以下が問題となる。

1. `req-define` の `depends_on` に、必須依存以外の弱依存、関連依存、推奨順、ファイル衝突懸念が混入すると、後続工程で不要な直列化が発生する。
2. `case-open` に、OU が複数ある場合に停止する、または独立OU複数だけを特別扱いして自動Epic化する古い制御が残ると、複数 Standard / 複数 Epic / 混在 execution_unit を自律生成できない。
3. `case-auto` に、独立OU最大5件、または1 OUを完了してから次OUへ進む逐次処理の記述が残ると、必須依存のない execution_unit 群を最大限並列実行できない。
4. `case-close` の Epic Wave クローズ処理が子Issue単位で全体直列になっていると、`case-run` で並列実行してもマージ・クローズ段階で詰まる。
5. ファイル衝突可能性を実行前の直列化理由にすると、実際には発生頻度の低い行単位コンフリクトを過大評価し、並列性を不必要に落とす。

## Source Summary

この RU は、チャット内で合意した以下の内容に基づく。

- 最大限並列実行するため、依存が真に必須でない限り直列化しない。
- `depends_on` は必須依存専用とし、弱依存、関連依存、推奨順、ファイル衝突可能性は含めない。
- `case-open` は OU 複数時に停止せず、必須依存グラフの連結成分から execution_unit 群を生成する。
- `case-auto` は case-open が生成した execution_unit 群を対象に、必須依存のないものを並列実行する。
- `case-auto` レベルではグローバル並列上限を持たず、`case-run` の Wave 内最大5件制限のみを維持する。
- `case-run` は現在の設計どおり、Epic Wave 内 ready 子Issue最大5件並列を維持する。
- `case-close` は Epic Wave クローズ時、PR/Issue読取・事前検証・capture抽出などの前処理を並列化し、実マージ、main同期、Epic本文更新、`.agentdev` 永続化のみ直列集約する。
- コンフリクトは稀なものとして扱い、発生時に rebase / 再委譲 / 隔離で処理する。ファイル衝突可能性だけを理由に事前直列化しない。

## 統合理由

本件は `req-define`、`case-open`、`case-auto`、`case-run`、`case-close` にまたがるが、中心にある要件は一つである。

「必須依存のみを直列化要因とし、それ以外は execution_unit / Wave 単位で最大限並列実行する」

そのため、個別コマンドごとの断片的な要件ではなく、横断的な並列実行方針として一つの RU に統合する。

ただし、実装修正時は各 command / SPEC の責務境界に従い、`case-auto` に Issue階層決定ロジックを持たせず、Issue階層は `case-open`、Wave内実行は `case-run`、Wave境界のクローズは `case-close` が担う。

## 要件化の方向

### 1. `depends_on` の意味を必須依存に限定する

`req-define` が出力する `operation_units[].depends_on` は、必須依存のみを表す必要がある。

必須依存とは、一方の OU / Issue / execution_unit が他方なしでは成立しない関係を指す。例として、インターフェース契約、データモデル、schema、公開API、検証不能な前提成果物が該当する。

以下は `depends_on` に含めない。

- 同一ファイルを変更する可能性
- 同一 SPEC セクションを変更する可能性
- 同一機能領域であること
- 推奨実行順
- レビューしやすい順番
- クリティカルパス上の優先度
- 弱依存
- 関連依存

推奨順は `recommended_order` に留め、並列可否には影響させない。

### 2. `case-open` は連結成分ベースで execution_unit を生成する

`case-open` は OU が複数あること自体を停止理由にしない。

`case-open` は `operation_units` の必須依存グラフから連結成分を作成し、各連結成分を execution_unit 候補として扱う。

- 単独根の連結成分は Standard Issue 候補とする。
- 複数 OU を含む連結成分は Epic 候補とする。
- 無関係な OU 群を機械的に単一 Epic へ集約しない。
- 必須依存がない複数 execution_unit は、`case-auto` が並列実行可能な形で出力する。
- 子Issue本文作成、検査、Issue作成は最大5件まで並列化する。
- Epic本文更新、Wave配置、ステータス追跡テーブル更新は直列集約する。

### 3. `case-auto` は execution_unit 群を最大並列実行する

`case-auto` は `case-open` が生成した execution_unit 群を orchestration 対象とする。

`case-auto` は、必須依存のない execution_unit をすべて並列実行対象とする必要がある。

`case-auto` レベルではグローバル並列上限を持たない。維持する上限は、`case-run` が扱う 1 Wave 内の子Issue最大5件制限のみとする。

`case-auto` は以下を満たす必要がある。

- ready execution_unit を並列に `case-run(standard)` または `case-run(#epic)` へ委譲する。
- blocked / failed になった execution_unit のみを停止対象とする。
- 他の ready execution_unit は継続する。
- ファイル衝突可能性だけを理由に execution_unit 間を直列化しない。
- execution_unit の並列可否を技術的依存レベルやファイル重複ではなく、必須依存の有無で判定する。
- Issue階層決定、子Issue選択、Epic化判定は持たず、`case-open` / `case-run` / `case-close` に委譲する。

### 4. `case-run` は現行の Wave 内最大5件並列を維持する

`case-run` は大規模改修対象としない。

`case-run` は Epic Issue 指定時、現在 ready な Wave の子Issueを最大5件まで並列委譲する。

`case-run` は以下を維持する。

- 1回の実行で扱うのは単一 Issue または単一 Wave とする。
- Epic 全体の複数 Wave 一括実行は扱わない。
- Wave境界のPRマージ、子Issueクローズ、Epic本文更新は `case-close` に委譲する。
- execution_unit 間の並列判定は行わない。

### 5. `case-close` は Epic Wave クローズを準並列化する

`case-close` は Epic Wave クローズ時、子Issueごとの処理全体を番号昇順で完全直列にしない。

以下は並列化対象とする。

- PR情報取得
- PR変更ファイル取得
- Issue本文読み取り
- PR本文読み取り
- 完了条件チェック候補の事前評価
- capture候補抽出
- SPEC確定候補の有無確認
- worktree / branch 削除前チェック

以下は直列集約対象とする。

- squash merge
- main の pull / hash 確認
- Epic Issue 本文ステータス追跡テーブル更新
- `.agentdev/intake` / `.agentdev/learning` 永続化 commit / push
- branch / worktree 削除の最終処理

rebase で機械的に解消可能なコンフリクトは停止条件にしない。解消不能な場合のみ、`case-auto` の Level 2 / Level 3 コンフリクト解消モデルへエスカレーションする。

## 主対象REQまたは変更対象候補

主対象候補:

- `REQ-0114` case-auto 最大自走モード
- `REQ-0148` RU群バッチ処理と複数 execution_unit 並列実行
- `REQ-0130` case-run / 実装実行
- `REQ-0131` case-close / 完了処理

関連変更候補:

- `REQ-0102` req-define / 要件定義
- `REQ-0138` 構造化 req_draft 契約
- `REQ-0137` 並列実行安全 git 操作規律
- `REQ-0151` コンフリクト解消モデルと実行時間観測

変更対象ファイル候補:

- `src/opencode/commands/agentdev/req-define.md`
- `src/opencode/commands/agentdev/case-open.md`
- `src/opencode/commands/agentdev/case-auto.md`
- `src/opencode/commands/agentdev/case-run.md`
- `src/opencode/commands/agentdev/case-close.md`
- `src/opencode/commands/agentdev/templates/req-define/req-draft.md`
- `docs/specs/commands/req-define.md`
- `docs/specs/commands/case-open.md`
- `docs/specs/commands/case-auto.md`
- `docs/specs/commands/case-run.md`
- `docs/specs/commands/case-close.md`
- `docs/specs/workflows/epic-wave-model.md`

## 対象外

以下は対象外とする。

- `case-run` の大規模改修
- 新しい workflow 状態の追加
- Wave を GitHub Issue として扱う設計
- ファイル衝突可能性を理由に事前直列化する scheduler の導入
- `case-auto` に Issue階層決定ロジックを持たせること
- `case-auto` に子Issue選択ロジックを持たせること
- `case-auto` に Epic化判定ロジックを持たせること
- `case-auto` レベルのグローバル並列上限の導入
- 実装手順、コード差分、具体的な関数設計
- ユーザー未承認の保存、commit、push
- Issue 作成、PR 作成

## 受け入れ条件

- `operation_units[].depends_on` は必須依存のみを表すことが、command / SPEC / template 上で明確になっている。
- `recommended_order` が並列可否に影響しないことが明確になっている。
- 弱依存、関連依存、ファイル衝突可能性が `depends_on` に混入しないことが明確になっている。
- `case-open` が OU 2件以上を理由に停止しないこと。
- `case-open` が必須依存グラフの連結成分から execution_unit 群を生成すること。
- `case-open` が単独根を Standard Issue 候補として扱うこと。
- `case-open` が無関係な OU 群を機械的に単一 Epic へ集約しないこと。
- `case-open` が子Issue本文作成、検査、Issue作成を最大5件まで並列化できること。
- `case-open` が Epic本文更新、Wave配置、ステータス追跡テーブル更新を直列集約すること。
- `case-auto` が必須依存のない execution_unit をすべて並列実行対象にすること。
- `case-auto` がグローバル並列上限を持たないこと。
- `case-auto` が維持する上限は、`case-run` の Wave 内子Issue最大5件制限のみであること。
- `case-auto` が blocked / failed execution_unit のみを停止対象とし、他の ready execution_unit を継続すること。
- `case-auto` がファイル衝突可能性だけを理由に execution_unit 間を直列化しないこと。
- `case-run` が単一 Issue または単一 Wave のみを扱う責務を維持すること。
- `case-run` が Epic Wave 内 ready 子Issue最大5件並列を維持すること。
- `case-run` が execution_unit 間の並列判定を行わないこと。
- `case-close` が Epic Wave クローズ時の PR / Issue 読取、事前検証、capture抽出を並列化対象として扱うこと。
- `case-close` が squash merge、main同期、Epic本文更新、`.agentdev` 永続化を直列集約対象として扱うこと。
- rebase で機械的に解消可能なコンフリクトが停止条件から除外されていること。
- 解消不能なコンフリクトのみが `case-auto` の Level 2 / Level 3 へエスカレーションされること。
- command と SPEC の間で、OU逐次処理、独立OU最大5件制限、子Issue順次作成、子Issue順次クローズに関する古い記述が残存しないこと。
