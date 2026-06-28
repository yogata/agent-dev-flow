# Vocabulary Registry

AgentDevFlow 管理下の文書で使用する正規語彙と旧語彙の対照表。docs-check（/repo/docs-check）は本レジストリに基づき旧語彙の残存を検出する。

## 目的

- Wave 1-2 で修正した不整合の再発を防止する
- 新規文書作成時に正規語彙を参照可能にする
- docs-check（/repo/docs-check）の旧語彙検出の根拠を一元管理する

## 除外コンテキスト

以下の文脈では旧語彙の言及が許容される（検出対象外）:

- `docs/requirements/retired/` 配下の retired REQ
- `docs/requirements/mapping-table.md` の移行表
- `docs/adr/` 内の ADR 履歴記述（廃止経緯の説明を含む）
- code block（` ``` ` で囲まれた領域）内の例示
- 検出ルール自体の記述（正規表現パターンの説明等）
- integrity-check テスト fixture

## コマンド名

IR-050（load_skills 誤指定検出）・IR-051（実行主体 skill 表記誤認検出）の対象コマンド名。`/` 先頭形式（command 名）は `load_skills` へ指定してはならず、委譲 prompt 内で `/ulw-loop Implement Issue #N: ...` 等の command 指定として扱う。

| コマンド名 | 種別 | 備考 |
|------------|------|------|
| `/agentdev/case-open` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/case-run` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/case-close` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/case-update` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/case-auto` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/req-define` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/req-save` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/spec-save` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/intake-capture` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/intake-from-github` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/intake-promote` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/learning-promote` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/backlog-review` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/inspect-docs` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/inspect-skills` | 公開 command | `/agentdev/*` 名前空間 |
| `/agentdev/inspect-promote` | 公開 command | `/agentdev/*` 名前空間 |
| `/repo/docs-check` | repo-local command | 自己ホストリポジトリ専用・配布対象外 |
| `/ulw-loop` | 外部 command | oh-my-openagent 提供・委譲 prompt 内で指定（`agentdev-*` プレフィックスを持たない） |
| `/ralph-loop` | 外部 command | oh-my-openagent 提供 |
| `/handoff` | 外部 command | oh-my-openagent 提供 |
| `/start-work` | 外部 command | oh-my-openagent 提供 |
| `/hyperplan` | 外部 command | oh-my-openagent 提供 |
| `/cancel-ralph` | 外部 command | oh-my-openagent 提供 |
| `/stop-continuation` | 外部 command | oh-my-openagent 提供 |
| `/refactor` | 外部 command | oh-my-openagent 提供 |

`load_skills=["..."]` へ指定してはならない識別子：上記 command 名全て。`agentdev-*` プレフィックスを持たない既知 command 名（`/ulw-loop`, `/ralph-loop` 等）も含む。

### 旧コマンド名対照（vocabulary）

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `/case-open` | `/agentdev/case-open` | bare slash form（REQ-0108-016, ADR-0005） |
| `/case-run` | `/agentdev/case-run` | bare slash form |
| `/case-close` | `/agentdev/case-close` | bare slash form |
| `/case-update` | `/agentdev/case-update` | bare slash form |
| `/req-define` | `/agentdev/req-define` | bare slash form |
| `/req-save` | `/agentdev/req-save` | bare slash form |
| `/integrity-check` | `/repo/docs-check` | bare slash form（repo-local command, not agentdev） |
| `/repo/integrity-check` | `/repo/docs-check` | renamed（REQ-0115-001, REQ-0115-039） |
| `/agentdev/req-restructure-review` | `/agentdev/inspect-docs` | 統合済み（REQ-0115-016 retired、Wave2 完了） |
| `/intake-capture` | `/agentdev/intake-capture` | bare slash form |
| `/intake-promote` | `/agentdev/intake-promote` | bare slash form（intake-review は廃止、機能は intake-promote に統合） |
| `/backlog-review` | `/agentdev/backlog-review` | bare slash form |
| `/backlog-save` | `/agentdev/backlog-review` | 廃止（REQ-0105-034/058: RU 生成は backlog-review に統合） |
| `/learning-promote` | `/agentdev/learning-promote` | bare slash form（learning-refine は廃止、機能は learning-promote に統合） |
| `/req-restructure-review` | `/agentdev/req-restructure-review` | bare slash form |
| `issue-req` | （廃止） | 旧 bare command → `/agentdev/req-save` |
| `issue-work` | （廃止） | 旧 bare command → `/agentdev/case-run` |
| `issue-close` | （廃止） | 旧 bare command → `/agentdev/case-close` |
| `issue-create` | （廃止） | 旧 bare command → `/agentdev/case-open` |
| `issue-update` | （廃止） | 旧 bare command → `/agentdev/case-update` |
| `issue-save-req` | （廃止） | 旧 bare command → `/agentdev/req-save` |
| `issue-backlog-create` | （廃止） | 旧 bare command → `/agentdev/backlog-save` |
| `tips-elevate` | （廃止） | 旧 bare command → `/agentdev/learning-promote` |
| `tips-refactor` | （廃止） | 旧 bare command → `/agentdev/req-restructure-review` |

## コマンドパス

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `.opencode/commands/issue/` | `.opencode/commands/agentdev/` | 旧 command path（ADR-0005） |
| `.opencode/commands/tips/` | `.opencode/commands/agentdev/` | 旧 command path |
| `commands/issue/` | `commands/agentdev/` | 旧 relative path |
| `commands/tips/` | `commands/agentdev/` | 旧 relative path |

## スキル名

IR-050・IR-051 の対象 skill 名（`agentdev-*` プレフィックス形式）。`load_skills=["..."]` へ指定可能な識別子。

| スキル名 | 備考 |
|----------|------|
| `agentdev-adr-file-manager` | ADR ファイル管理 |
| `agentdev-adr-guidelines` | ADR ガイドライン |
| `agentdev-architecture-advisory` | アーキテクチャ助言（req-define 事前確認） |
| `agentdev-backlog-integration` | backlog 統合 |
| `agentdev-case-run-execution-adapter` | case-run 外部実行アダプター |
| `agentdev-command-authoring` | command 作成支援 |
| `agentdev-command-creator` | command 生成 |
| `agentdev-conventional-commits` | conventional commits 規約 |
| `agentdev-doc-map` | DOC-MAP 管理 |
| `agentdev-doc-writing` | 文書執筆品質 |
| `agentdev-epic-tracker` | Epic 状態追跡 |
| `agentdev-gh-cli` | gh CLI 操作 |
| `agentdev-git-worktree` | git worktree 管理 |
| `agentdev-inspect-skills` | command/skill 参照妥当性検出 |
| `agentdev-intake-pipeline` | intake パイプライン |
| `agentdev-issue-management` | Issue 管理 |
| `agentdev-learning-capture` | learning 記録 |
| `agentdev-learning-pipeline` | learning パイプライン |
| `agentdev-quality-gates` | 品質ゲート QG-1〜QG-4 |
| `agentdev-req-analysis` | 要件分析 |
| `agentdev-req-file-manager` | REQ ファイル管理 |
| `agentdev-req-structure-diagnostics` | REQ 構造診断 |
| `agentdev-skill-authoring` | skill 作成支援 |
| `agentdev-workflow-lifecycle` | workflow lifecycle |
| `agentdev-workflow-orchestration` | workflow orchestration |
| `agentdev-workflow-routing` | workflow routing |
| `agentdev-workflow-templates` | workflow templates |
| `repo-agentdev-integrity` | repo-local 整合性検査（配布対象外・ADR-0020） |

### 旧スキル名対照（vocabulary）

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `issue-lifecycle` | `agentdev-workflow-lifecycle` | 旧 skill name |
| `issue-template-manager` | `agentdev-workflow-templates` | 旧 skill name |
| `tips-pipeline-orchestration` | `agentdev-workflow-orchestration` | 旧 skill name |
| `issue-completion-reporting` | `agentdev-workflow-reporting` | 廃止済み skill（REQ-0108-126） |
| `issue-post-review-routing` | `agentdev-workflow-routing` | 旧 skill name |
| `issue-work-orchestration` | `agentdev-workflow-orchestration` | 旧 skill name |

## サブエージェント名

IR-051（実行主体 skill 表記誤認検出）の対象 subagent 名。これらは command/harness ではなく「スキル」「skill」と表記してはならない。

| サブエージェント名 | 備考 |
|--------------------|------|
| `Sisyphus-Junior` | 実装担当サブエージェント（oh-my-openagent 提供） |
| `Atlas` | オーケストレーター（oh-my-openagent 提供） |
| `Sisyphus` | オーケストレーター（oh-my-openagent 提供） |
| `Oracle` | 読み取り専用診断・助言サブエージェント |
| `Prometheus` | 計画コンサルタントサブエージェント |
| `explore` | 探索専用サブエージェント（read-only） |
| `librarian` | ドキュメント検索専用サブエージェント（read-only） |

## ハーネス名

IR-051 の対象 harness 名。これらは「スキル」「skill」と表記してはならない。

| ハーネス名 | 備考 |
|------------|------|
| `oh-my-openagent` | OpenCode プラグイン・エージェント実行ハーネス（ADR-0114, ADR-0128） |
| `OpenCode` | エージェント実行環境本体 |

## IR-051 距離閾値（REQ-0145-007）

IR-051「実行主体 skill 表記誤認検出」の「一定文字距離内」判定閾値。既知 command 名・harness 名・subagent 名の出現位置から以下の範囲内に「スキル」「skill」表記がある場合、誤認として報告する。

| 項目 | 閾値 | 根拠 |
|------|------|------|
| 同一行内 | 0 行・同じ物理行 | 最も強い誤認シグナル。command名とskill表記が同一行にある場合は確実な誤認 |
| 隣接リスト項目 | 同一 `- ` / `* ` リスト内の前後1項目 | リスト形式での分類誤りを捕捉するため |
| 段落下 | 同一段落（空行で区切られない行グループ・最大3行） | 段落単位での文脈判断を可能にするため |

閾値を超える距離（別段落・4行以上離脱）での「スキル」「skill」表記は文脈独立とみなし、誤認シグナルから除外する。意味判断を要する境界ケースは inspect-skills（REQ-0125-010）・doc-writing（REQ-0140-027）が意味的診断を担う（3層検出構造・REQ-0145-008）。

## 語彙ポリシー（REQ-0102-024〜028, REQ-0115-044）

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| 旧規範語キーワード | 必達要件記述 | REQ 要件行は語彙の有無ではなく検証可能性で判定する（REQ-0102-024） |
| 旧推奨キーワード | 必達要件記述または推奨表現 | 必達要件として再定義できる場合のみ要件行に残す（REQ-0102-025） |
| 旧任意キーワード | 許可表現（「〜してよい」） | 許容仕様・設計余地・将来候補として扱う（REQ-0102-026） |
| 旧必須キーワード | 必達要件記述 | 検証可能な自然文として記述する（REQ-0102-027） |
| 括弧付き旧 marker | （不要、自然文で記述） | 旧 marker を除去し、必達要件または許可表現として記述する（REQ-0102-028） |
| 旧語彙ルール | 必達要件 | SPEC は新規要件ではなく現在仕様・契約記述に限定する（REQ-0102-024） |

除外: integrity rule 定義内の検出パターン説明、retired 文書、negative example、vocabulary-registry.md 自体

## 廃止済み概念

| 旧語彙 | 現行状態 | 備考 |
|--------|----------|------|
| `req-backlog` | 廃止（REQ-0105-038） | backlog-review フローに統合 |
| `docs/tips/` | 廃止 | docs/ に統合済み |
| `reference/` | `references/` | canonical は複数形（REQ-0103-013, REQ-0108-039） |
| `tips プール` | `learning プール` | learning セクションに統合 |
| `refactor時prune` | `promote時prune` | learning-promote コマンド（refine は promote 内部フェーズに統合） |
| `elevate時prune` | `promote時prune` | learning-promote コマンド |
| `refine時prune` | `promote時prune` | learning-refine は廃止、prune は learning-promote 内部で実行 |

## 完了報告フィールド

| フィールド名 | 備考 |
|-------------|------|
| `完了コマンド` | 必須（REQ-0107） |
| `対象` | 必須 |
| `結果` | 必須 |
| `検証結果` | 必須 |
| `git 永続化` | 必須 |
| `次のコマンド` | 必須 |

旧フィールド名 `次のステップ` は使用禁止（`次のコマンド` が正規）。

## REQ 範囲表記

| 正規値 | 備考 |
|--------|------|
| `REQ-0101` 〜 `REQ-0151`（REQ-0111/0115/0116/0117/0118/0120/0121/0122 は retired） | 2026-06-25 時点の active REQ 範囲（43件） |

AGENTS.md、system.md、ガイド内の REQ 範囲表記は実際の active REQ ファイル数と一致させること。

## 旧分類用語

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `retained` | `migrated` / `retired-no-successor` / `historical-only` | 旧 REQ 分類（mapping-table.md の status） |
| `partially superseded` | `migrated` | mapping-table.md の正規 status |
| `superseded` | `migrated` / `retired-no-successor` | 旧分類 |

## Capture 語彙

| 旧語彙 | 現行語彙 | 備考 |
|--------|----------|------|
| `Intake候補` | `Capture候補` | PR template セクション名変更（REQ-0105-077） |
| `Findings / Intake候補` | `Findings / Capture候補` | PR セクション見出し（REQ-0105-077） |

## 文意品質検出対象語（IR-045）

docs 日本語表現・文意整合検査（IR-045, REQ-0140）の検出対象語。これらは「旧語彙」ではなく、文脈に応じて日本語説明の併記・許可/禁止操作の明示・具体許可操作への置換を要する英字混じり抽象用語。固定識別子（enum 値・frontmatter field・ファイル名等）として原語を維持する場合は、初出位置に日本語注記を付与する。

| 検出語 | 扱い | 備考 |
|--------|------|------|
| `read-only` / `Read-Only` / `read_only` | 文脈分解: 参照専用入力・検査対象を直接修正しない診断・保存更新を親に残す委譲・検出報告型。一律「読み取り専用」にしない（REQ-0140-004） | 実際に出力生成・commit・push を行う場合は `read-only` 表記を撤回し許可/禁止操作を明記（REQ-0140-005）。委譲定義 YAML の `side_effect_boundary` に包括値としては使用禁止（REQ-0140-011） |
| `read-only-diagnostic` | 検査対象を直接修正しない診断型（識別子として維持可、初出に日本語注記） | 実装分類の識別子。`read-only` 系表記と同様に許可/禁止操作の明示を要する |
| `advisor` / `advisory` | 責務分解: 誰が最終判断するか・何を返すかを明記（REQ-0140-006） | 助言・推奨を返す主体と最終判断主体（多くは親コマンド）を分離 |
| `architecture-affecting` | 「ADR判断が必要な変更」または「ADR要否確認が必要な変更」（REQ-0140-012） | 「アーキテクチャに影響する」のみで使用しない |
| `Architecture advisory gate` | 「ADR要否確認ゲート」（REQ-0140-013） | ADR 要否を確認しガードする役割 |

除外: 識別子として原語を維持しつつ初出に日本語注記がある場合、code block 内、検出ルール自体の記述、retired 文書、forbidden-phrases.md / SKILL.md の検出ルール説明自体。

## 検出パターン縮小（REQ-0108-262）

docs-check の機械化原則徹底（REQ-0108-056/254/261/262）に基づき、LEGACY_PATTERNS / BARE_SLASH_COMMAND_PATTERNS から以下の検出パターンを削除した。本レジストリの対照表（旧コマンド名・旧コマンドパス・旧スキル名・廃止済み概念）は歴史参照として維持するが、docs-check の検出対象からは除外した。

- 旧コマンドパス（`.opencode/commands/issue/`、`.opencode/commands/tips/`、`commands/issue/`、`commands/tips/`）
- 旧ハイフン区切りスキル名（`issue-lifecycle`、`issue-template-manager`、`tips-pipeline-orchestration`、`issue-completion-reporting`、`issue-post-review-routing`、`issue-work-orchestration`）
- 旧データパス（`docs/tips/`）
- 旧用語（`tips プール`、`refactor時prune`、`elevate時prune`）
- snake_case 系コマンド名（`integrity_check`、`req_define`、`case_run/open/close`）
- 廃止済み bare slash コマンド（`/req-restructure-review`、`/intake-review`、`/backlog-save`、`/learning-refine`）

これらは retired 配下でのみ実在が確認済みであり、現行 docs での誤使用リスクが解消されたため検出対象から除外した。新規検出時の復活運用（REQ-0145-003）に従い、現行 docs で再出現した場合は検出パターンを復活させる。

## integrity rule カタログ英語普通名詞（正規使用）

integrity-rule-catalog.md および rules/ 配下で使用される英語普通名詞。IR-044（英字普通名詞 drift）の検出対象外（正規使用許可）（RU-0007）。

| 英語普通名詞 | 用途 | 備考 |
|------------|------|------|
| `finding` | 検出事項 | inspect-docs/inspect-skills の検出結果単位 |
| `drift` | 文書の drift | REQ/SPEC の不一致、陳腐化 |
| `regression` | 回帰 | regression test、回帰検出 |
| `gate` | 品質ゲート | QG-1〜QG-4、gate level |
| `severity` | 重要度 | strict / heuristic / observation |
| `category` | カテゴリ | IR の分類 |
| `schema` | スキーマ | IR のフィールド定義 |
| `observation` | 観察 | severity の1つ |
| `baseline` | 基準 | baseline_status |
| `provider` | 提供者 | 外部エージェント提供者 |
| `variant` | バリアント | テンプレートのバリアント |
| `fixture` | フィクスチャ | テスト fixture |

## IR-055 runtime-unresolved-reference 対照（REQ-0108-263/264）

配布物（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）内の導入先未解決参照検出パターン。consumer 環境で解決できない参照を機械的パターンマッチングで検出する。検出対象パターンと severity 分類は [rules/IR-055-runtime-unresolved-reference.md](../../../docs/specs/integrity/rules/IR-055-runtime-unresolved-reference.md) が原本。

| パターン | severity | 備考 |
|----------|----------|------|
| `REQ-\d{4}` | strict | agent-dev-flow 本体内部 REQ ID。consumer 配布物に残らない |
| `REQ-\d{4}-\d{3}` | strict | REQ サブアイテム ID |
| `ADR-\d{4}` | strict | agent-dev-flow 本体内部 ADR ID |
| `src/opencode/` | strict | 原本側リポジトリパス。consumer 環境に存在しない |
| `/repo/` | strict | repo-local command 参照（`/repo/docs-check` 等） |
| `repo-*` | strict | repo-local skill 参照（`repo-agentdev-integrity` 等） |
| `docs/specs/` | heuristic | 本体内部 docs 参照。consumer 環境に存在しない可能性が高い |
| `docs/guides/` | heuristic | 本体内部 docs 参照 |
| `github.com/yogata/agent-dev-flow/(blob|tree|issues|pull)/` | heuristic | 本体リポジトリ固有 URL |
| `file.md#L<N>` | heuristic | 行番号付き参照。本体側の改修で容易に陳腐化する |

exemption: code block 内部、template placeholder（`{xxx}`）、`vocabulary-registry.md` / `integrity-rule-catalog.md` / `rules/IR-055-*` 自身は正当使用として検出対象外とする（SPEC IR-055「exemption」参照）。

段階導入（REQ-0108-264）: baseline 既知違反は `info`（報告のみ、fail なし）。新規違反は strict→`ng`、heuristic→`warning`（delta guard / impact guard で fail）。baseline ファイル（`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）は `--update-ir055-baseline` で再生成する。baseline 0 到達後に full audit を fail gate 化する。

## メンテナンス

- 新規語彙の追加・旧語彙の変更は docs-check（/repo/docs-check）の検出パターンと同期すること
- REQ-0108-055 に基づき、検査ルール変更時は regression fixture を追加すること
- 本レジストリは `src/opencode/skills/repo-agentdev-integrity/references/` 配下に配置し、`.opencode/skills/repo-agentdev-integrity/references/` へ投射する。canonical は source 側とする
