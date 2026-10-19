---
draft_type: req_draft
topic_slug: ru-set-20261019T231959JST
status: draft
created_at: 2026-10-20T03:40:54+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009, RU-0010]
---

<!-- req_draft テンプレート（src/common/commands/agentdev/templates/req-define/req-draft.md）準拠。
後続工程の原本は # draft-data 内の YAML コードブロックであり、人間可読セクションは補助である。 -->

# draft-data

```yaml
work_type: maintenance

scale: large

summary: backlog-auto 一式 20261019T231959JST の RU-0001〜RU-0010 を単一要件docへ統合した。内訳は (1) 障害・実害由来の予防規律と手順の明記（docs 配下パス literal 参照禁止、tool 内部モジュール書込み直接起動禁止、gh exit 66 分類行、QG-4 file-level split 標準化、draft 保存後 git 永続化、oldText 転記規約）、(2) 工程記録の未観測時刻に対する境界表現様式の提供（設計分岐は Design 書式例外新設と判断）、(3) 方針決定 REQ 2件（case-run scripts 型検査基盤導入、GitHub 版隔離検証環境の管理者事前準備常備）、(4) traceability コーパス完全性欠落の棚卸しと policy optional 処置方針（RU-0010、利用者判断 2026-10-20 により方針A〔optional 明示主軸・機構拡張を含む〕で確定）である。RU-0001〜RU-0010 すべて壁打ち合意済みで operation_units に確定済み。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-run 委譲の配布物編集における docs 配下パス literal 参照禁止規律（RU-0001）。
      harness-delegation.md 委譲指示規律節へ、配布物（SKILL.md、references、command 本文）への追記・転記で docs/designs/・docs/requirements/ 等 docs 配下パスを literal 参照として書かず、既存本体と同一の抽象化参照（対象文書名と節名等の記述名による参照）へ統一する規律を追記する。
      既存 concrete ID 規律（「canonical 参照は節名のみ」節の構造）に追記し、concrete ID 直書き（検出カテゴリ: 配布依存境界 checker）と docs 配下パス literal 参照（検出カテゴリ: IR-055 runtime-unresolved-reference heuristic）を検出カテゴリの違いとして混同しない記述とする。
      委譲 prompt 構築者への予防観点の引き渡し（MUST NOT DO セクション等経由）を規律の適用範囲に含める。
      既存配布物本文の全面的な文面是正は要求しない。IR-055 checker・check_integrity の検査内容変更（事後検知の恒久手段）は対象外。
      yomiyasu 拡張 rule への docs/ パス literal 参照指摘候補の追加は採用しない（任意の情報候補であり、project extensions は配布規律の本件適用範囲外。REQ-002-004 領域の個別判断に属する）。
  - id: AG-002
    content: |
      case-run scripts 配下の型検査基盤導入方針の決定（RU-0002）。
      case-run scripts 配下（src/common/skills/agentdev-workflow-case-run/scripts/）への型検査基盤導入方針として、既存15スキルの package 構成パターン（例: agentdev-workflow-case-ready/scripts/tsconfig.json、tsconfig.json + package.json による typecheck 実行構成）に準拠した導入を、新規 REQ（方針決定）として決定・記録する。根拠: scripts 配下は15スキル領域中唯一の package 構成未適用領域であり、宣言のみの未使用定数が長期未検出となった実害（HOLD_AND_CONTINUE_TOKENS）が実測されており、既存パターン準拠なら新規機構設計を伴わない（既存の担当構成の再利用）。
      REQ-112 について「tools 領域（src/common/tools/）のルート package と local package の二重管理統合方針であり、case-run scripts は二重管理を持たない単独 scripts 領域で構造が異なる」旨の注記を新規 REQ 内に含める（REQ-112 方針の単純適用としない。REQ-112 本体は変更しない）。
      採用時の制約として、bun test 正規形（QG-4 3 cwd 分割実行）の実行経路・検査対象集合が変化しないことを確認条件とする。C20 系参照結線欠落の早期検出効果は noUnusedLocals 等の設定内容に依存する旨を判断材料として記録する。
      tsconfig.json・package.json の実追加、typecheck の品質検査経路組込みの実施、agentdev-quality-gates への型検査水準記載の要否判断（REQ-112-002 拡張適用の検討を含む）は本方針決定の対象外（後続の実装要求）とする。scripts 配下テストの実行形態変更（bun test 正規形）と他 skills scripts 領域の再構成は対象外。
  - id: AG-003
    content: |
      Custom Tool 障害時の tool 内部モジュール書込み直接起動禁止の明記（RU-0003）。
      issue-operation-recovery.md「劣化サイクルの定量観測と縮退運用パターン」節の gh exit 66 例外手順近傍へ、tool 内部モジュール（CliRunner 等の tool 内部 API）の直接起動は診断手順の読み取り切り分けに限定され、書込みを含む操作での直接起動は非許容（書込み系の正規経路は Custom Tool agentdev_gh に限定）である旨を追記する。根拠: 同一障害局面（gh exit 66 系）の5回以上の再発中に、内部 runner 直接実行の技術的可能性を正規経路と誤解釈した実害1回が発生しており、回復契約文書に明記が不在（grep 0件実測）。
      追記は追加のみで既存規定を書き換えず、診断手順の2段分離試験（bash 直叩き・CliRunner 直接実行による読み取り切り分け）と custom-tool-contracts.md の読取 contingency 許容と矛盾しない。
      診断手順節への「障害時の最初の対応として回復契約文書を確認する」前置の追記は採用しない（最小差分。前置の不在を根拠とする実害の観測がない）。
      custom-tool-contracts.md の契約変更・機械的 enforcement（gh-write-guard 等）の導入・他 skill references への横展開は対象外。
  - id: AG-004
    content: |
      工程記録の未観測時刻に対する境界表現様式の提供（RU-0004、設計分岐は (a) と判断）。
      未観測時刻を「記載しない」契約（issue-lifecycle-records Design「正規状態と日時」節）を維持した上で、観測できない時刻を観測事実に基づく境界表現（既知の上限・下限時刻の併記）で明示できる様式を、設計分岐 (a)〔Design 契約の書式例外新設〕として提供する。
      分岐判断の根拠: (b)〔本文記録上の補足表現に留める〕は、REQ-101-003（進行状況は Root は正規状態と開始・終了日時のみを記録）の「のみ」規定の下で進行状況内の補足行の配置先が契約上存在せず、REQ 意味変更を伴う。一方、記録モデルの物理様式の正は issue-lifecycle-records Design が所有する（REQ-101 冒頭）ため、日時欄内の書式例外として定義すれば REQ 意味を変えずに様式を提供できる。境界表現が様式の拡張であり契約違反の正当化ではない点は RU 前提どおり維持する。
      様式の制約: 境界表現は観測事実（ブランチ作成、初回 commit、PR 作成等の実測可能な時刻）のみで構成し、未観測時刻の推定生成を正当化する様式にしない。実測値と区別される表記とし、実測確定時に実測値へ置換する。
      様式サポート採用に伴い、record-comments.ts の構築・検証関数が様式どおりの記録を構築・検証できること、構築・検証関数を経由する本文構築規律と矛盾しないことを条件とする。
      工程記録契約自体（開始日時 = 初回実着手の実測値のみ・終了日時 = completed 確定時のみ設定）の変更は対象外。raw 正規表現置換の禁止 enforcement（書換えは正規の構築・検証関数を経由する規律）も対象外（既存規律の維持）。
  - id: AG-005
    content: |
      QG-4 実行構成の file-level split 標準化（RU-0005、bun test 終了コード race 対策）。
      qg-4-final-acceptance.md「3 cwd 分割実行」節の実行形態規律へ、(1) fail 検出対象ファイルを独立 gate として分離実行する file-level split の標準化（split-1a 汎用 + split-1b 対象ファイル単独の2段構成の実績構成を雛形として参照可能とする）と (2) bun バージョン更新時の終了コード race 再検証の規定を追記する。根拠: bun test（bun 1.3.6 実測）の最後に読み込まれたテストファイル内 fail が残っていてもプロセス終了コードが 0 になる観測（2918 tests 中 1 fail で exit 0）があり、終了コードで機械受理する QG-4 ゲートが race をすり抜ける。既存規定に file-level split・race の規定は不在（実測 grep 0件）。
      3 cwd 分割実行の正規形自体（分割単位・cwd 規律）は変更しない。file-level split の適用条件は fail 検出対象が明確な場合（特定ファイルの fail 確認が完了条件に含まれる場合）とし、全実行への一律適用を要求しない設計とする。既存「終了コードの記録」規定（機械受理基準・版記録を含む）との整合を維持する。
      bun バージョン更新手順・依存管理の変更、windows-bun-test-spawn-timeout-classification.md の timeout 値規定（C7 deferred の管理対象）は対象外。docs/knowledge/bun-test-execution-form-drift-signals.md（cwd/パス逸脱系）の変更も対象外（本件は終了コード race 系であり根因が別）。
  - id: AG-006
    content: |
      req-define draft 保存後の git 永続化手順の明記（RU-0006）。
      req-define のドラフト保存（STEP-9）へ、保存後の git 永続化（明示パス指定 commit。並列実行安全のステージング手順準拠）手順を明記する。根拠: 保存時永続化と cleanup 時 git rm の対が崩れると、untracked draft の削除で draft 原本の git 履歴が欠落する（Epic #3803 例外経路 Case #3814 の実害1回、近縁前例 deferred L835〔RU-0004 由来〕で2例目構造）。case-revise は draft を生成・更新せず入力として消費するため、永続化責務は req-define 側にある。
      commit は明示パス指定とし、一括スコープ・スイープ操作（git add -A 等のスイープ stage を含む）を禁止する。REQ-061-040（Form Zero・tracked 前提）の契約と cleanup の fail-closed 動作は維持する。
      case-revise 側への追記は「引き継ぐ draft が commit 済み（tracked）であることの受入確認」に限定する（case-revise は draft を編集しないため生成責務を新設しない）。
      case-ready cleanup script の untracked draft 検知時（skippedPaths 記録時）の報告に、永続化漏れの可能性（保存時 git 永続化が未実施の疑い）を明示する文言を追加する（採用。保存時永続化と cleanup git rm の対の崩れを被害側でも検知可能にする）。
  - id: AG-007
    content: |
      gh exit 66（plugin ホストプロセス固有環境差）の診断手順分類行追加（RU-0007、採用）。
      issue-operation-recovery.md 診断手順（2段分離試験）の判定基準へ、「bash 直叩きと runner 経路の単体再現がいずれも成功し、Custom Tool 本体のみが恒常的に非ゼロ終了する場合 = plugin ホストプロセス固有の環境差」として分類する分類行を追加する。採用根拠: 現行判定基準は bash 成功 + runner 失敗（plugin ホスト環境差）、bash 失敗（実行環境側の問題）、両方成功（経路固有の一時事象）の3分類のみで、両方成功かつ Custom Tool 本体のみ恒常失敗の事象（gh exit 66・stderr 空、case-open STEP-2 で2回×2操作が実発生）を正しく分類できなかった実績がある。
      分類行は既存の3分類を置き換えず、両方成功の既存判定（一時事象・再発観測）と恒常失敗を区別する条件（恒常性の確認〔再試行と回復手段後も再現するか〕）を明示する。分類行の適用は読み取り系の切り分けに限定され、書込みは引き続き Custom Tool 正規経路に限定される旨を含み、RU-0003 相当の書込み規律明記と矛盾しない。
      環境要因（plugin プロセスの PATH 解決・環境変数継承・console codepage・DLL 読込等）の調査は Problem 管理であり、Issue 起票の要否判断は req-define 後の利用者判断として本要件の実現対象から切り離す。
  - id: AG-008
    content: |
      GitHub 版隔離検証環境の正規構築手段の整備方針（RU-0008、TS-007 / TS-008 / TS-010 blocked 解消）。
      整備方針の選択として、agentdev_gh 操作カタログの拡張（repo create 相当操作の追加）ではなく、管理者事前準備による隔離検証リポジトリの常備を採用し、REQ-110 / REQ-111 の検証方法・適用範囲は再評価しない（変更しない）ことを新規 REQ（方針決定）として決定・記録する。
      判断根拠（正規契約による消去法）: (ii) 検証方法の格下げ・適用範囲の再評価は、REQ-032-037（検証方法変更は同等以上の観測能力と未証明範囲不増を条件）、RA-005 判断（代替の構造的等価性は「同等以上の証明能力を持つ代替」とは認めない）、REQ-055（production-equivalent verification）と整合しないため選択できない。(iii) repo create 相当の操作追加は DEC-045 決定3前半（agentdev_gh 操作カタログ不拡張。preflight は読取専用 repo meta 照会に限定）の維持決定と衝突し、新たな Decision による部分置換を要するため、現行契約下では選択できない。よって (i) 管理者事前準備の隔離検証 repo 常備のみが既存契約と矛盾しない整備方針となる。
      gh-write guard の fail-closed 拒否自体は正規挙動であり、緩和は解決手段としない。
      隔離検証リポジトリの用意前提（構築・運用・クリーンアップの手順と責務）を検証環境前提として文書化する（実現面。管理者による repo 準備自体は repo 外操作であり、文書化と検証再開の接続を本要件の範囲とする）。
      判断後の処置経路を REQ 内に併記する: 検証環境の用意後に case-close を再開入口として、Case #3779 完了条件2（TS-007）と Epic #3803 の TS-008・TS-010 の GitHub 版部分の検証を再開する。検証環境の用意が外部要因で不能な場合は req-define 差し戻しとして再評価する。
  - id: AG-009
    content: |
      req_draft oldText の行特定書式と置換対象部分文面の区別規約（RU-0009）。
      artifact_actions の oldText における転記規約として、行特定のための行頭表記（表の行頭「| REQ-NNN-NNN |」等の装飾）と置換対象の部分文面を区別し、DefinitionEdit の完全一致契約へ転記される oldText は行特定装飾を含まない部分文面を保持する規約を定義する。根拠: Case #3782 で draft 記録の oldText が行頭表記を含み現行コーパスで出現 0 件となり、適用前の転記修正が発生（組立検査 expected_old_count の実測は部分文面に対して成立していた）。転記規約の不在により行単位編集を含む RU のたびに同種不整合が再発し得る。
      規約の帰属先は req-define 組立手順（draft-generation.md の決定的組立・検査手順）を正とする。assembly_evidence 検査（assemble-draft-section.ts の expected_old_count 照合）の変更は必須としない（既存機構は部分文面に対する実測として機能しており、規約明記により draft 記録側の書式基準を検査器と一致させる）。req_draft テンプレート（draft-data 契約）は本規約の参照点として扱う。
  - id: AG-010
    content: |
      traceability コーパス完全性欠落の棚卸しと policy optional 処置方針（RU-0010、利用者判断 2026-10-20 により方針A〔optional 明示主軸〕で確定）。
      処置方針として optional 明示方針を採用する: コーパス全体の完全性欠落（実測 missing-design 669行 / missing-implementation 98行 / missing-verification 13行。旧要件行〔REQ-001 系等〕中心）の棚卸しを実施し、旧要件行を policy optional 側へ区分明示する。現行規約下の新規行の欠落は解消義務として区別し、optional 化しない。根拠: corpus completeness は v4-traceability-model「completeness の 2 層」節において advisory・fail-open・到達目標（lifecycle gate 判定に使用しない既知債務の追跡）であり、旧要件行（REQ-103 で収束済みの行中心）への 669行規模の遡及対応より区分明示が整合する。方針選択の採用根拠は利用者の明示判断（2026-10-20 HITL relay 回答、方針A）である。
      棚卸しの対象範囲: コーパス全体（全現行要件行）の missing-design・missing-implementation・missing-verification の欠落行。
      棚卸しの受け入れ条件: (1) 旧要件行・現行規約下で達成義務のある行・廃止候補行の区分と根拠記録を含むこと、(2) 区分結果は policy 側の optional 区分（旧要件行）と、区分外の達成義務行の後続別要求への切り出しとして反映されること。
      機構拡張: missing-design / missing-implementation 軸の optional 区分機構は現行 traceability/policy.yaml（verification.optional のみ）に存在せず、機構拡張を伴う。verification 軸の旧要件行は現行 verification.optional への列挙、design / implementation 軸は policy の optional 区分機構の拡張（REQ-021 領域の契約行追加）として整備する。REQ-021-028（policy への任意行追加・解除は当該要件行の変更と同一の Definition 変更として扱う）の規律を拡張軸へ準用する。
      v4-traceability-model completeness 2層との整合: corpus completeness の advisory・fail-open・到達目標の位置づけと lifecycle gate（対象要件行 scope・fail-closed）の判定は変更しない。本方針は診断指標のシグナル対ノイズ比回復と新規行 / 旧欠落行の運用上の区分明確化が目的。
      欠落行の個別解消（区分外の達成義務行、および将来の optional 解除行）は後続の別要求として扱う（本要件は方針決定の記録が主目的）。対象外: lifecycle gate completeness 判定の変更、REQ-001 系旧要件行の個別遡及解消の一括実施、traceability check の欠落検出機構自体の廃止。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-031
    source_items: [AG-001]
    content: |
      REQ-031 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-031-033 の次行を想定）。表列構造の突合済み（実ファイル 2列構成を確認）:

      | REQ-031-034 | case-run は、配布物（SKILL.md、references、command 本文）への追記・転記を含む委譲において、docs/designs/、docs/requirements/ 等 docs 配下パスの literal 参照を配布物本文・委譲 prompt に書かせず、既存本体と同一の抽象化参照（対象文書名と節名等の記述名による参照）へ統一する規律を委譲指示規律として保持すること。同規律は委譲 prompt の MUST NOT DO セクション等を通じた予防観点の引き渡しを適用範囲に含めること。concrete ID 直書き禁止（検出カテゴリ: 配布依存境界 checker）と docs 配下パス literal 参照禁止（検出カテゴリ: runtime-unresolved-reference heuristic）を検出カテゴリの違いとして区別して記述すること。既存配布物本文の全面的な文面是正を要求しないこと。IR-055 checker・check_integrity の検査内容変更は本行の対象外とすること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-052
    source_items: [AG-003]
    content: |
      REQ-052 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-052-015 の次行を想定）。表列構造の突合済み:

      | REQ-052-016 | agentdev_gh の障害局面（gh exit 66 等の恒常失敗時の bash gh 例外手順を含む）において、tool 内部モジュール（CliRunner 等の tool 内部 API）の直接起動は診断手順の読み取り切り分けに限定され、書込みを含む操作での直接起動は非許容（書込み系の正規経路は Custom Tool agentdev_gh に限定）である旨を回復契約文書（issue-operation-recovery.md）に明記すること。追記は追加のみで既存規定を書き換えず、診断手順の2段分離試験と custom-tool-contracts.md の読取 contingency 許容と矛盾しないこと。custom-tool-contracts.md の契約変更・機械的 enforcement 導入・他 skill references への横展開は本行の対象外とすること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-052
    source_items: [AG-007]
    content: |
      REQ-052 の要件テーブル末尾へ追記する（採番は REQ 保存時の末尾連番。ACT-REQ-002 の次行を想定）:

      | REQ-052-017 | issue-operation-recovery.md 診断手順（2段分離試験）の判定基準に、bash 直叩きと runner 経路の単体再現がいずれも成功し Custom Tool 本体のみが恒常的に非ゼロ終了する場合を plugin ホストプロセス固有の環境差として分類する判定行を保持すること。既存の判定分類（bash 成功 + runner 失敗、bash 失敗、両方成功 = 経路固有の一時事象）の値域を置き換えず、恒常性の確認（再試行と回復手段後も再現するか）により一時事象と恒常失敗を区別すること。分類行の適用は読み取り系の切り分けに限定し、書込みは引き続き Custom Tool 正規経路に限定すること |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-101
    source_items: [AG-004]
    content: |
      REQ-101 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-101-019 の次行を想定）。表列構造の突合済み:

      | REQ-101-020 | 進行状況の日時欄は、観測できない時刻を実測値として記載しない原則を維持した上で、観測事実に基づく既知の上限・下限時刻の併記による境界表現を日時欄の書式例外として許容できること。境界表現は観測事実のみで構成し、未観測時刻の推定値を実測値の位置に記載しないこと。実測が確定した時点で実測値へ置換すること。物理様式の正は issue-lifecycle-records Design が保持すること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: issue-lifecycle-records
    target_area: 正規状態と日時
    source_items: [AG-004]
    content: |
      docs/designs/workflows/issue-lifecycle-records.md「正規状態と日時」節（`### 正規状態と日時`）の末尾へ追記する（節の実在と見出し構造の突合済み。既存 bullet 3項の文言は変更しない）:

      - 日時欄の書式例外（未観測時刻の境界表現）: 開始日時・終了日時は実測値のみを記載する原則（前項）を維持する。実着手または完了確定が未観測の局面では、当該日時欄を実測値として記載せず、観測事実（ブランチ作成、初回 commit、PR 作成等の実測可能な時刻）に基づく既知の上限・下限時刻の併記による境界表現を書式例外として許容する。境界表現は観測事実のみで構成し、未観測時刻の推定生成を正当化する様式としない。実測が確定した時点で実測値へ置換する。本様式の構築・検証は Case Issue 本文の構築・検証関数（`agentdev-workflow-case-run/scripts/record-comments.ts`）を経由する（様式サポートの実装は本様式の採用に伴う後続実装要求）
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-032
    source_items: [AG-005]
    content: |
      REQ-032 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-032-039 の次行から2行を想定）。表列構造の突合済み:

      | REQ-032-040 | case-close の QG-4 フル suite 実行において、fail 検出対象ファイルが明確な場合（特定ファイルの fail 確認が完了条件に含まれる場合）は、当該ファイルを独立 gate として分離実行する file-level split 構成（汎用分割と対象ファイル単独実行の2段構成）を標準として採用できること。bun test の既知の終了コード race（最後に読み込まれたテストファイル内の fail が残っていてもプロセス終了コードが 0 になる事象）により、fail 検出対象の確認が終了コードの機械受理ですり抜けない構成とすること。3 cwd 分割実行の正規形（分割単位・cwd 規律）は変更しないこと。全実行への一律適用を要求しないこと |
      | REQ-032-041 | bun のバージョン更新時には、終了コード race（fail 残存時のゼロ終了）の再現有無を再検証し、検証結果と版を記録すること。再検証の実施要否と記録は QG-4 の機械受理基準（終了コード・版の記録を含む）と整合させること。bun バージョン更新手順・依存管理の変更は本行の対象外とすること |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: REQ-004
    source_items: [AG-006]
    content: |
      REQ-004 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-004-063 の次行を想定）。表列構造の突合済み:

      | REQ-004-064 | req-define はドラフト保存後に、保存した draft ファイルを明示パス指定の commit で git 永続化すること。commit は明示パス指定とし、一括スコープ・スイープ操作（git add -A 等のスイープ stage を含む）を行わないこと。並列実行安全のステージング手順（共有 working tree のステージ確認を含む）に準拠すること。この保存時永続化は case-ready の draft 削除（Form Zero の git rm と同一ステップの commit）と対をなし、untracked draft の削除により draft 原本の git 履歴が欠落することを防ぐこと |
  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: REQ-061
    source_items: [AG-006]
    content: |
      REQ-061 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-061-043 の次行を想定）。表列構造の突合済み:

      | REQ-061-044 | case-ready の cleanup script は、removalPaths に指定された draft / RU が untracked のため git rm 対象から除外した場合（skippedPaths 記録時）に、その報告へ永続化漏れの可能性（保存時の git 永続化が未実施の疑い）を明示すること。REQ-061-040 の Form Zero 契約と cleanup の fail-closed 動作は変更しないこと |
  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: REQ-062
    source_items: [AG-006]
    content: |
      REQ-062 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-062-009 の次行を想定）。表列構造の突合済み:

      | REQ-062-010 | case-revise は、req-define が生成した draft を入力として引き継ぐ際、当該 draft が commit 済み（tracked）であることの受入確認を行うこと。case-revise は draft を生成・編集する責務を持たず、受入確認の追加以外の生成責務を新設しないこと |
  - id: ACT-REQ-009
    artifact: req
    operation: append
    target: REQ-004
    source_items: [AG-009]
    content: |
      REQ-004 の要件テーブル末尾へ追記する（採番は REQ 保存時の末尾連番。ACT-REQ-006 の次行を想定）:

      | REQ-004-065 | artifact_actions の oldText は、行特定のための行頭表記（表の行頭等の装飾）と置換対象の部分文面を区別して記録すること。DefinitionEdit の完全一致契約へ転記される oldText は行特定装飾を含まない部分文面を保持し、組立検査（expected_old_count 照合）と適用前照合（REQ-004-061）の対象が同一の文面になること。転記規約の正は req-define 組立手順（draft-generation.md の決定的組立・検査手順）が保持すること |
  - id: ACT-REQ-010
    artifact: req
    operation: create
    target: new:{caserun-scripts-typecheck-policy}
    source_items: [AG-002]
    content: |
      新規 REQ（方針決定）。frontmatter（id、created、updated）は REQ 保存時に req-file-manager が採番・付与する。本文案:

      ## 目的

      case-run scripts 配下（src/common/skills/agentdev-workflow-case-run/scripts/）には tsconfig.json / package.json が不在で型検査基盤が存在せず、宣言のみの未使用定数が長期未検出となる実績がある。case-run scripts 配下への型検査基盤導入の是非と方針を決定として記録し、後続実装要求の判断根拠を提供する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | （新規-001） | case-run scripts 配下への型検査基盤導入方針として、既存15スキルの package 構成パターン（例: agentdev-workflow-case-ready/scripts/tsconfig.json。tsconfig.json + package.json による typecheck 実行構成）に準拠した構成の導入を決定として記録すること |
      | （新規-002） | 本方針は REQ-112 とは適用領域が異なる旨の注記を含めること。REQ-112 は tools 領域（src/common/tools/）のルート package と local package の二重管理統合方針であり、case-run scripts は二重管理を持たない単独 scripts 領域で構造が異なるため、REQ-112 方針の単純適用としないこと（REQ-112 本体は変更しない） |
      | （新規-003） | 採用時、bun test 正規形（QG-4 3 cwd 分割実行）の実行経路・検査対象集合が変化しないことを確認条件とすること。tsconfig.json・package.json の実追加、typecheck の品質検査経路組込みの実施、agentdev-quality-gates への型検査水準記載の要否判断は本方針決定の対象外（後続の実装要求）とすること。C20 系参照結線欠落の早期検出効果は noUnusedLocals 等の設定内容に依存する旨を判断材料として記録すること |

      ## 適用範囲

      - **対象**: src/common/skills/agentdev-workflow-case-run/scripts/ の型検査基盤導入方針の記録
      - **対象外**: scripts 配下テストの実行形態変更（bun test 正規形）、他 skills scripts 領域の再構成、tsconfig.json・package.json の実追加、typecheck gate 組込みの実装
  - id: ACT-REQ-011
    artifact: req
    operation: create
    target: new:{github-route-verification-provisioning}
    source_items: [AG-008]
    content: |
      新規 REQ（方針決定）。frontmatter（id、created、updated）は REQ 保存時に req-file-manager が採番・付与する。本文案:

      ## 目的

      agentdev_gh 操作カタログには GitHub 上へのリポジトリ作成（repo create 相当）の操作が存在せず、gh-write guard は raw gh WRITE を fail-closed 拒否するため、正規手段では検証用リポジトリを構築できない。この結果、GitHub 版正規利用経路の実操作検証（REQ-110 / REQ-111 の TS-007・TS-008・TS-010 の GitHub 版部分）が継続 blocked となり、検証環境の不備が恒久化している。整備方針を決定として記録する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | （新規-001） | 検証環境の正規構築手段の方針として、agentdev_gh 操作カタログの拡張（repo create 相当操作の追加）ではなく、管理者事前準備による隔離検証リポジトリの常備を採用すること。agentdev_gh 操作カタログ不拡張（DEC-045 決定3前半）を維持すること |
      | （新規-002） | REQ-110 / REQ-111 の検証方法・適用範囲は再評価しない（変更しない）ことを記録すること。検証方法の格下げは REQ-032-037（検証方法変更は同等以上の観測能力と未証明範囲不増を条件）、REQ-055（production-equivalent verification）、RA-005 判断（代替の構造的等価性は同等以上と認めない）と整合しないため選択しないことを判断根拠として記録すること |
      | （新規-003） | gh-write guard の fail-closed 拒否自体の緩和は解決手段としないこと |
      | （新規-004） | 隔離検証リポジトリの用意前提（構築・運用・クリーンアップの手順と責務）を検証環境前提として文書化すること |
      | （新規-005） | 判断後の処置経路を併記すること: 検証環境の用意後に case-close を再開入口として、Case #3779 完了条件2（TS-007）と Epic #3803 の TS-008・TS-010 の GitHub 版部分の検証を再開する。検証環境の用意が外部要因で不能な場合は req-define 差し戻しとして再評価する |

      ## 適用範囲

      - **対象**: GitHub 版正規利用経路の実操作検証環境（隔離検証リポジトリ）の構築手段の方針と処置経路の記録
      - **対象外**: agentdev_gh 操作カタログの拡張、gh-write guard の緩和、REQ-110 / REQ-111 の検証方法・適用範囲の変更、plugin ホスト環境差等の環境要因の技術調査（Problem 管理として別途）
  - id: ACT-REQ-012
    artifact: req
    operation: append
    target: REQ-021
    source_items: [AG-010]
    content: |
      REQ-021 の要件テーブル（`| ID | 要件 |` 2列）末尾へ追記する（採番は REQ 保存時の末尾連番。現行最終行 REQ-021-030 の次行から2行を想定）。表列構造の突合済み（実ファイル 2列構成を確認）。方針決定（利用者判断 2026-10-20 方針A）と policy optional 機構拡張は同一の editing concern として1 action に2行で保持する:

      | REQ-021-031 | corpus completeness の欠落行（missing-design・missing-implementation・missing-verification。旧要件行中心）の処置方針として optional 明示方針を記録すること。コーパス全体の棚卸しを実施し、棚卸しの対象範囲（全現行要件行の欠落行）と受け入れ条件（旧要件行・現行規約下で達成義務のある行・廃止候補行の区分と根拠記録を含むこと。区分結果は policy 側の optional 区分と達成義務行の後続別要求への切り出しとして反映されること）を保持すること。旧要件行は policy optional 側へ区分明示し、現行規約下の新規行の欠落は解消義務として区別して optional 化しないこと。v4-traceability-model completeness 2層（corpus completeness は advisory・fail-open・到達目標、lifecycle gate は対象要件行 scope・fail-closed）の判定は変更しないこと。区分外の達成義務行の個別解消は後続の別要求として扱うこと |
      | REQ-021-032 | traceability/policy.yaml に、verification 軸（現行 verification.optional）に加え、design 対応と implementation 対応の optional 区分機構を拡張して設け、旧要件行の区分明示を可能にすること。機構拡張の適用（旧要件行の区分登録）は当該区分の根拠記録とともに行うこと。policy への区分登録・解除の規律は REQ-021-028（検証対応任意行の追加・解除は当該要件行の変更と同一の Definition 変更として扱う）を準用し、単独の無関連変更として適用しないこと。lifecycle gate completeness の判定対象（対象要件行 scope）を本機構の対象から除外しないこと（REQ-021-018・REQ-021-024・REQ-021-025 は不変） |

conflict_resolutions:
  - id: CR-001
    conflict: "RU-0004 の設計分岐 (a) Design 契約変更 か (b) 本文補足表現 か（RU が req-define に判断委證）"
    resolution: "(a)〔Design 書式例外新設〕を採用。根拠: REQ-101-003（進行状況は Root は正規状態と開始・終了日時のみ）の「のみ」規定の下では (b) の進行状況内補足行は配置先が契約上存在せず REQ 意味変更を伴う。一方、記録モデルの物理様式の正は issue-lifecycle-records Design が所有するため、日時欄内の書式例外は REQ 意味を変えずに様式として定義できる。様式サポート（record-comments.ts）は義務どおり (a) と同梱する"
  - id: CR-002
    conflict: "RU-0008 の整備方針選択（専用検証入口の追加 / 管理者事前準備の隔離検証 repo 常備 / REQ-110・REQ-111 検証方法・適用範囲の再評価）"
    resolution: "管理者事前準備の隔離検証 repo 常備（操作カタログ不拡張・検証方法維持）を採用。根拠: 検証方法格下げは REQ-032-037・RA-005 判断・REQ-055 と整合せず、repo create 相当操作の追加は DEC-045 決定3前半（操作カタログ不拡張）と衝突し Decision による部分置換を要する。現行契約下で矛盾しないのは管理者事前準備のみ（消去法）"
  - id: CR-003
    conflict: "RU-0002 の REQ-112 との関係（横展開適用か独立方針 REQ か）"
    resolution: "独立方針 REQ（新規作成）とし、REQ-112 との構造差（tools 領域の二重管理統合 vs scripts 単独領域）の注記を新規 REQ 内に含める。REQ-112 本体は変更しない（実測: REQ-112 は src/common/tools/ のみをスコープとし、scripts 領域は二重管理を持たない）"
  - id: CR-004
    conflict: "RU-0009 の転記規約の帰属先（req-define 組立手順 / assembly_evidence 検査 / 両方）"
    resolution: "組立手順（draft-generation.md 決定的組立・検査手順）を正とし、assembly_evidence 検査器の変更は必須としない。根拠: 実発生事象は draft 記録側の oldText が行頭表記を含んだ書式基準のずれであり、検査器（expected_old_count）は部分文面に対して正しく機能していた。規約明記により draft 記録側を検査器と一致させる最小変更"
  - id: CR-005
    conflict: "RU-0007 の分類行追加の採否（RU が req-define に採否判断を委證）"
    resolution: "採用。根拠: 判定基準の分類欠落（両方成功かつ本体のみ恒常失敗の未分類）で実発生1回、追加のみで既存3分類を置き換えず、RU-0003 相当の書込み規律と矛盾しない"
  - id: CR-006
    conflict: "RU-0003 の診断手順節への「回復契約文書確認の前置」追記（RU が採用する場合と任意表記）"
    resolution: "不採用（最小差分）。前置の不在を根拠とする実害の観測がなく、gh exit 66 例外手順近傍への本則追記（AG-003）で課題は解消される"
  - id: CR-007
    conflict: "RU-0006 の cleanup script 報告文言追加の採否（RU が採用判断と任意表記）"
    resolution: "採用。根拠: 保存時永続化と cleanup git rm の対の崩れを実害2例目構造として確認しており、被害側の早期検知文言により対の完全化が図れる。fail-closed 動作は変更しない"
  - id: CR-008
    conflict: "RU-0005 の file-level split の適用範囲（一律適用か条件付きか）"
    resolution: "fail 検出対象が明確な場合（特定ファイルの fail 確認が完了条件に含まれる場合）の条件付き適用とし、一律適用を要求しない（義務どおり確定。3 cwd 分割正規形は不変）"
  - id: CR-009
    conflict: "RU-0010 の処置方針（optional 明示 or 欠落解消。正規契約から一意に導出できない利用者判断として adversarial-review でユーザー質問化していた）"
    resolution: "方針A〔optional 明示主軸〕を採用（利用者の明示判断 2026-10-20、HITL relay 経由の回答）。棚卸しの対象範囲・受け入れ条件を AG-010 どおり確定し、missing-design / implementation 軸の optional 機構拡張（REQ-021 領域の契約行追加）を含めて確定。帰属先は REQ-021 追記と判断（policy 判定・completeness 運用の正規領域であり REQ-021-028/029 と同族。新規 REQ を立てるほどの独立関心ではない）"

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-031
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: new:{caserun-scripts-typecheck-policy}
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-052
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0004
    target_req: REQ-101
    target_design: docs/designs/workflows/issue-lifecycle-records.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0005
    target_req: REQ-032
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0006
    target_req: REQ-004
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-0007
    target_req: REQ-052
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    source_ru: RU-0008
    target_req: new:{github-route-verification-provisioning}
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    source_ru: RU-0009
    target_req: REQ-004
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    source_ru: RU-0010
    target_req: REQ-021
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      grep による harness-delegation.md 委譲指示規律節の追記確認: docs 配下パス（docs/designs/・docs/requirements/ 等）literal 参照禁止の規律文言、検出カテゴリ（concrete ID 直書き vs runtime-unresolved-reference heuristic）の区別記述、MUST NOT DO 経由の予防観点引き渡し適用範囲の記述が存在すること。既存規律行（「canonical 参照は節名のみ」「対応関係は traceability sidecar への記録」等）が削除・書換えされていないことを差分で確認する。
    pass_criteria: |
      規律節に docs 配下パス literal 参照禁止の規律が追記され、検出カテゴリの区別が記述され、予防観点引き渡しの適用範囲が明記され、既存規律行が不変である。grep で追記文言が1件以上一致する。
    on_failure: |
      fix-and-reverify（文言を修正して再 grep・差分確認する。追記のみで既存行を書き換えた場合は元文言を復元して再検証する）
  - id: TS-002
    target_item: AG-002
    verification: |
      新規 REQ（case-run scripts 型検査基盤導入方針）本文の記録突合: 導入方針（15スキル構成パターン準拠）、REQ-112 との構造差注記、bun test 正規形不変の確認条件、対象外明記（実追加・gate 組込み・実行形態変更・他領域再構成）が記録されていることを要件doc確認で突合する。
    pass_criteria: |
      4項（導入方針・REQ-112 注記・確認条件・対象外明記）が新規 REQ 本文に記録されている。
    on_failure: |
      fix-and-reverify（不足項を補って再突合する）
  - id: TS-003
    target_item: AG-003
    verification: |
      grep による issue-operation-recovery.md の追記確認: gh exit 66 例外手順近傍（「劣化サイクルの定量観測と縮退運用パターン」節）に書込み直接起動禁止の明記が存在すること。既存規定（bash 直叩き例外手順〔読取限定〕、書込み系は Custom Tool 正規経路限定、診断手順の境界規定、custom-tool-contracts.md の読取 contingency 許容）の文言が変わらないことを差分で確認する。
    pass_criteria: |
      明記文言が存在し、既存規定行が不変であり、読取切り分け限定との整合が文言上成立している。
    on_failure: |
      fix-and-reverify（文言を修正して再 grep・差分確認する）
  - id: TS-004
    target_item: AG-004
    verification: |
      Design 更新の突合: issue-lifecycle-records.md「正規状態と日時」節に境界表現様式が追記され、既存契約文言（開始日時の上書き禁止、終了日時は completed 確定時のみ設定、実作業時間非保存）が不変であることを差分で確認する。あわせて record-comments.ts の構築・検証関数（buildProgressSection・validateRecordComment 系）が境界表現様式の記録を構築・検証でき、観測事実不在の推定値を様式どおり受理しないことを実装後の動作確認（bun test ./src/common/skills/agentdev-workflow-case-run/scripts/）で確認する。
    pass_criteria: |
      Design diff が追記のみで既存行不変であり、構築・検証関数が様式どおりの境界表現を構築・検証でき、観測事実を伴わない推定値表記を拒否する。
    on_failure: |
      fix-and-reverify（様式文言と関数の対応を修正して再検証する。Design と record-comments.ts のどちらか一方だけの修正で不成立の場合は、不成立内容を Findings に記録して blocked 報告する）
  - id: TS-005
    target_item: AG-005
    verification: |
      qg-4-final-acceptance.md「3 cwd 分割実行」節の追記差分確認: file-level split 標準化（適用条件〔fail 検出対象が明確な場合〕と2段構成の雛形参照を含む）と bun 版更新時の終了コード race 再検証規定が追記されていること。既存の3 cwd 分割表、起動コマンド、実行形態規律 bullet 群、機械受理基準（終了コードの記録〔受理条件8〕・版の記録〔受理条件9〕を含む）が不変であることを差分で確認する。
    pass_criteria: |
      追記のみで既存行が不変であり、適用条件が「fail 検出対象が明確な場合」に限定され、一律適用要求の文言が存在しない。
    on_failure: |
      fix-and-reverify（文言を修正して再差分確認する）
  - id: TS-006
    target_item: AG-006
    verification: |
      3箇所の追記確認: (1) draft-generation.md STEP-9 に保存後 git 永続化手順（明示パス指定 commit・スイープ禁止・並列実行安全ステージング手順準拠）が追記されていること（grep）。(2) REQ-061-040 の行文言が不変であること（差分）。(3) case-revise definition-revision.md に tracked 受入確認が追記され、case-ready accept_definition_checks.ts の untracked draft 検知時報告に永続化漏れの可能性明示が追加されていること。
    pass_criteria: |
      3箇所すべての追記が存在し、REQ-061-040 の行文言が不変であり、commit 手順に明示パス指定とスイープ禁止の規律が含まれる。
    on_failure: |
      fix-and-reverify（不足箇所を修正して再確認する）
  - id: TS-007
    target_item: AG-007
    verification: |
      grep による issue-operation-recovery.md 診断手順（2段分離試験）判定基準の分類行追加確認。既存3分類（bash 成功 + runner 失敗、bash 失敗、両方成功 = 経路固有の一時事象）の文言が不変であることを差分で確認する。分類行に恒常性の確認条件と読取系限定の記述が含まれることを確認する。
    pass_criteria: |
      分類行が存在し、既存3分類が不変であり、RU-0003 相当（REQ-052-016 相当行）の書込み規律と矛盾しない文言である。
    on_failure: |
      fix-and-reverify（文言を修正して再 grep・差分確認する）
  - id: TS-008
    target_item: AG-008
    verification: |
      新規 REQ（GitHub 版隔離検証環境方針）本文の記録突合: 方針（管理者事前準備の隔離検証 repo 常備）、操作カタログ不拡張（DEC-045 維持）明記、検証方法再評価しない旨と判断根拠（REQ-032-037・REQ-055・RA-005 参照）、guard 緩和否定、処置経路（case-close 再開 / req-define 差し戻し）の併記が記録されていることを要件doc確認で突合する。検証環境前提の文書化（RA-007）が完了後に、文書から構築手順が追跡できることを確認する。
    pass_criteria: |
      5項（方針・カタログ不拡張・再評価しない根拠・guard 緩和否定・処置経路）が新規 REQ 本文に記録されている。
    on_failure: |
      fix-and-reverify（不足項を補って再突合する）
  - id: TS-009
    target_item: AG-009
    verification: |
      grep による draft-generation.md 決定的組立・検査手順への転記規約（行特定装飾と部分文面の区別、転記時の装飾除去）明記確認。assemble-draft-section.ts と tests の変更が生じていないこと（expected_old_count 機構が不変）を差分で確認する。
    pass_criteria: |
      転記規約が組立手順に存在し、検査器と tests が不変である。
    on_failure: |
      fix-and-reverify（規約文言を修正して再 grep・差分確認する）
  - id: TS-010
    target_item: AG-010
    verification: |
      (1) REQ-021 追記2行（方針行・policy optional 機構拡張行）の差分確認: 追記のみで既存行 REQ-021-011〜030 が不変であること。(2) AG-010 の義務突合: 棚卸し対象範囲（全現行要件行の欠落行・実測 669/98/13）、受け入れ条件（旧要件行・現行規約要達成行・廃止候補行の区分と根拠記録、区分結果の反映形態）、旧要件行と新規行の区分規律、機構拡張（design/implementation 軸）と REQ-021-028 準用、completeness 2層不変が記録されていることを要件doc確認で突合する。(3) 実現面（RA-009）の適用後、policy.yaml の区分登録と根拠記録、および traceability check の区分表示（旧要件行の欠落が optional 区分として表示されること）を確認する。
    pass_criteria: |
      REQ-021 への追記が2行のみで既存行が不変であり、方針行に棚卸し対象範囲と受け入れ条件と区分規律が含まれ、機構拡張行に design/implementation 軸の optional 機構と REQ-021-028 準用と lifecycle gate 非変更が明記される。実現面適用後は区分登録と根拠記録、check の区分表示が確認できる。
    on_failure: |
      fix-and-reverify（REQ 行文言または policy 拡張の実現を修正して再突合する。区分外の行を optional 化した等の区分過誤は、区分根拠を修正して再検証する）

realization_actions:
  - id: RA-001
    concern: harness-delegation.md 委譲指示規律節への docs 配下パス抽象化参照規律の追記
    responsibility: case-run 委譲契約の配布 reference の正規所有（agentdev-case-run-execution-adapter）
    ownership_hints: ["src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md「委譲指示規律（canonical 参照は節名のみ・traceability sidecar への記録）」節", "src/common/skills/agentdev-workflow-orchestration/references/capture-boundaries.md（MUST NOT DO 記載要件の参照先）"]
    intent: IR-055（runtime-unresolved-reference）の委譲段階における事前防止規律の確立
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: issue-operation-recovery.md への tool 内部モジュール書込み直接起動禁止の明記
    responsibility: Issue 操作の安全手順と回復契約文書の正規所有（agentdev-issue-management）
    ownership_hints: ["src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md「劣化サイクルの定量観測と縮退運用パターン」節（gh exit 66 恒常失敗時の bash gh 例外手順近傍）"]
    intent: 障害局面における内部 runner 直接実行の書込み流用の誤解釈再発防止（実害1回の恒久化）
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-003
    concern: record-comments.ts の境界表現様式サポート（構築・検証関数の拡張）
    responsibility: Case Issue 工程記録の決定的処理の正規所有（agentdev-workflow-case-run scripts）
    ownership_hints: ["src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（buildProgressSection・validateRecordComment 系）", "src/common/skills/agentdev-workflow-case-run/scripts/tests/record-comments.test.ts"]
    intent: 未観測時刻の捏造的記録と raw 本文書換えの間接要因（様式サポート不在）の解消
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-004
    concern: qg-4-final-acceptance.md 3 cwd 分割実行節への file-level split 標準化・bun 版更新時再検証規定の追記
    responsibility: QG-4 最終受入規範の正規所有（agentdev-quality-gates）
    ownership_hints: ["src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「3 cwd 分割実行」節の実行形態規律 bullet 群"]
    intent: bun test 終了コード race に対する QG-4 ゲートのすり抜け防止構成の標準化
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-005
    concern: draft 保存後 git 永続化手順の実現面反映（req-define・case-revise・case-ready の3箇所）
    responsibility: req-define workflow 実装本体・case-revise 受入手順・case-ready cleanup script の正規所有
    ownership_hints: ["src/common/skills/agentdev-workflow-req-define/references/draft-generation.md STEP-9（ドラフト保存）", "src/common/skills/agentdev-workflow-case-revise/references/definition-revision.md（受入確認の追加箇所）", "src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（skippedPaths 報告文言）", "src/common/commands/agentdev/req-define.md と agentdev-workflow-req-define SKILL.md のガードレール文言（git コマンド実行禁止制約の例外規定〔ドラフト保存後の明示パス指定 commit の許容〕の調整。REQ-004-064 採用時に STEP-9 の git 永続化が req-define 工程の一部となるため、command・SKILL 側の git 禁止制約文言との整合をこの範囲でとる）"]
    intent: 保存時永続化と cleanup git rm の対の確立による draft 原本履歴欠落の防止
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-006
    concern: issue-operation-recovery.md 診断手順判定基準への gh exit 66 環境差分類行の追加
    responsibility: Issue 操作の安全手順と回復契約文書の正規所有（agentdev-issue-management）
    ownership_hints: ["src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md「診断手順」節（2段分離試験の判定基準）"]
    intent: plugin ホストプロセス固有環境差の正しい分類と blocked 停止判断の根拠化
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-007
    concern: 隔離検証リポジトリの用意前提（構築・運用・クリーンアップ手順と責務）の文書化
    responsibility: プロジェクト知識の正規知識領域（docs/knowledge/、REQ-056 領域）
    ownership_hints: ["docs/knowledge/ 配下への新規知識文書（管理者事前準備の隔離検証リポジトリの前提と手順）"]
    intent: TS-007・TS-008・TS-010 の GitHub 版検証再開に必要な検証環境前提の恒久化
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-008
    concern: draft-generation.md 決定的組立・検査手順への oldText 転記規約の明記
    responsibility: req-define workflow 実装本体（組立手順の正規所有）
    ownership_hints: ["src/common/skills/agentdev-workflow-req-define/references/draft-generation.md「決定的な局所組立・検査」節・「局所修正・追記の決定的組立と検査」節", "src/common/commands/agentdev/templates/req-define/req-draft.md（draft-data 契約の参照点としての対応確認。変更は必須としない）"]
    intent: oldText の行特定装飾混入による適用前転記修正の再発防止
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-009
    concern: traceability コーパス完全性欠落の棚卸し実施と policy optional 機構拡張の適用
    responsibility: トレーサビリティ policy の運用と check 能力の正規所有（REQ-021 領域・traceability/policy.yaml・agentdev-traceability）
    ownership_hints: ["traceability/policy.yaml（optional 区分機構の拡張〔design / implementation 軸〕と旧要件行の区分登録）", "agentdev-traceability の check（区分表示対応。旧要件行の欠落を optional 区分として表示し、達成義務行の欠落と区別する）", "棚卸し結果の区分根拠記録（policy 側の区分登録とともに保持）"]
    intent: 診断指標のシグナル対ノイズ比の回復と新規行 / 旧欠落行の運用上の区分明確化（方針A〔optional 明示主軸・利用者判断 2026-10-20〕の実現）
    verification_refs: [TS-010]
    source_items: [AG-010]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 要件化の方向（harness-delegation.md 委譲指示規律節への規律追記）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-001・ACT-REQ-001・RA-001 として確定。義務4点（既存規律構造への追記と検出カテゴリ区別、全面是正不要求、予防観点引き渡し適用範囲、checker 変更対象外）をすべて AG-001 に含める。yomiyasu 拡張 rule 候補は CR として不採用判断（AG-001 内に記録）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: 要件化の方向（型検査基盤導入方針の REQ 決定・記録）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-002・ACT-REQ-010・OU-002 として確定。義務4点（15スキル構成パターン参照、REQ-112 注記、bun test 正規形不変確認条件、実行形態変更と再構成の対象外）をすべて含める。実現（tsconfig 実追加）は対象外明記どおり別要求。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: 要件化の方向（gh exit 66 例外手順近傍への書込み直接起動禁止明記）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-003・ACT-REQ-002・RA-002 として確定。義務3点（追加のみ・既存規定不変、2段分離試験と読取 contingency との整合、契約変更等の対象外）を含める。前置追記候補は CR-006 で不採用判断。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: 要件化の方向（境界表現様式の提供、設計分岐 (a)/(b)）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-004・ACT-REQ-004・ACT-DESIGN-001・RA-003 として確定。設計分岐は (a)〔Design 書式例外新設〕と判断（CR-001）。義務4点（観測事実のみ・推定正当化禁止、検証関数の様式検証、構築・検証関数経由規律との整合、契約自体の変更対象外）を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0005
    source_item: 要件化の方向（file-level split 標準化・bun 版更新時再検証規定）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-005・ACT-REQ-005・RA-004 として確定。義務4点（3 cwd 正規形不変、終了コード記録規定との整合、適用条件の限定・一律適用不要求、timeout 値規定の対象外）を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0006
    source_item: 要件化の方向（STEP-9 git 永続化手順の明記）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-006・ACT-REQ-006/007/008・RA-005 として確定。義務4点（case-revise は tracked 受入確認に限定、REQ-061-040 契約と fail-closed 維持、明示パス指定 commit・スイープ禁止、cleanup 報告文言は採用判断）を含める。報告文言は CR-007 で採用判断。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0007
    source_item: 要件化の方向（診断手順判定基準への分類行追加の採否判断）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-007・ACT-REQ-003・RA-006 として確定。採否判断は採用（CR-005）。義務2点（RU-0003 相当の書込み規律との非矛盾、環境要因調査の Problem 管理切り離し）を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0008
    source_item: 要件化の方向（整備方針の REQ 判断・記録）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-008・ACT-REQ-011・RA-007 として確定。義務3点（処置経路の併記と Case #3779 / Epic #3803 への接続、操作カタログを関連判断対象として扱う〔不拡張の判断根拠記録〕、guard 緩和否定）を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0009
    source_item: 要件化の方向（転記規約の定義と帰属先判断）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-009・ACT-REQ-009・RA-008 として確定。義務2点（帰属先判断〔組立手順を正・検査器変更は必須としない〕、参照点3点〔draft-data 契約・組立手順・assemble-draft-section 関連検査〕）を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0010
    source_item: 要件化の方向（棚卸しと policy optional 処置方針の REQ 判断・記録）
    disposition: covered
    reason_code: implemented_in_ag
    reason: |
      AG-010・ACT-REQ-012（REQ-021 追記2行）・OU-010・RA-009 として確定。処置方針は利用者の明示判断（2026-10-20 HITL relay 回答、方針A〔optional 明示主軸〕）を採用根拠として確定。義務3点（棚卸しの対象範囲・受け入れ条件を方針判断に含める、v4-traceability-model completeness 2層との整合、欠落行解消時も個別解消は後続別要求）を AG-010 に含める。missing-design / implementation 軸の機構拡張（REQ-021-032 案行）と REQ-021-028 準用を含む。
    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition: |
    scale large だが Epic 集約は必須としない（OU 群は相互非依存の小規模変更群。一式の完了突合は backlog-auto set-state 義務スナップショットが担う）。領域別グルーピング参考: (1) 配布物規律群〔OU-001・OU-003・OU-005・OU-007: skill references 追記系〕、(2) req-define / case 契約群〔OU-004・OU-006・OU-009: REQ 追記＋Design 更新＋record-comments.ts 実現面を含む〕、(3) 方針決定 REQ 新規2件〔OU-002・OU-008〕。OU-004 の record-comments.ts 実現面（RA-003）はコード変更を含むため、(2) 内で独立の検証単位とする。
  wave_hints: []
```

# summary

<!-- 人間可読サマリー。後続工程の原本ではなく、処理の正は上記 # draft-data YAML ブロック。 -->

## 要約

backlog-auto 一式 20261019T231959JST（RU-0001〜RU-0010、10件）を単一要件docへ統合した。RU-0001〜RU-0009 は壁打ち合意済み（operation_units: OU-001〜OU-009）。RU-0010 は利用者判断（2026-10-20 HITL relay 回答、方針A〔optional 明示主軸・機構拡張を含む〕）により OU-010（REQ-021 追記）として確定。全10 RU 確定、auto_ready: true。

## 背景

一式の源泉は 2026-10-20 の backlog-review による intake / learning の昇格成果物であり、(1) 障害・実害の再発防止（IR-055、gh exit 66 障害局面、工程記録の捏造的記録、bun test 終了コード race、draft git 履歴欠落、oldText 転記修正）、(2) 検証環境の恒久不備（GitHub 版 TS-007/008/010 blocked）、(3) 方針未決の棚卸し（case-run scripts 型検査、traceability コーパス完全性）を運ぶ。基準点: HEAD f6f3a4765（main）、backlog-auto 開始 2026-10-19T23:19:59+09:00。

## 要求（operation_units 単位）

| OU | 元 RU | 要求 | 対象 |
|---|---|---|---|
| OU-001 | RU-0001 | docs 配下パス literal 参照禁止規律の委譲指示規律節への追記 | REQ-031 追記 + RA-001 |
| OU-002 | RU-0002 | case-run scripts 型検査基盤導入方針の決定・記録 | 新規 REQ + 注記 |
| OU-003 | RU-0003 | tool 内部モジュール書込み直接起動禁止の明記 | REQ-052 追記 + RA-002 |
| OU-004 | RU-0004 | 未観測時刻の境界表現様式（分岐 (a): Design 書式例外新設） | REQ-101 追記 + Design update + RA-003 |
| OU-005 | RU-0005 | QG-4 file-level split 標準化・bun 版更新時再検証 | REQ-032 追記 + RA-004 |
| OU-006 | RU-0006 | draft 保存後 git 永続化手順の明記 | REQ-004/061/062 追記 + RA-005 |
| OU-007 | RU-0007 | gh exit 66 plugin ホスト環境差の分類行追加 | REQ-052 追記 + RA-006 |
| OU-008 | RU-0008 | GitHub 版隔離検証環境（管理者事前準備常備）の方針 | 新規 REQ + RA-007 |
| OU-009 | RU-0009 | oldText 行特定書式と部分文面の区別規約 | REQ-004 追記 + RA-008 |
| OU-010 | RU-0010 | traceability コーパス完全性の棚卸しと policy optional 処置方針（方針A・機構拡張込み） | REQ-021 追記（-031/-032 想定） + RA-009 |

## スコープ

- **対象**: 上表 10 OU の契約（REQ 追記・新規 REQ・Design 更新）と実現面（skill references・配布手順・record-comments.ts 様式サポート・知識文書化・policy optional 機構拡張と棚卸し）
- **対象外**: IR-055 checker・check_integrity の検査内容変更、custom-tool-contracts.md の契約変更と機械的 enforcement 導入、工程記録契約自体の変更、bun バージョン更新手順と timeout 値規定、scripts 配下テスト実行形態変更、REQ-112 本体と REQ-110/REQ-111 の検証方法・適用範囲、agentdev_gh 操作カタログ拡張、gh-write guard の緩和、既存配布物の全面文面是正、yomiyasu 拡張 rule 追加、lifecycle gate completeness 判定の変更、REQ-001 系旧要件行の個別遡及解消の一括実施（区分外達成義務行は後続別要求）、traceability check の欠落検出機構自体の廃止

## 受け入れ基準

各 AG（AG-001〜AG-010）に対応する test_strategy（TS-001〜TS-010、verification / pass_criteria / on_failure 3要素完備）を正とする。義務スナップショット（set-state.json 義務）の各受け入れ義務は agreed_items と review_dispositions（RD-001〜RD-010）で突合可能。

## 既存要件との関連

- REQ-031（case-run 実行契約）: OU-001 が委譲規律行を追記（REQ-031-032〔concrete ID 予防引き渡し〕と同族）
- REQ-052（Custom Tool 契約）: OU-003・OU-007 が障害時規律と診断分類行を追記（REQ-052-014/015 の延長）
- REQ-101（Case Issue 工程記録モデル）: OU-004 が日時欄書式例外行を追記（REQ-101-003/015/016 の意味は維持）
- REQ-032（case-close 実行契約）: OU-005 が QG-4 実行構成行を追記（REQ-032-030〜039・REQ-007-015/016 と整合）
- REQ-004（要求の形成と合意）: OU-006・OU-009 が組立・保存・永続化契約行を追記（REQ-004-058〜063・REQ-004-061 の延長）
- REQ-061/REQ-062: OU-006 が cleanup 報告文言行（REQ-061-040 と対）と case-revise 受入確認行を追記
- REQ-112: OU-002 の新規 REQ が構造差注記の対象として参照（本体変更なし）
- REQ-110/REQ-111: OU-008 の方針 REQ が検証再開の接続先（本体変更なし）
- REQ-021（トレーサビリティのワークフロー統合）: OU-010 が corpus completeness 処置方針行と policy optional 機構拡張行を追記（REQ-021-018/024/025〔lifecycle gate 完全性〕と REQ-021-028/029〔policy 運用契約〕の延長。既存行は不変）。REQ-012（TIM 定義・公開契約）は変更しない

## Decision 要否

Decision 新設不要と判断（4候補すべて）:
- OU-002: 方針決定 REQ のみで記録（REQ-112 が方針決定 REQ 単独の先例。契約のみで可逆・実装別要求分離）
- OU-008: 既存 Decision（DEC-045）の維持宣言を含む方針記録であり、新規 Decision を要しない。DEC-045 部分置換が必要になるのは repo create 操作追加を選ぶ場合のみ
- OU-004: Design の物理様式所有範囲内の拡張で REQ 意味変更を伴わない
- OU-010: 方針A の採用根拠は利用者の明示判断（2026-10-20 HITL relay 回答）であり、REQ 行（REQ-021 追記）として記録。policy 機構拡張は既存 policy 運用契約（REQ-021-028/029）の延長であり新規 Decision を要しない

## 検証方針

test_strategy（TS-001〜TS-010）を正とする。共通方針: (1) 配布物・reference 追記は grep + 差分で「追記のみ・既存行不変」を確認、(2) 方針決定 REQ は記録突合（要件doc確認）、(3) record-comments.ts 様式サポートは bun test での動作確認、(4) REQ-061-040 等の既存契約行の非改変を差分で担保、(5) policy 機構拡張（OU-010）は REQ 行の差分突合に加え、実現面適用後は区分登録・根拠記録・check の区分表示を確認。

## traceability（元 RU 帰属）

RU-0001→OU-001（AG-001、ACT-REQ-001、RA-001、RD-001）、RU-0002→OU-002（AG-002、ACT-REQ-010、RD-002）、RU-0003→OU-003（AG-003、ACT-REQ-002、RA-002、RD-003）、RU-0004→OU-004（AG-004、ACT-REQ-004、ACT-DESIGN-001、RA-003、RD-004）、RU-0005→OU-005（AG-005、ACT-REQ-005、RA-004、RD-005）、RU-0006→OU-006（AG-006、ACT-REQ-006/007/008、RA-005、RD-006）、RU-0007→OU-007（AG-007、ACT-REQ-003、RA-006、RD-007）、RU-0008→OU-008（AG-008、ACT-REQ-011、RA-007、RD-008）、RU-0009→OU-009（AG-009、ACT-REQ-009、RA-008、RD-009）、RU-0010→OU-010（AG-010、ACT-REQ-012、RA-009、RD-010。CR-009 に利用者判断記録）。義務スナップショット: .agentdev/backlog-auto/end-to-end/20261019T231959JST/set-state.json。

## adversarial-review 実施記録（STEP-8）

- 発動: default-on（skip 条件非該当）。機械検査相当の事前突合（append 対象 8 ファイルの表列構造・見出し構造突合、Design 節実在確認、採番基準〔各 REQ 最終行の実査〕）を意味レビュー前に完了済み。
- Reviewer stream A（契約整合）: findings A1〜A6。採用反映: A4（REQ-004-064 採用時の req-define command・SKILL 側 git 禁止制約との整合）→ RA-005 ownership_hints へ command・SKILL 調整を追加。A1（OU-005 の REQ 帰属 REQ-032 vs REQ-007/REQ-060）→ REQ-060-003（QG-4 所有権非侵食）により REQ-032 維持で解消。A2（採番予測）→ 各 action content に「採番は REQ 保存時の末尾連番」注記を追加。A3/A5/A6 は反証により非 finding（設計節実在・正規原本間参照の許容・義務充足構造を確認）。
- Reviewer stream B（スコープ・実行可能性）: findings B1〜B6。採用反映: B2（TS-004 に record-comments.ts 様式検証の動作確認を含める）→ TS-004 verification/pass_criteria を拡張済み。B1/B3/B4/B5/B6 は反証により非 finding または契約どおりの処置（OU 数と単一 doc 契約、受入確認の検証可能性、scale large 判定〔複数REQ該当〕、work_type maintenance 判定、RU-0010 のユーザー質問化）。
- convergence audit: 合意候補（9 OU shaped + RU-0010 unresolved）と成立根拠を再検証し、新たな本質的争点は検出されず。RU-0010 は unresolved ユーザー判断事項として STEP-9 handoff 完了ゲートを通過させず（adversarial-review-integration.md 契約どおり）、本 draft は壁打ち中断時の durable state として保存。
- Jev 先行評価: 本実行の STEP-8 reference に定義済みの評価契約（evaluationKind・質問バッチ）が読取れた範囲に存在しないため、評価契約の捏造を避けて未実行（legacy LLM path の review を本節で実施）。
- ユーザー判断受領後の確定（2026-10-20 HITL relay 回答、方針A）: RU-0010 方針を AG-010・ACT-REQ-012・OU-010・TS-010・RA-009・RD-010・CR-009 として確定し、unresolved_questions を解消して auto_ready: true へ再判定。帰属先（REQ-021 追記）は REQ-021 実ファイル突合（2列表・最終行 REQ-021-030・policy 運用契約は -028/-029）に基づき確定。未解決のユーザー判断事項は残存しない。
