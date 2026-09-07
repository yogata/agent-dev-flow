---
draft_type: req_draft
topic_slug: adf-corpus-contract-modernization-batch
status: saved
created_at: "2026-09-07T15:05:00+09:00"
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-0009
  - RU-0010
  - RU-0011
  - RU-0012
  - RU-0013
  - RU-0014
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  backlog-review が生成した RU-0001〜RU-0014（14件）を一括対象とする ADF docs corpus 整合・実行契約現行化バッチ。
  docs corpus のリンク・参照・表記是正（RU-0001/0010/0012）、配布物 concrete REQ 行 ID 是正と IR-055/IR-059 検出責務境界の確定（RU-0002）、
  concrete-id baseline 再取得手順の定義と実施（RU-0003）、委譲 structured_context の Issue 本文 SSoT 抽出契約（RU-0004）、
  worktree 検証の依存整備前提の完全化（RU-0005）、checker 実行契約の整備（RU-0006）、traceability 検証対応計上の整合修正（RU-0007）、
  docs-check 既存 delta の棚卸し（RU-0008）、integrity baseline 運用の現行化（RU-0009）、Knowledge frontmatter 機械判定形式の規約化（RU-0011）、
  agentdev_gh 表示スキーマ整合（RU-0013）を含む。RU-0014 は配布物側コミット前検証で充足済みのため対象外（RD-001）。
  既存要件行（REQ-057-002/019/009/023、REQ-018-002、REQ-056-010、REQ-010-007 等）が大部分の状態要件を所有するため、
  新規 REQ 行は REQ-010（3行）と REQ-017（1行）の APPEND のみとし、残りは Design 操作と反映作業で構成する。
  本リポジトリは self-hosting のため agentdev_handoff: true RU を通常の req/case workflow 入力として扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs corpus のリンク・参照整合を是正する。docs/decisions/README.md の DEC-013 行が関連REQ表で retired REQ-028 を現行パス
      `../requirements/REQ-028.md` で参照している状態を、正規形（retired 実パス `../requirements/retired/REQ-028.md` へのリンクと
      retired 注記。DEC-007/DEC-017 行と同形）へ改める。docs/designs 配下の相対リンク切れ 5件
      （IR-060-forbidden-japanese-word-detection.md:35/:67 は src 参照の深度誤り、:68 は不存在パス解決、
      IR-057-obsolete-spec-path-after-domain-split.md:131 は obsolete-path-map.yaml 実体
      `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml` との不一致、
      quality-gates.md:214 は src 参照の深度誤り）を実配置への修正により解消する。
      あわせて docs-check の検査項目として、関連REQ表の retired REQ 実パスリンク検査と docs/designs 相対リンク実在検査を追加する。
  - id: AG-002
    content: |
      配布物内の concrete REQ 行 ID 直接引用（RU-0002 記載 9箇所に加え、実測で追加発見した
      src/opencode/commands/agentdev/templates/req-define/req-draft.md:114 を含む計10箇所）を機能的記述への置換により是正する
      （IR-059 distribution-reference-boundary の triage_action に従う。文末出典括弧「（REQ-017-017）」等の形を含む。
      ADF-COVERS 宣言と `REQ-{NNNN}-{NNN}` プレースホルダー表記は対象外）。
      IR-055（runtime-unresolved-reference）は 3桁行参照を検出対象外と明記し、concrete ID 残存の検出は IR-059 の責務とする
      検出責務境界を integrity-contracts.md へ確定する。本項の完了が配布依存境界ベースライン再取得（AG-003）の前提となる。
  - id: AG-003
    content: |
      配布依存境界（REQ-029、DEC-014）の concrete-id ベースラインについて、再取得手順（対象 commit の特定、source/link profile
      の実行コマンド、エントリ集合の記録様式、PR 本文への根拠記載を含む）を distribution-boundary.md へ定義し、
      最新 main を対象に再取得を実施する。現行ベースライン（222cd93d 時点、concrete-id 16件記録）と現行 main の違反 0件との
      差異を解消し、解消済み違反がベースラインに残存しない状態にする。AG-002 の配布物是正完了後に実施する順序制約を持つ。
  - id: AG-004
    content: |
      case-run から実行担当サブエージェントへの委譲において、structured_context の作業内容・purpose が Issue 本文概要または
      正規 REQ から抽出される制約を委譲契約へ追加する（会話コンテキスト由来の推定や波及解釈を注入しない）。
      あわせて委譲 prompt 生成時に Issue 番号と対象成果物パスの一致検査を組み込む。
      前提となる観測事実: PR #2579（Issue #2566。指示と Issue 本文の作業内容乖離）、PR #2581（Issue #2562。purpose の別課題記載）。
      消費側の既存要件 REQ-017-016（Issue/Epic を SSoT として処理）に対する生成側の対偶として整備する。
  - id: AG-005
    content: |
      worktree 環境で integrity suite・契約テスト・tsc 型検証を実行する際の依存整備前提を完全化する。
      worktree-operations.md（agentdev-git-worktree skill references）と qg-4-final-acceptance.md
      （agentdev-quality-gates skill references）の依存前置規定について、対象ディレクトリ集合を
      `src/opencode/skills/agentdev-project-extensions/scripts` と `.opencode/skills/repo-agentdev-integrity/scripts`
      （worktree 実体）の両方へ明示する。tsc 型検証を含む場合の型解決前提（当該パッケージでの bun install による @types/bun 等の復元）、
      bun test 単独実行の依存解決前提と main 側 node_modules への junction 作成（検証後削除）または当該 skill ディレクトリでの
      bun install の代替手段、依存整備実施後の再実行手順を記録する。既存の QG-4 正規形（3 cwd 分割実行・./ prefix・環境ラベル）の
      実行形態契約は変更しない。checker 実行契約（AG-006）との責務境界（worktree 汎用手順 vs checker 実行契約）を明確化する。
  - id: AG-006
    content: |
      checker 実行契約（docs/designs/integrity/checker-execution-contracts.md「安定実行経路」節）へ ESM 互換性要件と
      link profile 実効実行要件を追記する。ESM 互換性要件は checker が module import 経由
      （node --experimental-strip-types）での実行を前提とし、CommonJS API（require.main、require 等）への依存を
      実行契約上の互換性要件として扱う方針を定める。link profile 実効実行要件は main root からの読取専用実行、
      実行環境ラベルの記録、worktree 内実行の制約（junction 未伝播により concrete-id 0件の無効実行になり得る risk、REQ-018-004 関連）、
      source/link profile 対比表の結果検証利用を含む。worktree 汎用手順（AG-005）との責務境界を明確化する。
  - id: AG-007
    content: |
      traceability 検証対応計上の整合を修正する。REQ-057-023 を verification-scope-catalog.md の REQ-057 セクション
      （現行 001..022 登録、023 が未登録）へ検証対応任意行として登録する。
      回帰テスト fixture `REQ-\u0030\u0031`（.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts:1160/:1166、
      ADF-COVERS fixture は :1367）が corpus 走査で malformed declaration として誤検出される状態を、
      checker 側のテスト fixture 除外（exemption）適用により解消する（fail-closed 回帰テストは保持する）。
      RU-0007 が提起した「REQ 追加時に分類ゲートを起動する workflow 改善」は本バッチの対象外とし、別課題として記録する
      （RD-002）。
  - id: AG-008
    content: |
      docs-check の既存 delta を現行 main で再実行により棚卸しし、解消済み・残存・警告相当に分離する。
      IR-055 baseline 更新、旧ナンバリング（v2:REQ-01XX 系）参照残存の修正、AUTOGEN ブロック再生成、未解決 placeholder の処分を
      個別に判断・実施する。既知 delta の baseline 取り込みと残存 delta の警告扱いの維持基準を docs-check の検査契約
      （REQ-010）へ明文化する。AG-002 の IR-055 検出方針確定後に行う順序制約を持つ。
  - id: AG-009
    content: |
      integrity baseline 運用を現行化する。ir-055-baseline.json の entry schema（classification: baseline の機械付与契約、
      reason、strict entry 非対象）を integrity-contracts.md の IR-055 baseline 運用節へ明文化する。
      ng-baseline.json の解消済みエントリ（provenance issue-2372-ir065-initial-baseline 系 L1497-1686、
      src/opencode/skills/japanese-tech-writing/SKILL.md 起源 L1683 の不在パスエントリ）を削除し、
      check_integrity 再実行による demote 解除を検証する。third-party Skill 配置先を baseline 走査対象外とする運用を明文化する。
  - id: AG-010
    content: |
      機械契約値・表記の陳腐化を是正する。(1) agentdev-artifact-validation の SKILL.md・scripts/README.md の kind 値を
      実装（req/adr/decision の3値、check-frontmatter-consistency.ts L67-73）と整合させる（実装側の後方互換 `adr` は維持）。
      (2) req-save-procedure.md:22 の adr-revision-mode: full-reclassification の規約行を撤去する（writer・reader が存在しない
      陳腐機械契約値のため。改名はしない）。(3) repo-agentdev-integrity の裸 REQ-0145-014 表記
      （実測13箇所: SKILL.md:179、check_integrity.ts:8636、cli_utils.ts:23/:94/:295/:716、cli_utils.test.ts 7箇所）を
      `v2:REQ-0145-014` へ現行化する（正当な裸参照は v2 系由来のため区別不要、全て現行化）。
      (4) cli_utils.ts:21 の `.omo/plans/agentdev-migration-2026-08-05.md §7` Normative 参照コメントを削除する。
      (5) rewrite-patterns.md の IR-045 系許容表記について、語彙レジストリ実体を正とし検出器語彙として恒久除外する判断を
      vocabulary-registry へ記録する（独立した acceptance とする）。あわせて vocabulary-registry.md 全体の実体対照表参照
      （:24 配置表、:27-28 投射契約、:37 IR-045 節、:56 対象外記述の src 側不存在パス）を .opencode 実体へ是正する。
  - id: AG-011
    content: |
      Knowledge frontmatter 規約（docs/designs/foundations/patterns.md）へ機械判定形式を追記する。追記内容は5項目:
      frontmatter 境界の判定、title/created/updated の必須性、日付妥当性（ISO 8601 解釈）、updated >= created の比較判定、
      違反種別2種（必須項目欠落・日付不整合）の解釈。check_knowledge_docs.ts 実装（REQ-056-010 の機械検査）と整合し、
      checker 変更時に規約側が追従する導線を明示する。
  - id: AG-012
    content: |
      issue-body-and-execution-contract.md:42（case-open の案内元。「2-3: 識別子中心の記載粒度ガイドライン。詳細・記載例は
      agentdev-issue-management 参照」）が案内する記載粒度ガイドライン詳細・記載例を agentdev-issue-management の SKILL.md へ
      追加し、参照導線を修復する（正規所有を agentdev-issue-management とする。付け替えは、参照先本文が全域に存在しないため
      不採用）。inspect-skills の参照妥当性診断で本導線が検出対象として扱われることを確認する。
  - id: AG-013
    content: |
      agentdev_gh Tool の表示スキーマ（src/opencode/plugins/agentdev-gh-tool/plugin.ts）を実装契約型
      （src/opencode/tools/agentdev-gh/contracts.ts）と整合させる。labels の description に issue_list の受理を追記し
      （contracts.ts:178 が issue_list の labels? を受理）、issue_create の labels 必須性
      （contracts.ts:137 が issue_create 入力の labels: readonly string[] を必須化）を表示へ反映する。READ-ONLY 境界
      （readOnly("issue_list") 等の read-only 操作宣言）に変更がないことを確認する。
      表示スキーマは契約型に追従する原則を custom-tool-contracts.md へ明記する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-001]
    content: |
      ## 要件（追加分）

      | ID | 要件 |
      |---|---|
      | REQ-010-072 | docs-check は docs/decisions 関連REQ表における retired REQ へのリンクが retired 実パス（retired/REQ-*.md）を指し、廃止注記を伴うことを検査すること。現行パスへのリンクと注記欠落を違反として検出すること |
      | REQ-010-073 | docs-check は docs/designs 配下の Markdown 本文内相対リンクの解決先実在を検査すること。監査履歴 Report（docs/reports/）のリンクは検査対象外とすること |

      ## 適用範囲（追記分）

      - **対象**: 関連REQ表の retired REQ 実パスリンク検査、docs/designs 相対リンク実在検査
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-017.md
    source_items: [AG-004]
    content: |
      ## 要件（追加分）

      | ID | 要件 |
      |---|---|
      | REQ-017-019 | case-run から実行担当サブエージェントへの委譲 prompt は、structured_context の作業内容・purpose を Issue 本文概要または正規 REQ から抽出して生成すること。会話コンテキスト由来の推定や波及解釈を注入しないこと。委譲 prompt 生成時に Issue 番号と対象成果物パスの一致を検査すること |

      ## 適用範囲（追記分）

      - **対象**: 委譲 prompt 生成側の structured_context 抽出制約と Issue 番号×対象成果物パス突合（消費側 SSoT 要件 REQ-017-016 の生成側対偶）
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-008]
    content: |
      ## 要件（追加分）

      | ID | 要件 |
      |---|---|
      | REQ-010-074 | docs-check の既知 delta は解消済み・残存・警告相当の区分で維持管理され、解消済み delta の baseline 取り込みと残存 delta の警告扱いが検出結果の報告に反映されること。exit code の解釈は severity 区分（REQ-010-006）と既知/新規の区別（REQ-010-007）に基づくこと |

      ## 適用範囲（追記分）

      - **対象**: 既知 delta の区分維持と baseline 取り込み・警告扱いの報告反映
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target: docs/designs/integrity/integrity-contracts.md
    target_area: "RuntimeReference baseline 運用手順"
    source_items: [AG-002]
    content: |
      ### IR-055 検出責務境界

      - IR-055（runtime-unresolved-reference）の検出対象は参照解決不可能な未解決参照である。配布物内の concrete REQ 行 ID
        （3桁行参照 `REQ-NNN-NNN` を含む）の残存検出は IR-059（distribution-reference-boundary）が所有し、IR-055 は
        3桁行参照を検出対象外とする。検出器の正規パターン定義と baseline は本境界に従う。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target: docs/designs/integrity/integrity-contracts.md
    target_area: "RuntimeReference baseline 運用手順"
    source_items: [AG-009]
    content: |
      ### ir-055-baseline entry schema

      - ir-055-baseline.json の entry schema: 各 entry は `classification: baseline`（再生成時に機械的に付与・保持される。
        strict entry には付与しない）と `reason`（既知残存の根拠）を持つ。baseline 再生成は既存 entry の classification・reason
        を保持する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target: docs/designs/integrity/integrity-contracts.md
    target_area: "NG baseline 運用"
    source_items: [AG-009]
    content: |
      ### NG baseline エントリの現行維持

      本節は当該セクションの既存サブセクション（baseline entry 運用契約、宣言的データ YAML と detector の契約）を変更せず、それらと並ぶ運用節として追加する。

      - ng-baseline.json のエントリは、src 側で解消済みの表記に由来するエントリを削除して維持する。削除後は
        `check_integrity` を再実行し、demote（warning 抑制）が解除されて新規違反として検出されないことを検証する。
      - 起源 source path が存在しないエントリ（third-party Skill 配置先への移設等により不在となったパス）は削除する。
        third-party Skill 配置先（`.opencode/skills/` 配下の管理外 Skill）は baseline 走査対象外とする。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target: docs/designs/integrity/distribution-boundary.md
    target_area: "ベースラインと個別承認例外の区別"
    source_items: [AG-003]
    content: |
      ### concrete-id ベースライン再取得手順

      配布依存境界の concrete-id ベースラインは、配布物の concrete ID 是正完了後に次の手順で再取得する。

      1. 対象 commit を最新 main として特定する
      2. source profile と link profile を main root から読取専用で実行する（checker 実行契約の安定実行経路に従う）
      3. 検出された concrete-id エントリ集合（対象 commit、profile 種別、エントリ一覧、件数）を記録様式に従い baseline へ反映する
      4. 再取得の根拠（対象 commit SHA、実行コマンド、件数の増減）を PR 本文へ記載する

      再取得により、解消済み違反の baseline 残存と、現行違反 0件との差異を解消する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target: docs/designs/workflows/delegation-contracts.md
    target_area: "委譲時最小契約"
    source_items: [AG-004]
    content: |
      ### structured_context の SSoT 抽出制約

      - 委譲 prompt に含める structured_context の作業内容・purpose は、委譲先 Issue 本文の概要または正規 REQ から抽出する。
        親セッションの会話コンテキスト由来の推定・波及解釈を注入しない（REQ-017-019）。
      - 委譲 prompt 生成時に、対象 Issue 番号と対象成果物パスの突合を行い、不一致の場合は委譲を開始しない。
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: "安定実行経路"
    source_items: [AG-006]
    content: |
      ### ESM 互換性要件

      checker は module import 経由（node --experimental-strip-types）での実行を前提とする。CommonJS API
      （`require.main`、`require` 等）への依存は、`import.meta.main`、`node:module` の `createRequire` 等による
      互換化を行うか、CLI 例外経路での実行に限定する。新規 checker は import 経由での実行を必須とし、
      既存 checker の互換化は本契約の要件として段階的に適用する。

      ### link profile 実効実行要件

      - link profile は main root から読取専用で実行する（worktree 汎用手順の読取専用実行・環境ラベル規定と整合）。
      - worktree 内実行は junction 未伝播により concrete-id 0件の無効実行になり得る。link profile を worktree で実行した
        場合は実行環境ラベルを記録し、結果の採用可否を環境ラベルで判定する（REQ-018-004 の環境差区分に従う）。
      - source profile と link profile の対比表を検証結果の解釈に用いる。
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: verification-scope-catalog
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_area: "REQ-057（docs corpus 整合・現行化バッチ）"
    source_items: [AG-007]
    content: |
      - REQ-057-001..REQ-057-022: docs corpus の参照・表記・カタログ・テスト基盤・ガイダンスの現行化目標と維持基準。恒久的な新機械検証を新設せず、既存検査（docs-check、IR-055 baseline、traceability check、integrity suite、IR-044）が新規違反を生まない制約と、Case Issue のテスト戦略・工程判断・レビューで検証
      - REQ-057-023: ADF-COVERS 実装対応宣言の未付与行は正規配置先カタログ（artifact-responsibilities）に従い段階的に付与され、triage で retire を選択した要求行は宣言対象外であること。traceability check の検証対応計上で検証（検証対応任意行）
  - id: ACT-DESIGN-008
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: patterns
    target: docs/designs/foundations/patterns.md
    target_area: "Knowledge frontmatter 規約"
    source_items: [AG-011]
    content: |
      #### 機械判定形式（check_knowledge_docs.ts 準拠）

      Knowledge frontmatter 規約の機械判定は次の5項目で構成する。

      1. frontmatter 境界: ファイル先頭の `---` 囲みブロックを frontmatter として判定する
      2. 必須性: `title`、`created`、`updated` の3フィールドの存在を判定する
      3. 日付妥当性: `created`、`updated` を ISO 8601 日付として解釈可能かを判定する
      4. 順序比較: `updated >= created` を判定する
      5. 違反種別: 「必須項目欠落」（2 の違反）と「日付不整合」（3 または 4 の違反）の2種に分類して報告する

      本形式の正実装は check_knowledge_docs.ts であり、checker の判定変更時に本規約が追従する。
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: authoring
      slug: vocabulary-registry
    target: docs/designs/authoring/vocabulary-registry.md
    target_area: "配置と連携"
    source_items: [AG-010]
    content: |
      語彙レジストリの実体対照表のうち配布物に含まれるものは配布物側に配置し、本 Design は配置基準と連携契約のみを所有する（重複管理回避、charter 原則）。

      | 区分 | 配置先 | 役割 |
      |---|---|---|
      | 実体対照表（canonical source、repo-local） | `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` | コマンド名、スキル名、サブエージェント名、ハーネス名、語彙ポリシー、廃止済み概念、完了報告フィールド、REQ 範囲表記、旧分類用語、Capture 語彙、文意品質検出対象語（IR-045）、候補語対照表（IR-044 連携）、IR-055 runtime-unresolved-reference 対照の各テーブルを所有する |
      | 基盤 Design（本ファイル） | `docs/designs/authoring/vocabulary-registry.md` | 語彙レジストリの配置基準、連携契約、IR-045 移管状態、IR-050/IR-051/IR-044 協調契約を所有する |

      repo-agentdev-integrity は repo-local スキル（配布対象外）であるため src 側配置と投射の対象外であり、実体対照表は `.opencode/skills/repo-agentdev-integrity/references/` 直下を正とする。本 Design 内の他節が引用する実体対照表のパスもすべてこの .opencode 実体を指す。
      配布物に含まれる語彙レジストリ（将来追加される場合）は `src/opencode/` 配下に配置し `.opencode/` へ投射する（DEC-002）。

      「実現面」語彙の正典は REQ-004-037 変更後の本文であり、Design（vocabulary-registry を含む）は正典を参照する。Design 側に語彙の定義本文を複製しない。
  - id: ACT-DESIGN-010
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: "操作契約の構成要素"
    source_items: [AG-013]
    content: |
      ### 表示スキーマの契約型追従

      Custom Tool の表示スキーマ（description・parameter 定義）は Tool の契約型（contracts.ts）に追従する。
      表示と契約型に差分が生じた場合は表示側を改めて解消する。agentdev_gh Tool においては、issue_create の labels
      必須性と issue_list の labels・search 受理が表示に反映されていることを含む。
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: authoring
      slug: vocabulary-registry
    target: docs/designs/authoring/vocabulary-registry.md
    target_area: "IR-045 文意品質検出対象語の移管状態（ACT-SPEC-007、REQ-028-007）"
    source_items: [AG-010]
    content: |
      IR-045（docs 日本語表現、文意整合検査）は REQ-010-003、REQ-036-023 により docs-check 機械検出対象から除外し、`agentdev-doc-writing` スキル配下へ移譲済みである。
      catalog-only tombstone として管理され、本 Design では文意品質検出対象語の参照として保持する。

      移管対象語（`read-only`、`read-only-diagnostic`、`advisor`/`advisory`、`architecture-affecting`、`Architecture advisory gate` 等）の対照表は repo-local 参照ファイル `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`「文意品質検出対象語（IR-045）」節が正である。
      本 Design は当該節の管理権限を実体対照表側へ委譲し、重複所有しない。
      rewrite-patterns.md の IR-045 系許容表記は語彙レジストリ実体を正とする検出器語彙として恒久除外する
      （同期現行化は行わない。根拠は integrity-contracts.md の統一選択基準「意図的残存は baseline 登録し根拠注記を付す」に従い、除外の根拠を注記する）。
  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: authoring
      slug: vocabulary-registry
    target: docs/designs/authoring/vocabulary-registry.md
    target_area: "適用範囲"
    source_items: [AG-010]
    content: |
      - 対象: 語彙レジストリの配置基準、連携契約、IR-045/050/051/044/055 と実体対照表（repo-local）の責務分担
      - 対象外: 実体対照表の内容管理（`.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` の責務）、語彙検出ロジックの実装詳細（`check_integrity.ts`、IR-050/IR-051 個別ルールファイルの責務）

conflict_resolutions:
  - id: CR-001
    conflict: RU-0002 は配布物 concrete REQ 行 ID 直接引用を「9箇所」と記載していたが、実測では templates/req-define/req-draft.md:114（REQ-008-060、DEC-026）が追加で存在する（計10箇所）。
    resolution: テンプレート内の concrete ID も IR-059 の検知対象であるため是正対象に含める（10箇所とする）。引用・禁止事例の例示は誤検知対象外のまま維持する。
  - id: CR-002
    conflict: RU-0010 は裸 REQ-0145-014 表記を「8箇所」と記載していたが、実測では13箇所/4ファイル（check_integrity.ts:8636 と cli_utils.ts:94/:295/:716 を含む）である。
    resolution: 実測の13箇所をすべて v2:REQ-0145-014 へ現行化する対象とする。v2: 接頭辞付きの既存表記（check_changed_docs.ts 4箇所）は対象外のまま維持する。
  - id: CR-003
    conflict: REQ-057（docs corpus 整合・現行化バッチ）は SPLIT 予兆計測で合計シグナル +2（要件行数 23行/+0、関心分類 2以上/+1、成果物種別 3以上/+1）の「SPLIT 検討域」であり、A/D 群 RU の APPEND 集約先として候補に挙がる。
    resolution: REQ-057 への APPEND は行わない。本バッチの状態要件は既存行（REQ-057-002/003/009/019/023 等）が既に所有しており、新規行は REQ-010（3行）と REQ-017（1行）へ分割して配置する。これにより REQ-057 の要件行数は不変（23行）とし、SPLIT 検討域の悪化を回避する。RU 別の残作業は Design 操作と反映作業として処理する。
  - id: CR-004
    conflict: RU-0009 が反映先手がかりとして挙げる ACT-DESIGN-003 が現行 corpus（docs/src/.opencode）に存在しない（REQ-028 退役に伴う dangling 参照の可能性）。
    resolution: 当該手がかりは採用せず、ir-055 entry schema 明文化の反映先を integrity-contracts.md の IR-055 baseline 運用節（ACT-DESIGN-002）とする。

operation_units:
  - ou_id: OU-0001
    source_ru: RU-0001
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_documents: [REQ-010]
      artifact_action_mapping:
        ACT-REQ-001: REQ-010
        ACT-REQ-003: REQ-010
      source_ru_mapping:
        RU-0001: [ACT-REQ-001]
      unclassified_requirements: [REQ-010-072, REQ-010-073, REQ-010-074]
  - ou_id: OU-0002
    source_ru: RU-0002
    target_req: REQ-057
    target_design: docs/designs/integrity/integrity-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0003
    source_ru: RU-0003
    target_design: docs/designs/integrity/distribution-boundary.md
    operation: append
    scale: standard
    depends_on: [OU-0002]
    recommended_order: 12
    issue_policy: single
    result: {}
  - ou_id: OU-0004
    source_ru: RU-0004
    target_req: REQ-017
    target_design: docs/designs/workflows/delegation-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved_req_documents: [REQ-017]
      artifact_action_mapping:
        ACT-REQ-002: REQ-017
      source_ru_mapping:
        RU-0004: [ACT-REQ-002]
      unclassified_requirements: [REQ-017-019]
  - ou_id: OU-0005
    source_ru: RU-0005
    target_req: REQ-018
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-0006
    source_ru: RU-0006
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-0007
    source_ru: RU-0007
    target_design: docs/designs/foundations/references/verification-scope-catalog.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-0008
    source_ru: RU-0008
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: [OU-0002]
    recommended_order: 13
    issue_policy: single
    result:
      saved_req_documents: [REQ-010]
      artifact_action_mapping:
        ACT-REQ-003: REQ-010
      source_ru_mapping:
        RU-0008: [ACT-REQ-003]
      unclassified_requirements: [REQ-010-074]
  - ou_id: OU-0009
    source_ru: RU-0009
    target_design: docs/designs/integrity/integrity-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-0010
    source_ru: RU-0010
    target_req: REQ-057
    target_design: docs/designs/authoring/vocabulary-registry.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-0011
    source_ru: RU-0011
    target_design: docs/designs/foundations/patterns.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-0012
    source_ru: RU-0012
    target_req: REQ-057
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    result: {}
  - ou_id: OU-0013
    source_ru: RU-0013
    target_req: REQ-057
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/decisions/README.md の DEC-013 行と docs/designs 修正対象 5ファイル（IR-060、IR-057、quality-gates.md）を確認する。
      相対リンクの解決先実在を機械的に検証する（docs-check の docs/designs 相対リンク検査、または node によるパス解決）。
      併せて docs-check 実行で REQ-010-072/073 の新規検査が稼働し、修正後に違反 0件となることを確認する。
    pass_criteria: |
      DEC-013 行が ../requirements/retired/REQ-028.md へのリンクと retired 注記を持ち、DEC-007/DEC-017 行と同形であること。
      IR-060:35/:67/:68、IR-057:131、quality-gates.md:214 のリンクが全て解決先実在となること。
      新規検査（retired 実パス・designs リンク実在）の回帰テストが存在し、docs-check 実行で違反 0件となること。
    on_failure: |
      fix-and-reverify（リンク修正は機械的確定操作であり、不合格は修正漏れか深度誤りのみに起因するため再修正して再検証する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      是正対象 10箇所（case-open.md:11、case-run.md:43、req-define.md:46/:47、templates/req-define/req-draft.md:114、
      agentdev-case-run-execution-adapter/SKILL.md:65、agentdev-req-analysis/SKILL.md:34、analysis-viewpoints.md:147/:161、
      issue-body-and-execution-contract.md:92）について、配布境界検査（IR-059 系 checker）を実行する。
      integrity-contracts.md の IR-055 節に検出責務境界が追記されていることを確認する。
    pass_criteria: |
      配布物本文中の concrete REQ 行 ID inline 記載（文末出典括弧含む）が 0件となること（ADF-COVERS 宣言と
      REQ-{NNNN}-{NNN} プレースホルダーは除く）。IR-055 の 3桁行参照対象外が Design に明記され、IR-055 checker の
      実挙動が Design と整合すること（3桁行参照を unresolved として検出しないこと）。
    on_failure: |
      fix-and-reverify（是正箇所の見落としや置換後の文意破壊は修正可能な実装不具合のため）。
  - id: TS-003
    target_item: AG-003
    verification: |
      distribution-boundary.md に再取得手順が追記されていることを確認する。最新 main で source/link profile を
      main root から読取専用実行し、エントリ集合・件数・対象 commit を記録する。記録が PR 本文に反映されていることを確認する。
      実行は AG-002 是正完了後であることを確認する。
    pass_criteria: |
      再取得後の concrete-id baseline が現行 main の実行結果と一致し、222cd93d 時点の解消済み違反（16件記録分）が
      baseline に残存しないこと。再取得の根拠（commit SHA、実行コマンド、件数）が PR 本文に記載されていること。
    on_failure: |
      fix-and-reverify（baseline 再生成と記録の不備は再実行で解消可能なため）。
  - id: TS-004
    target_item: AG-004
    verification: |
      delegation-contracts.md と REQ-017 への追記を確認する。委譲契約を満たす配布物 references
      （harness-delegation.md、structured-stage-handoff.md）に抽出制約・突合検査が反映されていることを確認する。
      過去事例（Issue #2566/#2562）と同種の乖離が契約上禁止状態であることを文面確認する。
    pass_criteria: |
      委譲 prompt の structured_context が Issue 本文概要または正規 REQ からの抽出を必須とする契約が
      Design・REQ・配布物 references の三層で整合していること。Issue 番号×対象成果物パス突合が委譲契約に含まれること。
    on_failure: |
      fix-and-reverify（契約文の追記不備は文面修正で解消するため）。
  - id: TS-005
    target_item: AG-005
    verification: |
      worktree-operations.md と qg-4-final-acceptance.md の依存前置規定が、対象ディレクトリ集合（両 scripts ディレクトリ）、
      型解決前提（@types/bun 復元）、bun test 単独実行の依存前提、junction 代替手段、整備後の再実行手順を網羅していることを
      文面確認する。実際に worktree を作成し、規定に従って依存整備後に integrity suite の該当検証を実行する。
    pass_criteria: |
      依存整備後に worktree 環境で integrity suite・契約テスト・tsc 型検証が環境起因 fail なしで実行できること。
      規定が agentdev-project-extensions/scripts と repo-agentdev-integrity/scripts の両方を対象とし、QG-4 正規形
      （3 cwd 分割実行・./ prefix・環境ラベル）が変更されていないこと。
    on_failure: |
      fix-and-reverify（依存整備の不足は規定追記と整備実施で解消するため。環境差と変更起因の混同は REQ-018-004 に従い分離する）。
  - id: TS-006
    target_item: AG-006
    verification: |
      checker-execution-contracts.md へ ESM 互換性要件・link profile 実効実行要件が追記されていることを確認する。
      代表 checker について module import 経由（node --experimental-strip-types）での実行を確認する。
      link profile を main root から読取専用実行し、実行環境ラベルが記録されることを確認する。
    pass_criteria: |
      実行契約に ESM 互換・main root 読取専用実行・環境ラベル記録・worktree 内実行制約・対比表利用が明記されていること。
      代表 checker の import 経由実行が成功すること（CommonJS API 起因の ReferenceError が発生しないこと）。
      AG-005 との責務境界（worktree 汎用手順と checker 実行契約の記述分離）が両文書で確認できること。
    on_failure: |
      fix-and-reverify（契約追記と checker 実行確認の不備は修正して再検証するため）。
  - id: TS-007
    target_item: AG-007
    verification: |
      verification-scope-catalog.md の REQ-057 セクションに 023 が登録されていることを確認する。
      agentdev-traceability の check を実行し、REQ-057-023 が missing-verification として計上されないことを確認する。
      check_integrity を実行し、distribution-boundary.test.ts の fixture 由来の malformed-declarations が 0件であることを確認する。
      同テストファイルの回帰テスト（fail-closed 検証）が通過することを確認する。
    pass_criteria: |
      traceability check の計上から REQ-057-023 の missing-verification が消滅すること。malformed-declarations 常時 1件の
      false fail が解消し（0件）、回帰テストが全件通過すること。
    on_failure: |
      fix-and-reverify（catalog 登録と exemption 適用は機械的修正のため）。
  - id: TS-008
    target_item: AG-008
    verification: |
      docs-check を現行 main で実行し、既存 delta の再実行結果（解消済み・残存・警告相当の分離）を確認する。
      baseline 更新・旧ナンバリング参照修正・AUTOGEN 再生成・placeholder 処分の実施結果を確認する。
      REQ-010 への維持基準の追記（ACT-REQ-003）を確認する。
    pass_criteria: |
      既知 delta が三分類で整理され、解消済み delta が baseline・警告から除去されていること。docs-check の exit code が
      未処分の新規違反 0件の状態で解釈可能であること（severity と既知/新規区分に基づく）。REQ-010-074 が追記されていること。
    on_failure: |
      fix-and-reverify（棚卸し結果に基づく個別処分の実施不足は再実行で解消するため）。
  - id: TS-009
    target_item: AG-009
    verification: |
      integrity-contracts.md の IR-055 節に entry schema が明文化されていることを確認する。ng-baseline.json から
      issue-2372 系・不在パス起源エントリが削除されていることを確認する。check_integrity を再実行し、demote 解除後も
      新規違反として不当な検出が生じないことを確認する。third-party 配置先の走査対象外が明文化されていることを確認する。
    pass_criteria: |
      entry schema（classification: baseline・reason・strict 非対象・機械付与保持）が Design に記載され、ir-055-baseline.json
      の実データと整合すること。ng-baseline.json に不在パス起源・解消済みエントリが残存しないこと。check_integrity 再実行で
      demote 解除が破綻しないこと（解消済み表記の再検出 0件）。
    on_failure: |
      fix-and-reverify（baseline エントリ削除と Design 明文化は再実行可能な機械操作のため）。
  - id: TS-010
    target_item: AG-010
    verification: |
      (1) artifact-validation の SKILL.md・scripts/README.md の kind 記載が req/adr/decision と整合すること。
      (2) req-save-procedure.md から adr-revision-mode 行が除去されていること（repo 全域で出現 0件）。
      (3) repo-agentdev-integrity の裸 REQ-0145-014 が 0件（13箇所すべて v2: 接頭辞付きに変更）であることを grep で確認。
      (4) cli_utils.ts から .omo/plans Normative 参照コメントが除去されていること。
      (5) vocabulary-registry.md の対照表パスが .opencode 実体を指し、恒久除外判断が根拠注記付きで記録されていること。
      あわせて check-frontmatter-consistency と checker 系テストが通過することを確認する。
    pass_criteria: |
      上記 (1)〜(5) がすべて成立し、契約値・表記系の checker・テストが通過すること。語彙レジストリの恒久除外判断が
      独立 acceptance として vocabulary-registry.md に記録されていること。
    on_failure: |
      fix-and-reverify（表記是正は機械的修正のため。語彙レジストリ判断の前提崩壊が判明した場合は Design 判断を再評価する）。
  - id: TS-011
    target_item: AG-011
    verification: |
      patterns.md の Knowledge frontmatter 規約に機械判定形式5項目が追記されていることを確認する。
      check_knowledge_docs.ts の実装（frontmatter 境界・必須性・日付妥当性・updated >= created・違反種別2種）と
      規約文面が対応することを突合する。docs/knowledge 配下の既存知識文書で checker が通過することを確認する。
    pass_criteria: |
      規約の5項目と checker 実装の判定が一対一で対応し、docs/knowledge 全ファイルが checker 通過すること。
      checker 変更時に規約が追従する導線の記述が存在すること。
    on_failure: |
      fix-and-reverify（規約追記と実装の対応づけは文面修正で解消するため）。
  - id: TS-012
    target_item: AG-012
    verification: |
      agentdev-issue-management の SKILL.md に識別子中心の記載粒度ガイドライン詳細・記載例が追加されていることを確認する。
      issue-body-and-execution-contract.md:42 の案内が実在する本文を指すことを確認する。
      inspect-skills の参照妥当性診断で本導線が切断として検出されないことを確認する。
    pass_criteria: |
      案内元から案内先への参照導線が実在本文で完結すること。追加した本文が agentdev-issue-management の責務範囲
      （Issue 操作の安全手順）に属すること。
    on_failure: |
      fix-and-reverify（本文追加と案内整合は修正可能な文面操作のため）。
  - id: TS-013
    target_item: AG-013
    verification: |
      plugin.ts の表示スキーマと contracts.ts を突合する。labels description に issue_list が含まれること、
      issue_create の labels 必須性が表示に反映されること（required 定義または description 記述）を確認する。
      plugin のテスト（plugin.test.ts）が通過することを確認する。READ-ONLY 操作宣言に変更がないことを確認する。
    pass_criteria: |
      表示スキーマの記述が契約型の受理値・必須性とすべて整合し、テストが通過すること。custom-tool-contracts.md に
      表示スキーマの契約型追従原則が追記されていること。
    on_failure: |
      fix-and-reverify（表示側の修正は契約型を正とした一方向修正のため）。

realization_actions:
  - id: RA-001
    concern: docs corpus リンク是正（DEC-013 行 + designs 相対リンク 5件）
    responsibility: docs corpus の参照整合の維持（REQ-057-002 適用）。修正は各ファイルの本文リンクのみ。
    ownership_hints:
      - docs/decisions/README.md:181（DEC-013 行、retired 正規形は DEC-007/DEC-017 行が模範）
      - docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md:35/:67/:68
      - docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md:131
      - docs/designs/quality/quality-gates.md:214
      - .opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml（IR-057:131 のリンク先実体）
      - src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md（IR-060:35/:67 のリンク先実体）
    intent: リンク切れ・深度誤りを実配置へ修正し、docs-check 新規検査（REQ-010-072/073）で恒常検出可能にする。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: 配布物 concrete REQ 行 ID 是正（10箇所）
    responsibility: 配布物の concrete ID inline 記載の排除（REQ-057-019・IR-059 triage_action適用）。
    ownership_hints:
      - src/opencode/commands/agentdev/case-open.md:11
      - src/opencode/commands/agentdev/case-run.md:43
      - src/opencode/commands/agentdev/req-define.md:46/:47
      - src/opencode/commands/agentdev/templates/req-define/req-draft.md:114
      - src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:65
      - src/opencode/skills/agentdev-req-analysis/SKILL.md:34
      - src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md:147/:161
      - src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md:92
      - .opencode/ 側配布物は src からの junction のため src 側で完結
    intent: 文末出典括弧等の concrete ID を機能的記述へ置換する。置換後の文意が原文の規範参照を保持すること。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: concrete-id ベースライン再取得の実施
    responsibility: 配布依存境界 baseline の現行化（REQ-057-009 適用、手順は ACT-DESIGN-004）。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/（profile 実行・baseline 記録）
      - distribution-boundary.md 再取得手順（ACT-DESIGN-004 で定義）
    intent: AG-002 是正完了後に最新 main で profile を実行し、baseline を現行化する。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: 委譲契約の配布物 references 反映
    responsibility: 委譲 prompt 生成側の SSoT 抽出制約と突合検査の実行手順記載。
    ownership_hints:
      - src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（structured_context 例 L103-122、L164、L179-180 付近）
      - src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md（L20-21 付近）
    intent: REQ-017-019 と ACT-DESIGN-005 の制約を委譲実行手順の本文へ反映する。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: worktree 依存整備前提の完全化
    responsibility: worktree 検証の依存前置規定の拡充（REQ-018-002 適用、QG-4 正規形は不変）。
    ownership_hints:
      - src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L130 付近
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L244 付近
      - .opencode/skills/repo-agentdev-integrity/scripts（worktree 実体側の依存配置先）
    intent: 対象ディレクトリ集合（両 scripts）、@types/bun 型解決、per-skill node_modules、junction 代替、整備後再実行手順を記載する。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: traceability fixture 誤検出の解消（checker exemption）
    responsibility: corpus 走査におけるテスト fixture 除外の適用（malformed declaration 誤検出の解消、回帰テスト保持）。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts（fixture L1160/:1166/:1367）
      - .opencode/skills/repo-agentdev-integrity/scripts/src/check_integrity.ts（corpus 走査・exemption 適用箇所）
    intent: checker 側にテスト fixture の除外（exemption）を適用し、fail-closed 回帰テストはそのまま保持する。
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-007
    concern: ng-baseline エントリ是正
    responsibility: 解消済み・不在パス起源 baseline エントリの削除と再実行検証（ACT-DESIGN-003 運用の初回適用）。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json（L1497-1686 issue-2372 系、L1683 japanese-tech-writing 起源）
    intent: エントリ削除後に check_integrity を再実行し、demote 解除が破綻しないことを検証する。
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-008
    concern: docs-check 既存 delta 棚卸しの実施
    responsibility: 既知 delta の再実行・三分類・個別処分（baseline 更新、旧ナンバリング参照修正、AUTOGEN 再生成、placeholder 処分）。
    ownership_hints:
      - docs-check 実行（repo/docs-check 経由）
      - .opencode/skills/repo-agentdev-integrity/（IR-055 baseline、AUTOGEN 対象）
      - docs/designs/integrity/rules/IR-066-legacy-path-removed-name.md L21/:38（裸 REQ-0108-262 残存候補。rules/IR-*.md は IR-055 自己参照除外のため確定は docs-check 再実行による）
    intent: 現行 main での delta 状態を確定し、REQ-010-074 の維持基準に従って処分を完結する。
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-009
    concern: 機械契約値・表記の陳腐化是正
    responsibility: 契約記載と実装・現行表記の整合是正（REQ-057-003/014/015 適用）。
    ownership_hints:
      - src/opencode/skills/agentdev-artifact-validation/SKILL.md:53 と scripts/README.md（kind 値 3値化。実装正は check-frontmatter-consistency.ts L67-73）
      - src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md:22（adr-revision-mode 行撤去）
      - src/opencode/skills/agentdev-doc-writing/references/rewrite-patterns.md（IR-045 系許容表記の取扱いは ACT-DESIGN-009 と連動）
      - .opencode/skills/repo-agentdev-integrity/SKILL.md:179、scripts/src/check_integrity.ts:8636、scripts/src/cli_utils.ts:23/:94/:295/:716、scripts/src/cli_utils.test.ts 7箇所（裸 REQ-0145-014 計13箇所の v2: 化）
      - .opencode/skills/repo-agentdev-integrity/scripts/src/cli_utils.ts:21（.omo/plans Normative コメント削除）
    intent: 契約値・表記を実装と現行規約へ整合させ、誤認源（陳腐契約値・裸旧表記・非正規参照）を除去する。
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-010
    concern: issue-management 参照導線の修復（本文追加）
    responsibility: 記載粒度ガイドライン詳細・記載例の正規所有と案内整合。
    ownership_hints:
      - src/opencode/skills/agentdev-issue-management/SKILL.md（本文追加先）
      - src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md:42（案内元、整合確認のみ）
    intent: 案内された規律（識別子中心の記載粒度）の本文を agentdev-issue-management へ追加し、導線を完結させる。
    verification_refs: [TS-012]
    source_items: [AG-012]
  - id: RA-011
    concern: agentdev_gh 表示スキーマの契約型整合
    responsibility: 表示スキーマの契約型追従（REQ-057-022・ACT-DESIGN-010 原則の適用）。
    ownership_hints:
      - src/opencode/plugins/agentdev-gh-tool/plugin.ts:95（labels description）、:125（required 定義）
      - src/opencode/tools/agentdev-gh/contracts.ts:137（issue_create labels 必須）、:178/:179（issue_list labels/search）（契約型の正）
      - src/opencode/plugins/agentdev-gh-tool/plugin.test.ts（テスト）
    intent: labels description へ issue_list 追記、issue_create labels 必須性の表示反映、READ-ONLY 境界不変の確認。
    verification_refs: [TS-013]
    source_items: [AG-013]

review_dispositions:
  - id: RD-001
    source_ru: RU-0014
    source_item: RU-0014
    disposition: covered
    reason_code: already_satisfied
    reason: |
      RU-0014 の本体（typecheck に伴う作業ツリー汚染の検証）は commit cfbe7864（Refs #2641、PR #2650）により
      agentdev-case-run-execution-adapter のコミット前検証手順へ実装済み（git status --porcelain による tsconfig 系変更の
      警告検出。自動破棄・自動 checkout は行わない運用）。本体制御は covered（already_satisfied）とする。
      一方、残る論点の CI typecheck job での git diff --exit-code 検証は本バッチの対象外（out_of_scope）とする:
      同 commit で「検討候補として記録、本手順では実施しない」と明記済みであり、本リポジトリには .github/ が存在しない
      （CI workflow 不存在を実検証済み）。CI 導入の要否は別の要件定義で扱う。
    evidence:
      path: src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md
      section: コミット前検証（git status --porcelain による tsconfig 系変更検出）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0007
    source_item: RU-0007-workflow-improvement
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0007 が付帯提起した「REQ 追加時に分類ゲート（検証対応要否分類）を起動する workflow 改善」は、REQ-057-023 の
      登録漏れの再発防止に有効だが、req-save・case-open の workflow 変更を伴う独立論点であるため本バッチの対象外とする。
      必要に応じて追跡Issue または別 RU として起票する。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    RU-0001〜RU-0013 を OU-0001〜OU-0013（13 operation_units）へ 1:1 対応で構成する。RU-0014 は RD-001 により対象外。
    各 OU は単一 Issue で完結する規模。Epic で 13 Issue を束ねる。OU-0003 と OU-0008 は OU-0002 の完了に依存する
    （Wave 分離を推奨）。OU の target_req は traceability のアンカー（governing REQ）であり、REQ ファイル編集は
    artifact_actions が所有する（REQ ファイル編集は REQ-010 3行・REQ-017 1行のみ、CR-003 どおり）。
  wave_hints:
    - wave: 1
      units: [OU-0001, OU-0002, OU-0004, OU-0005, OU-0006, OU-0007, OU-0009, OU-0010, OU-0011, OU-0012, OU-0013]
      rationale: 相互に先行依存がない独立 OU。RU-0002→RU-0003 の順序制約（RU frontmatter depends_on）以外に逐次制約なし。
    - wave: 2
      units: [OU-0003, OU-0008]
      rationale: OU-0002（配布物 ID 是正・IR-055 方針確定）の完了後に行う順序制約（baseline 再取得・delta 棚卸し）。
```

# summary

backlog-auto（2026-09-07）が生成した RU-0001〜RU-0014 を一括対象とする要件ドラフト。14 RU のうち RU-0014 は配布物側
コミット前検証（commit cfbe7864）で充足済みのため review_dispositions により対象外とし、残る 13 RU を 13 operation_units
として構成した。既存要件行が大部分の状態要件を所有するため、新規 REQ 行は REQ-010 へ 3行（docs-check 検査追加・delta 運用）、
REQ-017 へ 1行（委譲 context SSoT 抽出）のみ。Design 操作は 12 action（integrity-contracts×3、distribution-boundary、
delegation-contracts、checker-execution-contracts、verification-scope-catalog、patterns、vocabulary-registry、
custom-tool-contracts）。反映作業（realization_actions 11件）として docs リンク是正、配布物 concrete ID 是正 10箇所、
worktree 依存整備、baseline 是正・再取得、表記是正 13箇所、issue-management 本文追加、agentdev_gh 表示スキーマ整合を含む。
RU 記載と実測の差異（是正対象の追加発見・件数更新）は conflict_resolutions に記録済み。REQ-057 への APPEND は行わない
（CR-003）。観察事項: DEC-018 が Decision 番号域で無注記の欠番となっている（本ドラフトの対象外。必要に応じて別途起票）。
