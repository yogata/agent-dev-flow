# inspect-docs finding 20260817T145833Z

backlog-auto stage 1（/agentdev/inspect-docs）による定期診断。前回残置の defer 検出事項（inspect-docs-finding-20260815T082159Z.md）は対象外とし、本ファイルは今回の新規診断結果のみを保持する。

## サマリ

- スキャン対象: 現行 REQ 37件（要件行計 558行）+ retired 4件、Decision 17件、SPEC 169ファイル（docs/specs/ 配下 md 全体、基盤6ドメイン + commands/skills/workflows + rules/references/audits/baselines）、guides 12件、README 3種（root / docs / specs / requirements / decisions）、配布物（src/opencode/commands/agentdev 19 command + templates、src/opencode/skills agentdev-* 41スキル）
- 検出件数: 8件（RETIRE 候補 3、横断契約矛盾 1、README・索引不整合 2、廃止由来記述残置 1、移行注記残置 1）
- high severity: 0件（medium 6件、low 2件）
- 機械的検査の総合結果: REQ ID 一意性・id↔ファイル名整合 0違反、配布物内部 ID 汚染 0件、配布物 UTF-8 BOM 0件・CRLF/LF 混在 0件（作成対象外の node_modules 同梱 README を除く）、存在しない command 参照 0件、配布物 H1/H2 見出し重複 0件、壊れた括弧・参照残骸 0件、要件行数は req-health-metrics AUTOGEN 計測（2026-08-17）と一致

## 検出事項リスト

### F-01: REQ-025 は移行完了状態の RETIRE 候補

- **id**: F-01
- **category**: 6観点 RETIRE（移行完了状態・作業手段主題）
- **target**: docs/requirements/REQ-025.md
- **evidence**: 全要件行（001〜004）が「更新する」「追加する」等の反映作業そのもの（REQ-004-009 違反）。適用範囲の `docs/specs/integrity/rules/IR-036-adr-work-means-detection.md` は実在しない（DEC-013 の IR 簡素化で削除済み）。修復内容は完了済み: check_integrity.ts は DEC-NNN 形式の検出を実装（L561〜572、L4127）、IR-055 ルール本文は `DEC-\d{3}` 形式で ADR 参照残存検出を規定。シグナル3（作業行主題 / 移行完了 / 対象ファイル不存在）
- **severity**: medium
- **confidence**: high
- **source_of_truth**: 現行 REQ（REQ-001 廃止候補判定基準「移行完了状態」「バグ修正由来」、REQ-004-009）+ 実ファイル（rules/ に IR-036 不在、checker 実装）
- **recommended_route**: inspect-promote → backlog-review（req-define 再壁打ち: REQ-025 廃止）
- **ng_classification**: pre-existing
- **notes**: 他 REQ からの規範依存なし（README 索引と DEC-013 の関連記述のみ）

### F-02: REQ-026 は作業手段主題の RETIRE 候補

- **id**: F-02
- **category**: 6観点 RETIRE（作業手段主題・実装完了）
- **target**: docs/requirements/REQ-026.md
- **evidence**: 要件行が「検査を追加する」等の追加作業記述（001〜003）。対象の targeted docs guard 実装は accepted SPEC（docs/specs/integrity/targeted-docs-guard-implementation.md）として実装済み。シグナル2（作業行主題 / 実装完了状態）
- **severity**: low
- **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-001 廃止候補基準「作業手段主題」）+ 実体（targeted-docs-guard-implementation.md accepted）
- **recommended_route**: inspect-promote → backlog-review（req-define 再壁打ち: 廃止または恒常契約行への再構成）
- **ng_classification**: pre-existing
- **notes**: 行 002（frontmatter id と物理 path の不一致検出）は恒常的な検査契約とも読めるため、廃止ではなく REQ-007/REQ-028 側への吸収も選択肢

### F-03: REQ-028 は監査作業記録行と恒常契約行の混在（部分 RETIRE 候補）

- **id**: F-03
- **category**: 6観点 RETIRE（移行完了状態の部分残存）
- **target**: docs/requirements/REQ-028.md
- **evidence**: 目的は「IR の体系全体を監査・再編」の一回限り作業。行 004〜011 は監査・分類・削除の作業記録（KEEP/MERGE/IMPLEMENT/DELETE 分類、lifecycle_state 等の削除実施）、DEC-013（IR 登録モデルの簡素化）で実施済み。行 012（新規 IR 登録 gate）等は恒常契約。シグナル2（作業履歴主題行の残存 / 監査完了後も作業行が現行要件のまま）
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-004-009）+ 承認済み DEC-013
- **recommended_route**: inspect-promote → backlog-review（req-define 再壁打ち: 恒常行の正規の home への移管と作業行の廃止）
- **ng_classification**: pre-existing
- **notes**: 要ヒューマンレビュー: 恒常行（012、014 等）の存続判断は req-define の壁打ち対象

### F-04: proposed Decision を現行判断の根拠として参照

- **id**: F-04
- **category**: 横断契約矛盾（Decision 意味診断: 承認済みのみ現行根拠）
- **target**: 
  - REQ-002-035（docs/requirements/REQ-002.md）→ DEC-015（proposed、2026-08-15）に「判断と機構の分界の所有」を参照
  - docs/specs/commands/case-auto.md（accepted）L439 等多数、case-run/case-close SPEC（accepted）→ DEC-008（proposed、2026-08-09）を bounded parent decision resolution の根拠として参照
  - docs/specs/foundations/harness-separation-model.md（accepted）L69 → DEC-015 を分界の根拠として参照
- **evidence**: REQ-001-021 は「承認状態の判断記録のみを現行根拠として使用」を要求。DEC-008・DEC-015 は frontmatter status: proposed（decisions/README.md L25/L32 も proposed）。承認済み SPEC・現行 REQ がこれらを規範的根拠として引用している
- **severity**: medium
- **confidence**: high（参照事実は機械的に確定。違反確定は medium）
- **source_of_truth**: 現行 REQ（REQ-001-021）を正として判定。DEC frontmatter 実体
- **recommended_route**: inspect-promote → backlog-review（DEC-008/015 の承認完了、または参照の一時的注記のいずれかを要件化）
- **ng_classification**: 要ヒューマンレビュー
- **notes**: 実装先行・Decision 承認待ちの pipeline 状態の可能性が高い。DEC-017（proposed、2026-08-17）は REQ-012/040 の「関連情報」参照のみで現行根拠扱いではないため対象外

### F-05: docs/README.md の Decision 索引が実体より陳腐化

- **id**: F-05
- **category**: README 索引診断（第一参照導線の状態不一致）
- **target**: docs/README.md
- **evidence**: (1) Decision 表の DEC-014 行が「配布依存境界の多層 enforcement（proposed）」表記だが、実体 DEC-014.md は status: accepted（updated 2026-08-14）、decisions/README.md の status 表も accepted。(2) L122「実行時パッケージ境界」と L124「ローカル版 OpenCode 生成」が異なるラベルで同一ファイル specs/local/runtime-package-boundary.md へ二重リンク（後者が旧名称残存）
- **severity**: medium
- **confidence**: high
- **source_of_truth**: DEC-014 frontmatter（実体）+ decisions/README.md を正とし、docs/README.md の索引表記を検出対象とした
- **recommended_route**: inspect-promote → backlog-review（docs_chore として case-open 直接実装も可）
- **ng_classification**: pre-existing
- **notes**: 修正は docs/README.md 2行程度の軽微な docs_chore

### F-06: specs/README.md 一覧表の登録対象外ディレクトリ（audits/、baselines/）

- **id**: F-06
- **category**: 探索順と索引の不整合
- **target**: docs/specs/README.md、docs/specs/integrity/audits/（5ファイル）、docs/specs/integrity/baselines/（1ファイル）
- **evidence**: specs/README.md の登録手順は references/（親 SPEC 行の備考で言及）と rules/（カタログ索引）の配置のみを定義し、audits/・baselines/ はいずれの登録規定にも属さない。したがって 6ファイルが一覧表への導線から外れている。spec-health-metrics.md の AUTOGEN 計測表には SPEC として計上されており、索引間で扱いが不整合
- **severity**: medium
- **confidence**: high
- **source_of_truth**: document-model SPEC「docs/specs/ 直下のドメイン別体系化」と specs/README.md 登録規定を正として判定
- **recommended_route**: inspect-promote → backlog-review（audits/baselines の位置づけ（Report としての配置明示）と登録規定の拡充を要件化）
- **ng_classification**: pre-existing
- **notes**: document-model の Report 分類は「`.agentdev/integrity/reports/` または該当ドメイン配下」を許容しており、配置そのものは違反確定でない。索引導線の穴として検出

### F-07: 廃止済み agentdev-doc-map への参照残置（draft SPEC）

- **id**: F-07
- **category**: 廃止 REQ/SPEC 由来記述残置（DRIFT）
- **target**: docs/specs/skills/agentdev-doc-diagnostics.md
- **evidence**: L18、L41、L69、L75 の4箇所が廃止済み配布スキル `agentdev-doc-map`（探索層）を現行の責務分担相手として記述。agentdev-doc-map は REQ-013-002/003 で廃止済み（docmap-reference-audit.md L15）、実体（skill・SPEC）ともに不存在。現行の agentdev-doc-diagnostics SKILL.md は当該スキルを参照しない
- **severity**: medium
- **confidence**: high
- **source_of_truth**: 廃止事実（REQ-013 retired、docmap-reference-audit.md）を正とし、draft SPEC 側の記述を検出対象とした
- **recommended_route**: inspect-promote → backlog-review（doc-diagnostics SPEC の確定時修正として要件化）
- **ng_classification**: pre-existing
- **notes**: 2026-08-16 の ng21 監査 N13（broken-file-link、superseded）で See Also の誤参照は「fixed-here」処理済みだが、本文4箇所の参照は残置。SPEC は draft status のため確定 SPEC 向け検査の対象範囲は狭いが、現行 SKILL.md との意味乖離は実在

### F-08: 要件行内の移行注記（旧番号・移管記録）残置

- **id**: F-08
- **category**: REQ/SPEC 境界・文書品質（作業履歴の要件行内残存）
- **target**: docs/requirements/REQ-004.md（REQ-004-053「〔分割元 REQ-006-004〕」）、docs/requirements/REQ-017.md（REQ-017-002「REQ-030-004 維持、旧番号 REQ-006-004」）、docs/requirements/REQ-036.md（REQ-036-022「baseline_status は REQ-028-010 へ移管」）、docs/requirements/REQ-006.md（本文「分割記録」節）
- **evidence**: REQ-001-014 は現行文書の本文に再編工程固有の識別子を含めないことを要求。上記4箇所は分割・移管の工程注記を現行本文に保持する
- **severity**: low
- **confidence**: medium
- **source_of_truth**: 現行 REQ（REQ-001-014）を正として判定
- **recommended_route**: inspect-promote → backlog-review（移行期の追跡要件（REQ-001-040）との両立方法を含めて軽微な整理として要件化）
- **ng_classification**: pre-existing
- **notes**: 段階移送方針の移行期における追跡目的の注記であり、例外候補。分割完了後の掃除として扱うのが妥当

## 推奨アクション

- F-01〜F-03（REQ-025/026/028）: inspect-promote での分類確定後、backlog-review を経て req-define の再壁打ち入力とする（廃止・再構成の判断はユーザー承認による）
- F-04: DEC-008・DEC-015 の承認（または承認前である旨の注記規約）を backlog 化する
- F-05: 軽微な docs_chore。RU 化せず case-open 直接も選択可能
- F-06: audits/baselines の文書種別（Report）位置づけと specs/README 登録規定の拡充
- F-07: doc-diagnostics SPEC の次回確定時に除去
- F-08: 分割移管完了後の掃除として低優先で対応
- req-define入力案: F-01〜F-03（REQ-025/026/028 の廃止・再構成）、F-04（proposed DEC 参照の扱い）の4件

## docs-check route 候補（STEP-3-2、機械的検査への落とし込み候補）

- `.opencode/skills/repo-agentdev-integrity/SKILL.md` L188: `docs/specs/integrity-rule-catalog.md` へのリンクが旧ドメイン分割前パスかつ相対深度誤り（正: `docs/specs/integrity/integrity-rule-catalog.md`）。IR-057（obsolete-spec-path）/IR-062（reference-path-existence）の検出対象候補（repo-local のため docs-check 領域）
- specs/README の一覧表突合せにおいて `audits/`・`baselines/` 配下を登録対象とするかの規定追加（F-06 と同根の検査データ候補）

## 未処理 artifact 確認（STEP-3-3、処理は本コマンドの対象外）

- `.agentdev/intake/inbox/`: 66件（2026-07-27 1件、2026-08-16 55件、2026-08-17 10件）— 未処理。本診断の検出事項と重複する候補（README 関連、SPEC 候補群）を多数含むため、本ファイルの各検出事項は intake inbox の既存 item との重複確認を inspect-promote で実施すること
- `.agentdev/learning/inbox.md`: 存在（約48KB、未処理エントリを含む）
- `.agentdev/inspect/inbox/`: 既知の defer 残置 1件（inspect-docs-finding-20260815T082159Z.md、F-15〜17: workflow SPEC 3件の draft status）。再確認条件は「Epic #2099 case-close 後も draft のままの場合」であり、git log 上に Epic #2099 の case-close を確認できないため再検出は見送り（defer 根拠は維持）
- `intake/promoted/`、`learning/promoted/`、`inspect/promoted/`、`backlog/req-units/`、`drafts/`: いずれも空（.gitkeep のみ）

## 対象外（Out of Scope）

- v2:REQ-/v2:ADR- の旧世代参照（履歴参照・来歴注記として許容、tag v2.11.0 基準）
- docs/requirements/retired/ 配下、要件マッピング表の履歴記述
- REQ-001/003/004/008 の要件行数 51〜80 行（+1 シグナル、req-health-metrics AUTOGEN 計測と一致、経過観察）
- REQ-003 の adversarial-review 行群（REQ-014-015 が REQ-003 への単一所有を明示する設計上の配置）
- REQ-008 の enum・field 名を含む行群（req_draft/RU の外部接続契約として安定契約例外候補）
- node_modules 同梱 README の CRLF/LF 混在 4件（第三者が管理する同梱ファイル、配布物の作成対象外）
- Artifact Graph 派生索引（.agentdev/graph）の unresolved_reference 29件の大半（junction 解決アーティファクト、および索引が現行実体より古いことによる誤検出。実体確認で cross-skill リンク・effectiveness README は現行問題なし。派生索引の再生成は推奨）
- guides の細部（今回の走査では規範的権限の越境を検出せず）
- 検出事項の分類・採用・処分（inspect-promote の責務）
