# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-16: 並列テストプロセスの一時成果物が os.tmpdir() 横断走査で外部残渣として誤検出される

- **問題事象**: bun test フルスイート並列実行下で、archive-builder staging path テストの `os.tmpdir()` 横断 orphan scan が並列プロセスの `trust-archive-*` 一時残渣を検出し、テスト本体と無関係な flaky fail を生じていた（RU-0021）。
- **発生局面**: case-run（REQ-083-001 の flaky 隔離是正。PR #2885 RA-001）。
- **検知方法**: フルスイート並列実行の反復で flaky fail が継続することを case-open 前の観察で検知。
- **根本原因**: テスト固有の一時領域と並列プロセス間で共有される `os.tmpdir()` を走査対象として区別していなかった。
- **自律対応内容**: suite-private TMP/TMPDIR/TEMP 隔離を `mkdtempSync` で実装し、fixture 作成と残渣検査を同一専用領域へ閉じた（PR #2885 で適用済み・マージ済み）。
- **ユーザー確認の有無**: なし（case-run / case-close の検証で解消確認）。
- **Decision/REQ/spec影響**: なし（REQ-083-001 の完了条件として解消済み）。
- **横展開観点**: `os.tmpdir()` を横断走査するテスト・検査スクリプト全般で同種の誤検出が発生し得る。専用領域への閉じ込みは汎用パターン。
- **再発条件**: 新規テストが再びグローバル `os.tmpdir()` を横断走査対象に含めた場合。
- **予防策候補**: 残渣検査を含むテストではテスト固有 TMP を `mkdtempSync` で確保し、検査範囲をその配下に限定する規約化。
- **想定反映先**: REQ-083 隣接資産（trusted-distribution-gate 検査テスト規約）、将来の検査テスト新設時。
- **関連**: Issue #2882（Ref）、PR #2885（Refs）。
- **タグ**: #testing #parallel-flaky #tempdir

---

## 2026-09-16: TEMP に残存する既存 trust-archive-verify 残渣の観察

- **問題事象**: `trust-archive-verify-y0os8C` が本 Case 実行前に TEMP へ残存（作成時刻 2026-09-14）。PRE/POST で増分なし、本 Case の対象外。
- **発生局面**: case-run 検証（REQ-083-001 の orphan 検査 PRE/POST 計測）。
- **検知方法**: 検証時の TEMP trust-archive 残渣 PRE/POST 突合。
- **根本原因**: 過去の verify 系実行が残渣を清理せず放置した痕跡と推定（特定は未実施、対象外）。
- **自律対応内容**: 既存残渣として記録し、本 Case では増分なし（無変動）を確認。
- **ユーザー確認の有無**: なし（記録のみ）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: checker 本体の残渣管理（古い残渣の清掃・期限管理）の別候補。
- **再発条件**: verify 系ツールが TEMP 残渣を清理しないまま運用が続く場合。
- **予防策候補**: checker 本体側の残渣クリーンアップ・期限切れ残渣の掃除導入を検討。
- **想定反映先**: trusted-distribution-gate checker 本体の残渣管理（将来の追跡Issue候補）。
- **関連**: PR #2885（Refs）の Findings 記録。
- **タグ**: #tempdir #residue #cleanup

---

## 2026-09-16: docs_chore の REQ 行 APPEND では traceability の missing-verification（unclassified）が必ず残る

- **問題事象**: REQ 行を新規 APPEND する docs_chore Case では、traceability check の missing-verification（unclassified）が必ず 1 件残る。検証対応要否カタログ（verification-scope-catalog.md）への登録が対象範囲に含まれない場合、case-run では self-decide できず Design確定候補への記録で case-close に引き継ぐことになる。
- **発生局面**: case-run（RU-0022、REQ-053-040 APPEND。PR #2888）。
- **検知方法**: worktree root での traceability check（--req REQ-053-040）で unclassified 検出。
- **根本原因**: 新規 REQ 行は実装直後にはカタログ未登録かつ検証対応宣言なしのため、未分類行として missing-verification に出る。
- **自律対応内容**: case-run では PR 本文「## Design確定候補」へ記録して case-close へ引き継ぎ、case-close STEP-3 Design 状態評価で検証対応任意行としてカタログ登録（commit 673f66a2）して解消。
- **ユーザー確認の有無**: なし（fail-open 運用と Design 確定候補処理で解消）。
- **Decision/REQ/spec影響**: なし（verification-scope-catalog.md への 1 行登録のみ）。
- **横展開観点**: REQ 行 APPEND を含む docs_chore Case の定義時には、カタログ登録を対象範囲に含めるか「## Design確定候補」への記録を想定しておくと case-run の検証差分説明が不要になる。あわせて `generate_indexes.ts` の再生成が req-health-metrics.md の AUTOGEN ブロックを更新する点（REQ 行数変化は README 索引ではなく健康メトリクスへ現れる点）は docs_chore 実装時の既知帰結として想定しておくと検証差分の説明が不要になる。
- **再発条件**: 検証対応要否カタログ登録を対象外とした REQ 行 APPEND Case が続く限り毎回発生。
- **予防策候補**: case-open の検証対応要否分類ゲートで新規行のカタログ登録を同時に確定する運用。
- **想定反映先**: REQ-031 / REQ-032 の Design 確定候補・capture 運用、case-open 分類ゲート。
- **関連**: Issue #2883（Ref）、PR #2888（Refs）。
- **タグ**: #docs-chore #traceability #unclassified

---

## 2026-09-16: REQ/Design の内容変更時は frontmatter updated を必須セットとして同時更新する

- **問題事象**: REQ/Design ファイルの内容変更 commit で frontmatter `updated`（最終更新日、patterns.md 定義）の同時更新が漏れた。機械ゲート（docs-check / targeted docs guard）では検出されず、review-work 品質ゲートの MINOR 所見として後から検出された（REQ-017.md 直近 4 コミット連続で更新慣行あり）。
- **発生局面**: case-run（RU-0023、REQ-017-020 APPEND。PR #2889 初回 commit 4247798c）。
- **検知方法**: review-work Code Quality レーン。
- **根本原因**: 内容変更と frontmatter 更新を必須セットとして扱う運用が慣行止まりで機械ゲート化されていない。
- **自律対応内容**: 第 2 commit 6725eb28 で frontmatter updated を補修（REQ-017.md / delegation-contracts.md / verification-scope-catalog.md）。
- **ユーザー確認の有無**: なし（case-run 内で補修完了）。
- **Decision/REQ/spec影響**: なし（lifecycle メタデータの運用慣行）。
- **横展開観点**: 内容変更 commit には frontmatter 更新を必須セットとして扱うのが安全。機械ゲート不在のため人的レビューに依存している点は同種の REQ/Design 系 Case で再発し得る。
- **再発条件**: frontmatter 更新を伴わない内容変更 commit が続く限り発生し得る。
- **予防策候補**: targeted docs guard への frontmatter 鮮度検査（内容変更と updated の整合）追加を検討。
- **想定反映先**: REQ-053 文書品質系、integrity rules（将来の検討候補）。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #frontmatter #lifecycle-metadata #docs

---

## 2026-09-16: REQ 行本文と Design/カタログの「報告根拠」粒度差は正典 verbatim 原則で意図的に残り得る

- **問題事象**: REQ-017-020 の行本文（正典 verbatim 採用）には「親への不一致報告」が明示されず、Design 箇条書き・検証対応カタログの説明文が報告義務を含む粒度差が残った。
- **発生局面**: case-run（RU-0023。PR #2889）。
- **検知方法**: review-work 品質ゲート意味論所見（非ブロッキング）。
- **根本原因**: 行本文は Issue 本文 Definition Package を正とするため、派生物側の粒度を正に引き上げない判断が正規（正典優先）。
- **自律対応内容**: 現行維持（行本文を変更しない判断を記録）。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 正典 verbatim 採用の REQ 行では、Design/カタログ側がより具体的な粒度を持つ粒度差が構造的に生じる。粒度差の検出自体は品質所見として正常であり、正典側への無断反映はしない。
- **再発条件**: 正典 verbatim 原則で REQ 行を APPEND する Case で派生物側が詳細化する限り発生し得る。
- **予防策候補**: docs 診断（inspect-docs）の DUPLICATE/DRIFT 観点で正典と派生物の粒度差を意図的差異と誤検出差異に分類する観点の整備検討。
- **想定反映先**: REQ-036 inspect 系、REQ-056 Project Knowledge の整備候補。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #canonical-granularity #req-design #verbatim

---

## 2026-09-16: 同種突合規定群への新規定追記時は既存規定との優先順位の非明示が残り得る

- **問題事象**: delegation-contracts.md の既存突合規定（Issue 番号×対象成果物パス不一致時は委譲を開始しない）と新規規定（補助情報不一致時は除去/置換後に委譲開始可）の優先順位が「既存特定規定が優先」と読み解けるのみで明示されなかった。
- **発生局面**: case-run（RU-0023。PR #2889）。
- **検知方法**: review-work 品質ゲート意味論所見（非ブロッキング）。
- **根本原因**: 既存規定（REQ-017-019 対応 2 箇条書き）の改変が対象外のため、新規規定側で優先順位に触れられなかった。
- **自律対応内容**: 記録のみ（対象外変更は実施しない）。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 既存節への追記系 Case では、既存規定の非改変制約と新規定の優先順位明示の両立が課題になる。優先順位の明文化は別途の追跡Issue（REQ-017 隣接）として起票する経路が安全。
- **再発条件**: 対象外制約付きの既存節追記 Case が続く限り発生し得る。
- **予防策候補**: 同種規定群への追記時は優先順位の非明示を PR 本文 Findings へ明示的に記録し、追跡Issue 化の判断材料にする運用。
- **想定反映先**: REQ-017 委譲契約系の将来の追跡Issue、docs 診断の DRIFT 観点。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #precedence #delegation-contracts #docs

---
