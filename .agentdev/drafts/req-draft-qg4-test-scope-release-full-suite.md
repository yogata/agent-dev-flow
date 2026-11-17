---
draft_type: req_draft
topic_slug: qg4-test-scope-release-full-suite
status: draft
created_at: "2026-11-17T10:49:55+09:00"
source_rus:
  - RU-20261117-01
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  通常案件では変更内容・依存関係・リスク・受け入れ条件と正規の検証義務から必要な試験を選択して実行し、
  QG-4 の最終受け入れをリポジトリ全体の試験の一律実行ではなく検証義務の履行確認と要求範囲の成立証明で判定する。
  試験範囲を安全に限定できない場合と利用者・正規契約の明示要求時はリポジトリ全体の試験を維持する。
  検証専用案件（verify-only closure）は変更がないことのみを理由とする無条件強制をやめ、正規契約から導出した必要な検証に変更する。
  正式リリースでは、リリース対象コミット自体でのリポジトリ全体の試験の実行・受理証拠を新しい正式版タグの作成より前に確認する。
  試験影響範囲の判定は新しい品質ゲート・恒久台帳を追加せず既存機構（REQ-019/REQ-054）の適用拡大として後続工程の設計で確定する。

major_change_notification:
  notified_before_save: true
  notified_at: "2026-11-17T10:40:00+09:00"
  summary: |
    既存正規成果物（REQ-032、REQ-031、REQ-114、v4-quality-gate-model Design、case-close/case-run Design、
    agentdev-quality-gates Design、agentdev-workflow-backlog-auto Design）への重要変更として、変更理由、
    変更内容、想定される影響、確定事項（Decision 不要判断、用語区分、判定機構の後続工程委譲）、
    未確認事項なしをドラフト保存前に利用者へ通知した。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      通常案件の試験選択。case-close の最終検証は、当該 Case の変更内容、依存関係、リスク、受け入れ条件および正規契約から導出される検証義務から、必要な試験・検査の範囲を決定して実行する。変更ファイルに直接対応する試験に加え、影響を受ける関連機能および共通基盤の試験を評価対象に含める。試験範囲を安全に限定する根拠が不足する場合はリポジトリ全体の試験を正規の方法で実行し、対象の一部だけを検査して要求範囲全体の成立を主張しない。利用者または正規契約がリポジトリ全体の試験を明示要求する場合はその要求を維持する。試験以外の必須検査（integrity checker 群・3検査・textlint 等）および実際の利用経路による検証は、試験範囲の縮小によって省略しない。execution contract または test strategy で確定・合意済みの検証方法を、本選択の判断だけでは縮小しない（REQ-032-037 の降格禁止を維持）。選択根拠および除外根拠の記録は完了条件照合（REQ-032-031/033/034）の対象とし、試験範囲の判定は REQ-096 の判断アーキテクチャ（判断方法・確定権限・人間判断境界）に従う。
  - id: AG-002
    content: |
      QG-4 の最終受け入れ。QG-4 は正規契約から検証義務を独立に導出・照合する責務を維持する。リポジトリ全体の試験の一律実行を完了条件とせず、必要な試験・検査が実施され、要求範囲の成立が証拠から証明されたことを判定する。検証の独立性、証拠の鮮度、変更後の再検証義務を維持する。既知欠陥の由来分類と既存の受理規則は変更せず、未分類の失敗および証拠不足を合格としない。検証義務がリポジトリ全体の試験を要求する対象では full integrity suite の受入れ基準（機械受理基準・bun test 正規形）を維持する。QG-4 検査規則自体の定義は agentdev-quality-gates の所有に維持する（REQ-032 の完了判定行動と QG-4 検査規則の定義の所有分担を維持）。
  - id: AG-003
    content: |
      検証専用案件（verify-only closure）の試験実行。変更を伴わない検証専用案件でも必要な検証が成立する。変更がないという理由だけでリポジトリ全体の試験を無条件に強制せず、正規契約から導出した検証義務に基づく必要な検証を実行する。必要な検証が未実施なら完了しない。実行する検証と実行しない検証の範囲およびその根拠を SSoT コメント（Issue コメント）へ記録する（REQ-032-027 の SSoT コメント参照判定と整合）。
  - id: AG-004
    content: |
      正式リリース前の全試験。ADF が管理する正式リリース工程では、リリース対象として確定したコミット自体（一式の全マージ完遂時点の main HEAD 確定後）について、リポジトリ全体の試験が正規の方法で実行され、既存の受理基準を満たした証拠を、新しい正式版タグの作成より前に確認する。squash merge 前の branch HEAD で実行した close 時点の証拠は、リリース対象コミットの全試験の証拠として単独では採用しない。証拠不足、不合格、実行不能の場合はタグ作成とリリース完了を認めない。タグ作成までの間に対象コミットまたは検証条件が変わり証拠の有効性が失われた場合は、必要な再検証を行う。リリース対象とは異なる案件分岐の試験結果だけを、リリース対象コミットの全試験の証拠として扱わない。TS-005 の「対象コミット不一致」判定はこのコミット同一性基準と一貫させる。
  - id: AG-005
    content: |
      試験影響範囲の判定の実現方針。コード変更・依存関係に連動した実行試験範囲の特定、および判定できない場合の境界（リポジトリ全体の試験へのフォールバック）は、新しい品質ゲートや恒久台帳を追加せず、REQ-019（テスト影響範囲検出 gate）と REQ-054（変更誘発境界リスク分析）の既存機構の適用拡大として、後続工程（case-open/case-run）の設計で確定する。判定は REQ-096/DEC-048 の判断アーキテクチャに従い、判定結果（選択根拠・除外根拠）の記録は TS-001 の合格条件として QG-4/完了条件で照合される。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-032-047 | case-close の最終検証は、当該 Case の変更内容、依存関係、リスク、受け入れ条件および正規契約から導出される検証義務から、必要な試験・検査の範囲を決定して実行すること。変更ファイルに直接対応する試験に加え、影響を受ける関連機能および共通基盤の試験を評価対象に含めること。試験範囲を安全に限定する根拠が不足する場合、および利用者または正規契約がリポジトリ全体の試験を明示要求する場合は、リポジトリ全体の試験を正規の方法で実行すること。対象の一部だけを検査して要求範囲全体の成立を主張しないこと。試験以外の必須検査および実際の利用経路による検証を、試験範囲の縮小によって省略しないこと。execution contract または test strategy で確定・合意済みの検証方法を、本選択の判断だけでは縮小しないこと（REQ-032-037 の降格禁止を維持）。試験範囲の選択根拠および除外根拠の記録は完了条件照合（REQ-032-031、REQ-032-033、REQ-032-034）の対象とし、試験範囲の判定は REQ-096 の判断アーキテクチャに従うこと |
      | REQ-032-048 | case-close は QG-4 の最終受け入れの完了判定として、正規契約から導出した検証義務に対して必要な試験・検査が実施され、要求範囲の成立が証拠から証明されたことを判定すること。リポジトリ全体の試験の一律実行を完了条件としないこと。検証の独立性、証拠の鮮度、変更後の再検証義務、既知欠陥の由来分類および既存の受理規則は維持し、未分類の失敗および証拠不足を合格としないこと。QG-4 検査規則自体の定義は agentdev-quality-gates の所有に維持すること |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-031.md
    target_area: REQ-031-028
    source_items: [AG-003]
    content: |
      | REQ-031-028 | case-run は verify-only closure（PR も carrier commit も存在しない Issue 完了）において、配布依存境界・IR-055・traceability の3検査と、正規契約から導出した検証義務に基づく必要な検証（通常 case と同等の水準。base 既知違反と新規違反の分離突合、新規違反 0 件確認、件数突合を含む）を実行し、再実行可能な形式（実行 cwd と実行形態を含む実行コマンド列）と結果を SSoT コメント（Issue コメント）として記録すること。実行する検証と実行しない検証の範囲およびその根拠を SSoT コメントへ記録すること（REQ-032-027 の SSoT コメント参照判定と整合）。変更が存在しないことのみを理由に必要な検証を省略しないこと。検証完了のために carrier commit を作成しないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-114.md
    source_items: [AG-004]
    content: |
      | REQ-114-018 | 正式リリースでは、リリース対象として確定したコミット自体（一式の全マージ完遂時点の main HEAD 確定後）について、リポジトリ全体の試験が正規の方法で実行され、既存の受理基準を満たした証拠を、新しい正式版タグの作成より前に確認すること。squash merge 前の branch HEAD で実行した close 時点の証拠は、リリース対象コミットの全試験の証拠として単独では採用しないこと。証拠不足、不合格、実行不能の場合はタグ作成とリリース完了を認めないこと。タグ作成までの間に対象コミットまたは検証条件が変わり証拠の有効性が失われた場合は、必要な再検証を行うこと。リリース対象とは異なる案件分岐の試験結果だけを、リリース対象コミットの全試験の証拠として扱わないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/quality/v4-quality-gate-model.md
    target_area: "### 再導出結果（lifecycle 級 semantic Gate 群）"
    source_items: [AG-001, AG-002]
    content: |
      ### 再導出結果（lifecycle 級 semantic Gate 群）

      | Gate | 対象遷移（v4LSM deterministic gate predicate 接続点） | Verification Obligation | Verifier | Evidence（種別・保存契約） | 判定値 |
      |---|---|---|---|---|---|
      | QG-1（Definition Integrity） | Definition 保存完了時（draft 保存・設計PR化前） | Definition（要件doc・Definition Package）が構造完全性・frontmatter 妥当性・未確定内容抑止を満たす | semantic（機械的検査を部分的に内包） | 検査ログ・draft 検証記録（機械的証拠・推論証拠） | pass / warn で継続可 |
      | QG-2（Acceptance Coverage） | ready 遷移時の execution structure 確定（Epic・子 Issue 構成） | 完了条件・acceptance criteria が対象要件行を網羅し参照整合が取れている | semantic | Issue 本文・チェックボックス投影・構成対応表（構造的証拠） | pass / warn で継続可 |
      | QG-3（Implementation Deviation） | running への PR 化前 | 実装差分が Issue scope を逸脱していない（no-deviation / impl-bug / spec-bug / scope-creep の分類） | semantic（機械的検査を部分的に内包） | PR 本文・乖離分類記録・検査ログ（機械的証拠・推論証拠） | fail は PR 化不可 |
      | QG-4（Final Acceptance） | closing 前（子 Issue・Epic・Root Case の close 前） | test strategy 3 要素完全性・リスクから test strategy への投影完全性・正規契約から導出した検証義務の履行確認（検証義務がリポジトリ全体の試験を要求する対象では full integrity suite 受入れ。試験範囲の選択は REQ-032-047 が所有）・traceability check 前提手順・verify-only 証拠ソース | deterministic + semantic | QG-4 結果コメント・suite 実行ログ・SSoT コメント（機械的証拠） | pass / warn のみ close 可 |
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_area: "### full integrity suite 実行と tmp 残存確認"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ### 最終検証の実行（検証義務に基づく試験範囲選択）と tmp 残存確認

      - 最終検証の試験範囲選択（QG-4 合格基準。REQ-032-047）: 当該 Case の変更内容、依存関係、リスク、受け入れ条件および正規契約から導出される検証義務から、必要な試験・検査の範囲を決定して実行する。変更ファイルに直接対応する試験に加え、影響を受ける関連機能および共通基盤の試験を評価対象に含める。試験範囲を安全に限定する根拠が不足する場合、および利用者または正規契約がリポジトリ全体の試験を明示要求する場合は、リポジトリ全体の試験を正規の方法で実行する。execution contract または test strategy で確定・合意済みの検証方法を選択の判断だけでは縮小しない（REQ-032-037 の降格禁止を維持）。試験範囲の選択根拠および除外根拠の記録は完了条件照合（REQ-032-031/033/034）の対象とし、試験範囲の判定は REQ-096 の判断アーキテクチャに従う
      - リポジトリ全体の試験を実行する場合の bun test 実行形態: 3 cwd 分割正規形に従う（① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テストの3分割。各実行の cwd はリポジトリルートに統一、`./` prefix 付きの対象ディレクトリ明示指定、分割② 前の依存パッケージ前置、N/M 件数突合、固定値の期待値化なし、カレントディレクトリトリビアな実行の禁止）。実行形態契約の正は agentdev-quality-gates Design「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」と同スキル references/qg-4-final-acceptance.md が所有する
      - 配布物変更を含む case の3検査結果確認: case-close の最終 gate で配布物変更を含む case を検証する場合、配布依存境界・IR-055・traceability の3検査の実行結果（case-run での commit 前実行記録）を確認する。case-run で3検査が実行されていない配布物変更を検出した場合は、検査を実行して新規違反 0 件を確認してからマージに進む。base 既知違反と新規違反の分離突合を省略せず、baseline 既知違反の無断削除・隠蔽を受け入れない
      - tmp 残存確認: 単一 Issue ルートの正常終了を前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことをクリーンアップ工程で確認する。Epic Wave ルートでは、当該 Wave スコープの一時成果物（draft、RU、検出事項等の未消化ドメイン状態）の残留と `.agentdev/tmp/` 一時ファイルの残存がないことを確認し、残留時は当該 Wave を完了扱いにしない
      - 一時資材の後片付けの評価: 完了判定工程は、当該 Case 実行に伴う一時資材の後片付けの成立を、実行担当が作業記録経路へ返した実施結果、確認根拠、未処理事項と提示された証拠に基づいて評価する。評価範囲は一時資材の共通取扱い契約（REQ-118）と実行契約に反映された条件から導出し（REQ-032-043）、実行したという申告だけを成立根拠にせず、確認可能な具体的な資材については提示された証拠が回収または引継ぎを実際に立証しているかを評価する。必須の後片付けが未完了・確認不能である場合、既知の残存、回収失敗、証拠不足、引継ぎ不成立を検出した場合は完了扱いとせず、検証の成功と後片付けの未達を区別して報告する（REQ-032-044）。ただし ADF が管理・観測していない任意の資材の不存在を機械的に完全証明することを終了の条件にしない。remote 上の対象の不存在判定は HTTP 404 単独で行わず、認証・可視性・対象 ID を確認しても判断できない場合は終了を拒否する（REQ-032-045）

      #### 保存済み検証証跡の解析と再実行条件の適用

      - 検証結果の件数、失敗明細、サマリーの表示変更は、保存済み証跡（退避ファイル、PR 本文検証差分セクション、SSoT コメント）から行う。同一情報の取得だけを目的とした full suite や checker の再実行をしない（REQ-007-014）
      - 再実行の正当理由（変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落）と証跡の必須要素の正は agentdev-quality-gates Design「QG-4 検証証拠の再利用と再実行条件」が所有し、本 Design は再規定しない
      - close の最終検証（正規契約から導出した検証義務に基づき選択された必要な試験・検査、配布物変更を含む case の3検査結果確認、QG-4 checker 実測）は origin/main 取り込み済み・マージ直前の branch HEAD で実行する既存契約を維持し、case-run の保存結果だけによる省略を行わない。省略を行わない対象は選択された必要検証範囲の実行義務であり、検証義務がリポジトリ全体の試験を要求する case ではリポジトリ全体の試験の実行義務である。verify-only closure の SSoT コメント参照判定も維持する
      - textlint 共通基盤によるファイル単位結果の再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、close の最終検査の実行義務の省略を構成しない。close の最終検査は対象全件の列挙・全文取得と現在入力との照合を伴う検査基盤の実行を毎回行い、その内部で同一性が機械検証できた対象の規則実行省略が許容される

      #### traceability の門の対象 REQ 行 0 件案件の正規経路と前提の検証順序（REQ-030-032）

      traceability の門の、対象 REQ 行が0件の案件の正規の経路と、前提の検証の順序を Design へ反映する。

      - 対象 REQ 行が0件の案件の case-close 機械工程における正規の経路は、全体の実行と main の baseline との対照による悪化 0 件の機械証明とする（2026-11-16 の Case #4113 で手で書いた wrapper と同等の役割を正規の実装として提供し、手で書く wrapper を不要にする）。既知の欠落は main の baseline と識別子の集合で完全一致するかぎり不合格の原因にしない。新規の違反を検出する力は維持する（正例・反例の双方で確認する）
      - 機械工程の各 phase で、案件の構成と入力の前提の検証を実行する検証の起動より先に実行し、前提が満たされない失敗が早い段階で確定する順序にする。実行する検査の総数は減らさない（検査の省略ではなく、失敗を検出する順序の是正）

      #### verify-only closure の QG-4 達成判定（SSoT コメント参照）

      verify-only closure（PR も carrier commit も存在しない Issue 完了）の QG-4 達成判定では、
      case-run が記録した SSoT コメント（Issue コメント）を実行コマンド列・検証結果の
      判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、
      SSoT コメントが検証証跡の恒久記録の正となる。

      - 参照手順: SSoT コメントから (1) 3検査（配布依存境界・IR-055・traceability）の実行記録と
        新規違反 0 件確認、(2) 実行した検証の N/M 件数突合と直前実績比較（検証義務がリポジトリ全体の試験を
        要求する場合は integrity suite 全件）、(3) 実行コマンド列の
        再実行可能性（実行 cwd・実行形態の記載）、(4) 実行する検証と実行しない検証の範囲およびその根拠の記載を確認する
      - 完了抑止: SSoT コメントが存在しない verify-only closure、または SSoT コメントに
        検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない
      - capture 回収の N/A: verify-only closure では PR 本文が存在しないため
        capture 回収（REQ-032-005 の PR 本文入力源）は N/A とする。SSoT コメントを
        capture 入力源として扱わない（SSoT コメントは検証証跡チャネルであり
        capture チャネルではない）
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_area: "#### verify-only closure の検証実行と SSoT コメント記録工程"
    source_items: [AG-003]
    content: |
      #### verify-only closure の検証実行と SSoT コメント記録工程

      verify-only closure（PR も carrier commit も存在しない Issue 完了。検証のみで完了する
      maintenance case を含む）では、変更が存在しないため commit 前3検査の発火条件
      （配布物変更を含む case）が成立しない。この場合でも検証完了の恒久証跡を残すため、
      次のとおり実行する。本工程は case 2769 で確立した運用の明文化であり、
      「検証完了のために carrier commit を作成する」代替案は case 2769 で却下済みの作業仮定に基づき採用しない。

      1. verify-only closure の判定: execution contract で検証のみと事前確定された case、
         または実行の結果変更不要が確定した case のいずれかを正規の判定点とする。
         判定根拠を Issue コメント（SSoT コメント）に残す
      2. 3検査の実行: 配布依存境界検査（check_distribution_boundary.ts）、IR-055 検査
         （runtime-unresolved-reference）、traceability 検査（宣言整合）を通常 case と同一の手順・
         同一の水準（base 既知違反と新規違反の分離突合、新規違反 0 件確認）で実行する。
         checker コマンドの実行経路と stdout 退避形式は checker 実行契約
         （安定実行経路: モジュール import 経由、spawnSync による status/stdout 分離取得、
         fs.writeFileSync の UTF-8 明示書き出し）に従う
      3. 必要な検証の実行: 正規契約（execution contract の test strategy 等）から導出した検証義務に基づく
         必要な検証を実行する。検証義務がリポジトリ全体の試験を要求する場合、または試験範囲を安全に
         限定できない場合は full integrity suite（bun test 全件）を実行し、
         「Ran N tests across M files」の N/M 件数突合と直前実績との件数急減なし確認を行う
         （case-close 最終検証の合格基準と同水準）。変更が存在しないことのみを理由に必要な検証を省略しない
      4. SSoT コメントへの記録: 実行コマンド列（実行 cwd、実行形態を含み、そのまま再実行手順として
         機能する形式）と結果（3検査の new_delta 0・新規違反 0 件、実行した検証の pass/fail 件数）、
         および実行する検証と実行しない検証の範囲とその根拠を Issue コメントに記録する。
         verify-only closure では PR が存在しないため
         PR 本文を記録先に使わない
      5. チャネル分離: SSoT コメントは検証証跡チャネルであり、capture（intake/learning 候補）
         チャネルではない。REQ-031-014 の capture 引き継ぎ経路（PR 本文限定）は変更しない。
         検証中に発見した本筋外の検出事項は既存の intake 起票経路で扱う
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-quality-gates.md
    target_area: "## full integrity suite 合格基準（QG-4）における bun test 実行形態契約"
    source_items: [AG-001, AG-002]
    content: |
      ## full integrity suite 合格基準（QG-4）における bun test 実行形態契約

      検証義務がリポジトリ全体の試験を要求する対象（試験範囲を安全に限定できない案件、利用者または正規契約による明示要求、正式リリースのリリース対象コミット）における QG-4 の full integrity suite 実行における bun test の実行形態は、3 cwd 分割正規形とする。
      正規形の詳細定義は `agentdev-quality-gates` スキルの references/qg-4-final-acceptance.md「bun test フル suite 正規形（実行形態契約）」が所有し、本 Design は品質統制側の契約を所有する:

      - ① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テスト（plugins・発行系等）の3分割実行とし、各実行の cwd はリポジトリルート（worktree root または main root）に統一する
      - 実行手順には `./` prefix 付きの対象ディレクトリ明示指定を必須ステップとする
      - 分割② の実行前に、`bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` による依存パッケージ前置を行う（node_modules は gitignore 対象のため worktree へ未伝播）
      - 実行結果の「Ran N tests across M files」の N/M 件数突合を必須ステップとする。直前実績と比較して件数が急減していないかの妥当性を検証する（固定値の期待値化は行わない）
      - cwd 依存テストが混在するスイートは、カレントディレクトリトリビアな実行（`bun test` 単体等）で代替しない運用注記を付す
      - QG-4 の適用正規形は tools/plugins テストを含む完全形である（B拡張）。plugins・発行系等の repo ルート直下テスト（分割③）を full suite の受理対象から除外しない

      QG-4 機械受理基準: フル suite の受理判断は、次の受理由件の記録が PR 本文に機械的に検証可能な形で存在することを満たす場合のみ pass とする。受理由件は記録の存在と形式で判定し、判定者による内容の裁量判断を含まない:

      1. 正規形実行の記録: 3 cwd 分割それぞれの起動コマンド（`./` prefix 付き、cwd はリポジトリルート）の実行記録
      2. 環境ラベルの記録: 実行環境、junction 伝播状態、依存パッケージ状態の3要素
      3. 件数突合の記録: 各分割実行の「Ran N tests across M files」件数
      4. fail 全件の由来分類: fail が 0 件、または全 fail に由来分類（既知欠陥、環境依存、当該変更起因）が付与され、由来不明が 0 件
      5. baseline 基準の明示: 由来判定が remediation 開始前の baseline commit 基準で行われたこと

      integrity suite のコマンド数期待値は、公開コマンド列挙からの導出（動的化）により実コマンド数と整合させ、固定期待値による恒常 fail を発生させない。期待値の導出には最小件数下限の検証を併設し、漏れ検出の意味を損なわない。期待値の導出手段の実装は integrity suite 側の責務である。

      QG-4 の識別子中心評価の構造は維持する（固定値期待値化による脆化を行わない）。
      case-close / docs-check の full suite 実行手順と PR 本文テンプレート（Test Strategy 結果欄）への記録欄追加は case 実施側の適用とする。

      QG-4 final acceptance の変更ファイル突合検証における I/O 操作の表記契約は、Custom Tool `agentdev_gh` 操作契約（pr_changed_files 経由の取得）に準拠する。生 gh CLI コマンド表記は配布 reference（references/qg-4-final-acceptance.md）にのみ現存し得るため、当該表記の置換は配布側 realization で実施し、本 Design は表記契約の確認として対応する。検証内容（PR 変更ファイルの取得と files_checked / Issue 本文との突合）は現行どおり維持する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-quality-gates.md
    target_area: "## QG-4 検証証拠の再利用と再実行条件"
    source_items: [AG-001, AG-002]
    content: |
      ## QG-4 検証証拠の再利用と再実行条件

      検証・検査の実行と、その結果の表示・解析を分離する。実行手順の正規形は `agentdev-quality-gates` スキルの references/qg-4-final-acceptance.md が所有し、本 Design は品質統制側の契約を所有する（REQ-007-014/015）。

      - 検証証跡は標準出力、標準エラー、終了コード、版、検査範囲、実行環境を保持する。保持先は既存の証跡チャネル（退避ファイル、PR 本文検証差分セクション、SSoT コメント）とし、新しい証跡基盤を追加しない
      - 件数、失敗明細、サマリーの表示変更は保存済み証跡から行い、同一情報の取得だけを目的としたテスト・検査の再実行をしない
      - 再実行は正当理由に該当する場合のみ実行する。正当理由は変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落とする
      - 保存出力の欠落、切断、タイムアウト、検査範囲欠落は完全な合格証拠として扱わない。既存の timeout 打ち切り扱い（fail 証跡としない）、件数突合、PowerShell コンソール表示を証跡扱いしない規律を維持する
      - QG-4 機械受理基準の記録対象に終了コード、版、検査範囲を追加する
      - 必須の版境界における再検証、close の最終検証（origin/main 取り込み済み・マージ直前の branch HEAD での実行）、QG-4 独立再検査、選択された検証範囲の実行義務の省略禁止、および検証義務がリポジトリ全体の試験を要求する対象における full suite 実行の省略禁止は維持する。同一版でも必要な再現確認・独立検査を拒否しない。裸の bun test 一発（対象ディレクトリを明示指定しない単体実行）で正規の全体網羅検証を代替しない
      - textlint 共通基盤のファイル単位結果再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、本節の検証証跡の再利用・再実行条件と区別する。QG-4 の必須独立再検査・close の最終検査の実行義務を緩和せず、工程証跡としての再実行条件は本節が所有する
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_area: "### リリース手順シーケンスと再開経路"
    source_items: [AG-004]
    content: |
      ### リリース手順シーケンスと再開経路

      - リリース時点の正式タグ再確認、版番導出、対象コミット確定（一式の全マージ完遂時点の main HEAD）と無関係コミット混入検知（開始コミット..対象コミットの差分と一式分実変更の突合）、リリース対象コミットでのリポジトリ全体の試験の実行と受理証拠の確認（REQ-114-018）、タグ作成、（採用方式があれば）追加公開物（草稿作成・読み戻し、承認済みの場合は公開まで）、結果記録の順
      - リリース前全試験確認（REQ-114-018）: リリース対象として確定したコミット自体について、リポジトリ全体の試験を正規の方法（full integrity suite 正規形）で実行し、既存の受理基準を満たした証拠を確認する。squash merge 前の branch HEAD で実行した close 時点の証拠は単独では採用しない。証拠不足、不合格、実行不能の場合はタグ作成を行わず「完遂済み・リリース保留（理由記録）」として報告する。タグ作成までの間に対象コミットまたは検証条件が変わり証拠の有効性が失われた場合は必要な再検証を行う。実行形態契約の正は agentdev-quality-gates Design「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」が所有する
      - 統制必要性説明（REQ-103-018）: 本確認の拒否経路（証拠不足・不合格・実行不能時のタグ作成拒否）は fail-closed 統制に該当する。必要性: 通常案件の試験範囲選択化（REQ-032-047）によって個別案件の close でリポジトリ全体の試験が実行されなくなるため、リリース対象コミットでの全試験実行と証拠確認が品質保証の定常保証点となる。当該手順の正である本 Design にこの説明を記録し、fail-closed 種別の必要性の定義は v4-quality-gate-model Design「統制種別と必要性」節（REQ-103-018 の正規節）に従う（参照関係。正規節側への個別列挙は行わない）
      - 各段階の中断・失敗時は既存結果の読み戻しにより未完了段階から再開する（タグ不移動・再作成なし・第二番号なし）
      - backlog-auto 再実行は set-state から完遂済み Case を検出し全体完了判定以降から再開する
      - 停止報告には case-auto 単独の再開入口（REQ-034-038）に加えて一式再開経路（backlog-auto 再実行）を併記する
      - リリース記録対応（REQ-114-016、REQ-114-017）: タグをリモートへ送った後、版タグ（正式 SemVer タグと RC タグ。非 SemVer ベースラインタグは除外）をすべて列挙し、対応する Release の有無を Custom Tool の Release 読取で確認する。対応する Release のない版タグへ草稿を作る（RC 版タグは prerelease 有効）。既存の Release は対象外とし本文・公開状態を変更しない。作成後、GitHub から読み戻して版タグと Release の対応（同名 Release の存在、draft・prerelease 状態）を確認する。公開権限 HITL で利用者が公開を承認した場合、承認根拠（HITL 質問 ID・回答記録参照）を伴って release_publish を呼び、draft=false・published_at の読戻し確認までを workflow 実行として完了する。公開の実行形態（workflow 実行、代行、利用者手動）を set-state のリリース状態に区別して記録する。未承認の場合は対象 Release が draft 状態で維持されていることを確認するまで Release 工程を完了としない
      - 公開完了検証の条件化: Release 記録工程の完了検証は set-state の公開記録を判定鍵とする。未承認の場合は対象 Release が draft 状態で維持されていることを確認し、承認済み（workflow 実行）の場合は公開完了（draft=false・published_at の読戻し）を確認し、代行・利用者手動の場合は記録と実状態の一致を確認する。未承認であるのに公開済み状態を検出した場合は不整合として完了とせず報告する。公開成功後に読戻し・記録が失敗・中断した場合の再開では、読戻しにより already-published（draft=false）を検出したときは重複実行せず記録完了として扱う（タグ不移動・第二の版番号消費なし）
      - リリース記録の異常系: 草稿作成の失敗時、および読み戻しで同名 Release が2件検出された場合は、既存を削除せず報告して停止する（利用者判断）。リモートに存在しない既存の版タグは、注釈付きタグを通常の push（非 force）で送り、リモートとローカルのタグ識別子一致を確認してから草稿を作る。push の拒否（リモートに同名タグが異なるオブジェクトで存在する場合等）は失敗として報告し、force による解消を行わない
      - リリース記録の重複作成防止: 草稿作成前に存在確認を行い、再開時は既存 Release を検出して作成を省略する

conflict_resolutions:
  - id: CR-001
    conflict: 通常案件での全試験一律実行の廃止が検証義務を弱めるのではないか
    resolution: |
      弱めない。REQ-032-047 は限定根拠不足時・明示要求時の全試験フォールバックと試験以外の必須検査・実際の利用経路検証の省略禁止を定め、REQ-032-048 は検証の独立性・証拠鮮度・再検証義務・既知欠陥由来分類と受理規則の維持を定める。合意済み検証方法の降格禁止（REQ-032-037）も維持する。RU 方針5「検証義務を弱めず、必要な品質保証を維持する」に基づく。
  - id: CR-002
    conflict: 正式リリース前の全試験保証を新規 Decision として記録すべきか（architecture-advisory の境界指摘）
    resolution: |
      Decision は新規作成しない。REQ-114 APPEND（REQ-114-018）で処理する。根拠: (a) DEC-059 がすでに「REQ-114-008〜012 に本規則を拘束条件として適用する」構造を採用しており、REQ-114 層への拘束条件追加は既存構造に合致する、(b) DEC-001/DEC-059 の決定本文は不変（リリース条件の適用規則そのものの変更ではない）、(c) RU が「新しい品質ゲートや恒久台帳の追加は既定としない」と明記。AG-004 の拒否経路（fail-closed）は REQ-103-018 の列挙統制に該当するため、統制必要性説明を backlog-auto Design（stage 7 手順の正）へ同一変更で記録する。v4-quality-gate-model Design「統制種別と必要性」節（正規節）とは参照関係とし、Design 更新時に整合を確認する（adversarial-review A-8 反映）。
  - id: CR-003
    conflict: 「full integrity suite 受入れ」の変更が指す対象の用語区分（bun test 全体か integrity checker 群か）
    resolution: |
      今回変更の対象はリポジトリ全体の試験（bun test 全体、3 cwd 分割の全体）の一律実行である。integrity checker 群・3検査・textlint 等の必須検査は RU の「試験以外の必須検査・実際の利用経路による検証は、試験範囲の縮小によって省略しない」により維持され、試験範囲選択の影響を受けない。REQ-032-047/048 および各 Design 更新でこの区分を明示する。

operation_units:
  - ou_id: OU-0001
    source_ru: RU-20261117-01
    target_req: REQ-032
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-0002
    source_ru: RU-20261117-01
    target_req: REQ-031
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-0003
    source_ru: RU-20261117-01
    target_req: REQ-114
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-0004
    source_ru: RU-20261117-01
    target_design: docs/designs/quality/v4-quality-gate-model.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-0005
    source_ru: RU-20261117-01
    target_design: docs/designs/commands/case-close.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-0006
    source_ru: RU-20261117-01
    target_design: docs/designs/commands/case-run.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-0007
    source_ru: RU-20261117-01
    target_design: docs/designs/skills/agentdev-quality-gates.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-0008
    source_ru: RU-20261117-01
    target_design: docs/designs/skills/agentdev-workflow-backlog-auto.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      試験範囲を選択できる通常案件（docs 変更主体など変更範囲と依存関係を安全に特定できる案件）の Case で、最終検証の実行を確認する。変更対象と関連試験の対応づけ記録、実行対象・結果・除外根拠の記録を確認する。リポジトリ全体の試験の一律実行が完了条件に含まれていないことを確認する。
    pass_criteria: |
      必要な試験が選択・実行され、変更対象と関連試験の対応づけ記録および実行対象・結果・除外根拠が記録されていること。関連試験の欠落または根拠のない除外がないこと。選択根拠・除外根拠の記録が完了条件照合の対象として機能すること。
    on_failure: |
      fix-and-reverify。選択機構・記録機構の不備は実装修正で解決可能なため。
  - id: TS-002
    target_item: AG-001
    verification: |
      試験の影響範囲や依存関係を安全に特定できない案件（共通基盤の変更、依存関係不明、対象抽出失敗の反例）で全試験が選択されることを確認する。不明な範囲を無条件に除外した場合と 0 件実行を誤って成功とした場合の反例で判定を確認する。
    pass_criteria: |
      限定根拠が不足する案件でリポジトリ全体の試験が選択・実行されること。無条件除外や 0 件実行の成功扱いが発生しないこと。
    on_failure: |
      fix-and-reverify。フォールバック判定の不備は実装修正で解決可能なため。
  - id: TS-003
    target_item: AG-002
    verification: |
      QG-4 が正規契約から必要な検証義務を独立に導出・照合し、対象成果物に対する試験・検査の実行証拠と対応を確認することを確認する。必要な証拠の不足、無効化された証拠の流用、未検証範囲の残存を与えた場合の判定を確認する。
    pass_criteria: |
      検証義務の独立導出・照合が機能し、証拠不足・証拠流用・未検証範囲残存を検出した場合に完了を拒否すること。
    on_failure: |
      fix-and-reverify。
  - id: TS-004
    target_item: AG-003
    verification: |
      検証専用案件（verify-only closure）の正常系（必要な検証の実行と SSoT コメントへの結果・実施範囲・省略範囲と根拠の記録）と反例（必要な検証が未実施の場合に完了しないこと）を確認する。
    pass_criteria: |
      変更がないという理由だけで全試験を無条件に強制せず、正規契約から導出した必要な検証が実行され、実施・省略の範囲と根拠が SSoT コメントに記録されること。必要な検証が未実施なら完了しないこと。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-004
    verification: |
      正式リリースで、リリース対象として確定したコミット自体に対するリポジトリ全体の試験の実行・受理証拠が正式版タグの作成前に確認されることを確認する。全試験未実施、対象コミット不一致（コミット同一性基準）、不合格または証拠不足、close 時点証拠（squash merge 前 branch HEAD）の単独採用を与えた場合にタグ作成を拒否することを確認する。
    pass_criteria: |
      リリース対象コミット自体での全試験の実行・受理証拠の確認がタグ作成前に完了すること。全試験未実施、対象コミット不一致、不合格・証拠不足、close 時点証拠の単独採用の場合にタグ作成が拒否されること。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-004
    verification: |
      試験後に対象コミットや検証条件が変わって証拠が無効になった場合の判定を確認する。同一条件で有効な証拠と、変更後に無効となる証拠の双方を与えて判定を確認する。
    pass_criteria: |
      証拠が無効になった場合に無条件に旧証拠を再利用せず、必要な再検証が行われること。同一条件の有効証拠は再利用できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-001
    verification: |
      利用者または正規契約がリポジトリ全体の試験を明示要求する案件で、試験の選択機構による範囲縮小が認められないことを確認する。全試験指定と試験選択の入力を同時に与え、全試験の実施・受理が確認できない場合の判定を確認する。
    pass_criteria: |
      明示要求がある案件で選択機構による範囲縮小が行われず、全試験の実施・受理が確認できない場合に完了が拒否されること。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: agentdev-quality-gates skill 本体の QG-4 規範の適用条件更新
    responsibility: |
      配布物（src/common/skills/agentdev-quality-gates/ の SKILL.md、references/qg-4-final-acceptance.md）において、フル suite 正規形・機械受理基準の適用条件を「検証義務がリポジトリ全体の試験を要求する対象」へ明確化する。観点10 の条件、verify-only 証拠ソースの記述を REQ-031-028 変更後と整合させる。あわせて、試験範囲を選択した case の要求範囲成立証明の記録様式（選択根拠・除外根拠・実行結果）の帰属先を既存の証跡チャネル（PR 本文検証差分セクション、SSoT コメント）として確定し、配布物本文の変更要否を確認する（変更不要の場合はその根拠を記録）。
    ownership_hints:
      - src/common/skills/agentdev-quality-gates/SKILL.md
      - src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      - docs/designs/skills/agentdev-quality-gates.md（Design 側は artifact_actions の ACT-DESIGN-004/005 で更新）
    intent: |
      QG-4 規範の配布側正本を Design 更新（ACT-DESIGN-004/005）と同一意味に保ち、フル suite 正規形の所有権（REQ-060-003）を侵食しない。
    verification_refs: [TS-001, TS-003, TS-007]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: case-close 機械工程の検証義務ベース化
    responsibility: |
      case-close の機械工程スクリプト（full integrity suite の起動と結果集約を含む）を、正規契約から導出した検証義務に基づく必要な試験・検査の実行へ変更する。検証義務がリポジトリ全体の試験を要求する対象では現行のフル suite 起動・機械受理を維持する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/verification-evidence-record.ts
      - src/common/skills/agentdev-workflow-case-close/SKILL.md
    intent: |
      REQ-032-047/048 の完了判定行動を機械工程へ反映し、選択された検証範囲の実行義務の省略禁止を実装する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002]
  - id: RA-003
    concern: case-run verify-only closure の検証実行の変更
    responsibility: |
      case-run の verify-only closure 検証実行を、full integrity suite（bun test 全件）の一律実行から、正規契約から導出した検証義務に基づく必要な検証の実行へ変更する。SSoT コメントへの実施・省略範囲と根拠の記録を含める。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-run/SKILL.md および該当 references
      - docs/designs/commands/case-run.md（Design 側は artifact_actions の ACT-DESIGN-003 で更新）
    intent: |
      REQ-031-028 変更後の実行契約を実装へ反映する。
    verification_refs: [TS-004]
    source_items: [AG-003]
  - id: RA-004
    concern: backlog-auto stage 7 へのリリース前全試験確認の実装
    responsibility: |
      backlog-auto workflow の stage 7（リリース）手順に、リリース対象コミット自体でのリポジトリ全体の試験の実行と受理証拠確認（対象コミット確定後・タグ作成前）を実装する。証拠不足・不合格・実行不能時のリリース保留経路、対象コミット変化時の再検証、証拠の set-state リリース状態への記録を含める。
    ownership_hints:
      - src/common/skills/agentdev-workflow-backlog-auto/SKILL.md
      - src/common/skills/agentdev-workflow-backlog-auto/references/end-to-end-execution.md
      - docs/designs/skills/agentdev-workflow-backlog-auto.md（Design 側は artifact_actions の ACT-DESIGN-006 で更新）
    intent: |
      REQ-114-018 の保証を stage 7 の実行手順へ実装する。
    verification_refs: [TS-005, TS-006]
    source_items: [AG-004]
  - id: RA-005
    concern: 試験影響範囲判定の実装（既存機構の適用拡大）
    responsibility: |
      コード変更・依存関係に連動した実行試験範囲の特定と、判定できない場合の境界（リポジトリ全体の試験へのフォールバック）を、REQ-019（テスト影響範囲検出 gate）と REQ-054（変更誘発境界リスク分析）の既存機構の適用拡大として case-open/case-run の設計で確定・実装する。新しい品質ゲートや恒久台帳は追加しない。判定は REQ-096/DEC-048 の判断アーキテクチャに従い、判定結果の記録は QG-4/完了条件で照合される。
    ownership_hints:
      - docs/designs/integrity/test-impact-detection-gate.md（REQ-019）
      - REQ-054（変更誘発境界リスク分析）
      - case-open/case-run の設計・実装
    intent: |
      RU の「実装前の確認事項」（判定能力と判定不能時の境界の確定）を後続工程の設計・実装として具体化する。
    verification_refs: [TS-001, TS-002, TS-007]
    source_items: [AG-005]

case_open_hints:
  epic_needed: false
  decomposition: |
    変更は REQ 3件（REQ-032 APPEND、REQ-031-028 UPDATE、REQ-114 APPEND）と Design 6セクション更新、実現面 5領域からなる。QG-4 定義変更と各所反映は密接に連関するため、単一 Case（Epic 構成なし）での処理を推奨する。REQ 変更と Design 変更・実現面の適用は同一 PR 内で同時確定が望ましい（recommended_order: REQ→Design）。正式リリース前全試験（REQ-114/OU-0003/OU-0008/RA-004）は QG-4 試験選択（それ以外）と実装ファイルがほぼ独立しており、実行単位の分割候補となる。
  wave_hints: []
```

# summary

RU-20261117-01（QG-4 の試験範囲適正化と正式リリース前の全試験保証）の要件定義として、通常案件の試験範囲選択（REQ-032-047/048 APPEND）、検証専用案件の必要な検証への変更（REQ-031-028 UPDATE）、正式リリース前の全試験保証（REQ-114-018 APPEND）、QG-4 の Verification Obligation と各 Design・実現面の更新を確定した。対論型レビュー（進行可、採用 findings A-1〜A-8 反映済み）、architecture-advisory（Decision 不要、衝突なし）を経て確定している。
