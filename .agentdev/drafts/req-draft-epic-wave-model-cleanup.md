---
draft_type: req_draft
topic_slug: epic-wave-model-cleanup
status: saved
created_at: 2026-06-21T15:10:00+09:00
updated_at: 2026-06-21T18:00:00+09:00
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  ADR-0128（case-run CLI subprocess廃止・task()/ulw-loop移行）に伴う
  REQ-0114/REQ-0130/SPEC workflow-contracts.md の整合性是正。
  (1) REQ-0114-045〜050 全面廃止・049更新・新規1件追加（case-auto委譲ループ）。
  case-auto要件からWave概念を排除し、委譲ループのみ記述。
  (2) REQ-0130 にcase-run #epicのEpic実行振る舞い要件を新規2件追加
 （Epic本文読込・並列task()委譲・べき等）。
  (3) SPEC のEpic関連セクション全面書き換え（SC-001 2階層化・SC-002/003
  status enum設定主体更新・SC-007 case-run内部モデル化・Epic統率者契約セクション
  ・子Issue単位オーケストレーションモデルセクション全面書き換え）。
  (4) Wave必須化: SPEC SC-001の中規模OU（Epic>Issue）行を削除し、
  Epicは常にWave構造を持つ2階層モデルに簡素化。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-0114-045〜050 は旧ケースモデル（case-auto子Issueオーケストレーション）を
      記述しており、ADR-0128移行後に全面陳腐化した。045/046/047/048/050を廃止し、
      049を委譲単位の報告に更新、新規1件（委譲ループ）を追加する。
      case-autoはWave概念を要件に登場させず、「case-run→case-closeの反復」という
      委譲ループのみを記述する。Wave有無はcase-run/case-closeの内部概念であり、
      case-autoの要件はWave構造を前提としない。

  - id: AG-002
    content: >
      REQ-0130 にcase-run #epicのEpic実行振る舞い要件が存在しない。
      ADR-0128 Decision #3が技術判断を記述しているが、REQレベルでの
      振る舞い要件として明文化が必要。新規2件を追加する:
      (1) Epic Issue本文読込・現在Wave実行可能子Issue特定・並列task()委譲（最大5件）・
      全完了待機・結果収集・1Wave実行でreturn（マージしない）
      (2) べき等（再指定時・Epic Issue本文から進行状況判定・未完了次Wave処理）

  - id: AG-003
    content: >
      SPEC workflow-contracts.md のEpic関連セクションが全面陳腐化している。
      (a) SC-001階層パターン: 中規模OU（Epic>Issue）行を削除し2階層化
      （単一: OU>Issue / 複数: OU>Epic>Wave>Issue）。Epicは常にWave構造を持つ。
      (b) SC-002/SC-003 status enum: ready/running はcase-run内部状態
      （永続状態に書き込まない）・設定主体更新。blocked設定主体も更新
      （case-run/case-close・case-auto除外）。永続状態 vs 内部状態の区別を明記。
      (c) SC-007: 全面書き換え。旧case-auto子Issue選択ロジック →
      case-run(#epic)内部モデル。
      (d) Epic統率者契約セクション・子Issue単位オーケストレーションモデルセクション:
      全面書き換え。旧オーケストレータモデル → case-auto委譲ループ + case-run内部モデル +
      case-close単一書き手（ADR-0125）。

  - id: AG-004
    content: >
      Wave必須化: SPEC SC-001の中規模OU（OU > Epic > Issue）行を削除する。
      Epicは常にWave構造を持つ。case-openは現行通り常にWave構造を生成する
      （依存関係がない場合はWave 1に全Issueをまとめる）ため、実装変更は不要。
      これによりcase-run/case-closeはWave構造を前提とし、「WaveなしEpic」の
      特殊ケース処理が不要になる。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    source_items: [AG-001]
    content: |
      REQ-0114-045 廃止: case-auto子Issue選択（Wave table確認・ready選択・最大5件・pending→ready遷移）は case-run(#epic) 内部責務に移管済み（ADR-0128 Decision #3）

      REQ-0114-046 廃止: case-auto全case-run完了待ち→case-close順次実行は、case-auto委譲ループ（case-run(#epic)→case-close(#epic)反復）に置換

      REQ-0114-047 廃止: case-auto並列blocker継続は case-run(#epic) 内部責務に移管済み

      REQ-0114-048 廃止: case-auto全子Issue close完了判定は、case-close(#epic) 完了報告（Epic完了/残Wave通知）で判定

      REQ-0114-049 更新:
      現行: case-auto は停止条件の検出時または部分失敗時、以下を報告すること: (1) 完了した子Issue一覧（Issue番号・PR番号） (2) 進行中の子Issue一覧（ある場合） (3) 未実行の子Issue一覧 (4) 再開に必要な次コマンド
      更新後: case-auto は停止条件の検出時または部分失敗時、以下を報告すること: (1) 完了した委譲単位（case-run/case-close の実行結果・対象範囲） (2) 進行中の委譲（ある場合） (3) 未実行の委譲（残り範囲） (4) 再開に必要な次コマンド

      REQ-0114-050 廃止: case-auto子Issue単位case-closeは case-close(#epic) 内部責務に移管済み

      REQ-0114-085 新規追加:
      case-auto は Epic Issue に対し case-run → case-close の委譲を反復し、case-close が Epic 完了を報告するまで反復すること。子Issue の個別選択・並列管理・個別クローズは case-run/case-close の内部責務であり、case-auto は実施しないこと

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0130.md
    source_items: [AG-002]
    content: |
      REQ-0130-026 新規追加:
      case-run は Epic Issue 指定時、Epic Issue 本文を読み込み現在の Wave の実行可能な子Issue を特定し、各子Issue を task(subagent_type="Sisyphus-Junior", load_skills=["ulw-loop"]) で並列委譲すること（最大5件）。全 task() の完了を待ち、結果を収集して return すること（1 Wave の実行で return・マージしない）

      REQ-0130-027 新規追加:
      case-run は Epic Issue 再指定時、Epic Issue 本文から進行状況を判定し、未完了の次 Wave を処理すること（べき等・同一コマンド再実行で次 Wave に進む）

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/workflow-contracts.md
    target_area: "SC-001階層パターン + SC-002/003 status enum + SC-007 + Epic統率者契約セクション + 子Issue単位オーケストレーションモデルセクション"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      【SC-001 階層パターン表 2階層化】
      現行:
      | 小規模 OU | OU → Issue |
      | 中規模 OU | OU → Epic → Issue |
      | 大規模 OU | OU → Epic → Wave → Issue |
      更新後:
      | 単一 Issue | OU → Issue |
      | 複数 Issue | OU → Epic → Wave → Issue |
      中規模OU行を削除。Epic は常に Wave 構造を持つ（依存関係がない場合は Wave 1 に全 Issue をまとめる）。

      【SC-002/SC-003 status enum 設定主体更新】
      現行:
      | ready | case-auto | → 更新後: case-run 内部判定（永続状態に書き込まない）
      | running | case-auto | → 更新後: case-run 内部状態（永続状態に書き込まない）
      | completed | case-close | → 変更なし（ADR-0125 単一書き手）
      | blocked | case-run / case-auto | → 更新後: case-run / case-close
      | failed | case-run | → 変更なし
      | pending | case-open（初期値） | → 変更なし
      新規注記追加: ready/running は case-run(#epic) の内部状態であり、Epic Issue 本文（永続状態）には書き込まれない。永続状態に書き込まれるのは pending → completed/blocked/failed の遷移のみ（case-close が単一書き手: ADR-0125）。

      【SC-007 全面書き換え: case-auto子Issue選択 → case-run内部モデル】
      現行タイトル: case-auto 子Issue選択・永続状態（SC-007）
      更新後タイトル案: case-run Epic 実行モデル（SC-007）
      現行内容: case-autoが読み取る情報（子Issue一覧・Wave構成・Wave table実行方法列・各子Issue status・PR状態）・子Issue選択ロジック（並列対応・最大5件・ready遷移）
      更新後内容:
      - case-run(#epic) は Epic Issue 本文を読み込む（子Issue一覧・Wave構成・各子Issue status・PR状態）
      - case-run(#epic) は現在 Wave の実行可能な子Issue を内部判定する（依存関係充足確認・永続状態には書き込まない）
      - case-run(#epic) は各子Issue を task() で Sisyphus-Junior(ulw-loop) に並列委譲する（最大5件・各task()は1 Issue処理）
      - case-run(#epic) は全 task() 完了を待ち、結果を収集して return する（1 Wave のみ・マージしない）
      - case-run(#epic) は再実行時、Epic Issue 本文から進行状況を判定し次 Wave を処理する（べき等）
      - case-close(#epic) が Epic Issue 本文ステータス追跡テーブルを更新する（ADR-0125 単一書き手）

      【Epic 統率者契約セクション 全面書き換え】
      現行: 親エージェント subagent 一括起動・specs 直列更新・Wave 間 rebase・注記（行466: case-auto case-run 並行委譲）
      更新後:
      - case-auto は Epic Issue に対し case-run(#epic) → case-close(#epic) の委譲を反復する
      - case-run(#epic) は現在 Wave の子Issue を task() で Sisyphus-Junior(ulw-loop) に並列委譲する（最大5件・1 Wave のみ）
      - case-close(#epic) は現在 Wave の PR マージ・子Issue クローズ・Epic status table 更新を行う（単一書き手: ADR-0125）
      - 最終 Wave で case-close が Epic クローズを報告 → case-auto が全体完了

      【子Issue単位オーケストレーションモデルセクション 全面書き換え】
      現行タイトル: 子Issue単位オーケストレーションモデル
      更新後タイトル案: Epic/Wave 実行モデル
      現行注記（行614）: case-auto子Issueオーケストレーションモデル・case-auto case-run 並行委譲（ADR-0125）
      更新後: case-auto委譲ループ + case-run内部モデル + case-close単一書き手（ADR-0128 Decision #5・ADR-0125）
      SC-001〜SC-007 の各サブセクションは上記更新内容に従って全面書き換え

conflict_resolutions: []

spec_actions_consumed_at: 2026-06-21T18:00:00+09:00

operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - docs/requirements/REQ-0114.md
      artifact_action_id: ACT-REQ-001
      operations:
        - target_id: REQ-0114-045
          type: retire
        - target_id: REQ-0114-046
          type: retire
        - target_id: REQ-0114-047
          type: retire
        - target_id: REQ-0114-048
          type: retire
        - target_id: REQ-0114-049
          type: update
        - target_id: REQ-0114-050
          type: retire
        - target_id: REQ-0114-086
          type: append
          note: "draft 原案は REQ-0114-085 を指定したが、既存の REQ-0114-085（task() 起動結果受領・ADR-0127）と重複したため max+1 の 086 に変更（G05 欠番埋め禁止・max+1 ルール準拠）"

  - ou_id: OU-002
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs:
        - docs/requirements/REQ-0130.md
      artifact_action_id: ACT-REQ-002
      operations:
        - target_id: REQ-0130-026
          type: append
        - target_id: REQ-0130-027
          type: append
      scope_update:
        適用範囲_対象: "Epic Issue 本文読込と現在Wave実行可能子Issue特定・1 Wave 実行で return・べき等（再実行で次 Wave 処理） を追加"

  - ou_id: OU-003
    target_spec: docs/specs/workflow-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
  wave_hints:
    - wave: 1
      issues:
        - ou_id: OU-001
          title: "REQ-0114 case-auto委譲ループ化・045-050廃止 (ADR-0128追整)"
          target: REQ-0114
        - ou_id: OU-002
          title: "REQ-0130 case-run #epic Epic実行振る舞い要件追加"
          target: REQ-0130
    - wave: 2
      depends_on: [wave-1]
      issues:
        - ou_id: OU-003
          title: "SPEC workflow-contracts.md Epic関連セクション全面書き換え"
          target: docs/specs/workflow-contracts.md
```

# summary

ADR-0128（case-run CLI subprocess廃止・task()/ulw-loop移行）に伴う REQ/SPEC 整合性是正。

## 主要変更

1. **REQ-0114 抜本的見直し**: 045-050全廃止（旧case-auto子Issueオーケストレーション）・049更新（委譲単位報告）・085新規（委譲ループ）。case-auto要件からWave概念を排除。
2. **REQ-0130 Epic実行要件追加**: 026（Epic本文読込・並列task()委譲・1Wave return）・027（べき等・再実行で次Wave）。
3. **SPEC 全面書き換え**: SC-001 2階層化（Wave必須）・SC-002/003 status enum設定主体更新（ready/running=内部状態）・SC-007 case-run内部モデル化・Epic統率者契約/子Issueオーケストレーションモデルセクション全面書き換え。
4. **Wave必須化**: 中規模OU（Epic>Issue）削除。Epic常にWave構造。

## SPLIT シグナル（REQ-0114）

現行81要件（要件行数 SPLIT +2）。本変更後: 81 - 5（廃止）+ 1（新規）= 77要件（SPLIT +1）。本draftでは是正が主目的のためSPLIT提案は保留。別途REQ-0114全体のSPLIT検討を推奨。

## スコープ外

- learning-capture（worktree基点問題の学習）: 本draft完了後に learning-capture スキルで別途記録

## 動機

Epic #979完了時の残リスク3件（REQ-0114-045〜050旧モデル残存・SPEC表現ズレ・worktree基点問題学習）の是正。
