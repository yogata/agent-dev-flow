## 実行識別情報

- adf_delegation: DEL-3282-1
- 対象 Case: #3278（Root Case）/ Epic #3280 Wave 2-1
- 実行単位: standard（adf_execution_unit: standard）
- 対象 Issue: #3282（RA-003: 正典REQ行の語彙・参照横断更新 + README索引・AUTOGEN 再生成）
- worktree: .worktrees/3282-docs（branch docs/issue-3282、base origin/main = ec762dc5）

## 概要

RA-003「正典REQ行の語彙・参照の横断更新（所有権移動を伴わない再分類）」の実現面として、旧判断モデル語彙（一意性中心・状態ベース引き上げ・新しい意味判断トリガ）を REQ-096/DEC-048 の新モデル語彙（判断方法3分類・確定権限3分類・原因別処理）へ機械的に再分類し、REQ-003-055 廃止由来の dangling 参照を REQ-096 参照へ再結線した。README 索引・AUTOGEN は現行性を確認（再生成不要・鮮度 findings 0）。

## 変更内容

| ファイル | 変更 |
|---|---|
| docs/requirements/REQ-005.md | REQ-005-029「新しい意味判断」語彙の再分類（委譲された裁量 / 人間に留保された判断） |
| docs/requirements/REQ-006.md | REQ-006-114 resume_command 判定語彙の原因別化（REQ-096-005 参照化） |
| docs/requirements/REQ-031.md | REQ-031-004 blocked 判定の原因別化 + case-run 裁量範囲の確定権限ベース記述（REQ-096-014/005 参照） |
| docs/requirements/REQ-034.md | REQ-034-038 停止理由の原因別化 + 非中央判断者性の明示（REQ-096-015 参照） |
| docs/requirements/REQ-036.md | 目的節 + REQ-036-018 の REQ-003-055 参照を REQ-096 確定権限3分類へ再結線 |
| docs/requirements/REQ-037.md | 目的節 + REQ-037-003 の REQ-003-055 参照を REQ-096 確定権限3分類へ再結線 |
| docs/requirements/REQ-038.md | 目的節 + REQ-038-002 の REQ-003-055 参照を REQ-096 確定権限3分類へ再結線 |
| docs/requirements/REQ-041.md | REQ-041-008 の REQ-003-055 promote 系共通原則参照を REQ-096-018 へ再結線（dangling 解消） |
| docs/requirements/REQ-061.md | REQ-061-002/021 の自動確定・受理評価を確定権限ベース化（正規契約からの導出 / 人間に留保された判断） |
| docs/designs/workflows/v4-delegation-contracts.md | 185行付近「一意に回答可能」を「正規契約から導出可能」語彙化 |

- REQ-003-021/022/023 は文言無変更で残置（#3279 済みの委譲時境界残置と参照先再結線の現行性を検証で確認。本 PR での REQ-003.md 差分はなし）
- README 索引（docs/README.md・docs/requirements/README.md・docs/decisions/README.md・docs/designs/quality/req-health-metrics.md）: generate_indexes.ts 実行結果 no changes（現行性確認済み）

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| 実装後スライス検証 | TS-021（自変更対象パス rg スライス: (a) REQ-003-055/056 残存参照・(c) 「一意に確定」自律確定語彙） | pass（(a) 残存は REQ-003.md:56 の移管記録行のみで対象外・(c) 0件） | 既出 0 / 新規 0 |
| 実装後スライス検証 | TS-003（変更対象 REQ ファイルの状態のみを理由とする人間判断要求規則 rg スライス） | pass（自スコープ 0件。トリガは人間に留保された判断（REQ-096-005）に基づく） | 既出 0 / 新規 0 |
| 実装後文言確認 | TS-012（REQ-031-004: 委譲された裁量と対象範囲・完了条件・受け入れ条件変更の区分） | pass（REQ-096-014 参照で裁量範囲と除外を明記） | 既出 0 / 新規 0 |
| 実装後文言確認 | TS-013（REQ-034-038: 非中央判断者性と工程制御の裁量適用） | pass（REQ-096-015 参照文言を追加） | 既出 0 / 新規 0 |
| 実装後文言確認 | TS-016（promote系3REQ 自律確定基準の確定権限ベース化） | pass（正規契約からの導出または委譲された裁量の範囲で判定する文言へ更新） | 既出 0 / 新規 0 |
| トレーサビリティ | agentdev-traceability check --req（対象18行・9検出項目） | pass（main baseline と findings 完全一致。missing-design 増分 0 / policy-invalid 0 / duplicate-inconsistencies 0 / unknown-req-refs 0） | 既出（missing-design 9行・missing-implementation 4行・missing-verification 5行は main 既存のまま増分なし） |
| 索引派生物 | generate_indexes.ts（--root worktree） | pass（no changes / already up-to-date） | 既出 0 / 新規 0 |
| 索引派生物 | check_autogen_freshness.ts --json | pass（findings_count: 0・6 files scanned） | 既出 0 / 新規 0 |
| 文章品質 | textlint 共通基盤（agentdev-textlint-guard gate.ts --root worktree） | pass（544 files inspected・0 hard violations） | 既出 0 / 新規 0 |
| UTF-8 健全性 | 変更 10 ファイルの BOM/CR/U+FFFD 決定的検査 | pass（BOM なし・CR なし・U+FFFD なし） | 既出 0 / 新規 0 |
| targeted docs guard（コミット前） | check_changed_docs.ts --workflow case-run --files（10ファイル明示指定） | pass（failures 0 / warnings 0・files_checked 一致） | 既出 0 / 新規 0 |
| targeted docs guard（コミット後） | check_changed_docs.ts --workflow case-run --base-ref main | pass（failures 0 / warnings 0・files_checked 10） | 既出 0 / 新規 0 |

## 完了条件との対応

- [x] REQ-003-021/022/023 が文言無変更で残置され、参照先が新モデルへ再結線済み（#3279/#3281 で確立された現行性を検証確認）
- [x] REQ-005-029・REQ-006-114・REQ-031-004・REQ-034-038・REQ-061-002/021 を新モデル語彙（判断方法3分類・確定権限3分類・原因別処理）へ更新
- [x] REQ-036/037/038 の目的節 REQ-003-055 引用を REQ-096 参照化し、REQ-036-018/REQ-037-003/REQ-038-002 を確定権限ベースの判定文言へ更新
- [x] REQ-041-008 を REQ-096-018 参照へ更新し dangling を解消
- [x] v4-delegation-contracts.md の「一意に回答可能」を「正規契約から導出可能」語彙へ更新
- [x] generate_indexes.ts 実行（no changes）+ check_autogen_freshness findings 0 + docs/README.md 手書き文（現行 REQ 58件等）の現行性確認
- [x] 自スコープの TS-003・TS-012・TS-013・TS-016・TS-021 検査 pass
- [ ] 変更は PR として main へ merge 済みであること（完了証拠: Issue closed・PR merged）→ 本 PR の merge で成立（case-close 責務）

## adversarial-review 発動記録

非発動。Issue #3282 の adversarial-review 発動契約「該当なし（ユーザー明示指定なし）」に従い、発動条件判定の結果、呼出を行わなかった。

## Design確定候補

なし。本変更は合意済み draft-data（RA-003）の機械的適用であり、新規の schema・enum・判定表・アルゴリズム等の Design レベル詳細は生じなかった（参照先の詳細基準は既存の v4-responsibility-boundaries Design「ADF判断アーキテクチャ詳細基準」節が所有）。

## Findings / Capture候補

- REQ-034-032（bounded parent decision resolution の正典行）には「一意に回答可能」語彙が残存する。本 Issue の対象範囲は REQ-034-038 のみのため未変更。v4-delegation-contracts.md:185 側は本 PR で「正規契約から導出可能」へ語彙化済みであり、正典行側の語彙移行を将来の語彙横断パス候補とする（intake候補）
- REQ-036-021 は自動昇格 opt-in の条件語として「機械的に特定可能で移行先が一意に定まる高確信度」を使用する。REQ-096-004 が禁止するのは確信度を人間判断要求の根拠とすることであり本行は別文脈（自動化の許可条件）だが、語彙の現行性観点で将来確認候補（learning候補）

Refs #3282, #3280, #3278
