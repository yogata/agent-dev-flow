---
draft_type: req_draft
topic_slug: agents-md-principles-20261123
status: draft
created_at: "2026-11-23T12:10:06.663Z"
---

<!-- 後続工程への引き継ぎは draft-data を正とする。 -->

# draft-data

```yaml
work_type: docs_chore
scale: standard
summary: |
  AGENTS.md の最上位制約節（6〜14 行目）を、利用者の設計・実装原則 8 項（依頼文原文・変更不可）へ差し替え、8 項にない現行 1 項・5 項を 9・10 番として残す。節の見出しは「## 最上位制約」に変え、「本節は他の規則に優先する。」は残す。変更対象は AGENTS.md のみとし、Decision・設計文書・REQ・テスト・スキル・設定は変更しない。実現面変更は realization_actions（RA-001）へ構造化して引き継ぐ。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |
      AGENTS.md の 6 行目から 14 行目（最上位制約節）を、次の目標の全文へ差し替える。16 行目以降は現行のまま残す。節の見出しは「## 最上位制約」に変える。「本節は他の規則に優先する。」は残す。
      1. から 8. までの文言は、利用者の依頼文の原文のまま使う。要約・言い換え・語順の変更・強調名の付加・並べ替え・追加をしない。9. と 10. は、現行の 1 項（Working Tree ＝「現在の姿」）と 5 項（配布物ゼロ汚染）の文言を残し、番号だけを 9・10 へ変える。
      目標の全文（置換後の 6 行目から 14 行目）:
      
      ## 最上位制約
      
      本節は他の規則に優先する。
      
      1. 後方互換性は維持しない。古いものはそのまま削除。互換レイヤーを足すな、移行スクリプトを書くな、予備のロールバック手段を残すな。
      2. 今の要件を満たせる、いちばん単純な実装を選ぶ。予防的な抽象化をするな。あとで使うかもしれない、という設定レイヤーも足すな。
      3. システムは段階的に育てる。まず最小のエンドツーエンド版を動かして、動いたら上に足していく。将来複雑になるかもしれないからといって、今ちゃんと動いているものを壊すのは絶対にやめろ。
      4. コンポーネントはモジュール化し、関心事は明確に分離する。
      5. 成熟していて、メンテされているサードパーティライブラリを優先する。特別に強い理由がない限り、自分で書き直すな。
      6. 手を動かす前に、まずプロジェクトに既にある依存関係で何ができるか調べてから、新しいパッケージを足すか自分で書くかを決める。ライブラリには絶対にないだろうと決めつけない。
      7. アーキテクチャの判断は長期的に行う。「とりあえずしのいで、後で考える」という暫定案は認めない。
      8. まず成熟した製品が同じ問題をどう解決しているかを見て、すでに検証済みのパターンを使え。ゼロから発明するな。
      9. **Working Tree ＝「現在の姿」**: リポジトリ内の文書・コード・DEC に過去の経緯・旧構成との比較・手順書・廃止理由・保留記録を書かない。歴史は Git ログが唯一の正本である。
      10. **配布物ゼロ汚染**: 利用プロジェクトへ配布される領域（`src/` のコマンド・スキル・スクリプト等）に `REQ-ID`・`docs/` 参照・開発用トレーサビリティ情報を 1 文字も混入させない。
  - id: AG-002
    content: |
      変更しない範囲。16 行目の機械強制の段落（`機械強制: pre-push（…` で始まる 1 段落）、18 行目以降の全節（基本規則・Windows 環境のファイル入出力規律・ハーネス選定と Git）、1 行目の `ADF-COVERS` のコメントは変更しない。ただし PR #4216 が先に統合されていた場合は、統合後の main を基準にする。
  - id: AG-003
    content: |
      受け入れ条件（全文）。
      1. main の `AGENTS.md` の 6 行目が `## 最上位制約` であること。
      2. 「本節は他の規則に優先する。」が残っていること。
      3. `1.` から `8.` までの各行が、依頼文の 8 項と行番号部分を除いて一字違いなく一致すること。
      4. `9.` と `10.` が、変更前の 10 行目と 14 行目と番号を除いて一字違いなく一致すること。
      5. 変更前の 11〜13 行目（Zero-Base Filter・Rewrite over Patch・Clean Deletion）が存在しないこと。
      6. 16 行目の機械強制の段落と、18 行目以降の全節と、1 行目の `ADF-COVERS` のコメントが、変更前と一致すること。ただし PR #4216 が先に統合されていた場合は、統合後の main を基準にする。
      7. ファイルが UTF-8（BOM なし）・LF のままであること。
      8. 実装 PR の差分に `AGENTS.md` 以外のファイルが含まれないこと。
      9. pre-push の検証ゲートに合格して push できていること。
      10. 監督が実装 PR の差分を上記 1〜8 で確認したあとに、PR が main へ統合され、Issue がクローズされていること。
  - id: AG-004
    content: |
      禁止事項（全文）。
      - 8 項の要約・言い換え・語順の変更・強調名の付加・並べ替え・追加。
      - `AGENTS.md` 以外のファイルの変更（Decision・設計文書・REQ・テスト・スキル・設定を含む）。
      - PR #4216・Issue #4214・作業ツリー `.worktrees/4214-feature`・分岐 `feature/issue-4214` への操作。
      - 検査のスキップ・無効化・緩和、整合性検査の対象からの除外。
  - id: AG-005
    content: |
      対象外（非スコープ・全文）。
      - Decision への 8 項の記録、`design-principles.md` の変更。
      - PR #4216 が基本規則へ追加する 1 行（install.ps1 と通常コマンドには移行処理や互換層を持たせない）と、8 項の 1 項との重複の整理。
      - `src/common/skills/agentdev-git-worktree/references/worktree-operations.md` の 243 行目が参照する「AGENTS.md 行動規範」という節名の陳腐化（当該節は 2026-11-20 に削除済み）。
      - リリースの作成（版上げ・タグ・Release）。`AGENTS.md` は配布物ではないため、今回の変更にリリースは不要である。
  - id: AG-006
    content: |
      並行実行の条件。PR #4216・Issue #4214・作業ツリー `.worktrees/4214-feature`・分岐 `feature/issue-4214` と、本線の未追跡ファイルには触れない。書き込む前に毎回 `git pull --ff-only` で main を最新化する。PR #4216 が先に統合されていた場合は、その変更を保持したうえで最上位制約節を差し替える。
  - id: AG-007
    content: |
      停止点。実装 PR の統合、Issue のクローズ、Issue の完了チェックボックスの確定は、監督が差分の受入確認（受け入れ条件 1〜8 での確認）を終えるまで行わない。設計系 PR の工程内での統合はこの限りではない。実装 PR を作成して検証が済んだ時点で、PR 番号と検証結果を報告して停止する。
artifact_actions: []
conflict_resolutions:
  - id: CR-001
    conflict: 現行の最上位制約 5 原則と利用者の 8 項の意味重複（旧 2・3・4 項は 8 項の 1 項・2 項と同じ趣旨）。
    resolution: |
      利用者の決定（2026-11-23）により、5 原則は 8 項で置き換える。旧 2 項（Zero-Base Filter）・旧 3 項（Rewrite over Patch）・旧 4 項（Clean Deletion）は 8 項の 1 項・2 項と同じ趣旨のため削除する。8 項にない規則である旧 1 項（Working Tree ＝「現在の姿」）と旧 5 項（配布物ゼロ汚染）は、文言をそのまま 9・10 番として残す（番号のみ変更）。
  - id: CR-002
    conflict: 本変更を Decision・REQ へ記録すべきか（AGENTS.md の最上位規則の変更である）。
    resolution: |
      利用者の決定（2026-11-23）により変更対象は AGENTS.md のみで、Decision（docs/decisions/）と設計文書（docs/designs/）は変更しない。禁止事項として Decision・設計文書・REQ・テスト・スキル・設定を含む AGENTS.md 以外のファイル変更を禁止する。先行例として、現行の 5 原則もコミット f213a009c（2026-11-20）で Decision を作らず main へ直接追加されている。よって本件は Decision・REQ を作成しない。
  - id: CR-003
    conflict: 8 項の文言が機械検査・文章検査に抵触しないか。
    resolution: |
      監督実測（2026-11-23・main 022ce20f7）により、文章検査（agentdev-textlint-guard）の標準対象は docs/**/*.md のみでリポジトリルートの AGENTS.md は対象外、拒否対象の禁止語（rules/default-prh.yml の 18 語）は 8 項の文言に存在しない。AGENTS.md の文言を固定するテストは存在せず、コードとテストは AGENTS.md の存在（リポジトリルート判定）と REQ 変更時の整合性検査の対象として参照するのみである。5 原則の名称（Minimal-by-Default / Zero-Base Filter / Rewrite over Patch / Clean Deletion）を参照する正規文書は docs/ と src/ に存在しない（git grep の一致は .agentdev/ 配下の状態ファイル 3 本のみ）。よって原文のまま差し替えて検証への影響はない。
operation_units:
  - ou_id: OU-001
    description: AGENTS.md 最上位制約節の差し替え。REQ・Decision・Design の保存操作を伴わない単一実行単位（docs_chore・direct_case 構成）。
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      main の AGENTS.md を読み、次を確認する。(1) 6 行目が `## 最上位制約` であること。(2) 「本節は他の規則に優先する。」が残っていること。(3) `1.` から `8.` までの各行が、本 draft の AG-001 に記録した依頼文 8 項の原文と行番号部分を除いて一字違いなく一致すること。(4) `9.` と `10.` が、差し替え前の main の AGENTS.md 10 行目・14 行目（旧 1 項・旧 5 項）と番号を除いて一字違いなく一致すること（旧文は差し替え前の main から取得して照合する）。(5) 変更前の 11〜13 行目の文言・名称（Zero-Base Filter・Rewrite over Patch・Clean Deletion、および「— Minimal-by-Default 5原則」）が AGENTS.md 全文に存在しないことを機械検索で確認すること。検索範囲は AGENTS.md のみとし、修正対象列挙（AGENTS.md 1 ファイル）と一致させる。
    pass_criteria: |
      (1)〜(5) すべて確認できる。8 項・9・10 項の文言が原文と完全一致し、旧 2〜4 項の文言と 5 原則の名称が AGENTS.md から消えている。
    on_failure: |
      fix-and-reverify。差し替え本文を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      基準（変更前の main。PR #4216 が先に統合されている場合は統合後の main）と実装 PR の差し替え後 AGENTS.md を比較し、16 行目の機械強制の段落・18 行目以降の全節（基本規則・Windows 環境のファイル入出力規律・ハーネス選定と Git）・1 行目の ADF-COVERS コメントが基準と一致することを確認する。
    pass_criteria: |
      非変更範囲に差分がない。PR #4216 統合済みの場合は、その変更（ADF-COVERS への REQ-126-001 追加・基本規則末尾への 1 行）が保持されている。
    on_failure: |
      fix-and-reverify。意図しない差分を取り除いて再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      実装 PR の変更ファイル一覧（gh pr view --json files または git diff --name-only origin/main）を確認する。
    pass_criteria: |
      差分が AGENTS.md のみである。
    on_failure: |
      fix-and-reverify。AGENTS.md 以外のファイルの変更を取り除いて再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |
      pre-push の検証ゲート（インデックス鮮度チェック・全量整合性チェック・検証エンジンのテストスイート）に合格して push する。あわせて AGENTS.md が UTF-8（BOM なし）・LF であることをバイト単位で確認する。
    pass_criteria: |
      ゲートに合格して push でき、文字符号化・改行コードが維持されている。
    on_failure: |
      fix-and-reverify。失敗原因を取り除いて再検証する。検査のスキップ・無効化・緩和、整合性検査の対象からの除外は行わない。
  - id: TS-005
    target_item: AG-007
    verification: |
      実装 PR の作成と検証（TS-001〜TS-004）が済んだ時点で、PR 番号と検証結果を報告して停止していることを確認する。PR の統合・Issue のクローズ・完了チェックボックスの確定が、監督による受け入れ条件 1〜8 での差分受入確認の後であることを PR・Issue の記録から照合する。
    pass_criteria: |
      報告と停止が確認でき、統合・クローズ・チェックボックス確定は監督の受入確認後である。設計系 PR の工程内での統合はこの限りでない。
    on_failure: |
      fix-and-reverify。停止条件を守らず統合・クローズした場合は、状態を戻すか監督へ報告し、指示を仰ぐ。独断で完了扱いにしない。
realization_actions:
  - id: RA-001
    concern: AGENTS.md 最上位制約節の差し替え
    responsibility: |
      リポジトリルートの AGENTS.md の 6 行目から 14 行目（最上位制約節）を AG-001 の目標の全文へ差し替える。見出しを「## 最上位制約」へ変更し、「本節は他の規則に優先する。」を残す。1〜8 項は依頼文の原文、9・10 項は現行 1 項・5 項の文言のまま番号のみ変更する。16 行目の機械強制の段落・18 行目以降の全節・1 行目の ADF-COVERS コメントは変更しない（PR #4216 統合済みの場合は統合後 main が基準）。ファイルは UTF-8（BOM なし）・LF を維持する。実装 PR の差分は AGENTS.md に限定する。
    ownership_hints:
      - AGENTS.md（リポジトリルート。編集は edit ツールによる行置換で UTF-8(BOM なし)・LF を維持）
    intent: |
      AgentDevFlow を編集するすべてのエージェントが読むリポジトリガイドレール（AGENTS.md）の最上位の規則を、利用者の設計・実装原則 8 項へ置き換える。8 項にない既存 2 規則（Working Tree ＝「現在の姿」・配布物ゼロ汚染）は 9・10 番として維持し、旧 5 原則のうち 8 項と重複する 3 規則は削除する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-001, AG-002]
assembly_evidence: []
case_open_hints:
  epic_needed: false
  decomposition: |
    単一 Issue で完結する（AGENTS.md 1 ファイルの差し替え・docs_chore・direct_case 構成: REQ/Decision/Design 保存なし、Issue 本文で要件管理）。実装 PR を作成し TS-001〜TS-004 の検証が済んだ時点で、PR 番号と検証結果を報告して停止する（AG-007・TS-005）。PR 統合・Issue クローズ・完了チェックボックス確定は監督の受入確認後。並行 Case（PR #4216・Issue #4214・作業ツリー .worktrees/4214-feature・分岐 feature/issue-4214）と本線の未追跡ファイルには触れない（AG-006）。書込み前に毎回 git pull --ff-only で main を最新化する。
  wave_hints: []
draft-meta:
  important-change-notice:
    applicable: false
    reason: 既存の正規成果物（REQ・Decision・Design）への変更を含まないため、重要変更の事前通知義務の対象外。AGENTS.md は正規成果物ではなくリポジトリガイドレールである。変更の意味（リポジトリ全体の最上位ガイドレールの差し替え）は req-define の完了報告で説明する。
  adversarial-review:
    disposition: skip
    reason: |
      (1) 依頼文 8 項は原文変更不可（利用者の確定済み判断）であり、review による文言変更の余地がない。(2) 意味的決定は利用者の決定 3 項と監督の解釈 2 項（利用者提示済み・異論なし）で確定済みで、壁打ち相当は依頼文と依頼後 2 回の質問で完了の明示がある。(3) Decision 判断対象なし（AGENTS.md のみの変更で Decision 作成は禁止事項）。
    self-refutation: |
      対論点位を自ら検討した。(a) 旧 2〜4 項と 8 項の重複・矛盾 → CR-001 で整理済み（削除と 9・10 番維持を確定）。(b) REQ-126-001（開発時の禁止事項を AGENTS.md から確認できること）への影響 → 差替後も AGENTS.md は禁止事項（8 項・9・10 項）を含むため満たされる。PR #4216 未統合でも受け入れ条件 6 が統合後 main 基準を規定する。(c) 参照切れ → 5 原則名称を参照する正規文書は docs/・src/ に不存在、AGENTS.md 固定テストなし、textlint 標準対象外・禁止語なし（CR-003）。(d) 9 項は REQ-103-020 の保持方針と、10 項は IR-059 の検査規則と、いずれも文言維持で整合する。(e) PR #4216 との行重なりなし（入力の監督実測）。
  impact-candidates:
    - 対象: REQ-103-020（docs/requirements/REQ-103.md）。処置: 変更なし。9 番の規則（文書に経緯を書かない）が依拠する保持方針であり、文言を維持するため影響なし。
    - 対象: IR-059（.opencode/skills/repo-agentdev-integrity/rules/ir-059.ts）。処置: 変更なし。10 番の規則（配布物への情報混入の禁止）を検査する機械規則であり、文言を維持するため影響なし。
    - 対象: docs/designs/foundations/design-principles.md の §0。処置: 変更なし（対象外）。従来からある 3 原則の正本であり、今回は変更しない。
    - 対象: REQ-126-001（PR #4216 が AGENTS.md 1 行目へ追加予定）。処置: 変更なし。AGENTS.md の存在確認を求める要件で、差替後も満たされる。受け入れ条件 6 が統合後 main 基準を規定する。
  boundary-risks:
    dependency: AGENTS.md を読む全エージェント・ワークフローへの伝播（最上位規則の内容変更は以後の全挙動に影響）→ 参照切れなしを CR-003・TS-001 で確認し、差分範囲を TS-003 で AGENTS.md に限定する。
    client_server: 該当なし（静的文書の差し替えで外部契約・API 変更なし）。
    execution: pre-push 検証ゲートが AGENTS.md 変更で失敗する可能性 → AGENTS.md 固定テストは不存在（CR-003）。TS-004 でゲート通過を検証する。
    build_runtime: AGENTS.md は src/ 配下の配布物ではなく配布境界検査の対象外 → 影響なし。リリースも不要（AG-005 対象外）。
    environment_propagation: 並行 Case（PR #4216）との競合 → 最上位制約節（6〜14 行目）は PR #4216 の変更（1 行目・基本規則末尾）と重ならない（監督実測）。AG-002・AG-006・TS-002 で統合後 main 基準と非干渉を規定する。
  split-forecast:
    target: new
    metrics: {requirement_lines: 1, concern_classifications: 1, artifact_types: 1, spec_separation_violations: 0}
    signals: {requirement_lines: 0, concern_classifications: 0, artifact_types: 0, spec_separation: 0}
    total: 0
    recommended_action: no-action
    thresholds_ref: agentdev-req-structure-diagnostics の SPLIT 定量閾値
```

# summary

AGENTS.md の最上位制約節（6〜14 行目）を利用者の設計・実装原則 8 項へ差し替える要件を 1 実行単位として引き継ぐ。8 項は依頼文の原文を一字変更せず使う。8 項にない現行 1 項・5 項は 9・10 番として文言を維持する。変更対象は AGENTS.md のみで、Decision・設計文書・REQ・テスト・スキル・設定は変更しない（CR-002）。実装 PR の検証完了後、監督の受入確認を待って統合・クローズする停止点を AG-007・TS-005 で規定する。
