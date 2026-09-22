# inspect-docs finding 20260922T032349Z

## サマリ

- 実行: /agentdev/inspect-docs（backlog-auto stage 1 相当、単独実行）
- スキャン対象: 現行 REQ 53件 + 廃止 REQ 14件、Decision 39ファイル、docs/designs 176ファイル、guides 12ファイル、docs/README.md / requirements/README.md / decisions/README.md / designs/README.md / guides/README.md、配布物 213 md（`.opencode/commands/agentdev/` 34 + `skills/agentdev-*` 179。skills 実体は `src/opencode/skills/` 側で確認、`.opencode/` と同期済み）
- 前回診断（2026-09-15 実行・finding 20260914T214425Z）以降の主な変化: REQ-090 新設・DEC-040 新設（accepted 遷移済み、Case #3056 / PR #3057 #3058）、REQ-089 J2 shadow 実験の採番後完全 revert、guides 用語整合 4件（c40fe50c）、agentdev_jev Custom Tool 新設と 6系統 Workflow reference 更新
- カテゴリ別検出件数: REQ 構造（MOVE/RETIRE）1件 / Decision 状態乖離 DRIFT 0件 / Design 状態乖離 DRIFT 0件 / 配布物統合性 0件 / 横断契約矛盾 0件 / 廃止 REQ/Design 由来記述残置 0件 / REQ 参照ID整合性・索引整合 0件
- **high severity: 1件（F-01）**

## 検出事項リスト

### [REQ 構造] F-01: REQ-090-007/008 に移行完了記録・ファイルパス直接参照・リリース証跡が要件行として残留

- **id**: F-01
- **category**: MOVE（REQ/Design 境界違反: 作業履歴残留・ファイルパス直接参照・リリース証跡）＋ RETIRE 候補（移行完了状態類型）
- **target**: docs/requirements/REQ-090.md:22（REQ-090-007）、docs/requirements/REQ-090.md:23（REQ-090-008）
- **evidence**: (a) REQ-090-007 は「docs/designs/workflows/references/execution-unit-construction.md 内の旧 case-open 所有表現（6箇所）および docs/designs/README.md 横断 Design 一覧の当該行が case-ready 実行契約へ整合して更新されていること」— 具体パスと箇所数を含む反映作業の完了記録が主たる文意であり、当該状態は既に充足済み（execution-unit-construction.md の case-open 所有表現残留 0件を grep で確認、commit c71f2fb6 で更新済み）。(b) REQ-090-008 は「Jev 実装開始直前の最新 main に v4.0.2 tag が存在すること」— リリース証跡（tag 存在確認）が要件行。同じく -008 後半の基準点 revert 条件は Case 受け入れ条件の性質。(c) 適用範囲節にも「欠番記録3ファイル、採番スクリプトの最小修正、新規 REQ は REQ-090」等の作業項目列挙（補助根拠）。計 3シグナル以上
- **severity**: high（Design 分離基準違反シグナル: 作業履歴残留・ファイルパス直接参照。安定契約例外候補（公開 command 名、ドメイン状態位置づけ、接続契約、安全境界、停止条件の大枠）のいずれにも該当しない）
- **confidence**: medium（シグナルの存在は機械的に確定。ただし本リポジトリでは Definition Package の受け入れ条件を REQ 行へ写す作成様式が見られ、REQ-090-006 が「合意済み」と明記する構成であり、移管すべきかの判断に意味判断を要する）
- **source_of_truth**: 現行 REQ（REQ-004-049: 作業手段は REQ 要件行に混入させない。document-model Design「REQ 内容契約」: 要件行は検証可能な状態要件、反映作業を含まない。REQ-001-067: 作業履歴・ファイルパターン等は Design/作業記録へ移管。document-model 廃止候補判定基準「移行完了状態」「作業手段主題」類型）
- **recommended_route**: MOVE（作業記録・tag 証跡・パス指定詳細を Case 受け入れ条件・作業記録側へ寄せ、REQ-090 は Jev 組込みの恒久状態要件（-001〜-006、-009、-010）に縮約）または RETIRE 候補化の評価（移行完了状態として REQ-045/REQ-046 系の恒久化要否再評価）。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（2026-09-22 commit 2d7880fa 追加行）
- **notes**: req-define入力案「REQ-090-007/008 の反映作業記録・v4.0.2 tag 証跡を REQ 要件行から除去し、恒久状態要件のみを残す。作業条件は当該 Case（#3056）の受け入れ条件として既に充足・記録済みのため、REQ 側の保持必要性を再評価する」。観察メモ（検出事項化せず・閾値未満）: (1) REQ-090-001/002 の「model ID typesafe-ai/jev」「AI_GATEWAY_API_KEY」は責務境界行内の詳細値例示であり安定契約例外候補（DEC-040 側の記録は Decision として適正）。(2) docs/README.md:15 / requirements/README.md 基準構造 / numbering-policy.md:64 の「（次の新規 REQ は REQ-090）」括弧書きは REQ-090 採番済みの現在では成立済み予告となり、以後の新規採番指示と誤読され得る（1シグナルのため観察メモに留める）

## 推奨アクション

- F-01: inspect-promote で分類（promote / defer / reject）した後、REQ-090-007/008 の処置（MOVE 縮約 or RETIRE 評価）を backlog-review 経由で req-define へ引き渡し
- 既知 defer 3件（F-04/F-05/GUIDE-6）は原状確認済みのため新規起票せず、inbox 残置分の再評価は後段 workflow の責務

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | AUTOGEN REQ 表内 ID 重複行検出（表範囲を `AUTOGEN:BEGIN/END` マーカー間に限定して `[REQ-NNN](requirements/REQ-NNN.md)` 行を突合） | 本診断で本文参照（docs/README.md:218 の REQ-056）を表行と誤合致させる検査誤りが発生。マーカー範囲限定で決定的に避けられる | ◎（IR-004/IR-039 系の補強候補） |
| 2 | dangling REQ/DEC 参照検出における `v2:` 接頭辞 lookbehind 除外 | 本診断で `v2:REQ-0155` 等が `REQ-` 部分のみマッチし誤検知。歴史識別子（v2:REQ-01XX、v2:ADR-0101〜0139）の除外は IR-015/IR-025 系の false positive 抑制に有効 | ○ |
| 3 | 既知欠番・予約帯（REQ-063〜081、REQ-084〜086、REQ-089、DEC-018、REQ-096 予約枠上限）の dangling 検出許容リストの IR-069 検出データとの一元化 | 本診断で docs/README.md・requirements/README.md・numbering-policy.md・IR-069 ルール定義の REQ-096/REQ-999 言及を文脈判定で対象外処理。検出データ一元化で文脈判断を削減可能 | ○ |
| 4 | 廃止内部 lifecycle コマンド（case-open/ready/revise/run/close）の `/agentdev/` 参照について commands/README.md「廃止コマンドの移行案内」節を allowlist 化 | 本診断で実在 13 command 突合に対し移行案内節の 5参照のみが機械的不一致。意図的参照の明示的 allowlist で誤検知防止 | △（セクション限定 allowlist の運用コスト要評価） |
| 5 | broken-bracket 検出パターン（`（）`、`（/）`等）を検査例として掲載する診断ロジック文書（agentdev-inspect-skills SKILL.md、req-structure-review.md）の対象外化 | 本診断で 2ファイルの検出パターン例示行が誤検知。検査ロジック文書自身の例示行例外 | △（対象外リストの陳腐化リスクあり） |

## 既知 defer 継続事項（原状確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-04 (0914) | REQ-038-006 の内部アルゴリズム（2フェーズ読込）混入（MOVE） | 原状継続（REQ-038.md:25 に「インデックススキャンと候補絞り込みによる2フェーズ読込」が残存） |
| F-05 (0914) | REQ-050-016 の SPLIT 候補＋実装パラメータ残留 | 原状継続（REQ-050.md:36 に「350 字 × 50 件相当」「lint_skills 検査契約（warning 発出）」が残存） |
| GUIDE-6 (0914) | artifacts-and-state.md 状態モデル制約節の frontmatter status 記述と document-model Design の衝突（文脈判断残存） | 原状継続（L145-153 に「frontmatter や status フィールドによる状態管理は行わず」が残存） |
| F-08/F-09/F-10/F-11/F-12 (0901)、F-04 (0907) | 20260901/20260907 finding の defer 継続分 | 本診断では個別再検証せず inbox 残置分として原状扱い（後段 workflow の責務） |

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: 活性文書・配布物の REQ/DEC 参照の dangling 0件（欠番・予約帯・ルール定義例示・`v2:` 歴史識別子は文脈判定で対象外）
- REQ frontmatter id ↔ ファイル名・一意性: 53現行 + 14 retired で整合（activeReq/retiredReq ファイル名一覧突合）
- 第一参照導線: docs/README.md REQ 表 53行・件数表記「現行 REQ: 53件」・requirements/README.md AUTOGEN（現行 53 / 廃止 14）・decisions/README.md 39行、すべて実ファイルと完全一致
- 現行/廃止/世代境界: REQ 二重存在 0件、requirements/README.md 廃止表 14行 = retired/ 14ファイル一致。欠番記録（REQ-063〜081 予約、REQ-084〜086 返却枠、REQ-089 廃止識別子）が docs/README.md・requirements/README.md・numbering-policy.md に記録済み（REQ-087 系・IR-069 整合）
- Decision 意味診断・Decision 状態乖離 DRIFT: 検出事項 0件（accepted 32 / superseded 7〔DEC-002,005,007,015,017,029,030〕/ proposed 0、docs/README.md の件数・内訳表記と完全一致。DEC-040 は accepted・related_reqs [REQ-090]・relations 4件で適正）
- Design 意味診断・Design 状態乖離 DRIFT: 検出事項 0件（frontmatter `status: draft` の Design 0件）
- MERGE / RETIRE / DUPLICATE（既知 defer 分を除く新規）: 0件
- guides 意味診断: 用語整合 4件（c40fe50c: case-auto「標準実行コマンド」への統一、Findings / Capture候補セクション名、v2 歴史 ADR 番号帯の実体一致修正）は document-model・DEC-033・v4-operating-model と整合。GUIDE-6（defer）以外の新規 0件
- README 索引診断: docs/README.md コマンド一覧 13/13 実在突合 ✓、主要導線リンク解決 ✓、索引が導線範囲を超える内容過多なし。designs/README.md 一覧は rules/・references/ を親行で包含する方式で整合
- 配布物 構文健全性: frontmatter 重複 0、見出し重複（意図せぬもの）0、Markdown 構文破損（フェンス奇数等）0、存在しない command 参照 0（廃止 lifecycle 5コマンド参照は README 移行案内の意図的記載のみ）、UTF-8 BOM 0、CRLF/LF 混在 0（docs 344 + 配布物 213 ファイル）
- 配布物 文意保持: 壊れた括弧 0（2ファイルの検出パターン例示行は false positive として分類）、壊れた参照表現 0
- 配布物 責務整合: 6系統 Workflow reference の Jev 逐次経路追記（c71f2fb6）は REQ-090-004/010・DEC-040 の責務境界（Custom Tool は機械処理のみ、判断は Workflow/Capability Skill 所有）と一致。execution-unit-construction.md の case-ready 運用主体化は REQ-090-007 の状態を充足。src↔.opencode commands 同期差分 0
- 配布物 ID 汚染: 0件（`repo-agentdev-integrity` は repo-local 配布対象外のため対象外）

## 対象外（Out of Scope）

- docs 表層品質・textlint 共通基盤管轄（agentdev-textlint-guard）
- Command/Skill 参照妥当性・Skill 構造診断（inspect-skills の独立対象）
- 検出事項の分類・採用・処分（inspect-promote の責務）
- docs/reports/ 配下（Report は事実記録であり、DEC-018 等の歴史識別子言及は履歴記録として対象外）
- `src/opencode/plugins/agentdev-jev-tool/`・`src/opencode/tools/agentdev-jev/`（配布物定義域 commands/agentdev・skills/agentdev-* の外。Custom Tool 実装本体の診断は本 workflow の対象外）
- 偽陽性として排除した機械的検出: IR-069 ルール定義内の REQ-999 範囲表記、numbering-policy / README 3ファイルの REQ-096 予約枠言及、crosswalk 系の DEC-018 欠番説明、検出パターン例示行の `（）` `（/）`、docs/README.md:218 の本文中 REQ-056 参照（表行重複との誤認を回避）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 3件（intake-checker-known-gap-registry.md、intake-draft-artifact-actions-row-structure.md、intake-jev-ts001-ts010-real-env-verification.md）。intake-promote 待ち
- `.agentdev/learning/inbox.md`: 未整理エントリ 1件（25行）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 2件（RU-0120.md、RU-0121.md）。req-define 待ち。**注記: 両ファイルは git 未追跡（untracked）であり、永続化されていない**
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901 / 20260914、分類確定済みの意図的残置）。本実行の新規 finding を追加
- `.agentdev/intake/promoted/`・`learning/promoted/`・`inspect/promoted/`・`.agentdev/drafts/`: 空

## 参照

- 診断実行: /agentdev/inspect-docs 相当（backlog-auto stage 1 単独実行）2026-09-22
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（frontmatter / 索引突合 / エンコーディング・構文・ID パターン / 相対参照 / BOM・改行コード / コマンド実在突合 / src↔.opencode 同期）+ 変更差分（2026-09-15 以降の git log・diff）重点精読
- 判定基準: agentdev-workflow-inspect-docs SKILL.md + references 2件、agentdev-req-structure-diagnostics（req-structure-review.md 7フィールド→共通 schema 正規化）、agentdev-doc-diagnostics（finding-output-contract.md、diagnostic-categories.md）、document-model Design / docs-spec-rebuild-integrity Design（extension `.agentdev/extensions/skills/agentdev-workflow-inspect-docs.yaml` 経由で解決）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
