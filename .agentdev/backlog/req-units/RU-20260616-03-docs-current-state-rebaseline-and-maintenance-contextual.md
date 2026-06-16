# RU-20260616-docs-current-state-rebaseline-and-maintenance-contextual

## 目的

`docs/*` 全体を、現行仕様だけを自然な日本語で説明する文書体系へ再基準化する。

今回の修正は、英語用語を一対一で日本語へ置き換える作業ではない。各語が AgentDevFlow の現在の仕組みの中で何を指しているかを確認し、その概念を読み手に伝わる日本語の仕様文として書き直す。

併せて、SPEC 作成・更新時に同じ問題が再発しないよう、包括的な要件化、コマンド、スキル、テンプレート、docs-check / inspect-docs の確認観点へ取り込む。

## 背景・合意事項

現行 `docs/*` には、次の問題が横断的に残っている。

- 廃止済み機能、旧構造、移行経緯、過去の比較が、active docs の現行仕様として読める形で残っている。
- `docs/specs/*` が総じて読みづらく、仕様の構造、責務、入出力、制約、例外が追いにくい。
- SPEC に、現行仕様、旧前提、将来予定、禁止事項、検討経緯、内部処理名が混在している。
- 英語用語や英語見出しが、文書の意味を明確にするためではなく、曖昧な説明語として残っている。
- 内部処理段階名がそのままデータフローとして露出しており、利用者・保守者向けの仕様説明になっていない。
- `quality-specs.md` の品質メトリクス説明は、現行実装で有効に収集・判定される仕様として確認できない可能性が高い。
- SPEC 本文の REQ-ID 注記や HTML コメントが多く、トレース性より可読性を損なっている。
- 今後も SPEC を作成・更新するたびに再発する可能性が高いため、単発の文書修正ではなく、作成・更新・検査の仕組みまで直す必要がある。

永続ドキュメントに RU-ID を根拠として残さない。RU は case-open で削除される一時入力であり、REQ / ADR / SPEC / Guide / DOC-MAP の根拠にはしない。

## 実施対象

### 文書

`docs/**/*.md` を全件対象にする。指定された4ファイルだけの局所修正にしない。

特に重点的に修正する文書は次のとおり。

- `docs/specs/system.md`
- `docs/specs/quality-specs.md`
- `docs/specs/integrity-contracts.md`
- `docs/specs/document-model.md`
- `docs/specs/README.md`
- `docs/specs/workflow-contracts.md`
- `docs/specs/artifact-contracts.md`
- `docs/specs/artifact-responsibilities.md`
- `docs/specs/design-principles.md`
- `docs/specs/patterns.md`
- `docs/specs/rule-ownership.md`
- `docs/specs/runtime-package-boundary.md`
- `docs/specs/req-impact-map.md`
- `docs/specs/integrity-rule-catalog.md`
- `docs/README.md`
- `docs/DOC-MAP.md`
- `docs/guides/*.md`
- active `docs/requirements/REQ-*.md`
- active `docs/adr/ADR-*.md`
- `docs/requirements/README.md`
- `docs/requirements/mapping-table.md`
- `docs/adr/README.md`

`docs/requirements/retired/` と `docs/adr/retired/` は履歴領域として扱う。active docs から現行仕様の根拠として参照されないことを確認する。retired 配下の本文を現行仕様へ書き換える必要はないが、active docs の説明と混同されない状態にする。

### コマンド・スキル・テンプレート・検査

現状 docs の再基準化で得た知見を、次へ取り込む。

- `src/opencode/commands/agentdev/req-define.md`
- `src/opencode/commands/agentdev/req-save.md`
- `src/opencode/commands/agentdev/case-run.md`
- `src/opencode/commands/agentdev/case-close.md`
- `src/opencode/commands/agentdev/case-update.md`
- `src/opencode/commands/agentdev/inspect-docs.md`
- `.opencode/commands/repo/docs-check.md`
- `src/opencode/skills/agentdev-req-analysis/`
- `src/opencode/skills/agentdev-req-file-manager/`
- `src/opencode/skills/agentdev-spec-compliance/`
- `src/opencode/skills/agentdev-no-ai-slop-writing/`
- `src/opencode/skills/agentdev-command-authoring/`
- `src/opencode/skills/agentdev-skill-authoring/`
- `src/opencode/skills/agentdev-doc-map/`
- `.opencode/skills/repo-agentdev-integrity/`
- `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`
- `.opencode/skills/repo-agentdev-integrity/scripts/*.ts`
- 関連する command-local template / skill template

## 要件化方針

要件化は、細かい禁止語や個別ファイル修正を大量に並べない。包括的な要件へ集約する。

既存 REQ への APPEND / UPDATE を優先する。適切な既存 REQ がない場合だけ、新規 REQ を作成する。

更新候補は次のとおり。

- `REQ-0101`: docs 体系の責務。active docs は現行仕様だけを説明し、廃止済み機能、旧構造、検討経緯を現行仕様本文として保持しないことを追加または更新する。
- `REQ-0116`: 文書分類と SPEC 責務。SPEC は現在有効な仕様を、読みやすい日本語、明確な章立て、必要最小限のトレース情報で記述することを追加または更新する。
- `REQ-0115`: docs メンテナンスループ。docs 更新時に、現行仕様化、旧記述削除、読みやすさ、コマンド・スキル・検査への知見反映を確認することを追加または更新する。
- `REQ-0108`: 機械検査。廃止済み機能の現行仕様混入、英語混じりの説明語、内部段階名の露出、未実装の仕様主張、SPEC 可読性劣化を検査または inspect-docs の診断対象にすることを追加または更新する。
- `REQ-0103`: 配布物、原本、配置先、配布対象リポジトリ内コマンド・スキルの説明を、現行の配置・配布責務に合わせて自然な日本語へ更新する。
- `REQ-0104` / `REQ-0106`: Issue 本文の完了条件チェックボックスについて、`case-run`、driver subagent、OMO は更新せず、評価・更新は `case-close` の責務とする形へ更新する。
- `REQ-0105`: intake / learning / inspect / backlog の流れを、RU候補と RU 生成の流れとして説明し、内部処理名を仕様本文へ露出させない方針へ更新する。

要件行は「満たすべき状態・振る舞い・制約」として記述する。単なる作業手順や、今回だけの置換作業を要件行にしない。

## 実施内容

### 1. docs 全体の棚卸し

`docs/**/*.md` を全件列挙し、次の観点で確認する。

- active docs に、廃止済み機能、旧構造、旧コマンド、旧ディレクトリが現行仕様として残っていないか。
- `docs/specs/*` に、過去前提、移行経緯、将来予定、実装予定、禁止事項だけの記述、検討過程が混入していないか。
- SPEC が、読者にとって責務、入出力、状態、制約、例外、検査が追える構造になっているか。
- REQ / ADR / SPEC / Guide / DOC-MAP / Report の責務が混ざっていないか。
- `quality-specs.md` や `agentdev-spec-compliance` の品質メトリクス説明が、現行実装と一致しているか。
- active docs から retired docs が現行根拠として参照されていないか。
- SPEC 本文の REQ-ID 注記や HTML コメントが、読みやすさを損ねていないか。

棚卸し結果は PR 本文または作業メモに要約し、指定ファイル以外の取り漏れを防ぐ。

### 2. 文脈に基づく日本語化

英語用語の直接的な置換表を作るのではなく、文脈上の実体に合わせて本文を書き直す。

実コマンド名、パス、frontmatter field、enum 値、スクリプト名などの識別子は必要に応じて残してよい。ただし、本文の主語・述語・説明語は日本語で書く。

特に次の文脈は、採用する表現を固定する。

- intake / learning / inspect の `promoted/` 配下に置かれ、`backlog-review` が RU 化の入力として扱うものは `RU候補` と書く。
- `backlog-review` が生成する `.agentdev/backlog/req-units/RU-*.md` は `RU` と書く。
- `/agentdev/*` は `AgentDevFlow の配布コマンド` または `/agentdev` コマンド体系と書く。
- `/repo/*` は `/repo` コマンド体系と書く。配布対象リポジトリ内で使うコマンドとして説明する。
- `repo-local command` 相当の説明は `配布対象リポジトリ内コマンド` と書く。
- `repo-local skill` 相当の説明は `配布対象リポジトリ内スキル` と書く。
- `namespace` 相当の説明は `コマンド体系` と書く。パス接頭辞そのものを説明する必要がある場合だけ `コマンド接頭辞` と書く。
- `self-hosting repo` 相当の説明は、AgentDevFlow 自身の開発リポジトリを指す場合に限り `AgentDevFlow本体リポジトリ` と書く。
- `public command` 相当の説明は `配布コマンド` と書く。
- `src/opencode/` は `原本`、`.opencode/` は `配置先` と書く。
- 原本から配置先へ移す、コピーする、導入する意味では `配置する` と書く。
- 内部段階名は、上位 docs の本文にそのまま出さない。必要な場合は、利用者に意味が伝わる単位で `整理`、`選別`、`ユーザー確認`、`RU候補の作成` のように説明する。

既存ファイル名や既存スクリプト名に英語が含まれる場合でも、見出しと本文は日本語に直す。ファイル名・スクリプト名の改名が必要かどうかは、リンク切れ、配布手順、既存参照への影響を確認して判断する。

### 3. `docs/specs/system.md` の再構成

`system.md` は、現行システムの全体仕様として読みやすく再構成する。

必須の整理内容:

- タイトル、見出し、本文を日本語中心にする。
- 冒頭に、AgentDevFlow が何を管理し、どのコマンド体系で処理を進めるかを短く書く。
- コマンド一覧は、利用者が理解できる粒度で「入力」「出力」「責務」を示す。
- intake / learning / inspect / backlog の流れは、RU候補から RU を作る流れとして説明する。
  - intake / learning / inspect は、要件化につながる情報を RU候補として整理する。
  - `/agentdev/backlog-review` は RU候補を読み、統合・分割・採否を確認し、`.agentdev/backlog/req-units/RU-*.md` を生成する。
  - `/agentdev/req-define` は RU または明示入力を読み、要件定義へ進む。
  - `/agentdev/req-define` は RU候補を直接の通常入力にしない。
- `elevation-staging/archive/`、`elevation-staging/`、`Staging Stub Archive` の現行仕様説明を削除する。
- 内部段階名を矢印で連ねたデータフロー説明を削除する。
- `/repo/docs-check` は `/repo` コマンド体系の docs 整合性チェックとして説明し、配布対象リポジトリ内コマンドの文脈で書く。
- `.opencode/` の説明は `原本` と `配置先` の用語で統一する。
- `品質メトリクス` と `deviation-check` の説明は、現行実装で有効な自動収集機能として確認できない場合、現行仕様から削除する。
- Issue 本文の完了条件チェックボックスについて、`case-run`、driver subagent、OMO は更新しない。完了条件チェックボックスの評価・更新は `case-close` の責務として整理する。
- `case-run` は実装、検証、PR作成、必要な docs / command / skill 更新を担う。完了条件の最終評価・Issue本文チェック更新は `case-close` に渡す。

### 4. `docs/specs/quality-specs.md` の見直し

`quality-specs.md` は、現行実装で裏付けられる品質確認だけを記述する。

実施内容:

- `agentdev-spec-compliance`、`case-run`、PRテンプレート、関連スクリプトを確認し、型チェック・Lint・ビルド・テスト・カバレッジの自動収集が実装されているか確認する。
- 自動収集の実体がない場合、`テストカバレッジ ≥80%`、`Lint エラー数 0`、`型エラー数 0`、`ビルド成功` のようなメトリクス表を現行仕様から削除する。
- `system.md`、`docs/specs/README.md`、`docs/README.md`、`docs/DOC-MAP.md`、`docs/guides/*`、`workflow-contracts.md`、`rule-ownership.md` の関連説明を更新する。
- PR本文テンプレートや spec-compliance テンプレートで `品質メトリクス` が必須セクションになっている場合、現行で確実に記録できる `検証結果` または `確認結果` に整理する。
- `quality-specs.md` を残す場合は、`/repo/docs-check`、`/agentdev/inspect-docs`、`agentdev-spec-compliance`、ローカル検証の責務境界と出力だけを記述する。

### 5. `docs/specs/integrity-contracts.md` の再構成

`integrity-contracts.md` は、現在の整合性検査契約だけを記述する。

実施内容:

- 旧前提と新前提の比較、移行記録、将来段階を現行仕様本文から削除する。
- 現在の検査対象、検査カテゴリ、finding レベル、route、出力形式、許可される出力範囲、スクリプト契約を章ごとに整理する。
- コードや出力 schema の値として必要な英語 enum は残してよい。その場合は日本語で意味を説明する。
- 未実装の分類、旧検査名、旧状態、将来予定を現行仕様として残さない。
- `/repo/docs-check` と `.opencode/skills/repo-agentdev-integrity/scripts/` の実体と矛盾しないようにする。

### 6. `docs/specs/document-model.md` の再構成

`document-model.md` は、文書種別の責務と分類規則を読みやすく説明する仕様にする。

実施内容:

- 英語見出しや英語混じりの説明を日本語へ置き換える。
- `workflow status` のような禁止事項だけの説明は、現在の文書モデル本文から外す。必要な場合は docs-check / inspect-docs の検査観点として扱う。
- REQ / ADR / SPEC / Guide / DOC-MAP / Report / Retired の定義を、1つの責務表と短い補足に整理する。
- SPEC の書き方として、次を明記する。
  - 現在有効な仕様・契約・構造だけを書く。
  - 廃止済み機能、移行経緯、旧前提、将来予定、未実装予定を書かない。
  - 内部処理名や英語略語は、読み手に必要な場合だけ説明付きで使う。
  - 1章1主題とし、短い段落、表、箇条書きで整理する。
  - REQ-ID は本文中に過剰に散らさず、必要な場合は末尾の関連要件表または DOC-MAP で追跡する。
- HTML コメントによる REQ-ID 注記を削除または大幅に削減する。
- トレース性は、active REQ、accepted ADR、DOC-MAP、関連情報セクションで担保する。SPEC 本文の各文に REQ-ID を付けない。

### 7. `docs/specs/*` 全体の読みやすさ再基準化

`docs/specs/*` 全体を、次の構造に寄せる。

- 冒頭に「この文書が説明するもの」を短く書く。
- 読み手が最初に見るべき全体像を置く。
- 詳細は、責務、入力、出力、状態、制約、検査、例外のように章を分ける。
- 旧機能、廃止機能、移行経緯を現行仕様本文に書かない。
- 仕様、要件、判断根拠を混ぜない。
- 同じ内容を `system.md`、`workflow-contracts.md`、`artifact-contracts.md`、`guides/*` に重複して書かない。
- 索引ファイルは、リンクと1行説明に近い形に抑える。

特に以下を横断修正する。

- `quality-specs.md` 参照と実体の不一致。
- `原本` / `配置先` の用語不統一。
- `コマンド体系`、`配布コマンド`、`配布対象リポジトリ内コマンド`、`配布対象リポジトリ内スキル` の説明不統一。
- 旧名称の active docs 混入。
- 廃止済み概念の現行説明。
- `case-run` が Issue 本文チェックボックスを更新するという旧責務。

### 8. `docs/README.md`、`docs/DOC-MAP.md`、guides の整理

`docs/README.md` と `docs/DOC-MAP.md` は、文書本文の代替ではなく入口・索引として整理する。

実施内容:

- 各エントリはリンクと短い説明に抑える。
- 旧用語、旧コマンド名、廃止機能名を現行導線として残さない。
- guides は人間向けナビゲーションに徹し、REQ / ADR / SPEC の本文を重複して保持しない。
- guides の見出しと本文を日本語で整理する。
- 配布対象リポジトリへの導入説明は、その文脈が分かる日本語のタイトル・本文へ改める。
- guides のコマンドフロー説明を現行仕様へ合わせる。特に `case-run` の提出説明から Issue 本文チェックボックス更新責務を外し、`case-close` の完了判定へ整理する。

### 9. active REQ / ADR の整合

active REQ / ADR も `docs/*` の一部として横断確認する。

実施内容:

- active REQ / ADR に、廃止済み機能や旧構造が現行要件・現行判断として残っていないか確認する。
- `case-run` が Issue 本文チェックボックス更新責務を持つ旧要件が残っている場合、現行責務へ更新する。
- 旧機能の削除・移行そのものを active ADR の主題としている箇所があれば、現行のあるべき状態の決定へ整理する。
- active REQ / ADR のタイトル・本文から、不要な英語用語や読みづらい長文を減らす。
- Update Notes に残す履歴は、現行仕様本文と混ざらないようにする。

### 10. コマンド・スキルへの再発防止の取り込み

#### `req-define`

- docs / SPEC に影響する要件を扱う場合、関連ドキュメント更新候補に `docs/specs/*`、`docs/guides/*`、`docs/README.md`、`docs/DOC-MAP.md`、commands、skills、templates、docs-check rule を含めて評価する。
- 要件化は包括的に行い、個別禁止語や個別ファイル修正を大量の要件行にしない。
- 作業手段だけを要件行にしない。現行状態として「active docs は現在仕様のみを説明する」のように表現する。
- SPEC 作成・更新の入力では、現行仕様、読みやすさ、日本語表現、トレース最小化、文脈に基づく用語整理を確認観点に入れる。

#### `req-save`

- REQ / ADR 保存時に、docs 本文へ RU-ID を根拠として残さない。
- 反映作業だけの要件行を保存しない。
- docs 分類ポリシーに照らし、SPEC に置くべき内容、REQ に置くべき内容、ADR に置くべき内容を保存前に確認する。
- docs 更新候補がある場合、DOC-MAP / README / specs index の更新漏れを確認する。

#### `case-run`

- docs / SPEC 改修を含む Issue では、`docs/*` 全体を横並びでスキャンし、指定ファイルだけの局所修正にしない。
- 実装・docs・commands・skills・templates・検査ルールの更新を同一変更として扱い、再発防止まで含めて完了させる。
- Issue 本文の完了条件チェックボックスを更新しない。完了条件の実装状況は PR 本文や証跡に記録し、最終評価・Issue本文更新は `case-close` に委ねる。
- docs と command / skill / template が連動する領域では、すべて同時に整合させる。

#### `case-close`

- 完了条件チェックボックスの評価・更新を担当する。
- docs / SPEC 改修案件では、マージ前に以下を確認する。
  - active docs に廃止済み機能の現行説明が残っていない。
  - `docs/specs/*` が現行仕様だけを読みやすく説明している。
  - 英語混じりの説明語、内部段階名、未実装メトリクス契約の残存がない。
  - commands / skills / templates / docs-check rule の再発防止更新が含まれている。

#### `inspect-docs`

- 意味診断の観点に、以下を追加する。
  - active docs が現行仕様だけを説明しているか。
  - 廃止済み機能、旧構造、旧名称が active docs に現行説明として残っていないか。
  - SPEC が読みやすい構造になっているか。
  - SPEC に検討経緯、旧前提、将来予定、未実装予定、禁止事項だけの記述が混入していないか。
  - SPEC 本文の REQ-ID 注記が過剰でないか。
  - 日本語で説明できる英語用語が本文に残っていないか。
  - 内部段階名が利用者向け・仕様向け説明に漏れていないか。
  - docs の記述が command / skill / template の実体と矛盾していないか。
- `inspect-docs` は finding、根拠、推奨 route を出す。自動修正はしない。

#### `/repo/docs-check` / `repo-agentdev-integrity`

- `vocabulary-registry.md` と検出ルールに、今回確認した旧語彙、旧構造、廃止済み概念を追加する。
- 検出対象は active docs、guides、specs、active REQ / ADR、commands、skills、templates、配置先の必要箇所を含める。
- retired docs、検出ルール自体、negative example、code block は適切に例外扱いする。
- 旧語彙の単純 grep だけでなく、未実装の仕様主張を見つけるための heuristic finding を追加する。
- regression test / fixture を追加し、今回の旧記述が再発したときに検出されることを確認する。

#### `agentdev-spec-compliance`

- 自動品質メトリクス収集が実装されていない場合、その説明を現行仕様・スキル本文・テンプレートから削除する。
- 役割を「実装と REQ / work plan / ADR の乖離検出」に限定して明確化する。
- docs 全体の意味レビューや SPEC 可読性レビューの代替ではないことを維持する。

#### `agentdev-workflow-templates`

- PR本文テンプレート、乖離報告テンプレート、レビューNGテンプレートで、実体のない `品質メトリクス` 必須セクションを残さない。
- 現行で確実に記録できる検証結果・確認結果・CI結果に整理する。

#### `agentdev-no-ai-slop-writing`

- SPEC / Guide / REQ / ADR の文章品質にも適用する。
- 「ただ文字が連なっているだけ」の長文、意味の薄い抽象語、説明なしの英語語彙、読者に手順や責務が伝わらない文章を禁止例に加える。
- SPEC 用の良い例として、短い目的、責務表、データフロー表、入出力表、制約表を使う構成を示す。
- 用語整理では、英語に日本語を割り当てるだけではなく、文脈上の実体を確認して本文を書き直すことを明記する。

#### command / skill authoring 系

- command / skill を変更・追加するとき、関連 docs / SPEC / Guide / DOC-MAP / docs-check rule の更新要否を確認する。
- 新しい SPEC を作る場合、現行仕様だけを書くこと、廃止済み機能を本文に残さないこと、読みやすい日本語にすることを authoring gate に入れる。
- 用語・表現は、英語表記の直接置換ではなく、読者に伝えるべき概念を日本語で説明する方針にする。

### 11. 検索・検査対象語の初期リスト

少なくとも以下を active docs と commands / skills / templates で検索し、現行説明として残っていれば修正する。

```text
elevation-staging
Staging Stub Archive
learning-refine
req-backlog
backlog-save
docs-review
diagnostics-docs
diagnostics-skills
diagnostics-promote
semantic-integrity-review
req-restructure-review
self-hosting repo
public command
repo-local command
repo-local skill
repo-internal
namespace
runtime projection
canonical source
source/projection
HOW it works now
internal normalize
normalize→classify
classify→eval
eval→judge
HITL
execute
quality metrics
品質メトリクス
deviation-check
workflow status
promoted artifact
配布対象リポジトリを指す旧英語表記
```

上記の英語語彙は、本文表現案ではなく検索対象文字列である。本文では、AgentDevFlow の文脈に沿って `RU候補`、`配布対象リポジトリ`、`コマンド体系`、`原本`、`配置先` などの自然な日本語へ書き直す。

識別子や検出ルールとして残す必要があるものは、例外理由を明確にし、現行仕様本文とは区別する。

### 12. 検証

変更後、少なくとも以下を実行する。

```bash
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
bun test .opencode/skills/repo-agentdev-integrity/scripts
```

併せて以下を確認する。

- active docs に旧語彙、旧構造、廃止済み機能の現行説明が残っていない。
- retired docs、検出ルール、negative example、code block 以外で旧語彙が残っていない。
- docs link が壊れていない。
- `docs/README.md`、`docs/DOC-MAP.md`、`docs/specs/README.md` の索引が実ファイルと一致している。
- command / skill / template と docs の説明が一致している。
- `case-run` と `case-close` の完了条件チェックボックス責務が矛盾していない。
- 品質メトリクスの未実装契約が残っていない。
- 新規または更新した docs-check rule に regression test がある。

## 完了条件

- `docs/*` 全体がスキャンされ、active docs は現行仕様だけを説明する状態になっている。
- `docs/specs/system.md` から `elevation-staging/archive/` と内部段階名データフローが消え、現行の intake / learning / inspect / backlog / req flow が RU候補と RU 生成の流れとして読みやすい日本語で説明されている。
- `docs/specs/quality-specs.md` と関連テンプレート・スキルから、実装で裏付けられない自動品質メトリクス契約が削除または現行実装に一致する形へ整理されている。
- `docs/specs/integrity-contracts.md` は旧前提比較ではなく、現在の整合性検査契約だけを説明している。
- `docs/specs/document-model.md` は文書種別・SPEC責務・トレース方針を読みやすく説明し、過剰な REQ-ID 注記や英語混じり表現が解消されている。
- `docs/README.md`、`docs/DOC-MAP.md`、guides、active REQ、active ADR が、再基準化後の用語・責務・現行仕様と矛盾していない。
- 必要な要件化は、既存 REQ への包括的な APPEND / UPDATE を中心に行われている。
- `req-define`、`req-save`、`case-run`、`case-close`、`inspect-docs`、`/repo/docs-check`、関連スキル・テンプレートに、同種問題を再発させない確認観点が組み込まれている。
- `repo-agentdev-integrity` の vocabulary registry / check rule / regression test に、今回の旧記述パターンが反映されている。
- 永続 docs に RU-ID を根拠として残していない。
- 検証コマンドと grep sweep の結果が PR 本文に記録されている。
