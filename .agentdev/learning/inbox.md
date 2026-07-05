# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 一括テキスト是正 Issue が介入 PR により陳腐化し scope-partial PR となる

- **問題事象**: Issue #1418 は「PR #1402 実施後に archive/active.md 参照 11箇所残留」前提で起票されたが、起票時刻（2026-07-05 12:35 JST）より前に PR #1412（同日 00:17）と PR #1415（同日 02:36）が既にリネームを完了していた。結果として 4件の完了条件のうち 3件が起票時点で既達成となり、本 PR の実スコープは learning-capture/SKILL.md の役割是正 1件のみで、example.md 4箇所は QG-3 scope-partial（変更不要）となった。
- **発生局面**: case-open（Issue 起票）/ case-auto draft 連続実行
- **検知方法**: case-run が PR 本文 Findings「Issue 前提の陳腐化」として指摘。case-close が PR 本文から回収し学びとして昇華候補化。
- **根本原因**: RU/inspect 由来の一括テキスト是正 Issue を起票する際、起票根拠となった rg/grep 結果（検出時点の状態）と起票時点の main 最新状態とに時間差があり、その間に別 PR が同一ファイル群を修正した。case-open 側で完了条件の最新妥当性を再検証しなかった。
- **自律対応内容**: case-close QG-4 で完了条件4件を個別に再評価。example.md 4箇所は「archive/active.md 参照の削除」が文字通り達成済み（PR #1412 で deferred.md にリネーム済み、かつ Layer 2/3 の promote 動作記述として事実正確）と判定し record-in-findings でマージを完遂。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用是正 case、REQ-0103 既存要件の範囲内）
- **横展開観点**: inspect-promote → backlog-review → case-open、および case-auto の draft 連続実行で、rg 駆動の一括是正 Issue を起票する全経路に同様の陳腐化リスクがある。
- **再発条件**: (1) RU/inspect が「N箇所の一括是正」を検出し、(2) 検出から case-open 起票までの間に、(3) 別 PR が同一ファイル群を修正した場合。
- **予防策候補**: case-open（docs_chore/bugfix の Issue 化）が完了条件を本文に展開する前に、対象パスで rg/grep を再実行し検出内容が現在も有効か確認する。同日内に複数 PR がマージされている場合は必須。
- **想定反映先**: case-open command（完了条件展開前の最新状態再確認ステップ）
- **関連**: Issue #1418, PR #1419, RU-0016, PR #1412, PR #1415
- **タグ**: `#case-open` `#陳腐化` `#一括是正` `#scope-partial`

## check_changed_docs.ts の --base-ref が main チェックアウト時に空 diff を返し docs guard が false-clean になる

- **問題事象**: case-close Step 3-1 の targeted docs guard（REQ-0158-003）で `check_changed_docs.ts --base-ref <merge-base>` を実行した際、`files_checked: []`・`failures: []` が返り、PR が2ファイル変更しているのに検査対象ゼロの false-clean になった。
- **発生局面**: case-close（Step 3-1 docs guard 実行時）。main ワークツリー上で case-close を実行し PR ブランチを checkout していない状況。
- **検知方法**: `--base-ref 453cf9a8`（merge-base）実行結果の `files_checked: []` を確認時、PR が case-close.md と SKILL.md の2ファイルを変更しているのに空だったため不整合に気づいた。
- **根本原因**: check_changed_docs.ts は `git diff <base-ref>..HEAD` で変更ファイルを算出する。case-close は main ワークツリーで実行され PR ブランチを checkout しないため、HEAD は main の先端（= merge-base と同一）になり diff が空になる。`--base-ref` は PR ブランチ上で実行する前提だが、case-close 手順はその前提を明記していない。
- **自律対応内容**: `--files <PR 変更ファイルの明示パス>` に切り替えて再実行し、`files_checked` に2ファイルが入ることを確認してからマージへ進んだ。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用手順の補完。REQ-0158-003 手順記述の明確化候補）
- **横展開観点**: `--base-ref` を使う整合性スクリプト全般（check_integrity.ts 等）で、main 上で実行して空結果になる同パターンの注意。
- **再発条件**: case-close 等 main ワークツリーで実行するコマンドが `--base-ref` で docs guard / integrity check を起動し、結果の `files_checked` 空を確認せず pass 判断した場合。
- **予防策候補**: (1) case-close Step 3-1 の起動例を `--files`（PR 変更ファイル明示）を標準とする、(2) スクリプトが `files_checked` 空時に warning を出す、(3) case-close 手順に「`files_checked` が空でないことの確認」を追加する。
- **想定反映先**: case-close command Step 3-1、repo-agentdev-integrity/scripts/check_changed_docs.ts
- **関連**: Issue #1425, PR #1426, REQ-0158-003, IR-056
- **タグ**: `#case-close` `#docs-guard` `#false-clean` `#check_changed_docs`

## 順次Wave構成で先行Wave の実装が後続Wave 子Issue の件数前提を陳腐化させる

- **問題事象**: Wave 2 子Issue #1429 は case-open 時点で concrete_id 301件 + concrete_path 2件 = 計303件を是正対象と想定していたが、case-run 実施時には concrete_id 315件 + concrete_path 2件 = 計317件に増加していた。Wave 1 PR #1431（IR-059 ルールファイル定義）と PR #1432（project-extensions SPEC 起動時読込契約）で、これら SPEC/IR ファイル内に concrete_id 参照（REQ-NNNN, ADR-NNNN 等）が新規追加されたため。
- **発生局面**: case-run（Step 5-3 QG-3 staleness check）/ Epic 順次Wave 構成
- **検知方法**: case-run Step 5-3 QG-3 staleness check が Issue 本文の件数と実測値（check_distribution_boundary.ts スナップショット）を比較し乖離を検出。PR #1433 Findings セクションに stale-reference として記録。
- **根本原因**: 順次Wave（Wave 1 → Wave 2）構成で、Wave 1 の実装が concrete_id 参照を新規追加する SPEC/IR ファイルを変更し、Wave 2 の是正対象件数を増加させた。case-open 時点（Wave 1 マージ前）の件数はスナップショットであり、Wave 1 マージ後に陳腐化。
- **自律対応内容**: PR #1433 は実測値317件の全てを是正対象として実装し、check_distribution_boundary.ts = 0件で完了条件を達成。件数表記のズレ（Issue 本文 303 vs 実測 317）は情報提供のみとし、機能的影響なしと判断。Issue は close するため件数表記修正は case-update 候補として intake inbox へ回収。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。case-run QG-3 staleness check が既に機能した事例。REQ-0130-031 運用実績）
- **横展開観点**: 順次Wave構成で「件数」「参照範囲」「ファイル一覧」等の定量的前提を子Issue本文に記載する全ケースで、先行Wave がその前提を変化させるリスクがある。
- **再発条件**: (1) Epic が順次Wave構成を持ち、(2) 後続Wave 子Issue が件数/参照範囲の定量的前提を本文に持ち、(3) 先行Wave の実装がその前提を変化させるファイルを変更した場合。
- **予防策候補**: (1) case-open が件数を子Issue本文に記載する際「Wave 1 マージ後に再計算される可能性」注記を添える、(2) 件数を行動基準にせず「check_*.ts = 0件」を完了条件の主軸にする（本Issue #1429 は既にこの形式で機能）、(3) case-run Step 5-3 QG-3 staleness check を順次Wave では必須実行とする（現状運用で機能）。
- **想定反映先**: case-open command（件数記載時の注意書き候補）、case-run Step 5-3（QG-3 staleness check 順次Wave 必須実行の運用実例）
- **関連**: Issue #1429, PR #1433, Epic #1427, Wave 1 PR #1431 / PR #1432, REQ-0160, REQ-0130-031
- **タグ**: `#case-run` `#qg-3-staleness` `#epic-wave` `#陳腐化` `#件数前提`

## em-dash body 置換の文脈判定パターンと rg 検出時の混在注意

- **問題事象**: 和文 em-dash（` — `）本文横断是正で「参照 — 説明」（リスト項目・見出し・prose の同格・補足・言い換え）パターンが多数（DOC-MAP.md の SPEC 一覧等）を占めた。当該パターンの置換先を全角コロン `：` に統一したが、機械一律ではなく文脈判定が必要。また `rg " — "` はテーブルセル N/A プレースホルダ `| — |` と本文 ` — ` の両方を捕捉するため、検出結果をそのまま置換対象とすると誤置換（`| — |` を `| ： |` にする等）が発生する。
- **発生局面**: docs_chore（em-dash 横断是正）。配布物 docs/skills の表記品質是正時。
- **検知方法**: PR #1435 実装時に `rg " — "` の全ヒットを目視分類し、本文同格（`：` 置換）・テーブルセルプレースホルダ（`-` ハイフン1文字置換）・閉括弧直後（`：` 置換）・メタ参照（保持）の4パターンに振り分けて差分を確認。
- **根本原因**: em-dash は表記用途ごとに置換先が異なる（`mechanical-replacement-rules.md` section 2 パターン A〜D）。`rg " — "` は文字列 ` — ` を含む全行を捕捉するため、用途分類なしの機械置換は誤り。テーブルセル `| — |` は「N/A」意味のプレースホルダであり全角コロン置換は意味破壊。
- **自律対応内容**: 全ヒットを目視分類し、パターン別に置換先を決定（本文同格→`：`、テーブルセル→`-`、閉括弧直後→`：`）。メタ参照（ルール定義書・テンプレート指示で em-dash 文字自体を記述対象とするもの）8件は文書意味保全のため意図的に保持。PR #1435 は193件置換・メタ参照8件保持で完了。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。`mechanical-replacement-rules.md` section 2 が既に判定基準を定義しており、本件はその適用実例）
- **横展開観点**: 文字列検索（`rg`）で機械的に検出できる表記揺れであっても、ヒットごとの表記用途分類なしに一律置換してはならない。検出→分類→パターン別置換の3段階を踏むこと。
- **再発条件**: (1) `rg` 等で特定文字列パターンを横断検出し、(2) ヒット全件を同一置換先で機械置換した場合。
- **予防策候補**: (1) 検出結果をパターン別（表記用途別）に分類してから置換先を決定する、(2) メタ参照（ルール・テンプレートで当該文字を記述対象とするもの）は保持リストとして明示管理する、(3) `mechanical-replacement-rules.md` section 2 のパターン定義を前提とする。
- **想定反映先**: `mechanical-replacement-rules.md` section 2（適用実例の追記候補）、docs_chore 運用
- **関連**: Issue #1434, PR #1435, RU-0022, PR #1122（X-2 follow-up 元）
- **タグ**: `#docs-chore` `#em-dash` `#文脈判定` `#mechanical-replacement-rules`
## inspect-docs スナップショットが case-open 時点で先行 PR により陳腐化している（cross-case）

- **問題事象**: Epic #1436（inspect-docs findings 是正）の case-run（PR #1439, #1440）で、Step 5-3 QG-3 前置 staleness check が両子Issue の完了条件が既に満たされていることを検出。Issue 本文記載の対象件数（#1437: runtime-package-boundary.md の「将来」「plugin-future」2件、#1438: IR-025〜051 の「(追加予定)」21件以上）が現行リポジトリ状態（両方 0件）と乖離。PR は検証記録として empty commit で作成された。
- **発生局面**: case-run（Step 5-3 QG-3 前置 staleness check）/ docs_chore
- **検知方法**: case-run Step 5-3 QG-3 前置 staleness check で Issue 本文の参照件数と現行 grep 結果を比較。両 PR の Findings / Capture候補 セクションに stale-reference として記録。
- **根本原因**: Epic #1436 の case-open 実行時点（inspect-docs 再実行結果を入力とした RU-0027）より前に、別 Epic 由来の先行 PR が該当 findings を解決済み。#1437 は 5a1c965a/8ebe0e98（2026-06-26）、#1438 は 0b6e6428（2026-06-26「IR 表記統一」）。inspect-docs スナップショットがこれら先行マージを取り込んでおらず、case-open が旧状態の件数を子Issue 本文の「参考」として記載した。
- **自律対応内容**: 両子Issue とも verify-only empty commit PR で完了条件充足を検証記録として残し、QG-3 no-deviation でマージ。Issue 本文「参考」の件数記載の陳腐化は cosmetic（完了条件自体は「語が存在せず」で客観的に充足）と判断し case-update では修正せず、本 learning に記録。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。case-run Step 5-3 QG-3 前置 staleness check が既に機能し、cross-case 陳腐化も検出済み。REQ-0130-031 運用準拠）
- **横展開観点**: inspect-docs 由来の RU から case-open を起動する全ケースで、inspect-docs 実行時点から case-open 実行時点までの間に別 PR が対象ファイルを変更した場合に同様の陳腐化が発生する。特に docs_chore は実装規模が小さく先行解決されやすい。
- **再発条件**: (1) inspect-docs 実行、(2) その後別ケースで検出対象が修正されマージ、(3) 元の inspect-docs 結果由来の RU から case-open 起動、(4) case-run Step 5-3 で staleness 検出。
- **予防策候補**: (1) case-open 実行時に inspect-docs スナップショットの鮮度を再検証（対象ファイルの最終コミット日時 vs inspect-docs 実行日時）、(2) case-run Step 5-3 QG-3 staleness check の必須実行維持（現行運用で機能）、(3) Issue 本文「参考」件数は目安と明記し完了条件は grep 結果で客観評価する運用の徹底（現行 QG-3 で実現済み）。
- **想定反映先**: case-open command（スナップショット鮮度再検証検討）、case-run Step 5-3（現行必須実行の運用維持）
- **関連**: Epic #1436, Issue #1437, Issue #1438, PR #1439, PR #1440, 先行 PR 5a1c965a/8ebe0e98/0b6e6428, REQ-0130-031
- **タグ**: #case-run #qg-3-staleness #inspect-docs #cross-case #verify-only

## case-auto 最大自走モードで ADR-0127 フォールバック（インライン実行）が連続事例で発動し続ける

- **問題事象**: case-auto 最大自走モードから起動された case-run 工程（OU-002 Issue #1457 / PR #1458）で、委譲ツール `call_omo_agent(subagent_type="Sisyphus-Junior")` が explore/librarian のみを許可し Sisyphus-Junior 起動を拒否したため、ADR-0127 フォールバック（インライン実行）へ遷移した。OU-001（PR #1456）に続く2回目の発動で、case-auto 最大自走モードでは常態化している。
- **発生局面**: case-auto 最大自走モードでの case-run 実装工程
- **検知方法**: case-run Step 6 で `call_omo_agent` を試行した際、許可リスト制約により Sisyphus-Junior を起動できず、ADR-0127 フォールバック条件（委譲失敗）として検知。PR 本文 Findings / Capture候補 の execution-context 小見出しに記録。
- **根本原因**: oh-my-openagent 提供の `call_omo_agent` は explore/librarian サブエージェントのみを許可する仕様。case-run Step 6（ADR-0128 task() 委譲モデル）が前提とする Sisyphus-Junior 起動と、caller environment の許可リストが整合していない。case-auto 最大自走モードは委譲前提で組まれているため、許可リスト差異がフォールバック連鎖を引き起こす。
- **自律対応内容**: ADR-0127 フォールバック（インライン実行）へ遷移。実装者は Sisyphus-Junior 相当の制約（単一 Issue スコープ、worktree 隔離、test-fix ルール準拠、capture 境界遵守）で原本追記を実施。Step 7 worktree/branch 削除、Step 9 git pull --ff-only まで完遂。
- **ユーザー確認有無**: なし（case-auto 最大自走モード内で自律遷移）
- **ADR/REQ/spec影響**: あり。ADR-0127 フォールバック発動事例の蓄積（OU-002 で2事例目）。ADR-0128 task() 委譲モデルと caller environment 許可リストの整合性が継続課題。
- **横展開観点**: case-auto 最大自走モードで case-run を起動する全ケースで、call_omo_agent 許可リストが Sisyphus-Junior を含まない限り同一パターンが継続する。REQ-0158 docs guard や test strategy 等、委譲先が実施する想定の検査もインライン実施に回るため、検査網の維持確認が必須。
- **再発条件**: (1) case-auto 最大自走モード起動、(2) case-run Step 6 で `call_omo_agent(subagent_type="Sisyphus-Junior")` 試行、(3) 許可リスト制約で拒否 → ADR-0127 フォールバック遷移。
- **予防策候補**: (a) oh-my-openagent 側の `call_omo_agent` 許可リスト拡張（Sisyphus-Junior 追加）、(b) case-run command が caller environment の許可リストを事前検出して task() とインライン実行を自動選択するフォールバック判定の明示化、(c) ADR-0127 フォールバック時でもインライン実施内容が Sisyphus-Junior 相当の検査網（targeted docs guard / IR-056 / test strategy）を漏れなく実施するテンプレ整備。
- **想定反映先**: ADR-0127（フォールバック発動事例の追記候補）、case-run command Step 6（caller environment 事前検出とフォールバック判定の明示化）
- **関連**: Issue #1457, PR #1458, ADR-0127, ADR-0128, OU-001 (PR #1456, Issue #1455)
- **タグ**: `#case-auto` `#case-run` `#adr-0127-fallback` `#task-delegation` `#inline-execution`
