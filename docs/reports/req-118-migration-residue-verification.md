# REQ-118 移行期残置対応宣言の検証記録（Case #3983）

Epic #3964（RU-0270）の close 記録（comment 6720643954）が移行期残置として残件化した
トレーサビリティ対応宣言 missing 5 件（REQ-118-002 implementation・REQ-118-001/002/004
verification・REQ-119-007 verification）について、実際に成立している検証実績との一致を
確認し、正規の検証記録として整備した結果を記録する。

## 前提（移行期残置の経緯）

- 対応実体の旧実装（verification-resources-ledger.ts 等）は RU-0270 の旧機構撤去
  （PR #3977・commit bf71f18df）で正規に撤去された。撤去時点で上記 5 件の対応宣言は
  実体消滅の帰結として missing になり、#3972 close（SSoT コメント
  issuecomment-6717238931）・Epic #3964 close は「解消は対応宣言の正規作成または REQ 行
  retired 化・policy.yaml 変更を伴う後続変更で行う」と判断記録を残した。
- 本記録は「対応宣言の正規作成」経路の実行である。REQ-118・REQ-119 の要件行・
  policy.yaml は変更していない（AG-012: REQ-119-007 は履歴行として行変更しない）。
- traceability/policy.yaml は verification default: required であり、本対象 5 行は
  optional 未登録（対応必須）のまま解消する。

## 検証環境と方法

| 項目 | 内容 |
|---|---|
| 対象版 | main f5e62380c（Epic #3964 close 後・検証時点の origin/main と同一） |
| 実測方法 | 対象文書・実装の直接確認（行番号付き読取・文言突合）と、既存検証実績（SSoT コメント・PR 本文・close 記録）の参照先照合 |
| 再実施しない範囲 | 過去の AC 判定（#3972 SSoT コメント・TS-008 実績）そのものの再試験。本記録は参照先実績の存在・内容・対象要件行との意味対応の確認である |

## REQ-118-001（verification）: 一時資材の作成・把握・回収・引継ぎ・報告の原則

要求範囲の要素と、それを実際に立証した検証実績の対応:

| 要求要素 | 立証した検証実績（所在） | 判定 |
|---|---|---|
| 実行担当が許可された範囲で一時資材を作成・利用できる | AC-03 シナリオ実測（issuecomment-6717238931・2026-11-08 13:13-13:15 JST）: `.agentdev/tmp/` 作業専用領域内で追加一時領域 `ac03-additional/` を自律作成 | pass |
| 発生させた一時資材を把握する | AC-03: 回収対象列挙に追加領域を含め、計画時未記載を理由に除外しない（反例不在を証明） | pass |
| 成果物と検証証拠を保存したうえで回収 | AC-04 実測: 作成 → 読み戻し検証 → 証跡を SSoT コメントへ回収前に保存 → 回収。AC-08: 回収後に一時資材アクセスなしで読み戻し可能 | pass |
| 利用終了時に安全に回収する | AC-04: 回収直前の同一性・範囲確認（実在物列挙 + 保護対象明示）→ 個別承認なしの自律回収 → 回収後確認（専用領域不存在・他作業資材保持） | pass |
| 継続利用する資材の引継ぎ | AC-07 実経路実績（DEL-3969-1 → DEL-3969-2・PR #3975 本文記録）: 中断時の残留変更の再特定・再確認・引継ぎ | pass |
| 未処理事項の報告と完全完了扱いの禁止 | REQ-118-008 側の機構（close-acceptance fail-closed・申告だけでは成立を認めない）と実績（#3971 close 記録 6716873938 の humanConfirmed 区別）が隣接して成立。本行の原則は adapter SKILL.md の報告義務文言で実装（implementation 宣言済み） | pass |
| 共通適用（検証作業を中心に一時的な副作用を伴う作業へ） | AC-10 類型確認（類型 1: #3967 → PR #3973・類型 2: #3966/#3970/#3971 の TEMP・stash・証跡退避・worktree 利用・類型 3: 伝達・手順・停止経路の維持を AC-05 で行使） | pass |

過去の受け入れ条件変更の確認: REQ-118-001 を optional 登録する変更・行変更は存在しない
（policy.yaml・REQ-118.md の git 履歴で確認）。

## REQ-118-002（implementation・verification）: ADF と実行担当の責務分担

### implementation（今回整備する対応宣言）

現行の責務分担を実装する実体と、REQ-118-002 の各要素との対応:

| 実装実体 | 実装する要求要素 | 確認 |
|---|---|---|
| `src/common/skills/agentdev-case-run-execution-adapter/SKILL.md` | 「実行担当AIエージェントは…を所有」の委譲契約（result 契約・検証実施・一時資材の作成報告・報告義務）と「ハーネス固有の内部状態、起動方式、資材管理の実装方法を共通契約へ取り込まない」（external execution boundary と harness execution mechanism の区分化。「本 adapter skill は external execution boundary への委譲点として機能し、harness execution mechanism は ADF 規範所有対象外として扱う」） | L9〜L94・boundary 区分節の実在を確認 |
| `src/common/skills/agentdev-workflow-case-open/SKILL.md` | 「ADF は、作業目的、対象範囲、受け入れ条件…実行担当への作業条件の引渡し…を所有」の実行（Root Case 本文の対象要件・実現方針・完了条件への検証義務記録と Definition Package の引渡し） | 完了条件テンプレート構造の実在を確認 |
| `src/common/skills/agentdev-workflow-case-run/SKILL.md` | 委譲 prompt による作業条件の引渡し実行（委譲単一化・result 4 状態の受領） | 委譲契約節の実在を確認 |

design 対応（verification-resource-lifecycle.md）は RU-0270 で全面改稿時に責務分担節
（「ADF は…を所有」「実行担当AIエージェントは…を所有」の明記）として維持されており、
本行の design covers は欠落していない。

### verification

| 要求要素 | 立証した検証実績（所在） | 判定 |
|---|---|---|
| ADF 側の所有（目的・範囲・受け入れ条件・検証水準・環境条件・副作用境界・引渡し・完了評価） | AC-01 伝達経路 3 層の実物照合（issuecomment-6717238931）: (1) Issue 本文完了条件への検証義務記録（case-ready 確定の execution contract の投影）(2) 委譲 prompt の検証実行の指針・delegation-contract-summary (3) PR 本文の後片付け行。AC-02: 予見環境の必要条件の引渡し（Issue 本文実現方針・委譲 prompt・knowledge doc の整合）。完了評価: AC-06 の受入評価実績・close-acceptance 機構（REQ-118-008 宣言済み・22 pass の close-acceptance.test.ts） | pass |
| 実行担当側の所有（検証方法選択・資材準備・作成・利用・追加環境条件対応・回収・結果確認・報告） | AC-03/04 シナリオ実測: 追加領域の自律作成（計画未記載への対応）・安全な回収・結果確認。AC-08: 報告経路への結果返却。実績補強: PR #3975（中断からの再開引継ぎ）・各 PR 本文の後片付け行実測 | pass |
| ハーネス固有の内部状態・起動方式・資材管理の実装方法を共通契約へ取り込まない | adapter SKILL.md の boundary 区分化（external execution boundary のみ規範所有・harness execution mechanism は references/harness-delegation.md へ分離）と v4-delegation-contracts.md「検証用一時資材の作成・報告義務」節が harnes 非依存の文言のみで規定。REQ-118.md 目的節の「ハーネス固有の実装・内部状態管理への介入」対象外宣言と整合 | pass |

## REQ-118-004（verification）: 一時領域の確保と利用

| 要求要素 | 立証した検証実績（所在） | 判定 |
|---|---|---|
| 原則: 実行環境の標準的な一時領域に作業専用の領域を確保して利用 | Case #3961 実績（close コメント 6707566880・削除提案 1）: 環境指定 TEMP 配下 `C:\WINDOWS\TEMP\adf-del-3961-1\` に案件専用領域を確保し退避ログ 66 件を管理。RU-0270 後も #3966 が同構成で利用（PR #3976 記録） | pass |
| 必要な場合: 既存の配置規則と権限に従い、リポジトリ内の作業領域や許可された外部環境を利用できる | AC-03/04 シナリオ実測: リポジトリ内作業領域 `.agentdev/tmp/verify-3972-ac03-ac04/` を確保して作成・検証・回収。#3970/#3971 は `.agentdev/tmp/3971-verify/` 等で証跡退避（PR #3978 記録） | pass |
| 具体的なファイル名・作業用ディレクトリ名・削除コマンド・内部管理方法の事前確定を一律に要求しない | AC-03: 計画時に記載していない追加一時領域を、事前確定の不在だけを理由に除外せず自律作成・回収対象に包含。adapter SKILL.md 作成報告文言は「許可された範囲（既存の配置規則と権限…）」の境界表現で具体名の事前確定を要求しない | pass |

## REQ-119-007（verification）: adapter SKILL.md 作成先文言の Design 正本追随（履歴作業単位）

| 検証義務（TS-008） | 立証した検証実績 | 判定 |
|---|---|---|
| SKILL.md の作成先文言が Design 正本の修正後規定と整合 | 履歴実績: PR #3963 検証差分 TS-008（語彙一対一突合・merge 6c6a4bd14・Case #3961 完了条件 7 項目 [x]）。RU-0270 の Design 全面改稿に伴う再整合: PR #3974（merge 5c472052d）で作成・報告文言を現行 Design へ再整合し、Design 本文（verification-resource-lifecycle.md「旧機構の撤去」節）が「実行委譲先 adapter SKILL の作成・報告文言は本Designの修正後規定へ再整合済み（両配置で src/common と .opencode を含む）」と明記 | pass |
| 旧文言の grep 0 件（原本と投影先） | 履歴実績: PR #3963 TS-008（「案件専用領域」「案件識別子をパス要素に含む」「案件スコープの専用領域」で原本 grep 0 件・AC-09 の機械検索 11 シンボル + 旧文言 5 種で実行経路・参照残存 0 件を issuecomment-6717238931 記録）。今回再実測: 現行 adapter SKILL.md（L94）は現行 Design の「許可された範囲（既存の配置規則と権限に従う…）」境界文言と一致し、旧境界文言を含まないことを確認 | pass |
| SKILL 変更と作成ヘルパーの機械的判定基準文言整合の記録 | 履歴実績: PR #3963 TS-008（`verification-resources-ledger.ts evaluateCreationDestination` 判定文言突合の記録）。作成ヘルパーは RU-0270 で撤去（AG-008 の正規内容）されたため、現行では適用対象外。推移（履歴達成 → RU-0270 撤去 → 現行は Design 本文参照への整合維持）を本表のとおり記録 | pass |
| 両配置（src/common と .opencode）の確認 | 履歴実績: PR #3963（junction readlink 突合・投影同期確認）。RU-0270 再整合 PR #3974 も両配置を含む（Design 明記） | pass |

REQ-119-007 の行自体は履歴作業単位として行変更しない（AG-012）。本検証は当該履歴作業が
実施され検証された事実と、撤去後の現行において SKILL.md が現行 Design と整合している
事実の双方を記録する。

## 判定まとめと対応宣言

| 対象行 | 軸 | 判定 | 整備した対応宣言 |
|---|---|---|---|
| REQ-118-001 | verification | pass | `docs/reports/req-118-migration-residue-verification.md`（本記録）を agentdev-case-run-execution-adapter sidecar へ登録 |
| REQ-118-002 | implementation | pass | adapter SKILL.md・case-open SKILL.md・case-run SKILL.md へ登録（本記録の implementation 節の対応表どおり） |
| REQ-118-002 | verification | pass | 本記録を agentdev-case-run-execution-adapter sidecar へ登録 |
| REQ-118-004 | verification | pass | 本記録を agentdev-case-run-execution-adapter sidecar へ登録 |
| REQ-119-007 | verification | pass | 本記録を agentdev-case-run-execution-adapter sidecar へ登録 |

対応宣言は traceability check の構造検査（invalid-artifact-paths・duplicate-inconsistencies
含む 11 検査）で検証する。過去の完了記録（#3971 close・#3972 close・Epic #3964 close）は
本件で書き換えていない。移行期残置判断の継承記録は各 close 記録のまま残り、本記録は
その残件（正規解消）の実行記録である。
