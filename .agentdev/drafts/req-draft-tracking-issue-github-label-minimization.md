---
draft_type: req_draft
topic_slug: tracking-issue-github-label-minimization
status: draft
created_at: 2026-10-14T13:50:00+09:00
source_rus: [RU-0223]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  追跡Issue管理（agentdev-issue-tracking）の GitHub 物理ラベル語彙を実使用実績に裏付けられた最小構成へ是正する。
  role 物理ラベルを agentdev-tracking から tracking へ変更し、kind・非終端追跡Issue状態の GitHub ラベル担体を廃止して
  本文標準構造（kind 項目・状態保持節）へ集約する。Tool 操作契約（issue_create / issue_update / issue_list / issue_reopen）
  の受理フィールド・導出から kind・trackingState を削減し（2026-10-14 HITL 確定: 受理フィールド削除・本文集約）、
  REQ-049-002/003・REQ-011-022/025/026・REQ-095・agentdev-issue-tracking Design 確定事項・custom-tool-contracts Design
  を改訂する。あわせて 2026-10-05/06 に廃止支持が確定しながら未執行の case 通常ラベル解消（定義削除・付与残存22件の自動除去）
  を完了し、session由来RU 契約の generation_actor 値域へ supervisor を追加する（2026-10-14 HITL 確定）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations:
    - "GitHub ラベル定義の作成・削除（tracking 作成・case 定義削除。利用者手動操作。case ラベル定義削除により付与残存22件は自動除去される見込み）"
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      role 物理ラベルの変更と機械判定の維持: 追跡Issueの role 物理ラベルを agentdev-tracking から tracking へ変更する。
      role 機械判定は tracking ラベルの有無で維持し、ラベルなし = role: case の否定的識別を維持する
      （肯定識別〔Case Issue への role ラベル付与〕は導入しない。2026-10-14 合意）。
      移行措置として、既存の open な追跡Issue #3702・#3703 へ tracking ラベルを Tool 経由（issue_update の labels 置換）で付与し、
      付与後の読戻しを機械検査に含める（2026-10-14 HITL 確定。過去クローズ済み追跡Issue #2966/#3059/#3151/#3156 への遡及付与は対象外）。
  - id: AG-002
    content: |
      kind・非終端状態の GitHub ラベル担体廃止と本文集約: kind（problem/idea/task/risk）は追跡Issue本文標準構造の kind 項目へ、
      非終端追跡Issue状態（created/in-discussion/on-hold/ready/resolved）は本文の状態保持節へ集約する。
      終端（closed）は GitHub state + state_reason（completed/not_planned）の現行どおりとする。
      Tool 操作契約（issue_create/issue_update/issue_list/issue_reopen）の受理フィールド・導出から kind と trackingState を削除する
      （2026-10-14 HITL 確定: 受理フィールド削除・本文集約）。issue_list の絞り込み軸は role と state に縮小する。
      REQ-049-002/003 は表現できること・区別できることの論理要件として維持し、物理担体を本文へ移す改訂とする。
      REQ-049-002・003・REQ-011-022 の物理担体の再定義、REQ-049 の本文標準構造（Design 確定事項6）への kind 項目・状態保持節の追加を含む。
  - id: AG-003
    content: |
      部分更新不変条件・再オープン遷移の追随: REQ-011-025 の追跡Issue軸を role のみへ縮小し、VERIFY は role 軸の維持確認とする。
      REQ-011-026 の再オープンは role と通常ラベルの保持のみを Tool 責務とし、追跡状態の再オープン遷移（closed → in-discussion）は
      本文の状態保持節の更新として呼出側が行う。Tool は追跡状態の遷移を機械適用しない。
  - id: AG-004
    content: |
      REQ-095 呼出側規律の是正: REQ-095-001 の受理フィールド対応表記述から kind 関連（kind は role 'tracking' 専用で role: case では不受理）を削除する。
      REQ-095-002 の理由記述を否定的識別（Case は role ラベル tracking の不在により role: case と否定的識別され、ラベルフィルタに依存しないため）に是正する。
      目的節の kind 不受理（kind requires role 'tracking'）記述と gh issue list --label case 記述を、
      case ラベル廃止（定義削除済み・正規経路から付与しない）を反映した文言へ是正する。
  - id: AG-005
    content: |
      Design の改訂: agentdev-issue-tracking Design は、確定事項11（状態トークンと GitHub ラベル語彙）を全面改訂し
      （role = tracking のみ、旧追跡軸ラベル agentdev-tracking / agentdev-kind/* / agentdev-tracking-status/* の廃止、
      kind・非終端状態の本文集約）、確定事項5（物理写像表の対象縮小）、確定事項6（本文標準構造へ kind 項目と状態保持節を追加）、
      確定事項12（再オープン遷移の呼出側責務化）、確定事項13（ローカル版物理表現の方向）、
      確定事項15（issue_list labels 規律の軸縮小）を追随する。
      custom-tool-contracts Design は追跡Issue操作契約（before payload 導出値、部分更新不変条件、issue_reopen 取扱い）を改訂し、
      ADF-COVERS(implementation) 宣言へ REQ-011-025/026 を追加する（design 対応事前確認で検出した design 対応欠落の解消）。
  - id: AG-006
    content: |
      実装・テスト・配布スキルの追随: tracking-schema.ts の物理写像（TRACKING_ROLE_LABEL を tracking へ、
      KIND_LABEL_PREFIX・TRACKING_STATUS_LABEL_PREFIX とラベル写像関数群の削減）、specs-issue.ts・runner-cli.ts・runner-local.ts・
      contracts.ts・public-schema.ts・index.ts とテスト一式（runner-cli.test.ts、engine-fail-closed.test.ts、local/tests/*、
      four-combination 系、src/opencode/plugins/agentdev-gh-tool/tests、src/senpi/tools/agentdev-gh-tool/tests）の
      語彙置換・軸削減を最小差分で行う。配布スキル（agentdev-issue-tracking SKILL.md、
      agentdev-issue-management references issue-operation-safety.md）の追随には、起票時に本文標準構造
      （kind 項目・状態保持節の初期値）を本文へ生成する呼出側規律を含める。
      ローカル版 frontmatter スキーマの詳細確定は agentdev-issue-tracking Design 改訂内で GitHub 版と整合する範囲で扱う（RU 対象外の趣旨どおり）。
  - id: AG-007
    content: |
      GitHub ラベル定義整備（利用者手動+機械検査）: tracking ラベルを作成する（利用者が GitHub UI で手動作成）。
      case ラベル定義を削除する（利用者手動。GitHub 仕様上、定義削除により付与残存22件も自動除去される見込みであり、
      個別 issue_update による除去は行わない。2026-10-14 HITL 補足確定）。
      完了検査はラベル定義一覧（agentdev-* 0件・tracking 存在・case 0件）と case ラベル付与0件の読取で行う。
      旧 agentdev-* ラベル定義は 2026-10-14 に利用者が削除済みであり、正規起票経路から再作成・付与しない。
  - id: AG-008
    content: |
      session由来RU 契約の generation_actor 値域拡張: REQ-008-051 の generation_actor を req-define-parent 固定から
      supervisor を含む値域（req-define-parent または supervisor）へ拡張し、artifact-contracts Design
      （RU アーティファクト契約（session由来RU）節）の生成主体記述と frontmatter 必須フィールド表を改訂する
      （2026-10-14 HITL 確定: 本Caseに契約改訂を含める。supervisor 起案を実運用パターンとして正規化）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-049.md
    target_area: 要件
    source_items: [AG-001, AG-002]
    content: |
      | REQ-049-002 | Issue は論理 role により追跡Issue（tracking）と Case Issue（case）に区別され、role は機械判定可能であること。追跡Issueの kind は少なくとも problem、idea、task、risk の意味を、追跡Issue本文標準構造の項目として表現できること |
      | REQ-049-003 | 追跡Issueの状態は少なくとも起票、検討中、保留、実行準備完了、解決済み、クローズ済みの6状態を区別できること。非終端状態は本文の状態保持節により区別し、終端状態は GitHub state と close reason により区別すること。解決済みは結論の確定を意味し、クローズ済みは必要な反映の完了または反映不要の確認完了を意味すること |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    target_area: 要件
    source_items: [AG-002, AG-003]
    content: |
      | REQ-011-022 | GitHub I/O を担う Custom Tool の操作契約は、追跡Issueの管理に必要な Issue 一覧・検索（role、state 等による絞り込みを含む構造化結果）、Issue 単体読取のメタデータ（title、state、labels、role 写像に必要な情報を含む）、Issue 本文・メタデータ更新（labels 更新を含む）、Issue コメントの作成・一覧・更新・削除（Comment を Issue と Pull Request の共通の論理リソースとして扱い、一覧・更新・削除はコメント識別子（commentId、公開型は文字列）を対象識別として使用する）、Issue クローズ、Issue 再オープンを上位層へ提供すること。コメント追加とコメント読取を単一操作の引数有無で兼ねる二重モード操作を正規操作カタログに含まないこと |
      | REQ-011-025 | Issue 更新は部分更新として、変更を要求していない追跡Issue軸（role）を保持すること。通常ラベルの置換指定は通常ラベル軸のみに作用し、要求対象外の追跡軸を変化させないこと。VERIFY は追跡軸の維持を確認すること |
      | REQ-011-026 | Issue 再オープンは追跡Issueについて、role と通常ラベルを保持すること。追跡状態の再オープン遷移（クローズ済みから再検討への遷移を含む）は追跡Issue本文の状態保持節の更新として呼出側が行い、Tool は追跡状態の遷移を機械適用しないこと。Case Issue には追跡Issue固有の状態遷移を適用しないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-095.md
    target_area: 目的・要件
    source_items: [AG-004]
    content: |
      （目的節）agentdev_gh の受理フィールドは操作・role 別に異なる。Case Issue の work_type は物理ラベル（bug、maintenance、enhancement 等）を labels へ指定する運用である。Case は正規識別にラベルを使用せず、role ラベル tracking の不在により role: case と否定的識別される。case ラベルは廃止済み（定義を削除済み）であり、正規経路から付与しない。
      （要件表）| REQ-095-001 | agentdev_gh の起票・読取操作の呼出側は、操作・role 別の受理フィールド対応表（role は issue_create/issue_list 専用、Case Issue の work_type は物理ラベルを labels へ指定）を運用文書（配布 skill reference issue-operation-safety.md、agentdev-issue-tracking SKILL.md）から参照できること |
      （要件表）| REQ-095-002 | gh CLI による読取補完は、ラベルなし列挙＋タイトル・本文確認で行う規律を運用文書から参照できること（Case は role ラベル tracking の不在により role: case と否定的識別され、ラベルフィルタに依存しないため） |
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    target_area: 要件
    source_items: [AG-008]
    content: |
      | REQ-008-051 | session由来RU（source_type: chat, generated_by: session）の frontmatter は、生成主体（generation_actor: req-define-parent または supervisor）、合意成立時刻（agreement_confirmed_at）、生成ステージ（generation_stage: pre-req-define）、論理キー（logical_key）の4フィールドを必須とすること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-issue-tracking.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-issue-tracking
    target_area: 確定事項
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006]
    content: |
      5. **物理写像表の所有と機械適用の分担**: role とラベル等の対応表の正は本 Design が所有する。kind と非終端追跡Issue状態は GitHub ラベルへ写像せず、追跡Issue本文標準構造の項目（kind、状態保持節）として表現する。論理値と物理値の変換（写像表の機械適用）は Tool 内実装が行い、Tool は写像の意味判断を新規に所有しない。上位層は論理値のまま Tool 操作契約を利用し、写像を再実装しない
      6. **本文標準構造**: 追跡Issue本文は、件名、背景、影響、関連成果物、選択肢、判断材料、不足情報、保留理由と再評価条件、解決結論、反映先と反映状態、関連 Case Issue への参照に加え、kind（problem、idea、task、risk）を示す項目と非終端追跡Issue状態の現在値を保持する状態保持節を標準セクションとして保持する。起票時に反映先・クローズ確認を含めない（反映先の決め打ち回避）。検討経過は Issue コメントを正規の時系列履歴とし、本文内へ独自の追記専用ログを二重保持しない
      11. **状態トークンと GitHub ラベル語彙（物理写像表の具体値）**: 追跡Issue 6状態の論理トークンは `created`（起票）、`in-discussion`（検討中）、`on-hold`（保留）、`ready`（実行準備完了）、`resolved`（解決済み）、`closed`（クローズ済み）とする。GitHub 物理ラベルによる追跡軸の機械識別は role のみとし、role = `tracking`（追跡Issueのみ付与。ラベルなしは role: case と機械判定し、既存 Case Issue との互換を維持する。肯定識別〔Case Issue への role ラベル付与〕は導入しない）とする。旧追跡軸ラベル（`agentdev-tracking`、`agentdev-kind/*`、`agentdev-tracking-status/*`）は廃止し、正規起票経路から再作成・付与しない。kind は本文標準構造の kind 項目として、非終端追跡Issue状態は本文の状態保持節として保持する。終端（`closed`）は GitHub state と state_reason（completed / not_planned）から導出し、状態ラベルを付与しない。ローカルIssueの frontmatter `status` は論理トークンと同一の値を用いる
      12. **再オープン遷移（拡張）**: 追跡Issueの再オープン時の状態遷移は closed → in-discussion（再検討）とする。再オープンによって role と通常ラベルを失わない。追跡状態の遷移は本文の状態保持節の更新として呼出側が行い、Tool は状態ラベルの再付与による遷移の機械適用を行わない。ローカル版の role: case は終端状態からの遷移を定義しないため、reopen を拒否する（ローカルIssue共通スキーマ Design の role: case 状態遷移と整合）
      13. **ローカル版追跡Issueの物理表現**: ローカル版 role: tracking の frontmatter の status は追跡Issue状態の論理トークンを維持する。kind の Tool 操作契約上の受理・導出・絞り込みは GitHub 版と同一に削減し、labels の kind 値域検証（4値からちょうど1つ）も廃止する。詳細な物理表現はローカルIssue共通スキーマ Design が GitHub 版の本文集約と整合する範囲で定める
      15. **issue_list の labels 引数の規律（物理写像の入力方向）**: issue_list 操作の labels 引数は、追跡Issue論理軸（role）の物理マッピング入力として使用する呼出側規律である。Tool の受理能力としては通常ラベル（enhancement、bug 等）による絞り込みも有効（クライアント再フィルタ）であり、Case Issue は role: case と機械判定されるため通常ラベルでは Case Issue を論理軸で絞り込めない。能力の存在は ADF 呼出側の使用規律の解禁を意味しない。Case Issue の絞り込みは labels 引数を使用せず、search 引数（冪等キー語、REQ 番号、topic_slug 等の絞り込みキー）と state の組み合わせで行う。closed 等の広範 filter を search なしで実行すると、累積 population により完全一覧契約の安全上の上限へ到達し operation-failed となる。操作手順面の適用形は agentdev-issue-management の issue-operation-safety.md が定める
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 操作契約の構成要素
    source_items: [AG-002, AG-003, AG-005]
    content: |
      - issue_update、issue_reopen の追跡軸保持 VERIFY は、副作用後の読み戻しのみでは自己保持できない実行前状態を必要とするため、runner の成功応答 payload は実行前状態（before）を正規化済み導出値として含める。含める導出値は state、labels、role、closeReason とし、正規化規則は契約型（contracts.ts）と追跡スキーマ（tracking-schema.ts）の実装に従う
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-003, AG-005]
    content: |
      - issue_update の部分更新不変条件: 変更を要求していない追跡Issue軸（role）を保持する。VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による通常ラベル追加を不変条件違反として失敗扱いにしない
      - issue_reopen の追跡Issue取扱い: 再オープンによって role と通常ラベルを保持する。追跡状態の再オープン遷移（クローズ済み→検討中）は本文の状態保持節の更新として呼出側が行い、Tool は追跡状態遷移を機械適用しない。Case Issue には追跡状態遷移を適用しない。既に open の追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功とする
      （宣言行）ADF-COVERS(implementation) 宣言へ REQ-011-025, REQ-011-026 を追加する（design 対応事前確認で検出した欠落の解消）
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: RU アーティファクト契約（session由来RU）
    source_items: [AG-008]
    content: |
      - 生成主体: `req-define` 親エージェント（`generation_actor: req-define-parent` または supervisor）
      （frontmatter 必須フィールド表）| `generation_actor` | `req-define-parent` / `supervisor` |

conflict_resolutions:
  - id: CR-001
    conflict: kind・非終端状態の Tool 操作契約形について、RU が「削減」または「本文項目への読み替え」の2案を並記していた
    resolution: 2026-10-14 HITL で「受理フィールド削除・本文集約」に確定した。Tool が本文の意味解釈（パース・更新）を持たず、実使用実績（kind 出生時のみ・状態遷移0回）に整合するため
  - id: CR-002
    conflict: RU-0223 の generation_actor: supervisor と session由来RU 契約固定値 req-define-parent の差異の扱い
    resolution: 2026-10-14 HITL で「本Caseに契約改訂を含める」に確定した。REQ-008-051 の値域拡張 + artifact-contracts Design 改訂を OU-002 として本体と分離して処理する
  - id: CR-003
    conflict: case ラベル付与残存22件の解消手段（個別 issue_update か、定義削除の自動除去か）
    resolution: 2026-10-14 HITL 補足で「GitHub 仕様上、case ラベル定義削除により付与22件も自動除去されるため個別 issue_update は不要」に確定。完了検査はラベル一覧と付与0件の読取で行う
  - id: CR-004
    conflict: 既存 open 追跡Issue #3702/#3703 は 2026-10-14 に旧 role ラベルを削除済みで role ラベルを欠く（tracking ラベル廃止後の role 機械判定で role: case と誤判定される）。RU は open 2件の扱いを明記していなかった
    resolution: 2026-10-14 HITL（adversarial-review 由来の未解決論点として質問）で「対象に含める（Tool 経由で付与）」に確定。issue_update の labels 置換で tracking ラベルを付与し、付与後の読戻しを機械検査（TS-007）に含める

operation_units:
  - ou_id: OU-001
    source_ru: RU-0223
    target_req: REQ-049
    target_design: docs/designs/skills/agentdev-issue-tracking.md（主。docs/designs/responsibilities/custom-tool-contracts.md を含む。REQ-011・REQ-095 への更新を含む）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0223
    target_req: REQ-008
    target_design: docs/designs/responsibilities/artifact-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      four-combination 系統合テスト（GitHub 実装×ローカル実装×ホスト接続）の改訂版で起票の付与ラベルと role 導出を検証する。
      あわせて case-run 検証フェーズで実リポジトリ（yogata/agent-dev-flow）の正規経路（/agentdev/issue の Tool 呼出）による起票・読戻しを試験する。
      #3702/#3703 への tracking ラベル付与（issue_update の labels 置換）後の読戻しを含める。
    pass_criteria: |
      正規経路で起票した追跡Issueの付与ラベルが tracking（＋指定通常ラベル）のみであり、agentdev-* ラベルが0件であること。
      ラベルなし Issue が role: case と機械判定されること。#3702/#3703 の labels に tracking が含まれること。
    on_failure: |
      fix-and-reverify。実装の写像・起票経路を修正して再検証する（検証対象が実装・正規経路の双方に及ぶため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      bun test（runner-cli.test.ts、engine-fail-closed.test.ts、local/tests/runner-local.test.ts、local/tests/existing-asset-compat.test.ts、
      four-combination 系）で受理フィールド削減後の操作契約を検証する。契約外フィールド（kind、trackingState）を含む要求が
      副作用発生前に invalid-input で拒否されることを含む。あわせて case-run 検証フェーズで実リポジトリの追跡Issue操作
      （起票・一覧・検索・コメント・close・reopen）が新語彙・削減後契約で通ることを結合試験する。
    pass_criteria: |
      全テスト合格。実リポジトリで追跡Issue操作が通ること。契約外フィールド要求が拒否されること。
    on_failure: |
      fix-and-reverify。受理仕様・実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      bun test の部分更新・再オープン関連テストで、issue_update の部分更新で role 軸が維持されること（labels 置換で tracking ラベル保持）、
      issue_reopen で role と通常ラベルが保持され追跡状態遷移の機械適用がないことを検証する。
    pass_criteria: |
      部分更新不変条件（role）と reopen 保持の全テスト合格。
    on_failure: |
      fix-and-reverify。VERIFY 仕様を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      保存後の docs/requirements/REQ-095.md 本文検査（case-close の docs 検証で実施）。
      kind 不受理記述（kind requires role）と gh issue list --label case 記述の不在、否定的識別と case ラベル廃止の記述の存在を確認する。
    pass_criteria: |
      kind 記述 0件、--label case 記述 0件、否定的識別・case ラベル廃止の記述が存在すること。
    on_failure: |
      fix-and-reverify。REQ-095 保存内容を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      保存後の docs 検査（case-close docs 検証）で Design 改訂の適用と ADF-COVERS(implementation) への REQ-011-025/026 追加を確認する。
      あわせて rg による旧語彙検索（agentdev-tracking、agentdev-kind/、agentdev-tracking-status/）を
      docs/designs、docs/requirements、src/common、src/opencode、src/senpi、.opencode の範囲で実行する
      （除外: 履歴経緯の記述としての引用、docs/reports/、.agentdev/〔RU は参照専用入力で修正対象外〕。See Also 参照行は修正対象外のため検出対象から除外する扱いを明示）。検索語彙と修正対象列挙の一致を確認済み。
    pass_criteria: |
      Design 改訂が適用済みで、REQ-011-025/026 が ADF-COVERS(implementation) に含まれること。旧語彙残存が0件（引用・除外規定適用後）であること。
    on_failure: |
      fix-and-reverify。Design・配布スキルの保存内容を修正して再検査する。
  - id: TS-006
    target_item: AG-006
    verification: |
      bun test（repo root 起 cwd・./付きパス指定。REQ-060）と typecheck を実行する。
    pass_criteria: |
      本変更由来の fail が0件であること（既知 pre-existing baseline fail は #3702 管理の件数突合で区別する）。
    on_failure: |
      fix-and-reverify（本変更由来の fail は実装を修正して再検証。pre-existing は件数突合を記録の上 record-in-findings 扱いとする）。
  - id: TS-007
    target_item: AG-007
    verification: |
      case-run 検証フェーズで、ラベル定義一覧の読取（agentdev-* 0件・tracking 存在・case 0件）と case ラベル付与検索の読取（付与0件）を行う。
      読取は agentdev_gh の読取操作または読取補完（ラベルなし列挙規律）で実行する。
    pass_criteria: |
      ラベル定義一覧に agentdev-* が存在せず tracking が存在すること。case ラベル定義が存在せず付与0件であること。
    on_failure: |
      fix-and-reverify。利用者手動操作（tracking 作成・case 定義削除）が未実施の場合は利用者へ依頼してから再検査する。
  - id: TS-008
    target_item: AG-008
    verification: |
      保存後の docs/requirements/REQ-008.md（REQ-008-051 行）と docs/designs/responsibilities/artifact-contracts.md
      （RU アーティファクト契約（session由来RU）節）の本文検査（case-close docs 検証で実施）。
    pass_criteria: |
      両文書の generation_actor 値域が一致し、req-define-parent と supervisor を含むこと。
    on_failure: |
      fix-and-reverify。保存内容を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: agentdev_gh の物理写像・受理契約の削減実装
    responsibility: Tool 実装（物理写像モジュール、操作スペック、runner、契約型、公開スキーマ）を改訂し、role のみの追跡軸機械識別と kind・trackingState の受理・導出・絞り込み削減を実現する
    ownership_hints:
      - "src/common/tools/agentdev-gh/tracking-schema.ts（TRACKING_ROLE_LABEL を tracking へ、KIND_LABEL_PREFIX・TRACKING_STATUS_LABEL_PREFIX・ラベル写像関数群の削減）"
      - "src/common/tools/agentdev-gh/specs-issue.ts（issue_create/issue_update/issue_list/issue_reopen の受理・VERIFY・再フィルタ）"
      - "src/common/tools/agentdev-gh/runner-cli.ts（GitHub ラベル写像・サーバ側絞り込み推送クエリ）"
      - "src/common/tools/agentdev-gh/local/runner-local.ts（ローカル版受理・導出の削減、frontmatter 検証の調整）"
      - "src/common/tools/agentdev-gh/contracts.ts・public-schema.ts・index.ts（引数型・成功型・公開スキーマ・操作スペック記述）"
      - "テスト一式: src/common/tools/agentdev-gh/tests/*、local/tests/*、src/opencode/plugins/agentdev-gh-tool/tests/*、src/senpi/tools/agentdev-gh-tool/tests/*"
    intent: |
      語彙置換と軸削減の最小差分で実装を追随させる。ローカル版既存資産（frontmatter status/labels）との互換を維持し、
      role 機械判定（tracking ラベル有無）の実効性を保つ。
    verification_refs: [TS-001, TS-002, TS-003, TS-006]
    source_items: [AG-001, AG-002, AG-003, AG-006]
  - id: RA-002
    concern: 配布スキル本文の追随（起票時本文標準構造の生成規律を含む）
    responsibility: |
      追跡Issue操作の呼出側規律を記述する配布スキル本文を改訂する。受理フィールド対応表から kind を削除し、
      起票時に本文標準構造（kind 項目・状態保持節の初期値）を本文へ生成する呼出側規律を明記する。
    ownership_hints:
      - "src/common/skills/agentdev-issue-tracking/SKILL.md（labels 省略時取扱い・論理値指定・受理フィールド対応表参照・物理ラベル写像規律の各節）"
      - "src/common/skills/agentdev-issue-management/references/issue-operation-safety.md（論理値指定・labels 規律・操作・role 別受理フィールド対応表）"
    intent: |
      kind・状態の本文集約に伴い、呼出側（workflow・agent）が本文標準構造を生成する責務を運用文書で明示する。
      物理ラベルの語彙依存を運用文書から除去する。
    verification_refs: [TS-005]
    source_items: [AG-004, AG-006]
  - id: RA-003
    concern: GitHub ラベル定義整備（利用者手動）と既存 open 追跡Issueへの移行付与
    responsibility: |
      tracking ラベル作成と case ラベル定義削除を利用者が手動実行し、case ラベル付与残存22件は定義削除により自動除去される。
      既存 open 追跡Issue #3702・#3703 への tracking ラベル付与は case 側で agentdev_gh issue_update（labels 置換）により実行する。
      完了検査（ラベル一覧・付与0件・#3702/#3703 の読戻し）を実施する。
    ownership_hints:
      - "GitHub リポジトリ yogata/agent-dev-flow のラベル定義（利用者手動操作。agentdev_gh 操作カタログ外のため）"
      - "既存 open 追跡Issue #3702・#3703（agentdev_gh issue_update 経由）"
      - "case ラベル付与残存22件の自動除去見込み（GitHub 仕様依存。付与0件検査で担保）"
    intent: |
      2026-10-05/06 に廃止支持が確定しながら未執行だった case ラベル解消を完了し、新語彙（tracking）のラベル定義を整備する。
      個別 issue_update による22件の除去は行わない（定義削除の自動除去に委ね、付与0件検査で確認する）。
    verification_refs: [TS-001, TS-007]
    source_items: [AG-001, AG-007]

review_dispositions:
  - id: RD-001
    source_ru: RU-0223
    source_item: ru-0223-whole
    disposition: covered
    reason_code: covered_by_this_draft
    reason: |
      RU-0223 の目的・対象・決定的受け入れ条件6条が AG-001〜AG-007 と test_strategy（TS-001〜TS-007）へ反映済み。
      要件化の方向は artifact_actions（REQ 4ファイル・Design 3ファイル4 action）へ反映済み。
      Source Summary の generation_actor 契約差異は AG-008・OU-002 として契約改訂を本 Case に含めた（2026-10-14 HITL 確定）。
      RU 対象外（肯定識別の導入、REQ-095-002 の廃止、論理モデル自体の変更、件名接頭辞、クローズ済み4件への遡及付与、ローカル版詳細確定）は本 draft でも対象外としている。
    evidence:
      path: .agentdev/backlog/req-units/RU-0223.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-049.md
    target_content_sha256: 61b3acede894a95504fa8a1582daec88fbd080d2ca9c7ed881fdf3abf4e447c9
    check_scope: {heading: "## 要件", start_line: 18, end_line: 42}
    execution_conditions: {operation: replace, edit_sha256: 2c1b331d62c7b54895852c077a48d81fb2def067559aefe43144dbe9aeef87bd, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-049.md
    target_content_sha256: 61b3acede894a95504fa8a1582daec88fbd080d2ca9c7ed881fdf3abf4e447c9
    check_scope: {heading: "## 要件", start_line: 18, end_line: 42}
    execution_conditions: {operation: replace, edit_sha256: 6907175e1431e01e6bcf1a5a150a34620a60a35fbd4eab078731f505b3a54b2d, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-011.md
    target_content_sha256: a878cb067e0931d324ac811271434067f752b4a6469a58f9a65b943c4648f1a6
    check_scope: {heading: "## 要件", start_line: 22, end_line: 58}
    execution_conditions: {operation: replace, edit_sha256: feab2ef1dfb198ad8dc57e242029bb2e1c2423ed0eb6621acb0d9605012f62fb, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-011.md
    target_content_sha256: a878cb067e0931d324ac811271434067f752b4a6469a58f9a65b943c4648f1a6
    check_scope: {heading: "## 要件", start_line: 22, end_line: 58}
    execution_conditions: {operation: replace, edit_sha256: 3b763ddee1bb0b388fc5928fd605e30b5ce764a832c4de184c10aef1b6d5f688, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-011.md
    target_content_sha256: a878cb067e0931d324ac811271434067f752b4a6469a58f9a65b943c4648f1a6
    check_scope: {heading: "## 要件", start_line: 22, end_line: 58}
    execution_conditions: {operation: replace, edit_sha256: d9b030344a79a78557d23c4ca232e1e2db22b876f09778547226624fa9900764, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-095.md
    target_content_sha256: 314cfe10f7c53632cb40d2c803126dc6fb8ecf2ec6743f403fcc83681832c933
    check_scope: {heading: "## 要件", start_line: 16, end_line: 23}
    execution_conditions: {operation: replace, edit_sha256: bcc0d34a876699562622d0fefc5a35d047170199a0f58341fd78bb22cc7b37fe, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-095.md
    target_content_sha256: 314cfe10f7c53632cb40d2c803126dc6fb8ecf2ec6743f403fcc83681832c933
    check_scope: {heading: "## 目的", start_line: 8, end_line: 15}
    execution_conditions: {operation: replace, edit_sha256: 6be67f9f61ee5b4e92320d93f4b249a48eb8785200fa190c7ddf9822aed91a34, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-008.md
    target_content_sha256: b24a190f10147ab8894889e6f3572f23930323d734a3b629eaf437f4993dd0ae
    check_scope: {heading: "## 要件", start_line: 14, end_line: 80}
    execution_conditions: {operation: replace, edit_sha256: 91014dc875421009ad431c689bd75b29d1f41a4c94bf71a2f4c005a202727f8b, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: a06dc89c1065499c59f7b42d884e9a3e7bb2bd4cbe94b1b6df87df105a1636e6, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: 3b258dae7a9f5a8fb6f3c4fc5e7390c2767082e45b61491230a625b03186a025, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: a4930567a09264d1883a648ba8cfb92bac39151783211e047dc1c32343509a2a, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: a7c4dd525e2667ef03aaab235459d758a1269aaac2ced994af424813c4241717, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:44:11.487Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: 9e97a3f1706c341d78c75050a06a0e27106ff4e25e2db1f763cf80357e64d3fd, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: aa5929f6ece454d743ba6b85f6ab2ae12f911b4b7f4d9df73795198963c6a800
    check_scope: {heading: "## 操作契約の構成要素", start_line: 19, end_line: 36}
    execution_conditions: {operation: replace, edit_sha256: ed51a3f513eb7ebef3651d8251fb022842e463557e813ffc52fd576d5f5821c9, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: aa5929f6ece454d743ba6b85f6ab2ae12f911b4b7f4d9df73795198963c6a800
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 37, end_line: 98}
    execution_conditions: {operation: replace, edit_sha256: 5d67b70dee56100f839659882051e77e5df2c89e1f4faca00c54688172ab144a, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: aa5929f6ece454d743ba6b85f6ab2ae12f911b4b7f4d9df73795198963c6a800
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 37, end_line: 98}
    execution_conditions: {operation: replace, edit_sha256: 39497c53e83a98a1b72880f9298b983b209ea892eea351104f27ee5d811e32bc, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/designs/responsibilities/artifact-contracts.md
    target_content_sha256: 32bfb020f57cb4607920b5cf69adf46aabc16845ecd227ff4e54e5e07fb63283
    check_scope: {heading: "## RU アーティファクト契約（session由来RU）", start_line: 540, end_line: 607}
    execution_conditions: {operation: replace, edit_sha256: 46bbefd583f7b2d466334517b8c1bd30f7f6c9c6423d13920cbc07dba1986981, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:37:02.123Z"
  - target_file: docs/designs/responsibilities/artifact-contracts.md
    target_content_sha256: 32bfb020f57cb4607920b5cf69adf46aabc16845ecd227ff4e54e5e07fb63283
    check_scope: {heading: "## RU アーティファクト契約（session由来RU）", start_line: 540, end_line: 607}
    execution_conditions: {operation: replace, edit_sha256: 852a1d981a06897eaa708015a9520b09fbeb70da9d9ea25520f2f6cf453703eb, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:36:21.635Z"
  - target_file: docs/requirements/REQ-095.md
    target_content_sha256: 314cfe10f7c53632cb40d2c803126dc6fb8ecf2ec6743f403fcc83681832c933
    check_scope: {heading: "## 要件", start_line: 16, end_line: 23}
    execution_conditions: {operation: replace, edit_sha256: a66d2b60a84d4d0d4b3fdc0d078d51ab04c3d2a3338d5dd9c33391b2dfdfc07e, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:42:14.744Z"
  - target_file: docs/designs/skills/agentdev-issue-tracking.md
    target_content_sha256: a4ef055c92d5e95e4b075ae7ec7b820eefec5286c2c6cd04034de9ed4a2c3af8
    check_scope: {heading: "## 確定事項", start_line: 22, end_line: 48}
    execution_conditions: {operation: replace, edit_sha256: 9e09dfb93086c0d7485423de27d7d8a936dd479a94b3c244eba0cb019f8a57d8, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-14T04:42:14.744Z"

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

（人間可読補足。処理の正は上記 # draft-data YAML ブロックである）

RU-0223（追跡Issue管理の GitHub ラベル物理写像の最小化）を要件化した draft。
role 物理ラベルを tracking 1語へ変更し、kind・非終端状態を本文標準構造へ集約、Tool 操作契約から kind・trackingState を削減する。
2026-10-14 の HITL 3論点（契約改訂の本Case込み・受理フィールド削除・ラベル定義整備は利用者手動+機械検査）と
adversarial-review 由来の1論点（#3702/#3703 への tracking ラベル移行付与）を合意済み（conflict_resolutions 参照）。
旧語彙（agentdev-tracking、agentdev-kind/、agentdev-tracking-status/）は docs・配布スキル・テスト資産から除去する
（履歴経緯の引用は除外）。実行時制約（先行 case-auto 連鎖の完了後に開始）は 2026-10-14 12:45 JST の同連鎖正常終了により解消済み。
