---
draft_type: req_draft
topic_slug: doc-writing-skill
status: saved
created_at: 2026-06-20T16:30:00+09:00
source_rus: []
---

<!-- req_draft（REQ-0138, ADR-0124）
     正となる情報源は # draft-data 内の fenced YAML である。
     人間可読 Markdown セクションは補助（処理の正ではない・REQ-0138-002）。 -->

# draft-data

```yaml
work_type: feature

scale: standard

summary: >-
  ADR/REQ/SPEC 文書品質仕様として docs/specs/writing-style.md を確定・拡張し、その仕様を適用する
  実行時スキルとして agentdev-doc-writing を整備する。agentdev-no-ai-slop-writing を廃止し、
  全資産（AI-slop 10基準・5出力原則・11 pre-output review rules・forbidden-phrases.md）を
  agentdev-doc-writing および writing-style.md に吸収する。REQ-0140 を「文書品質ゲート」に
  改題・拡張し、req-save / spec-save で必須チェック（不合格は修正して再チェック・QG-1〜QG-4
  と同じモデル）を定義する。REQ-0103-032 の参照を agentdev-doc-writing に更新する。
  本 draft の対象はスキル定義・SPEC確定・REQ拡張であり、REQ-0101 個別行修正および全
  ADR/REQ/SPEC ファイルの一括是正は対象外とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      agentdev-doc-writing スキルを新設する。正本仕様は docs/specs/writing-style.md とし、
      SKILL.md は仕様を適用するための実行入口、references/* は査読時に使う運用ビュー
      （圧縮ビュー・チェックリスト・出力形式）とする。参照ファイル構成は以下の7ファイルとする:
      ai-slop-detection.md（AI-slop 検出基準・agentdev-no-ai-slop-writing から吸収・検出観点
      として独立性が高いため分離）、document-boundaries.md（文書種別責務・REQ/ADR/SPEC/guide/
      README 配置判定）、req-line-quality.md（REQ要件行の合格基準・主語・対象・状態・検証可能性・
      粒度・配置妥当性・文体・独立性）、adr-writing-quality.md（ADR本文の合格基準・意思決定文書
      としての成立性）、spec-writing-quality.md（SPEC本文の合格基準・詳細仕様の置き場としての
      成立性）、rewrite-patterns.md（検出→書き換えパターン・forbidden-phrases.md から吸収・
      検出基準と修正パターンは用途が異なるため分離）、review-output.md（査読出力形式・残す/
      分割/移送/削除候補の分類・修正文案形式）。agentdev-no-ai-slop-writing を廃止し、全資産を
      吸収する。4スキル（agentdev-adr-file-manager・agentdev-workflow-templates・
      agentdev-skill-authoring・agentdev-req-file-manager）の See Also 参照を
      agentdev-no-ai-slop-writing から agentdev-doc-writing に更新する。

  - id: AG-002
    content: >-
      docs/specs/writing-style.md を DRAFT から確定に昇格する。正本仕様として以下を拡張する:
      (1) 要件行の書き方 — 1行1関心原則（1要件行に複数の独立した判断・関心を混入させない）、
      肯定文主文の運用指針（REQ-0101-064/065/066 の実運用・主たる文意の特定方法・否定文の
      境界条件としての併記方法）、長大行の分割基準（1行に複数ルール・長大列挙・複文が混在する
      場合の分割判断）。
      (2) 硬直的固定記述の回避 — 件数・ファイル名を要件に埋め込まず構造要件のみ記述する。
      (3) 術語の平易化 — 未定義術語（「一次所有先」「恒久内容」等）の回避または定義。
      (4) 文書種別責務 — REQ/ADR/SPEC/guide/README の配置基準・各文書種別が担うべき内容の
      判定基準。
      (5) 要件性 — 要件行の合格基準（主語・対象・状態・検証可能性・独立性）。
      (6) 粒度 — 1行1責務の基準。
      (7) 移送判断 — 残す/分割/移送/削除候補の分類基準。
      (8) AI-slop 検出基準 — agentdev-no-ai-slop-writing から統合（10基準・5出力原則・
      11 pre-output review rules）。
      writing-style.md は正本仕様であり、agentdev-doc-writing の参照ファイルは運用ビューに
      過ぎない。参照ファイルと writing-style.md の間で内容の重複が生じる場合、正本は
      writing-style.md とする。

  - id: AG-003
    content: >-
      REQ-0140 を「文書品質ゲート」に改題・拡張する。現状の「文書表記・文意品質ゲート」の範囲
      （表記・文意の自然性・英語抽象語の扱い）から、文書種別責務・要件性・粒度・移送判断を含む
      包括的文書品質ゲートに拡張する。agentdev-no-ai-slop-writing 参照を agentdev-doc-writing
      参照に全面置換する。ゲートを req-save / spec-save で必須とし、不合格時は修正して再
      チェック通過まで繰り返す（QG-1〜QG-4 と同じモデル・ワークフローを停止するのではなく
      品質ループとして機能させる）。agentdev-doc-writing の査読観点は以下の7つとする:
      (1) 文書種別責務 — REQ/ADR/SPEC/guide/README のどこに置くべき内容かを判定する。
      (2) 要件性 — REQ要件行が満たすべき状態・振る舞い・制約として成立しているかを判定する。
      (3) 文意品質 — 主語・対象・状態・検証条件が読み取れるかを判定する。
      (4) 粒度 — 1行1責務になっているかを判定する。
      (5) 移送判断 — 残す/分割/移送/削除候補のいずれかに分類する。
      (6) 修正文案 — 未合意事項を確定せず、修正文案または移送先候補として提示する。
      (7) 既存スキルとの分担 — agentdev-req-analysis（要件分析・動的判断）・
      agentdev-adr-guidelines（ADR要否判定・動的判断）・writing-style.md（表記・文体仕様）と
      責務重複しない。doc-writing は書かれた文書の品質査読（静的レビュー）を担い、
      req-analysis/adr-guidelines は req-define 実行時の判断プロセス（動的判断）を担う。
      agentdev-doc-writing はファイル保存・commit・pushを行わない査読スキルとする。

  - id: AG-004
    content: >-
      REQ-0103-032 の agentdev-no-ai-slop-writing 参照を agentdev-doc-writing 参照に更新する。
      no-ai-slop 由来の基準は writing-style.md に仕様として統合し、agentdev-doc-writing は
      その仕様を実行時に適用する。REQ-0140 UPDATE が同じ変更を担う場合、実作業上の反映先を
      REQ-0140 UPDATE に統合してよい。要件論としては本 draft の範囲に含める。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/writing-style.md
    source_items: [AG-001, AG-002]
    content: |
      docs/specs/writing-style.md を status: draft から status: active に昇格し、
      以下のセクションを追加・拡張する。

      ## 要件行の書き方
      - 1行1関心原則: 1要件行に複数の独立した判断・関心を混入させない。
      - 肯定文主文: 主たる文意を肯定文で記述する（REQ-0101-064）。否定文は肯定文で記述された
        主たる文意に対する境界条件・例外・補足として併記する場合に限り使用する（REQ-0101-065）。
        主たる文意が否定文のみで構成されている要件行は、対応する肯定文へ書き換える
        （REQ-0101-066）。主たる文意とは、当該記述が単独で表現する「満たすべき状態・振る舞い・
        制約」を指す。
      - 長大行の分割基準: 1要件行に複数ルール・長大列挙・複文が混在する場合、1判断につき
        1行に分割する。分類カタログ・値一覧・判定表は SPEC 等に委譲し、REQ行は核心を1文で
        表現する。

      ## 文書種別責務
      - REQ: 満たすべき状態・振る舞い・制約・外部契約を記述する文書種別。
      - ADR: 将来の設計・運用・文書システムを制約する意思決定の記録。
      - SPEC: 現在の実装構成を成立させるスキーマ・ライフサイクル・コマンド構成・ルールカタログ・
        判定表・enum・format・内部パラメータを記述する文書種別。
      - guide: 人間向けナビゲーション層（REQ/ADR/SPEC/DOC-MAP の内容を代替しない）。
      - README: identity・入口表・参照先リンク・最小限のクイックスタート。
      各要件行候補がどの文書種別に属すべきかの判定基準を含む。REQ 要件行が SPEC 相当内容
      （スキーマフィールド・enum値一覧・判定表・ファイルパターン・テンプレート種別・レポート
      形式・テストデータ詳細・個別checkerルール・retry回数・token目安・行数上限・Step番号・
      Phase番号・内部アルゴリズム・作業履歴）のみを主たる文意とする場合、当該内容は SPEC 等へ
      配置する対象とする。ただし公開command名・公開入口・ドメイン状態の位置づけ・他commandとの
      接続契約・安全境界・停止条件の大枠・後続工程が依存する安定した外部契約に該当する場合は
      REQに要約として記述できる（安定契約例外・REQ-0101-069）。

      ## 要件性
      - 要件行の合格基準: 主語（誰が/何が）・対象（何を）・状態（どうあるべきか）・検証可能性
        （どう確認するか）・独立性（他の要件行と混入しないか）の全てを満たすこと。

      ## 粒度
      - 1行1責務の基準: 1要件行は1つの判断・関心・制約を表現する。1行に「定義+配置+参照形式+
        禁止」等の複数関心が混在する場合、関心ごとに分割する。

      ## 移送判断
      - 残す: 現在の文書種別・位置が適切。文章品質の修正のみで対応可能。
      - 分割: 1行に複数関心が混在。関心ごとに別行へ分割。
      - 移送: 別の文書種別（REQ↔SPEC↔ADR↔guide↔skill reference）への移動が必要。
      - 削除候補: 作業記録・移行結果・現状構成の詳細説明・変更履歴等、要件として不要な内容。

      ## 硬直的固定記述の回避
      - 件数（「10ガイド」等）・ファイル名列挙を要件に埋め込まず、構造要件のみ記述する。
      - 件数・ファイル名は SPEC・README・guide 側で管理し、REQ は構造（「README.md（入口）と
        個別ガイドファイルで構成する」等）のみ記述する。

      ## 術語の平易化
      - 未定義術語（「一次所有先」「恒久内容」「導線」等）の使用を避ける。やむを得ず使用する
        場合は初出で定義する。一般的でない専門用語は、文脈に応じた平易な日本語に書き直す。

      ## AI-slop 検出基準（agentdev-no-ai-slop-writing から統合）
      AI-slop 10基準: (1)主語がない (2)結論がない (3)根拠と判断が分離されていない
      (4)抽象的で具体的な操作に落とせない (5)既存の実装・ドキュメント・要件との関連がない
      (6)読者の次動作がない (7)根拠のない推測がある (8)比喩や雰囲気の水増しがある
      (9)ユーザーの同意を前提としていない確認がある (10)もっともらしい一般論で具体的事実を
      置き換えている。
      出力原則5順序: 結論→判断理由→根拠→具体的対応→不明点または残リスク。
      Pre-output review 11ルール: (1)結論を先頭に書く (2)主語を明示する (3)判断と根拠を分離する
      (4)抽象語を条件・操作・判定基準・成果物・責務・失敗条件・参照先に置換する
      (5)根拠なき推測で不明点を埋めない (6)推論は「推論」と明記する (7)不明点は「不明」と明記する
      (8)同じ内容の言い換えを削除する (9)水増し・無条件の同調・不要な結びを削除する
      (10)外部事実・仕様・数値・引用・最新情報には根拠を付ける
      (11)読者が承認・却下・修正指示・実装・レビュー・Issue化・後続調査のいずれかを実行できる
      状態にする。

  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0140.md
    source_items: [AG-001, AG-003]
    content: |
      REQ-0140 を以下の通り改題・拡張する。

      タイトル変更: 「文書表記・文意品質ゲート」→「文書品質ゲート」

      目的変更: agentdev-no-ai-slop-writing への参照を agentdev-doc-writing へ全面置換。
      docs/ 配下の現行文書の文書種別責務・要件性・文意品質・粒度を是正・維持するための
      包括的文書品質ゲートとして位置づける。正本仕様は docs/specs/writing-style.md とし、
      agentdev-doc-writing はその実行入口、references/* は運用ビューとする。

      変更要件行:
      - REQ-0140-001（変更）: agentdev-doc-writingスキルはADR/REQ/SPEC横断の文書品質
        ゲートを含むこと。agentdev-no-ai-slop-writingは廃止し、本スキルがその責務を引き継ぐこと
      - REQ-0140-002（変更）: 文書品質ゲートは docs配下の文書・REQ・ADR・SPEC・guides・
        DOC-MAP・README、およびdocsを生成・編集するcommand/skillの自然言語記述を対象とすること。
        文書種別責務・要件性・文意品質・粒度の査読を含むこと
      - REQ-0140-016（変更）: 文書品質ゲートは req-save / spec-save で必須チェックとする。
        不合格時は修正して再チェック通過まで繰り返す（QG-1〜QG-4と同じモデル）。
        ワークフローを停止するのではなく、品質ループとして機能させること

      新規要件行:
      - REQ-0140-018: agentdev-doc-writing は文書種別責務（REQ/ADR/SPEC/guide/README配置
        判定）の査読を行うこと
      - REQ-0140-019: agentdev-doc-writing は要件性（要件行の合格基準・主語・対象・状態・
        検証可能性・独立性）の査読を行うこと
      - REQ-0140-020: agentdev-doc-writing は粒度（1行1責務）の査読を行うこと
      - REQ-0140-021: agentdev-doc-writing は問題箇所を残す/分割/移送/削除候補に分類し、
        修正文案または移送先候補として提示すること。未合意事項を確定しないこと
      - REQ-0140-022: agentdev-doc-writing はファイル保存・commit・pushを行わない査読
        スキルであること
      - REQ-0140-023: agentdev-doc-writing の正本仕様は docs/specs/writing-style.md とし、
        SKILL.md は実行入口、references/* は運用ビューであること
      - REQ-0140-024: agentdev-doc-writing は agentdev-req-analysis（要件分析・動的判断）・
        agentdev-adr-guidelines（ADR要否判定・動的判断）と責務重複しないこと。
        doc-writing は書かれた文書の品質査読（静的レビュー）を担い、req-analysis/
        adr-guidelines は実行時の判断プロセスを担うこと
      - REQ-0140-025: agentdev-doc-writing は AI-slop 検出基準（10基準・5出力原則・
        11 pre-output review rules）を含むこと（agentdev-no-ai-slop-writing から吸収）

      適用範囲変更: agentdev-no-ai-slop-writing → agentdev-doc-writing。
      forbidden-phrases.md → writing-style.md + rewrite-patterns.md に統合。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0103.md
    source_items: [AG-004]
    content: |
      REQ-0103-032 を以下の通り更新する。

      変更前: agentdev-no-ai-slop-writing は自然言語成果物の最終生成・レビュー段階で
      参照することを基本とし、command 実行時に常時読ませないこと

      変更後: agentdev-doc-writing は自然言語成果物およびREQ/ADR/SPEC文書の最終生成・
      レビュー段階で参照することを基本とし、command 実行時に常時読ませないこと。
      正本仕様は docs/specs/writing-style.md とし、agentdev-doc-writing はその実行入口
      であること

conflict_resolutions:
  - id: CR-001
    conflict: >-
      agentdev-no-ai-slop-writing の資産（AI-slop 10基準・5出力原則・11 pre-output review
      rules・forbidden-phrases.md 250行）の移行先が未確定。新スキルの趣旨（文書品質査読）と
      AI-slop検出（コンテンツ品質）は別の関心か。
    resolution: >-
      全吸収。agentdev-doc-writing が AI-slop検出 + 文書品質査読の総合スキルとなる。
      ai-slop-detection.md と rewrite-patterns.md は検出観点として独立性が高く用途が異なる
      ため別参照ファイルとする。
  - id: CR-002
    conflict: >-
      agentdev-doc-writing と agentdev-req-analysis / agentdev-adr-guidelines の責務境界が
      重複する可能性。req-analysis は REQ/SPEC境界判定を、doc-writing は文書種別責務を担う。
    resolution: >-
      doc-writing = 静的査読（書かれた文書の品質検査）、req-analysis / adr-guidelines =
      動的判断（req-define 実行中の判断プロセス）。互补的関係であり重複しない。
  - id: CR-003
    conflict: >-
      REQ-0140 の現タイトル「文書表記・文意品質ゲート」では新スキルの査読観点（文書種別責務・
      要件性・粒度・移送判断）の範囲をカバーできない。
    resolution: REQ-0140 を「文書品質ゲート」に改題・拡張する。
  - id: CR-004
    conflict: 文書品質ゲートの執行方式（付帯 vs 必須 vs 機械的強制）。
    resolution: >-
      req-save / spec-save で必須チェック。不合格は修正して再チェック（QG-1〜4と同じモデル）。
      ワークフロー停止ではなく品質ループとして機能させる。
  - id: CR-005
    conflict: >-
      agentdev-doc-writing/references/* の位置づけ。正本仕様として writing-style.md と
      並列するか、運用ビューか。
    resolution: >-
      正本仕様は docs/specs/writing-style.md。references/* は writing-style.md を適用する
      ための運用ビュー（圧縮ビュー・チェックリスト・出力形式）。重複時の正本は writing-style.md。
  - id: CR-006
    conflict: >-
      docs/specs/writing-style.md が DRAFT 状態で agentdev-doc-writing の根拠仕様が不安定。
      SPEC と skill は不可分か。
    resolution: >-
      本 draft に writing-style.md の確定・拡張を含める。SPEC と skill は不可分。
      writing-style.md を DRAFT から確定に昇格し、正本仕様として拡張する。
  - id: CR-007
    conflict: REQ-0103-032 の agentdev-no-ai-slop-writing 参照を残すと不整合。
    resolution: >-
      本 draft に含める。agentdev-doc-writing 参照に更新。REQ-0140 UPDATE に統合可能。
  - id: CR-008
    conflict: >-
      ADR判断要件。スキル新設・廃止・SPEC拡張・REQ拡張がアーキテクチャ意思決定に該当するか。
    resolution: >-
      ADR不要。スキル新設・廃止・SPEC拡張・REQ拡張は artifact management および文書管理の
      範囲であり、将来の設計・運用・文書システムを制約する意思決定（REQ-0101-008）には
      該当しない。スキルの査読基準は運用ガイドラインであり、アーキテクチャ決定ではない。

operation_units:
  - ou_id: OU-001
    target_spec: docs/specs/writing-style.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-0140
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_req: REQ-0103
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - "Wave 1: writing-style.md 確定・拡張（SPEC）→ spec-save。次に REQ-0140 改題・拡張 + REQ-0103 参照更新 → req-save"
    - "Wave 2: agentdev-doc-writing スキル実装（SKILL.md + 7参照ファイル作成）+ agentdev-no-ai-slop-writing 廃止 + 4スキル See Also 更新 → case-run"
    - "Wave 1 と Wave 2 は順序依存（スキル実装は SPEC + REQ 確定後）。単一 Issue または 2 Issue 分割が可能"
```

# summary

本 draft は agentdev-doc-writing スキル新設・agentdev-no-ai-slop-writing 廃止・writing-style.md 確定拡張・REQ-0140/0103 更新を定義する。

**スコープ内**: スキル定義（SKILL.md + 7参照ファイル）、正本SPEC（writing-style.md）の確定・拡張、REQ-0140 改題・拡張、REQ-0103-032 参照更新、ゲート必須化（req-save/spec-save・修正ループモデル）。

**スコープ外**: REQ-0101 の個別文言修正、全ADR/REQ/SPECファイルの一括書記述是正、既存ADR/REQ/SPECの移送・削除・分割の実施、実装作業（file保存・commit・push・Issue作成・PR作成）。

**実装対象ファイル**（case-open/case-run が扱う）:
- 新規: `src/opencode/skills/agentdev-doc-writing/SKILL.md` + `references/` 7ファイル
- 削除: `src/opencode/skills/agentdev-no-ai-slop-writing/` 全体
- 更新: 4スキルの See Also（adr-file-manager, workflow-templates, skill-authoring, req-file-manager）

**OU構造**: OU-001（writing-style.md spec-update）→ OU-002（REQ-0140 update）→ OU-003（REQ-0103 update）。スキル実装は OU-002 の要件を満たす case-run 作業。
