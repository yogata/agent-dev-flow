# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-10-03 case-open（OU-002・Case #3333）yomiyasu 適用順序違反

- 問題クラス: workflow deviation（工程順序違反）
- 発生工程: case-open（case-auto 配下の並行委譲実行。Root Case #3333・Definition PR #3343）
- 内容: case-open の project extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の yomiyasu-application-before-write ルール・REQ-098）は docs 編集前と agentdev_gh 書込み前の yomiyasu 読込・lint 確認を要求するが、委譲実行者は workflow SKILL.md の制御平面（6 STEP）のみを根拠に進行し、Design 編集と Issue/PR 投稿後に extension ルールを発見した。遡及適用（3 対象へ lint 実行・保持理由を PR 検証欄へ記録）で回復したが、書込み前適用の契約に反した
- 学び: workflow 委譲実行時は制御平面（SKILL.md/references）に加え、project extension（`.agentdev/extensions/skills/<workflow>.yaml`）を STEP-1 の入力解決時に読み込むべき。SKILL.md の Capability Skill 連携節に `agentdev-project-extensions` が列挙されていても、docs 編集・GitHub 書込みといった具体的な適用契機は extension 側 rules にしか書かれておらず、extension 未読込のまま進むと fail-open 性質上、適用漏れが silently 継続する
- 提案: case-open の STEP reference（root-case-and-definition-package.md の STEP-2 前の手順等）へ「STEP-1 で project extension を読み込み rules の適用契機を確認する」明示の追加候補（intake 候補としても成立）
- 発見元: Case #3333（backlog-pool-20261003・OU-002）実行時の自工程観測

## 2026-10-03: REQ-032 frontmatter updated 乖離は case-open 実測時点で既に解消済みだった（RU 実測時点との時間差陳腐化）

- **問題事象**: draft AG-005（RU-20261003-05・base 95d32719 実測）は REQ-032.md frontmatter updated（2026-09-29）≠ 最終内容変更コミット日（2026-10-01）の乖離を想定したが、case-open 実測では 7f163676（#3310）で updated 修正済みで一致しており、ACT-REQ-005 は実変更なし判定になった
- **発生局面**: case-open STEP-4 実変更判定（Case #3336・OU-005）
- **検知方法**: ACT-REQ-005 の合意文言「実コミット日を実測して設定」に従い git log 実測（最終内容変更コミット 76e43819・frontmatter 修正コミット 7f163676 の diff 実測）
- **根本原因**: RU の base 実測時点と case-open 実測時点の間に他 Case の merge が入り、frontmatter 是正が先行適用されていた
- **自律対応内容**: 実測一致を確認して REQ-032.md を変更対象から除外（実変更なし判定を Root Case #3336・PR #3346 本文に記録）
- **ユーザー確認の有無**: なし（合意文言の適用で決定的に判定可能）
- **Decision/REQ/spec影響**: なし（draft 合意の文言が実測適用を前提としていたため契約内の判定）
- **横展開観点**: draft の ARTifact 実測前提（特に frontmatter 日付・baseline 状態等の可変メタデータ）は case-open で再実測して初めて実変更判定すべき。RU 実測時点の前提を鵜呑みにせず再実測する規律は case-open Design の canonical Definition 比較に既に存在するが、可変メタデータ系 ACT では特に効く
- **再発条件**: RU 生成から case-open の間に他 Case が同一ファイルの meta 情報を merge した場合
- **予防策候補**: case-open 冪等確認時の canonical 再実測を可変メタデータ系 ACT に対して明示化する（現行規約で既に担保済みのため、観点の明示のみ）
- **想定反映先**: なし（規約上の想定内動作。再発時に規約改訂を再検討）
- **関連**: Case #3336・PR #3346・draft req-draft-backlog-pool-20261003（AG-005・ACT-REQ-005）
- **タグ**: #stale-assumption #frontmatter #case-open

---

## 2026-10-03: REQ-003-055 phantom NG は参照文言の履歴参照化だけでは解消されず NG baseline 登録が必要

- **問題事象**: REQ-003.md:56 を履歴参照形式へ是正後の worktree HEAD 実測でも check_integrity の phantom 系 NG 3件（REQ-003-055・REQ-003.md:56・v4-responsibility-boundaries.md:44/:67）が残存。REQ-082.md:12 の REQ-003-030 は baseline-known（preserved-history-or-out-of-scope・INFO 降格）で処理されるのに対し、REQ-003-055 は NG baseline 未登録のため NG 計上される
- **発生局面**: case-open STEP-4 の PR 作成前 checker 実測（Case #3336・OU-005・PR #3346）
- **検知方法**: check_integrity --root <worktree> --classification のレポート（IR-067 referenced-req-row-existence）
- **根本原因**: checker は「REQ-003-055」トークンを REQ 行参照として機械的に検出し、文言の履歴参照明示（「当時の行番号帯であり…廃止」）では検出を抑制できない。REQ-003-030 は既に NG baseline 登録済みだが REQ-003-055 分が未登録
- **自律対応内容**: 文言是正（ACT-REQ-003/004）は draft 合意どおり適用し、NG 残存を PR 本文の検査証跡と残課題に記録。case-run 段階の TS-005（on_failure: fix-and-reverify）で provenance 付き NG baseline 登録（または checker の履歴参照判定対応）へ対処する前提を明示
- **ユーザー確認の有無**: なし（artifact_actions に baseline 登録 ACT が含まれない draft 合意の範囲内処理）
- **Decision/REQ/spec影響**: TS-005 pass_criteria（phantom 系 NG 0件）の達成には NG baseline provenance 登録が必須という依存が判明。REQ-010-079（baseline provenance 契約・OU-008）との接続候補
- **横展開観点**: 廃止済み REQ 行への参照残存の是正では「文言の履歴参照化」と「NG baseline 登録」がセットで初めて phantom NG が解消される。ghost 行参照の是正 ACT を作る際は baseline 対応を同時に確認すべき
- **再発条件**: 廃止済み REQ 行 ID を本文に含む文言を是正し、baseline 登録を伴わずに checker を通す場合
- **予防策候補**: artifact_actions の参照是正系 ACT の template に「NG baseline 要否の実測確認」を案内するか、TS 定義側で baseline 登録を検証手順に含める
- **想定反映先**: learning-promote での評価・必要なら docs/knowledge への知見保存または traceability/REQ-010 系文書の追補
- **関連**: Case #3336・PR #3346・REQ-010-069/079・Issue #3293 Wave 1 finding（phantom citation 起点）
- **タグ**: #phantom-citation #ng-baseline #check-integrity #ir-067

---
