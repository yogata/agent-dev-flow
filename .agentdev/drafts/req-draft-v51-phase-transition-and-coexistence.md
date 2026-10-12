---
draft_type: req_draft
topic_slug: v51-phase-transition-and-coexistence
status: draft
created_at: 2026-10-12T14:47:02+09:00
source_rus:
  - RU-0002
---

<!-- req_draft テンプレート準拠の完了ドラフト（NFR ゲート解消後）。
 後続工程の原本は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
 NFR ゲート（REQ-004-050〜053）は Supervisor 経由の利用者確認（2026-10-12）により解消済み。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  RU-0002（ADF v5.1.0 工程遷移・独立レビューと有限実行の接続）の要件定義ドラフトである。
  新規REQ（v51-phase-transition-and-coexistence、採番規則による割当て）の作成、REQ-005-001/010/011 の競合解消 UPDATE、Decision（工程遷移と双経路併存モデルの採用）の新設、Design（v51-phase-transition-and-coexistence-model）の新設、v4-standard-lifecycle と v4-v5-crosswalk の更新を定義する。
  合議の権威情報源は .agentdev/backlog/req-units/RU-0002.md の Source Summary と「現行 REQ-005 との競合解消に求める結果（既存合意からの導出）」である。RU-0002 は RU-0001 に必須依存する。
  NFR ゲート（REQ-004-050〜053）の連動項目は RU-0001 側と同一の Supervisor 経由の利用者確認（2026-10-12）により解消した。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      独立した phase-review は既定要求・成果物・検証証拠を調べるが、工程全体の完了を認定しない。確定違反・証拠不足・推測・未採用改善候補を区別し、構造上の成立だけで要求充足や工程完了を断定しない。レビューの深さを必須基準化しない。
  - id: AG-002
    content: |-
      工程の完了・遷移は利用者の判断である。参考の懸念を根拠付きで伝え、必要なら再確認するが、利用者が続行を選べば推論だけで止めない。書込み・工程特定の技術的失敗を成功扱いせず、実際に成立した現在工程を再開時に復元する。
  - id: AG-003
    content: |-
      工程遷移では既知義務だけを引き継ぐ。追加候補は案Aにより次工程の初回 phase-tasks-create 側で提供し、その成功を遷移成立条件にしない。終端で架空工程を作らず、複数候補では利用者選択を求め、前置工程の既知義務と未確認範囲を欠落させずに伝える。遷移後の初回候補生成の未完・失敗が遷移の完了を取消さない。
  - id: AG-004
    content: |-
      工程の単独作業は有限終了し、確定済み設計から最新の実リポジトリへ実装・検証を接続する。過去の完了済み工程を改訂しても現在工程を巻戻さず、実依拠版で必要な下流対応を追う。対応関係宣言ゼロ・正味差分ゼロを無影響の証明とせず、比較不能な対象は未確認とする。
  - id: AG-005
    content: |-
      v4 変更駆動に相当する独立の利用経路を v5.1.0 でも維持する。機能要求・バグ・エラーログの直接入力からの要件化、RU を経た要件化、Epic / Wave を含む依存実行、既存定義の再合意改訂、実 Git 変更と証拠、中断・失敗・再開、GitHub / Local と工程駆動成果物の再利用の各能力を失わせない。いずれの経路も工程駆動の4操作・工程遷移を前置必須としない。旧コマンド名・旧内部構造の一致は合否条件としない。
  - id: AG-006
    content: |-
      工程駆動の4操作と工程遷移は GitHub 版・Local 版の両方の正規利用経路から実行可能とする。GitHub の Issue / PR を Local に強制せず、Local の成功報告を実 Git 結果なしに確定しない。
  - id: AG-007
    content: |-
      現行利用経路の権威は REQ-108-012 に従う。意味を引き継ぐ後継経路が実現・採用されるまで旧経路（現行経路）を失効させず、RU 案や実装計画ができたことだけで旧経路の権威が失効したと扱わない。「v4 変更駆動を残す」とは旧コマンド名や旧内部構造の凍結ではなく、外部的な作業結果と必要な検証義務を v5.1.0 の正規経路から引き続き成立させることを意味する。
  - id: AG-008
    content: |-
      REQ-005 との競合解消の結果条件（既存合意からの導出）。REQ-005-001 は、工程駆動の独立操作に Root Case や case-auto の内部段階を一律必須化しない範囲へ記述を限定する。REQ-005-010 は、全公開入口が2つでいずれも case-auto へ合流するという排他的規則を、工程駆動の利用者向け独立操作と両立する形に見直す。REQ-005-011 は、工程駆動の別公開経路を一律禁止する文言を解消し、旧形式の廃止だけで外部的な変更駆動能力を失わせない。これらは新規の内部統制を要求するものではなく、既に合意した二つの開発形態と現行規範の間の矛盾を解消する結果条件である。
  - id: AG-009
    content: |-
      実現手段の抑制（合意済み方針）。工程遷移は利用者の意思決定を保持する最小限の操作とし、WBS・予算・要員・進捗管理の新設を伴わない。phase-review を必須完了ゲートとせず、既存の有効な要求・証拠の確認能力を再利用する。上流依拠・差分・追跡・移行・Local の既存契約は REQ-106/107/109/009 を利用し、新しい全版台帳・汎用依存グラフ・共通工程採点器を必須にしない。各受け入れ条件の証明を満たす限り複数条件で共通の実利用試験・証拠を利用できる。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:v51-phase-transition-and-coexistence
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-009]
    content: |-
      ---
      id: REQ-111
      title: "ADF v5.1 工程遷移・独立レビューと変更駆動併存"
      created: "2026-10-12"
      updated: "2026-10-12"
      ---

      ## 目的

      工程駆動における利用者判断による工程遷移、独立レビュー、確定済み設計からの実装接続、および変更駆動経路の維持・接続の利用契約を所有する。工程の進捗と完了の判断は利用者が担い、ADF は工程全体の完了認定を行わない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-111-001 | 独立レビューは単独で起動でき、既定要求・成果物・検証証拠と照合し、テーマ一覧の解消状態だけを根拠に問題なしと判定しないこと。所見は確定違反・証拠不足・推測・未採用改善候補を区別し、工程全体の完了を認定しないこと |
      | REQ-111-002 | 工程の完了・遷移は利用者の判断による単独操作とし、参考の懸念は具体的な事実と推測を区別して必要な場合のみ再確認し、利用者が続行を選べば推論だけで止めないこと。遷移は前工程を完了済みの過去工程として一回だけ実行し、取消の場合は現在工程を維持すること |
      | REQ-111-003 | 対象工程の解決不能・永続切替の書込失敗・中断後の同一要求再実行では、利用者の工程完了判断と技術的切替を分離し、未成立部分を報告し、確定した遷移だけを復元して二重実行を防ぐこと。書込み・工程特定の技術的失敗を成功扱いしないこと |
      | REQ-111-004 | 採用済みの工程関係が後続0件・1件・複数件、前置工程が複数件の各条件に対し、終端で架空の工程を作らず、複数候補では利用者選択を求め、前置工程の既知義務と未確認範囲を欠落させずに伝えること |
      | REQ-111-005 | 工程遷移の成立後、現在工程と既知義務は次工程の初回テーマ形成が未実施・失敗でも参照を維持し、初回形成の成否が遷移の完了を取り消さないこと |
      | REQ-111-006 | 利用者が要件の確定だけまたは設計の確定だけを指示した場合、対象の有限作業を適切な正規成果物・技術的根拠とともに独立して終了でき、Issue・PR・後続実装を一律に要求しないこと |
      | REQ-111-007 | 利用者が確定済み詳細設計と有限な実装対象・既存検証条件を指示した場合、要件定義へ無条件に戻らず、最新の実リポジトリの実装対象・依存・証拠を確認して実装・検証に接続すること。未検証の結果は未検証として扱うこと |
      | REQ-111-008 | 完了済み過去工程の正規改訂は、下流が実際に依拠した版と現行版の差を起点に必要な下流更新・再検証へ接続し、現在工程を巻き戻さないこと。中間工程の更新必要・不要・作成・未確認の区別と理由を残し、処理失敗時は現在工程までの全反映完了を宣言せず再開可能な情報を示すこと。対応関係・正味差分のゼロを無影響の証明としないことは REQ-106 の既有義務に従うこと |
      | REQ-111-009 | 機能追加・バグ報告・エラーログの直接入力、RU を経由する要件化、意味的依存を持つ複数作業・Epic/Wave、工程駆動で形成した成果物への後続変更の各経路を、工程駆動の操作・工程遷移を前置必須とせずに実行できること。旧コマンド名・旧内部構造の一致を合否条件としないこと |
      | REQ-111-010 | v4 で有効な変更駆動の能力群（直接要求・障害からの要件化、発見・学習から RU を経た入口、小規模/Epic/Wave の依存実行、既存合意の正規改訂、実変更・証拠・安全境界、中断・失敗・再開、GitHub/Local・工程駆動成果物の再利用）の外部的結果と検証義務を、v5.1.0 の正規経路でも成立させること。各能力群の検証は実装着手時の有効な正規契約の外部的結果を基準とすること |
      | REQ-111-011 | 工程駆動の4操作と工程遷移は、GitHub 版と Local 版の両方の正規利用経路から実行できること。Local 版で実装作業を伴う場合は、ローカル記録と実 Git 取り込み結果を独立して突合でき、成功報告だけでは確定しないこと |
      | REQ-111-012 | 中断した有限作業の再開は、実際の未完了を識別して必要な範囲だけ継続し、実装・検証の未成立を成功として報告しないこと（REQ-108-006 の既有義務に従い、工程駆動経路での適用を明示する） |
      | REQ-111-013 | 意味を引き継ぐ後継経路が実現・採用されるまで旧経路を失効させないこと。移行期は REQ-108-012 に従い現行利用経路を正として維持し、REQ-005-001/010/011 の改訂は後継経路の実現・採用と同じ変更セットで確定すること |

      ## 適用範囲

      - **対象**: 独立レビューの所見区分、利用者判断による工程遷移とその技術的分離、工程関係の解決、有限作業の独立終了、確定済み設計からの実装・検証接続、完了済み過去工程の改訂と影響伝播、変更駆動経路の独立維持と能力群の意味保存、4操作と工程遷移の GitHub/Local 両対応、移行期の権威継続
      - **対象外**: ADF による工程全体の完了・深度の採点、新しい工程進捗台帳、独立レビューの必須ゲート化、旧 phase-plan 第5操作や遷移直後の自動補助起動、全成果物の再生成・汎用依存グラフ、v4 の公開APIの恒久的互換保証、旧コマンドAPIを再現する無制限な互換開発、Local 通し動作の実施と v4→v5 移行実証（計画段階の対象外。新4操作への Local 適用義務と既存 REQ-009/109 の証明義務は維持）

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    target_area: 要件
    source_items: [AG-007, AG-008]
    content: |-
      【old_text】
      | REQ-005-001 | ワークフローは壁打ち、構造的実行、レビュー完了の3つのマクロフェーズで構成すること。構造的実行フェーズは Root Case 確立後の Definition 確定、実行準備、実装、進捗管理までを含むこと。構造的実行フェーズの工程（case-open、case-ready、case-run、case-close、例外経路の case-revise）は内部 lifecycle として case-auto が駆動すること。現在工程を Issue に保存せず、進行は Root Case の正規状態と Epic の実行構成で表現すること |

      【new_text】
      | REQ-005-001 | 変更駆動経路のワークフローは壁打ち、構造的実行、レビュー完了の3つのマクロフェーズで構成すること。構造的実行フェーズは Root Case 確立後の Definition 確定、実行準備、実装、進捗管理までを含み、その工程（case-open、case-ready、case-run、case-close、例外経路の case-revise）は内部 lifecycle として case-auto が駆動すること。現在工程を Issue に保存せず、進行は Root Case の正規状態と Epic の実行構成で表現すること。工程駆動経路の独立操作に Root Case や case-auto の内部段階を一律必須としないこと |
    note: |-
      組立検査済み（assembly_evidence AE-001）。既存文面との照合は assemble-draft-section で検証（old_text 出現1件、適用後0件、行数整合）。

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    target_area: 要件
    source_items: [AG-008]
    content: |-
      【old_text】
      | REQ-005-010 | 全公開 command は要求入口、標準実行コマンド、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること。要求入口は req-define（requirements-driven）と backlog-auto（backlog-driven）の2つとし、両経路とも実行は case-auto へ合流すること。case-open、case-ready、case-run、case-close、case-revise は公開 command ではなく内部 lifecycle 段階とし、内部状態遷移の手動順次実行を公開 UX の標準としないこと |

      【new_text】
      | REQ-005-010 | 全公開 command は要求入口、標準実行コマンド、工程駆動実行、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること。要求入口は req-define（requirements-driven）と backlog-auto（backlog-driven）の2つとし、両経路とも実行は case-auto へ合流すること。工程駆動の公開操作（テーマ初回形成、テーマ更新、正規成果物への反映、独立レビュー）と利用者判断による工程遷移は工程駆動実行に分類し、case-auto の内部 lifecycle と混同しないこと。case-open、case-ready、case-run、case-close、case-revise は公開 command ではなく内部 lifecycle 段階とし、内部状態遷移の手動順次実行を公開 UX の標準としないこと |
    note: |-
      組立検査済み（assembly_evidence AE-002）。分類名「工程駆動実行」は REQ-101 等の既存語彙「工程実行契約」との衝突を避けるため工程駆動を明示した命名（アーキテクチャ助言の採用）。

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    target_area: 要件
    source_items: [AG-008]
    content: |-
      【old_text】
      | REQ-005-011 | case-auto は標準実行コマンドとして標準経路（req-define → case-auto）を構成すること。標準経路を置換する別の公開実行経路を新設しないこと |

      【new_text】
      | REQ-005-011 | case-auto は変更駆動の標準実行コマンドとして標準経路（req-define → case-auto）を構成すること。工程駆動実行の公開経路は標準経路を置換するものではなく、変更駆動の連続実行能力を保持した別経路として併存すること。旧形式の廃止だけで外部的な変更駆動能力を失わせないこと |
    note: |-
      組立検査済み（assembly_evidence AE-003）。

  - id: ACT-DECISION-001
    artifact: decision
    operation: create
    target: new:v51-phase-transition-and-coexistence
    source_items: [AG-002, AG-003, AG-007, AG-008, AG-009]
    content: |-
      【decision 要素】
      title: 工程遷移と双経路併存モデルの採用（REQ-005-001/010/011 改訂を含む）
      context: 工程駆動の公開操作と利用者判断による遷移が、現行 REQ-005 の要求入口2つ・case-auto 合流・別経路不新設の規則と衝突する。v4→v5 crosswalk は REQ-005-001/010/011 を優先棚卸し行（処遇 defer）として記録している。
      decision: 変更駆動（req-define → case-auto）と工程駆動（4操作＋利用者判断の遷移）の双経路併存を採用する。REQ-005-001 は旧3マクロフェーズ記述を変更駆動経路の有効能力の記述へ限定し、工程駆動の独立操作に Root Case・内部 lifecycle を一律必須としない。REQ-005-010 は公開分類へ「工程駆動実行」を追加する。REQ-005-011 は工程駆動実行の公開経路を標準経路の置換ではなく別経路の併存とする。工程遷移は利用者の判断による単独操作とし、独立レビューは工程完了の必須ゲートとしない。
      consequences: REQ-005-001/010/011 の改訂と v4-v5-crosswalk の処遇解消（defer から解消）は同一変更セットで行う。正規改訂の確定は後継経路の実現・採用時点（v5.1.0 実装 Case のマージ）であり、REQ-108-012 の移行順序に従う。旧形式の廃止だけで外部的な変更駆動能力を失わせない。
      relates-to: DEC-053, DEC-054, DEC-055, DEC-056, new:v51-phase-driven-collaboration
      出所: RU-0002 Source Summary と「現行REQ-005との競合解消に求める結果」（2026-10-12 利用者承認）。アーキテクチャ助言の採用（親エージェント分類）。NFR 条件の連動解消は Supervisor 経由の利用者確認（2026-10-12）。

  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target: new:v51-phase-transition-and-coexistence-model
    target_design:
      operation: create
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-009]
    content: |-
      【design 要綱】v51-phase-transition-and-coexistence-model（工程遷移・独立レビュー・双経路併存モデル）
      - 工程遷移の状態モデル（一回だけの遷移実行、取消時の現在工程維持、完了済み過去工程の扱い、技術的失敗と完了判断の分離、中断後の同一要求再実行の冪等性）
      - 独立レビューの所見区分（確定違反・証拠不足・推測・未採用改善候補）の判定表と提示形式。工程完了の必須ゲートとはしない運用
      - 工程関係の解決手順（後続0/1/複数件、前置工程複数件の解決、利用者選択の要求形式、前置の既知義務と未確認範囲の伝達）
      - 有限作業の独立終了と、確定済み詳細設計から最新実リポジトリへの実装・検証接続の手順（要件定義へ戻る条件の定義、case 系実行契約 REQ-030/031/032/034 領域との接続）
      - B16 能力群（7群）対応表の検証時運用（RU-0002 本文の対応表を検証時参照として利用）
      - phase-review の所見と外部AI戻り入力の Intake/Learning 経路との非同一化（intake inbox への自動投入とせず、採用根拠を要する受理経路として区別する）
      - 実行主体分類: 独立レビュー・工程遷移・実装接続の各操作について adapter skill / command / subagent / harness の別と責務境界

  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/v4-standard-lifecycle.md
    target_design:
      operation: update
      domain: workflows
      slug: v4-standard-lifecycle
    target_area: 公開 UX と内部 lifecycle の分離
    source_items: [AG-007, AG-008]
    content: |-
      【更新要綱】
      - 「公開 UX と内部 lifecycle の分離」節: 2中心フロー（req-define → case-auto、backlog-auto → req-define → case-auto）の定義を、変更駆動経路の定義として明示した上で、工程駆動実行の公開経路（4操作＋利用者判断による工程遷移）を別経路として併存させる双経路併存モデルへ書き換える
      - 「主要責務の正規所有者一覧」（REQ-103-014 に基づく表）: 工程駆動ルートにおける正規成果物の保存・確定の経路別所有境界、および Design の昇格（draft から accepted）の工程駆動版を追記する。変更駆動ルートの case-ready/case-revise/case-close の所有は現行のまま
      - 更新は v5.1.0 の要件確定（新規REQ v51-phase-transition-and-coexistence と REQ-005-001/010/011 改訂）と同じ変更セットで行う

  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_design:
      operation: update
      domain: foundations
      slug: v4-v5-crosswalk
    target_area: REQ-005-001/010/011 の棚卸し行
    source_items: [AG-007, AG-008]
    content: |-
      【更新要綱】
      - REQ-005-001/010/011 の処遇を defer から解消（replace）へ更新し、根拠として v5.1.0 の要件確定（Decision: v51-phase-transition-and-coexistence、REQ-005-001/010/011 改訂）を記録する
      - 解消の確定は後継経路の実現・採用時点（v5.1.0 実装 Case のマージ）であり、REQ-108-012 の移行順序に従う旨を記録する

conflict_resolutions:
  - id: CR-001
    content: |-
      NFR ゲート（REQ-004-050〜053）の連動項目の解消。本 RU のうち外部AI戻り入力の解釈・受理を経由する接続（B13 の受領接続、RU-0001 側 AG-006 と連動）は、RU-0001 側と同一の利用者回答（適用対象とする。処理量上限は入力サイズに対する線形走査 O(n)、出力上限は明示採用件数に対して線形の証跡量、失敗挙動は fail-closed）により解消される。持出し構成は適用対象外。判断の出所: Supervisor 経由の利用者確認（2026-10-12）。
  - id: CR-002
    content: |-
      REQ-005-001/010/011 の旧入口規則と工程駆動の独立公開経路の競合。UPDATE で解消する（変更駆動能力の記述への限定、公開分類への「工程駆動実行」の追加、別経路併存の明確化）。crosswalk の処遇解消を同一変更セットで行う。正規改訂の確定は後継経路の実現・採用時点（v5.1.0 実装 Case のマージ）であり、REQ-108-012 の移行順序（後継成立前に旧経路を失効させない）に従う。出所: RU-0002「現行REQ-005との競合解消に求める結果」+ アーキテクチャ助言の採用。
  - id: CR-003
    content: |-
      traceability policy の検証対応の扱い（REQ-005-001 と REQ-005-011 は optional 登録、REQ-005-010 は登録なし＝検証対応必須）。更新後の3行とも検証対応を維持し、REQ-005-010 の分類規則変更（6分類化）は TS-014 で検証する。出所: traceability/policy.yaml の確認（2026-10-12）。
  - id: CR-004
    content: |-
      REQ-009（Local）との境界。4操作・工程遷移の Local 版への適用義務は新規REQ（REQ-111-011）に明記し、REQ-009 へは重複定義しない。REQ-009 は52行で肥大化帯（SPLIT 閾値 51〜80行）にあり、追加 APPEND は SPLIT 検討を要するため、v5.1.0 固有の接続義務は新規REQ 側に置く。出所: RU-0002 主対象REQ節 + req-health-metrics の SPLIT 閾値。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: new:v51-phase-transition-and-coexistence
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-005
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001（独立レビューの所見区分、RU-0002 B01/B02）
    verification: 既知違反を持つ資料、必要な検証証拠がない資料、LLM の推測、未採用改善案、比較的浅くとも採用範囲内の資料を混在させ、独立レビューを単独起動して出典・該当条件と観測結果を確認する。
    pass_criteria: テーマ一覧外の違反候補が根拠付きで示され、所見が確定違反・証拠不足・推測・未採用改善候補として区別され、構造上の成立だけで要求充足・工程完了が断定されず、深さが必須基準化されない（finalized:true だけでの全項目合格、未採用改善案に基づく不合格が発生しない）。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002（工程遷移の利用者判断、B03）
    verification: 利用者が工程の終了を判断し遷移を指示する条件で、参考懸念がある／ない、警告後に続行／取消の対照を作り、各ケースで現在工程・過去工程の扱い・再確認と報告を突合する。
    pass_criteria: 事実と推測が区別され必要な場合のみ再確認され、続行時に前工程が完了済みの過去工程として一回だけ遷移され、取消時に現在工程が維持され、LLM の推測による遷移拒否や「未完了の過去工程」状態の自動作成が発生しない。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-002（技術的失敗と完了判断の分離、B04）
    verification: 対象工程解決不能、永続切替の書込失敗、中断後の同一要求再実行を障害注入で作り、実際の保存済み現在工程と報告を照合し、再実行の前後を比較する。
    pass_criteria: 未成立部分が報告され、確定した遷移だけが復元され、二重実行が発生せず、切替未保存が成功扱いされない。
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: AG-003（工程関係の解決、B05）
    verification: 採用済み工程関係が後続0件／1件／複数件、前置工程が複数件の4条件を切替え、選択・引継ぎ結果の正確性を比較する。
    pass_criteria: 終端で架空工程が作られず、1件で一意解決され、複数候補で利用者選択が要求され、前置工程の既知義務と未確認範囲が欠落しない。
    on_failure: fix-and-reverify
  - id: TS-005
    target_item: AG-003（遷移と初回形成の独立性、B06）
    verification: 遷移成立後に次工程の初回テーマ形成を未実施のまま、および失敗させる条件で別セッションへ再開し、現在工程と既知義務を確認する。
    pass_criteria: 現在工程と既知義務が参照を維持し、初回形成の未完・失敗が遷移の完了を取り消さず、旧工程への巻戻しが発生しない。
    on_failure: fix-and-reverify
  - id: TS-006
    target_item: AG-004（有限作業の独立終了、B07）
    verification: 利用者が要件の確定だけ、または設計の確定だけを指示し、後続実装を依頼しない条件で、それぞれの公開利用経路から独立終了までを確認する。
    pass_criteria: 対象有限作業が適切な正規成果物・技術的根拠とともに終了し、不必要な実装・Issue・PR が発生しない（設計だけの依頼で case-auto 相当の全自走へ進めない）。
    on_failure: fix-and-reverify
  - id: TS-007
    target_item: AG-004（確定済み設計からの実装接続、B08）
    verification: 確定済み詳細設計と有限な実装対象・既存検証条件を指示し、ADF の入口から実ファイル変更、検証実行、元条件への照合までを追う。
    pass_criteria: 要件定義への無条件の戻りがなく、最新実リポジトリの実装対象・依存・証拠が確認されて実装・検証に接続され、未検証結果が未検証として扱われ、手動Git成功やPRマージだけでの全体合格が発生しない。
    on_failure: fix-and-reverify
  - id: TS-008
    target_item: AG-004（完了済み過去工程の改訂と影響伝播、B09/B10/B11）
    verification: 要件R1を根拠に基本B1・詳細D1が作られた後、利用者がR2を明示採用する条件、基本設計が更新不要の中間工程、基本設計反映後の処理失敗、対応関係表ゼロ・正味差分ゼロだが途中版に依拠する下流・旧証拠再利用の対照を作り、R1・R2・B1・D1の実参照と反映前後の成果物・証拠を突合する。
    pass_criteria: 実依拠版起点の必要な下流更新・再検証へ接続され、現在工程が巻き戻らず、更新必要・不要・作成・未確認の理由が残り、処理失敗時に全反映完了が宣言されず、対応ゼロ・差分ゼロが無条件の無影響扱いにならない（REQ-106 の一般義務との区別を含む接続契約の検証）。
    on_failure: fix-and-reverify
  - id: TS-009
    target_item: AG-005（変更駆動4経路の独立維持、B12）
    verification: 同じシステムに対して、(a)利用者の機能追加・バグ報告・エラーログの直接入力、(b)backlog-auto 相当が生成した RU の投入、(c)意味的依存を持つ複数作業・Epic/Wave を必要とする変更、(d)工程駆動で形成した成果物を対象とする変更の4経路を v5.1.0 の正式な公開入口から通し実行する。
    pass_criteria: 各経路が工程駆動の4操作・工程遷移を前置必須とせず成立し、(a)は原因分析・要件化から実装・検証へ、(b)は RU から要件化・実行へ無断直結なく、(c)は未充足依存を越えず、実Git結果と各入力の受け入れ条件に対する検証が追跡される。工程駆動を使用しない (a)〜(c) の外部的成果の成立で合格となる。
    on_failure: fix-and-reverify
  - id: TS-010
    target_item: AG-004 と AG-005（統合通しの接続、B13）
    verification: 同一対象で工程開始→テーマ作成・独立更新→外部AIからの受領→成果物の複数回反映→全体像再構成→利用者遷移→確定済み設計から実装・検証→変更駆動を実施し、テーマ・正規成果物・遷移・Git・検証結果を同一対象で追跡する。
    pass_criteria: 各操作の正規出力・受領入力・依拠版・証拠が後続に有効に接続され、局所成功だけでの全体完了宣言が行われない。
    on_failure: fix-and-reverify
  - id: TS-011
    target_item: AG-004（中断・外部依存失敗の再開、B14）
    verification: 外部依存失敗・委譲停止・処理中断のある有限作業を再開し、再開前後の正規入力・実作業状態・必要な検証証拠を照合する。
    pass_criteria: 実際の未完了が識別されて必要範囲だけ再開され、停止が成功状態に変換されず、再試行で二重実装が発生しない（REQ-108-006 の工程駆動経路での適用）。
    on_failure: fix-and-reverify
  - id: TS-012
    target_item: AG-006（GitHub・Local 両対応、B15）
    verification: GitHub 版と Local 版に同じ採用工程・合意済み入力を用意し、4操作、工程遷移、別セッション再開をそれぞれ実行する。Local で実装作業を伴う場合は、ローカルIssue記録と実Git取り込みが食い違う障害例も用意する。
    pass_criteria: 4操作と工程遷移が両版の正規利用経路から実行可能で、正規成果物への反映・判断権限・未確認・再開の意味が保たれ、GitHub の Issue/PR が Local に強制されず、Local の成功報告だけでは確定せず、ローカル記録と実Git変更の独立突合が成立する。GitHub 成功だけでは Local が合格扱いにならない。
    on_failure: fix-and-reverify
  - id: TS-013
    target_item: AG-005（v4変更駆動能力群の意味保存、B16）
    verification: 7能力群（直接要求・障害からの要件化、発見・学習からRUを経た入口、小規模/Epic/Wave の依存実行、既存合意の正規改訂、実変更・証拠・安全境界、中断・失敗・再開、GitHub/Local・工程駆動成果物の再利用）と適用REQを事前に対応付け、B12 の正常経路と失敗・中断等の対照を正規利用入口から実行する。
    pass_criteria: 各能力群の外部結果・根拠が突合され、未対応の有効な外部要求が未検証と記録され、共通の実利用証跡が複数条件で再利用され、工程駆動の開始が旧変更駆動の必須前処理にならず、既存の完了証跡の要求が弱体化されない。全REQ行の個別通し試験や旧内部処理の完全再現は要求しない。
    on_failure: fix-and-reverify
  - id: TS-014
    target_item: AG-008（REQ-005-001/010/011 更新行の検証。検索系検証）
    verification: 全公開コマンドの棚卸しリスト（README コマンド索引・コマンドリファレンス・command-selection ガイドから機械抽出）を作成し、REQ-005-010 更新後の6分類（要求入口、標準実行コマンド、工程駆動実行、補助フロー、検出フロー、repo-local 検査）への割当てを照合する。v4-standard-lifecycle Design の双経路併存記述と crosswalk の処遇解消記録との整合を確認する。移行期条項について旧経路の変更駆動能力の維持を確認する。網羅範囲と修正対象の列挙を一致させる。
    pass_criteria: 全公開コマンドが6分類のいずれかに一意に分類され、工程駆動の4操作と利用者判断の遷移が工程駆動実行に分類され、案内文書・Design・crosswalk が更新後の定義と矛盾せず、旧経路の変更駆動能力が維持されている。
    on_failure: fix-and-reverify

realization_actions:
  - id: RA-001
    concern: 独立レビュー操作の実現面
    responsibility: 独立レビュー（phase-review 相当）の Workflow Skill 実装本体と所見区分の提示形式
    ownership_hints: src/common/skills/ 配下の新規スキル。必須ゲート化しない運用は Design（v51-phase-transition-and-coexistence-model）
    intent: REQ-111-001 の外部契約を成立させる
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: 工程遷移操作の実現面
    responsibility: 遷移状態の保存と一回実行の制御、後続0/1/複数・前置複数の解決、取消時の現在工程維持
    ownership_hints: 工程駆動の状態領域は RU-0001 側 RA-002 と共通の domain state 配置
    intent: REQ-111-002〜005 の外部契約を成立させる
    verification_refs: [TS-002, TS-003, TS-004, TS-005]
    source_items: [AG-002, AG-003]
  - id: RA-003
    concern: 確定済み設計からの実装接続の実現面
    responsibility: 既存 case 系実行契約（REQ-030/031/032/034 領域）との接続方式、要件定義へ戻る条件の実装、有限作業の独立終了
    ownership_hints: src/common/skills/ の case 系 workflow skill 群および新規工程駆動スキルとの接続。Design が手順を所有
    intent: REQ-111-006〜008、REQ-111-012 の外部契約を成立させる
    verification_refs: [TS-006, TS-007, TS-008, TS-011]
    source_items: [AG-004]
  - id: RA-004
    concern: 配布ドキュメント・案内の整合
    responsibility: README コマンド索引、コマンドリファレンス、コマンド選択ガイド、成果物と状態モデル（.agentdev/README.md 含む）への工程駆動実行の追記
    ownership_hints: README.md、src/common/commands/agentdev/README.md、docs/guides/command-selection.md、docs/guides/artifacts-and-state.md、.agentdev/README.md
    intent: REQ-005-010 更新後の6分類と案内文書の整合
    verification_refs: [TS-014]
    source_items: [AG-008]
  - id: RA-005
    concern: 既存 Design の更新（v4-standard-lifecycle、v4-v5-crosswalk）
    responsibility: 「公開 UX と内部 lifecycle の分離」節の双経路併存への書換、主要責務一覧への経路別所有権の追記、crosswalk の処遇解消記録
    ownership_hints: docs/designs/workflows/v4-standard-lifecycle.md、docs/designs/foundations/references/v4-v5-crosswalk.md
    intent: ACT-DESIGN-002/003 の実行。REQ-005 更新と同一変更セットでの確定
    verification_refs: [TS-014]
    source_items: [AG-007, AG-008]

review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: 目的・背景・問題
    disposition: covered
    checked_at_commit: null
  - id: RD-002
    source_ru: RU-0002
    source_item: Source Summary
    disposition: covered
    checked_at_commit: null
  - id: RD-003
    source_ru: RU-0002
    source_item: 統合理由
    disposition: covered
    checked_at_commit: null
  - id: RD-004
    source_ru: RU-0002
    source_item: 要件化の方向
    disposition: covered
    checked_at_commit: null
  - id: RD-005
    source_ru: RU-0002
    source_item: 主対象REQまたは変更対象候補
    disposition: covered
    checked_at_commit: null
  - id: RD-006
    source_ru: RU-0002
    source_item: 現行REQ-005との競合解消に求める結果（既存合意からの導出）
    disposition: covered
    checked_at_commit: null
  - id: RD-007
    source_ru: RU-0002
    source_item: 決定的受け入れ条件 B01〜B16
    disposition: covered
    checked_at_commit: null
  - id: RD-008
    source_ru: RU-0002
    source_item: B16で評価する既存変更駆動の能力群（対応表）
    disposition: covered
    checked_at_commit: null
  - id: RD-009
    source_ru: RU-0002
    source_item: 先行標準の採用と実現手段の簡素化（合意済み方針）
    disposition: covered
    checked_at_commit: null
  - id: RD-010
    source_ru: RU-0002
    source_item: 作業仮定・未決事項（正式要件へ混入させない）
    disposition: not_applicable
    checked_at_commit: null
  - id: RD-011
    source_ru: RU-0002
    source_item: PC01〜PC34・PoC40・引渡しV01〜V15 の言及
    disposition: not_applicable
    checked_at_commit: null

assembly_evidence:
  - id: AE-001
    action_id: ACT-REQ-002
    target_file: docs/requirements/REQ-005.md
    target_content_sha256: a12e2e14852edd2ffcc044f3e4af4fa75935a36d46bd2a26e146d11cdb9dfd4b
    check_scope:
      heading: "## 要件"
      start_line: 13
      end_line: 47
    execution_conditions:
      operation: replace
      edit_sha256: 3101876d30b2f7086467d39322f93d59aa007e811f132c78d9f14f4432baffc2
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-12T05:26:08.279Z"
  - id: AE-002
    action_id: ACT-REQ-003
    target_file: docs/requirements/REQ-005.md
    target_content_sha256: a12e2e14852edd2ffcc044f3e4af4fa75935a36d46bd2a26e146d11cdb9dfd4b
    check_scope:
      heading: "## 要件"
      start_line: 13
      end_line: 47
    execution_conditions:
      operation: replace
      edit_sha256: 559ce91ef2298d0375688b4f327715c70e6b45e9905142326ba8ebdaf1272a49
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-12T05:26:31.467Z"
  - id: AE-003
    action_id: ACT-REQ-004
    target_file: docs/requirements/REQ-005.md
    target_content_sha256: a12e2e14852edd2ffcc044f3e4af4fa75935a36d46bd2a26e146d11cdb9dfd4b
    check_scope:
      heading: "## 要件"
      start_line: 13
      end_line: 47
    execution_conditions:
      operation: replace
      edit_sha256: ead06ffcb0bb48e1127eaa2139866e90931ee93de767458bc254765d762c1b3a
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-12T05:26:52.851Z"

case_open_hints:
  epic_needed: true
  decomposition: |-
    文書系の作業（新規REQ作成、REQ-005-001/010/011 更新、Decision 作成、Design 新規2件・更新2件）と実現面の作業（RA-001〜RA-005）を別々の実行ユニットへ分解する。REQ-005 更新・v4-standard-lifecycle 更新・crosswalk 処遇解消は同一変更セットで確定する。REQ 番号の割当ては req-file-manager の採番規則（alloc-req-number.ts）に従い、本ドラフト本文行の REQ-111 プレフィックスは割当て番号へ置換する。最終的なコマンド名・構文は RU-0002 の作業仮定のとおり Design の設計裁量とする。RU-0001 側ドラフト（.agentdev/drafts/req-draft-v51-phase-driven-collaboration.md）と同一リリースで整合する。
  wave_hints:
    - |-
      RU-0002 は RU-0001 に必須依存する（.agentdev/backlog/req-units/RU-0002.md frontmatter の depends_on: [RU-0001]）。B 系受け入れ条件（特に B13 の統合通し、B15 の両版実行）は RU-0001 側の成果物と操作が成立した環境で検証する。operation_units.depends_on は実在する ou_id のみを参照する契約のため、この RU レベルの依存は本記録で保持する（case-open の execution_unit 構成が解決する）。
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

RU-0002 由来の要件定義ドラフト（完了版）。新規REQ（v51-phase-transition-and-coexistence、13要件行）の作成、REQ-005-001/010/011 の競合解消 UPDATE、Decision 1件の新設、Design 1件の新設と Design 2件の更新を定義する。RU-0001 への必須依存を wave_hints と REQ-111-013 に保持する。NFR ゲートは RU-0001 側と同一の Supervisor 経由の利用者確認（2026-10-12）で解消済み。adversarial-review（STEP-8）の実施結果は完了報告に記録する。
