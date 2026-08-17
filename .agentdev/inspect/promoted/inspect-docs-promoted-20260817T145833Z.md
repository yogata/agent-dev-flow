# inspect promoted artifact 20260817T145833Z

- **source**: `.agentdev/inspect/inbox/inspect-docs-finding-20260817T145833Z.md`（backlog-auto stage 1 / inspect-docs 定期診断 2026-08-17）
- **source_type**: inspect
- **disposition 経緯**: inspect-promote 暫定分類 → adversarial-review 経路B（2系統独立 stream + counter-challenge + convergence audit）→ HITL 確定: promote 8 / defer 0 / reject 0（2026-08-18 ユーザー承認）
- **本成果物の性質**: promote 採用済み、backlog-review の RU 化対象。前回 defer 確定分（inspect-docs-finding-20260815T082159Z.md、F-15〜17、再確認条件は Epic #2099 case-close 後も draft のままの場合）は本処理の対象外とし inbox へ残置する

## 統合単位 1: REQ-025/026/028 の RETIRE・再構成候補群（F-01〜F-03）

同一の修正形状（一回限りの移行・監査・追加作業に由来する要件行の現行残存）を持つ群。req-define で REQ 単位でまとまった協議を推奨する。
HITL 確定付記: F-02・F-03 は「廃止 vs 恒常契約行への再構成」の判断を req-define 再壁打ちへ委任する。

### F-01: REQ-025 は移行完了状態の RETIRE 候補

- **target**: docs/requirements/REQ-025.md
- **evidence**: 全要件行（001〜004）が「更新する」「追加する」等の反映作業そのもの（REQ-004-009 違反）。適用範囲の `docs/specs/integrity/rules/IR-036-adr-work-means-detection.md` は実在しない（DEC-013 の IR 簡素化で削除済み）。修復内容は完了済み: check_integrity.ts は DEC-NNN 形式の検出を実装、IR-055 ルール本文は `DEC-\d{3}` 形式で ADR 参照残存検出を規定
- **severity**: medium / **confidence**: high
- **source_of_truth**: 現行 REQ（REQ-001 廃止候補判定基準「移行完了状態」「バグ修正由来」、REQ-004-009）+ 実ファイル（rules/ に IR-036 不在、checker 実装）
- **recommended_route**: req-define 再壁打ち（REQ-025 廃止）
- **ng_classification**: pre-existing

### F-02: REQ-026 は作業手段主題の RETIRE 候補（廃止 vs 恒常行への再構成は req-define で判断）

- **target**: docs/requirements/REQ-026.md
- **evidence**: 要件行 001〜003 は「検査を追加する」等の追加作業記述。対象の targeted docs guard 実装は accepted SPEC（docs/specs/integrity/targeted-docs-guard-implementation.md）として実装済み
- **severity**: low / **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-001 廃止候補基準「作業手段主題」）+ 実体（targeted-docs-guard-implementation.md accepted）
- **recommended_route**: req-define 再壁打ち（廃止または恒常契約行への再構成。行 002（frontmatter id と物理 path の不一致検出）は恒常的な検査契約とも読めるため REQ-007/REQ-028 側への吸収も選択肢）
- **ng_classification**: pre-existing

### F-03: REQ-028 は監査作業記録行と恒常契約行の混在（部分 RETIRE 候補）

- **target**: docs/requirements/REQ-028.md
- **evidence**: 目的は「IR の体系全体を監査・再編」の一回限り作業。行 004〜011 は監査・分類・削除の作業記録（KEEP/MERGE/IMPLEMENT/DELETE 分類、lifecycle_state 等の削除実施）で DEC-013（IR 登録モデルの簡素化）で実施済み。行 012（新規 IR 登録 gate）等は恒常契約
- **severity**: medium / **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-004-009）+ 承認済み DEC-013
- **recommended_route**: req-define 再壁打ち（恒常行（012、014 等）の正規の home への移管と作業行の廃止。恒常行の存続判断を含む）
- **ng_classification**: pre-existing

## 個別採用: F-04（proposed Decision を現行判断の根拠として参照）

- **target**: docs/requirements/REQ-002.md（REQ-002-035）→ DEC-015（proposed、2026-08-15）、docs/specs/commands/case-auto.md（accepted、L439 等多数）・case-run/case-close SPEC（accepted）→ DEC-008（proposed、2026-08-09）、docs/specs/foundations/harness-separation-model.md（accepted、L69）→ DEC-015
- **evidence**: REQ-001-021 は「承認状態の判断記録のみを現行根拠として使用」を要求。DEC-008・DEC-015 は frontmatter status: proposed（decisions/README.md も同様）。承認済み SPEC・現行 REQ がこれらを規範的根拠として引用している
- **severity**: medium / **confidence**: high（参照事実は機械的に確定。違反確定は medium）
- **source_of_truth**: 現行 REQ（REQ-001-021）を正として判定。DEC frontmatter 実体
- **recommended_route**: DEC-008/015 の承認完了、または参照の一時的注記のいずれかを要件化
- **ng_classification**: 要ヒューマンレビュー
- **notes（審議結果）**: 「実装先行・Decision 承認待ちの pipeline 状態」としての defer 案は、承認完了の見通しを持たず再確認条件を設定できないため不採用。HITL にて promote を確定。DEC-017（proposed、2026-08-17）は REQ-012/040 の「関連情報」参照のみで現行根拠扱いではないため対象外

## 個別採用: F-05（docs/README.md の Decision 索引が実体より陳腐化）

- **target**: docs/README.md
- **evidence**: (1) Decision 表の DEC-014 行が「（proposed）」表記だが、実体 DEC-014.md は status: accepted（updated 2026-08-14）、decisions/README.md の status 表も accepted。(2) 「実行時パッケージ境界」（L122）と「ローカル版 OpenCode 生成」（L124）が異なるラベルで同一ファイル specs/local/runtime-package-boundary.md へ二重リンク（後者が旧名称残存）
- **severity**: medium / **confidence**: high
- **source_of_truth**: DEC-014 frontmatter（実体）+ decisions/README.md を正とし、docs/README.md の索引表記を検出対象
- **recommended_route**: 軽微な docs_chore（docs/README.md 2行程度の修正）。HITL 確定: backlog-review 経由で処理する（RU 化せず case-open 直接とするかは backlog-review での判断に委任可能）
- **ng_classification**: pre-existing

## 個別採用: F-06（specs/README.md 一覧表の登録対象外ディレクトリ: audits/、baselines/）

- **target**: docs/specs/README.md、docs/specs/integrity/audits/（5ファイル）、docs/specs/integrity/baselines/（1ファイル）
- **evidence**: specs/README.md の登録手順は references/（親 SPEC 行の備考で言及）と rules/（カタログ索引）の配置のみを定義し、audits/・baselines/ はいずれの登録規定にも属さない。6ファイルが一覧表への導線から外れている。spec-health-metrics.md の AUTOGEN 計測表には SPEC として計上されており索引間で扱いが不整合
- **severity**: medium / **confidence**: high
- **source_of_truth**: document-model SPEC「docs/specs/ 直下のドメイン別体系化」と specs/README.md 登録規定
- **recommended_route**: audits/baselines の位置づけ（Report としての配置明示）と登録規定の拡充を要件化
- **ng_classification**: pre-existing
- **notes**: document-model の Report 分類は配置を許容しており、配置そのものは違反確定でない。索引導線の穴として検出

## 個別採用: F-07（廃止済み agentdev-doc-map への参照残置）

- **target**: docs/specs/skills/agentdev-doc-diagnostics.md
- **evidence**: L18、L41、L69、L75 の4箇所が廃止済み配布スキル `agentdev-doc-map`（探索層）を現行の責務分担相手として記述。agentdev-doc-map は REQ-013-002/003 で廃止済み（docmap-reference-audit.md L15）、実体（skill・SPEC）ともに不存在。現行の agentdev-doc-diagnostics SKILL.md は当該スキルを参照しない
- **severity**: medium / **confidence**: high
- **source_of_truth**: 廃止事実（REQ-013 retired、docmap-reference-audit.md）を正とし、draft SPEC 側の記述を検出対象
- **recommended_route**: doc-diagnostics SPEC の確定時修正として要件化
- **ng_classification**: pre-existing
- **notes**: 2026-08-16 の ng21 監査 N13 で See Also の誤参照は処理済みだが、本文4箇所の参照は残置

## 個別採用: F-08（要件行内の移行注記（旧番号・移管記録）残置）— 低優先

- **target**: docs/requirements/REQ-004.md（REQ-004-053「〔分割元 REQ-006-004〕」）、docs/requirements/REQ-017.md（REQ-017-002「REQ-030-004 維持、旧番号 REQ-006-004」）、docs/requirements/REQ-036.md（REQ-036-022「baseline_status は REQ-028-010 へ移管」）、docs/requirements/REQ-006.md（本文「分割記録」節）
- **evidence**: REQ-001-014 は現行文書の本文に再編工程固有の識別子を含めないことを要求。上記4箇所は分割・移管の工程注記を現行本文に保持する
- **severity**: low / **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-001-014）を正として判定
- **recommended_route**: 移行期の追跡要件（REQ-001-040）との両立方法を含めて軽微な整理として要件化
- **ng_classification**: pre-existing
- **notes（審議結果 + HITL 付記）**: 段階移送方針の移行期における追跡目的の注記であり例外候補。分割は 2026-08-14 完了済みで defer に必要な再確認条件を設定できないため promote とし、低優先として処理する

## 参考: 審議経緯と却下・保留

- **reject 0件**: 誤検知相当なし（adversarial-review 経路Bの2系統独立 stream で反証成立した finding なし）
- **defer 0件（新規）**: F-04・F-08 の defer 案は「再確認条件の設定可能性」基準で不採用（いずれも前提状態が確定済み）
- **前回 defer 確定分（本処理の対象外）**: inspect-docs-finding-20260815T082159Z.md（F-15〜17: workflow SPEC 3件の draft status。再確認条件は Epic #2099 case-close 後も draft のままの場合）は inbox に残置
- **intake promoted 成果物との重複**: 2026-08-18 の intake lane で直接重複なしを確認済み
- **docs-check route 候補**（元 finding STEP-3-2 記載、SKILL.md L188 の旧パスリンク等）: 独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める（command 不変条件に従う）
