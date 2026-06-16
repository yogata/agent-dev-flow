# RU-20260616-02: agentdev-quality-gates 新設と agentdev-spec-compliance 削除

## 0. メタ情報

- 対象レポジトリ: `agent-dev-flow`
- 前提スナップショット: `agent-dev-flow-main-2026-06-16.zip`
- 想定実行者: 別エージェントが `req-define` / `req-save` / `case-open` / `case-run` 等の通常ワークフローで適用する
- 目的: AgentDevFlow main workflow の品質ゲートを4つのゲートとして体系化し、`case-run` だけに残る `agentdev-spec-compliance` と紐づく現行REQ/SPEC/参照を削除する

本RUの対象は以下に限定する。

- 新規に作成するファイル・ディレクトリ
- 既存から削除するファイル・ディレクトリ
- 既存ファイルから削除する現行記述、および削除後に必要となる置換先・参照先

`agentdev-spec-compliance` の扱いは、廃止ADR・廃止REQを追加する方式ではなく、active ADR / REQ / SPEC / command / skill / docs から現行機能としての記述を削除し、新しい品質ゲート体系に置換する方式とする。

## 1. 背景と合意事項

現状の `agent-dev-flow` では、品質ゲートが体系化されず各コマンドやskillに散在している。特に `case-run` だけが `agentdev-spec-compliance` を専用skillとして参照しているが、当該skillは以下を混在させている。

- PR前の実装乖離確認
- 品質メトリクス収集
- `docs/` 全体grep
- Document Classification Policy確認
- `case-update --review-ng` 連携
- review-ng時のループバック
- 乖離検出レポートテンプレート

このため、`spec-compliance` という名前と実体が一致せず、main workflow 全体から見ても `case-run` だけが中途半端にskill化された不均衡な状態になっている。

本RUでは、品質ゲートを以下の4つに整理する。

| Gate | 対象コマンド | 目的 |
|---|---|---|
| QG-1 | `req-define` / `req-save` | 定義品質ゲート |
| QG-2 | `case-open` | 受け入れ条件品質ゲート |
| QG-3 | `case-run` | PR前実装充足・乖離ゲート |
| QG-4 | `case-close` | 最終受け入れゲート |

`inspect-*` / `intake-*` / `learning-*` / `backlog-*` は本RUで新設する `agentdev-quality-gates` の対象に含めない。これらの確認観点は各コマンドまたは既存専門skillに閉じる。

## 2. 新規に作成するもの

### 2.1 新規SPEC: `docs/specs/quality-gates.md`

`docs/specs/quality-gates.md` を新設する。

役割:

- AgentDevFlow main workflow の4品質ゲートを定義する repo-internal 設計仕様。
- `agentdev-quality-gates` skill の根拠となる設計文書。
- 品質ゲートの目的、入力、出力、pass/warn/fail、責務外、機械化境界を定義する。

含める内容:

```text
# Quality Gates

- Scope
- QG overview
- QG-1 Definition Integrity Gate
- QG-2 Acceptance Criteria Coverage Gate
- QG-3 Implementation Deviation Gate
- QG-4 Final Acceptance Gate
- Mechanization and delegation boundaries
- Command / skill implementation mapping
```

Scopeには、対象が main workflow の QG-1〜QG-4 であることを明記する。

`Mechanization and delegation boundaries` 章に含める設計指針:

```text
推論で判断すること:
- REQ / ADR / SPEC の意味整合
- Issue本文の受け入れ条件が REQ / ADR / SPEC / 対象スコープを充足しているか
- 実装差分が Issue受け入れ条件 / REQ / ADR / SPEC / work plan を満たしているか
- scope creep か妥当な副作用か
- impl-bug / spec-bug / scope-creep の最終分類
- Issueを閉じてよいかの最終判断

機械的に確認できること:
- 必須セクション有無
- frontmatter / ファイル名 / ID の整合
- Issue / PR body の書き込み後VERIFY
- git diff の変更ファイル一覧
- checkbox 抽出
- 参照REQ / ADR の存在確認
- 許可パス外変更検出
- template placeholder 残存確認

サブエージェントに委譲できること:
- 候補抽出
- 根拠収集
- coverage表の下書き
- 変更ファイル分類
- pass / warn / fail 候補の提示

委譲・自動化の対象から外すこと:
- ユーザー承認判断
- Issue / PR / docs への書き込み
- git commit / push / merge
- 最終gate判定
- impl-bug / spec-bug / scope-creep の最終分類をスクリプトだけで決めること
```

実装写像の例:

| Command | Gate | 実行時参照 | 実装方法 |
|---|---|---|---|
| `req-define` | QG-1 | `agentdev-quality-gates` | command本文 + skill参照。推論中心 |
| `req-save` | QG-1 | `agentdev-quality-gates` | command本文 + 既存構造検査 |
| `case-open` | QG-2 | `agentdev-quality-gates` | Issue作成前に受け入れ条件coverageを推論確認 |
| `case-run` | QG-3 | `agentdev-quality-gates` | PR作成直前にgit diffとの乖離確認 |
| `case-close` | QG-4 | `agentdev-quality-gates` | merge / close 前に最終受け入れ確認 |
| `case-auto` | 各構成コマンドのQGを継承 | なし | QG-1〜QG-4を再実装しない |

### 2.2 新規skill: `src/opencode/skills/agentdev-quality-gates/`

以下のディレクトリとファイルを新設する。

```text
src/opencode/skills/agentdev-quality-gates/SKILL.md
src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md
src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md
src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md
src/opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md
src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
```

#### 2.2.1 `SKILL.md`

役割:

- QG-1〜QG-4 の runtime 参照入口。
- 実行時に各commandが該当QGだけを参照できるようにする。
- 実際のファイル編集、Issue作成、PR作成、merge、test実行は行わない。

推奨frontmatter:

```yaml
---
name: agentdev-quality-gates
description: Defines lightweight quality gates for AgentDevFlow main workflow. USE FOR: QG-1 definition integrity, QG-2 acceptance criteria coverage, QG-3 implementation deviation, and QG-4 final acceptance. DO NOT USE FOR: executing tests, modifying files, creating issues, updating issue checkboxes, creating PRs, merging PRs, or replacing command-specific procedures.
---
```

`SKILL.md` に書く内容:

- このskillは知識ベースであること。
- 実行操作は各commandが行うこと。
- `common-gate-contract.md` と QG別referenceの一覧。
- `agentdev-quality-gates` は main workflow の QG-1〜QG-4 のためのskillであること。
- `inspect-*` / `intake-*` / `learning-*` / `backlog-*` / `case-update` は runtime参照対象に含めないこと。

#### 2.2.2 `references/common-gate-contract.md`

含める内容:

- `pass` / `warn` / `fail` / `partial` の定義。
- `fail` 時は次工程に進まない原則。
- `warn` 時は完了報告またはPR本文に短く記載して進行可能とする原則。
- `partial` は Epic / Wave / 複数OUなど、一部範囲のみ判定可能な場合に使う。
- evidence-first 原則。
- 自動修正しない範囲。
- 短い gate result 形式。

最小報告形式:

```markdown
## Quality Gate Result

- Gate: QG-N <name>
- Result: pass | warn | fail | partial
- Evidence:
  - ...
- Findings:
  - [warn] ...
  - [fail] ...
- Action: continue | fix-before-next-step | ask-user | stop
```

#### 2.2.3 `references/qg-1-definition-integrity.md`

対象:

- `req-define` draft
- `req-save` 対象の REQ / ADR
- 関連SPEC / guide / command / skill 更新候補

目的:

- 要求・決定・仕様として次工程に渡してよい状態かを確認する。

確認観点:

- REQ に書くべき状態要件が REQ にあるか。
- 作業手段が REQ 本文に混ざっていないか。
- ADR化すべき判断と、ADR化してはいけない仕様記述が分かれているか。
- SPEC更新候補が必要に応じて関連ドキュメント更新候補に入っているか。
- `operation_units` / `execution_groups` が構造的に破綻していないか。
- チェックボックスが測定可能・一意・検証可能か。

fail 例:

- REQ / ADR / SPEC の分類が破綻している。
- ADR禁止対象をADR候補として保存しようとしている。
- 必達要件が検証不能。
- OU参照が壊れている。
- `req-save` が保存すべきでないRUパスや一時ファイル情報を docs に残そうとしている。

warn 例:

- 関連docs更新候補が境界上。
- SPEC化すべきかguide化すべきか迷う。
- 後続Issueで扱うべき関連作業候補がある。

#### 2.2.4 `references/qg-2-acceptance-criteria-coverage.md`

対象:

- `case-open` が作成する Issue本文
- Issue本文の `完了条件`
- 入力REQ / draft
- 関連ADR / SPEC / guide / command / skill 更新候補

目的:

- Issue本文に記述する受け入れ条件の内容が、REQ / ADR / SPEC / 対象スコープを充足しているかを確認する。
- 実装が受け入れ条件を満たしたかは確認しない。

確認観点:

- REQの必達要件が完了条件に落ちているか。
- ADRの制約が必要に応じて完了条件に反映されているか。
- SPEC / docs / command / skill 更新が必要な場合、完了条件に含まれているか。
- 完了条件が `case-run` / `case-close` で検証可能な粒度か。
- 実装手順だけ、曖昧表現、巨大な複合条件になっていないか。
- 今回スコープ外の条件が混ざっていないか。

fail 例:

- REQ必達要件に対応する完了条件がない。
- 完了条件が検証不能。
- Issue本文に完了条件セクションがない。
- Epic / child Issue の責務分担が不明で、どこで何を完了判定するか分からない。

warn 例:

- docs更新候補の完了条件化が境界上。
- 完了条件の粒度がやや大きいが、判定は可能。

#### 2.2.5 `references/qg-3-implementation-deviation.md`

対象:

- Issue本文の完了条件
- REQ / ADR / SPEC
- work plan
- 今回の `git diff`
- ローカル検証結果の要約

目的:

- PR作成前に、実装差分が Issue / REQ / ADR / SPEC / work plan からズレていないかを確認する。

確認観点:

- やると言ったことが `git diff` に入っているか。
- 完了条件を満たす実装・docs・test更新があるか。
- ADR / SPEC に明示的に反していないか。
- work plan 外の変更が混ざっていないか。
- 実装変更に必要な関連docs / SPEC / command / skill更新が漏れていないか。

分類:

- `no-deviation`
- `impl-bug`
- `spec-bug`
- `scope-creep`

fail 例:

- 必須完了条件に対応する実装差分がない。
- ADR / SPEC に明示的に反する。
- 未承認の scope creep がある。
- 実装変更に必要な関連更新が欠落し、PRとして出すと矛盾が残る。

warn 例:

- 関連docs更新漏れの疑い。
- work plan に明示されていないが妥当な副作用の可能性。
- `/agentdev/inspect-docs` で別途扱うべき広域矛盾の疑い。

責務外:

- Issue本文のチェックボックス更新。
- docs全体の意味レビュー。
- Document Classification Policy 全体確認。
- 品質メトリクス収集そのもの。
- test / lint / build 実行そのもの。
- REQ更新。
- `case-update` 連携。

#### 2.2.6 `references/qg-4-final-acceptance.md`

対象:

- PR
- CI / test結果
- Issue本文の完了条件チェックボックス
- PR本文
- merge前後の状態
- 必要に応じて docs / diff / commit

目的:

- 最終的に Issue を閉じてよいかを確認する。

確認観点:

- PRが対象Issueに対応しているか。
- CI / test / local validation が通っているか、または明示的に許容されたか。
- Issue本文の完了条件が証跡に基づいて達成済みか。
- 未チェック項目がある場合、`case-close` が達成判定・本文更新・再読込VERIFYを行ったか。
- 未達項目を intake / learning へ逃がして完了扱いしていないか。

fail 例:

- 完了条件に未達が残る。
- 達成証跡がない。
- PRとIssueの対応が不明。
- merge前提が満たされない。
- Issue本文更新後のVERIFYに失敗する。

warn 例:

- post-merge でしか確認できない項目がある。
- 完了条件以外の将来改善候補がある。

責務:

- Issue本文の完了条件チェックボックスの評価・更新は `case-close` の責務である。
- `case-run` はこの更新を行わない。

## 3. 既存から削除するもの

### 3.1 skill自体の削除

以下を削除する。

```text
src/opencode/skills/agentdev-spec-compliance/SKILL.md
src/opencode/skills/agentdev-spec-compliance/templates/report_spec_compliance.md
src/opencode/skills/agentdev-spec-compliance/
```

`agentdev-spec-compliance` への参照は文脈に応じて以下のように処理する。

- QG-3 の runtime 参照に置換する。
- QG-1〜QG-4 の適切な参照に置換する。
- `case-update` や review-ng 連携など、今回の合意で不要になった箇所は削除する。
- 品質メトリクス収集や docs全体grep など、QG-3の責務外にした箇所は削除または別責務に戻す。

### 3.2 active REQ から削除・修正するもの

以下は active REQ に残る `agentdev-spec-compliance` または旧 Step 8 依存の要求である。現行要求として残さない。

#### `docs/requirements/REQ-0106.md`

削除または見直し対象:

```text
REQ-0106-021: Step 8 乖離検出において、削除・変更対象キーワードの docs/ 全体 grep を必須ステップとすること
```

対応:

- QG-3 は `docs/` 全体grepを行わないため、この要求は削除する。
- docs全体の意味レビューは `/agentdev/inspect-docs` または repo-local の docs-check 側の責務として扱う。
- QG-3に残すのは、今回の `git diff` と Issue / REQ / ADR / SPEC / work plan の局所的な乖離確認のみ。

#### `docs/requirements/REQ-0115.md`

削除対象:

```text
REQ-0115-040: agentdev-spec-compliance は実装と REQ / work plan / ADR の乖離検出ゲートであり、docs 全体の意味レビューの代替ではないことを明記すること
```

対応:

- `agentdev-spec-compliance` 自体を削除するため、この要件行は削除する。
- 同趣旨の「docs全体レビューは QG-3 の責務外」は、新設する `docs/specs/quality-gates.md` と `qg-3-implementation-deviation.md` に責務外として記述する。

#### `docs/requirements/REQ-0124.md`

修正対象:

```text
agentdev-{req-file-manager,req-analysis,workflow-routing,workflow-lifecycle,spec-compliance,req-structure-diagnostics}/
```

対応:

- `spec-compliance` を削除する。
- 必要なら `agentdev-quality-gates` を文脈上の対象に加えるが、単純置換はしない。inspect 系命名参照の話であれば `agentdev-quality-gates` を含める必要があるかを意味的に判断する。

#### `docs/requirements/mapping-table.md`

対応:

- 上記REQ行の削除・変更に伴い、必要なら mapping table を更新する。
- 削除した旧要件を現行必達要件として残さない。

### 3.3 active SPEC から削除・修正するもの

#### `docs/specs/quality-specs.md`

削除・修正対象:

- `case-run Step 8（乖離検出時）に併せて収集`
- `各メトリクスは spec-compliance スキルの報告フォーマットに統合して出力`
- `品質メトリクス報告は乖離検出報告に併記する形式`

対応:

- 品質メトリクスは QG-3 の一部ではない。
- 型チェック・Lint・ビルド・テスト結果は `case-run` のローカル検証および PR説明における evidence として扱う。
- `report_spec_compliance.md` や `agentdev-spec-compliance` への依存を削除する。

#### `docs/specs/system.md`

削除・修正対象:

- `deviation-check`: 乖離検出時に品質メトリクスを自動収集する、という記述。
- `case-run` が完了条件チェックボックス更新責務を維持する趣旨の記述。
- `case-run` Step 7 / Step 8 に紐づく旧品質ゲート記述。

対応:

- main workflow の品質ゲートは `docs/specs/quality-gates.md` を参照する形に整理する。
- `case-run` は QG-3 を PR作成直前に実行する。
- `case-run` は Issue本文の完了条件チェックボックスを更新しない。
- `case-close` が QG-4 として最終評価・チェックボックス更新・close可否判断を行う。

#### `docs/specs/workflow-contracts.md`

削除対象:

```text
乖離検出（report_spec_compliance.md） | .opencode/skills/agentdev-spec-compliance/templates/ | agentdev-spec-compliance
```

対応:

- `report_spec_compliance.md` テンプレート行を削除する。
- 必要なら `agentdev-quality-gates` を runtime skill として記載するが、テンプレート行としては追加しない。

#### `docs/specs/README.md`

対応:

- `quality-gates.md` を specifications 一覧に追加する。
- `agentdev-spec-compliance` の現行SPEC参照があれば削除する。

#### `docs/specs/rule-ownership.md`

対応:

- Quality Gates の rule domain を追加する。
- `agentdev-quality-gates` と `docs/specs/quality-gates.md` の責務関係を明記する。
- `agentdev-spec-compliance` の rule ownership があれば削除する。

#### `docs/specs/design-principles.md`

対応:

- Command / Skill / Script / Subagent の責任分界の具体例として、品質ゲートの機械化境界を `quality-gates.md` へ参照させる。
- 詳細な機械化境界は `quality-gates.md` 側に集約する。

### 3.4 active ADR から削除・修正するもの

2026-06-16版での簡易grepでは active `docs/adr/**` に `agentdev-spec-compliance` / `spec-compliance` の直接参照は見つからなかった。

実行時には必ず再確認すること。

対応:

- active ADR に `agentdev-spec-compliance` / `report_spec_compliance.md` / 旧 `case-run` Step 8 依存の決定事項があれば削除または現行設計に合わせて修正する。
- 作業手段の削除・skill名変更そのものをADR化しない。

### 3.5 commandsから削除・更新する参照

#### `src/opencode/commands/agentdev/case-run.md`

削除対象:

- `agentdev-spec-compliance` 参照。
- QG-3内の品質メトリクス収集。
- QG-3内の `docs/` 全体grep。
- QG-3内の Document Classification Policy 全体確認。
- `case-update --review-ng` への連携。
- Issue本文の完了条件チェックボックス更新責務。

置換・追加する参照:

- `agentdev-quality-gates` の QG-3 を PR作成直前に参照する。
- Issue本文の完了条件 / REQ / ADR / SPEC / work plan と今回の `git diff` を比較する。
- fail の場合は PR を作成せず、実装修正またはユーザー判断待ちで停止する。
- warn の場合は PR本文に注意点を短く記載して継続可能とする。

維持する処理:

- ローカル検証としての typecheck / lint / build / test。
- 必要に応じた self-healing。
- PR作成。
- QG-3 の判断材料としてローカル検証結果の要約を参照すること。

#### `src/opencode/commands/agentdev/case-update.md`

削除対象:

- `case-update --review-ng` が `agentdev-spec-compliance` 結果を前提とする記述。
- `agentdev-spec-compliance` 報告を引用・要求するガード。

対応:

- `case-update` は今回の品質ゲート体系の対象に含めない。

#### `src/opencode/commands/agentdev/req-define.md`

置換・追加する参照:

- `agentdev-quality-gates` の QG-1 を参照する。
- draft生成後または要件展開後に QG-1 を実行する。
- fail の場合は draft提示前に修正または停止する。
- warn の場合は draft提示可能だが、完了報告に短く注意点を記載する。

維持する処理:

- `agentdev-req-analysis` の詳細ゲート。
- `agentdev-adr-guidelines`。
- サブエージェントは候補抽出・根拠収集まで。親エージェントが最終判断する。

#### `src/opencode/commands/agentdev/req-save.md`

置換・追加する参照:

- `agentdev-quality-gates` の QG-1 を参照する。
- docs保存前に QG-1 の永続化観点を確認する。
- fail の場合は保存・commitしない。

維持する処理:

- `agentdev-req-file-manager` の保存手順・frontmatter・ファイル名・変更範囲検査。

#### `src/opencode/commands/agentdev/case-open.md`

置換・追加する参照:

- `agentdev-quality-gates` の QG-2 を参照する。
- Issue作成前に QG-2 Acceptance Criteria Coverage Gate を実行する。
- Issue本文の `完了条件` が、入力REQ / ADR / SPEC / 対象スコープを不足なく・過剰なく・検証可能に表しているか確認する。
- fail の場合は Issue を作成せず、Issue本文を修正する。
- warn の場合は Issue 作成を継続可能とし、完了報告に注意点を記載する。

注意:

- `case-open` は実装前であるため、実装が受け入れ条件を満たしたかは確認しない。
- `case-open` の確認は「受け入れ条件として記述する内容の充足チェック」である。

#### `src/opencode/commands/agentdev/case-close.md`

置換・追加する参照:

- `agentdev-quality-gates` の QG-4 を参照する。
- merge / close 前に QG-4 Final Acceptance Gate を実行する。
- PR結果・CI・Issue本文の完了条件・証跡を確認する。
- Issue本文の完了条件チェックボックスの評価・更新は `case-close` の責務である。
- 更新後は再読込VERIFYを行う。
- fail の場合は merge / close しない。

#### `src/opencode/commands/agentdev/case-auto.md`

対応:

- 独立した品質ゲートを追加せず、構成コマンドのQGを継承する旨を記述する。
- QG-1〜QG-4を `case-auto` に再実装しない。

### 3.6 skillsから削除・更新する参照

以下は 2026-06-16版で確認された旧参照候補であり、実行時に再grepして完全除去すること。

```text
src/opencode/skills/agentdev-doc-map/SKILL.md
src/opencode/skills/agentdev-learning-capture/references/example.md
src/opencode/skills/agentdev-learning-pipeline/SKILL.md
src/opencode/skills/agentdev-req-analysis/SKILL.md
src/opencode/skills/agentdev-req-file-manager/SKILL.md
src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md
src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md
src/opencode/skills/agentdev-workflow-orchestration/SKILL.md
src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md
src/opencode/skills/agentdev-workflow-routing/references/review-ng.md
src/opencode/skills/agentdev-workflow-templates/SKILL.md
src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md
```

対応方針:

- `agentdev-spec-compliance` 参照を削除する。
- QG-1〜QG-4 のどれかに該当する場合のみ `agentdev-quality-gates` 参照に置換する。
- `case-update` / review-ng 連携は削除する。
- `issue_comment_review_ng.md` の `Spec Compliance 結果` セクションは削除するか、review-ng テンプレート自体を現行利用実態に合わせて整理する。`agentdev-spec-compliance` の乖離報告引用は残さない。
- `agentdev-learning-capture/references/example.md` の例示に旧skill名が残る場合は、現行の QG-3 または一般的な「PR前品質ゲート」に置換する。実例として不要なら削除する。

### 3.7 配置先 `.opencode/skills/repo-agentdev-integrity/**` から削除・更新する参照

2026-06-16版では以下に旧skill名が残る。

```text
.opencode/skills/repo-agentdev-integrity/SKILL.md
.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
```

対応:

- `agentdev-spec-compliance` を有効skill名・参照対象・最終分類委譲先として扱う記述を削除する。
- 必要なら `agentdev-quality-gates` を許可skill名に追加する。
- `impl-bug` / `spec-bug` / `scope-creep` の最終分類を機械的 integrity check の責務にしない。最終分類は QG-3 における推論判断である。

### 3.8 docs / guidesから削除・更新する参照

#### `docs/guides/artifacts-and-state.md`

対応:

- `agentdev-spec-compliance/templates/` や `report_spec_compliance.md` の現行テンプレート配置としての記述を削除する。
- `agentdev-quality-gates` はテンプレートを前提としないため、テンプレート一覧に新規行を追加しない。

#### `docs/DOC-MAP.md`

対応:

- `docs/specs/quality-gates.md` を specifications 一覧に追加する。
- `agentdev-spec-compliance` の現行参照があれば削除する。

## 4. 配置・同期に関する注意

AgentDevFlowでは、配布対象の command / skill の原本は `src/opencode/` 配下である。

- 新設skillは原本 `src/opencode/skills/agentdev-quality-gates/` に作成する。
- 削除skillは原本 `src/opencode/skills/agentdev-spec-compliance/` から削除する。
- 配置先 `.opencode/` に対応する参照や repo-local integrity skill がある場合は、原本・配置先の責務に従って更新する。
- `sync-opencode.ps1` 等の同期手順が対象変更で必要な場合は実行する。
- `src/opencode/` と `.opencode/` の関係を逆に説明しない。

## 5. 検証観点

### 5.1 grep確認

active source / docs から以下の現行参照が消えていること。

```text
agentdev-spec-compliance
spec-compliance
report_spec_compliance.md
Spec Compliance 結果
```

`docs/requirements/retired/**` や `docs/adr/retired/**` の歴史記録は、既存方針に従い別扱いとする。

### 5.2 新規作成確認

以下が存在すること。

```text
src/opencode/skills/agentdev-quality-gates/SKILL.md
src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md
src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md
src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md
src/opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md
src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
docs/specs/quality-gates.md
```

### 5.3 削除確認

以下が存在しないこと。

```text
src/opencode/skills/agentdev-spec-compliance/SKILL.md
src/opencode/skills/agentdev-spec-compliance/templates/report_spec_compliance.md
src/opencode/skills/agentdev-spec-compliance/
```

### 5.4 コマンド確認

- `req-define` / `req-save` が QG-1 を参照する。
- `case-open` が QG-2 を Issue作成前に参照する。
- `case-run` が QG-3 を PR作成直前に参照する。
- `case-close` が QG-4 を merge / close 前に参照する。
- `case-auto` は QG を再実装せず、構成コマンドのQGを継承する。
- `case-update` は `agentdev-spec-compliance` を参照しない。

### 5.5 docs-check / integrity確認

- repo-local integrity script が `agentdev-spec-compliance` を有効skillとして要求しない。
- `agentdev-quality-gates` が必要なskill一覧・参照先検査に含まれる。
- `report_spec_compliance.md` をテンプレートとして要求しない。
- `docs/specs/quality-gates.md` が DOC-MAP / specs README / rule ownership に登録されている。

## 6. 受け入れ条件

- [ ] `agentdev-spec-compliance` skillディレクトリが削除されている。
- [ ] `report_spec_compliance.md` が削除されている。
- [ ] `agentdev-quality-gates` skill が新設され、QG-1〜QG-4 の reference を持つ。
- [ ] `docs/specs/quality-gates.md` が新設され、機械化境界を設計指針として含む。
- [ ] active REQ / SPEC から `agentdev-spec-compliance` を現行要求・現行仕様として扱う記述が削除または置換されている。
- [ ] active ADR に旧 `agentdev-spec-compliance` / `report_spec_compliance.md` / 旧 `case-run` Step 8 依存の現行決定事項が存在しない。
- [ ] `case-run` の QG-3 は PR作成直前の実装充足・乖離ゲートに限定されている。
- [ ] `case-run` の QG-3 から品質メトリクス収集、`docs/` 全体grep、Document Classification Policy 全体確認、`case-update` 連携が除去されている。
- [ ] Issue本文の完了条件チェックボックス評価・更新は `case-close` の責務として明記され、`case-run` には残っていない。
- [ ] `case-open` に QG-2、すなわち受け入れ条件として記述する内容の充足チェックが追加されている。
- [ ] `req-define` / `req-save` に QG-1、`case-close` に QG-4 が明示されている。
- [ ] `case-auto` は QG を再実装せず、構成コマンドのQGを継承する設計になっている。
- [ ] active source / docs のgrepで、現行参照としての `agentdev-spec-compliance` / `spec-compliance` / `report_spec_compliance.md` が残っていない。
