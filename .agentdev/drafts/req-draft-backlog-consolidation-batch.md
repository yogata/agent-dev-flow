---
draft_type: req_draft
topic_slug: backlog-consolidation-batch
status: saved
created_at: 2026-08-18T09:34:49+09:00
source_rus:
  - RU-0046
  - RU-0047
  - RU-0048
  - RU-0049
  - RU-0050
  - RU-0051
  - RU-0052
  - RU-0053
  - RU-0054
  - RU-0055
  - RU-0056
  - RU-0057
  - RU-0058
  - RU-0059
  - RU-0060
  - RU-0061
  - RU-0062
  - RU-0063
  - RU-0064
  - RU-0065
  - RU-0066
  - RU-0067
  - RU-0068
  - RU-0069
  - RU-0070
  - RU-0071
  - RU-0072
  - RU-0073
  - RU-0074
  - RU-0075
  - RU-0076
  - RU-0077
  - RU-0078
  - RU-0079
  - RU-0080
  - RU-0081
  - RU-0082
  - RU-0083
  - RU-0084
  - RU-0085
  - RU-0086
---

# draft-data

```yaml
work_type: feature

scale: large

spec_actions_consumed: true

summary: |
  backlog-review が生成した RU-0046〜0086（41件）を一括要件化したバッチドラフト。
  Epic #2189（Artifact Graph 実装）・Epic #2134（実番号化）残差、learning/intake 由来の
  運用知見 spec 候補、inspect-docs 検出事項（F-01〜F-08）を統合し、
  (1) AG/TIM SPEC・語彙カタログの確定（実測基準でカタログを修正）、
  (2) integrity/checker 実行契約の確定（NG baseline・IR-055 狭域化・checker 実行契約）、
  (3) 検証実行環境の標準化（worktree 帰属確認・pwsh 読み取り・bun test 形態・stash 運用）、
  (4) 配布物表記・様式の整備（工程ラベル様式の正規契約化・プレースホルダ表記・一文一行是正）、
  (5) REQ/Decision 体系の再構成（REQ-025/026/028 の RETIRE・DEC-008/015 承認・移行注記整理）
  の5テーマで合意した。RU-0001（promote 系 HITL 自律確定）は機能変更として性質が異なるため
  本ドラフトの対象外とし、次回の req-define で独立要件化する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      AG SPEC・TIM 語彙カタログ SPEC（ともに draft）を確定する。語彙移行の方向は「実測に基づき
      カタログを修正して確定」とする（CR-001）。PR #2195 Level 2 統合後の実装を基準に、影響方向の
      値名・supersedes/extends 参加区分・defined_in→depends_on 集約等の移行残差をカタログへ反映する。
      標準コア語彙へ実現系列関係型を追加し、implementation プロファイルの参加範囲
      （specifies/verifies/validates）を確定する。implementation プロファイルが常に空結果となる
      欠陥は実装側是正として扱う。Epic #2189 の SPEC 反映提案群（manifest スキーマ 2.0.0 の
      「決定論性と鮮度」節、query_graph サブコマンド拡張の「問い合わせ結果の出力形式」節、
      augmentation スキーマ4拡張点の「augmentation モデル」節、「ワークフロー利用」割当表への
      backlog-review 行追加）を AG SPEC 確定時に取捨選択して反映する。索引・集約成果物の
      デフォルトコアでの扱い（専用 node_type 追加の要否）を語彙確定と同時に判断する。
  - id: AG-002
    content: |
      高位問い合わせ標準候補数上限の確定手順。RU-0046（AG-001）完了後に、candidate_limit
      サブスイートの暫定関係意味表（semantics.ts）を TIM 語彙カタログ定義へ置換し、回帰を再実行して
      期待出力の差異を文書化した上で、標準上限値（初期値 30 と実測推奨値 12 の乖離）を
      REQ-040-008・REQ-020-006 に従い最終決定する。決定手順（recommended_standard_limit 算出・
      増幅実測値との突合）を AG SPEC「高位問い合わせプロファイル」節へ明文化し、期待出力の
      差分文書化を受け入れ条件に含める。
  - id: AG-003
    content: |
      artifact-graph scripts/lib/config.ts の 250 純LOC 超過解消。PR #2198 マージ後の最新 main 構成で
      純LOC を再計測し、超過残存時に専用分割 Issue として分割する。再計測の結果、超過が解消済みの
      場合は Issue 側で完了判定して close する運用を許容する（maintenance 系、case-open 直接）。
  - id: AG-004
    content: |
      AG SPEC 旧見出し「利用上の防護」参照の「ワークフロー利用」への追従更新。docs/specs/commands/ 配下
      5ファイル（req-define、spec-save、case-open、case-close、backlog-review）と
      docs/specs/skills/agentdev-adversarial-review.md の計6ファイルが対象。src 側は PR #2197 で
      修正済みのため docs 側6ファイルの追従のみで完了する（docs_chore 系、case-open 直接）。
  - id: AG-005
    content: |
      REQ-021・AG SPEC の中黒（・）流動的並列表記（REQ-021-005「生成・鮮度」、AG SPEC の
      「提供する判断・操作」等8箇所）を読点または箇条書きへ置換する。REQ-021 本文の修正は
      req-save 工程の範囲（ACT-REQ-002）、AG SPEC 側は case 実施として実施単位を分ける
      （docs_chore 系）。
  - id: AG-006
    content: |
      backlog-auto SPEC 本文粒度の確定。agentdev-workflow-backlog-auto SPEC「fan-in 判定」節へ
      系統別結果状態読み替え表（learning-promote の inbox.md 不在時の子コマンドエラー報告を
      対象なし終了へ読み替える mapping）を SPEC 本文へ昇格する。直列化キューの実行単位
      （子ワークフロー定義の永続化ポイント = commit 単位）は reference 参照を維持する
      （判断基準「正典側に必要な契約粒度: 実行の再現性に必要か、reference 詳細で十分か」）。
  - id: AG-007
    content: |
      worktree・実行形態環境差の検査失敗の帰属確認手順の明文化と環境依存失敗の是正。
      帰属確認の二段階手順（単体再実行→base/main 再現）、main 等価再現手順（一時 junction、
      src 側代替経路 --profile source、bun install --cwd）を git-worktree-test-fallback SPEC へ
      反映する（ACT-SPEC-005）。個別是正として ir035 の src/opencode/skills/ への fallback 実装、
      check_extensions の cwd 非依存化・順序依存汚染の切り分け・worktree 環境対応
      （isInsideWorktree 判定による skip または src/opencode/ への fallback）を含む。
      切り分けの結果、checker 実装修正が複数に分かれる場合は case-open 時の execution_unit 構成に委ねる。
  - id: AG-008
    content: |
      NG baseline 運用契約の明文化。integrity-contracts SPEC「NG baseline 運用手順」節へ
      (1) entry 追加の機械生成必須・手書き禁止、(2) パス bucket key の環境依存対策
      （正規化または unmatched additions/unmanaged delta 対警告）、(3) baseline 生成環境の前提、
      (4) 由来ラベル（legacy）と報告分類（baseline-known 集計）の対応明確化、を反映する。
      パス正規化・対警告の checker 実装修正（check_integrity.ts / check_extensions.ts）は
      SPEC 明文化と分離して段階対応可能とする。baseline 分類体系
      （approved additions / baseline-known 等の報告分類）の変更は対象外とする
      （bucket key 仕様自体は維持）。
  - id: AG-009
    content: |
      NG baseline 暫定管理残課題（N01/N16/N17）の実施と baseline entry 除去。N01
      （REQ-021-003 の v2:ADR-006→DEC-006 旧参照更新）は req-save 工程の範囲（ACT-REQ-001）、
      N16（check_integrity.ts の categoryToCheckPattern map へ「Skill rename 対称性」カテゴリ登録、
      check_skill_rename_symmetry.ts の scriptFiles 対象登録）と N17
      （src/opencode/commands/agentdev/case-close.md へ capture-boundaries 参照追加、#2071 以降欠落）は
      case 直接実施とする。各是正後に対応する baseline entry を除去することを受け入れ条件とする。
      N17 のパス bucket key 表記問題は RU-0053（AG-008）と連動するため参照を維持する。
  - id: AG-010
    content: |
      Workflow Skill soft guard 機械検査の統一。check_workflow_preventive.ts item 3
      （workflow-soft-guard）の検出語をリテラル「soft guard」要求から、agentdev-skill-authoring
      SPEC 層1（authoring 規則 AG-004）の簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）の
      肯定検証へ更新し、lint_skills.ts（authoring 規則 AG-004 実装）と検出語を統一する。SPEC 準拠の
      配布物が checker 不通過となる恒常的矛盾（PR #2185 実装後、item 3 のみ fail）を解消する。
      checker と SPEC の検証整合（authoring 規則 AG-004）を確認条件に含める（bugfix 系、case-open 直接）。
  - id: AG-011
    content: |
      lint_skills AG-005 規則群（層1〜2機械検査規則、hard 6規則 + warn 1規則、PR #2184 で
      main 入り済み）の正典登録・導線整備。新規カテゴリ追加判定フロー（REQ-0145-005）に従って
      catalog 登録の要否を判断し、integrity-rule-catalog.md と rule-ownership.md へ登録する
      （ACT-SPEC-007/008）。repo-agentdev-integrity SKILL.md「検査カテゴリ」表へ AG-005 行
      （lint_skills.ts、層1〜2記述基準検査）を追加する（SKILL.md 側は case 実施）。
  - id: AG-012
    content: |
      Decision 索引 AUTOGEN 生成・検査契約の確定。(1) decision-baseline-count キャプション
      （accepted + proposed の2値形式）の index-auto-generation SPEC 例示への整合、
      (2) decision-baseline-table 全件出力規則（現行 Decision 全件を accepted/proposed/superseded
      ステータス列付きで出力）の明文化、を index-auto-generation SPEC へ反映する（ACT-SPEC-009）。
      check_integrity.ts の decision-* block の IR-061 検査対象化と adr/docmap 残余参照
      （docs/adr パス参照、ADR_*_BLOCK_ID import 等）の整理は checker 改修（case 直接）として
      分離実施可能とする。
  - id: AG-013
    content: |
      計測日導出の安定化。AUTOGEN 計測日の導出方法を実行時日付（new Date()）から安定した値
      （対象ドキュメント群の最終コミット日付）へ変更する方式を index-auto-generation SPEC と
      autogen-freshness-gate SPEC で確定する（ACT-SPEC-010/011）。導出方式変更に伴う
      generate_indexes.ts 実装修正と、IR-061 の構造的再検出（日次で鮮度を失い再検出する構造）の
      解消確認を受け入れ条件に含める。
  - id: AG-014
    content: |
      checker 実行契約 SPEC（draft）の確定。(1) 機械検査のパターンマッチ・網羅検査設計の標準規約
      （行全体マッチ統一、列挙ベース網羅検査（Get-ChildItem -Recurse + -LiteralPath）と件数整合の
      二重確認、階層 ID 検索の3点設計（単独/行ID/前置一致除外）、宣言的データ（YAML）の
      silent skip 禁止 + 契約テスト固定）、(2) 検出対象除外規定の正規化（node_modules 系
      git 管理外ディレクトリのスキャン除外、frontmatter 信号キー baseline_for/audit_for の正規列挙、
      監査記録・AUTOGEN に対する免除規定）を checker-execution-contracts SPEC へ反映する。
      TS-009 の node_modules 除外・retired-req の免除判定実装（RETIREMENT_CONTEXT_RE 拡充か
      ファイル種別ベースか）は比較検討を経て case 側で実施する。既存 checker のマッチ実装の
      一括変更は要求しない（新規・修正時の標準として適用）。
  - id: AG-015
    content: |
      IR-055 placeholder exemption の仕様確定。exemption を行単位の免除（{...} を含む行全体を
      検査対象外）から「プレースホルダと同一トークン近傍」への狭域化とする（CR-002）。
      プレースホルダ除去に伴う新規 delta 顕在化挙動（PR #2185/#2187 で実際に発生）を文面化する
      （狭域化により顕在化は減少するため注記程度となる）。integrity-rule-catalog（IR-055）の
      変更は spec-save 手続きの範囲とする（ACT-SPEC-013）。checker 実装（IR-055 検出）の
      狭域化準拠への更新は case 実施（OU-0015 の実施範囲）とする。
  - id: AG-016
    content: |
      配布物プレースホルダ ID 表記の整理。src/opencode/commands/agentdev/*.md と SKILL.md 本文
      （参照選択表以外の行。agentdev-doc-writing 冒頭「QG-{N}〜QG-{N}」、agentdev-quality-gates の
      Gate 一覧表等）に残置するプレースホルダ ID 表記（REQ-{NNNN}-{NNN}、QG-{N}、（REQ） 等）を
      棚卸しし、具体値解決・表現再設計・意図的残置に分類する。配布依存境界（REQ-029、DEC-014）と
      IR-055 の exempt 仕様（AG-015 確定後）に整合する表記を確定する。対象ファイル数が多いため
      実施は複数 case への分割を許容する。
  - id: AG-017
    content: |
      機械置換規則の確定。mechanical-replacement-rules.md
      （src/opencode/skills/agentdev-doc-writing/references/、配布スキル reference のため case 実施）の
      (1) §4（一文一行機械判定）へ ordered list 扱い（ordered list 項目は prose として分割し、
      継続文はマーカーなし後続行とする運用。実装 apply-mechanical-replacement.ps1 と過去是正実績
      PR #1091 と整合）の明文化、(2) §2 パターン D（テーブルセル em-dash → | - | 置換）の判別基準
      （N/A プレースホルダは置換対象、意図的マトリックス表記（肯定表現の —）は維持）の明文化、
      (3) docs 側残存セルの扱い確定と PR #2154 エビデンス記述（「docs + src/opencode で 0 件」の
      実態不一致）の補正方法の整理。
  - id: AG-018
    content: |
      一文一行機械判定残存違反（docs 57行 + 配布物 716行）のは正方針（CR-011）。
      docs 側（docs/requirements/** 11違反行、docs/decisions/** 46違反行）の違反行特定は
      配布物側と同一の case（OU-0018）で実施し、特定された docs 側修正は後続の req-save /
      Decision 更新手続き（是正用の別要件doc）を経由して適用する（本ドラフトの artifact_actions
      には含めない）。配布物側（src/opencode/** 716違反行）は機械是正を複数 case への分割で
      実施する。配布物精査（PR 2111 系）との重複・担当整理を含めて適用可否を判断する。
  - id: AG-019
    content: |
      agentdev-gh-cli ローカル版参照構造の確定（CR-003）。git CLI 直接操作の初期化要件は
      src/opencode-local/agentdev-gh-cli/local-procedures.md へ追記する（standard-procedures.md は
      新設しない）。SPEC「ローカル版の扱い」節へローカル版 references 実体構成の明示と、
      「委譲時の一時ファイル代替配置先」節のローカル版への適用可否を定義する（ACT-SPEC-014）。
      src/opencode-local/** の新規作成・追記は case 側の実施とする。
  - id: AG-020
    content: |
      pwsh 経由ネイティブコマンド出力の安全な読み取り経路。検証証拠の読み取り経路を Node.js
      （spawnSync による status/stdout 分離取得 + fs.writeFileSync による UTF-8 明示書き出し）へ
      統一し、agentdev-gh-cli references（standard-procedures.md、verify.md）の READ 安全手順を
      gh CLI 限定からネイティブコマンド全般へ拡張明記する（配布 skill 手続きの追記、case 実施）。
      case-run / case-close の検証手順 references へ exit code が意味を持つコマンドの stdout
      退避形式を追記する。execSync の全面禁止とはせず、成功が見込める単発 READ は維持する境界を
      明確化する（PR #1600/#2172 系、Epic #1719 Wave 4 の再発防止）。
  - id: AG-021
    content: |
      完了報告テンプレート二重管理の是正。skill 側
      （src/opencode/skills/agentdev-workflow-templates/templates/case-open/）を正規所有者として残し、
      command-local 側（src/opencode/commands/agentdev/templates/case-open/{standard,epic,multi-req-epic}.md）
      を廃止（または参照統一）する。参照している command・checker がある場合は参照更新を含める
      （maintenance 系、case-open 直接）。
  - id: AG-022
    content: |
      工程・サブステップ識別子様式の command-file-format SPEC 確定（CR-004: 正規契約化）。
      (a) サブステップ階層形式（STEP-N-M、STEP-N-M-K）と副番号開始値（epic-wave-close.md の
      ゼロ起点 E4-0 の適否）を確定する。(b) STEP model 対象外型 SKILL.md の工程一覧表ラベル契約を
      確定する。(c) 成果物間の工程ラベル参照形式（Workflow Skill から command 公開ラベル参照時の
      command 修飾、Capability Skill・SPEC から Workflow Skill 工程参照時の実番号 STEP-S5 等）の
      使い分け規約を確定する。E4-0 の振り直し（E4-1 起点へ）の要否は規約確定後に判断する。
      PR #2153 による16 Skill 横断の運用統一（merge fb0a5ac5）を正規化する。
  - id: AG-023
    content: |
      工程・Step 参照残存の是正（AG-022 の様式確定結果に従って実施）。(1) intake-capture.md
      （工程-1〜5）と intake-from-github.md（工程-1〜8）の公開順序要約を ### Step N 形式へ揃える
      （commands_e2e.test.ts 期待値の更新を含む）。(2) case-run.md workflow 節の親 Step 7 を持たない
      孤立見出し ### Step 7-1 の連番規則適合（親見出し復元または番号振り直し、Workflow Skill 側
      STEP-S5-1 との対応表記確認）。(3) Capability Skill・SPEC 5箇所の旧 command 番号（Step N）参照
      更新（agentdev-git-worktree・agentdev-gh-cli・agentdev-quality-gates の各 references、
      agentdev-workflow-orchestration、docs/specs/foundations/system.md。
      workflow-orchestration の case-run Step 6 は stale 参照として優先除去）。
  - id: AG-024
    content: |
      authoring 基準の強化。(1) 権威情報源宣言 1以下の計測単位（dispatch 宣言と soft guard 宣言節を
      除く明示的宣言サイトの数）を agentdev-command-authoring SPEC「command authoring 基準
      （層1〜3適用）」節へ追記して正規化する。(2) 「詳細は〜参照」定型 1以下の機械検査化に必要な
      例外規則（project extensions boilerplate 行4の消費、project-extensions SKILL.md の定義言及
      4件の例外扱い）を明文化する。(3) agentdev-skill-authoring SPEC「skill 記述基準（層2）」の
      references 分割基準へ頻用併用信号規則（参照選択表の同一行複数掲載 = 統合候補として審査。
      PR #2187 の統合実績に基づく）を追記する。(4) 配布物本文の記述削減・抽象化の前に、対象ファイルを
      参照する *.test.ts・checker の固定トークン（routing token、期待値固定セクション、概念名文字列）の
      事前 grep を必須ステップとして authoring skill SKILL.md へ追加する（自動化を必須とせず
      grep 対象の代表例列挙を含む。両立運用の回避パターンを併記）。SPEC 追記は spec-save 経由
      （ACT-SPEC-016/017）、SKILL.md 手順追加は case 実施。
  - id: AG-025
    content: |
      Epic Wave 並列 PR の同一ファイル衝突の抑制。(1) execution_unit 構成の依存判定へ変更ファイル重複・
      AUTOGEN 対象ファイル重複・同一ファイル行近接の機械置換を依存ヒントとして反映する
      （epic-wave-model SPEC と execution-unit-construction.md のエッジ判定要素追加。連結成分
      アルゴリズムの構造は維持し、エッジ判定要素の追加に留める）。(2) 重複検知時の Wave 構成判断基準
      （直列化・依存付与・単一 PR 集約）を明記する。(3) case-auto SPEC の Level 2 解消レシピへ
      「AUTOGEN は新 base 上での再生成で解消する」正道を明記する。全ファイル重複の全面禁止とは
      しない（重複の種別・近接度による判断を含む）。同一リージョン文言選択・AUTOGEN ブロック再生成
      同士・隣接行機械置換・直交意図の semantically 競合の4反復事象に根拠する。
  - id: AG-026
    content: |
      Parent 配置・Epic 追跡テーブル正規形の正典化（CR-005）。Parent 先頭行配置・分解テーブル
      {wave}-{seq} 形式の正規形を agentdev-workflow-templates SPEC へ正規記載する
      （テンプレート選定規則は workflow-templates、Wave 構成は epic-wave-model の責務分割に従う）。
      テンプレートコメント（issue_desc_child.md / issue_desc_epic.md）と agentdev-epic-tracker
      references の事実上の正典状態による二重管理・乖離リスクを解消する。
  - id: AG-027
    content: |
      distribution_boundary_routing_contract.test.ts のセクション抽出期待値を旧「### Step 3-1:」から
      実番号形式「### STEP-3-1:」（OU-010 ラベル統一、commit fb0a5ac5）へ更新する
      （または大小文字・ハイフン様式に依存しないマッチングへ変更する）。修正後に bun test 全件で
      7 fail の解消を確認し、Epic #2134 の完了条件3 を再評価して Epic をクローズする
      （bugfix 系、case-open 直接）。
  - id: AG-028
    content: |
      .agentdev/tmp/ 一時ファイルのクリーンアップ終了条件の整備。(1) case-run（STEP-S6/W5）、
      case-close（完了判定・E6）、case-auto（STEP-8）、その他 tmp/ に書くコマンドの終了条件・
      完了報告 STEP へ「当該実行で .agentdev/tmp/ に作成したファイルが残存していないこと」の確認を
      追加する。(2) gh-cli standard-procedures.md の READ 経路（gh-read-*）にも WRITE と同様の
      cleanup 規定を拡張し、手順例へ mkdir（New-Item -ItemType Directory -Force /
      mkdirSync(recursive:true)）を追加する。(3) .gitignore への .agentdev/tmp/ 追加は
      明示パス staging 運用との整合確認を条件とする（スキル終了条件と gh-cli 手続きは case 実施）。
  - id: AG-029
    content: |
      agentdev-project-extensions の description 側 DO NOT USE FOR へ「extension 自体の作成・編集
      （プロジェクト側の責務）」項を反映する。反映時は agentdev-skill-authoring の description
      記述基準（AG-004 簡潔トリガー項との整合）に従う（docs_chore・軽微修正、case-open 直接）。
  - id: AG-030
    content: |
      /repo/*（docs-check.md）の前出出力検証表移行と EN. lettered prefix 規約節の整理。
      EN. lettered prefix 規約節は「/repo/* 限定」へ明記する（公開 /agentdev/* コマンドでは
      当該形式が使われなくなったため）。/repo/* の前出出力検証表への移行時に check_command_format.ts
      へ repo-local 向け表形式検査の対象拡張を検討する。/repo/* は repo-local・配布対象外のため
      配布物の変更とは分離して扱う。
  - id: AG-031
    content: |
      ファントム REQ-010 行参照の所有権確定。現行 REQ-010（最大 062）に存在したことのない
      旧 REQ-010-NNN 番号（063〜064、070〜088、089〜099、108〜129、136〜151、225、236〜239、
      244〜245、250〜251、255〜262 等）が docs/** に残存する。番号群ごとに REQ-036〜039への再配線・
      監査記録としての履歴文脈注記・引用削除のいずれかを、参照主題から現行 REQ-036〜039 の要件行への
      対応が確定できるものは再配線、監査記録・履歴文脈としての参照は履歴文脈注記、対応不明または
      参照価値を欠くものは削除、の基準で確定する。AUTOGEN 再生成が必要な対象は
      generate_indexes 修復後の実施を前提とする（当時の記録を踏襲）。docs_chore 系。
  - id: AG-032
    content: |
      reference-path-existence 検出拡張（PR #2152 の4点）の正規反映。integrity-contracts SPEC
      「reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-020）」節へ
      拡張4点（ネストサブディレクトリ参照検出、skill references/*.md 走査、reference ファイルの
      文脈解決、CJK 句読点隣接の誤延長防止）を正規反映する。実装側は main 入り済み
      （merge 4bf264b7）のため SPEC 文面の追従のみで完了する。
  - id: AG-033
    content: |
      document-model L580 cleanup 実行契約の適用経路確立。document-model.md L580
      「恒久基準と非規範情報の整理」cleanup 実行契約と実際の cleanup 実行者（inspect 系スキル群）の
      間の適用経路を確立する。推奨検討対象（agentdev-doc-diagnostics、
      agentdev-req-structure-diagnostics、agentdev-inspect-skills、agentdev-learning-pipeline、
      agentdev-intake-pipeline）ごとに L580 の明示参照 or 実行時適用の要否を現行確認の上で確定する。
      対象スキルの SKILL.md 変更を伴う（case 実施）。
  - id: AG-034
    content: |
      git stash 運用手順の標準化を agentdev-git-worktree SKILL.md（および references）へ反映する。
      (1) worktree 検証での一時退避に stash を使わず detached worktree による baseline 比較を標準
      手順として明記する。(2) やむ得ない stash 利用時の規則（@{} 引数の引用符必須、-u 使用時の除外
      pathspec）を明記する。(3) 複数 worktree 環境での stash 往復前確認を追加する
      （PR #2148/#2201 の障害再発防止）。配布依存境界（プロジェクト固有 ID の直書き禁止）を遵守し、
      段階的開示を維持する（SKILL.md 簡潔、詳細は references）。配布 skill 手続きの追記（case 実施）。
  - id: AG-035
    content: |
      bun test 実行形態契約を agentdev-quality-gates SPEC（full integrity suite 合格基準、QG-4）へ
      反映する。(1) full suite 実行手順への ./ prefix 付き対象ディレクトリ明示指定と
      「Ran N tests across M files」の N/M 件数突合（急減していないかの妥当性検証。固定値の
      期待値化はしない）の必須ステップ化。(2) PR 本文・検証手順の証拠記録への実行 cwd と起動
      コマンド形式の明記要求。(3) cwd 依存テスト混在スイートの実行形態と制約の運用注記。
      case-close / docs-check の full suite 実行手順と PR 本文テンプレート（Test Strategy 結果欄）へ
      の記録欄追加を含む（手順・テンプレート側は case 実施）。QG-4 の識別子中心評価の構造は維持する。
  - id: AG-036
    content: |
      REQ-025/026/028 の廃止・再構成（CR-006/007/008）。(1) REQ-025（IR 検証ルールの Decision 移行
      残存修復）は修復完了済み・適用範囲の IR-036 は DEC-013 で削除済みの移行完了状態として
      RETIRE する。(2) REQ-026（skill rename 対称性検査観点）は行002（frontmatter id と物理 path の
      不一致検出）を REQ-010 へ吸収した上で RETIRE する（行001/003 は実装済み作業記述）。
      (3) REQ-028（IR 体系の実効性監査と存在条件厳格化）は恒常行を移管の上 RETIRE する。
      移管先: 行001/002/012/013（8項目存在条件・非実効 IR 禁止・新規登録 gate・件数削減非評価）と
      行006（一時移行検査の扱い）は DEC-013、行007/014（文脈解釈検査の inspect 移管・観点
      レジストリ所有）は REQ-036、行015/016（宣言的データ YAML の schema・detector 命名規約と
      機械的逆引き）は integrity-contracts SPEC。行003〜005/008〜011（監査・分類・削除の作業記録、
      DEC-013 で実施済み）は廃止する。廃止判断の基準は REQ-001 廃止候補判定基準（移行完了状態、
      作業手段主題）と REQ-004-009 に従う。
  - id: AG-037
    content: |
      proposed Decision（DEC-008/015）の現行根拠参照の扱い確定（CR-009: 承認ルート）。
      DEC-008（case-auto の限定的親判断解決）と DEC-015（ADF決定論的実行中核と実行基盤実行機構の
      責務分界）を Decision ライフサイクルの確認手続きに従い承認（proposed から accepted へ）する。
      これにより REQ-001-021（承認状態の判断記録のみを現行根拠として使用）と、REQ-002-035 から
      DEC-015 への参照、case-auto/case-run/case-close SPEC から DEC-008 への参照、
      harness-separation-model.md（L69）から DEC-015 への参照が現行根拠として矛盾のない状態に
      なる。DEC-017（proposed）は関連情報参照のみで現行根拠扱いではないため対象外。
  - id: AG-038
    content: |
      docs/README.md Decision 索引の陳腐化是正。(1) Decision 表 DEC-014 行の status 表記を
      proposed から accepted へ更新する（実体 DEC-014.md（2026-08-14 更新 accepted）と
      decisions/README.md の status 表を正とする）。(2)「実行時パッケージ境界」（L122）と
      「ローカル版 OpenCode 生成」（L124）の同一ファイル（specs/local/runtime-package-boundary.md）への
      二重リンクを整理する（後者が旧名称残存）。docs_chore 系（case-open 直接）。
  - id: AG-039
    content: |
      audits/・baselines/ ディレクトリの位置づけと specs/README.md 登録規定の拡充。
      docs/specs/integrity/audits/（5ファイル）・baselines/（1ファイル）の Report としての位置づけを
      specs/README.md 登録規定へ明示する。6ファイルの索引導線（一覧表での扱い）を
      AUTOGEN 計測表（spec-health-metrics の SPEC としての計上）との整合も含めて確定する。
      document-model の Report 分類は配置を許容しており、配置そのものは変更しない。
  - id: AG-040
    content: |
      廃止済み agentdev-doc-map 参照残置の是正。doc-diagnostics SPEC（draft）本文の廃止済み配布
      スキル agentdev-doc-map（REQ-013-002/003 で廃止、実体不存在）参照4箇所（L18/L41/L69/L75）を
      現行の責務分担記述へ更新する。受け入れ条件に廃止済みスキル参照の残存確認（grep 0件）と
      旧パスリンク（L188 等）の解消を含める（spec-save 経由、SPEC 確定時の修正として）。
  - id: AG-041
    content: |
      要件行内の移行注記（旧番号・移管記録）残存の整理（CR-010: 履歴文脈注記への置換）。
      REQ-004-053「〔分割元 REQ-006-004〕」、REQ-017-002「REQ-030-004 維持、旧番号 REQ-006-004」、
      REQ-036-022「baseline_status は REQ-028-010 へ移管」、REQ-006 本文「分割記録」節の4箇所を
      履歴文脈注記へ置換する。REQ-001-014（現行文書の本文に再編工程固有の識別子を含めない）と
      移行期の追跡要件（REQ-001-040）との両立判断として実施する。低優先
      （inspect-promote HITL 確定どおり処理順序は後ろ倒しを許容）。REQ 本体の変更は req-save 経由。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-009]
    content: |
      REQ-021-003 の v2:ADR-006 参照を DEC-006 へ更新する（N01 是正）。旧参照のままであるため
      docs/requirements/** が編集禁止範囲として NG baseline entry（N01）で暫定管理されていた状態を
      解消する。修正後に N01 の baseline entry を除去する。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-005]
    content: |
      REQ-021-005「生成・鮮度」の中黒流動的並列表記を読点または箇条書きへ置換する
      （TS-QC-001 機械判定候補。AG SPEC 側8箇所は case 実施側で対応）。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-025.md
    source_items: [AG-036]
    content: |
      REQ-025（IR 検証ルールの Decision 移行残存修復）を RETIRE する。全要件行が反映作業そのもの
      （REQ-004-009 違反）で修復内容は完了済み、適用範囲の IR-036 は DEC-013 で削除済みの
      移行完了状態。retired/ へ移行し、廃止理由（移行完了状態）を記録する。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-026.md
    source_items: [AG-036]
    content: |
      REQ-026（skill rename 対称性検査観点の targeted docs guard 追加）を行002
      （frontmatter id と物理 path の不一致検出）の REQ-010 への吸収を伴って RETIRE する。
      行001/003 は targeted docs guard として実装済みの作業記述。REQ-010 側に行002相当の
      検査観点（frontmatter id と物理 path の不一致検出の恒常検査契約）を追加した上で
      retired/ へ移行する。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-028.md
    source_items: [AG-036]
    content: |
      REQ-028（IR 体系の実効性監査と存在条件厳格化）を恒常行の移管を伴って RETIRE する。
      移管先: 行001/002/012/013（8項目存在条件・非実効 IR 禁止・新規 IR 登録 gate 2種・件数削減
      非評価）と行006（一時移行検査の扱い）は DEC-013 の該当決定として記録、行007/014
      （文脈解釈検査の inspect 移管・観点レジストリ所有）は REQ-036 へ追記、行015/016
      （宣言的データ YAML の schema・detector 命名規約と機械的逆引き）は integrity-contracts SPEC
      （ACT-SPEC-006 と同時反映）。行003〜005/008〜011（監査・分類・削除の作業記録、DEC-013 で
      実施済み）は廃止。移管完了後に retired/ へ移行する。
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    source_items: [AG-041]
    content: |
      REQ-004-053「〔分割元 REQ-006-004〕」の移行注記を履歴文脈注記へ置換する
      （REQ-001-014 と REQ-001-040 の両立。旧番号の直接表記を排し文脈説明形式へ）。
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-017.md
    source_items: [AG-041]
    content: |
      REQ-017-002「REQ-030-004 維持、旧番号 REQ-006-004」の移行注記を履歴文脈注記へ置換する。
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-041, AG-036]
    content: |
      REQ-036-022「baseline_status は REQ-028-010 へ移管」の移行注記を履歴文脈注記へ置換する。
      あわせて REQ-028 行007/014 の移管受入れ（文脈解釈検査の inspect/diagnostics への移管原則、
      診断観点の正規レジストリ所有）を REQ-036 の要件行として追記する。
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-041]
    content: |
      REQ-006 本文「分割記録」節の移行注記を履歴文脈注記へ置換する（分割は 2026-08-14 完了済み）。
  - id: ACT-REQ-010
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-036]
    content: |
      REQ-010（自己監査コマンド docs-check）へ REQ-026 行002 相当の検査観点（frontmatter id と
      物理 path の不一致検出の恒常検査契約）を要件行として追加する。REQ-026 の RETIRE
      （ACT-REQ-004）に伴う吸収先であり、skill rename 対称性検査（targeted docs guard）が
      対象としていた frontmatter id と物理 path の不一致検出を恒常検査として存続させる。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-008.md
    source_items: [AG-037]
    content: |
      DEC-008（case-auto の限定的親判断解決）を承認する。Decision ライフサイクルの確認手続きに従い
      status を proposed から accepted へ更新し、承認確認の記録を追加する。case-auto/case-run/case-close の
      accepted SPEC が規範的根拠として引用している実態との整合を解消する。
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-015.md
    source_items: [AG-037]
    content: |
      DEC-015（ADF決定論的実行中核と実行基盤実行機構の責務分界）を承認する。Decision ライフサイクルの
      確認手続きに従い status を proposed から accepted へ更新し、承認確認の記録を追加する。
      REQ-002-035 と harness-separation-model.md（L69）が現行根拠として引用している実態との整合を解消する。
  - id: ACT-DEC-003
    artifact: decision
    operation: append
    target: docs/decisions/DEC-013.md
    source_items: [AG-036]
    content: |
      DEC-013（IR 登録モデルの簡素化）へ REQ-028 の恒常行移管を記録する。移管対象: 行001/002
      （8項目存在条件・非実効 IR 禁止）、行012（新規 IR 登録 gate 2種）、行013（IR 件数削減数で
      の非評価）、行006（一時移行検査の扱い）。REQ-028 の RETIRE（ACT-REQ-005）に伴い、これらの
      恒常契約の正規 home を DEC-013 の該当決定として記録する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: traceability-model
    target_area: TIM 語彙カタログ（語彙体系・関係型・プロファイル定義・索引・集約成果物の役割識別）
    source_items: [AG-001]
    content: |
      TIM 語彙カタログを実測基準で確定する。(1) 影響方向の値名・supersedes/extends 参加区分は
      PR #2195 Level 2 統合後の実装（lib/tim.ts）を基準にカタログを修正する。(2) defined_in から
      depends_on 集約への移行残差をカタログへ反映する。(3) 標準コア語彙へ実現系列関係型を追加し、
      implementation プロファイルの参加範囲（specifies/verifies/validates）を定義する。
      (4) 索引・集約成果物（README 等）の役割識別のデフォルトコアでの扱いを定義する
      （専用 node_type 追加の要否を含む）。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-artifact-graph
    target_area: AG SPEC draft 確定（決定論性と鮮度・問い合わせ結果の出力形式・augmentation モデル・ワークフロー利用）
    source_items: [AG-001]
    content: |
      AG SPEC へ Epic #2189 の SPEC 反映提案群を取捨選択して反映する。(1) manifest.json スキーマ
      2.0.0 の「決定論性と鮮度」節反映、(2) query_graph.ts サブコマンド拡張の「問い合わせ結果の
      出力形式」節反映、(3) augmentation スキーマ4拡張点の「augmentation モデル」節反映、
      (4)「ワークフロー利用」割当表への backlog-review 行追加。実装側の対応完了状態と突合して採用する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-artifact-graph
    target_area: 高位問い合わせプロファイル
    source_items: [AG-002]
    content: |
      標準候補数上限の決定手順を「高位問い合わせプロファイル」節へ明文化する。
      semantics.ts のカタログ定義置換、回帰再実行、期待出力差異の文書化、recommended_standard_limit
      算出と増幅実測値との突合、標準上限値の最終決定（初期値 30 と実測推奨値 12 の乖離解消）の
      手順と、カタログ置換後の再計測を前提とする運用契機を記載する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-workflow-backlog-auto
    target_area: fan-in 判定
    source_items: [AG-006]
    content: |
      「fan-in 判定」節へ系統別結果状態読み替え表を昇格する。learning-promote の inbox.md 不在時の
      子コマンドエラー報告を対象なし終了へ読み替える mapping を SPEC 本文の契約として記載する。
      直列化キューの実行単位（永続化ポイント = commit 単位）は reference 参照を維持する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-git-worktree-test-fallback
    target_area: 帰属確認手順（worktree・実行形態環境差の検査失敗）
    source_items: [AG-007]
    content: |
      worktree・実行形態の環境差（junction 未伝播・node_modules 未伝播・実行順序依存）に由来する
      検査失敗の帰属確認手順を明文化する。(1) 帰属確認の二段階手順（単体再実行、base/main 再現）、
      (2) main 等価再現手順（一時 junction、src 側代替経路 --profile source、bun install --cwd）。
      6件の反復観測クラス（ir035 worktree 誤検出、check_extensions cwd 依存・順序依存・worktree
      junction 失敗等）に根拠する。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: NG baseline 運用手順
    source_items: [AG-008, AG-036]
    content: |
      「NG baseline 運用手順」節へ運用契約を補完する。(1) entry 追加の機械生成必須・手書き禁止、
      (2) パス bucket key の環境依存対策（正規化または unmatched additions/unmanaged delta 対警告）、
      (3) baseline 生成環境の前提、(4) 由来ラベル（legacy）と報告分類の対応明確化。
      あわせて REQ-028 行015/016 の移管受入れ（宣言的データ YAML は SPEC が正となる schema を持ち
      検出用ビューとして扱うこと、detector 実装は IR 識別子に基づく命名規約を持ち IR から detector
      実装への機械的逆引きが可能であること）を契約として記載する。
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: AG-005（lint_skills 規則群カタログ登録）
    source_items: [AG-011]
    content: |
      AG-005 規則群（lint_skills.ts、層1〜2機械検査規則、hard 6規則 + warn 1規則）を
      integrity-rule-catalog へ登録する。新規カテゴリ追加判定フロー（REQ-0145-005）に従った
      登録判断の結果を併記する。
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: rule-ownership
    target_area: AG-005（lint_skills 規則群の所有権登録）
    source_items: [AG-011]
    content: |
      AG-005 規則群の所有権を rule-ownership へ登録する（lint_skills.ts、層1〜2記述基準検査）。
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    target_area: decision-baseline 索引生成（count キャプション・table 全件出力）
    source_items: [AG-012]
    content: |
      Decision 索引生成規則を確定する。(1) decision-baseline-count キャプションの例示を実装形式
      （accepted + proposed の2値「現行の承認済み Decision はN件、提案中の Decision はM件」）へ
      整合させる。(2) decision-baseline-table の全件出力規則（現行 Decision 全件を
      accepted/proposed/superseded ステータス列付きで出力）を明文化する。
  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    target_area: 計測日導出
    source_items: [AG-013]
    content: |
      AUTOGEN 計測日の導出方式を実行時日付（new Date()）から対象ドキュメント群の最終コミット日付
      利用へ変更する方式として確定する。計測日を含む AUTOGEN ブロック
      （req-metrics-measurement-example / spec-metrics-measurement-example）の鮮度判定への影響を明記する。
  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: autogen-freshness-gate
    target_area: 計測日導出（AUTOGEN 鮮度ゲート）
    source_items: [AG-013]
    content: |
      AUTOGEN 鮮度ゲートの計測日導出方式を最終コミット日付基準へ更新する。実行時日付起因の
      構造的再検出（日次で鮮度を失い IR-061 が再検出する構造）の解消を契約として明記する。
  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: パターンマッチ標準・検出対象除外規定
    source_items: [AG-014]
    content: |
      checker 実行契約 SPEC（draft）を確定する。(1) 機械検査のパターンマッチ・網羅検査設計の標準規約
      （行全体マッチ統一、列挙ベース網羅検査と件数整合の二重確認、階層 ID 検索の3点設計、宣言的
      データの silent skip 禁止 + 契約テスト固定）。(2) 検出対象除外規定の正規化（node_modules 系
      git 管理外ディレクトリのスキャン除外、frontmatter 信号キー baseline_for/audit_for の正規列挙、
      監査記録・AUTOGEN に対する免除規定）。既存 checker のマッチ実装の一括変更は要求しない
      （新規・修正時の標準として適用）と明記する。
  - id: ACT-SPEC-013
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: IR-055
    source_items: [AG-015]
    content: |
      IR-055（backticks 識別子検出）の template placeholder exemption を「プレースホルダと同一
      トークン近傍」へ狭域化する仕様へ更新する。行単位免除（{...} を含む行全体を検査対象外）からの
      仕様変更であること、プレースホルダ除去に伴う新規 delta 顕在化挙動（狭域化により顕在化は減少）の
      注記を含める。
  - id: ACT-SPEC-014
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-gh-cli
    target_area: ローカル版の扱い
    source_items: [AG-019]
    content: |
      「ローカル版の扱い」節へローカル版 references 実体構成（local-procedures.md が git CLI 初期化
      要件を含む標準手続きの正）を明示する。「委譲時の一時ファイル代替配置先」節のローカル版への
      適用可否を定義する。standard-procedures.md のローカル版新設は行わない。
  - id: ACT-SPEC-015
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: 順序ラベル様式（サブステップ識別子・工程一覧表ラベル・参照形式）
    source_items: [AG-022]
    content: |
      工程・サブステップ識別子の様式規約を確定する。(a) サブステップ階層形式（STEP-N-M、
      STEP-N-M-K）と副番号開始値（ゼロ起点禁止の要否。E4-0 の扱い）、(b) STEP model 対象外型
      SKILL.md の工程一覧表ラベル契約、(c) 成果物間の工程参照形式（Workflow Skill から command
      公開ラベル参照時の command 修飾、Capability Skill・SPEC から Workflow Skill 工程参照時の
      実番号 STEP-S5 等）の使い分け。PR #2153 の16 Skill 横断運用（fb0a5ac5）を正規化する。
  - id: ACT-SPEC-016
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-command-authoring
    target_area: command authoring 基準（層1〜3適用）
    source_items: [AG-024]
    content: |
      権威情報源宣言 1以下の計測単位（dispatch 宣言と soft guard 宣言節を除く明示的宣言サイトの数）を
      正規化して追記する。PR #2186 の運用解釈に基づく。
  - id: ACT-SPEC-017
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-skill-authoring
    target_area: skill 記述基準（層2）
    source_items: [AG-024]
    content: |
      references 分割基準へ頻用併用信号規則（参照選択表の同一行複数掲載は頻用併用信号であり
      統合候補として審査する）を追記する。「詳細は〜参照」定型 1以下の機械検査化に必要な例外規則
      （project extensions boilerplate 行4の消費、project-extensions SKILL.md の定義言及4件の例外扱い）を
      明文化する。
  - id: ACT-SPEC-018
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: epic-wave-model
    target_area: execution_unit 構成（依存ヒント・Wave 構成判断基準）
    source_items: [AG-025]
    content: |
      execution_unit 構成の依存判定へ変更ファイル重複・AUTOGEN 対象ファイル重複・同一ファイル行近接の
      機械置換を依存ヒントとして追加する。重複検知時の Wave 構成判断基準（直列化・依存付与・
      単一 PR 集約）を明記する。全ファイル重複の全面禁止とはしない（重複の種別・近接度による判断）。
  - id: ACT-SPEC-019
    artifact: spec
    operation: update
    target: docs/specs/workflows/references/execution-unit-construction.md
    target_spec:
      operation: update
      domain: workflows
      slug: references/execution-unit-construction
    target_area: 連結成分アルゴリズム（エッジ判定要素）
    source_items: [AG-025]
    content: |
      連結成分アルゴリズムのエッジ判定要素へ変更ファイル重複・AUTOGEN 対象重複・行近接を追加する。
      アルゴリズムの構造は維持し、エッジ判定要素の追加に留める。
  - id: ACT-SPEC-020
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: Level 2 解消レシピ
    source_items: [AG-025]
    content: |
      Level 2（コンフリクト）解消レシピへ「AUTOGEN ブロックの競合は新 base 上での再生成で解消する」
      正道を明記する。
  - id: ACT-SPEC-021
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: テンプレート正規形（Parent 配置・Epic 追跡テーブル）
    source_items: [AG-026]
    content: |
      Parent 先頭行配置・分解テーブル {wave}-{seq} 形式の正規形を正規記載する。
      テンプレートコメント（issue_desc_child.md / issue_desc_epic.md）と agentdev-epic-tracker
      references が事実上の正典であった状態を解消し、テンプレート選定規則の所有権を確定する。
  - id: ACT-SPEC-022
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: 代替フロー内サブステップ表現（EN. lettered prefix）
    source_items: [AG-030]
    content: |
      EN. lettered prefix 規約節を「/repo/* 限定」へ明記する。公開 /agentdev/* コマンドでは
      ### Step N 手順列挙を前提とするため当該形式を使用しないことを明確化する。
  - id: ACT-SPEC-023
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-020）
    source_items: [AG-032]
    content: |
      PR #2152 の検出拡張4点（ネストサブディレクトリ参照検出、skill references/*.md 走査、
      reference ファイルの文脈解決、CJK 句読点隣接の誤延長防止）を正規反映する。
      実装（checkScriptTemplateReferencePaths）は main 入り済み（merge 4bf264b7）。
  - id: ACT-SPEC-024
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-quality-gates
    target_area: full integrity suite 合格基準（QG-4）
    source_items: [AG-035]
    content: |
      bun test 実行形態契約を反映する。(1) ./ prefix 付き対象ディレクトリ明示指定と
      「Ran N tests across M files」の N/M 件数突合（急減していないかの妥当性検証）の必須ステップ化、
      (2) 証拠記録への実行 cwd と起動コマンド形式の明記要求、(3) cwd 依存テスト混在スイートの運用注記。
      固定値の期待値化は行わず QG-4 の識別子中心評価の構造は維持する。
  - id: ACT-SPEC-025
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: 登録手順（audits/・baselines/ の Report 位置づけ）
    source_items: [AG-039]
    content: |
      specs/README.md の登録規定へ docs/specs/integrity/audits/（5ファイル）・baselines/（1ファイル）の
      Report としての位置づけを明示する。6ファイルの索引導線（一覧表での扱い）を AUTOGEN 計測表
      （spec-health-metrics の SPEC 計上）との整合も含めて確定する。
  - id: ACT-SPEC-026
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-doc-diagnostics
    target_area: 廃止済み agentdev-doc-map 参照の是正（本文4箇所）
    source_items: [AG-040]
    content: |
      廃止済み配布スキル agentdev-doc-map 参照4箇所（L18/L41/L69/L75）を現行の責務分担記述へ更新する。
      旧パスリンク（L188 等）の解消を含める。SPEC 確定時の修正として実施する。

conflict_resolutions:
  - id: CR-001
    conflict: TIM 語彙移行の方向（カタログ基準へ実装を寄せるか、実測に基づきカタログを修正するか）
    resolution: |
      実測基準でカタログを修正して確定する。PR #2195 Level 2 統合後の実装が安定実績であり、
      SPEC 確定（G21）は実測の正典化が自然。implementation プロファイルが常に空結果となる欠陥は
      実装側是正として扱う。
  - id: CR-002
    conflict: IR-055 placeholder exemption の扱い（狭域化 / exempt 行でも strict 検査維持 / 現状維持）
    resolution: |
      トークン近傍への狭域化とする。行全体免除はプレースホルダ表記の残置を構造的に助長し
      （PR #2187 で隠蔽参照6件が顕在化）、保護目的はトークン近傍で足りる。delta 顕在化挙動は
      併せて文面化する。
  - id: CR-003
    conflict: gh-cli ローカル版の git CLI 初期化要件の反映先（standard-procedures.md 新設か local-procedures.md 追記か）
    resolution: |
      local-procedures.md へ追記する。参照実体を1ファイルに維持し、二重管理の温床
      （RU-0066 と同型問題）を回避する。
  - id: CR-004
    conflict: 工程・サブステップ採番体系の正規記載（SPEC 正規契約化 vs 現状運用維持）
    resolution: |
      command-file-format SPEC へ正規契約化する。16 Skill 横断で運用統一済み（fb0a5ac5）なのに
      規約不在のため E4-0 のような例外が残存。正規記載により AG-023 是正の根拠も得る。
  - id: CR-005
    conflict: Parent 配置・Epic 追跡テーブル正規形の正典化（SPEC 正規記載 vs テンプレート・references 事実正典維持）
    resolution: |
      workflow-templates SPEC へ正典化する。事実正典のままは二重管理・乖離リスクが残存するため。
  - id: CR-006
    conflict: REQ-025 の扱い（RETIRE vs 維持）
    resolution: |
      RETIRE。全要件行が反映作業そのもの（REQ-004-009 違反）で修復完了済み、適用範囲の IR-036 は
      DEC-013 で削除済み（inspect F-01、severity: medium / confidence: high）。
  - id: CR-007
    conflict: REQ-026 の扱い（全体 RETIRE vs 行002の恒常検査契約としての吸収）
    resolution: |
      行002（frontmatter id と物理 path の不一致検出）を REQ-010 へ吸収した上で RETIRE する。
      行001/003 は実装済み作業記述。行002は恒常的な検査品質契約として生存させる。
  - id: CR-008
    conflict: REQ-028 の扱い（部分再構成 vs 恒常行移管による完全 RETIRE）
    resolution: |
      恒常行の移管（DEC-013・REQ-036・integrity-contracts SPEC）を伴う完全 RETIRE。16行の混合は
      保守性が低く、恒常契約の正規 home は既存（DEC-013 が登録モデル、REQ-010/036 が検査実行・
      診断観点）。作業記録行（003〜005/008〜011）は DEC-013 で実施済み。
  - id: CR-009
    conflict: proposed Decision（DEC-008/015）の現行根拠参照の扱い（承認完了 vs 参照への一時的注記）
    resolution: |
      承認ルート（proposed から accepted 昇格）とする。accepted SPEC が規範的根拠として引用し実運用に
      耐えているため、不整合の解消は承認が正道。
  - id: CR-010
    conflict: 要件行内の移行注記4箇所の扱い（削除 / 履歴文脈注記への置換 / 例外として維持）
    resolution: |
      履歴文脈注記への置換。REQ-001-014（再編工程固有識別子の排除）と REQ-001-040
      （トレーサビリティ）の両立。参照形式から文脈説明の注記形式へ置換する。
  - id: CR-011
    conflict: 一文一行残存違反のは正方針（docs 57行 + 配布物716行の編集権限と手段）
    resolution: |
      docs 側（要件・Decision 本文）は違反行特定を OU-0018 の case で実施した上で、是正は
      後続の req-save / Decision 更新手続き（是正用の別要件doc）で適用する。配布物側は
      機械是正を複数 case 分割で実施する。要件・Decision 本文は正規更新手続きの保護対象のため
      本ドラフトの artifact_actions から除外する。
  - id: CR-012
    conflict: backlog-auto SPEC 本文粒度（fan-in 読み替え表・直列化キュー実行単位の SPEC 昇格の要否）
    resolution: |
      fan-in 読み替え表は SPEC 本文へ昇格、直列化キュー実行単位は reference 参照維持。
      判断基準は「正典側に必要な契約粒度（実行の再現性に必要か、reference 詳細で十分か）」。

operation_units:
  - ou_id: OU-0001
    source_ru: RU-0046
    target_spec: docs/specs/foundations/traceability-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-0002
    source_ru: RU-0047
    target_spec: docs/specs/skills/agentdev-artifact-graph.md
    operation: update
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0003
    source_ru: RU-0048
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 20
    issue_policy: single
    result: {}
  - ou_id: OU-0004
    source_ru: RU-0049
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 21
    issue_policy: single
    result: {}
  - ou_id: OU-0005
    source_ru: RU-0050
    target_req: REQ-021
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 22
    issue_policy: single
    result: {}
  - ou_id: OU-0006
    source_ru: RU-0051
    target_spec: docs/specs/skills/agentdev-workflow-backlog-auto.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-0007
    source_ru: RU-0052
    target_spec: docs/specs/skills/agentdev-git-worktree-test-fallback.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-0008
    source_ru: RU-0053
    target_spec: docs/specs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-0009
    source_ru: RU-0054
    target_req: REQ-021
    operation: update
    scale: standard
    depends_on: [OU-0008]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-0010
    source_ru: RU-0055
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 23
    issue_policy: single
    result: {}
  - ou_id: OU-0011
    source_ru: RU-0056
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-0012
    source_ru: RU-0057
    target_spec: docs/specs/integrity/index-auto-generation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-0013
    source_ru: RU-0058
    target_spec: docs/specs/integrity/index-auto-generation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-0014
    source_ru: RU-0059
    target_spec: docs/specs/integrity/checker-execution-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    result: {}
  - ou_id: OU-0015
    source_ru: RU-0060
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    result: {}
  - ou_id: OU-0016
    source_ru: RU-0061
    operation: update
    scale: large
    depends_on: [OU-0015]
    recommended_order: 24
    issue_policy: single
    result: {}
  - ou_id: OU-0017
    source_ru: RU-0062
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 25
    issue_policy: single
    result: {}
  - ou_id: OU-0018
    source_ru: RU-0063
    operation: update
    scale: large
    depends_on: []
    recommended_order: 26
    issue_policy: single
    result: {}
  - ou_id: OU-0019
    source_ru: RU-0064
    target_spec: docs/specs/skills/agentdev-gh-cli.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
    result: {}
  - ou_id: OU-0020
    source_ru: RU-0065
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 27
    issue_policy: single
    result: {}
  - ou_id: OU-0021
    source_ru: RU-0066
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 28
    issue_policy: single
    result: {}
  - ou_id: OU-0022
    source_ru: RU-0067
    target_spec: docs/specs/authoring/command-file-format.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
    result: {}
  - ou_id: OU-0023
    source_ru: RU-0068
    operation: update
    scale: standard
    depends_on: [OU-0022]
    recommended_order: 29
    issue_policy: single
    result: {}
  - ou_id: OU-0024
    source_ru: RU-0069
    target_spec: docs/specs/skills/agentdev-command-authoring.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single
    result: {}
  - ou_id: OU-0025
    source_ru: RU-0070
    target_spec: docs/specs/workflows/epic-wave-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 15
    issue_policy: single
    result: {}
  - ou_id: OU-0026
    source_ru: RU-0071
    target_spec: docs/specs/skills/agentdev-workflow-templates.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 16
    issue_policy: single
    result: {}
  - ou_id: OU-0027
    source_ru: RU-0072
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 30
    issue_policy: single
    result: {}
  - ou_id: OU-0028
    source_ru: RU-0073
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 31
    issue_policy: single
    result: {}
  - ou_id: OU-0029
    source_ru: RU-0074
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 32
    issue_policy: single
    result: {}
  - ou_id: OU-0030
    source_ru: RU-0075
    target_spec: docs/specs/authoring/command-file-format.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 17
    issue_policy: single
    result: {}
  - ou_id: OU-0031
    source_ru: RU-0076
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 33
    issue_policy: single
    result: {}
  - ou_id: OU-0032
    source_ru: RU-0077
    target_spec: docs/specs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 18
    issue_policy: single
    result: {}
  - ou_id: OU-0033
    source_ru: RU-0078
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 34
    issue_policy: single
    result: {}
  - ou_id: OU-0034
    source_ru: RU-0079
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 35
    issue_policy: single
    result: {}
  - ou_id: OU-0035
    source_ru: RU-0080
    target_spec: docs/specs/skills/agentdev-quality-gates.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 19
    issue_policy: single
    result: {}
  - ou_id: OU-0036
    source_ru: RU-0081
    operation: update
    scale: large
    depends_on: [OU-0008]
    recommended_order: 36
    issue_policy: single
    result: {}
  - ou_id: OU-0037
    source_ru: RU-0082
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 37
    issue_policy: single
    result: {}
  - ou_id: OU-0038
    source_ru: RU-0083
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 38
    issue_policy: single
    result: {}
  - ou_id: OU-0039
    source_ru: RU-0084
    target_spec: docs/specs/README.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 39
    issue_policy: single
    result: {}
  - ou_id: OU-0040
    source_ru: RU-0085
    target_spec: docs/specs/skills/agentdev-doc-diagnostics.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 40
    issue_policy: single
    result: {}
  - ou_id: OU-0041
    source_ru: RU-0086
    operation: update
    scale: standard
    depends_on: [OU-0036]
    recommended_order: 41
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      spec-save 実行後、traceability-model SPEC と scripts/lib/tim.ts の語彙定義を突合する
      （影響方向値名・関係型・参加区分・集約規則）。AG SPEC の反映提案群4項目の反映状況と
      索引・集約成果物の扱いの記載を確認する。
    pass_criteria: |
      カタログと実装の語彙乖離が解消済みであること（差分なし、または差分の意図が明記済み）。
      SPEC 反映提案群の採否がすべて確定していること。実現系列関係型と implementation
      プロファイル参加範囲がカタログに定義されていること。
    on_failure: |
      fix-and-reverify: 語彙乖離残存時は実装またはカタログの修正を case 側で実施して再突合する。
      取捨未確定の提案が残る場合は未確定内容として draft を見直す。
  - id: TS-002
    target_item: AG-002
    verification: |
      AG-001 完了後、semantics.ts をカタログ定義へ置換し回帰を再実行する。
      recommended_standard_limit 算出・増幅実測値との突合結果と期待出力の差分文書化を確認する。
    pass_criteria: |
      標準上限値が再計測に基づき決定され、AG SPEC「高位問い合わせプロファイル」節に手順と
      決定値が明文化されていること。差分文書が存在すること。
    on_failure: |
      fix-and-reverify: 再計測で乖離が残る場合は決定手順に従い再評価する。
  - id: TS-003
    target_item: AG-003
    verification: |
      最新 main 構成で scripts/lib/config.ts の純LOC を再計測する。
    pass_criteria: |
      250 純LOC 以下であること、または分割により超過が解消されていること。
      解消済みの場合は Issue の完了判定記録が残っていること。
    on_failure: |
      fix-and-reverify: 超過残存時は分割を実施して再計測する。
  - id: TS-004
    target_item: AG-004
    verification: |
      対象6 SPEC ファイル（docs/specs/commands/ の5ファイルと agentdev-adversarial-review SPEC）に
      おいて旧見出し「利用上の防護」参照を grep する。
    pass_criteria: |
      6ファイルすべての参照が現行見出し「ワークフロー利用」へ解決されていること（旧見出し参照 0件）。
    on_failure: |
      fix-and-reverify: 残存参照を更新して再 grep する。
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-021-005 と AG SPEC 8箇所の中黒流動的並列表記について TS-QC-001 機械判定を再実行する。
    pass_criteria: |
      対象表記が読点または箇条書きへ置換され、機械判定候補が 0件になっていること。
    on_failure: |
      fix-and-reverify: 残存候補を置換して再判定する。
  - id: TS-006
    target_item: AG-006
    verification: |
      backlog-auto SPEC「fan-in 判定」節に読み替え表が記載されていることを確認し、
      inbox.md 不在ケースの読み替えが SPEC 記載と一致することを backlog-auto の動作確認で検証する。
    pass_criteria: |
      読み替え表が SPEC 本文に存在し、learning-promote の inbox.md 不在時の子コマンドエラー報告が
      対象なし終了へ読み替えられること。
    on_failure: |
      fix-and-reverify: SPEC 記載または実装の不一致を修正して再確認する。
  - id: TS-007
    target_item: AG-007
    verification: |
      git-worktree-test-fallback SPEC に帰属確認二段階手順と main 等価再現手順が明文化されている
      ことを確認する。ir035 と check_extensions の個別是正について、worktree 環境と main 環境で
      テストを実行する。
    pass_criteria: |
      SPEC への手順明文化が完了していること。ir035 の worktree 環境誤検出が解消し、
      check_extensions のフルスイート実行で恒常 fail が解消していること（または汚染源の
      切り分け記録が残っていること）。
    on_failure: |
      fix-and-reverify: 個別是正を case 側で実施して再実行する。切り分けで複数修正に分かれる場合は
      execution_unit 構成に従い分割する。
  - id: TS-008
    target_item: AG-008
    verification: |
      integrity-contracts SPEC「NG baseline 運用手順」節に機械生成必須・手書き禁止・パス対策・
      生成環境前提・報告分類対応の4点が明文化されていることを確認する。
    pass_criteria: |
      4点の運用契約が SPEC 本文に記載されていること。checker 実装修正は段階対応とされ、
      SPEC 明文化のみで完了判定が可能であること。
    on_failure: |
      fix-and-reverify: SPEC 記載を補完して再確認する。
  - id: TS-009
    target_item: AG-009
    verification: |
      N01 は REQ-021-003 の参照更新後、N16 は checker 登録後、N17 は case-close.md 参照追加後に、
      それぞれ対応する NG baseline entry の除去と QG-4 の delta ゼロを確認する。
    pass_criteria: |
      N01/N16/N17 の実是正が完了し、対応する baseline entry が除去されていること。
      QG-4 の機械 delta ノイズが解消していること。
    on_failure: |
      fix-and-reverify: 是正未了の項目を実施して再確認する。N17 の bucket key 表記は
      AG-008 のパス正規化方針に従う。
  - id: TS-010
    target_item: AG-010
    verification: |
      check_workflow_preventive.ts item 3 を簡潔トリガー項の肯定検証へ更新した後、
      lint_skills.ts と check_workflow_preventive.ts を実行する。
    pass_criteria: |
      両 checker の検出語が簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）へ統一され、
      SPEC 準拠の配布物（PR #2185 適用後）が両 checker を通過すること。
    on_failure: |
      fix-and-reverify: checker の検出ロジックを修正して再実行する。
  - id: TS-011
    target_item: AG-011
    verification: |
      integrity-rule-catalog.md と rule-ownership.md に lint_skills AG-005 規則群が登録されている
      ことを確認し、repo-agentdev-integrity SKILL.md 検査カテゴリ表に AG-005 行が追加されている
      ことを確認する。
    pass_criteria: |
      カタログ・所有権への登録と SKILL.md 検査カテゴリ表の行追加が完了していること。
      REQ-0145-005 の新規カテゴリ追加判定の結果が記録されていること。
    on_failure: |
      fix-and-reverify: 登録・導線を補完して再確認する。
  - id: TS-012
    target_item: AG-012
    verification: |
      index-auto-generation SPEC の decision-baseline-count 例示が実装形式と一致すること、
      decision-baseline-table 全件出力規則が明文化されていることを確認する。
      checker 側の decision-* block 移行は check_integrity.ts 実行で確認する（case 実施分）。
    pass_criteria: |
      SPEC 例示と実装キャプションの不一致が解消し、全件出力規則が SPEC に明文化されていること。
    on_failure: |
      fix-and-reverify: SPEC または checker を修正して再確認する。
  - id: TS-013
    target_item: AG-013
    verification: |
      計測日導出方式変更（最終コミット日付基準）後、generate_indexes.ts を実行し、
      翌日以降に IR-061（AUTOGEN 鮮度）が再検出しないことを確認する。
    pass_criteria: |
      計測日を含む AUTOGEN ブロックが日次で陳腐化せず、IR-061 の構造的再検出が解消していること。
    on_failure: |
      fix-and-reverify: 導出方式の実装を修正して再確認する。
  - id: TS-014
    target_item: AG-014
    verification: |
      checker-execution-contracts SPEC にパターンマッチ標準と検出対象除外規定
      （node_modules 除外・frontmatter キー正規列挙・監査記録/AUTOGEN 免除）が記載されていることを確認する。
      TS-009 の node_modules 除外実装は commands_e2e.test.ts を main 作業ディレクトリで実行して確認する（case 実施分）。
    pass_criteria: |
      SPEC の2規定群が確定していること。TS-009 の恒常 fail が解消していること（case 実施分）。
    on_failure: |
      fix-and-reverify: SPEC 記載または除外実装を修正して再確認する。
  - id: TS-015
    target_item: AG-015
    verification: |
      integrity-rule-catalog の IR-055 記載がトークン近傍狭域化へ更新されていることを確認する。
      checker 実装（IR-055 検出）の狭域化準拠は OU-0015 の case 実施で更新し、backticks 検出の
      挙動確認で検証する。
    pass_criteria: |
      IR-055 の exemption 仕様が狭域化後の記載となり、delta 顕在化挙動の注記が含まれていること。
      case 実施後は checker 実装が狭域化仕様に準拠していること。
    on_failure: |
      fix-and-reverify: カタログ記載または checker 実装を修正して再確認する。
  - id: TS-016
    target_item: AG-016
    verification: |
      プレースホルダ ID 表記の棚卸し結果（具体値解決・表現再設計・意図的残置の分類）と
      置換後の配布物について、IR-055 狭域化後の検出（OU-0015 の case 実施で checker 実装を
      狭域化準拠へ更新した後の検出）を実行する。
    pass_criteria: |
      棚卸し分類が完了し、配布依存境界に違反する表記が解消されていること。
      意図的残置は根拠とともに記録されていること。
    on_failure: |
      fix-and-reverify: 残置表記を再設計して再検出する。
  - id: TS-017
    target_item: AG-017
    verification: |
      mechanical-replacement-rules.md に ordered list 扱いと em-dash 判別基準が明文化されている
      ことを確認し、docs 側残存セルの扱いと PR #2154 エビデンス補正を確認する。
    pass_criteria: |
      §4 の ordered list 扱いと §2 パターン D の判別基準が明文化されていること。
      docs 側残存セルの扱いが確定していること。
    on_failure: |
      fix-and-reverify: 規則文書を補正して再確認する。
  - id: TS-018
    target_item: AG-018
    verification: |
      配布物側是正実施後、一文一行機械判定（X-4）を配布物領域で再実行する。
      docs 側は OU-0018 の case で違反行特定結果を是正用要件doc（case-open 入力）として
      引き渡していることを確認する。docs 側是正の完了確認は当該要件doc の検証が所有する。
    pass_criteria: |
      配布物側は機械是正が完了し残存違反が解消されていること。docs 側は違反行特定結果が
      是正用要件doc への入力として引き渡されていること。
    on_failure: |
      fix-and-reverify: 配布物側の残存違反を是正して再判定する。docs 側の引き渡しがない場合は
      OU-0018 の case を完了させて引き渡しを作成する。
  - id: TS-019
    target_item: AG-019
    verification: |
      agentdev-gh-cli SPEC「ローカル版の扱い」節の明示と local-procedures.md への追記内容を確認する。
      src/opencode-local/agentdev-gh-cli/ の実体編集は case 実施後に確認する。
    pass_criteria: |
      SPEC にローカル版 references 実体構成と代替配置先の適用可否が定義され、
      local-procedures.md に git CLI 初期化要件が記載されていること。
    on_failure: |
      fix-and-reverify: SPEC または local-procedures.md を補正して再確認する。
  - id: TS-020
    target_item: AG-020
    verification: |
      agentdev-gh-cli references（standard-procedures.md、verify.md）に READ 安全手順の拡張記載と
      case-run/case-close の検証手順 references に stdout 退避形式の追記があることを確認する。
    pass_criteria: |
      spawnSync + fs.writeFileSync（UTF-8 明示）の読み取り経路が手続き文書へ明記され、
      execSync 維持境界（成功が見込める単発 READ）が明確化されていること。
    on_failure: |
      fix-and-reverify: 手続き文書を補正して再確認する。
  - id: TS-021
    target_item: AG-021
    verification: |
      完了報告テンプレートの配置を確認する。command-local 側の廃止（または参照統一）後、
      テンプレートを参照する command・checker の参照更新を確認する。
    pass_criteria: |
      テンプレート3ファイルが skill 側のみの単一管理となっていること。
      参照更新が完了し、テンプレート選定の動作に支障がないこと。
    on_failure: |
      fix-and-reverify: 参照を修正して再確認する。
  - id: TS-022
    target_item: AG-022
    verification: |
      command-file-format SPEC にサブステップ階層形式・副番号開始値・工程一覧表ラベル契約・
      参照形式の使い分けが記載されていることを確認する。E4-0 の扱いの判断結果を確認する。
    pass_criteria: |
      様式規約が SPEC に正規記載され、PR #2153 の16 Skill 横断運用と整合していること。
      E4-0 の振り直し要否が判断記録されていること。
    on_failure: |
      fix-and-reverify: SPEC 記載を補正して再確認する。
  - id: TS-023
    target_item: AG-023
    verification: |
      intake-capture.md と intake-from-github.md の公開順序要約が ### Step N 形式になっていること、
      case-run.md の孤立見出しが解消されていること、Capability Skill・SPEC の旧 Step 参照5箇所が
      更新されていることを grep で確認する。commands_e2e.test.ts を実行する。
    pass_criteria: |
      非標準ラベル・孤立見出し・旧 Step 参照が解消されていること。
      commands_e2e.test.ts が期待値更新後に通過すること。
    on_failure: |
      fix-and-reverify: 残存を是正して再確認する。
  - id: TS-024
    target_item: AG-024
    verification: |
      command-authoring・skill-authoring SPEC に計測単位・例外規則・頻用併用信号規則が追記され、
      authoring skill SKILL.md に固定トークン事前 grep 手順が追加されていることを確認する。
    pass_criteria: |
      4項目の基準強化が SPEC と SKILL.md に反映されていること。
      grep 対象の代表例列挙と両立運用の回避パターンが併記されていること。
    on_failure: |
      fix-and-reverify: 記載を補正して再確認する。
  - id: TS-025
    target_item: AG-025
    verification: |
      epic-wave-model SPEC・execution-unit-construction.md にエッジ判定要素の追加と Wave 構成判断基準が
      記載され、case-auto SPEC の Level 2 レシピに AUTOGEN 再生成の正道が明記されていることを確認する。
    pass_criteria: |
      依存ヒント3種（変更ファイル重複・AUTOGEN 対象重複・行近接）がエッジ判定要素へ追加され、
      連結成分アルゴリズムの構造が維持されていること。
    on_failure: |
      fix-and-reverify: SPEC 記載を補正して再確認する。
  - id: TS-026
    target_item: AG-026
    verification: |
      workflow-templates SPEC に Parent 配置・Epic 追跡テーブル正規形が正規記載されていることを確認する。
      テンプレートコメント・references との一致を確認する。
    pass_criteria: |
      正規形が SPEC に記載され、テンプレート・references と乖離していないこと。
    on_failure: |
      fix-and-reverify: SPEC またはテンプレート側を整合させて再確認する。
  - id: TS-027
    target_item: AG-027
    verification: |
      期待値更新（または非依存マッチング化）後、bun test 全件を実行する。
      Epic #2134 の完了条件3を再評価する。
    pass_criteria: |
      distribution_boundary_routing_contract.test.ts の 7 fail が解消し、bun test 全件で
      登録済み fail が 0 であること。Epic #2134 のクローズが実施されていること。
    on_failure: |
      fix-and-reverify: 期待値を修正して再実行する。
  - id: TS-028
    target_item: AG-028
    verification: |
      case-run・case-close・case-auto の終了条件に tmp/ 残存確認が追加され、gh-cli
      standard-procedures.md の READ 経路に cleanup 規定が拡張されていることを確認する。
      .gitignore 追加の判断記録を確認する。
    pass_criteria: |
      終了条件と cleanup 規定の拡張が完了し、mkdir 手順例が追加されていること。
      .gitignore の扱いが明示パス staging 運用との整合確認を経て判断されていること。
    on_failure: |
      fix-and-reverify: 手続きを補正して再確認する。
  - id: TS-029
    target_item: AG-029
    verification: |
      agentdev-project-extensions の description（SKILL.md frontmatter）に「extension 自体の作成・編集」
      の除外項が反映されていることを確認する。
    pass_criteria: |
      description 側 DO NOT USE FOR に当該除外項が存在すること。authoring 規則 AG-004
      簡潔トリガー項との整合が保たれていること。
    on_failure: |
      fix-and-reverify: description を補正して再確認する。
  - id: TS-030
    target_item: AG-030
    verification: |
      command-file-format SPEC の EN. lettered prefix 規約節が /repo/* 限定へ明記されていることを
      確認する。checker 対象拡張の検討結果を確認する。
    pass_criteria: |
      EN. 形式規約が /repo/* 限定と明記されていること。
      /repo/* 移行時の checker 対象拡張の検討記録が残っていること。
    on_failure: |
      fix-and-reverify: 規約節を補正して再確認する。
  - id: TS-031
    target_item: AG-031
    verification: |
      ファントム REQ-010-NNN 番号群について docs/** を grep し、番号群ごとの処置
      （再配線・履歴文脈注記・削除）が適用されていることを確認する。
    pass_criteria: |
      存在しない要件番号への未処置参照が 0件であること（処置済みの履歴文脈注記は除く）。
      spec-health-metrics.md:268 の不統一が解消されていること。
    on_failure: |
      fix-and-reverify: 残存参照を処置して再 grep する。
  - id: TS-032
    target_item: AG-032
    verification: |
      integrity-contracts SPEC の reference-path-existence 節に拡張4点が反映されていることを確認する。
    pass_criteria: |
      拡張4点（ネストサブディレクトリ参照検出・references 走査・文脈解決・CJK 誤延長防止）が
      SPEC 本文に正規反映されていること。
    on_failure: |
      fix-and-reverify: SPEC 記載を補正して再確認する。
  - id: TS-033
    target_item: AG-033
    verification: |
      推奨検討対象5スキルの SKILL.md について、L580 cleanup モデルの明示参照または実行時適用の
      判断結果が確定していることを確認する。
    pass_criteria: |
      各スキルごとに明示参照 or 実行時適用の要否が判断され、適用経路が確立していること。
    on_failure: |
      fix-and-reverify: 対象スキルの判断・適用を補正して再確認する。
  - id: TS-034
    target_item: AG-034
    verification: |
      agentdev-git-worktree SKILL.md（references 含む）に detached worktree 標準手順・stash 利用時の
      規則・往復前確認が追記されていることを確認する。
    pass_criteria: |
      3項目の stash 運用手順が明記され、配布依存境界と段階的開示が維持されていること。
    on_failure: |
      fix-and-reverify: 手順記載を補正して再確認する。
  - id: TS-035
    target_item: AG-035
    verification: |
      quality-gates SPEC に件数突合・実行形式明記要求が反映され、case-close / docs-check の実行手順と
      PR 本文テンプレートに記録欄が追加されていることを確認する（手順・テンプレート側は case 実施分）。
    pass_criteria: |
      N/M 件数突合の必須ステップ化と実行形式記録要求が SPEC に明文化されていること。
      固定値期待値化が行われていないこと。
    on_failure: |
      fix-and-reverify: SPEC または手順を補正して再確認する。
  - id: TS-036
    target_item: AG-036
    verification: |
      req-save 実行後、REQ-025/026/028 が retired/ へ移行し、REQ-010 に行002相当の検査観点が追加され、
      DEC-013・REQ-036・integrity-contracts SPEC に移管行が反映されていることを確認する。
      README 索引（AUTOGEN）の整合を確認する。
    pass_criteria: |
      3 REQ の RETIRE と恒常行の移管が完了していること。REQ-026-002 相当の検査観点が REQ-010 に
      存在すること。要件インデックスと docs/README.md の表記が整合していること。
    on_failure: |
      fix-and-reverify: 移管・吸収を補正して再確認する。
  - id: TS-037
    target_item: AG-037
    verification: |
      DEC-008・DEC-015 の status が accepted となり、承認記録が追加されていることを確認する。
      decisions/README.md と docs/README.md の Decision 表の整合を確認する。
    pass_criteria: |
      2 Decision の承認が完了し、REQ-001-021 との矛盾（proposed の現行根拠参照）が解消していること。
    on_failure: |
      fix-and-reverify: 承認手続きを補正して再確認する。
  - id: TS-038
    target_item: AG-038
    verification: |
      docs/README.md の DEC-014 行の status 表記と runtime-package-boundary.md の二重リンクを確認する。
    pass_criteria: |
      DEC-014 行が accepted 表記となり、実体 DEC-014.md・decisions/README.md と一致していること。
      二重リンクが整理されていること。
    on_failure: |
      fix-and-reverify: 表記を修正して再確認する。
  - id: TS-039
    target_item: AG-039
    verification: |
      specs/README.md の登録規定に audits/・baselines/ の Report 位置づけが明示され、
      6ファイルの索引導線が AUTOGEN 計測表と整合していることを確認する。
    pass_criteria: |
      登録規定の拡充と索引導線の整合が完了していること。
    on_failure: |
      fix-and-reverify: 登録規定を補正して再確認する。
  - id: TS-040
    target_item: AG-040
    verification: |
      doc-diagnostics SPEC において agentdev-doc-map 参照を grep する（0件確認）。
      旧パスリンク（L188 等）の解消を確認する。
    pass_criteria: |
      廃止済みスキル参照が 0件で、旧パスリンクが解消されていること。
    on_failure: |
      fix-and-reverify: 残存参照を修正して再 grep する。
  - id: TS-041
    target_item: AG-041
    verification: |
      req-save 実行後、REQ-004-053・REQ-017-002・REQ-036-022・REQ-006 本文の移行注記が
      履歴文脈注記へ置換されていることを確認する。
    pass_criteria: |
      4箇所の移行注記が REQ-001-014 と REQ-001-040 の両立する形式へ置換されていること。
    on_failure: |
      fix-and-reverify: 注記形式を修正して再確認する。

case_open_hints:
  epic_needed: true
  decomposition: |
    41 OU はテーマ別にグルーピング可能: (A) AG/TIM SPEC 確定（OU-0001〜0002）、
    (B) integrity/checker 契約（OU-0008/0011〜0015/0032）、(C) 検証実行環境（OU-0007/0020/0034/0035）、
    (D) 配布物表記・様式是正（OU-0003〜0005/0010/0016〜0018/0021/0023/0027/0029）、
    (E) 様式・構成 SPEC（OU-0006/0022/0024〜0026/0030/0039）、
    (F) REQ/Decision 体系再構成（OU-0036/0037/0041）、(G) 個別整備（OU-0009/0019/0028/0031/0033/0038/0040）。
    RU-0081（OU-0036）の3 REQ RETIRE は個別 Issue 化を推奨する（判断・検証が独立）。
  wave_hints:
    - OU-0002 は OU-0001 完了後に配置する（TIM カタログ確定が前提）
    - OU-0016 は OU-0015 完了後に配置する（IR-055 狭域化後の表記確定）
    - OU-0023 は OU-0022 完了後に配置する（様式確定が是正の前提）
    - OU-0009 と OU-0036 は OU-0008 完了後に配置する（NG baseline 契約確定との連動）
    - OU-0041 は OU-0036 完了後に配置し最終 Wave とする（低優先・移行注記）
    - |
      同一ファイルを対象とする OU（integrity-rule-catalog の OU-0011/0015、
      index-auto-generation の OU-0012/0013、integrity-contracts の OU-0008/0032、
      command-file-format の OU-0022/0030、REQ-021 の OU-0005/0009、
      gh-cli references の OU-0020/0028）は同一 Wave に並列配置しない
      （同一ファイル衝突の抑制。AG-025 の判断基準を本バッチでも適用）
```

# summary

backlog-review 生成 RU-0046〜0086（41件）の一括要件化ドラフト。Epic #2189/#2134 残差、
learning/intake 知見、inspect-docs 検出事項を「SPEC 確定・契約明文化・体系是正」の
5テーマ（AG/TIM SPEC 確定、integrity/checker 契約、検証実行環境、配布物表記・様式、
REQ/Decision 体系再構成）に統合した。壁打ちで確定した主要判断（CR-001〜012）:
語彙移行は実測基準、IR-055 は狭域化、工程ラベル様式は SPEC 正規契約化、REQ-025/026/028 は
移管を伴う RETIRE、DEC-008/015 は承認、移行注記は履歴文脈注記へ置換、一文一行は
docs 手続経由・配布物機械是正の二本立て。RU-0001 は本ドラフト対象外（次回独立要件化）。
