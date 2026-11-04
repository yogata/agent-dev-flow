---
draft_type: req_draft
topic_slug: artifact-finalization-and-version-reconstruction
status: draft
created_at: 2026-11-04T08:27:23+09:00
source_rus: [RU-0257]
pre_save_notification: 2026-11-04T08:27:23+09:00 既存REQへのAPPEND重要変更（本draftのartifact_actions参照）をドラフト保存前に実行出力へ提示済み
---

# draft-data

```yaml
# work_type: 新たな要求行（REQ-105-009〜014）と Design・判定器知識の増分を定義する feature
work_type: feature

# scale: 単一 REQ への 6 行 APPEND と既存 Design 2 ファイルの当該節更新、配布 skill の知識反映で完結する標準規模
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  RU-0257（成果物の正式確定と確定版の再構成）に基づき、REQ-105「ADF v5 成果物の意味と工程別正式確定」へ
  正式確定の判定・操作・状態・根拠・版の一貫性の増分 6 行（REQ-105-009〜014）を APPEND する。
  後続実装・Issue・PR を一律の確定条件としない成果物種別ごとの正式確定（009）、構造的成立と検証実態を区別する
  証拠評価（010）、判定器の正式確定判定と正規の確定操作・確定状態反映の区別および変更駆動・工程駆動両経路での
  正規反映と一覧整合（011）、確定対象・範囲・根拠・版の別セッションからの再構成（012）、再構成不能時の区分報告と
  推測禁止（013）、工程遷移・工程全体の完了との区別（014）を定義する。基盤モデル規則は
  foundations/v4-operating-model.md、運用面は responsibilities/document-type-responsibilities.md の当該節へ
  増分反映する。成果物の種類に応じた既存状態規則と既存の判定器・確定経路を再利用し、版台帳・確定履歴データベースの
  一律新設と意味判断の機械判定器への組込みは行わない。工程遷移そのものは対象外である（別 RU の領域）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。RU3-AC1〜AC6 の増分に対応（既存 REQ 行が所有する命題は review_dispositions で処分）
agreed_items:
  - id: AG-701
    content: |
      成果物種別ごとの正式確定の独立性（RU3-AC1 の増分）。要求、設計の各成果物の正式確定は、後続実装、Issue、PR の
      存在または完了を一律の確定条件とせず成立する。実装前の設計確定を設計成果物単独で成立させ、独立設計書を
      採用しない案件では設計文書の作成を確定条件としない。既存の REQ-105-006（後続工程を待たずに正式確定できる能力規定）と
      REQ-105-002/003（設計根拠の成果物種別非依存）を前提に、確定条件レベルの禁止規定を REQ-105 の増分行として追加する。
  - id: AG-702
    content: |
      正式確定に必要な証拠の正しい評価（RU3-AC2）。正式確定の判定では、対応宣言・検証資料の存在という構造的成立と、
      上流との内容整合および必要な検証が実際に成立していることを区別して評価する。構造的な対応の成立だけ、または
      検証資料の存在だけを根拠に正式確定可能と判定しない。機械検査結果、内容評価、検証証拠を別区分で保持し、
      検証が失敗している事例と資料は存在するが内容が不十分な事例では確定不可（根拠と確認範囲付き）、必要な検証が
      実際に成立している事例のみ確定可とする。構造検査のみの成功と、正規経路での正式確定を別の証拠として扱う。
  - id: AG-703
    content: |
      正規の確定操作と確定状態の反映（RU3-AC3）。判定器の正式確定判定（finalized: true 等）と正規の確定操作・
      確定状態の反映を区別し、判定結果だけを根拠に確定状態を反映・完了扱いとしない。確定状態の反映は各成果物種別の
      既存状態規則が定める正規の確定経路で実行する: 変更駆動では case-close の Design 確定フロー（draft から accepted への
      昇格と Design 管理インデックス status 列の同時更新、昇格評価証跡の Issue 対応記録コメント保存）、工程駆動では
      v51 工程駆動モデルの既存確定経路（確定の権限と経路は既存のまま変更しない）。権限外の状態変更を行わず、
      既存の一覧・索引（docs/designs/README.md status 列等）との整合を維持する。Design の draft/accepted 等の
      既存状態規則は維持する。構造検査のみの成功と、正規経路での正式確定を別の証拠として扱う。
  - id: AG-704
    content: |
      確定対象・範囲・根拠・版の再構成（RU3-AC4）。正式確定した成果物について、対象取組、工程、確定対象、対象範囲、
      確定根拠、確定時のGitコミットとその時点の内容を、新規の版台帳や確定履歴データベースを一律に新設せず、
      既存の正規情報・証拠チャネル（Case Issue の対応記録コメント、PR 本文、正規成果物）とGit履歴から
      別セッションから再構成できる。後続工程で利用した後に改訂した場合も、改訂後の現在の内容を過去に
      確定した内容として扱わない。
  - id: AG-705
    content: |
      再構成不能を誤って確定済みと扱わない（RU3-AC5）。確定対象・版の再構成が不能な場合（確定根拠の不足、
      対象版不明、必要な情報の取得失敗）を区別して扱い、不足と確認範囲を示し、根拠なく確定状態・対象版を
      推測しない。確定時点を特定できないまま、最新コミットを確定版とみなさない。
  - id: AG-706
    content: |
      正式確定と他の完了概念の区別（RU3-AC6）。成果物の正式確定は、工程遷移および工程全体の完了を自動的に認定せず、
      成果物の確定と工程遷移を別々に判定できる。後続工程・最終検証が未完了の正式確定済み成果物について、確定の
      状態だけを根拠に工程遷移の成立や最終要求充足の合格を宣言しない。最終的な要求充足との別判定は REQ-105-007 の
      既有義務として維持する。工程遷移そのものの定義は本 RU の対象外である。

# artifact_actions: 1 action = 1 artifact × 1 editing concern
artifact_actions:
  - id: ACT-REQ-701
    artifact: req
    operation: append
    target: docs/requirements/REQ-105.md
    target_area: '## 要件 のテーブル末尾（REQ-105-008 の行の後。表構造 | ID | 要件 | をそのまま維持）'
    source_items: [AG-701, AG-702, AG-703, AG-704, AG-705, AG-706]
    content: |
      | REQ-105-009 | 要求、設計の各成果物の正式確定は、後続実装、Issue、PR の存在または完了を一律の確定条件とせず成立し、独立設計書を採用しない案件では設計文書の作成を確定条件としないこと |
      | REQ-105-010 | 正式確定の判定では、対応宣言・検証資料の存在という構造的成立と、上流との内容整合および必要な検証が実際に成立していることを区別して評価し、構造的成立または資料の存在だけを根拠に正式確定可能と判定しないこと |
      | REQ-105-011 | 判定器の正式確定判定と正規の確定操作・確定状態の反映を区別し、確定状態の反映は各成果物種別の既存状態規則が定める正規の確定経路で実行すること。判定結果だけを根拠に確定済みと反映せず、権限外の状態変更を行わず、既存の一覧・索引との整合を維持すること |
      | REQ-105-012 | 正式確定した成果物について、対象取組、工程、確定対象、対象範囲、確定根拠、確定時のGitコミットとその時点の内容を、新規の版台帳や確定履歴データベースを一律に新設せず、既存の正規情報とGit履歴から別セッションから再構成できること。改訂後の現在の内容を過去に確定した内容として扱わないこと |
      | REQ-105-013 | 確定対象・版の再構成が不能な場合（確定根拠の不足、対象版不明、必要な情報の取得失敗）は、根拠なく確定状態や対象版を推測せず、不足と確認範囲を区別して示すこと。確定時点を特定できない場合、最新のコミットや現在の内容を確定版・確定時の内容とみなさないこと |
      | REQ-105-014 | 成果物の正式確定は、工程遷移および工程全体の完了を自動的に認定せず、成果物の確定と工程遷移を別々に判定できること |
  - id: ACT-DESIGN-701
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-operating-model
    target_area: '### 意味境界の正規所有と工程別正式確定の区別（REQ-088-006、REQ-105）'
    source_items: [AG-701, AG-702, AG-703, AG-704, AG-705, AG-706]
    content: |
      上記 5 要素の意味境界は、本節が ADF の基盤モデル定義として正規所有する（REQ-088-006）。運用面（文書種別ごとの責務、配置基準、対応関係の表現方法）は responsibilities/document-type-responsibilities.md が所有し、responsibilities/artifact-contracts.md は成果物間の入出力と操作契約を扱う副次参照である。意味境界の判定を成果物間契約の側から再定義せず、基盤モデル定義と運用面から到達する構造を維持する。

      工程別の成果物の正式確定と最終的な要求充足は別判定であり、この区別は本節の所有対象ではなく、REQ-105（ADF v5 成果物の意味と工程別正式確定）が所有する。各工程の成果物は当該工程の要求充足、上流整合、必要な検証の成立をもって後続工程を待たずに正式確定でき（REQ-105-006）、設計成果物の正式確定をもって最終的な要求充足済みと判定しない（REQ-105-007）。最終的な要求充足の判定は case-close の QG-4 最終完了判定が所有する。ゲートが判定条件の前提とする工程・成果物規約は、プロジェクトが採用した採用済み規約から解決し、採用宣言が存在しない間は移行期デフォルト（REQ-105-008）として当該プロジェクトの現に実効している運用を用いる（foundations/v5-adopted-conventions.md「採用規約の構成要素」「移行期デフォルトとの接続」参照）。

      成果物種別ごとの正式確定の独立性（REQ-105-009）。後続実装、Issue、PR の存在または完了を一律の確定条件とせず、要求・設計の各成果物の正式確定を成立させる。実装前の設計確定を設計成果物単独で成立させ、独立設計書を採用しない案件では設計文書の作成を確定条件としない。正式確定の構造判定（agentdev-artifact-semantics の finalize）は後続工程の成果物を要求しない。

      判定と正規の確定操作・確定状態の区別（REQ-105-010、REQ-105-011）。正式確定の構造判定（agentdev-artifact-semantics の finalize。判定器は副作用を持たず、designValidity は常に not-evaluated-by-this-tool、requirementSatisfaction は常に not-assessed-by-this-tool を返す）は判定であり確定操作を伴わない。判定結果（finalized: true 等）だけを根拠に確定状態を反映・完了扱いとしない。確定可否判断では、構造判定の成立（対応宣言・検証資料の実在と対応の成立）と、検証が実際に成立していること（機械検査結果、内容評価、検証証拠）を区別して扱い、上流との内容整合の確認を含める。構造的な成立や検証資料の存在だけを根拠に正式確定可能と判定しない。この内容評価は閉じた意味判断であり判定器へ組込まない（REQ-096 の判断方法3分類に従う）。

      確定状態の反映は各成果物種別の既存状態規則が定める正規の確定経路で実行する。変更駆動では case-close の Design 確定フロー（docs/designs/commands/case-close.md「Design 状態評価の棚卸し制」）が draft から accepted への昇格と docs/designs/README.md status 列の同時更新を担い、Design 保存内部責務は accepted を付与しない。工程駆動では v51 工程駆動モデル（docs/designs/workflows/v51-phase-driven-collaboration-model.md「実行主体と責務境界」）のとおり確定（Design の draft から accepted への昇格、Decision の状態遷移）の権限と経路を既存のまま維持し、経路別所有境界は v51 工程遷移・双経路併存モデルと整合させる。確定状態の反映では権限外の状態変更を行わず、既存の一覧・索引との整合を維持する。

      確定記録と版の再構成（REQ-105-012、REQ-105-013）。正式確定では、確定対象、対象範囲、確定根拠を既存の証拠チャネル（当該 Case の Issue 対応記録コメント、PR 本文、正規成果物、Git 履歴）に保持し、確定時点の main 上のコミット（squash merge の場合は squash merge コミット）から確定時の内容を特定できるようにする。別セッションからの再構成は、正規成果物・証拠チャネル・Git 履歴の既存情報から対象取組、工程、確定対象、対象範囲、確定根拠、確定時のGitコミットとその時点の内容を復元する。改訂後の現在の内容を過去に確定した内容として扱わない。再構成が不能な場合（確定根拠の不足、対象版不明、必要な情報の取得失敗）は、不足と確認範囲を区別して報告し、根拠なく確定状態・対象版を推測せず、確定時点を特定できないまま最新コミットを確定版とみなさない。新規の版台帳・確定履歴データベースは一律に新設せず、既存の正規情報と Git を優先利用する。

      正式確定と工程遷移・最終要求充足の区別（REQ-105-007、REQ-105-014）。成果物の正式確定は、工程遷移および工程全体の完了を自動的に認定せず、成果物の確定と工程遷移を別々に判定できる。工程遷移は利用者判断による独立操作として維持され（REQ-111-002）、最終的な要求充足の判定は case-close の QG-4 最終完了判定が所有する。
  - id: ACT-DESIGN-702
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: '### 成果物の意味境界の運用面と工程別正式確定（REQ-088-006、REQ-105）'
    source_items: [AG-703, AG-704, AG-705]
    content: |
      REQ、Decision、Design、Implementation、Evidence の意味境界の基盤モデル定義は `../foundations/v4-operating-model.md`「中核文書モデル」節が正規所有する。本 Design はその運用面（文書種別ごとの責務、配置基準、対応関係の表現方法）を所有し、[artifact-contracts.md](artifact-contracts.md) は成果物間の入出力と操作契約を扱う副次参照である。

      工程別の成果物の正式確定と最終的な要求充足は別判定である（REQ-105）。文書種別のライフサイクル上の確定（Design の accepted 遷移、REQ の現行要件への採用、Decision の accepted 遷移）は当該工程の成果物の正式確定を表し、それをもって最終的な要求充足済みと判定しない。最終的な要求充足の判定は case-close の QG-4 最終完了判定（REQ-021-025、REQ-032）が所有する。ゲートが判定条件の前提とする工程・成果物規約は、プロジェクトが採用した採用済み規約から解決し、採用宣言が存在しない間は移行期デフォルト（REQ-105-008）として当該プロジェクトの現に実効している運用を用いる（`../foundations/v5-adopted-conventions.md`）。

      正規の確定経路と確定状態反映の運用（REQ-105-011）。ライフサイクル上の確定は、判定結果ではなく正規経路の操作で確定状態を反映する。Design は case-close の Design 確定フロー（変更駆動）または工程駆動の既存確定経路で draft から accepted へ遷移し、docs/designs/README.md の status 列を同時に更新して一覧との整合を維持する。判定器（`agentdev-artifact-semantics` finalize）の finalized: true は確定操作の完了を表さない。権限外の状態変更を行わない。

      確定記録と再構成の運用（REQ-105-012、REQ-105-013）。Design の accepted 昇格では、昇格評価の証跡（評価契機、評価根拠、対象 Case/PR、REQ との整合確認結果）を当該 Case の Issue への対応記録コメントに保存する既存規律を維持し（`../skills/agentdev-design-file-manager.md`「accepted 昇格時の証跡保存」）、確定時点の main 上のコミット（squash merge の場合は squash merge コミット）から確定時の内容を Git 履歴で特定できるようにする。REQ・Decision の確定（現行要件への採用、accepted 遷移）は、既存の保存・状態規則と証拠チャネル（Case Issue、PR、正規成果物、Git 履歴）から同様に再構成できる。別セッションでの再構成では、確定対象、対象範囲、確定根拠、確定時のGitコミットとその時点の内容を既存情報から復元し、再構成不能時（確定根拠の不足、対象版不明、必要な情報の取得失敗）は不足と確認範囲を区別して報告し、推測で補完せず、最新コミットを確定版とみなさない。版台帳・確定履歴データベースは一律に新設しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-701
    conflict: AC1 の新行（REQ-105-009）が既存 REQ-105-006（後続工程を待たずに正式確定できる）や REQ-105-002/003（設計根拠の成果物種別非依存）と重複するおそれ
    resolution: 新行は「後続実装・Issue・PR・設計文書の作成を一律の確定条件としない」という確定条件レベルの禁止規定に限定し、「できること」の能力規定（REQ-105-006）と設計根拠の成立条件（REQ-105-002/003）は再定義・再記述しない。既存行は変更しない APPEND のみとする
  - id: CR-702
    conflict: '判定器（agentdev-artifact-semantics finalize）の finalized: true と正規の確定操作・確定状態の混同（判定結果を確定完了と扱う誤用の余地）'
    resolution: '判定と操作・状態の区別を新行 REQ-105-011 と基盤・運用両 Design の当該節で明確化する。判定器 CLI 契約（finalized、designValidity: not-evaluated-by-this-tool、requirementSatisfaction: not-assessed-by-this-tool、副作用なし）は現行維持とし、区別の反映は呼出側の規律と配布 skill の知識として行う'
  - id: CR-703
    conflict: 確定対象・版の再構成（AC4）と RU 対象外「全成果物の版台帳の一律新設」の衝突リスク
    resolution: 版台帳・確定履歴データベースを一律に新設せず、既存の正規情報・証拠チャネル（Case Issue 対応記録コメント、PR 本文、正規成果物）とGit履歴で再構成を成立させる（RU の要件化の方向「Gitと既存の正規情報を優先利用する」に従う）。REQ-105-012 の行文言にも非新設を明記する

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-701
    source_ru: RU-0257
    target_req: REQ-105
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-702
    source_ru: RU-0257
    target_req: REQ-105
    target_design:
      operation: update
      domain: foundations
      slug: v4-operating-model
    operation: update
    scale: standard
    depends_on: [OU-701]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-703
    source_ru: RU-0257
    target_req: REQ-105
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    operation: update
    scale: standard
    depends_on: [OU-701]
    recommended_order: 3
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
# 証拠区分（機械検査結果・内容評価・検証証拠・正規の確定状態・Gitコミット・改訂前後の照合）と
# 「構造検査のみの成功と、正規経路での正式確定を別の証拠として扱う」こと（RU 検証範囲と証拠）を全項目で順守する
test_strategy:
  - id: TS-701
    target_item: AG-701
    verification: |
      公開操作契約に従った実行で検証する。正規 skill 操作契約（agentdev-artifact-semantics scripts README の実行方法）に従い
      事例ごとに coverage CLI と finalize CLI を実行する: (a) 要求成果物のみの事例（phase requirement、設計・実装成果物不在）、
      (b) 実装前の設計成果物のみの事例（実装成果物・PR 不在のまま phase design で finalized 判定）、
      (c) 独立設計書を採用しない案件の事例（採用規約 independentDesignRequired: false + alternativeDesignBasisAllowed: true の
      採用宣言を --adopted で指定し、代替成果物型の設計根拠宣言で設計根拠 confirmed を確認）。併せて、正規の確定経路
      （変更駆動: case-auto が駆動する case-ready / case-close の内部段階。工程駆動: 利用者の確定指示に基づく REQ-111-006 の
      確定だけの独立終了経路）で、後続実装・Issue・PR・設計文書の不存在を理由に確定が拒否されないことを記録する。
      構造検査（finalize 実行）の成功と、正規経路での正式確定を別の証拠として記録する。検証事例は RU の検証範囲の定め
      「主な検証事例はS1、S2、S4とする。」に対応づけて整理する（S1=小規模な一気通貫開発、S2=複数工程の段階開発、S4=次工程への情報引渡しと別セッション再開。事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」の「## 検証事例S1〜S6」節〔L553〜574〕による。case_open_hints 参照）。
    pass_criteria: |
      各事例で finalized 判定が後続実装・Issue・PR の不存在を理由に false にならず、正規経路の確定操作が後続工程を
      要求せず成立すること。独立設計書不採用案件で設計文書の作成が確定条件として強制されないこと。実装前の設計確定が
      設計成果物単独で成立すること。構造検査の成功と正規経路での正式確定が別区分の証拠として記録されていること。
    on_failure: |
      fix-and-reverify。判定条件・採用規約解決・正規確定経路のいずれに起因するかを区分して修正し、同検証を再実行する
  - id: TS-702
    target_item: AG-702
    verification: |
      3 事例を検証環境（検証 branch または一時検証用ディレクトリ）で構成する: (1) coverage 報告上は対応宣言が成立するが
      検証が失敗している事例（verification 対応はあるが該当検証の実行が失敗した記録を持つ事例）、(2) 検証資料が実在するが
      内容が不十分な事例（検証ファイルが実在するが対象の条件・受け入れ内容を立証しない事例）、(3) 必要な検証が実際に
      成立している事例。各事例について、finalize CLI の構造判定結果と、上流との内容整合および検証実態の内容評価
      （確定可否判断）を別区分（機械検査結果・内容評価・検証証拠）で記録し、確定可否の判断とその根拠・確認範囲を残す。
    pass_criteria: |
      事例 (1)(2) で構造判定や資料の存在だけを根拠にした確定可の判断が行われず、確定不可（根拠と確認範囲付き）となること。
      事例 (3) のみ確定可となること。内容整合と検証実態の確認結果が機械検査結果・内容評価・検証証拠の別区分で
      記録されていること。
    on_failure: |
      fix-and-reverify。確定可否判断の手順（基盤・運用 Design の当該節）または証拠記録区分の適用を修正し、同検証を再実行する
  - id: TS-703
    target_item: AG-703
    verification: |
      変更駆動: case-auto が駆動する正規 lifecycle の内部段階で、draft Design の確定フローを実行し、frontmatter status と
      docs/designs/README.md status 列の同時更新を再読込で確認する（単独の手動書込み・個別検査を公開経路の証明としない）。
      工程駆動: 利用者の確定指示に基づく REQ-111-006 の確定だけの独立終了経路で同じ確定状態の反映と一覧整合が成立することを
      確認する。判定器の区別: finalize CLI の finalized: true 出力を保持した状態で確定操作を実行しない場合、成果物の状態と
      一覧が変化しないことを確認する。両経路で権限外の状態変更（Design 保存内部責務による accepted 付与、手動の
      frontmatter 直接書換え等）が発生しないことを確認する。
    pass_criteria: |
      確定状態の反映が許可された正規の確定経路でのみ行われ、frontmatter と一覧・索引の整合が維持されること。
      finalized: true だけの状態で確定済みにならないこと。権限外の状態変更が 0 件であること。構造検査のみの成功と
      正規経路での正式確定が別区分の証拠として記録されていること。
    on_failure: |
      fix-and-reverify。確定経路の実装または確定状態反映の規律を修正し、同検証を再実行する
  - id: TS-704
    target_item: AG-704
    verification: |
      正式確定した成果物を後続工程で利用した後、正規の改訂経路で改訂する事例を実行する。改訂後の新しいセッションから、
      既存の正規情報・証拠チャネル（Case Issue の対応記録コメント、PR 本文、正規成果物）とGit履歴のみを入力として、
      対象取組、工程、確定対象、対象範囲、確定根拠、確定時のGitコミット（main 上のコミット。squash merge の場合は
      squash merge コミット）とその時点の内容（git show で取得）を再構成する。改訂前後の成果物を照合し、過去に確定した
      内容と現在の内容を区別して記録する。版台帳・確定履歴データベースを新設していないことも確認する。
    pass_criteria: |
      各構成要素（対象取組、工程、確定対象、対象範囲、確定根拠、確定時のGitコミットとその時点の内容）が既存情報のみから
      再構成できること。確定時コミットから過去の内容が取得でき、改訂後の現在内容を過去に確定した内容として扱っていないこと。
      新規の版台帳・確定履歴データベースが存在しないこと。
    on_failure: |
      fix-and-reverify。記録不足が判明した場合は正規の記録チャネル側（対応記録コメント・PR 本文等の記録規律）を修正して
      再検証する（版台帳の新設による解決は行わない）
  - id: TS-705
    target_item: AG-705
    verification: |
      3 事例を構成する: (a) 確定根拠が記録されていない成果物、(b) 対象版が特定できない成果物（複数の候補版が存在し
      確定時点を特定できない）、(c) 必要な情報の取得が失敗する成果物（記録チャネル不在・参照不能）。各事例で
      再構成手順を実行し、報告内容を確認する。
    pass_criteria: |
      3 事例のいずれでも、根拠のない確定状態・対象版の補完が行われず、不足区分（確定根拠の不足／対象版不明／
      必要な情報の取得失敗）と確認範囲が区別して報告されること。確定時点を特定できない事例で最新コミットを
      確定版とみなしていないこと。
    on_failure: |
      fix-and-reverify。再構成不能時の報告規律（基盤・運用 Design の当該節）を修正し、同検証を再実行する
  - id: TS-706
    target_item: AG-706
    verification: |
      設計成果物を正式確定した状態で後続実装・最終検証が未完了の事例を用いる。(1) finalize CLI の公開操作契約を実行し、
      requirementSatisfaction が常に not-assessed-by-this-tool である出力を取得する。(2) 工程遷移の状態が
      利用者判断による遷移記録（.agentdev/phase/transitions/ または変更駆動 lifecycle の状態）と独立に判定されることを
      確認する（確定状態から遷移の成立を自動推論しない）。(3) 最終要求充足の判定が case-close の QG-4 最終完了判定の
      正規経路に残ること（設計の正式確定だけを根拠に最終要求充足を合格にしない手続き）を確認する。
    pass_criteria: |
      成果物の確定・工程遷移・最終要求充足の 3 判定が分離して行われ、確定を根拠に工程遷移や最終要求充足が
      自動認定されないこと。finalize 出力の requirementSatisfaction が not-assessed-by-this-tool であること。
    on_failure: |
      fix-and-reverify。確定と遷移・要求充足の区別が崩れる箇所（判定条件・手順・状態規則のいずれか）を修正し、同検証を再実行する

# realization_actions: 実現面の変更方針（実現面確定の先送り禁止。コードレベルの作業計画は case-run の責務）
realization_actions:
  - id: RA-701
    concern: 正式確定の判定と正規の確定操作・確定状態の区別を、確定支援の正規所有の知識・判定規約へ反映する
    responsibility: |
      成果物の意味役割判定・確定支援の正規所有（agentdev-artifact-semantics）において、判定器 CLI 契約
      （finalized、designValidity: not-evaluated-by-this-tool、requirementSatisfaction: not-assessed-by-this-tool、
      副作用なし）を現行維持したうえで、判定結果が確定操作を伴わないこと・証拠評価の区分（構造的成立と検証実態）を
      skill の知識（SKILL.md、scripts README の判定規約）へ明記する
    ownership_hints:
      - src/common/skills/agentdev-artifact-semantics/SKILL.md（工程別正式確定と別判定、責務境界）
      - src/common/skills/agentdev-artifact-semantics/scripts/README.md（判定規約の要点、finalize CLI 実行方法）
      - docs/designs/foundations/v4-operating-model.md「意味境界の正規所有と工程別正式確定の区別」節（ACT-DESIGN-701）
    intent: 判定結果だけを確定完了・状態反映の根拠にしない呼出側規律を、確定支援の正規所有の知識として固定する
      （内容評価の機械判定器組込みは行わない）
    verification_refs: [TS-701, TS-702, TS-703, TS-706]
    source_items: [AG-702, AG-703, AG-706]
  - id: RA-702
    concern: 変更駆動経路の正規確定操作・確定状態反映と既存状態規則・一覧の整合維持
    responsibility: 変更駆動の Design 確定フローと Design 状態管理の正規所有（case-close の Design 確定フロー、
      agentdev-design-file-manager の Design lifecycle 規則）において、draft から accepted への昇格と status 列同時更新、
      昇格評価証跡の Issue 対応記録コメント保存、Design 保存内部責務は accepted を付与しない既存境界を維持したうえで、
      判定結果と確定操作の区別を既存確定経路へ接続する
    ownership_hints:
      - docs/designs/commands/case-close.md（Design 状態評価の棚卸し制、docs 検証の Design 確定フロー）
      - docs/designs/skills/agentdev-design-file-manager.md（accepted 昇格時の証跡保存、APPEND/UPDATE 操作契約）
      - docs/designs/responsibilities/document-type-responsibilities.md「成果物の意味境界の運用面と工程別正式確定」節（ACT-DESIGN-702）
      - docs/designs/foundations/v4-operating-model.md・docs/designs/responsibilities/document-type-responsibilities.md 冒頭の
        ADF-COVERS(design/implementation) 宣言への REQ-105-009〜014 追加（実装時の変更セットで行う）
    intent: 権限外の状態変更を生じさせず、判定器 finalized と正規確定操作の区別を変更駆動の既存確定経路に接続する
    verification_refs: [TS-703, TS-704]
    source_items: [AG-703, AG-704]
  - id: RA-703
    concern: 工程駆動経路の正規確定操作（要件のみ確定・設計のみ確定・実装前の設計確定・独立設計書不採用案件を含む）と既存確定権限・経路の維持
    responsibility: 工程駆動側の設計確定経路の正規所有（v51 工程駆動モデル）において、確定（Design の draft から accepted への
      昇格、Decision の状態遷移）の権限と経路を既存のまま維持し、成果物種別ごとの正式確定の独立性（REQ-105-009）を
      REQ-111-006/007 の確定だけの独立終了・確定済み設計からの実装接続と整合させる
    ownership_hints:
      - docs/designs/workflows/v51-phase-driven-collaboration-model.md（実行主体と責務境界、正規成果物への形成と全体像）
      - docs/designs/workflows/v51-phase-transition-and-coexistence-model.md（REQ-111-006/007 の設計対応、工程駆動の経路別所有境界）
      - docs/requirements/REQ-111-006（確定だけの独立終了の既有義務）
    intent: 工程駆動で後続実装を待たない正式確定が既存の正規確定経路で成立することを固定する（確定権限・経路の変更は行わない）
    verification_refs: [TS-701, TS-703]
    source_items: [AG-701, AG-703]
  - id: RA-704
    concern: 確定対象・範囲・根拠・版の再構成に用いる既存記録チャネルの運用と再構成不能時の区分報告
    responsibility: 確定時証跡の保存と Case 工程記録の正規所有（昇格評価証跡の Issue 対応記録コメント保存、
      Case Issue 工程記録モデル、durable state の再構成優先順位）において、確定時の main 上のコミットから内容を特定できる
      記録運用と、再構成不能時（確定根拠の不足・対象版不明・取得失敗）の区分報告を既存チャネルで成立させる。
      新規の版台帳・確定履歴データベースは新設しない
    ownership_hints:
      - docs/designs/skills/agentdev-design-file-manager.md「accepted 昇格時の証跡保存」節
      - docs/designs/workflows/issue-lifecycle-records.md（Case Issue 工程記録モデル）
      - docs/designs/foundations/v4-durable-state-and-recovery.md（SSoT 再構成・identifier 保持の再構成優先順位）
      - docs/designs/responsibilities/document-type-responsibilities.md「成果物の意味境界の運用面と工程別正式確定」節（ACT-DESIGN-702）
    intent: 別セッションから確定対象・範囲・根拠・確定時 Git コミットと内容を再構成でき、推測なしで不足を区別報告できる運用を
      既存チャネルで成立させる
    verification_refs: [TS-704, TS-705]
    source_items: [AG-704, AG-705]

# review_dispositions: 既存行・既存能力で充足・対象外と判断した RU 部分の処分
review_dispositions:
  - id: RD-701
    source_ru: RU-0257
    source_item: RU3-AC1-後続工程を待たずに正式確定できる（一般命題）
    disposition: covered
    reason_code: already_satisfied
    reason: |
      「各工程の成果物は、当該工程の要求充足、上流整合、必要な検証の成立をもって、後続工程を待たずに正式確定できること」は
      REQ-105-006 がすでに所有する。要件のみの確定・設計のみの確定・実装前の設計確定の一般命題も同行に含まれるため
      新行で再記述しない。確定条件レベルの禁止規定の増分のみ AG-701/REQ-105-009 として追加する
    evidence:
      path: docs/requirements/REQ-105.md
      section: 要件（REQ-105-006）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-702
    source_ru: RU-0257
    source_item: RU3-AC1-独立設計書不採用案件の設計根拠成立
    disposition: covered
    reason_code: already_satisfied
    reason: |
      設計責務の成立が独立 Design 文書の存在に一律依存しないこと（REQ-105-002）、必須採用時の欠落検出（REQ-105-003）、
      未採用参照例の欠落誤判定禁止（REQ-104-004）がすでに所有する。本 RU の増分は確定条件レベルの強制禁止
      （REQ-105-009 の後段）に限定した
    evidence:
      path: docs/requirements/REQ-105.md
      section: 要件（REQ-105-002、REQ-105-003）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-703
    source_ru: RU-0257
    source_item: RU3-AC6-正式確定と最終要求充足の別判定
    disposition: covered
    reason_code: already_satisfied
    reason: |
      正式確定と最終的な要求充足の別判定は REQ-105-007 がすでに所有する。本 RU の増分は工程遷移・工程全体の完了との
      区別（REQ-105-014）のみとし、REQ-105-007 は再定義しない
    evidence:
      path: docs/requirements/REQ-105.md
      section: 要件（REQ-105-007）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-704
    source_ru: RU-0257
    source_item: 工程遷移そのもの
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0257 の対象外に「工程遷移そのもの」が明記され、同じ第2段階の RU-0258 が工程遷移を所有する。
      本 draft は遷移の定義を行わず、成果物の確定と工程遷移の区別（REQ-105-014）のみを扱う。工程遷移の既有義務は
      REQ-111-002 等が所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0257.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-705
    source_ru: RU-0257
    source_item: 工程全体の自動完了認定
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU 対象外であり、工程全体の完了・遷移は利用者の判断による単独操作として REQ-111-002 が正規所有する。
      本 draft はこの区別を維持する行（REQ-105-014）と検証（TS-706）のみを追加し、工程全体の完了認定の
      自動化を導入しない
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要求 (REQ-111-002)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-706
    source_ru: RU-0257
    source_item: 意味的判断すべての機械判定器への組込み（RU 対象外の拒否事項）
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU 対象外のとおり、意味的な内容評価の機械判定器への組込みは行わない。artifact-semantics 判定器の構造保証
      （designValidity: not-evaluated-by-this-tool、requirementSatisfaction: not-assessed-by-this-tool）と REQ-096 の
      判断方法3分類がこの境界をすでに所有しており、本 draft の Design 内容（ACT-DESIGN-701）も内容評価を
      閉じた意味判断として判定器外に維持する
    evidence:
      path: src/common/skills/agentdev-artifact-semantics/SKILL.md
      section: 設計責務の判定・工程別正式確定と別判定（構造保証）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-707
    source_ru: RU-0257
    source_item: 正式確定を理由とする最終要求充足の自動認定
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU 対象外であり、REQ-105-007 と case-close の QG-4 最終完了判定（document-type-responsibilities Design 当該節）が
      正規所有する区別である。本 draft はこの区別を維持する行（REQ-105-014）と検証（TS-706）のみを追加し、
      最終要求充足の自動認定を導入しない
    evidence:
      path: docs/designs/responsibilities/document-type-responsibilities.md
      section: 成果物の意味境界の運用面と工程別正式確定（REQ-088-006、REQ-105）
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（本定義実行では組立 script を使用していない）
assembly_evidence: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - |
      検証事例 S1・S2・S4 の出所注記: S1=小規模な一気通貫開発、S2=複数工程の段階開発、S4=次工程への情報引渡しと
      別セッション再開。事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md
      （題「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」、626行、冒頭に「新しい要求、
      受け入れ条件、合格基準ではない」と明記）の「## 検証事例S1〜S6」節（L553〜574）にある。RU-0257 と段階条件の
      対応は同資料「各RUと段階条件の対応（参照用）」（L613〜626）の P2・P3（合格基準を置き換えない。RU個別条件の
      合格が段階条件の合格を自動証明するわけではない）。RU-0257「検証範囲と証拠」の「主な検証事例はS1、S2、S4と
      する。」の文言は原文どおり保持している。
    - docs/designs/foundations/v4-operating-model.md・docs/designs/responsibilities/document-type-responsibilities.md の
      ADF-COVERS(design/implementation) 宣言への REQ-105-009〜014 追加は、実装の変更セットで併せて行う。
    - OU-702・OU-703（Design 節更新）は REQ-105-009〜014 の保存（OU-701）を前提とする（covers 参照の実在前提）。
```

# summary

REQ-105 への正式確定の判定・操作・状態・根拠・版の一貫性の増分 6 行（REQ-105-009〜014）と、基盤モデル・運用面両 Design の当該節への増分反映を合意した。既存状態規則・判定器・確定経路を再利用し、版台帳の一律新設と意味判断の機械判定器組込みは行わない。検討経緯や不採用方針の詳細は処理の原本（# draft-data YAML ブロック）を参照。
