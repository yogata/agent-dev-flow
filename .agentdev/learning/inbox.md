# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-10-20: Bun.YAML 重複パスキーの last-wins shadow により sidecar 追記が無効化される

- **問題事象**: traceability/agentdev-workflow-req-define.yaml の implementation ロール配下に同一パスキーの重複ブロックが2組存在し（6f414e5ff 時点からの構造的負債）、Bun.YAML の last-wins 解釈で先行ブロックが実効無効化されていた。DEL-3816-1 が shadow される側（先行）ブロックへ REQ-004-064/065 宣言を追記したため、追記が実効読み取りされず、PR 本文の検証差分申告「対象20行の欠落が全件解消」と case-close QG-4 の missing 検出（REQ-004-064/065 missing-implementation）が乖離した
- **発生局面**: case-close STEP-2 QG-4 のトレーサビリティ 3 完全性ゲート（canonical main 上の check で missing 検出）
- **検知方法**: case-close QG-4 独立再検査（--req 対象20行 check）が PR 本文の申告と乖離する missing を検出。停止記録（issuecomment-6279710115）で原因の機械実測（bun v1.3.6 での parse 実測）を実施
- **根本原因**: sidecar への追記が「同一キーの既存ブロックへの統合」ではなく「重複キーを新設する追記」となり、YAML の last-wins 解釈で先行ブロック全体が shadow された。検出系は shadow 後の実効集合を見るため追記が黙って捨てられ、申告と実測が乖離するまで気付けない
- **自律対応内容**: PR #3819 で重複2キーを統合解消（union を単一ブロックへ保存・71エントリ集合一致を機械検証）。canonical main 上で対象20行 check exit 0 を再実測して解消を確認
- **ユーザー確認の有無**: なし（case-close 停止記録の差し戻し指示に基づく機械的修正）
- **REQ/Decision/Design影響**: なし（本件は sidecar 更新手順の運用知見。重複パスキー事前検出の構造的予防は intake 候補として回収済み）
- **横展開観点**: 全70 sidecar を node 線形走査で再確認済み（本ファイルのみ重複）。他の YAML 宣言的データ（policy.yaml・extension yaml 等）への追記・更新でも同一リスクが成立し得る
- **再発条件**: sidecar 等の YAML 宣言的データへ「既存キーのブロックと同一キー」の追記を行った場合
- **予防策候補**: sidecar 追記・更新は「同一キーの既存ブロックへの統合」を正規手順とする。重複キー検出の導入（check の malformed-declarations 拡張等）は intake 候補として回収済み
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3816・PR #3818・PR #3819・停止記録 issuecomment-6279710115・対応記録コメント（本 Case）
- **タグ**: #traceability #yaml #sidecar

---

## 並行 merge により draft 合意の REQ 行採番が消費され case-open 適用前検証で差し戻しが発生

- **問題事象**: req-draft-heading-scan-code-fence（2026-10-20T00:20 合意）の case-open 実行時、REQ-004-064/065 が並行 merge acf86dd5a（PR #3817、2026-10-20T06:54）で追加済みであり、draft の REQ-004-064〜066 が採番衝突した。docs/designs/commands/req-define.md も同 merge で frontmatter updated と ADF-COVERS 宣言行が変わり target_content_sha256 が陳腐化した
- **発生局面**: 実装（case-open STEP-3 の artifact_actions 適用前検証。Root Case #3820）
- **検知方法**: STEP-3 手順 1.5 の採番衝突検査（REQ-004.md 既存行 ID 突合）と assembly_evidence の target_content_sha256 と現行 HEAD の突合
- **根本原因**: req-define 合意時点の採番対象行が、case-auto 起動までの間に別 Case（一式 20261019T231959JST）の Definition merge で消費される非同期競合。draft は保存後も採番し直しを持たない
- **自律対応内容**: 適用を中止し非公式補完（番号振り直し・部分適用）を行わず、req-define への差し戻しと blocked 報告を実施。draft・関連 jev 観測3件は先行 commit c6258ce08 で永続化済み
- **ユーザー確認有無**: なし（case-open スキル契約 STEP-3 手順 1.5 の fail-closed 差し戻しの機械的適用）
- **Decision/REQ/spec影響**: なし（既存契約どおりの動作。契約変更不要。適用前検証が並行 merge を確実に検出した）
- **横展開観点**: REQ 行追加を含む全 draft の case-open 適用で同一競合が成立し得る。採番衝突検査と sha256 突合の有効性を実証した
- **再発条件**: draft 合意時点から case-open 適用時点の間に、同一 REQ ファイルへの REQ 行追加を含む Definition merge が入る場合
- **予防策候補**: 契約側の追加は不要（手順 1.5 が検出済み）。運用上は case-open 実行開始の早期化が陳腐化窓を縮める
- **想定反映先**: learning-promote による評価・昇華
- **関連**: .agentdev/drafts/req-draft-heading-scan-code-fence.md・Root Case #3820・merge acf86dd5a（PR #3817）
- **タグ**: #case-open #採番衝突 #並行merge #fail-closed

---

## worktree の .opencode junction 供給が切れると配布依存境界 link profile が zero-targets fail-closed する

- **問題事象**: worktree では main 側で junction 供給される .opencode/skills/agentdev-*・commands/agentdev・tools・plugins が不在となり、配布依存境界 link profile が zero-targets で fail-closed する（checker の警告文もこの確認を促す）。検出が構造的であり、実装問題と誤認しやすい
- **発生局面**: case-run STEP-S5-1 配布依存境界 最終 gate（Root Case #3820、worktree .worktrees/3820-fix）
- **検知方法**: link profile checker の zero-targets 事前警告と初回実行の fail-closed
- **根本原因**: worktree へは git 管理外実体（junction・node_modules）が伝播しない構造的制約
- **自律対応内容**: worktree 内 src/** 向け junction を再作成してから link profile を再実行し、ok・failures 0・scanned 485 を確認（証跡 .agentdev/tmp/dist-gate-final-link.json 初回分）
- **ユーザー確認有無**: なし（未追跡の環境整備であり、管理対象ファイルへの変更なし）
- **REQ/Decision/Design影響**: なし（checker 実行契約 Design の既存 fallback 契約どおりの運用）
- **横展開観点**: worktree 実行の link profile・checker 依存検査全般に同一前提が成立。junction 再作成→再実行の手順が安定する
- **再発条件**: worktree 内で .opencode/** junction を前提とする checker を junction 再作成なしに実行した場合
- **予防策候補**: worktree 作成手順への junction 再作成前置の明示（検証時のみ。削除は worktree remove 前に junction エントリのみ）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: 実装PR #3822 本文 検証差分（case-run link profile 行）・Root Case #3820
- **タグ**: #worktree #junction #配布依存境界 #link-profile

---

## record-comments.ts applySection のセクション置換で直前空行が消え見出しが前文に接続する

- **問題事象**: case-close STEP-5-2 の本文結果セクション更新で applySection（agentdev-workflow-case-run scripts/record-comments.ts）を用いたところ、置換対象セクションの直前に空行があっても `before` 末尾の `\n+` が剥ぎ取られ、`## 進行状況`・`## 結果` の見出しが前文行へ直接接続した（GitHub 描画は成立するが Markdown 構造が崩れる）
- **発生局面**: case-close STEP-5-2 本文更新（Root Case #3820、commit 1968b0ac 済み Case の Issue 本文更新）
- **検知方法**: issue_update 前の適用後本文の目視確認（glued headings の機械チェックを追加して検出）
- **根本原因**: applySection の `${before}\n${sectionMarkdown}` 連結が `before` の末尾空行を保持しない
- **自律対応内容**: 適用後に `\n## 見出し` へ空行を補完する後処理を実施してから GitHub 書込み
- **ユーザー確認有無**: なし（書込み前の整形後処理）
- **REQ/Decision/Design影響**: なし（出力の整形問題であり、セクション構築・適用の契約は不変）
- **横展開観点**: Epic 本文更新（applyEpicChildStatusUpdates は行内置換で影響なし）を除き、applySection 経由の Issue 本文更新全般に成立し得る
- **再発条件**: applySection で既存セクションを置換した場合（新規追加時は base 末尾に空行が付くため不成立）
- **予防策候補**: applySection の連結前に before 末尾へ空行 1 行を保証する修正（record-comments.ts 側）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: agentdev-workflow-case-run/scripts/record-comments.ts applySection・Root Case #3820 対応記録コメント
- **タグ**: #record-comments #applySection #issue-update

---
