---
draft_type: req_draft
topic_slug: adopted-phase-execution-and-route-coexistence
status: draft
created_at: 2026-11-04T08:27:23+09:00
source_rus: [RU-0260]
pre_save_notification: 2026-11-04T08:27:23+09:00 既存REQへのAPPEND重要変更（本draftのartifact_actions参照）をドラフト保存前に実行出力へ提示済み
---

# draft-data

```yaml
# work_type: 既存 v5/v5.1 基盤要件に対する実利用経路の成立という新能力の付加
work_type: feature

# scale: 9 受け入れ条件、3 REQ への APPEND（19 行）、複数 Design 反映、GitHub/Local 両環境の検証を含む
scale: large

summary: |
  採用した工程構成に応じた単独工程・一気通貫実行と、工程駆動・変更駆動の両正規利用経路の共存を、
  REQ-104（採用規約解決の実行経路接続と判定・検証義務）、REQ-108（単独工程・一気通貫実行の実行接続と
  横断検証義務）、REQ-111（5操作の実行成立・両経路の成果物再利用・切替時の情報保全・Local 版結果確認）
  への APPEND で成立させる。既存の採用規約解決器（単独工程・全工程の試験あり）の解決だけでは一気通貫
  実行や両経路共存を証明できないため、すべての「既存能力で満たされる」判断の検証を公開経路での
  実演（公開コマンド・公開 script CLI・公開 tool 実行と観測可能な証拠）で行う。実装・試験ファイルの
  存在は合格証拠としない。5操作の操作契約の正規所有は REQ-110 が維持し、本 draft は実行成立と検証義務
  のみを REQ-111 へ追加する。恒久的な工程進捗台帳は導入せず、後継経路の実現・検証・正式採用まで旧経路
  を失効させない（既存合意を維持）。主な検証事例は S1、S2、S6（S1=小規模な一気通貫開発、S2=複数工程の段階開発、
  S6=工程駆動と変更駆動の共存。事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md
  「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」の「## 検証事例S1〜S6」節〔L553〜574〕
  による）とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-601
    content: |
      採用規約の解決を対象作業の実行経路から利用する。採用規約の解決は、対象作業（工程駆動の各操作、
      変更駆動の workflow、Case 実行、品質ゲート等の工程構成に基づいて成果物の有無・成立を判定する
      作業）の実行経路から参照され、解決結果（採用済み工程、工程間関係、必須成果物）が当該作業の
      判定基準として使われる。次の 4 状態を区別して解決する: (1) 有効な採用宣言がある、(2) 採用宣言が
      ないが有効な既存運用がある、(3) 採用宣言も有効な既存運用もない、(4) 採用宣言が存在するが読取不能。
      有効な採用規約を優先し、両方ない場合は標準案を未採用候補として扱い、読取不能時は判断を留保する。
      読取不能を宣言なしと混同せず、読取不能時の判断留保を移行期デフォルトの接続として扱わない。
  - id: AG-602
    content: |
      採用した工程・成果物だけを判定基準とする。詳細工程を採用しない案件では標準案を未採用候補として
      扱い、複数の詳細工程を採用した案件では採用済み各工程を単独の作業単位として解決する。未採用の
      参照工程を判定基準へ含めず、採用済みで必須の成果物の欠落を検出結果として提示し、作成・採用外
      明示・省略明示のいずれかに分類する根拠確認を経て解消する。根拠確認を経ない欠落を省略として
      合格させない。工程の分割・統合・省略の再構成宣言には元の要求・制約・受け入れ条件・検証義務の
      継承を必須とし、継承宣言なし・空宣言の再構成を受理しない。
  - id: AG-603
    content: |
      採用した工程構成に基づき、要件確定のみ、設計確定のみ、確定済み設計からの実装・検証のみの各
      単独工程を、採用規約の解決結果を基準として独立して完了できる。後続実装や Issue・PR を一律に
      要求しない。独立完了の判定は、対象作業に必要な成果物と検証の成立を確認して行う。設計確定のみの
      作業に後続実装を要求せず、確定済み設計からの実装・検証のみの作業に要件定義への無条件復帰を
      要求しない（REQ-111-007 の既有義務を維持）。
  - id: AG-604
    content: |
      採用規約で詳細工程を必須としない小規模案件を、要件から必要な設計・実装・検証まで正規利用経路で
      連続実行できる。不要な工程・独立文書・Issue を強制せず、採用された必要な要求・制約・検証義務を
      維持する。連続実行した事実だけでは未成立の検証を完了扱いとせず、各段階の検証証拠に基づいて
      完了を判定する。
  - id: AG-605
    content: |
      工程駆動の5公開操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review、
      phase-transition）を GitHub 版と Local 版の正規利用経路で実行でき、各操作の必要な入力、状態、
      判断、保存結果を正しく扱える。各操作の既存要求（REQ-110・REQ-111 が正規所有する操作契約）を
      維持する。一部の操作や環境の成功だけで全操作を合格としない。
  - id: AG-606
    content: |
      変更駆動の既存経路・能力を維持する: 自然言語の要求・不具合報告・エラーログからの直接入力、
      RU からの要件化、Intake・Learning・Backlog から要件化・実行への接続、小規模作業と意味的依存を
      持つ複数作業・Epic/Wave、既存合意に基づく正規改訂、実変更・検証証拠・安全境界の確認、中断・
      失敗・再開、重要変更の識別・反映前通知・必要な追加通知・結果説明。実装着手時点の有効な正規契約が
      要求する外部的結果と検証義務を維持する。旧コマンド名の一致だけを要求する必要はないが、意味を
      引き継ぐ経路が成立する前に既存能力を失効させない。既存能力・操作・環境の代表事例を割り当てて
      検証し、すべての組合せを機械的に重複実行する必要はないが、対象となる能力・操作・環境が未検証の
      まま全体を合格としない。実際の正規成果物、操作結果、Git 履歴、必要な検証証拠を確認する。
  - id: AG-607
    content: |
      工程駆動で形成した正規成果物を変更駆動で改訂し、再び工程駆動で利用する双方向の再利用、および
      その逆方向の利用を、同じ有効な正規成果物と採用判断に基づいて実行できる。変更駆動の実行へ工程
      遷移を強制せず、各経路の権限と既存の保存・確定経路の所有境界を維持する。一方の経路の更新結果を、
      他方の経路が古い状態のまま参照・利用しない。
  - id: AG-608
    content: |
      採用済み事項、未決事項、試作、独立した成立済み作業を含む状態で中断・再開する。採用した工程構成に
      基づく実行（単独工程・連続実行）の中断・再開は、実際の正規状態から必要な状態を再構成し、未決を
      自動解消せず、試作を正式採用と混同せず、成立済み作業を不当に重複実行しない。
  - id: AG-609
    content: |
      後継経路への切替と、Local 版で実装を伴う作業を検証する。後継経路の実現・検証・正式採用が成立する
      までは旧経路を維持し、切替時には有効な正規情報・必要な参照・未処理情報を失わない。Local 版では
      実行報告と実際の Git 取り込み結果を独立して照合し、成功報告だけでは取り込み完了としない。
      未検証の後継経路を理由に旧経路を失効させない。

artifact_actions:
  - id: ACT-REQ-601
    artifact: req
    operation: append
    target: docs/requirements/REQ-104.md
    source_items: [AG-601, AG-602]
    content: |
      | REQ-104-009 | 採用規約の解決は、対象作業（工程駆動の各操作、変更駆動の workflow、Case 実行、品質ゲート等、工程構成に基づいて成果物の有無・成立を判定する作業）の実行経路から参照され、解決結果（採用済み工程、工程間関係、必須成果物）が当該作業の判定基準として使われること。読取不能時の判断留保を、宣言なしの移行期デフォルト接続と区別して扱うこと |
      | REQ-104-010 | 採用規約の解決結果は、対象作業の実際の実行とその証拠（正規成果物、操作結果、Git 履歴、検証証拠）とともに確認することで、単独工程・一気通貫実行・両経路共存の成立を判定すること。解決の成立だけを成立判定の根拠としないこと |
      | REQ-104-011 | 採用した工程構成に応じた判定として、詳細工程を採用しない案件では標準案を未採用候補として扱い、複数の詳細工程を採用した案件では採用済み各工程を単独の作業単位として解決できること。未採用の参照工程を判定基準へ含めないこと |
      | REQ-104-012 | 採用済みで必須の成果物の欠落を検出結果として提示し、作成・採用外明示・省略明示のいずれかに分類する根拠確認の実行経路を利用者が辿れること。根拠確認を経ない欠落を工程省略として合格させないこと |
      | REQ-104-013 | 工程の分割・統合・省略の再構成宣言には元の要求・制約・受け入れ条件・検証義務の継承を必須とし、継承宣言なし・空宣言の再構成宣言を受理しないこと |
      | REQ-104-014 | 採用規約の解決と判定の検証は、4状態（有効採用宣言あり、宣言なしで有効運用あり、両方なし、宣言ありで読取不能）と判定規則（未採用参照工程の基準外扱い、採用済み必須成果物の欠落検出、継承宣言必須化）の代表事例を実際の解決経路（公開操作・公開 script CLI）で実行して確認すること。解決器の実装や試験ファイルの存在を合格証拠としないこと |
  - id: ACT-REQ-602
    artifact: req
    operation: append
    target: docs/requirements/REQ-108.md
    source_items: [AG-603, AG-604, AG-606, AG-608]
    content: |
      | REQ-108-025 | 採用した工程構成に基づき、要件確定のみ、設計確定のみ、確定済み設計からの実装・検証のみの各単独工程を、採用規約の解決結果を基準として独立して完了できること。後続実装や Issue・PR を一律に要求しないこと |
      | REQ-108-026 | 単独工程の独立完了は、対象作業に必要な成果物と検証の成立を確認して判定すること。設計確定のみの作業に後続実装を要求しないこと（REQ-111-006、REQ-111-007 の既有義務を維持） |
      | REQ-108-027 | 採用規約で詳細工程を必須としない小規模案件を、要件から必要な設計・実装・検証まで正規利用経路で連続実行できること。不要な工程・独立文書・Issue を強制せず、採用された必要な要求・制約・検証義務を維持すること |
      | REQ-108-028 | 連続実行した事実だけでは未成立の検証を完了扱いとせず、各段階の検証証拠に基づいて完了を判定すること |
      | REQ-108-029 | 採用済み事項・未決事項・試作・独立した成立済み作業を含む状態での中断・再開を、採用した工程構成に基づく実行（単独工程・連続実行）で成立させること。実際の正規状態から必要な範囲だけ継続し、成立済み作業を不当に重複実行しないこと（REQ-108-006 の既有義務に従い、採用した工程構成に基づく実行への適用を明示する） |
      | REQ-108-030 | 変更駆動の既存能力群（自然言語の要求・不具合報告・エラーログからの直接入力、RU からの要件化、Intake・Learning・Backlog から要件化・実行への接続、小規模作業と意味的依存を持つ複数作業・Epic/Wave、既存合意に基づく正規改訂、実変更・検証証拠・安全境界の確認、中断・失敗・再開、重要変更の識別・事前通知・追加通知・結果説明）の維持と、工程駆動の各操作・単独工程・連続実行・GitHub 版・Local 版の検証を、必要な代表事例の割当で行うこと。すべての組合せを機械的に重複実行する必要はないが、対象となる能力・操作・環境が未検証のまま全体を合格としないこと。実際の正規成果物、操作結果、Git 履歴、必要な検証証拠を確認すること。意味を引き継ぐ経路が成立する前に既存能力を失効させないこと |
  - id: ACT-REQ-603
    artifact: req
    operation: append
    target: docs/requirements/REQ-111.md
    source_items: [AG-605, AG-607, AG-608, AG-609]
    content: |
      | REQ-111-029 | 工程駆動の5公開操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review、phase-transition）を GitHub 版と Local 版の正規利用経路で実行でき、各操作の必要な入力、状態、判断、保存結果を正しく扱えること。各操作の既存要求（REQ-110・REQ-111 が正規所有する操作契約）を維持すること |
      | REQ-111-030 | 5公開操作の検証は、各操作・各環境の代表事例で実行記録・保存結果・Git 履歴を照合して行うこと。一部の操作や環境の成功だけで全操作を合格としないこと |
      | REQ-111-031 | 工程駆動で形成した正規成果物を変更駆動で改訂し、再び工程駆動で利用する双方向の再利用、およびその逆方向の利用を、同じ有効な正規成果物と採用判断に基づいて実行できること。変更駆動の実行へ工程遷移を強制せず、各経路の権限と既存の保存・確定経路の所有境界を維持すること。一方の経路の更新結果を、他方の経路が古い状態のまま参照・利用しないこと |
      | REQ-111-032 | 双方向の再利用の検証は、工程駆動で形成した正規成果物の変更駆動による改訂と再利用、および逆方向の代表事例を正規利用経路で実行し、正規成果物・操作結果・Git 履歴で確認すること。採用判断の正本と保存・確定経路の所有境界が維持されていることを照合すること |
      | REQ-111-033 | 採用済み事項、未決事項、試作、独立した成立済み作業を含む状態での中断・再開の検証を、工程駆動と変更駆動の代表事例で行うこと。実際の正規状態から必要な状態を再構成し、未決を自動解消せず、試作を正式採用と混同せず、成立済み作業を不当に重複実行しないことを、正規状態・操作結果・実行記録で確認すること（REQ-111-018 の既有義務に従い、両経路での検証適用を明示する） |
      | REQ-111-034 | 後継経路への切替時に、有効な正規情報・必要な参照・未処理情報を失わないこと。切替の検証は、切替後の正規情報と未処理情報の継続性を切替前の状態と照合して行うこと（REQ-111-013 の旧経路失効禁止の既有義務に従い、切替時の情報保全を明示する） |
      | REQ-111-035 | Local 版で実装を伴う作業の結果確認の検証は、実行報告と実際の Git 取り込み結果（関連コミットの実在確認を含む突合）を独立して照合する代表事例で行うこと。成功報告だけでは取り込み完了としないこと（REQ-111-011 後半の既有義務に従い、実装を伴う作業への検証適用を明示する） |
  - id: ACT-DESIGN-601
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v5-adopted-conventions
    target_area: 解決手順
    source_items: [AG-601, AG-602]
    content: |
      「解決手順」節への追記（target_area: 解決手順）。採用規約の解決を対象作業の実行経路へ接続する構造:
      (1) 接続点 — 解決器の公開操作契約（resolve/evaluate）を、工程構成に基づいて成果物の有無・成立を
      判定する各実行経路（phase 系操作、case 系 workflow、品質ゲート）が呼び出す接続点を定める。
      接続点は解決結果（採用済み工程・工程間関係・必須成果物と、欠落（missing）と根拠ある除外（--exclude）の
      判定結果）を判定の入力として投影する。判定結果の表現は現行 resolver（resolve/evaluate）の出力契約に
      合わせ、新規の状態値を追加しない。(2) 読取不能時の留保 — 読取不能事例は判断留保
      （unresolvable）を返し、宣言なし事例の移行期デフォルト接続（transition-default）とは別の状態として
      返す。留保をデフォルト接続へ自動降格しない。(3) 再構成宣言の受理検査 — 工程の分割・統合・省略の
      再構成宣言は元の要求・制約・受け入れ条件・検証義務の継承宣言を必須とし、
      継承宣言なし・空宣言を schema 検証で拒否する（fail-closed）。(4) 解決だけでの成立判定禁止 —
      解決の成功は判定の入力が揃ったことのみを意味し、対象作業の成立判定は実際の実行と証拠とともに行う。
      既存の解決手順・移行期デフォルト接続・未採用参照例の判定規則の節は変更しない。
  - id: ACT-DESIGN-602
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: 有限作業と実装接続
    source_items: [AG-603, AG-604, AG-608]
    content: |
      「有限作業と実装接続」節への追記（target_area: 有限作業と実装接続）。採用した工程構成に基づく
      単独工程・連続実行の実行接続: (1) 単独工程の実行境界 — 要件確定のみ・設計確定のみ・確定済み設計
      からの実装・検証のみの各単独工程は、採用規約の解決結果（REQ-104-009 の接続）を実行基準として
      参照し、対象作業に必要な成果物と検証の成立を確認して独立完了する。後続実装・Issue・PR の一律
      要求と要件定義への無条件復帰を実行経路に組み込まない。(2) 一気通貫実行 — 採用規約で詳細工程を
      必須としない小規模案件は、正規利用経路（req-define → case-auto、または工程駆動の連続利用）で
      要件から検証まで連続実行し、不要な工程・独立文書・Issue を生成しない。完了判定は各段階の検証
      証拠に基づく。(3) 中断・再開の実行境界 — 採用済み・未決・試作・成立済み作業を含む状態での再開は
      REQ-108-006 の既有義務に従い、実際の正規状態から必要な範囲だけ継続する。既存の実行主体と責務境界
      （case 系 workflow、実行担当 subagent、harness）は変更しない。
  - id: ACT-DESIGN-603
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: 双経路併存と移行
    source_items: [AG-605, AG-606, AG-607, AG-609]
    content: |
      「双経路併存と移行」節への追記（target_area: 双経路併存と移行）。両経路の実行接続と切替の設計補強:
      (1) 5操作の実行接続 — GitHub 版と Local 版の各公開入口は 5操作（phase-tasks-create、
      phase-tasks-update、phase-artifacts-update、phase-review、phase-transition）を同一の操作契約で
      接続し、入力・状態・判断・保存結果（.agentdev/phase/ 配下の保存状態、正規成果物への反映、遷移記録）
      の扱いが両環境で意味上同等になることを確認する。(2) 双方向の再利用 — 工程駆動で形成した正規成果物
      の変更駆動での改訂と再利用、および逆方向は、既存の保存・確定経路の所有境界（case-ready/case-revise
      と phase-artifacts-update、各成果物管理スキルへの委譲）を通し、更新結果を他経路が古い状態のまま
      参照しない（正規成果物の現行版からの再読み出し）。(3) 切替時の情報保全 — 後継経路への切替は
      REQ-109 の意味保存・検証の契約に従い、有効な正規情報・必要な参照・未処理情報の継続性を切替前状態と
      照合する。(4) Local 版の結果確認 — 実装を伴う作業では実行報告と実際の Git 取り込み結果の独立照合
      を実行手順に組み込み、成功報告単独での取り込み完了判定をしない。既存の「双経路併存と移行」節の
      権威継続の記述（REQ-108-012、後継経路採用まで現行経路が正）は変更しない。

conflict_resolutions:
  - id: CR-601
    conflict: |
      AC5 の5操作について、操作契約の正規所有は REQ-110（REQ-110-001〜041）であるが、本ラウンドでは
      REQ-110 への行割当が存在しない（REQ-110 の既存 41 行と TS-001〜014 が操作契約を所有し、本ラウンドの
      draft は REQ-110 への APPEND を行わない）。
    resolution: |
      本 draft の REQ-111-029/030 は操作契約の再述ではなく、GitHub/Local 両環境での実行成立と
      代表事例による検証義務（REQ-111-011 の延長）に限定する。5操作の操作契約レベルの欠落が実装・検証時に
      判明した場合は REQ-110 への APPEND として case-open 時の open item 経由で扱い、本 draft では判断しない。
  - id: CR-602
    conflict: |
      AC1 の4状態解決は REQ-104-008 が既に要求しており、新行が既存行の再述になるリスク。
    resolution: |
      新行（REQ-104-009/010）は状態区分の再述ではなく、解決の実行経路接続（解決結果が対象作業の判定
      基準として使われること、読取不能の留保と移行期デフォルト接続の区別）と、解決だけでは作業成立を
      判定できないこと（RU 指摘の検証義務）の増分に限定する。REQ-104-008 は維持し参照する。
  - id: CR-603
    conflict: |
      既存の採用規約解決器には単独工程・全工程を扱う試験が存在するが、既存能力で満たされると判断した
      項目の合格証拠を何にするか。試験ファイルの存在は実行と合格を証明しない。
    resolution: |
      公開実演原則を採用する。すべての検証（既存能力の維持確認を含む）を公開コマンド・公開 script CLI・
      公開 tool 実行と観測可能な証拠（出力、保存状態、Git 履歴、完了報告）で行う。実装・試験ファイルの
      存在は合格証拠としない。TS-601〜609 の verification/pass_criteria に適用済み。

operation_units:
  - ou_id: OU-601
    source_ru: RU-0260
    target_req: REQ-104
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-602
    source_ru: RU-0260
    target_req: REQ-108
    operation: append
    scale: standard
    depends_on: [OU-601]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-603
    source_ru: RU-0260
    target_req: REQ-111
    operation: append
    scale: large
    depends_on: [OU-601]
    recommended_order: 3
    issue_policy: epic

result: {}

test_strategy:
  - id: TS-601
    target_item: AG-601
    verification: |
      公開 script CLI（agentdev-adopted-conventions の resolve/evaluate）を実際の対象プロジェクト状態に
      対して実行し、4状態の代表事例（有効採用宣言あり、宣言なしで有効運用あり、両方なし、宣言ありで
      読取不能）を構成して解決結果を確認する。読取不能事例で判断留保（unresolvable 相当）が返り、
      宣言なし事例の移行期デフォルト接続（transition-default）と区別されることを出力で確認する。
      さらに、解決結果が対象作業（Case 実行または phase 操作の実際の実行）の判定基準として使われたことを、
      公開経路での実行記録と判定結果で確認する。実装・試験ファイルの存在は合格証拠としない。
    pass_criteria: |
      4状態の代表事例すべてで、読取不能と宣言なしの区別を含む解決結果が公開 CLI の出力として確認でき、
      対象作業の実行経路で解決結果が判定に使われた記録（出力、保存状態、または完了報告）が存在する。
      読取不能事例が移行期デフォルト接続として扱われていない。
    on_failure: |
      fix-and-reverify。解決器の接続または状態判定を修正して再実行する。権限・環境不足で公開経路の
      実行ができない場合は未検証として扱い、合格としない。
  - id: TS-602
    target_item: AG-602
    verification: |
      詳細工程を採用しない事例、複数詳細工程を採用した事例、採用済み必須成果物が欠落した事例、工程の
      分割・統合・省略の再構成宣言を含む事例を、公開 CLI（evaluate、--exclude 等の公開操作契約）と実際の
      対象プロジェクトで構成して実行する。未採用参照工程の不在が採用基準外として欠落に計上されないこと
      （判定分類名は ACT-DESIGN-601 の設計更新で確定）、欠落として検出され根拠確認（作成・採用外明示・省略明示）
      なしでは合格しないこと、継承宣言なし・
      空宣言の再構成宣言が受理検査で拒否されることを出力で確認する。実装・試験ファイルの存在は
      合格証拠としない。
    pass_criteria: |
      各事例の出力が判定規則（採用基準外の欠落不算入・欠落の検出・根拠ある除外）と継承宣言の必須化に一致し、
      根拠確認を経ない欠落の合格と、継承宣言なし再構成の受理が発生していない。
    on_failure: |
      fix-and-reverify。判定規則の適用または再構成宣言の受理検査を修正して再実行する。
  - id: TS-603
    target_item: AG-603
    verification: |
      要件確定のみ、設計確定のみ、確定済み設計からの実装・検証のみの代表事例を、正規利用経路（req-define
      または phase 系操作、case-auto または対応する公開経路）で実行する。各事例で、対象作業の必要な
      成果物と検証の成立を確認する記録（正規成果物、検証証拠）と、後続実装や Issue・PR が一律要求され
      なかったことを示す実行記録を確認する。設計確定のみの事例で後続実装が要求されないことを実行結果で
      確認する。GitHub 版と Local 版のうち対象となる環境の実行記録で確認する。
    pass_criteria: |
      3種類の単独工程事例が独立して完了し、正規成果物と検証証拠が実在し、一律の後続要求が発生していない。
      設計確定のみの事例で後続実装の要求が発生していない。
    on_failure: |
      fix-and-reverify。実行経路の一律要求を除去して再実行する。環境不足で実行できない環境は未検証として
      扱い、全体を合格としない。
  - id: TS-604
    target_item: AG-604
    verification: |
      採用規約で詳細工程を必須としない小規模案件を正規利用経路（req-define → case-auto または工程駆動の
      連続利用）で要件から検証まで実行する。不要な工程・独立文書・Issue が生成されないこと、採用された
      必要な要求・制約・検証義務が維持されること、未成立の検証が完了扱いでないことを、正規成果物・
      操作結果・Git 履歴で確認する。
    pass_criteria: |
      連続実行の完了報告に未成立の検証が含まれない、または含まれる場合は完了扱いでないことが記録で
      確認できる。強制的な工程・独立文書・Issue の生成が発生していない。
    on_failure: |
      fix-and-reverify。強制生成の除去または検証義務の扱いを修正して再実行する。
  - id: TS-605
    target_item: AG-605
    verification: |
      5つの公開操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review、
      phase-transition）を GitHub 版と Local 版の正規利用経路で実行する。各操作で必要な入力・状態・
      判断・保存結果（.agentdev/phase/ 配下の保存状態、正規成果物への反映、遷移記録）を操作結果と実際の
      保存状態・Git 履歴で確認する。対象となる能力・操作・環境が未検証のまま全体を合格としない。
    pass_criteria: |
      各操作・各環境の代表事例で入力・状態・判断・保存結果の照合が完了し、操作の一部・環境の一部だけでの
      全体合格が発生していない。各操作の既存要求（REQ-110・REQ-111 の操作契約）が維持されている。
    on_failure: |
      fix-and-reverify。未成立の操作・環境を特定して修正して再実行する。環境不足で実行できない検証は
      未検証として扱い、合格としない。
  - id: TS-606
    target_item: AG-606
    verification: |
      主な検証事例はS1、S2、S6とする。工程駆動の各操作、変更駆動の既存能力、GitHub版・Local版、単独工程と
      連続実行について、必要な代表事例を割り当てる。すべての組合せを機械的に重複実行する必要はないが、
      対象となる能力・操作・環境が未検証のまま全体を合格としない。実際の正規成果物、操作結果、Git履歴、
      必要な検証証拠を確認する。変更駆動の8能力（直接入力、RU からの要件化、Intake・Learning・Backlog
      接続、小規模・Epic/Wave、正規改訂、実変更・証拠・安全境界、中断・失敗・再開、重要変更の識別・通知・
      結果説明）の代表事例を正規利用経路で実行し、実装着手時点の有効な正規契約が要求する外部的結果と
      検証義務に照合する。実装・試験ファイルの存在は合格証拠としない。S1・S2・S6（S1=小規模な一気通貫開発、
      S2=複数工程の段階開発、S6=工程駆動と変更駆動の共存）の事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md
      「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」の「## 検証事例S1〜S6」節（L553〜574）にある。
      RU-0260 と段階条件の対応は同資料「各RUと段階条件の対応（参照用）」（L613〜626）の P1・P7・P8（合格基準を
      置き換えない）。TS-606 はこの事例定義に対応付けて検証する。
    pass_criteria: |
      8能力の代表事例が正規利用経路で実行され、外部的結果と検証義務が実装着手時の有効な正規契約と
      一致し、未検証の能力・操作・環境を含む全体合格が発生していない。S1・S2・S6 との対応が記録されている。
    on_failure: |
      fix-and-reverify。失効した能力を特定して修正して再実行する。検証不能な項目は合格とせず未検証として
      記録する。
  - id: TS-607
    target_item: AG-607
    verification: |
      工程駆動（phase-artifacts-update）で形成した正規成果物を変更駆動（req-define → case-auto）で改訂し、
      再び工程駆動（phase-review または phase-artifacts-update）で利用する事例、および逆方向の事例を、
      GitHub 版または Local 版の正規利用経路で実行する。双方が同じ有効な正規成果物・採用判断を利用した
      こと、変更駆動の実行に工程遷移の前置が要求されなかったこと、一方の更新後に他方が古い状態を参照
      していないことを、正規成果物・操作結果・Git 履歴で確認する。
    pass_criteria: |
      双方向の連鎖が同じ正規成果物上で成立し、各経路の権限と保存・確定経路の所有境界が維持され、
      古い状態参照が発生していない。
    on_failure: |
      fix-and-reverify。古い状態参照または権限侵害を特定して修正して再実行する。
  - id: TS-608
    target_item: AG-608
    verification: |
      採用済み事項・未決事項・試作・独立した成立済み作業を含む状態を構成し、中断後に再開する事例を、
      採用した工程構成に基づく実行（単独工程・連続実行）および工程駆動・変更駆動の代表事例で実行する。
      再開時に実際の正規状態から必要な状態が再構成されたこと、未決が自動解消されていないこと、試作が
      正式採用と混同されていないこと、成立済み作業が不当に重複実行されていないことを、正規状態・
      操作結果・実行記録で確認する。
    pass_criteria: |
      再開後の状態が正規状態と一致し、4区分（採用済み・未決・試作・成立済み作業）の区別が維持されている。
      成立済み作業の重複実行が発生していない。
    on_failure: |
      fix-and-reverify。状態再構成または重複実行抑止を修正して再実行する。
  - id: TS-609
    target_item: AG-609
    verification: |
      後継経路の切替事例（後継経路の実現・検証・正式採用が成立した状態での切替）を検証し、切替後に
      有効な正規情報・必要な参照・未処理情報が維持されることを正規情報と Git 履歴で確認する。Local 版で
      実装を伴う作業を実行し、実行報告と実際の Git 取り込み結果（関連コミットの実在確認を含む突合）を
      独立して照合する。成功報告だけでは取り込み完了としないことを手順と記録で確認する。未検証の
      後継経路を理由に旧経路が失効していないことを確認する。
    pass_criteria: |
      切替後の情報保全が確認でき、Local 版の突合が実 Git 状態との照合で完了している。旧経路が後継経路の
      実現・検証・正式採用の成立まで維持されている。
    on_failure: |
      fix-and-reverify。情報欠落または突合未了を特定して修正して再実行する。未検証の後継経路による
      旧経路失効が発生している場合は、旧経路を復元してから再検証する。

realization_actions:
  - id: RA-601
    concern: 採用規約解決器の実行経路接続（解決結果を対象作業の判定基準として投影する接続点）
    responsibility: |
      採用規約の解決は agentdev-adopted-conventions が公開操作契約（resolve/evaluate）として所有し、
      対象作業の実行経路（phase 系操作、case 系 workflow、品質ゲート）は解決結果を判定の入力として
      参照する。状態区分と判定規則の正規所有は v5-adopted-conventions Design と REQ-104 が維持する。
    ownership_hints:
      - src/common/skills/agentdev-adopted-conventions/SKILL.md
      - src/common/skills/agentdev-adopted-conventions/scripts/src/resolve.ts
      - src/common/skills/agentdev-adopted-conventions/scripts/src/evaluate.ts
      - src/common/skills/agentdev-adopted-conventions/scripts/tests/
      - docs/designs/foundations/v5-adopted-conventions.md
      - src/common/skills/agentdev-workflow-case-ready/SKILL.md
    intent: |
      解決器が実行経路から利用され、解決結果が判定基準として投影される接続を成立させる。
      解決だけでの作業成立宣言を構造的に防ぐ。単独工程・全工程の既存試験を解決器内部の部品試験として
      維持しつつ、実経路での実演検証（TS-601/602）を成立させる。
    verification_refs: [TS-601, TS-602]
    source_items: [AG-601, AG-602]
  - id: RA-602
    concern: 採用した工程構成に基づく単独工程・連続実行の実行接続
    responsibility: |
      有限実行の実行境界と責務分割は case 系 workflow（case-auto、case-run）と req-define が正規所有し、
      採用規約の解決結果（RA-601 の接続）を実行基準として参照する。単独工程の独立終了は REQ-111-006/007
      の既有義務と整合させる。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md
      - src/common/skills/agentdev-workflow-case-run/SKILL.md
      - src/common/commands/agentdev/req-define.md
      - src/common/commands/agentdev/case-auto.md
      - docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    intent: |
      要件確定のみ・設計確定のみ・実装検証のみ・小規模一気通貫の各実行が、採用基準に従い不要な
      強制なしで成立する実行接続を確保し、連続実行事実だけでの完了判定を防ぐ。
    verification_refs: [TS-603, TS-604]
    source_items: [AG-603, AG-604]
  - id: RA-603
    concern: 工程駆動5公開操作の GitHub/Local 実行接続
    responsibility: |
      5操作の操作契約は phase 系 workflow skill と command 契約、REQ-110 が正規所有する。
      本 RA は GitHub 版と Local 版の公開入口からの実行接続と保存結果の確認であり、操作契約の再定義を
      行わない。
    ownership_hints:
      - src/common/skills/agentdev-workflow-phase-tasks-create/SKILL.md
      - src/common/skills/agentdev-workflow-phase-tasks-update/SKILL.md
      - src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md
      - src/common/skills/agentdev-workflow-phase-review/SKILL.md
      - src/common/skills/agentdev-workflow-phase-transition/SKILL.md
      - src/common/commands/agentdev/phase-tasks-create.md
      - src/common/commands/agentdev/phase-tasks-update.md
      - src/common/commands/agentdev/phase-artifacts-update.md
      - src/common/commands/agentdev/phase-review.md
      - src/common/commands/agentdev/phase-transition.md
    intent: |
      5操作が両環境の正規利用経路で入力・状態・判断・保存結果を正しく扱う実行経路を維持・確認し、
      操作・環境の一部成功での全体合格を構造的に防ぐ。
    verification_refs: [TS-605]
    source_items: [AG-605]
  - id: RA-604
    concern: 変更駆動の既存能力群の維持確認と横断代表事例検証
    responsibility: |
      変更駆動の能力群は req-define、case-auto（case-open〜case-close）、intake・learning・backlog 系
      workflow が正規所有する。本 RA は維持確認の接続と代表事例の割当検証であり、能力の再実装を
      行わない（RU 対象外の遵守）。
    ownership_hints:
      - src/common/commands/agentdev/req-define.md
      - src/common/commands/agentdev/case-auto.md
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md
      - src/common/skills/agentdev-workflow-backlog-auto/SKILL.md
      - src/common/skills/agentdev-workflow-intake-promote/SKILL.md
      - src/common/skills/agentdev-workflow-learning-promote/SKILL.md
    intent: |
      既存能力の外部的結果と検証義務を実装着手時点の有効な正規契約に照らして維持し、代表事例の割当
      検証が未検証の能力・操作・環境を残さないようにする。
    verification_refs: [TS-606]
    source_items: [AG-606]
  - id: RA-605
    concern: 両経路の正規成果物再利用・後継経路切替時の情報保全・Local 版の Git 取り込み突合
    responsibility: |
      成果物の保存・確定経路の所有境界（case-ready/case-revise と phase-artifacts-update、各成果物管理
      スキルへの委譲）と Custom Tool 操作契約（agentdev_gh、local 実装）が正規所有する。両経路の権限と
      所有境界は v51-phase-transition-and-coexistence-model Design が維持する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md
      - src/common/skills/agentdev-workflow-case-ready/SKILL.md
      - src/common/skills/agentdev-workflow-case-revise/SKILL.md
      - src/common/tools/agentdev-gh/
      - src/common/tools/agentdev-gh/local/
      - docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    intent: |
      双方向の再利用が同じ正規成果物上で成立し、切替時の情報保全と Local 版の実 Git 取り込み突合が
      実行経路で成立する接続を確保する。
    verification_refs: [TS-607, TS-608, TS-609]
    source_items: [AG-607, AG-608, AG-609]

review_dispositions:
  - id: RD-601
    source_ru: RU-0260
    source_item: RU6-AC1
    disposition: covered
    reason_code: incremental_append
    reason: |
      4状態の区分要求は REQ-104-008 が既存所有。本 draft は実行経路接続（REQ-104-009）と解決だけでは
      作業成立しないこと（REQ-104-010）、代表事例の実経路検証義務（REQ-104-014）を新設し、REQ-104-008 は
      再述せず参照する。
    evidence:
      path: docs/requirements/REQ-104.md
      section: 要件 (REQ-104-008)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-602
    source_ru: RU-0260
    source_item: RU6-AC2
    disposition: covered
    reason_code: incremental_append
    reason: |
      採用基準解決（REQ-104-003）、誤判定禁止・省略合格禁止（REQ-104-004）、工程再構成の義務不消失
      （REQ-104-005）は既存所有。本 draft は判定の実行経路適用（REQ-104-011）、欠落検出結果の提示と
      根拠確認の実行経路（REQ-104-012）、継承宣言の必須化（REQ-104-013）を新設し、既存行を再述しない。
    evidence:
      path: docs/requirements/REQ-104.md
      section: 要件 (REQ-104-003, REQ-104-004, REQ-104-005)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-603
    source_ru: RU-0260
    source_item: RU6-AC3
    disposition: covered
    reason_code: incremental_append
    reason: |
      設計形成の独立終了（REQ-108-002）、工程単独での確定・終了（REQ-108-003）、有限作業の独立終了
      （REQ-111-006）、確定済み設計からの実装接続（REQ-111-007）は既存所有。本 draft は採用規約の
      解決結果を実行基準とする接続（REQ-108-025）と必要な成果物・検証の成立確認による完了判定
      （REQ-108-026）を新設する。
    evidence:
      path: docs/requirements/REQ-108.md
      section: 要件 (REQ-108-002, REQ-108-003)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-604
    source_ru: RU-0260
    source_item: RU6-AC4
    disposition: covered
    reason_code: incremental_append
    reason: |
      小規模案件の連続実行と段階案件の工程単独確定（REQ-108-003）、要求充足根拠不十分での完了宣言禁止
      （REQ-108-009）は既存所有。本 draft は正規利用経路での一気通貫成立と強制不許可・採用義務の維持
      （REQ-108-027）、連続実行事実だけでの完了扱い禁止と検証証拠基準（REQ-108-028）を新設する。
    evidence:
      path: docs/requirements/REQ-108.md
      section: 要件 (REQ-108-003, REQ-108-009)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-605
    source_ru: RU-0260
    source_item: RU6-AC5
    disposition: covered
    reason_code: incremental_append
    reason: |
      4操作と工程遷移の GitHub/Local 両対応（REQ-111-011）は既存所有。5操作の操作契約の正規所有は
      REQ-110（REQ-110-001〜041、TS-006〜009/011/013/014 の検証義務所在）であり、本ラウンドでは REQ-110 への
      割当を行わない（REQ-110 の既存行が所有）。本 draft は入力・状態・判断・保存結果の扱い（REQ-111-029）と
      代表事例による検証義務・部分成功での全体合格禁止（REQ-111-030）を REQ-111 へ新設する。REQ-110 行
      レベルの欠落判明時は case-open 時の open item 経由。
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件 (REQ-111-011)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-606
    source_ru: RU-0260
    source_item: RU6-AC6
    disposition: covered
    reason_code: incremental_append
    reason: |
      変更駆動経路の独立維持（REQ-111-009）、v4 能力群の外部的結果と検証義務（REQ-111-010）、Intake・
      Learning・Backlog の維持（REQ-108-011）、重要変更の識別・通知・結果説明と検証義務
      （REQ-108-014〜024）は既存所有。本 draft は 8 能力の代表事例割当を含む横断検証義務
      （REQ-108-030）を新設する。既存能力の再実装は行わない。
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件 (REQ-111-009, REQ-111-010)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-607
    source_ru: RU-0260
    source_item: RU6-AC7
    disposition: covered
    reason_code: incremental_append
    reason: |
      変更駆動で確定した正規成果物の工程駆動での参照（REQ-110-008、正規所有 REQ-110・割当対象外）、
      工程駆動で形成した成果物への後続変更の経路（REQ-111-009）、実装開始境界での確定事項・未決・採用
      判断の維持（REQ-111-017）は既存所有。本 draft は双方向の連鎖・権限と所有境界の維持・古い状態参照の
      禁止（REQ-111-031）とその検証義務（REQ-111-032）を新設する。
    evidence:
      path: docs/requirements/REQ-110.md
      section: 要件 (REQ-110-008)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-608
    source_ru: RU-0260
    source_item: RU6-AC8
    disposition: covered
    reason_code: incremental_append
    reason: |
      正規入力からの再開確認（REQ-108-006）、工程駆動経路での再開適用（REQ-111-012）、採用・未決・試作の
      区別の中断・再実行での維持（REQ-111-018）は既存所有。本 draft は採用した工程構成に基づく実行への
      適用明示（REQ-108-029）と両経路での検証義務（REQ-111-033）を新設する。
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件 (REQ-111-018)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-609
    source_ru: RU-0260
    source_item: RU6-AC9
    disposition: covered
    reason_code: incremental_append
    reason: |
      後継経路採用までの旧経路維持（REQ-111-013）、Local 版でのローカル記録と実 Git 取り込み結果の突合
      能力（REQ-111-011 後半）、移行時の意味保存と未処理情報の継続（REQ-109-002〜008）は既存所有。
      本 draft は切替時の情報保全と切替前状態との照合（REQ-111-034）、実装を伴う作業への Local 突合の
      検証適用（REQ-111-035）を新設する。
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件 (REQ-111-011, REQ-111-013)
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: |
    Wave 1（OU-601）: 採用規約解決の実行経路接続。REQ-104 APPEND（009〜014）、
    v5-adopted-conventions Design「解決手順」節の反映、解決器接続と4状態・判定規則の実経路検証
    （TS-601/602）。
    Wave 2（OU-602）: 単独工程・一気通貫実行の実行接続。REQ-108 APPEND（025〜029）、
    v51-phase-transition-and-coexistence-model「有限作業と実装接続」節の反映、TS-603/604 と
    TS-608 の実行境界部分。
    Wave 3（OU-603、Epic 構成）: 5操作・両経路共存・切替・Local 結果確認。REQ-111 APPEND（029〜035）、
    REQ-108-030 を含む横断検証義務、v51 Design「双経路併存と移行」節の反映、TS-605〜609。
    変更駆動既存能力の横断代表事例検証（TS-606、S1/S2/S6 含む）は Wave 2/3 の成立後に実行する。
  wave_hints:
    - Wave 1 が採用規約基準解決の前提であり、Wave 2/3 はその基準を参照する実行接続を含むため Wave 1 完了後に開始する
    - TS-606 の横断代表事例検証（S1/S2/S6 含む）は Wave 2/3 の対象操作・経路の成立後に実行する
    - GitHub 版・Local 版の検証は各 Wave 内で対象環境の代表事例として割り当て、未検証環境を全体合格に含めない
    - |
      S1・S2・S6 の出所注記: S1=小規模な一気通貫開発、S2=複数工程の段階開発、S6=工程駆動と変更駆動の共存。
      事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md
      （題「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」、626行、冒頭に「新しい要求、
      受け入れ条件、合格基準ではない」と明記）の「## 検証事例S1〜S6」節（L553〜574）にある。RU-0260 と段階条件の
      対応は同資料「各RUと段階条件の対応（参照用）」（L613〜626）の P1・P7・P8（合格基準を置き換えない。
      RU個別条件の合格が段階条件の合格を自動証明するわけではない）。TS-606 はこの事例定義に対応付けて検証する
```

# summary

採用した工程構成に応じた単独工程・一気通貫実行と、工程駆動・変更駆動の両正規利用経路の共存を、REQ-104/108/111 への APPEND（19 行）で成立させる要件ドラフトである。採用規約解決の実行経路接続、単独工程・連続実行の実行接続、5公開操作の両環境での実行成立、両経路の正規成果物の双方向再利用、中断・再開での採用状態維持、後継経路切替時の情報保全と Local 版の Git 取り込み突合を増分として定義し、既存行の再述・他 RU 所有能力の再実装・恒久的工程進捗台帳の導入は行わない。すべての検証は公開経路での実演（観測可能な証拠）で行い、実装・試験ファイルの存在は合格証拠としない。
