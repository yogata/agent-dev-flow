---
id: NORMALIZATION-OU-020
title: "OU-020 ADR 用語機械的棚卸しと実現面語彙現行化 実行記録"
status: accepted
created: 2026-09-04
normalization_for: REQ-004-037（実現面語彙正典）/ AG-020 / RA-014 / TS-020 / Issue #2570
parent_epic: "#2553 (ru-batch-20260903 Epic 1・ルート Issue)"
input_audit: 本ファイル §2 の検出リスト（機械的走査の適用記録を兼ねる）
base_ref: d3ac6ea3 (case/issue-2570 base)
---

# OU-020 ADR 用語機械的棚卸しと実現面語彙現行化 実行記録

> **位置づけ**: 本ファイルは Issue #2570（OU-020）の完了条件 1「ADR 機能用語棚卸しの結果（検出リストと除外規則の適用記録）が存在すること」を満たす棚卸し記録である。検出リスト、除外規則の適用記録、現行化の適用実績、TS-020 検証結果を保持する。

## 1. 実行概要

- 対象範囲: `docs/**` と `src/**` の Markdown 正規成果物内の「ADR」言及（AG-020 適用範囲定義。`docs/**/*.md`、`src/**/*.md`。`.agentdev/extensions/**` は project-local のため対象外。`.opencode/**` は投射先かつ検出基盤領域のため対象外）
- 走査方法: `node`（UTF-8 readFileSync）による行単位走査。正規表現 `\bADR\b`（ワード境界付き）と補助パターン（`v2:ADR-`、`ADR-NNN`、`docs/adr` 等）で検出
- 検出総数: 645 行 / 164 ファイル（base 時点）
- 現行化適用: **92 ファイル・238 行**を「ADR」→「Decision」へ現行化（決定的置換スクリプト 239 行適用、うち 1 行は REQ-046-002 の誤適用を直後に復元し実質未変更、別途リンクテキスト 4 行を追記修正）
- 残存: 423 行 / 96 ファイル。**全行が除外規則のいずれかに該当**（§3、§4）
- 「実現面」語彙: `docs/designs/` 配下 0 件（base 時点で REQ-004-037 現行済み、grep で確認済み）。本 OU での追記変更なし

## 2. 検出リストの分類（base 時点 645 行 / 164 ファイル）

| 分類 | 行数 | 説明 |
|---|---|---|
| `v2:ADR-NNNN` 履歴識別子 | 174 | IR-065 許容（v2: プレフィックス付き歴史識別子） |
| retired・reports 領域 | 123 | `docs/requirements/retired/**`、`docs/reports/**`（履歴記録領域） |
| 検出器語彙 | 101 | checker・IR ルール・語彙対照表の記述（行単位精査後の確定値は §3） |
| 履歴言及 | 51 | 行レベル履歴マーカー（旧・移行・廃止・履歴・経緯・過去版等） |
| テンプレートセクション名 | 4 | 「関連 ADR 拘束条件」セクション名およびその手順引用 |
| bare `ADR-NNNN` 実参照 | 24 | 個別精査（exemption_files・reports・旧 v2 識別子実参照） |
| 現行化対象（散文種別名・種別列挙） | 291 その他含む計 | §3 の決定的ルールを適用した 238 行を現行化 |

分類は 3 段階で実施した: (1) 正規表現による機械的初分類、(2) 320 行（初分類の要精査分）の行単位人工精査、(3) 適用後の残存再走査 423 行の全行確認。初分類のキーワードヒューリスティクス（IR・checker・検出等）は仮分類であり、確定は (2)(3) の行単位確認で行った。

## 3. 除外規則の適用記録

AG-020 除外規則 4 種を、IR-065（obsolete-vocabulary-current-use、REQ-010-066）の許容条件と `data/obsolete-vocabulary-map.yaml` の scope/exemption 定義と矛盾しない形で運用した。

| 除外規則 | 適用方法 | IR-065 / checker 対応 |
|---|---|---|
| 検出器語彙 | IR ルールファイル（`docs/designs/integrity/rules/**`）、IR カタログ・ルール所有権マトリクス、checker カテゴリ名（`ADRStatusNormalization` 等）、ID 形式・検出パターン列挙（`ADR-NNNN`、`ADR-\d{4}`、`ADR-ID`、`REQ/ADR/` baseline 対象列挙の対照表記述）、doc-writing 機械置換ルールの検出対象語彙表と `rewrite-patterns.md`（IR-045 許容表現対照・`.opencode` 語彙レジストリと一体）、`check-frontmatter-consistency` CLI 契約行（`kind(req\|adr)`）を除外 | rules/** は IR-065 の検出ルール説明文そのもの。integrity-contracts「ルール自己参照除外」（REQ-010-009）と同型 |
| テンプレートセクション名 | 「関連 ADR 拘束条件」セクション名（`src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`、`issue_desc_feature.md`）とその手順引用（case-open references、case-run references）を除外。`src/opencode/commands/agentdev/templates/**` と workflow-templates `templates/**` の様式全体を現行化対象外 | checker scope.exclude に `src/opencode/commands/agentdev/templates/` が宣言済み |
| 履歴言及 | 行レベル履歴マーカー（旧・移行・廃止・履歴・経緯・過去版・過去・退役・legacy・deprecated・superseded、追加精査で「歴史的」を追加）を含む行を除外。DEC-009（移行経緯の正規記録）、DEC-007（superseded）、decisions/README.md（exemption_files、tag v2.11.0 履歴レビュー表）を除外 | IR-065 `hasLineLevelHistoryMarker`、exemption_files、superseded Decision 免除と同一語群 |
| retired 成果物 | `docs/requirements/retired/**`、`docs/reports/**` を除外 | IR-065 免除領域と同一 |
| （追加）歴史識別子 | `v2:ADR-NNNN` を含む行を変更せず保持 | IR-065 許容（v2: プレフィックス付き） |

### 例外精査（機械ルール外の個別判断）

- `src/opencode-local/README.md` の bare `ADR-0131`（16 行）は、REQ-046-002 の保護対象である歴史識別子であり IR-065 項目 1 の residual 相当のため、`v2:ADR-0131` への表記現行化を実施（IR-065 triage_action「履歴注記化」準拠）
- `investigation-scope-refinement.md` の「ADR §5 / §4」等の旧根拠参照は、現行正規所有文書名（`delegation-contracts Design`、`epic-wave-model Design`）へ現行化。Decision §N という表記は旧文書の節番号を引きずるため現行文書名参照を採用
- `docs/guides/glossary.md` の「ADR」項目は Decision 項目へ改称し、旧称対照を「（旧称: ADR）」注記として保持（行レベル履歴マーカー付きで IR-065 許容）
- REQ-046-002「歴史的 ADR 識別子」は語彙ポリシーの規定語（歴史識別子の保護要件）であり現行化対象外。機械ルールのマーカー漏れにより一時的に置換されたため復元した（履歴言及除外の適用例）

### 現行化パターン（決定的置換）

主要パターン: `ADR 判断 / ADR判断`、`ADR 要否 / ADR要否`、`ADR 閾値 / ADR閾値`、`ADR 作成 / ADR作成`、`ADR 決定事項`、`ADR 候補`、`ADR 禁止ゲート`、`ADR ゲート`、`ADR 再解釈`、`ADR 意味診断`、`ADR 単一書き手制約`、`関連 ADR / 関連ADR`、`既存 ADR`、`承認済み ADR`、種別列挙（`REQ/ADR/Design`、`REQ/ADR/`、`ADR/REQ/spec`、`REQ、ADR、specs`、`Design / REQ / ADR` 等）、`source-of-truth priority（現行REQ > 承認済み ADR > Design > guides）`、英文 description 内の `REQ/ADR/Design`、`ADR/REQ/spec`、`ADR threshold judgment`。置換は `\bADR\b` → `Decision` のワード境界付き置換で実施し、`Adr` / `adr` 小文字混じり語（checker 関数名等）は対象外。

見出し置換に伴うアンカー整合（GitHub 見出しアンカー規則）を 4 箇所同期した: `#adr-禁止ゲート`→`#decision-禁止ゲート`、`#adr-判断根拠の記録`→`#decision-判断根拠の記録`、`#adr閾値判定ブリッジ`→`#decision閾値判定ブリッジ`、`#既存reqadrの定量的照合`→`#既存reqdecisionの定量的照合`。

## 4. 適用後の残存リスト（TS-020 検証対象）

適用後の残存走査: **423 行 / 96 ファイル**。分類内訳:

| 分類 | 行数 | 除外規則 |
|---|---|---|
| retired・reports 領域 | 138 | retired 成果物・履歴記録領域 |
| `v2:ADR-NNNN` 履歴識別子 | 178 | 履歴言及（IR-065 許容） |
| 履歴言及（行レベルマーカー・exemption_files） | 52 | 履歴言及 |
| 検出器語彙（ID 形式・検出パターン列挙を含む） | 36 | 検出器語彙 |
| テンプレート様式・セクション名 | 9 | テンプレートセクション名 |
| 個別確認行 | 13 | 下表の通り全行除外規則該当 |

個別確認行（13 行）の除外根拠:

| 行 | 根拠 |
|---|---|
| `docs/decisions/DEC-009.md`（3 行） | exemption_files・移行経緯の正規記録（履歴言及） |
| `docs/decisions/README.md:206` | exemption_files・tag v2.11.0 履歴レビュー表ヘッダ |
| `docs/designs/foundations/harness-separation-model.md:127` | 禁止 ID 形式列挙（`REQ-ID、ADR-ID、IR-ID`）＝検出器語彙 |
| `docs/designs/integrity/integrity-contracts.md:366` | checker 出力カテゴリ名列挙（`ADR` カテゴリ）＝検出器語彙 |
| `src/opencode/skills/agentdev-artifact-validation/scripts/README.md:16` | `check-frontmatter-consistency` CLI 契約（`kind(req\|adr)`）＝機械契約・検出器語彙 |
| `src/opencode/skills/agentdev-artifact-validation/SKILL.md:53` | 同上（スクリプト契約表行） |
| `src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md:92` | 機械置換ルールの検出対象語彙表（`ADR-\d{4}`）＝検出器語彙 |
| `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md:55` | YAML title 様式例示値（code span）＝様式例示 |
| `src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md:22` | `adr-revision-mode` 機械契約値（draft-meta）＝機械契約 |
| `src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md:102` | REQ 構造診断の検出対象語彙表（`ADR-\d{4}`）＝検出器語彙 |
| `src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md:68` | テンプレートセクション名（「関連 ADR 拘束条件」）の手順見出し |

## 5. TS-020 検証結果

| 検証 | 結果 |
|---|---|
| 棚卸し記録の存在 | 本ファイル（検出リスト §2・§4 と除外規則適用記録 §3） |
| docs/designs/ と src/ の正規成果物で ADR 残存が除外規則対象のみ | 適用後残存 423 行を全行確認し、すべて §3 の除外規則に該当することを確認 |
| req-define Design「実装面」表記 0 件 | `docs/designs/commands/req-define.md` と `src/opencode/commands/agentdev/req-define.md` の両方で grep 0 件 |
| `check_integrity.ts`（repo-local 機械検査） | NG 0 / Warning 0。ObsoleteVocabulary（IR-065）カテゴリ NG 0、baseline 陳腐化検出なし |
| `check_integrity.test.ts`（IR-065/IR-066 回帰） | 141 pass / 0 fail |
| `scripts/self/release` suite | 76 pass / 0 fail |
| 改行コード・BOM 健全性 | 変更 92 ファイルすべて LF 単一・BOM なし（UTF-8 no BOM 維持） |
| 環境差既知 fail（base でも赤） | REQ-048 template 2（flake）・zod 未解決 error 4（worktree 環境差）・cwd 差異 ENOENT 4（該当 suite を正しい cwd で単独実行し 22 pass / 0 fail を確認）。すべて本変更と無関係 |

## 6. Findings / Capture候補

- **ng-baseline.json の REQ/ADR/ baseline エントリの陳腐化**: baseline 22 エントリ（provenance `issue-2372-ir065-initial-baseline`）のうち src 側 19 ファイル分は本 OU の現行化により解消済み。baseline ファイル（`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`）は検出基盤データかつ本 OU の変更対象成果物（docs/**/*.md、src/**/*.md）外のため更新していない。`REQ/ADR/` 列挙の一括正規化は intake 経由で判断とする IR-065 triage_action の方針に対し、本 OU が src 側分を実行した実績の baseline 反映（エントリ削除）を intake で判断すべき
- **`agentdev-artifact-validation` の `kind(req|adr)` CLI 値**: `check-frontmatter-consistency.ts` の kind 値は旧称（adr）を維持。.ts 変更を伴うため本 OU（.md 対象）では変更せず、実装側の現行化候補
- **`adr-revision-mode` 機械契約値**: `req-save-procedure.md` の draft-meta 値 `adr-revision-mode: full-reclassification` は、draft 生成側（req-define/req-analysis）に書き手が存在せず陳腐契約の可能性。値自体の改名または規約行の撤去を intake で判断すべき
- **`rewrite-patterns.md`（doc-writing）の IR-045 許容表現**: 「ADR判断が必要な変更」等の対照は `.opencode` 語彙レジストリ実体と一体の検出器語彙のため現行化対象外とした。語彙レジストリ実体側の IR-045 対照語の Decision 現行化は語彙レジストリ管理側（配布物外）の判断が必要
- **index-auto-generation.md の人手管理領域列挙**: 「ADR README トピック別ビュー」等の名称は docs/decisions/README.md のビューを旧称で呼んでいる現行契約記述のため「Decision README …」へ現行化した。docs/adr 廃止済み（同ファイル内で明記）との整合は保持

## 7. Design確定候補

該当なし。本 OU は語彙の現行化のみを行い、schema・enum・判定表・内部アルゴリズムの Design 追記を要する発見はなかった。
