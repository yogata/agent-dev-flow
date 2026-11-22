---
draft_type: req_draft
topic_slug: adf-token-efficiency
status: draft
created_at: "2026-11-23T00:03:04+09:00"
---

# draft-data

```yaml
work_type: feature
scale: large
summary: ADF 本体のワークフローのトークン消費を、委譲サマリ、工程境界でのセッション分割、SKILL 本文のスリム化、読取手順の集約と効果検証の四つの独立作業単位で改善する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

source_input:
  path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-token-efficiency-20261122.md
  adoption_basis: 利用者が唯一の入力として明示し、壁打ち済みの合意内容・対象範囲・対象外・禁止事項を保持するよう指示した。
  scope_of_this_run: 参照専用入力からの要件定義ドラフト生成・保存のみ。他 RU を処理せず、後続工程は起動しない。

agreed_items:
  - id: AG-001
    content: |
      作業単位 1 — 委譲結果の構造化サマリとサイズ上限。委譲プロンプトとサブエージェント返却契約で、`background_output` 等を通じて子から親へ返す最終本文を構造化サマリ（上限の目安 3〜4 KB 以内）に制限する。
      必須項目は、ステータス（`completed` / `blocked` / `failed`）、判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果（pass/fail 件数）、未達事項/ブロッカー、詳細成果物パスの八つに絞る。
      長大な調査メモ、全ファイル一覧、生ログ、`git diff` 全文、詳細検査表は最終本文に貼らず、`.agentdev/` 配下の一時/成果物ファイルまたは追跡 Issue コメントへ退避し、ファイルパス/URL のみを渡す。親は子結果の全文を再読込せず、サマリと必要なゲート確認ファイルだけで次工程を判定する。
      対象は `agentdev-case-run-execution-adapter` の `SKILL.md` と `references/harness-delegation.md`、`agentdev-workflow-case-auto` / `case-run` / `case-close` / `backlog-auto` の `SKILL.md` の受領・返却契約、対応する `docs/designs/commands/` と `docs/designs/responsibilities/` の設計書。
      受け入れ条件: 雛形・返却契約にサマリ上限と詳細退避規則を明記する。既存必須識別子 `REQ-048` / `REQ-003` / `REQ-007` との対応は正規 Design と traceability sidecar 側に保持し、配布物本文に直書きしない。既存委譲契約テスト、`check_integrity`、`bun test ./src/` が合格する。
  - id: AG-002
    content: |
      作業単位 2 — 長大な `backlog-auto` と複数 Issue の `case-auto` で、`.agentdev/`、git、GitHub Issue/PR の永続状態を境界とした工程・バッチのチェックポイントとハンドオフ出力を定義する。境界例は inspect/promote 完了、backlog-review/RU 生成完了、req-define 完了、case-auto バッチ投入。全工程・全件を一つのセッションに収めなくても、新規セッションで冪等に継続できること。
      単一ファイルの小規模確認や 1〜2 回のコマンドで完結する調査・検査は、新規サブエージェントを起動しない直接実行とし、委譲との閾値を明記して 1 案件あたりの起動数を抑える。並列委譲間の別ターン `bash: sleep 10` は、Z.AI/モデル provider への瞬間バースト抑止を保ち、(a) 複数起動のバッチ間最小待機やスクリプト側待機への統合、または (b) 他処理と組み合わせた一ターン完結で、不要な待機単独往復を削減する。
      対象は `agentdev-workflow-backlog-auto` / `case-auto` / `case-ready` の `SKILL.md`、adapter の `references/harness-delegation.md`、`src/common/commands/agentdev/backlog-auto.md` と `case-auto.md`、対応する `docs/designs/commands/` の設計書。
      受け入れ条件: 引き継ぐ識別子・状態ファイル・Issue/PR 番号、停止と新規セッションからの冪等再開を明文化し、`REQ-034` / `REQ-041` / `REQ-108` の完了条件と安全ゲートを維持する。起動間隔記述と関連テスト・整合性検査を更新し、`check_integrity` と `bun test ./src/` が合格する。
  - id: AG-003
    content: |
      作業単位 3 — 第一対象の九つの `SKILL.md` 本文には入口判定、必須ステップ順序、禁止事項、ゲート条件、`references/` への分岐案内の骨格だけを残す。1 ファイルあたりの目安は 8〜10 KB 以下（現状比 50〜75% 削減）。例外処理、障害復旧、稀なエッジケース、詳細例/テンプレートは既存または新規の `references/` に分離し、該当条件でのみ `read` する。
      第一対象は `agentdev-workflow-case-auto`、`agentdev-workflow-case-close`、`agentdev-workflow-phase-artifacts-update`、`agentdev-workflow-case-run`、`agentdev-case-run-execution-adapter`、`agentdev-traceability`、`agentdev-workflow-backlog-auto`、`agentdev-workflow-case-ready`、`agentdev-workflow-case-open`。
      `.opencode/skills/repo-agentdev-integrity/scripts/` の `lint_skills` に、`#4200`（`758cd6b6c`）の frontmatter `description` 集約予算と整合する本文サイズ予算検査を追加する。既存閾値と整合させ、`src/common/skills/` から `.opencode/skills/` への投影（junction 対象と `repo-agentdev-integrity` の手動同期を含む）および `check_integrity` の全ルールを維持する。
      受け入れ条件: 必須規範、禁止事項、ゲート判定を本文または明示リンク先に欠落なく保全する。九つの本文合計を基線の約 255.6 KB から 50% 以上削減する。`lint_skills`、`check_integrity`、`bun test ./src/` が合格する。
  - id: AG-004
    content: |
      作業単位 4 — `case-open` / `case-run` / `case-close` / `backlog-review` / `req-define` 等の定型状態確認を、既存のスキル内 `scripts/` のサブコマンド/スクリプトに集約し、一回の `bash` 実行で簡潔な構造化 JSON サマリを得る。対象は git HEAD/branch/status/worktree 一覧、対象ファイル群の存在/SHA256/行数、`.agentdev/` の滞留、Issue/PR 状態の一括取得。`agentdev-gh-write-guard` の書き込み禁止境界と `REQ-095` の呼出側規律に従う読取範囲に限る。
      スクリプト標準出力と `read` 指示は全件ダンプを避け、件数上限、`offset`/`limit` の範囲指定、`--jq` で必要フィールドに絞ることを既定とし、出力は目安 10〜15 KB 以内。OpenCode の `tool-output` 自動切り詰めと後続再読込を誘発しない。
      `REQ-048` に従い、読み取り専用の `opencode.db` 生履歴から、1 セッションあたり呼出数、Turn-1 トークン数、平均コンテキストサイズ、1 ターンあたりツール数、`background_output` 平均バイト数、`tool-output` 再読込回数を改善前後で比較・評価できる計測クエリ/レポート手順を整備する。
      受け入れ条件: 定型状態確認の単発サマリ化が `gh` 書込迂回禁止、`REQ-095`、`REQ-060` の `bun test ./` 規約と矛盾しない。複合スクリプトと出力サイズ制限の単体テストを追加し、`check_integrity` と `bun test ./src/` が合格する。不要な永続フィールド・独自 DB を新設せず読み取り専用で測定できる。永続スキーマ変更が必要と判明した場合の判断には `DEC-001` 境界が適用され、この入力を変更の承認に転用しない。
  - id: AG-005
    content: |
      対象はステップ 3 の ADF リポジトリ側のワークフロー・スキル・コマンド・機械手順。完了済みのステップ 1・2 の OpenCode（`opencode.jsonc`、`dcp.jsonc`、`loop-guard.ts`）/Hermes（`config.yaml`、`token-hygiene`）のホスト設定・プラグイン、`oh-my-openagent` 本体のプロンプト・フック（`todowrite` 単体ターンを含む）、`#4200`（`758cd6b6c`）で完了済みの `SKILL.md` frontmatter `description` 短縮の再実施は対象外。
      ADF 側で `todowrite` 自体を直接改修せず、ワークフロー記述で毎ステップの細かな ToDo 更新を誘発しない配慮を維持する。既存の QG-1〜QG-4、`check_integrity`、`bun test ./src/` および人間判断境界（HITL）の緩和・省略は禁止する。
  - id: AG-006
    content: |
      4 作業単位は独立して要件化・実装できる。削減効果の見込みと変更の波及を考慮し、推奨着手順は作業単位 1 → 3 → 4 → 2。順序は必須依存ではなく、一括要件化後にファイル競合しない範囲で並列投入してもよい。
      正規の投入経路は ADF リポジトリの OpenCode（常駐 `ocenv opencode serve` 経由）または Hermes 監督経路での `req-define` → `case-auto`。ただしこの依頼では要件定義ドラフトを保存して停止する。RU/Case の生成や後続工程の起動を含まない。

source_evidence:
  baseline: "指定入力による 2026-09-22〜2026-11-22 の観測。調査時点の HEAD: 758cd6b6c。実測は本工程で再取得していない。"
  findings:
    - 全 GLM 消費 28.394B / 2 か月（月 14.20B）のうち ADF 関連は 24.619B（月 12.31B、86.7%）。ステップ 3 の想定改善寄与率 45〜50% は仮説であり、達成済み数値ではない。
    - OpenCode の ADF GLM は 108,330 API 呼出、19.417B tokens（非キャッシュ入力 572.0M、Cache Read 18.730B、出力 50.5M、推論 64.5M、ヒット率 97.04%）。平均コンテキスト 178.2K、200K 超 53.0%（10.30B）、250K 超 33.6%（6.52B、平均 338.8K）。
    - 子セッションは 85,273 呼出、14.450B（74.4%）。Sisyphus-Junior 単独で 12.853B（66.2%）。単一ルート内に 30〜104 子セッション、2,500〜5,030 API 呼出、最大 1.192B。`background_output` は 1,819 回・37.2 MB、平均約 20 KB、最大 51 KB。
    - 投影済み `SKILL.md` は 56 件・772.9 KB、skill 注入量は 11.8 MB。入力が挙げた対象九つのサイズは 42.3 / 32.1 / 32.1 / 30.6 / 28.1 / 25.4 / 22.5 / 22.1 / 20.3 KB（合計約 255.6 KB、AG-003 の順）。
    - 146,571 ツール呼出、平均 1.35 ツール/ターン。単独 `bash` は 64,703 回・9.792B、単独 `agentdev_gh` は 12,530 回・1.293B、`read` は 28,002 回・284.7 MB 注入。切り詰め出力の再読込は 706 回。待機コマンドは 815 回・0.188B。単独 `todowrite` は 4,048 回・0.672B、`src/common/` には同指示なしと入力が報告している。
  source_anchors: [REQ-003, REQ-005, REQ-006, REQ-007, REQ-030, REQ-031, REQ-032, REQ-033, REQ-034, REQ-041, REQ-048, REQ-095, REQ-108, REQ-114, REQ-123]
  anchor_usage: 入力が挙げた関連 REQ の記録。現行性の確認結果や変更対象の指定とは区別する。
  prior_measures: ステップ 1 の OpenCode コンテキスト上限 220000、DCP 無効化とネイティブ pruning、Hermes の threshold_tokens 180000・lean tail・hard stop・background review 無効化、およびステップ 2 の OpenCode loop-guard と Hermes token-hygiene は実施済み。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: 'new:adf-token-efficiency'
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      ---
      id: REQ-125
      title: ADF ワークフローのトークン消費構造改善
      created: '2026-11-23'
      updated: '2026-11-23'
      ---

      ## 目的

      委譲結果、長時間の親セッション、実行時に読み込むスキル本文、定型確認の往復に起因するコンテキスト消費を、既存の安全性と品質を維持して削減する。観測と評価は REQ-048 に従う。

      ## 要件

      | ID | 要件 | 検証 |
      |---|---|---|
      | REQ-125-001 | 子から親への最終返却を、上限目安 3〜4 KB 以内の構造化サマリに制限する。親はサマリと該当ゲートに必要な証拠だけを参照して進行を判定できること。詳細は既存権限で参照できる場所に退避し、親への返却本文には参照のみを含めること | TS-001 |
      | REQ-125-002 | backlog-auto と複数 Issue の case-auto は、工程・投入の境界で安全に停止でき、新しいセッションから正規の永続状態を根拠に、未完了部分を重複なく継続できること。既存の工程順、完了条件、安全ゲートおよび一気通貫経路を維持すること | TS-002 |
      | REQ-125-003 | 小規模な確認は直接行い、並列委譲ではモデル提供者への瞬間的な起動集中を抑制しつつ、待機だけの往復をなくすこと。必要な委譲、独立した検証、並列実行の安全境界を維持すること | TS-003 |
      | REQ-125-004 | 対象の九つの SKILL.md 本文を 1 ファイルあたり 8〜10 KB 以下を目安に縮小し、指定基線から本文合計を 50% 以上削減すること。明示リンク先も含めて必須規範、禁止事項、ゲートを欠落なく保持し、詳細は該当する場合だけ参照すること | TS-004 |
      | REQ-125-005 | SKILL.md の本文サイズ検査を lint_skills で利用できること。既存の description 予算検査、配布物の投影・同期および整合性検査の規則を維持すること | TS-004 |
      | REQ-125-006 | 定型の状態確認は読取専用の単発処理で構造化サマリとして得られ、既定出力は全件表示や切り詰め後の再読込を要しないこと。出力上限の目安は 10〜15 KB 以内とし、GitHub の書込み境界・読取時の確認規律を維持すること | TS-005 |
      | REQ-125-007 | OpenCode の生実行履歴を読み取り専用で利用し、改善前後で六つの指定指標を比較できること。観測のために不要な永続フィールドや独自 DB を追加しないこと | TS-006 |
      | REQ-125-008 | 品質ゲートと人間判断の境界を維持し、毎工程で細かな ToDo 更新を誘発しないワークフローとすること | TS-007 |

      ## 適用範囲

      対象は ADF リポジトリの委譲契約、backlog-auto と複数 Issue の case-auto のセッション境界、指定九スキルの本文、定型読取の集約と効果測定。既存の REQ-003、REQ-007、REQ-034、REQ-041、REQ-048、REQ-095、REQ-108、REQ-114 の境界を維持する。

      対象外: OpenCode の opencode.jsonc・dcp.jsonc・loop-guard.ts と Hermes の config.yaml・token-hygiene、OmO 本体のプロンプト・フックと todowrite 単体ターンの直接改修、frontmatter description 短縮の再実施、QG-1〜QG-4・check_integrity・bun test ./src/・HITL の緩和または省略。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/workflows/delegation-contracts.md
    target_area: '## 親セッション向け委譲結果サマリ'
    placement: before_anchor
    anchor: '## 委譲種別（delegation_type 8 種）'
    source_items: [AG-001, AG-002]
    content: |
      ## 親セッション向け委譲結果サマリ

      子の最終本文は、ステータス（`completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目で構成し、UTF-8 本文の上限目安を 3〜4 KB 以内とする。該当のない項目はその旨を記し、未確認の結果を成功に置換しない。

      この報告用ステータスは、正規の委譲実行結果 `completed-pr`、`blocked`、`failed`、`delegation-unavailable` を変更しない。親は正規結果と必要な証拠を別に扱い、子の返却なしに起動不能を確定する場合は既存契約に従う。サマリの `completed` から PR 完了やゲート合格を導出しない。

      | 実行主体 | 変更後の責務 |
      |---|---|
      | Command | 公開入口と再開可能な出力契約を示す |
      | Adapter Skill | 委譲プロンプトと返却を接続し、正規結果とサマリの区別を保つ |
      | Subagent | 許可された操作だけを行い、最終本文をサマリに限定する |
      | Harness | 並列起動、起動時刻制御および結果転送を担う |

      親の Workflow Skill が進行とゲートを判定する。単一ファイルの小規模確認または一〜二回のコマンドで完結する調査・検査は直接実行し、既存契約で必須の委譲・独立検証にはこの基準を適用しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: '## 委譲の詳細と原文の参照'
    placement: before_anchor
    anchor: '## サブエージェント委譲契約'
    source_items: [AG-001]
    content: |
      ## 委譲の詳細と原文の参照

      長大な調査メモ、全ファイル一覧、生ログ、git diff 全文、詳細検査表は、既存権限に従い `.agentdev/` 配下の一時/成果物ファイルまたは追跡 Issue コメントへ退避し、返却サマリにはパスまたは URL のみを載せる。書込み禁止型では退避を親の許可された操作とし、子に権限を追加しない。

      原文が必須の成果物とゲート証拠は、権威ある既存の受渡し経路から原文のまま取得できること。親は該当ゲートの確認に必要なファイルだけを読み、子の全文やセッション履歴を再読込しない。サマリや参照先の存在だけで必須証拠を満たしたことにしない。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/case-run.md
    target_area: '## 委譲結果サマリの受領'
    placement: before_anchor
    anchor: '## 出力'
    source_items: [AG-001]
    content: |
      ## 委譲結果サマリの受領

      実行担当の最終本文は [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) として受領する。実行状態の判定・前置/最終ゲートは従来どおり正規結果と必須証拠に基づき、詳細確認では該当する参照先だけを読む。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/commands/case-close.md
    target_area: '## 完了判定と委譲結果サマリ'
    placement: before_anchor
    anchor: '## 出力'
    source_items: [AG-001]
    content: |
      ## 完了判定と委譲結果サマリ

      子への委譲と親への返却には [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) を適用する。QG-4 を含む完了判定の確認対象は既存の正規証拠とし、子の判定や要約で独立再検査を代替しない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/commands/case-auto.md
    target_area: '## 工程・投入境界のハンドオフ'
    placement: before_anchor
    anchor: '## 停止状態'
    source_items: [AG-001, AG-002]
    content: |
      ## 工程・投入境界のハンドオフ

      複数 Issue の工程境界または投入バッチ境界では、起動時対象の安定識別子、Root Case、関連 Issue/PR 番号、適用可能な `.agentdev/` 状態ファイルと git 側の参照、再開入口を引き渡す。新規セッションは当該正規状態から最早の未収束段階を再構成し、完了済み対象を再実行せず、稼働中のタスクを二重起動しない。case-ready 後の再開は削除された draft/RU に依存しない。実行中や未確認を収束と扱わず、ハンドオフを完了報告に置換しない。

      工程の子結果には [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) を使う。待機は現行の起動間隔、最初の起動、共有枠およびスロット型補充を維持し、既存処理との同一ターンまたは実行側スケジューリングに組み合わせる。固定バッチの全件完了待ち、同時一括起動、同期逐次フォールバックに切り替えない。
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/commands/backlog-auto.md
    target_area: '## 工程境界チェックポイント'
    placement: before_anchor
    anchor: '## 出力'
    source_items: [AG-001, AG-002]
    content: |
      ## 工程境界チェックポイント

      inspect/promote 収束後、backlog-review/RU 生成後、req-define 完了後、case-auto バッチ投入の各境界で、成立した永続状態に対応するハンドオフを出力できる。入力集合または一式識別子、成立を裏付ける既存ファイルと `set-state`（作成済みの場合）、git の参照、関連 Issue/PR 番号、既存の再開入口を含める。子の詳細は [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) から必要な範囲だけ参照する。

      新規セッションでは既存の証拠と正規状態を突合し、未完了部分のみを冪等に継続する。昇格の合流、承認、一式完了判定、リリース条件を保ち、通常の一回起動に手動コマンド入力を追加しない。チェックポイントは終了済みの証拠でも、新しい工程状態の正本でもない。
  - id: ACT-DESIGN-007
    artifact: design
    operation: append
    target: docs/designs/workflows/workflow-skill-model.md
    target_area: '## 実行時 SKILL 本文と条件付き参照'
    placement: before_anchor
    anchor: '## artifact-contracts.md からの委譲'
    source_items: [AG-003]
    content: |
      ## 実行時 SKILL 本文と条件付き参照

      対象の本文は入口判定、必須ステップ順序、禁止事項、ゲート条件、詳細参照の発火条件とリンクを保持する。例外処理、復旧、稀なエッジケース、詳細例とテンプレートは、対応する `references/` に置き、該当時だけ読む。通常経路の一括読込や参照先への規範の置き忘れを生じさせない。

      `lint_skills` は frontmatter と分離した本文の UTF-8 バイト数を検査し、目安の上端 10 KB を超える場合を本文予算の警告として示す。既存の description の個別・集約予算と警告契約を変更せず、この警告を新たな工程停止条件にしない。正本と投影は現在の同期方式を維持する。
  - id: ACT-DESIGN-008
    artifact: design
    operation: append
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: '## 定型状態確認と実行効果の観測'
    placement: before_anchor
    anchor: '## Script 所有権と委譲契約'
    source_items: [AG-004]
    content: |
      ## 定型状態確認と実行効果の観測

      定型の git・ファイル・ADF 滞留・Issue/PR 状態は、既存スキルの scripts 配下から一回の bash 実行で構造化 JSON として集約する。対象、件数、および部分結果と取得不能を区別できる出力とし、内容は件数上限・`offset`/`limit`・`--jq` による必要フィールド限定を既定に 10〜15 KB 以内を目安とする。不完全または空の検索結果を対象なしや成功の証拠にしない。既存 Custom Tool の書込み境界と読取補完規律を維持し、公開スクリプト入口は追加しない。

      OpenCode 固有の効果測定はリポジトリの観測手順として分離する。`opencode.db` は読取専用で開き、セッションあたり呼出数、Turn-1 トークン数、平均コンテキストサイズ、ターンあたりツール数、`background_output` 平均バイト数、`tool-output` 再読込回数を同じ定義・集計条件で前後比較する。比較範囲、取得不能、他施策の影響を区別し、必要な証跡は既存 Report/Issue を使う。

conflict_resolutions:
  - id: CR-001
    conflict: サマリの 3 状態、原文返却・副作用境界、実行結果の 4 状態が混同される可能性。
    resolution: REQ-003-003/004/011/012 の正規情報は維持し、新規 Design ではサマリと原文・正規結果を別扱いにする。副作用の有無は判定要約に含める。
  - id: CR-002
    conflict: セッション分割による完了判定、並列補充、一気通貫実行の変更可能性。
    resolution: REQ-034/041/108/114 と DEC-011/038/039/042/051/055 に従い、チェックポイントは任意の停止・中断回復からの既存経路へ接続する。起動間隔は実装手段だけを見直す。
  - id: CR-003
    conflict: 本文検査・読取集約・観測が新しいゲート、公開入口、永続スキーマになる可能性。
    resolution: REQ-048/050/095 と DEC-001/021/049/067 に従い、既存 lint の警告、内部読取処理、読取専用分析とする。REQ-ID は正規 Design と traceability 側で保持し、配布物への混入を防ぐ。

definition_assessment:
  operation_basis: REQ-003/034/041/048/114 は既存の権限・工程・観測規範を所有し、今回の数値目標と配布資産横断の改善義務は未所有。REQ-123 は特定の巨大 Design 等が対象。意味変更となる既存 REQ 行の置換はせず、新規 REQ と既存 Design への追記に分けた。採番は保存工程で決定し、REQ-125 は現在の候補番号。
  decision: 新規 Decision なし。既存の権威、起動、公開境界を維持する運用仕様と設計への具体化であり、既存 Decision の置換なし。
  advisory: 既存文書で裏付けた権限・4 状態・一気通貫・起動間隔・配布境界を採用。新規硬性ゲート、強制的な毎回分割、4 状態の変更は不採用。利用者判断事項・ブロッカーなし。
  scale_basis: 九つの SKILL.md、二つの公開入口および横断 Design・スクリプトに及ぶため影響ファイルは 10 超。独立 4 単位の分解は入力の合意どおり。
  verification_policy: 全新規要件行に検証を対応させた。検証任意としての traceability ポリシー追加は不要。

operation_units:
  - {ou_id: OU-001, target_req: REQ-125, operation: create, scale: large, depends_on: [], recommended_order: 1}
  - {ou_id: OU-002, target_design: docs/designs/workflows/delegation-contracts.md, operation: append, scale: standard, depends_on: [], recommended_order: 2}
  - {ou_id: OU-003, target_design: docs/designs/responsibilities/artifact-contracts.md, operation: append, scale: standard, depends_on: [], recommended_order: 3}
  - {ou_id: OU-004, target_design: docs/designs/commands/case-run.md, operation: append, scale: standard, depends_on: [], recommended_order: 4}
  - {ou_id: OU-005, target_design: docs/designs/commands/case-close.md, operation: append, scale: standard, depends_on: [], recommended_order: 5}
  - {ou_id: OU-006, target_design: docs/designs/commands/case-auto.md, operation: append, scale: standard, depends_on: [], recommended_order: 6}
  - {ou_id: OU-007, target_design: docs/designs/commands/backlog-auto.md, operation: append, scale: standard, depends_on: [], recommended_order: 7}
  - {ou_id: OU-008, target_design: docs/designs/workflows/workflow-skill-model.md, operation: append, scale: standard, depends_on: [], recommended_order: 8}
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      対象 adapter と四つの workflow で、短い結果、長い詳細付き結果、および起動不能を既存委譲契約テストで確認する。返却本文の UTF-8 バイト数、退避先の原文・権限、親の参照範囲、Design と sidecar 上の REQ-048/003/007 を確認し、check_integrity と bun test ./src/ を実行する。
    pass_criteria: |
      - [ ] 雛形と返却契約が八項目、上限目安 3〜4 KB 以内、詳細のファイル/Issue 退避を明記し、代表結果がその上限目安内である。
      - [ ] 長大な詳細は返却本文に含まれず、親のゲート確認は必要な原文・証拠に到達し、既存権限と 4 状態を保つ。
      - [ ] 正規 Design と sidecar 側で REQ-048・REQ-003・REQ-007 との対応に欠落がなく、配布物本文への当該 ID の混入は 0 件。
      - [ ] 既存委譲契約テスト、check_integrity、bun test ./src/ が合格する。
    on_failure: fix-and-reverify — 返却・退避・証拠の経路を修正し、該当状態を再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      backlog-auto の対象境界および複数 Issue の case-auto の各境界で中断し、新しいセッションから既存入口で再開する代表検証を行う。同じ証拠で通常の連続経路と突合し、稼働中・部分失敗・不足状態についても確認する。
    pass_criteria: |
      - [ ] 引継ぎ識別子・状態ファイル・Issue/PR 番号、停止点と新規セッションからの冪等な再開手順が明文化される。
      - [ ] 完了済み操作の重複および実行中 Issue の二重起動が各 0 件。REQ-034/041/108 と既存の一気通貫経路の完了条件・安全ゲートが保たれる。
    on_failure: fix-and-reverify — 引継ぎと状態照合を修正し、対象境界の検証を再実行する。
  - id: TS-003
    target_item: AG-002
    verification: |
      小規模確認、必須委譲、一件起動・複数起動・起動失敗で、呼出と起動時刻を確認する。harness-delegation.md の起動間隔規定、関連テスト・整合性検査の更新を確認し、check_integrity と bun test ./src/ を実行する。
    pass_criteria: |
      - [ ] 直接実行の閾値が記載され、該当確認の新規子起動は 0 件、必須委譲の省略は 0 件である。
      - [ ] 複数起動では現行の間隔と並列性を維持し、別ターンの sleep 10 専用往復を必要としない。
      - [ ] 起動間隔記述と関連検証が更新され、check_integrity と bun test ./src/ が合格する。
    on_failure: fix-and-reverify — 直接実行基準または待機の組み込みを修正し、時刻と各検証を再確認する。
  - id: TS-004
    target_item: AG-003
    verification: |
      入力の基準版 758cd6b6c と変更後の九つの正本を、frontmatter を除く同一の本文範囲・UTF-8 バイト数で測り、指定基線の約 255.6 KB との対応を確認して削減率を計算する。集計条件や丸めによる差は記録し、比較不能なら別の基線に置き換えない。各必須規範、禁止事項、ゲートを本文と明示リンク先へ対応付け、通常経路と参照発火時の到達性を確認する。lint_skills の本文予算、description 予算、junction・手動同期後の投影を検証し、lint_skills、check_integrity、bun test ./src/ を実行する。
    pass_criteria: |
      - [ ] 本文の 1 ファイル 8〜10 KB 以下の目安と実測値が確認でき、同一条件で再取得した基線が指定基線約 255.6 KB と対応し、九つの合計がその基線から 50% 以上減少する。基線が確認できなければ削減率を合格にしない。
      - [ ] 必須規範・禁止事項・ゲートの欠落および切れた参照は各 0 件。詳細は該当時のみ読み込まれる。
      - [ ] 本文予算が検査され、既存の description 予算と投影・同期・整合性規則が維持される。lint_skills、check_integrity、bun test ./src/ が合格する。
    on_failure: fix-and-reverify — 計測範囲・基線、意味、本文サイズ、予算検査または投影を点検し、修正可能な項目を修正して再検証する。基線の取得・比較が成立しない場合は未検証と記録する。
  - id: TS-005
    target_item: AG-004
    verification: |
      定型状態確認を使う対象経路で一回の呼出の出力を確認する。正常、大量、空検索、部分取得不能の単体テストで JSON・範囲・バイト数を比較し、書込みがないこと、必要なフィールドと REQ-095 の確認経路が残ることを確認する。リポジトリルートから check_integrity と bun test ./src/ を実行する。
    pass_criteria: |
      - [ ] 対象の定型確認を一回の bash 呼出に統合し、全件ダンプや切り詰め後の再読込を要せず、既定出力は上限目安 10〜15 KB 以内である。
      - [ ] 呼出側は空検索・部分結果・取得不能を区別し、必要な補完確認を経ずに対象なし・成功と判定するケースは 0 件。
      - [ ] gh 書込迂回、REQ-095 の省略、REQ-060 の試験規約違反は各 0 件。複合処理と出力上限の単体テスト、check_integrity、bun test ./src/ が合格する。
    on_failure: fix-and-reverify — 読取境界、集約または出力規律を修正して再検証する。
  - id: TS-006
    target_item: AG-004
    verification: |
      読取専用の生履歴から前後の比較期間・母集団を示して六指標を集計する。書込み不可で比較手順を試し、既存データの欠測と比較できない条件を区別する。変更差分で永続データ資産の追加有無を確認する。
    pass_criteria: |
      - [ ] 呼出数/セッション、Turn-1 トークン数、平均コンテキスト、ツール数/ターン、background_output 平均バイト数、切り詰め出力の再読込回数の六指標を同じ定義で比較できる。
      - [ ] opencode.db への書込み、不要な永続フィールドと独自 DB の新設は各 0 件。取得不能を実測合格として扱わない。
    on_failure: fix-and-reverify — 計測の比較条件または読取境界を修正する。外部データ由来の欠測は明示し、比較を再検証する。
  - id: TS-007
    target_item: AG-005
    verification: |
      全作業単位の変更差分と代表実行のゲート・承認の結果を照合し、対象外と ToDo 更新誘発の有無を確認する。
    pass_criteria: |
      - [ ] 指定ホスト設定・プラグイン、OmO 本体、description 短縮の再実施は各 0 件。毎工程に細かな ToDo 更新を要求する記述の追加は 0 件。
      - [ ] QG-1〜QG-4、check_integrity、bun test ./src/ と HITL の緩和・省略は各 0 件。
    on_failure: fix-and-reverify — 対象外の変更を除き、既存ゲートと HITL を復元して確認する。

realization_actions:
  - id: RA-001
    concern: 委譲プロンプトと親の受領経路
    responsibility: 実行 adapter が委譲出力の接続、対象の親 Workflow Skill が結果受領と進行判定を所有する。
    ownership_hints:
      - src/common/skills/agentdev-case-run-execution-adapter/SKILL.md
      - src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md
      - src/common/skills/agentdev-workflow-{case-auto,case-run,case-close,backlog-auto}/SKILL.md
      - traceability/ の該当 sidecar と既存委譲契約テスト
    intent: 上限と八項目を雛形・受領規則に反映し、必要な証拠へ参照で到達させる。配布物には producer の REQ-ID を埋め込まない。
    verification_refs: [TS-001, TS-007]
    source_items: [AG-001]
  - id: RA-002
    concern: 工程境界での再開と委譲起動
    responsibility: backlog-auto と case-auto が各範囲の制御と停止再開を、case-ready が状態引渡しを、既存 harness reference が起動制御の実行手段を所有する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-{backlog-auto,case-auto,case-ready}/SKILL.md
      - src/common/commands/agentdev/{backlog-auto,case-auto}.md
      - src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md
    intent: アクティブ枠と正規状態を保って新規セッションで再開し、不要な子起動と専用待機ターンを減らす。
    verification_refs: [TS-002, TS-003, TS-007]
    source_items: [AG-002]
  - id: RA-003
    concern: スキル正本の本文・参照と本文サイズ検査
    responsibility: 対象スキルが規範と参照条件を、repo-agentdev-integrity が lint と同期対象の検査を所有する。
    ownership_hints:
      - src/common/skills/ の AG-003 に列挙した九つの SKILL.md と各 references/
      - src/common/skills/repo-agentdev-integrity/scripts/lint_skills.ts と scripts/tests/lint_skills.test.ts
      - .opencode/skills/ の既存 junction および repo-agentdev-integrity の手動同期対象
    intent: 読込対象を縮め、必須契約と投影互換を保って本文予算を検査する。
    verification_refs: [TS-004, TS-007]
    source_items: [AG-003]
  - id: RA-004
    concern: 定型読取の集約と出力制限
    responsibility: 既存の workflow 内部スクリプト群と各 workflow の読取指示が定型状態確認の実現を担う。GitHub 書込み権限は変更しない。
    ownership_hints:
      - src/common/skills/agentdev-workflow-{case-open,case-run,case-close,backlog-review,req-define}/ の状態確認指示とその既存 scripts/ 群
      - case-open の既存読取側 scripts/src/inspect_cross_dependencies.ts と同じ内部スクリプト境界
    intent: 読取確認の往復と出力再読込を減らす。書込みを担う処理は読取集約へ取り込まない。
    verification_refs: [TS-005, TS-007]
    source_items: [AG-004]
  - id: RA-005
    concern: REQ-048 に準拠した比較手順
    responsibility: ADF リポジトリの実行観測が計測クエリと報告手順を所有し、元の実行履歴は harness が所有する。
    ownership_hints:
      - docs/requirements/REQ-048.md の実行観測契約と既存 Report/Issue 経路
      - リポジトリ側の観測手順と読取専用の opencode.db
    intent: データ複製を恒久化せず、六指標を比較可能にする。
    verification_refs: [TS-006]
    source_items: [AG-004]

boundary_risks:
  dependency: 共有スキル・Design の変更競合と必須規範のリンク欠落。対象競合時のみ局所調整し、TS-004 でリンクを確認する。
  client_server: GitHub の部分応答の誤認や書込境界の侵食。TS-005 で読取と不完全応答を確認する。
  execution: サマリ誤認、再開での二重起動、並列性劣化。TS-001〜003 と TS-007 で確認する。
  build_runtime: 本文サイズ検査による既存検査の変更。TS-004 と TS-007 で確認する。
  environment_propagation: 正本と投影の乖離およびホスト固有の観測の漏出。TS-004、TS-006、TS-007 で確認する。
review_dispositions: []
adversarial_review:
  outcome: resolved
  findings:
    - 入力との照合で省かれていた REQ-033 を原文の参照記録へ復元した。現行の変更対象を追加するという解釈は採用しない。
    - 必須識別子の保持は既存資料で既に配布物外と解決できる。AG-001 と TS-001 の合格基準をそろえ、配布物への混入も検査対象とした。
    - 基線の出典は存在するが、同一計測条件かは入力値だけでは立証できない。TS-004 で指定基線を再確認し、比較不能を合格としない。削減目標は維持する。
  convergence_audit: 原文の対象・禁止事項・受け入れ条件を維持し、三つの修正はいずれも証拠の所在・判定を明確にする。新しい利用者判断と未解決の衝突はない。
assembly_evidence:
  - action_id: ACT-DESIGN-001
    target_file: docs/designs/workflows/delegation-contracts.md
    target_content_sha256: 1c479ba4319bd482f0d0f368eb3fc884ea28eb6a16a42b35de3c3f27646f06cf
    check_scope: {heading: '### 検証用一時資材の作成・報告義務', start_line: 87, end_line: 96}
    execution_conditions: {operation: append, edit_sha256: 99ef2d1ad9ef0fd1ddb237fa8e3b515f330f1da25c979934748b890da8c026c9, expected_old_count: null}
    checker: &assembly_checker {name: assemble-draft-section, version: '0.2.0', settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: &assembly_refs {heading_match_rule: 'search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan', scan_scope: target section only}
    checks_summary: &assembly_pass {pre: {count: 2, all_ok: true}, post: {count: 2, all_ok: true}}
    diff_compact: {changed_lines_count: 14, added: 14, removed: 0}
    executed_at: '2026-11-22T15:26:19.402Z'
  - action_id: ACT-DESIGN-002
    target_file: docs/designs/responsibilities/artifact-contracts.md
    target_content_sha256: 30f084ce9bbe0c644330fd99c67ff76ab7e8964f682dd8896816a55bef67c663
    check_scope: {heading: '## サイズ制約', start_line: 177, end_line: 184}
    execution_conditions: {operation: append, edit_sha256: 82668bf3c80b0a148f45db5cc56ca38741c220bf025a4e7d810f1ea656559bba, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: '2026-11-22T15:26:19.405Z'
  - action_id: ACT-DESIGN-003
    target_file: docs/designs/commands/case-run.md
    target_content_sha256: 8eba58bc736659dbd52f6a3f0bb333e32d7085224235b10914fb2ade3648e889
    check_scope: {heading: '## 入力', start_line: 49, end_line: 53}
    execution_conditions: {operation: append, edit_sha256: e4a9ac820071dc75d3bcd2c5c35d6e30d2b59e6e2f224560c1a3655b90c5447a, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 4, added: 4, removed: 0}
    executed_at: '2026-11-22T15:26:19.407Z'
  - action_id: ACT-DESIGN-004
    target_file: docs/designs/commands/case-close.md
    target_content_sha256: af65937a06b4eca6356e9ceb6964ca563a8642f6452498e4cf2997ff767f23a6
    check_scope: {heading: '## 入力', start_line: 49, end_line: 53}
    execution_conditions: {operation: append, edit_sha256: dfa6f23991d325a74dd6b3c4b49db12f1415f431cab1ea397ca0299afbe4c74c, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 4, added: 4, removed: 0}
    executed_at: '2026-11-22T15:26:19.408Z'
  - action_id: ACT-DESIGN-005
    target_file: docs/designs/commands/case-auto.md
    target_content_sha256: 703dd1c2e91b860a8acbcf9220418f1ea19e45a76a790ce222df52cc6c80d14f
    check_scope: {heading: '## Phase 0 commit スコープ設計運用', start_line: 151, end_line: 153}
    execution_conditions: {operation: append, edit_sha256: 6847e1a7d719efe13a46b2a12e7cec0743fe67a21a9071dde52ec78448f77921, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 7, added: 7, removed: 0}
    executed_at: '2026-11-22T15:26:19.409Z'
  - action_id: ACT-DESIGN-006
    target_file: docs/designs/commands/backlog-auto.md
    target_content_sha256: 52039f515f0e1079bc8373dd7a86c7b56414f1cd393ade16c10bf5fc77bbda4f
    check_scope: {heading: '## 入力', start_line: 22, end_line: 25}
    execution_conditions: {operation: append, edit_sha256: 0f6ff38e0f9288eb138e5e690a3004150a1975baec5e86815084b02e738372a6, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: '2026-11-22T15:26:19.409Z'
  - action_id: ACT-DESIGN-007
    target_file: docs/designs/workflows/workflow-skill-model.md
    target_content_sha256: a143c8f0436d98450b1d45dad257c10b80de3f8a2c1d6772a8c10ddc9dd9fbd4
    check_scope: {heading: '## soft guard の二層様式', start_line: 217, end_line: 231}
    execution_conditions: {operation: append, edit_sha256: abf0bbca1b7d250ebc27a98f7fd1c2ded7364fc4c44bcd3e8dd75834c35a38b4, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: '2026-11-22T15:26:19.410Z'
  - action_id: ACT-DESIGN-008
    target_file: docs/designs/responsibilities/artifact-contracts.md
    target_content_sha256: 30f084ce9bbe0c644330fd99c67ff76ab7e8964f682dd8896816a55bef67c663
    check_scope: {heading: '## スキル参照妥当性契約', start_line: 92, end_line: 108}
    execution_conditions: {operation: append, edit_sha256: 69efa95681fc2f44a535f53757ee888f47c4a631a870113ce4b29517c54c4bc2, expected_old_count: null}
    checker: *assembly_checker
    result_affecting_references: *assembly_refs
    checks_summary: *assembly_pass
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: '2026-11-22T15:26:19.412Z'
case_open_hints:
  epic_needed: true
  decomposition:
    - 作業単位 1 / AG-001 / RA-001 — 委譲サマリ契約
    - 作業単位 3 / AG-003 / RA-003 — SKILL 本文と条件付き参照
    - 作業単位 4 / AG-004 / RA-004・RA-005 — 読取集約、出力規律、効果計測
    - 作業単位 2 / AG-002 / RA-002 — 工程境界、委譲粒度と起動間隔
  wave_hints:
    - 上記の 1 → 3 → 4 → 2 は着手の推奨に限る。四単位に必須依存はなく、ファイル競合しない範囲で並列または段階投入できる。Issue 階層と Wave の割当は本ドラフトで決定しない。

important_change_notifications:
  - phase: before_draft_save
    delivery: 利用者向け実行出力（「保存前に、既存 Design への変更案をお知らせします」）
    content: 委譲返却の縮小、新規セッションでの再開、SKILL 本文の縮小と読取手順の集約の理由・影響を提示した。現行の権限・状態判定・品質ゲート・HITL は維持し、削減効果は実測前と区別した。
```
