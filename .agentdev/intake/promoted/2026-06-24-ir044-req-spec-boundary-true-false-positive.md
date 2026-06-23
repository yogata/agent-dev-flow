# IR-044 REQ/SPEC 境界違反検出の真陽性・偽陽性混在（REQ 是正と検出ロジック改良の両輪）

## 観測内容

本成果物は以下 3 つの inbox 項目を束ね、IR-044 `req-spec-boundary-violation` 検出（`check_integrity.ts`、Category: CanonicalConflict、WARNING）が出した finding を、REQ/SPEC 境界違反の真陽性（REQ 是正対象）と偽陽性（検出ロジック改良対象）に分けて整理する。

- `2026-06-22-docs-check-ir044-req-spec-boundary-valid-violations.md`（真陽性 2 件）
- `2026-06-22-docs-check-ir044-false-positive-meta-rule-and-behavioral-mention.md`（偽陽性 2 件）
- `2026-06-22-epic1028-wave2-req0145-001-audit-remaining-true-positives.md`（REQ-0145-001 監査残課題、PR #1036 適用後の残 4 件）

出典検出レポートは `.agentdev/integrity/reports/2026-06-22-integrity-report.md`、検出元スクリプトは `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`。docs-check Warning は PR #1036 適用で 12 件から 4 件に減少し、残り 4 件が本成果物の対象である。

### 真陽性（REQ 本文からの SPEC 詳細除去が必要）

**REQ-0114-082**（`docs/requirements/REQ-0114.md:90`）

> REQ-0114-082: case-auto は実行開始時刻（Step 1 入力解決の開始時点）および完了報告生成時刻（Step 8）を記録すること

混入 SPEC 詳細は「Step 1」「Step 8」の Step 番号参照。本来の要件意図は「実行開始時刻・完了報告生成時刻を記録すること」であり、Step 番号は case-auto command reference または SPEC に属する。

**REQ-0144-008**（`docs/requirements/REQ-0144.md:26`）

> REQ-0144-008: scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する（既存5件赤 + valid fixture 7件 NG の解消）

混入 SPEC 詳細は「既存5件赤」「valid fixture 7件 NG」の件数。これらは test docs・fixture 管理資料（SPEC 級）に属し、REQ 本文は「fixture は最新 check_integrity.ts ルールに追従すること」までに留めるべきである。

### 偽陽性（検出ロジックの exoneration 条件追加が必要）

**REQ-0101-067**（`docs/requirements/REQ-0101.md:70`）

> REQ-0101-067: REQ は対象が満たすべき状態・振る舞い・制約・外部契約を記述する文書種別であり、SPEC は現在の実装構成を成立させる スキーマ・ライフサイクル・コマンド構成・ルールカタログ・テストデータ詳細・判定表・enum・format・内部パラメータを記述する文書種別であること

判定: REQ/SPEC 境界を定義する META 規則そのものであり、「enum」「format」は SPEC が扱う対象を列挙して定義している。SPEC 詳細の記述ではなく責務範囲の規定である。誤検出原因は IR-044 が「enum value list」キーワードを機械的に検出している点。

**REQ-0144-009**（`docs/requirements/REQ-0144.md:27`）

> REQ-0144-009: copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在する

判定: 「仕組みが存在する」は振る舞い要件（存在・状態）であり、SPEC 詳細ではない。「fixture」は drift の対象種別を示す修飾語であり、fixture の中身（件数・内容）を規定していない。誤検出原因は IR-044 が「fixture detail」キーワードを機械的に検出している点。

### REQ-0145-001 監査の分類（参考）

REQ-0145-001 監査（8 REQs: REQ-0101/0104/0108/0114/0124/0126/0131/0136）では、真陽性として REQ-0114-082・REQ-0144-008/009、偽陽性（stable contract exception・delegation context として適切）として REQ-0101-067/068/069・REQ-0108-259 を挙げている。ただし REQ-0144-009 については、監査は「fixture 名の要件行混入（真陽性）」と分類した一方、偽陽性 inbox 項目は行文言を引用した上で「振る舞い要件（偽陽性）」と判定しており、両者の分類が衝突している。この差は backlog-review で解決する。

## 影響

真陽性を放置すると、Step 構成や fixture 件数が変化するたびに REQ 本文も更新が必要となり、REQ 安定性が損なわれる。そのたびに docs-check が同一 WARNING を継続検出し、Epic 完了条件や QG-4 最終受入で再指摘されるリスクを抱える。

偽陽性を放置すると、毎回の docs-check report に同一 finding が現れ、WARNING ノイズが増加する。偽陽性に慣れた運用者が真の violation（真陽性群）を見逃し、「IR-044 は過検出が多い」と検出器への信用を失う原因になる。REQ-0144-009 の分類衝突は、監査の判定根拠が行文言の引用に基づかない点に起因し、未解決のまま修正方針を決めかねる状態を生んでいる。

## 課題

残 4 件の WARNING を 0 件にするため、真陽性は REQ 本文から SPEC 詳細を除去し、偽陽性は `check_integrity.ts` の IR-044 検出ロジックに exoneration 条件を追加する。両者は作業主体（REQ 編集 vs スクリプト改良）が異なるため、並列可能な二つの課題として扱う。ただし REQ-0144-009 は真陽性・偽陽性のいずれに分類するかを行文言に照らして確定してから着手する必要がある。

## 既存要件との関連

- REQ-0101-067: REQ/SPEC 責務境界の定義。本件では偽陽性検出の対象となった META 規則行そのもの。
- REQ-0101-068: SPEC 詳細の配置先。真陽性 2 件（REQ-0114-082・REQ-0144-008）は本要件からの逸脱。
- REQ-0108-259: IR-044 検出の要件。偽陽性改良は本要件の検出精度向上にあたる。
- REQ-0145: docs-check/integrity 検出設計改善。偽陽性の exoneration 条件追加は本要件のスコープ候補。ただし REQ-0145-001 監査では真陽性の個別 SPEC 詳細移行は「case-run で対応」と明記されており、Epic #1028 の完了条件対象外である。
- 欠落: META 規則行・振る舞い要件行に対する exoneration 条件の SPEC 化（検出設計基準）は未整備。

## 整形の方向性

backlog-review では、性質の異なる二系統を原則として別 RU に分ける。

1. **RU-A（REQ 是正）**: REQ-0114-082・REQ-0144-008 の SPEC 詳細除去。req-define または req-save ワークフロー経由で既存 REQ を編集し、Step 番号は case-auto command reference、fixture 件数は test docs/SPEC へ移管する。修正後に `check_integrity.ts` で当該 WARNING が 0 件になることを確認する。
2. **RU-B（検出ロジック改良）**: REQ-0101-067（META 規則行）・REQ-0144-009（振る舞い要件行）に対する exoneration 条件を `check_integrity.ts` に追加する。REQ-0145 スコープとして起票する。
3. **REQ-0144-009 の分類確定（RU 起票前）**: 監査の「真陽性」判定と偽陽性 inbox の「偽陽性」判定が衝突する。行文言「仕組みが存在する」を根拠に偽陽性と見なすのが妥当だが、backlog-review で最終判断を示す。真陽性なら RU-A、偽陽性なら RU-B に振り分ける。
4. **優先度**: 真陽性（RU-A）は REQ 安定性と QG-4 通過に直結するため高。偽陽性（RU-B）は検出器信用と WARNING ノイズ低減のため中。REQ-0144-009 の分類確定は両 RU の起票条件なので、最優先で解決する。
5. **バンドル**: 本成果物は 3 inbox 項目を束ねるが、RU は作業主体の差から 2 分割を基本とする。REQ-0145-001 監査の分類表は参考情報として両 RU に引用する。
