# inspect promoted 20260923T050218Z

> 本ファイルは inspect-promote（2026-09-23 実施、/agentdev/backlog-auto stage 2 inspect レーン経由、--auto なし）の promote 採用済み成果物である。元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20260923T050218Z.md`（GUIDE-1 のユーザー承認により全件 promote 確定したため、promote 処分の inbox 削除契約に従い元 finding ファイルは inbox から削除済み。本ファイルが分類・承認の正の記録。既知 defer 5件は各残置ファイルに inbox 残置）。
>
> 分類確定: promote 3件（README-1、REQ-1 は自律確定 / GUIDE-1 はユーザー承認による確定）/ 既存 defer 継続 5件（F-04/F-05/GUIDE-6/F-10/F-12、自律確定）。
> 対論型レビュー: in-context 審議（2系統独立反証 → counter-challenge → convergence → convergence audit）。README-1/REQ-1 への反証4件はすべて棄却。GUIDE-1 は unresolved 1件として HITL 移送ののち、ユーザー判断で promote 確定（下記 GUIDE-1 の承認証跡参照）。
> Jev 先行評価（vercel-ai-gateway / typesafe-ai/jev、観測 20260923T054728Z-4f4a）: 暫定分類妥当性 true（p=0.84）、defer 継続確信度 高い確信（0.82）。LLM 判断と一致（補正なし、confidence 0.83）。

## README-1: docs/README.md の Decision 索引が DEC-041 を未反映（索引乖離 DRIFT）

- **disposition**: promote（2026-09-23 自律確定。現物検証済みの明確な不整合、正規情報源特定済み、分類に本質的競合なし）
- **category**: README 索引診断 / Decision 状態乖離 DRIFT
- **target**: docs/README.md Decision 節（L80「現行 Decision は DEC-001 から DEC-040 の39件である」の記述と Decision 一覧表）
- **evidence**: 実在 DEC ファイルは 40件（`docs/decisions/DEC-*.md` 実在突合）。DEC-041（Wave 構成純度と実行並列上限の単一所有）は commit e1415a88（2026-09-23、docs(decisions): DEC-041 を受理評価により accepted へ遷移）で accepted（frontmatter `status: accepted` 現物確認）。docs/decisions/README.md 側は baseline table（L57）・ステータス別ビュー（L102）・関連 REQ 表（L247）すべてへ DEC-041 反映済み。一方 docs/README.md のみ39件記述が残存し、Decision 一覧表に DEC-041 行が欠落（実在 DEC 全件との突合で DEC-041 のみ欠落を機械確認）
- **severity**: medium / **confidence**: high
- **source_of_truth**: 実体 Decision ファイル（frontmatter `status: accepted`）と docs/decisions/README.md（分類ビュー、DEC-041 反映済み）を正とし、docs/README.md の索引記述を乖離と判定
- **ng_classification**: 今回修正対象（DEC-041 accepted 遷移当日（2026-09-23）の取込み漏れ。docs/README.md の Decision 節は AUTOGEN ブロック外の手動管理区間のため自動同期されない）
- **req-define入力案**: docs/README.md の Decision 節記述を「DEC-001 から DEC-041 の40件」へ更新し（superseded 7件・proposed 0件の現状記述は維持）、Decision 一覧表へ DEC-041 行「Wave 構成純度と実行並列上限の単一所有」を追加する。decisions/README.md は同期済みのため docs/README.md 単独の修正で足りる
- **adversarial-review**: 反証1「手動管理区間の記述揺れは許容される」→ 手動管理は更新義務の免除ではなく取込み漏れの温床であり、同期済み decisions/README.md との差分が乖離の証拠となるため棄却。反証2「accepted 当日のため次回更新で自然解消する」→ Decision 節は AUTOGEN ブロック外で自動更新機構が存在せず、放置すれば乖離が恒久化するため棄却

## REQ-1: REQ-001 本文に検証履歴 HTML コメントが残留（検証証跡カテゴリ）

- **disposition**: promote（2026-09-23 自律確定。機械的残留の現物確認済み、除去方向は一意、分類に本質的競合なし）
- **category**: 文書分類一貫性 / cleanup 対象カテゴリ（検証証跡の残留）
- **target**: docs/requirements/REQ-001.md:83（要件テーブル外、REQ-001-069 直後）
- **evidence**: `<!-- verified: case-run #1813 - REQ-001-056..060 acceptance criteria + TS-001/TS-003/TS-004 PASS, Design consistency confirmed (document-model.md, agentdev-decision-guidelines.md) -->`（現物行確認）。commit 7bdfe281（2026-07-27、[#1813] REQ-001 APPEND の内容検証完了）由来。REQ-001-003 は「将来案、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果を記述対象外」規定（REQ-001.md:19）。document-model.md も検証実行結果（REQ-001-003）を Design の保持対象外に列挙（L41）し「検証実行結果を Design に保持しない」を規定（L452）。REQ-012-035 は「個々の検証実行結果を TIM に保持しないこと」、REQ-021-019 は実行結果を Issue/PR/QG 側が扱うことを規定
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001（基準構造の記載範囲、REQ-001-003）・document-model Design（検証証跡の保持禁止）・REQ-012-035 を正
- **ng_classification**: pre-existing（2026-07-27 の commit 7bdfe281 由来、少なくとも 2026-09-01 以降の inspect サイクルで未検出のまま残置）
- **req-define入力案**（cleanup モデル RETIRE 適用候補）: REQ-001.md:83 の検証履歴 HTML コメント1行を除去する。証跡は Issue #1813 と git 履歴（commit 7bdfe281）に残存するため情報欠損しない。処置実行は後続 Case の責務
- **adversarial-review**: 反証1「document-model の保持禁止は Design 限定で REQ への直接規定ではない」→ REQ-001-003 自体が検証実行結果・作業履歴を REQ 側の記述対象外とし、REQ-012-035/REQ-021-019 が実行結果の正規配置を Issue/PR/QG 側に定めるため棄却。反証2「検証結果の参照として有用」→ 証跡は Issue #1813 側に正規配置済みで REQ 内重複保持の必要性がないため棄却

## GUIDE-1: req-case-flow.md の case-run「3フェーズ構成」表記が正規フェーズ名と不一致

- **disposition**: promote（2026-09-23 ユーザー承認による確定。STEP-6 HITL 照会に対する選択 A）
- **approval_provenance**: ユーザー判断 2026-09-23 15:49 JST（選択 A「promote 採用」、interaction 種別 clarify）。ユーザー明示の判断根拠: フェーズ名の乖離は機械検証済みの事実であり、修正は局所範囲であること。本承認により STEP-6 の HITL フォールバックが解決し、STEP-7 処理実行（本保存）へ進んだ。
- **category**: guides 意味診断 / 横断契約矛盾（軽微）
- **target**: docs/guides/req-case-flow.md:63（「3フェーズ構成でべき等な再開ポイントを提供する」）、:71-75（3フェーズ構成表: 準備〔Issue 読取り、worktree 作成、Plan 策定〕/ 実装 / 提出）
- **evidence**: case-run の正規 3フェーズは「準備・委譲・クリーンアップ」（`agentdev-workflow-case-run` SKILL L41「準備・委譲・クリーンアップの3フェーズを順次実行する」現物確認、STEP-S1〜S6 構成）。ガイド表の「Plan 策定」は case-run 本体 STEP に存在せず、実装方針の形成は adapter 委譲内へ移転済み（REQ-015-010「case-run 本体は実装方針を生成・審査せず…agentdev-case-run-execution-adapter の委譲契約内」現物確認）。同ファイル L84 に「現行の case-run STEP 構成…の正は、REQ-031（case-run 実行契約）と `agentdev-workflow-orchestration` スキルが所有する」の正規 delegation 文あり
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-031（case-run 実行契約）・`agentdev-workflow-case-run` SKILL（準備・委譲・クリーンアップ）を正とし、ガイドのフェーズ名・工程内容の不一致を検出事項とする
- **ng_classification**: pre-existing（v4 single workflow 収斂（commit 86adcab2 前後）以降の表記）
- **adversarial-review**: 2系統独立反証で promote 主張側（案内層として正確性を損なう）と L84 正規 delegation 文による概要許容側の反証が互いに決定打ちせず、unresolved 1件として収束せず → HITL 移送（採否の意味判断）。自律確定を見送った理由は、解釈の余地（概要許容 vs 同期要 vs 対応不要）が採否を左右する意味判断だったため。ユーザー判断により解釈の余地は解消
- **hitl決定記録**: 2026-09-23 HITL パケットで提示した選択肢 (A) promote 採用 / (B) defer（inbox 残置・次回再評価）/ (C) reject（概要表現として許容・即時削除）のうち (A) を選択。(B)(C) は不採用。
- **req-define入力案**（ユーザー選択 A の適用範囲）: docs/guides/req-case-flow.md の case-run 節（L63・L69-75 の3フェーズ構成表）を正規フェーズ構成（準備・委譲・クリーンアップ）へ同期し、委譲内サブエージェント作業（Plan 策定、実装、テスト、docs/designs 整合性確認等）が 委譲フェーズに対応することの注記を併記する。実装方針形成が adapter 委譲契約内（REQ-015-010）にある旨を案内文として明記。修正は当該ガイドファイルの局所範囲に限定（ユーザー判断根拠どおり）。実修正は後続の RU 化（backlog-review → req-define → case）経由で実施
