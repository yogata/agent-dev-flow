---
draft_type: req_draft
topic_slug: index-generation-spec
status: draft
created_at: 2026-07-23T12:00:00+09:00
source_rus: [RU-0001, RU-0002]
agentdev_handoff: true
spec_actions_consumed: true
spec_actions_consumed_at: 2026-07-24T00:00:00+09:00
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: クラスタ全体は maintenance（RU-0001 が4点・複数 SPEC にまたがり影響度が大きい）。
# RU-0002 は bugfix としてクラスタ内に併存し、operation_units.source_ru で個別に保持する。
# maintenance / bugfix ともに req-save を経由せず case-open へ至る。
work_type: maintenance
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  SC-002 索引自動生成 SPEC の運用実績から抽出した2 RU を統合する。
  RU-0001（maintenance）は case-close.md（Step 3 後の generate_indexes.ts dry-run/diff 必須実行ステップ追加）の SPEC update を合意する。case-close は dry-run/差分検査で停止し、再生成は case-run へ委譲する。
  RU-0002（bugfix）は generate_indexes.ts の AUTOGEN marker 検出ロジックを、backtick 囲み（インラインコード）文脈の marker 文字列を無視する行全体一致方式へ是正し、index-auto-generation.md の SPEC 注記を合意する。
  いずれも REQ 新規設置を伴わず、既存 REQ（REQ-0108 docs-check、REQ-0131 case-close）の現行契約に対する SPEC 明文化・実装是正である。
  AG-001/002/003/006（AUTOGEN block ID 命名、AUTOGEN ブロック除外、3領域分離、3層責任境界）は現行 SPEC で既充足のため covered 扱いで除外する。
  全 AG は SPEC 分離基準（REQ-0101-068）該当内容であり、REQ への残留なし。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-004
    content: |
      case-close の Step 3（docs/ 検証）の後に、generate_indexes.ts --dry-run による AUTOGEN block 再生成差分検出を必須ゲートとして追加する。
      case-close は直接編集・commit せず、dry-run/差分検査で停止する。再生成（実 commit）は case-run へ委譲する。
      AUTOGEN block の再生成差分を case-close 完了前の必須ゲートとし、複数 PR 跨ぎでの再生成漏れ（Epic #1711 Wave 2 で発生した docs-check NG 7件と同種）を防止する。
      索引検証は case-close command 本体（src/opencode/commands/agentdev/case-close.md）の手順を直接編集せず、既存の project extension 機構（.agentdev/extensions/commands/case-close.yaml、project-extensions SPEC、ADR-0135）の checks セクション経由で導入する。case-close SPEC（docs/specs/commands/case-close.md）は本検証が extension/checks 経由で実行される契約を記述し、command 本体への手順ハードコードは行わない。
      Epic Wave クローズ経路でも Step E5b（完了条件チェックボックス最終評価）の前段に同等の dry-run/diff による索引健全性検証を適用する。Epic Issue クローズ時の索引検証は case_open_hints へ明記する。

  - id: AG-005
    content: |
      generate_indexes.ts（.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts）の AUTOGEN marker 検出ロジックを、行全体が正規のHTMLコメントマーカー形式（`<!-- AUTOGEN:BEGIN:id=xxx -->` または `<!-- AUTOGEN:END -->`）に一致するかで判定する方式へ是正する。
      説明文中の backtick 囲み（インラインコード）marker 文字列を実 marker と誤認して正常な AUTOGEN block 認識に失敗し、索引再生成が途中停止する事象（docs/specs/quality/spec-health-metrics.md L26 で発生、PR #1718 で暫定対応済み）を根本解決する。
      backtick 囲みは行全体一致判定で自動的に除外されるため、backtick 文脈判定のような部分一致ロジックを併用しない。
      正例（正規マーカー行）、負例（backtick 囲み marker 文字列を含む説明文）、境界例（マーカー行に backtick が隣接する場合）を含む回帰テストを追加する。
      暫定対応（PR #1718 の HTML コメント構文抽象化）は残置してよい。

# artifact_actions: REQ/ADR/SPEC への保存対象を単一配列に統合
# 全項目が SPEC 分離基準（REQ-0101-068）該当の SPEC 行であり、REQ 操作なし。
artifact_actions:
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "### 単一 Issue クローズ（従来フロー、後方互換）"
    source_items: [AG-004]
    content: |
      ### 単一 Issue クローズ（従来フロー、後方互換）

      - Step 1-1: 重複ファイルチェック（`git status --short` と `gh pr view --json files` で重複検出）
      - Step 2: 前提確認（達成判定、完了ゲート（QG-4）に従い完了条件チェックボックスを最終評価、更新）。`[x]` 反映事後確認（再読込 VERIFY、最大2回）。未達項目残存時は構造化エラー停止
      - Step 3: docs/ 検証（機能追加固有検証（REQ作成、インデックス、spec更新、ADR）、関連ドキュメント整合性確認、DOC-MAP 整合性）
       - Step 3-1: close 時 SPEC / commands / skills 更新漏れの局所確認
       - Step 3-2: SPEC 確定フロー（ADR-0123 Decision #4, REQ-0136-015）（PR 本文の `## SPEC確定候補` セクション読取、確定判断（(a) 昇格 / (b) spec-save 再起動提案 / (c) 見送り））
       - Step 3-3: AUTOGEN block 索引再生成差分検出（project extension checks 経由）。Step 3（docs/ 検証）の後、generate_indexes.ts --dry-run を実行し AUTOGEN block の再生成差分を検出する。本検証は case-close command 本体（src/opencode/commands/agentdev/case-close.md）の手順を直接編集せず、project extension（.agentdev/extensions/commands/case-close.yaml）の checks セクション経由で導入する（project-extensions SPEC、ADR-0135 準拠）。case-close は dry-run/差分検査で停止し、直接編集・commit しない。差分がある場合は case-run へ差戻し、再生成（実 commit）は case-run が行う。複数 PR 跨ぎでの AUTOGEN block 再生成漏れを防止する。Epic Wave クローズ経路では Step E5b（完了条件チェックボックス最終評価）の前段に同等の dry-run/diff による索引健全性検証を適用する（Epic Issue クローズ時の索引検証は case_open_hints 参照）
      - Step 4: PRマージ（`gh pr merge --squash`（リトライ最大5回、フォールバック手順）、対応記録コメント追記）
      - Step 4-0: squash merge 前の mergeable UNKNOWN ポーリング（REQ-0131-028）（PR 補助データ読込（`agentdev-gh-cli`）で `gh pr view {N} --json mergeable,mergeStateStatus` を取得し、UNKNOWN の場合は最大60秒・10秒間隔でポーリング待機。上限超過時はマージ中止・構造化エラー停止。CONFLICTING 遷移時は Step 4-2 へ分岐）
      - Step 4-1: Squash merge 後のローカル先行 commit 検出、処理（REQ-0146-005）（`git log origin/{branch}..HEAD --oneline` で検出、内容重複確認後に `git reset --hard origin/{branch}` で reset（`agentdev-git-worktree` の squash merge 後分岐ハンドリング手順参照））
      - Step 4-2: コンフリクト解消 rebase パス（REQ-0151-001/002、REQ-0131-024/025）（squash merge 失敗時）。squash merge がコンフリクトで失敗した場合、`git rebase` による機械的解消を試みる。rebase が自動解決した場合は再マージ（Step 4 へ戻る）。rebase 自体がコンフリクトを発生した場合は実装変更を行わず case-auto へエスカレーションし停止する（コンフリクト解消モデル Level 1、`docs/specs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）
      - Step 5: Post-merge テスト戦略検証（CI通過等の反映）
      - Step 6: Issueクローズ（`gh issue close --reason completed`）
      - Step 7: ブランチ、worktree削除（`agentdev-git-worktree` 手順）。未コミット変更検出、共有作業ツリーでの `git checkout .` 禁止（REQ-0137-001）
      - Step 8: 親Epic Issue更新（`agentdev-epic-tracker`、Epic 自動クローズ判定）
      - Step 9: 実行前同期（`git pull --ff-only`、hash 検証）
      - Step 9-2: git main 同期リスク事前検出、代替同期手順選択（REQ-0131-029）（`git pull --ff-only` 直前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出。検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main` による非チェックアウト同期）を選択。`agentdev-git-worktree` の git main 同期リスク事前検出プロシージャ参照）
      - Step 10: 学びの検知、抽出（`agentdev-learning-capture`、ユーザーに学び有無を問わない（G13）、Capture 回収（PR 本文から intake/learning を分離））
      - Step 11: ドメイン状態永続化（`.agentdev/` 配下を commit/push（learning と intake を同一 commit））
      - Step 12: 完了報告（結果状態の分離報告（GitHub側、`.agentdev`、ブランチ削除））

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    target_area: "## 現在稼働している自動生成契約"
    source_items: [AG-005]
    content: |
      ## 現在稼働している自動生成契約

      本 SPEC が定義する機構は現在以下の契約で稼働している。

      1. **現在 AUTOGEN されている領域**: frontmatter 由来で機械生成される件数、一覧、ステータス別ビュー等。生成スクリプト `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` が存在し、AUTOGEN ブロック（HTML コメント形式 `<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）で囲まれた領域を上書きする。docs-check 既存資産（cli_utils.ts, check_integrity.ts の parseFrontmatter, readText, listFiles 等）を再利用する。
      2. **現在人手管理されている領域**: 導出規則が未確定、混合領域、人手判断を含む領域。後述「現在人手管理領域の5領域」参照。
      3. **各領域の正規情報源**: frontmatter、各文書本文のセクション構造、宣言等。
      4. **人手管理領域に対する整合性確認方法**: docs-check（IR-061、IR-038、IR-039、IR-042）による検出、人手レビュー等。

      docs-check は G01 原則（検査対象を直接修正しない）を維持し、生成スクリプトは docs-check から独立して動作する。

      ### AUTOGEN marker 検出契約

      generate_indexes.ts の AUTOGEN marker 検出は、行全体が正規のHTMLコメントマーカー形式（`<!-- AUTOGEN:BEGIN:id=xxx -->` または `<!-- AUTOGEN:END -->`）に一致するかで判定する。説明文中の backtick 囲み（インラインコード）AUTOGEN marker 記述を実 marker と誤認せず、行全体一致判定で自動的に除外する。backtick 文脈判定のような部分一致ロジックは併用しない。これにより正常な AUTOGEN block 認識の失敗と索引再生成の途中停止を防止する（PR #1718 の HTML コメント構文抽象化による暫定対応と置換）。正例（正規マーカー行）、負例（backtick 囲み marker 文字列を含む説明文）、境界例（マーカー行に backtick が隣接する場合）を含む回帰テストが生成スクリプトに付属する。

      ### 現在人手管理領域の5領域

      以下5領域は現在契約上の自動生成対象外（人手管理領域）として確定する。これは「永久に自動化しない」決定ではなく、「現在実装されていない機能を実装済み契約として扱わない」決定である。将来、導出規則と生成機構を別要件で確定すれば本 SPEC を更新できる自動生成拡張ポイントである。

      - **ADR README トピック別ビュー**: 人手管理。導出規則未確定のため。
      - **ADR README Decision Map**: 人手管理。各 ADR 本文の宣言から導出するが、導出規則が未確定のため。
      - **ADR README 関連 REQ 表**: 人手管理。各 ADR の関連宣言から導出するが、導出規則が未確定のため。
      - **docs/specs/README.md**: 人手管理または既存生成部分のみ AUTOGEN。status 列は AUTOGEN 可能だが、責務列等の混合領域が大半のため、現状では一部列のみ AUTOGEN または人手管理。
      - **docs/requirements/mapping-table.md**: 人手判断（migrated/retired-no-successor/historical-only 判定）を含むため人手管理。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0001 の intake 由来項目（2026-07-19〜20）は当時「SPEC 未明文化」を前提としていた。
      レビュー後の実ファイル照合（index-auto-generation.md updated 2026-07-20、spec-health-metrics.md、case-close.md、index-auto-generation.md の節構成確認）の結果、AG-001（AUTOGEN block ID 命名パターン節）、AG-002（SPEC行数計測の AUTOGEN 除外記述）、AG-003（人手編集領域と自動生成領域の分離節）、AG-006（3層編集責任境界節）に相当する記述が現行 SPEC に存在する。
      一方 AG-004（case-close での generate_indexes.ts 必須実行）、AG-005（AUTOGEN marker 検出の行全体一致方式是正）は現時点で未対応である。
    resolution: |
      req-define は RU の要件化方向をそのまま AG へ展開する（RU の合意内容を改変しない）。
      既存 SPEC 記述との照合結果は review_dispositions へ記録し、covered として agreed_items、artifact_actions、operation_units、test_strategy から除外する。
      AG-001/002/003/006 は実行対象から除外し、verify-only OU も作成しない（共通方針1）。
      AG-004 と AG-005 は新規 SPEC 追記・実装是正であり、実行対象として残す。
      review_dispositions は docs/specs/responsibilities/artifact-contracts.md「review_dispositions 構造」節（L382-422）で定義された正規スキーマへ準拠し、case-open 可能状態とする。

# operation_units: 各成果物操作を1 OU として出力。execution_groups は出力しない（G14）。
operation_units:
  - ou_id: OU-004
    source_ru: RU-0002
    source_actions: [ACT-SPEC-005]
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    target_area: "## 現在稼働している自動生成契約"
    target_artifacts:
      - docs/specs/integrity/index-auto-generation.md
      - .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

  - ou_id: OU-005
    source_ru: RU-0001
    source_actions: [ACT-SPEC-004]
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "### 単一 Issue クローズ（従来フロー、後方互換）"
    target_artifacts:
      - docs/specs/commands/case-close.md
      - .agentdev/extensions/commands/case-close.yaml
    operation: update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: epic
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須。
test_strategy:
  - id: TS-004
    target_item: AG-004
    verification: |
      case-close.md の「### 単一 Issue クローズ（従来フロー、後方互換）」節（Step 3 後）と Epic Wave 経路の Step E5b 前段に、generate_indexes.ts --dry-run/diff による AUTOGEN block 再生成差分検出ステップが追加されていることを確認する。
      併せて case-close 実行情報で generate_indexes.ts --dry-run が実行され、差分がある場合は case-run へ差戻しされることを確認する。
    pass_criteria: |
      両経路の SPEC に dry-run/diff ステップが記載されており、case-close が直接編集・commit しない契約が明示されていること。
      差分ありの場合は case-run へ差戻しされ、差分なしの場合のみ case-close が完了すること。
    on_failure: |
      fix-and-reverify。SPEC または実行手順を修正し、case-close を再実行して dry-run/diff の挙動と case-run への差戻しを再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      backtick 囲み AUTOGEN marker 文字列を含む SPEC（例: spec-health-metrics.md 計測例の前後）に対し generate_indexes.ts を実行し、途中停止せず正常な AUTOGEN block を認識することを確認する。
      正例（正規マーカー行）、負例（backtick 囲み marker 文字列を含む説明文）、境界例（マーカー行に backtick が隣接する場合）を含む回帰テストを追加する。
    pass_criteria: |
      行全体一致判定により backtick 囲み marker 記述が自動的に除外され、全 AUTOGEN block が再生成され exit code 0 で完了すること。
      backtick 文脈判定のような部分一致ロジックを併用しないこと。PR #1718 の暫定対応を残置した状態でも再発しないこと。
    on_failure: |
      fix-and-reverify。検出ロジックの行全体一致判定を修正し、正例・負例・境界例の回帰テストで再検証する。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  decomposition: |
    本クラスタ（C1: SC-002 索引自動生成）は backlog26-rus-integrated Epic の子 Issue 群の一部である。
    推奨分解は2子 Issue 構成とする。
    (a) OU-004（RU-0002 由来 bugfix）: generate_indexes.ts の AUTOGEN marker 検出ロジックを行全体一致方式へ是正し、index-auto-generation.md（AG-005）の SPEC 注記を更新する。回帰テスト（正例・負例・境界例）を追加する。
    (b) OU-005（RU-0001 由来 maintenance）: case-close SPEC（docs/specs/commands/case-close.md）へ generate_indexes.ts --dry-run/diff による AUTOGEN block 再生成差分検出ステップ（Step 3-3）を追記する。case-close は dry-run/差分検査で停止し、再生成（実 commit）は case-run へ委譲する契約を SPEC へ明記する。実装は case-close command 本体（src/opencode/commands/agentdev/case-close.md）の手順を直接編集せず、project extension（.agentdev/extensions/commands/case-close.yaml）の checks セクション経由で導入する。
    OU-005 は OU-004 に依存する（depends_on: [OU-004]）。OU-004 の marker 検出是正が前提でなければ、OU-005 の dry-run/diff 検証が marker 誤認で途中停止し成立しないためである。Wave 構成は OU-004 を Wave 1、OU-005 を Wave 2 とする直列依存とする。
  wave_hints:
    - "Wave 1: OU-004（RU-0002 bugfix）。generate_indexes.ts の marker 検出ロジック是正と index-auto-generation.md の SPEC 注記、回帰テスト追加。"
    - "Wave 2: OU-005（RU-0001 maintenance）。case-close.md の dry-run/diff ステップ（Step 3-3）追記と project extension checks への導入。OU-004 完了が必須依存（marker 検出是正後の generate_indexes.ts で dry-run/diff 検証が成立するため）。"
  epic_close_index_verification: |
    Epic Issue クローズ時（最終 Wave の Step E5b 前段）にも、generate_indexes.ts --dry-run による AUTOGEN block 索引健全性検証を適用する。Epic 単位で複数 Wave を跨いだ再生成漏れを最終ゲートで検出する。差分がある場合は Epic クローズを停止し、残差分の再生成を case-run へ差戻す。本検証は case-open が子 Issue の完了条件へ明示し、case-close が project extension checks 経由で実行する契約とする。
  adr_candidates: |
    該当なし。いずれの AG も既存 SPEC（SC-002 受入済み機構）の運用補強、bugfix であり、新規の取り返しのつかないアーキテクチャ判断を含まない。
    marker 検出の行全体一致方式、dry-run/diff による case-close と case-run の責務分離はいずれも可逆的な SPEC・実装詳細であり ADR 対象外と判断する。
    ADR 候補がないため artifact_actions に ADR 操作は含めない。

# review_dispositions: covered/rejected/superseded 等の分類と証跡。
# 実行対象外とした AG/ACT/OU/TS の追跡性を確保する（共通方針1、共通方針3）。
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: AG-001
    disposition: covered
    reason_code: already_specified
    reason: 現行 SPEC で AUTOGEN block ID 命名パターンが既充足。新規追記は重複。
    evidence:
      - path: docs/specs/integrity/index-auto-generation.md
        section: "### AUTOGEN block ID 命名パターン"
        checked_at_commit: null
    related_removed_items: [ACT-SPEC-001, OU-0001, TS-001]

  - id: RD-002
    source_ru: RU-0001
    source_item: AG-002
    disposition: covered
    reason_code: already_specified
    reason: 現行 SPEC で SPEC行数計測の AUTOGEN 除外が既充足。
    evidence:
      - path: docs/specs/quality/spec-health-metrics.md
        section: "## 測定対象と計測方法"
        checked_at_commit: null
    related_removed_items: [ACT-SPEC-003, OU-0003, TS-002]

  - id: RD-003
    source_ru: RU-0001
    source_item: AG-003
    disposition: covered
    reason_code: already_specified
    reason: 現行 SPEC で3領域分離が既充足。
    evidence:
      - path: docs/specs/integrity/index-auto-generation.md
        section: "## 人手編集領域と自動生成領域の分離"
        checked_at_commit: null
    related_removed_items: [ACT-SPEC-002, OU-0002, TS-003]

  - id: RD-004
    source_ru: RU-0001
    source_item: AG-006
    disposition: covered
    reason_code: already_specified
    reason: 現行 SPEC の3領域分離節が編集責任の中身を実質的に既充足。用語の統一と違反時検出方法の明示化は将来の inspect-docs で段階扱い可能。
    evidence:
      - path: docs/specs/integrity/index-auto-generation.md
        section: "## 人手編集領域と自動生成領域の分離"
        checked_at_commit: null
    related_removed_items: [ACT-SPEC-006, OU-0006, TS-006]
```

# summary

本ドラフトは SC-002 索引自動生成 SPEC に関する2 RU を統合したものである。
RU-0001（maintenance）は case-close.md SPEC へ generate_indexes.ts --dry-run/diff による AUTOGEN block 再生成差分検出ステップ（Step 3-3）を追記する。case-close は dry-run/差分検査で停止し、再生成（実 commit）は case-run へ委譲する契約を明示する。索引検証の実装は case-close command 本体の手順を直接編集せず、project extension（.agentdev/extensions/commands/case-close.yaml）の checks セクション経由で導入する。
RU-0002（bugfix）は generate_indexes.ts の AUTOGEN marker 検出ロジックを行全体一致方式へ是正し、backtick 囲み marker 誤認識を根本解決する。正例・負例・境界例を含む回帰テストを追加する。
クラスタ work_type は maintenance とし、RU-0002 は bugfix として operation_units で個別に保持する。

RU-0001 の AG-001/002/003/006（AUTOGEN block ID 命名、SPEC行数計測の AUTOGEN 除外、3領域分離、3層編集責任境界）は現行 SPEC で既充足のため review_dispositions へ covered（reason_code: already_specified）として記録し、agreed_items、artifact_actions、operation_units、test_strategy から除外した（共通方針1）。

クラスタは backlog26-rus-integrated Epic の子 Issue 群の一部である。
OU-004（RU-0002 bugfix）を Wave 1、OU-005（RU-0001 maintenance）を Wave 2 とする直列依存構成とする。OU-005 は OU-004 に依存し（depends_on: [OU-004]）、marker 検出是正後の generate_indexes.ts で dry-run/diff 検証が成立する。Epic Issue クローズ時（最終 Wave の Step E5b 前段）にも同等の索引健全性検証を適用し、Epic 横断での再生成漏れを最終ゲートで検出する。

auto_ready は true。review_dispositions は docs/specs/responsibilities/artifact-contracts.md「review_dispositions 構造」節（L382-422）で定義された正規スキーマ（id: RD-NNN、evidence[].checked_at_commit、related_removed_items 必須、observation/verification_required_at/verified_at_commit 廃止）へ準拠済みであり、case-open 可能状態である。
