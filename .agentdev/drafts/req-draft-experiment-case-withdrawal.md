---
draft_type: req_draft
topic_slug: experiment-case-withdrawal
status: saved
created_at: 2026-09-05T10:05:00+09:00
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  実証Case・評価ブランチ・Case可変統合先機構を全面撤回し、Case の Git 基準を main に一本化する。
  REQ-042/REQ-043 は既存 retirement 規約で廃止（履歴記録付き）、DEC-018（proposed 未採用）は物理削除（Git 履歴のみ保持）。
  実験・技術検証は ADF Case 外の通常活動とし、ADF は評価ブランチ・評価契約・実証Case状態を所有しない。
  横断的に有効 REQ・Design・配布物（command/skill/template/checker）から当該契約を完全除去し、
  直近の現行手続き Report 6件（実験G1〜G4定義・ランキング・cleanup）は意味単位の書き換えと 2026-09-05 撤回注記を付す。
  DEC-027（観測ベース統制縮小評価ループ）は本文依存ゼロのため不変、REQ-048 の観測・実験・評価能力は維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実証Case・評価ブランチ・Case可変統合先の撤回は、同一の実証ワークフローを成立させるために導入された一連の契約として
      一つの変更単位で扱う。(1) 実証Case概念の撤回 (2) 評価ブランチ機構の撤回 (3) Case統合先一般化の撤回 (4) 通常Case の
      main 基準への一本化 (5) 実証Case由来の横断的な文書・実行物・テンプレート契約の除去 (6) 実験・技術検証を ADF Case 外の
      通常技術活動へ戻すこと。実証Caseのみを撤回して評価ブランチや可変統合先を残す撤回単位は採らない。
  - id: AG-002
    content: |
      実験や技術検証を禁止しない。必要な場合は ADF の専用 Case 種別・状態・評価ブランチ機構としてではなく通常の技術検証として
      実施する。一時 branch / worktree の利用自体は許容するが、ADF は評価ブランチ・実証Case状態・評価契約・実証Case専用
      Issue/PR 形式・専用の中断再開状態・正式化専用ワークフローを所有しない。得られた知見・結果は必要に応じて既存の Report、
      Issue、req-define 等へ入力する。
  - id: AG-003
    content: |
      REQ-042「Case統合先とブランチモデル」と REQ-043「評価ブランチ実証ワークフロー」は有効な REQ から除外し、既存の REQ
      retirement 規約に従って docs/requirements/retired/ へ移動する（先例 REQ-040 形式: frontmatter に status: retired を付与、
      本文冒頭に履歴注記 blockquote として実運用で利用されず全面撤回した事実と後継なしを記録）。
      DEC-018「評価ブランチモデルとCase統合先の一般化」は status: proposed のまま未採用のため現行ツリーから物理削除する
      （numbering-policy が明示許容、履歴は Git 履歴のみで保持、番号欠番は維持し次番号採番に影響させない）。
      非対称性（REQ は retired 保持・DEC-018 は完全削除）の根拠は、REQ は要件 SSoT として撤回理由の追跡が必須であるのに対し、
      未採用 Decision は承認実績を持たないことによる。
  - id: AG-004
    content: |
      新規 Decision は作成しない。削除・廃止そのものを主題とする Decision は作成不可（decision-guidelines）であり、
      main 一本化は既存基盤への復帰として新たな意思決定内容を持たない。将来再導入時の履歴参照は REQ-042/043 の retired
      注記と Git 履歴で担保する。
  - id: AG-005
    content: |
      DEC-027（観測ベース統制縮小評価ループ）のループは維持するが、本文の修正も追記も行わない。DEC-027 の本文には
      実証Case・評価ブランチ・REQ-043・DEC-018 への依存が存在しない（全53行実測確認済み）。定めているのは評価ループ、
      1実験につき主要構造変更1つ、Baseline/Hypothesis/Guardrail/Observation/Decision の識別、実験形式・測定手続きの Design
      所有という原則のみであり、原則レベルの Decision に実行方式（通常技術検証として実施等）を持ち込まない。
  - id: AG-006
    content: |
      責務分界: DEC-027 は原則のため変更しない。REQ-048 は実証Case・評価ブランチへの依存があれば除去し「ADF 専用の実証Case
      機構を必要としない」状態にする（実測: 16要件行内の直接言及ゼロ、目的節 line 10「最小観測・評価契約」の語のみが対象。
      「評価契約」は REQ-043 の専門用語との語衝突のため別表現へ置き換える）。Design / Report は実験の具体的実施方法を
      通常の技術検証として成立する形へ修正する。
  - id: AG-007
    content: |
      直近の現行手続き Report 6件（docs/reports/req-048-experiment-g1〜g4-definition.md、req-048-candidate-ranking.md、
      req-048-dead-responsibility-cleanup.md）は、機械的置換ではなく現行手続きを意味単位で書き換えたうえで、対象 Report
      自身に撤回経緯を短く注記する（注記日付は 2026-09-05）。「後続実証Case」「評価ブランチと評価契約を当該実証Caseの Issue
      で確定する（REQ-043、DEC-018）」等の今後の実行方法を規定する箇所を「通常の技術検証（必要に応じ一時 branch / worktree
      を使用）」へ変更する。過去の測定結果・判断・作成経緯は変更しない。baseline-v2-measurement.md と
      baseline-v2-definition.md は当該語言及が実測ゼロのため対象外とする。
  - id: AG-008
    content: |
      実証Case機能について、将来再利用を目的とした無効コード、条件分岐、互換処理、予約フィールド、テンプレート項目を
      残さない。単に無効化するのではなく現行モデルから存在自体を除去する。
  - id: AG-009
    content: |
      過去 Report、learning、Issue、PR 等に記録された歴史的事実は一律削除しない。ただし現行 REQ、Design、現行 workflow を
      参照し現在も実証Caseを利用すべきであるかのような契約・導線を形成している場合は、その現行依存を除去する。
  - id: AG-010
    content: |
      REQ-042/REQ-043 の retirement、DEC-018 の削除、12成果物（implementation 10 Design + verification 2 checker:
      実測インベントリ参照）の covers 除去、および索引再生成は、req-save / design-save の L1 統合 changeset（同一 push）で
      実行し中間状態の unknown 参照を発生させない。Design 本文の当該セクション削除も同じく L1 design-save で実行する。
      L1 完了後も配布物（src/opencode）や Report 6件の書き換えが残る期間の検査 fail は、REQ-048 再構築 Case で確立した
      既知 fail 分離運用（AG-010 型: 再現比較基準と解消予定の明記）に従って管理する。
  - id: AG-011
    content: |
      変更対象の正は最新 main に対する全文検索インベントリである。req-define 実行時点の実測インベントリ（影響約69ファイル:
      docs 側 35 + src/opencode 32 + .opencode 2、covers 参照12成果物、横断 REQ 参照行、索引自動生成領域 5箇所、手書き索引
      領域 docs/README 49,50,71,93 行・decisions/README Decision Map 3行）を OU-01 で正規 Report として保存し、以降の
      engineering unit は同 Report を正として変更完遂と検証を行う。全文検索の検証語は「実証Case/実証ケース/評価ブランチ/
      評価契約/REQ-042-NNN/REQ-043-NNN/DEC-018」に限定し、「統合先」は評価ブランチ・実証Caseと共起する可変文脈のみを対象と
      する（MERGE 統合先等の無関係文脈 7ファイルは実測により除外）。

artifact_actions:
  - id: ACT-REQ-042
    artifact: req
    operation: update
    target: docs/requirements/REQ-042.md
    result: saved
    source_items: [AG-001, AG-003, AG-011]
    content: |
      RETIRE（廃止）: REQ-042「Case統合先とブランチモデル」を全12要件行ごと廃止する。
      frontmatter に status: retired を付与し、本文冒頭に履歴注記 blockquote を付す:
      「履歴注記（RETIRE、status: retired、2026-09-05）: 本 REQ は実運用で実証Case・評価ブランチが利用されなかったため、
      評価ブランチ・可変統合先モデルとともに全面撤回された。後継の要件はない。Case の Git 基準は main 一本化により
      各工程要件（REQ-030/031/032/034/035）が各自明示する。経緯の詳細は撤回 Case の Issue・PR を参照。」
      docs/requirements/retired/REQ-042.md へ移動する。
  - id: ACT-REQ-043
    artifact: req
    operation: update
    target: docs/requirements/REQ-043.md
    result: saved
    source_items: [AG-001, AG-003, AG-011]
    content: |
      RETIRE（廃止）: REQ-043「評価ブランチ実証ワークフロー」を全30要件行ごと廃止する。
      frontmatter に status: retired を付与し、本文冒頭に履歴注記 blockquote を付す:
      「履歴注記（RETIRE、status: retired、2026-09-05）: 本 REQ は実運用で実証Caseが一度も実行されないまま、評価ブランチ・
      可変統合先モデルとともに全面撤回された。実験・技術検証は ADF Case 外の通常活動として実施され、結果は既存の
      Report・Issue・req-define 入力へ取り込まれる。後継の要件はない。」
      docs/requirements/retired/REQ-043.md へ移動する。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-004-054「実証必要性の推論・提案と評価契約の確定を要件展開工程の一部として実行する。実証Caseと評価契約の
      意味論は評価ブランチ実証ワークフロー要件が正規所有し、本スキルは実行位置と手順を提供する」（line 70 付近）を削除する。
      一般化（調査・検証必要性の扱いへの書き換え）は実施しない。削除行を covers 参照する成果物があれば同一 changeset で
      同期する。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-005-005「実証Case（REQ-043 の定義による）は work_type にかかわらず scale と Issue 構造を選択できる」
      （line 21 付近）から実証Case句を除去する。通常Case の scale・Issue 構造規定は維持する。
  - id: ACT-REQ-017
    artifact: req
    operation: update
    target: docs/requirements/REQ-017.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-017-001（line 30 付近）のうち「実証Caseの場合は評価契約と対象評価ブランチ（REQ-043 所有契約の投影）を
      Issue 本文へ含める」句を削除する。実現面の変更方針（realization_actions）投影の本体規定は維持する。
  - id: ACT-REQ-030
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-030-020（line 37 付近）「統合先ブランチ（REQ-042 の定義による、既定 main）同期確認」を
      「main ブランチ同期確認」へ書き戻す。機能の本体（merge 前の同期確認）は維持する。
  - id: ACT-REQ-031
    artifact: req
    operation: update
    target: docs/requirements/REQ-031.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-031-024（line 41 付近）「worktree 作成元と PR の base は統合先（REQ-042 の定義による、既定 main）を参照する」を
      「worktree 作成元と PR の base は main を参照する」へ書き戻す。worktree・PR base 規定の本体は維持する。
  - id: ACT-REQ-032
    artifact: req
    operation: update
    target: docs/requirements/REQ-032.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: REQ-032-013（line 30 付近）「統合先（REQ-042、既定 main）同期のリスク事前検出」を「main 同期のリスク事前検出」へ
      書き戻す。リスク事前検出の本体は維持する。
  - id: ACT-REQ-034
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    result: saved
    source_items: [AG-001, AG-002, AG-011]
    content: |
      UPDATE: (1) REQ-034-026（line 44 付近）の「統合先（REQ-042 の定義による、既定 main）」を「main」へ書き戻す。
      (2) REQ-034-037〜043（実証Case自走・評価ブランチ・評価契約・正式化導線の7行、line 55〜60 付近）を削除する。
      (3) 対象節（line 65 付近）の「実証Caseの自走（REQ-043 所有契約の消費）」記述を削除する。
      通常Case自走の規定は維持する。削除行を covers 参照する成果物があれば同一 changeset で同期する。
  - id: ACT-REQ-035
    artifact: req
    operation: update
    target: docs/requirements/REQ-035.md
    result: saved
    source_items: [AG-001, AG-011]
    content: |
      UPDATE: (1) REQ-035-009（line 26 付近）の「rebase・同期基準は統合先（REQ-042 の定義による、既定 main）」を
      「rebase・同期基準は main」へ書き戻す。(2) REQ-035-012「Epic実証の評価ブランチ継承」（line 29 付近）を削除する。
      削除行を covers 参照する成果物があれば同一 changeset で同期する。
  - id: ACT-REQ-048
    artifact: req
    operation: update
    target: docs/requirements/REQ-048.md
    result: saved
    source_items: [AG-006]
    content: |
      UPDATE: 目的節（line 10 付近）「必要十分な制御系へ縮小・統合できるための最小観測・評価契約を定める」の「評価契約」は
      REQ-043 の専門用語との語衝突があるため、「最小観測・評価の契約」等の別表現へ置き換える。16要件行
      （REQ-048-001〜016）は実証Case・評価ブランチへの直接言及が実測ゼロのため変更しない。
  - id: ACT-DEC-018
    artifact: decision
    operation: update
    target: docs/decisions/DEC-018.md
    result: saved
    source_items: [AG-003, AG-004]
    content: |
      DELETE（物理削除）: DEC-018「評価ブランチモデルとCase統合先の一般化」を現行ツリーから物理削除する
      （status: proposed・未採用のため。numbering-policy が明示許容、履歴は Git 履歴のみで保持）。
      同時に手書き索引領域を削除する: docs/README.md の DEC-018 記述（49,50,71,93 行付近のうち DEC-018 関係行）、
      docs/decisions/README.md の Decision Map における DEC-018 の relates-to 3行（DEC-008/011/015 向け）と関連 REQ 表の
      DEC-018 行。AUTOGEN 領域（decision-baseline-count・decision-baseline-table・decision-status-proposed）は
      generate_indexes.ts の再生成で自動対応する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    result: saved
    target_area: 実証Case識別情報・評価契約投影・統合先に関わるセクション
    source_items: [AG-001, AG-008, AG-010]
    content: |
      実証Case識別情報の Issue 記録、評価契約の Issue 本文投影、統合先解決に関わる記述（line 286-318 付近）を削除する。
      covers 宣言から REQ-043-013/014/027 を除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    result: saved
    target_area: 統合先マージ・実証最終クローズ・正式化経路に関わるセクション
    source_items: [AG-001, AG-008, AG-010]
    content: |
      squash merge 先の統合先解決、実証最終クローズ（最終評価結果の導出と Issue 最終コメント正規記録）、正式化経路案内に
      関わる記述（line 268-292 付近）を削除し、merge 先は main 固定の記述へ戻す。covers 宣言から REQ-042-006/008/011、
      REQ-043-008/017/018/020/024/028 を除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    result: saved
    target_area: 統合先基準と実証実行に関わるセクション
    source_items: [AG-001, AG-008, AG-010]
    content: |
      worktree 作業起点・PR base・rebase 同期基準の可変統合先参照（line 316-333 付近）を main 固定の記述へ戻し、
      実証Caseの実行と PR 記録要素（評価ブランチ上の実証手段・測定・証拠生成）の記述を削除する。
      covers 宣言から REQ-042-001/002/003/005/006/007/011、REQ-043-007/011/015/021 を除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/commands/case-auto.md
    result: saved
    target_area: 実証Case自走に関わるセクション
    source_items: [AG-001, AG-002, AG-008, AG-010]
    content: |
      「実証Case自走」節（line 365-377 付近）を削除する（評価ブランチ伝播、実証Case認識と評価ブランチ保持、完了扱い、
      最終出力の正規化案内を含む）。通常Case自走の規定は維持する。covers 宣言から REQ-042-002/004/010/012、
      REQ-043-007/019/022/023/026 を除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/commands/req-define.md
    result: saved
    target_area: 実証Case判定と評価契約に関わるセクション
    source_items: [AG-001, AG-006, AG-008, AG-010]
    content: |
      「実証Case判定と評価契約」節（line 477-518 付近）を削除する（実証必要性の推論、評価契約の確定、実証Issue 入力の取り込み、
      評価ブランチ識別情報の生成を含む）。covers 宣言から REQ-043-002/003/004/005/006/009/010/025/029/030 を除去する
      （L1 design-save の同一 changeset で実施。 REQ-004-042/REQ-004-043 は REQ-004 の行番号参照であるため混同しない）。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/workflows/epic-wave-model.md
    result: saved
    target_area: Epic実証の評価ブランチ継承セクション
    source_items: [AG-001, AG-008, AG-010]
    content: |
      「Epic実証の評価ブランチ継承」セクション（line 331-337 付近）を削除する。covers 宣言から REQ-043-026/027 を除去する
      （L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/workflows/workflow-contracts.md
    result: saved
    target_area: 実証Caseに関わる契約記述
    source_items: [AG-001, AG-008]
    content: |
      実証Caseの scale 選択・統合先可変参照（line 166 付近）を削除し、通常Case契約へ戻す。covers 宣言に REQ-042/043 系の
      参照があれば除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target: docs/designs/workflows/backlog-artifact-lifecycle.md
    result: saved
    target_area: covers 宣言
    source_items: [AG-010]
    content: |
      covers 宣言から REQ-042-012、REQ-043-012 を除去する（本文への実証Case言及は covers のみの実測のため本文修正不要。
      L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-lifecycle.md
    result: saved
    target_area: 実証Case例外セクション
    source_items: [AG-001, AG-008, AG-010]
    content: |
      実証Case例外（スケール判定・Issue 構造選択の例外、line 27,43-49 付近）を削除する。covers 宣言から REQ-043-001 を
      除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-git-worktree.md
    result: saved
    target_area: 統合先解決・評価ブランチ作成削除セクション
    source_items: [AG-001, AG-002, AG-008, AG-010]
    content: |
      統合先解決（可変統合先の参照、line 47-51 付近）を main 固定の記述へ戻し、評価ブランチ作成・維持・削除の契約を削除する。
      covers 宣言から REQ-042-009 を除去する（L1 design-save の同一 changeset で実施）。
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    result: saved
    target_area: 実証Case識別情報テンプレートセクション形式
    source_items: [AG-001, AG-008, AG-010]
    content: |
      実証Case識別情報のテンプレートセクション形式・評価契約記録欄の規定を削除する。covers 宣言から REQ-043-016/020 を
      除去する（L1 design-save の同一 changeset で実施）。

conflict_resolutions:
  - id: CR-001
    conflict: 直近 Report 群の扱い粒度（機械的置換 vs 意味単位書き換え+注記）
    resolution: |
      意味単位の書き換え + 撤回経緯の短注記（注記日付 2026-09-05）を採用（ユーザー確定）。過去の測定結果・判断・作成経緯は
      変更しない。G1〜G4 は「実験の実行・判定は後続の個別技術検証へ分離する」形で現行手続きを再定義する。
  - id: CR-002
    conflict: DEC-027 の実行位置記述の扱い（修正 vs 不変）
    resolution: |
      不変を採用（ユーザー確定）。本文依存ゼロの実測確認済み。原則レベルの Decision に実行方式を持ち込むことは
      「不要な責務・契約を減らす」変更意図に反するため、追記もしない。実施方法の修正は Design / Report の責務。
  - id: CR-003
    conflict: DEC-018 の処分（物理削除 vs retired/ 移動 vs deprecated 化）
    resolution: |
      物理削除を採用（RU 指定）。numbering-policy が物理削除を明示許容し、decision-lifecycle の status 遷移
      （superseded/deprecated）は承認済み Decision の廃止経路であるため proposed 未採用には不適合。REQ-042/043 は
      retired 保持との非対称性は「REQ は要件 SSoT・未採用 Decision は承認実績なし」で説明する。
  - id: CR-004
    conflict: main 一本化原則の正規所有先（REQ-042-001 相当の単一ブランチモデル REQ を新設するか）
    resolution: |
      単一のブランチモデル REQ は新設せず、各工程要件（REQ-030/031/032/034/035）が各自 main を明示する散在形式を採用
      （アーキテクチャ助言準拠。DEC-001 決定4 と整合する最小主義）。
  - id: CR-005
    conflict: covers 同期のタイミング（各修正 OU で随時 vs RETIRE OU へ集約）
    resolution: |
      L1（req-save + design-save 統合 changeset・同一 push）へ集約し、中間状態の unknown 参照を回避する。req-save は
      REQ/Decision 操作に加えて checker 2件の covers 除去と索引（AUTOGEN 再生成・手書き領域削除）を、design-save は
      Design 本文のセクション削除と Design covers 除去をそれぞれ担う。漏れ防止のため OU-001 のインベントリ Report を
      実測の正とし、最終検証 OU の完了条件に12成果物の covers 除去機械検証を含める。

operation_units:
  - ou_id: OU-001
    target_req: REQ-042
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-043
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    target_req: REQ-043
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-011
    verification: |
      OU-001 で作成する撤回インベントリ Report を読み戻す。影響ファイルリスト（docs / src/opencode / .opencode 別）、
      covers 参照12成果物一覧、横断 REQ 参照行、索引自動生成領域と手書き領域の区別、検証語の定義（AG-011 の限定ルール含む）
      が記録されていることを確認する。
    pass_criteria: |
      インベントリ Report が上記要素を網羅して保存され、最新 main に対する実測値と一致していること。
    on_failure: |
      fix-and-reverify。網羅漏れは再検索して修正する。
  - id: TS-002
    target_item: AG-001
    verification: |
      OU-002 完了後、src/opencode 全域を対象に検証語（実証Case/実証ケース/評価ブランチ/評価契約/REQ-042-NNN/REQ-043-NNN/
      DEC-018、統合先は可変文脈のみ）で全文検索する。check_distribution_boundary.ts --profile source を実行し既知
      ベースライン 13件と比較する。repo-agentdev-integrity full suite（正規形 3 cwd 分割）を実行する。
    pass_criteria: |
      src/opencode において検証語の残存が 0件、distribution boundary の新規違反が 0件、full suite の新規 fail が 0件であること。
    on_failure: |
      fix-and-reverify。残存・違反は当該 OU の変更として除去し再検証する。
  - id: TS-003
    target_item: AG-006
    verification: |
      OU-003 完了後、Design 11ファイルと Report 6件を読み戻し、git diff で意図しない変更（過去の測定結果・判断・作成経緯、
      実証Case無関係の記述）が入っていないことを確認する。Report 6件に 2026-09-05 の撤回注記があることを確認する。
      check_changed_docs.ts（workflow profile）を実行する。
    pass_criteria: |
      意図したセクション・意味単位の書き換えと注記のみが行われ、docs-check が failures 0 / warnings 0 であること。
    on_failure: |
      fix-and-reverify。意図外変更を revert し再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      L1（req-save）で適用された REQ-004/005/017/030/031/032/034/035/048 の更新行を読み戻す。削除行（REQ-004-054、
      REQ-034-037〜043、REQ-035-012 ほか実測で検出された行）を covers 参照する成果物の残存有無を全文検索で確認する
      （最終検証 OU-004 で実施）。
    pass_criteria: |
      書き戻し行が main 固定表記になり、削除行の covers 参照残存が 0件であること。REQ-048 は16要件行が不変で目的節のみ
      修正されていること。
    on_failure: |
      fix-and-reverify。残存参照は同一 changeset で同期する。
  - id: TS-005
    target_item: AG-003
    verification: |
      L1（req-save / design-save 統合 changeset）完了後、(1) docs/requirements/retired/REQ-042.md・REQ-043.md が status: retired + 履歴注記付きで存在すること、
      (2) docs/decisions/DEC-018.md が不在であること、(3) 12成果物の covers 宣言から REQ-042-NNN/REQ-043-NNN が除去され
      traceability check で unknown-req-refs が 0件であること、(4) generate_indexes.ts 再生成後に requirements/README・
      decisions/README・docs/README・req-health-metrics・verification-scope-catalog が撤回後体系と整合していること、
      を確認する。
    pass_criteria: |
      上記4点すべてが成立し、traceability check（REQ-042/043 除き全行）で新規 fail が 0件であること。
    on_failure: |
      fix-and-reverify。配置・索引の不整合を修正し再生成して再検証する。
  - id: TS-006
    target_item: AG-009
    verification: |
      OU-004 で最終検証 Report を作成する。RU 受け入れ条件 1〜22 について pass / fail / blocked / not applicable を根拠付きで
      記録する。docs / src/opencode / テンプレート / checker 全域の全文検索（AG-011 の検証語定義に従う）、full suite、
      docs-check、distribution boundary、Standard / Epic Case の main 基準動作（スキル記述の読み戻しによる静的確認）を実行する。
    pass_criteria: |
      受け入れ条件 1〜22 のすべてが pass または not applicable（歴史領域の正当な除外）として記録され、新規 fail が 0件であること。
    on_failure: |
      fix-and-reverify。fail は対応 OU の範囲に戻して修正する。範囲を超える場合は blocked として報告する。

realization_actions:
  - id: RA-001
    concern: 配布物（src/opencode）からの実証Case機構の完全除去
    responsibility: |
      commands 5本（req-define/case-open/case-run/case-close/case-auto）と skills 27本から、実証Case判定・評価ブランチ処理・
      可変統合先参照・実証Case分岐・正式化導線を除去し、worktree 作業起点・PR base・rebase/同期・merge 先を main 固定の
      記述へ戻す。templates 3本（issue_desc_feature/epic/child）から実証Case識別情報セクションを削除する（epic は H2、
      feature/child は Execution Contract 内 H3 の構造差に注意）。
    ownership_hints:
      - src/opencode/commands/agentdev/*.md（req-define 17,46-48 / case-open 38 / case-run 38 / case-close 45,46 / case-auto 40 付近）
      - src/opencode/skills/agentdev-workflow-{case-open,case-run,case-close,case-auto,req-define,lifecycle,templates}/**
      - src/opencode/skills/agentdev-git-worktree/**（SKILL.md 30-59、worktree-operations.md 6-85 の評価ブランチ節・統合先解決、git-common-procedures.md 267,546 付近）
      - src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_{feature,epic,child}.md
    intent: |
      実証Case未使用機構による恒久的複雑性（状態・分岐・文書契約）を配布物から除去し、将来再利用を前提とした残置実装を
      残さない（AG-008）。
    verification_refs: [TS-002]
    source_items: [AG-001, AG-002, AG-008]
  - id: RA-002
    concern: 現行手続き Report 6件の意味単位書き換えと撤回注記
    responsibility: |
      g1〜g4 定義 Report の「実験の実行・判定の分離（後続実証Case）」節等を通常技術検証へ書き換え、ランキング・cleanup
      記録の現行手続き依存（candidate-ranking 18行、dead-responsibility-cleanup 44行）を修正する。各 Report に撤回経緯の
      短注記（2026-09-05）を付す。過去の測定結果・判断・作成経緯は変更しない。
    ownership_hints:
      - docs/reports/req-048-experiment-g{1..4}-definition.md（g1: 17,43,45,56,113,148,152,153,155,176 / g2: 174,179 ほか / g3: 184,189 ほか / g4: 176,181 ほか）
      - docs/reports/req-048-candidate-ranking.md:18
      - docs/reports/req-048-dead-responsibility-cleanup.md:44
    intent: |
      G1〜G4 実験を将来通常の技術検証として実行可能な手続き文書へ移行しつつ、履歴的事実は保存する（AG-007, AG-009）。
    verification_refs: [TS-003]
    source_items: [AG-007, AG-009]
  - id: RA-003
    concern: REQ/Decision の retirement・削除と索引・covers の同期
    responsibility: |
      REQ-042/043 の retired 化（status 付与・履歴注記・retired/ 移動）、DEC-018 の物理削除、12成果物の covers 除去、
      verification-scope-catalog の REQ-042/043 節と REQ-035 節の評価ブランチ永続語（171行）の削除、手書き索引領域
      （docs/README・decisions/README Decision Map）の削除、generate_indexes.ts 再生成を同一 changeset で実行する。
    ownership_hints:
      - docs/requirements/{REQ-042,REQ-043}.md → docs/requirements/retired/
      - docs/decisions/DEC-018.md（削除）
      - covers 12成果物（インベントリ Report の一覧が正）
      - docs/designs/foundations/references/verification-scope-catalog.md
      - docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/quality/req-health-metrics.md
    intent: |
      retirement と参照同期を不可分にして中間状態の unknown 参照・索引不整合を発生させない（AG-003, AG-010）。
    verification_refs: [TS-005]
    source_items: [AG-003, AG-010]
  - id: RA-004
    concern: REQ-048 目的節の語衝突解消
    responsibility: |
      REQ-048.md 目的節 line 10 の「最小観測・評価契約」を「評価契約」専門用語に依存しない表現へ置き換える。16要件行は
      変更しない。
    ownership_hints:
      - docs/requirements/REQ-048.md:10
    intent: |
      REQ-048 が ADF 専用の実証Case機構を成立条件としない状態にする（AG-006）。
    verification_refs: [TS-004]
    source_items: [AG-006]
  - id: RA-005
    concern: 最終検証 Report の作成
    responsibility: |
      RU 受け入れ条件 1〜22 の検証結果（pass/fail/blocked/not applicable + 根拠）を docs/reports へ保存する。
      全文検索・full suite・docs-check・distribution boundary・main 基準動作の静的確認を含む。
    ownership_hints:
      - docs/reports/（新規 Report、既存成果物種別のみ使用）
    intent: |
      撤回の完了を機械検証可能な証跡で閉じる（AG-011）。
    verification_refs: [TS-006]
    source_items: [AG-011]

review_dispositions: []

case_open_hints:
  epic_needed: true
  decomposition: |
    L1（req-save + design-save 統合）で REQ 11操作・DEC-018 削除・Design 11ファイル（本文セクション + covers）・
    checker covers 2件・索引再生成を同一 push で適用済み。以降の OU は残る実装・検証のみ:
    OU-001（撤回インベントリ Report の正規化・保存）→ OU-002（配布物撤去: src/opencode 32ファイル + templates 3本）→
    OU-003（Report 6件の意味単位書き換え + 2026-09-05 撤回注記）→ OU-004（最終検証 Report: 受け入れ条件 1〜22、
    L1 成果の機械検証を含む）。技術系（OU-002）と文書系（OU-003）の分離が分解の参考。全 OU 直列（AG-010, CR-005）。
  wave_hints:
    - 全 OU 直列（検証順序の都合上、1 Wave 1子 Issue を推奨）
    - OU-002 は配布物変更のため distribution boundary の最終 gate（source/link 両 profile・新規違反 0）を必須とする
    - OU-004 は covers 同期（12成果物）と L1 成果の機械検証を完了条件に含める
```

# summary

実証Case・評価ブランチ・Case可変統合先機構の全面撤回要件。REQ-042/043 を retirement 規約で廃止し、DEC-018（proposed 未採用）
を物理削除、Git 基準を main に一本化する。実験・技術検証は ADF Case 外の通常活動とし、結果は既存成果物へ取り込む。
横断的に有効 REQ・Design 11ファイル・配布物 32ファイル・checker covers 2件から当該契約を完全除去し、直近の現行手続き
Report 6件は意味単位の書き換えと 2026-09-05 の撤回注記を付す。DEC-027 と REQ-048 の観測・実験・評価能力は維持する。
