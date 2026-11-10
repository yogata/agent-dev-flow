---
draft_type: req_draft
topic_slug: adf-simplification-c-gamma-reference-cleanup
status: draft
created_at: "2026-11-10T19:27:41+09:00"
source_rus: []
---

# 要件doc draft: 参照整理一括（E-1・C-γ）— 仮番号参照・権威参照旧指定・呼称世代混在の解決

ADF全体簡素化調査（第50報告・全2,079ファイル評価）に基づく実装計画（第53報告 v8・2026-11-10 利用者承認）の作業項目 E-1（Case 構成 C-γ）として、仮番号参照53ファイル、権威参照の旧指定、呼称の世代混在を実在識別子・現行呼称へ解決する一括参照整理の要件定義。壁打ち相当は実装計画 v8 の利用者承認と req-input（2026-11-10T19:05+09:00）で完了しており、本 draft はその合意内容の構造化である。

## 入力と区別

- 入力（参照専用）: `C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-simplification-c-gamma-reference-cleanup.md`（type: req-input・構造化済み）
- 確定事実（実測）: IR-055（配布物 `src/` 配下への REQ/DEC 識別子参照の新規追加は `runtime-unresolved-reference` の baseline 差分で厳格違反）、試験基線（2026-11-10 C-β完了時の統合直前HEAD 585a60708 での再試験・3分割正規形: 合計5,598試験・既知不合格12件・すべて変更前基準と同一テスト名・変更由来0）、並行実行の存在（別セッションの req-define RU-0271・C-α2・A群）
- 利用者の判断として確定済み: 実装計画 v8 の承認（2026-11-10）、E-1 の対象・受け入れ条件・完了条件・対象外・制約の確定値（req-input は計画§2 E群表・§リスク対応と同一内容）
- 境界外: B1（gate・lib 統合）・B2/B3（規則集約・正本一元化。別 req-input）、形式例示そのものの削除・採番規則の変更、仮番号が指す元報告（第N報告）の再評価、docs/reports/ 配下（履歴記録領域）

## 判断記録

- **STEP-3 既存REQ照合（操作分類: REQ操作なし）**: 参照の実在性・正式識別子保持は既存REQ行の規定だけで成立する（REQ-001-008 安定識別子、REQ-001-013 廃止識別子・廃止文書参照の履歴参照限定、REQ-001-014 現行文書の本文は正式識別子のみ保持）。E-1 は新規の恒久規範を設定しない単発是正（反映作業）であり、既存正規成果物の意味を変えないため CREATE/APPEND/UPDATE いずれも該当しない。配布物側の拘束は既存行（REQ-010-079 IR-055 ratchet 運用、REQ-031-036 配布物参照の抽象化参照規律）が既に規定する。同一計画の先行 Case（C-α1=PR #3986・C-β=#3988）でも、REQ 行の意味変更を伴うもののみ Definition 更新経由とし、意味保存の文書修正は case-run 直接編集としている。廃止済み REQ-057（docs corpus 整合バッチの REQ 化前例）とは、恒久規範を伴わない点で区別する
- **STEP-4 分類ゲート**: 全合意項目は反映作業（変更後仕様の追加・変更を含まない）であり、REQ 行・Design 行の保存対象候補は0件。Design 分離基準該当行なし。よって要件展開の最終分類・Design 分離の閉じた意味評価は発動条件不成立のため生成していない（親判断〔REQ操作なし〕の確定により分類候補集合が空）。変更誘発境界リスク分析（5観点）: dependency boundary（置換先誤特定・superseded 連鎖の誤追跡）→ TS-002、client/server boundary（該当なし。docs・配布物本文のみの変更で外部契約変更なし）、execution boundary（形式例示の誤置換・機械抽出の取り残し）→ TS-001・TS-004、build/runtime boundary（配布物変更に伴う投影整合）→ TS-004、environment propagation boundary（IR-055 baseline・試験基線への伝播）→ TS-003・TS-005
- **STEP-5 Decision判断（Decision不要）**: 評価基準（アーキテクチャ上の重要性・長期的影響・逆転の困難さ）いずれも非該当の意味保存作業。Decision 作成可否条件の作成不可（削除・移行・整理そのものを主題とする Decision は作成しない）ならびに禁止条件（既存文書種別への適合。内容は既存REQ/Design の適用範囲に収まる）に該当。既存 Decision との重複なし（該当する意思決定の変更を含まない）
- **重要変更該当判定**: 既存正規成果物への変更はすべて意味保存の参照・表記修正（単純な参照修正・機械的更新）であり、重要変更の事前通知対象外（軽微な変更として扱う。ファイル数によらず変更の意味で判定）
- **STEP-7 work_type・Scale（docs_chore・standard）**: 対象が docs・配布物の参照整理であり新機能・不具合修正でないため docs_chore。scale は standard（要件の複雑さは単一OU・少数合意項目に収まる。ドラフトは修正候補リスト・影響ファイル一覧等の実装詳細セクションを持たず、対象ファイルの特定は case-run の機械抽出に委ねる。影響ファイル数が既知で多い〔53ファイル超〕が、利用者承認済み計画が単一 Case 構成を固定しており、分解計画の協議〔large 昇格時義務〕は計画承認で充足済み。実行構造は Root Case 単一 execution unit・issue_policy: single を想定）

## Jev 先行評価の記録

- 既存REQ照合判断（observation `20261110T100851Z-0046`）: evaluator q1=REQ操作なし（0.69）・q2=false（0.52）、最終判断 q1=REQ操作なし・q2=false（一致。差異理由なし）。sourceRevision 3896e71564a83990ed61c2ac3853e315e2c0d43c
- 一次の入力検証失敗（observationMetadata の不正フィールド混入）は観測未生成のまま入力を修正して再実行した（観測は成功評価1件のみ）
- 要件展開の最終分類・Design 分離の意味評価は上記のとおり発動条件不成立のため生成していない

## adversarial-review（STEP-8）の記録

- 実施: 2026-11-10、semantic_review（書き込み禁止）委譲。レビュー戦略は入力忠実度・draft-data 内部整合（TS↔AG↔RA 接続）・検証完備（3要素構造・網羅範囲=修正対象列挙一致・5観点リスク投影）・保存ブロッカーの有無
- accepted 2 件（反映済み）: (1) TS-002 の確認記録対象を全修正タイプ（実在識別子への置換・識別子を使わない説明文への置換・参照の削除・呼称の現行統一）へ拡張し記録要素を修正タイプ別に定義の上、RA-002 の verification_refs へ TS-002 を追加（配布物側修正の意味正当性に対する検証接続の欠落を解消）。(2) TS-001 pass_criteria の除外列挙を AG-001 の定義（docs/reports/ 除外と形式例示/根拠示しの個別分類の二分法）へ一致（req-input に See Also 等の第三カテゴリの定めがないため、検出残はすべて個別分類へ従わせる）
- rejected 5 件: TS-006 の test_strategy 適格性（AG-005 の検証方法として適格・3要素完全）、docs/reports/ 除外（AG/TS/RA で一貫）、OU-001 の target なし構造（soft contract・分岐は artifact_actions 空で決定・投影源は realization_actions）、廃止参照扱いと実在識別子解決の整合（REQ-001-013 実文と一致）、auto_gate マーカー該当（抑止対象語なし）。unresolved なユーザー判断事項 0 件
- 残留メモ: req-draft テンプレートは OU の target_req を optional 明記していない（direct_case では対象なし OU が生じ得る）。本 draft の欠陥ではなく正本側の将来論点として記録のみ残す

# draft-data

```yaml
work_type: docs_chore
scale: standard
summary: >-
  ADF全体簡素化計画（第53報告 v8・2026-11-10 利用者承認）の作業項目 E-1（C-γ）として、仮番号参照53ファイル、
  権威参照の旧指定、呼称の世代混在を実在識別子・現行呼称へ解決する一括参照整理を定義する。docs/ 側は実在識別子へ
  解決し、配布物（src/ 配下）は IR-055 baseline 差分0件の拘束下、仮番号参照の削除または識別子を使わない説明文への
  置換で解決する（実在識別子の新規書込みは行わない）。採番規則の形式例示は残す。機械抽出（REQ-{N} 等の検出）→
  形式例示と根拠示しの個別判断→修正の一括実施の手順で実施する。新規の恒久規範は設定せず、既存REQ行
  （REQ-001-013/014 等）の規定だけで要求が成立するため REQ 保存操作は行わない（REQ操作なし・direct_case）。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      E-1 の対象と実施手順。対象は (a) 根拠示しとして使われている仮番号参照（REQ-{N} 等の未解決番号参照。第50報告
      実測では53ファイルに分布）、 権威参照の旧指定（superseded 旧正本・旧条項を指す参照）、 呼称の世代混在
      （変更限定検査の呼称と対象経路の世代混在等）。実施は機械抽出（REQ-{N} 等の検出）→ 形式例示（採番規則の説明の
      ための例示）と根拠示し（実際の条項を指す参照）の個別判断（第31報告 N-002 の区別を適用）→ 修正の一括実施の順で
      行う。形式例示を誤って置換しない。形式例示の残存は意図として記録する。docs/ 側は実在識別子・現行呼称へ解決する。
      docs/reports/ 配下は履歴記録領域として検出・修正の対象から除外する。抽出範囲・検出パターンは着手時に記録し、
      受け入れ確認は同一範囲・同一パターンで再実行する。
  - id: AG-002
    content: >-
      置換先の正当性。置換した参照先が、元の記述が要求する正規の条項・定義であることを置換対象ごとに確認する
      （実在識別子へ置き換えただけでは合格としない）。権威参照の旧指定は置換連鎖（superseded 連鎖）を追跡して現行の
      有効条項へ向き直す。廃止識別子・廃止文書への参照は REQ-001-013 のとおり移行表・履歴節・置換連鎖による履歴参照に
      限定する。呼称の世代混在は現行呼称へ統一する。正当性の確認は docs/ 側・配布物（src/）側の両方の修正箇所に適用する。
  - id: AG-003
    content: >-
      配布物（src/ 配下）の扱い。配布物の本文に新規の REQ/DEC 識別子を書かない（IR-055・runtime-unresolved-reference の
      baseline 差分で厳格違反になるため）。配布物内の仮番号参照は、参照の削除または識別子を使わない説明文への置換で
      解決する。既存の ADF-COVERS コメント行は維持する。完了時点で IR-055 baseline 差分0件とする。
  - id: AG-004
    content: >-
      変更の意味保存と品質基線。既存の正規成果物（REQ/Decision/Design）の意味を変えない（行 ID・条項の意味は不変の
      参照・表記修正）。試験基線（2026-11-10 C-β完了時の統合直前HEAD 585a60708 での再試験・3分割正規形: 合計5,598試験・
      既知不合格12件・すべて変更前基準と同一テスト名）に対し、本変更による新しい不合格を0件とする。リンク・参照検査と
      整合性検査（QG 相当）を合格させる。編集は UTF-8（BOM なし）・行単位の文字列置換で行い、PowerShell 経由の
      全ファイル一括書込みをしない（AGENTS.md 文字コード規律）。
  - id: AG-005
    content: >-
      着手時の並行実行確認。着手時に git fetch で基準コミットからの main の移動を確認し、実装計画§0の対象行が
      変わっていた場合は当該項目を再評価してから着手する。並行実行（別セッションの req-define RU-0271・C-α2・A群）が
      存在するため、書込み前には git pull --ff-only を行い、main が並行して動いている場合は停止してよい。
artifact_actions: []
conflict_resolutions:
  - id: CR-001
    conflict: 参照解決の方針が docs/ 側と配布物側で非対称（docs/ は実在識別子へ解決、配布物は識別子を使わない解決）
    resolution: >-
      実測（IR-055: 配布物への実在識別子新規書込みは baseline 差分で厳格違反）と正規契約（REQ-001-014 は docs 現行文書に
      正式識別子を要求）の双方に従う非対称な方針を採用する。req-input の確定値であり C-β（#3988）と同一の拘束構造。
  - id: CR-002
    conflict: 一括是正を REQ 化した前例（廃止済み REQ-057・REQ-117/REQ-119）と REQ操作なしの判断の違い
    resolution: >-
      E-1 は恒久規範の設定を伴わない単発是正（反映作業）であり、既存REQ行（REQ-001-013/014）の規定だけで要求が成立する。
      現行運用（C-α1/C-β: 意味保存の修正は case-run 直接編集、Definition 更新は REQ 行の意味変更時のみ）に従い REQ 保存操作を
      行わない。REQ-057 は恒久基準（baseline 運用等）を伴うバッチとして REQ 化された経緯で本件と区別する。
operation_units:
  - ou_id: OU-001
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      修正後の機械抽出確認。着手時に用いた抽出パターン（REQ-{N} 等の検出）と同一の範囲・パターンで、管理対象テキスト
      （docs/〔docs/reports/ を除く〕、src/、README 等のトップレベル文書、および原本変更後に同期機構で追随させる投影。
      抽出範囲の全一覧は着手時に PR へ記録する）を再抽出し、検出残を形式例示と根拠示しに個別分類する。個別判断の結果
      （対象ごとの判断根拠と処置）は PR 記録として残す。
    pass_criteria: |-
      根拠示しと分類された仮番号参照の残存が0件。検出残（See Also 等の参照行、テンプレート・採番規則の例示を含む）は
      すべて形式例示か根拠示しのいずれかに個別分類されており、形式例示と判断した残存は全件を一覧化し意図の記録として
      残す。範囲除外は docs/reports/（履歴記録領域）のみであり、検証の網羅範囲と修正対象列挙が一致している。
    on_failure: |-
      fix-and-reverify。残存した根拠示しの仮番号参照は追加修正して同一範囲で再抽出する。形式例示との個別判断に誤りが
      判明した箇所は再判断して処置を更新する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      修正全箇所の正当性確認。実在識別子への置換、識別子を使わない説明文への置換、参照の削除、呼称の現行統一を含む
      全修正箇所（docs/ 側・配布物〔src/〕側の双方）について、修正前の記述が要求する正規の条項・定義・呼称と修正後の
      内容の一致・妥当性を、修正対象ごとの確認記録として PR へ残す。記録要素は修正タイプ別とする: 実在識別子への置換 =
      元参照・置換後参照・対応根拠・置換先条項の実在確認〔ファイル・節〕、説明文への置換 = 元参照の趣旨と説明文の一致の
      根拠、参照の削除 = 削除により文意が保存されることの根拠、呼称の統一 = 現行呼称であることの根拠（正本・用語集等）。
      権威参照は superseded 置換連鎖を追跡して現行有効条項へ到達することを確認する。
    pass_criteria: |-
      全修正箇所に確認記録が存在する（docs/ 側・配布物側の両方を含む）。実在識別子への置換のみで正当性確認を代替した
      箇所が0件。権威参照の置換先がすべて現行の有効条項である。
    on_failure: |-
      fix-and-reverify。修正内容が元記述の要求と一致しない箇所（誤置換先・趣旨を歪む説明文・文意を損なう削除・誤特定した
      呼称を含む）は正しい内容へ再修正し、確認記録を更新して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      IR-055 baseline 差分の確認。配布物（src/ 配下）について runtime-unresolved-reference（IR-055）checker を既存 baseline
      付きで実行し、差分を確認する。あわせて配布物本文の識別子を使わない説明文への置換・参照削除の実施記録を確認する。
    pass_criteria: |-
      baseline 差分0件（src/ 配下への新規 REQ/DEC 識別子参照の追加なし）。既存の ADF-COVERS コメント行が維持されている。
    on_failure: |-
      fix-and-reverify。配布物へ実在識別子を書き込んでいた箇所は識別子を使わない説明文への置換または参照削除へ修正し、
      再検査する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      整合性検査（QG 相当）。リンク・参照検査、integrity suite・check_integrity 相当の整合性検査、配布整合検査
      （distribution boundary・projection）、textlint（配布規則を含む）を、配布物変更を含む前提で実行する。
    pass_criteria: |-
      整合性検査（QG 相当）が合格し、リンク・参照検査が合格する。既知違反の新規発生・悪化がない。配布物変更後の投影整合が
      維持される。
    on_failure: |-
      fix-and-reverify。本 Case 由来の新規違反・悪化は修正して再実行する。検査系の既知基線の扱いは基線記録に従い、
      本 Case が基線を引き上げる変更は行わない。
  - id: TS-005
    target_item: AG-004
    verification: |-
      試験基線の維持確認。本 Case の変更後に全試験（基線と同一の実行形態・3分割正規形）を実行し、不合格件を基線の
      既知不合格12件（合計5,598試験・2026-11-10 C-β完了時の統合直前HEAD 585a60708 での再試験）とテスト名単位で突合する。
    pass_criteria: |-
      新しい不合格0件。不合格は既知不合格12件と同一のテスト名集合（悪化なし）。本 Case 由来の試験修正・試験影響がない。
    on_failure: |-
      fix-and-reverify。本 Case 由来の新規不合格は原因を特定して実装側を修正し再実行する。基線側由来の既知不合格は
      悪化していないことを確認し記録する。
  - id: TS-006
    target_item: AG-005
    verification: |-
      着手時の並行実行確認の実施記録。case-run 着手時に git fetch による基準コミットからの main 移動の確認結果と、
      実装計画§0対象行への影響有無の判定を記録する。書込み前の git pull --ff-only の実施記録を含む。
    pass_criteria: |-
      確認記録が存在し、main 移動により計画§0の対象行が変わっていた場合は再評価の記録が残る。pull --ff-only が競合
      （diverge）で失敗した場合は停止扱いとなっている。
    on_failure: |-
      fix-and-reverify。再評価を要する対象行の変化があった場合は当該項目の再評価を完了してから着手手順をやり直す。
realization_actions:
  - id: RA-001
    concern: docs/ 側の参照整理（仮番号→実在識別子、権威参照の現行正本への向き直し、呼称の現行統一）
    responsibility: 対象文書（docs/requirements・docs/decisions・docs/designs・docs/guides・docs/knowledge・README 等）の参照・表記の正規所有責務（編集は case-run の実現面変更）
    ownership_hints:
      - docs/requirements/**
      - docs/decisions/**
      - docs/designs/**
      - docs/guides/**
      - docs/knowledge/**
      - README.md（docs/reports/ は履歴記録として対象外）
    intent: >-
      機械抽出→個別判断→修正。REQ/Decision/Design ファイルの参照文字列修正は意味保存（行 ID・条項の意味は不変）とする。
      修正箇所ごとの正当性確認記録（TS-002）を PR へ残す。
    verification_refs: [TS-001, TS-002, TS-004]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: 配布物（src/ 配下）の仮番号参照の解消
    responsibility: 配布物本文（src/common/skills/** 等）の参照表記責務。IR-055 baseline 差分0件の拘束下、削除または識別子を使わない説明文への置換
    ownership_hints:
      - src/common/**（配布物。既存 ADF-COVERS コメント行は維持）
    intent: >-
      実在識別子の新規書込みを行わない。投影整合を維持する。配布物側の修正箇所も docs/ 側と同一の正当性確認記録
      （TS-002 の修正タイプ別記録要素）の対象とする。
    verification_refs: [TS-002, TS-003, TS-004]
    source_items: [AG-003]
  - id: RA-003
    concern: 試験基線・検査の実行と差分記録
    responsibility: 品質検査・試験実行の責務（case-run/case-close）
    ownership_hints:
      - bun test（基線と同一の実行形態・3分割正規形）
      - docs-check 相当 integrity suite・check_integrity
      - runtime-unresolved-reference（IR-055）checker
    intent: >-
      基線（合計5,598試験・既知不合格12件）との差分判定・記録。新規不合格0件・IR-055 差分0件・整合性検査合格の証跡を作成する。
    verification_refs: [TS-003, TS-004, TS-005]
    source_items: [AG-004]
review_dispositions: []
assembly_evidence: []
case_open_hints:
  epic_needed: false
  wave_hints: []
```

## 保存後の扱い

- 直接 consumer は case-open（標準経路では `/agentdev/case-auto` 経由）。artifact_actions が空のため Definition 保存操作なし（direct_case。Issue 本文で要件管理）
- 本 draft の削除は case-ready 成功時（REQ-008 一時成果物ライフサイクル）
- 実行基準の正は workflow 実装本体の既存実行契約と repository top-level `traceability/` 配下 sidecar を参照
