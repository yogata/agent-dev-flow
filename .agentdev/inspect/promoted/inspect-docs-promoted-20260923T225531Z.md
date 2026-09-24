# inspect promoted 20260923T225531Z

> 本ファイルは inspect-promote（2026-09-24 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の promote 採用済み成果物である。元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20260923T225531Z.md`（本 run で同 finding 全件の処分が確定したため inbox から削除済み）。
>
> 分類確定: promote 2件（REQ-2 は自律確定、DESIGN-4 は HITL 照会 → ユーザー承認）/ defer 継続 5件（F-04/F-05/GUIDE-6 は 20260914 ファイル、F-10/F-12 は 20260901 ファイルに残置。いずれも自律確定・再評価条件に変化なし）/ reject 0件。
> 対論型レビュー: in-context 審議。Jev 先行評価（分類 choice 7判断）＋ adversarial-review（反証棄却、unresolved は DESIGN-4 のみ）実施済み。DESIGN-4 はユーザー承認を経て promote 確定。

## REQ-2: IR-055 の related_req アンカーが実在しない REQ 行 ID（REQ-002-079/080/081）を参照し、IR-067 の免除組合せで機械検出されない

- **disposition**: promote（2026-09-24 自律確定。ファントム参照の事実は全 REQ ファイル走査と現物 grep で一意に確認済み、対応方向は一意、分類に本質的競合なし）
- **category**: REQ 参照ID整合性（ファントム行参照）/ 検出盲点
- **target**: docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md（description「REQ-002-079/080/081 で既に要件化された」および related_req フィールド）、docs/designs/integrity/rule-ownership.md:165（IR-055 行の根拠 REQ 列、AUTOGEN ブロック L115-181 内の派生表）
- **evidence**: 現行 docs/requirements/REQ-002.md は REQ-002-048 までを採番し、REQ-002-079 / 080 / 081 の行は存在しない（REQ-002.md 全文 `grep -c` 0件、全 55 現行 REQ + retired 14 ファイルを走査する行 ID レジストリ突合でも行定義 0件。`git log -S "REQ-002-079" -- docs/requirements/REQ-002.md` も 0 件で、当該行 ID は少なくとも直近履歴の REQ-002 テーブルには存在しない）。一方 IR-055 ルールファイルの description・related_req、および rule-ownership.md L165 の IR-055 行はこの 3 行 ID を「配布物は導入先で解決可能な参照のみを含む」原則の要件化根拠として引用する。rule-ownership.md L165 は AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->` L115 〜 `<!-- AUTOGEN:END -->` L181）内の派生表であり、IR-067（referenced-req-row-existence）は rules/IR-*.md 免除（`isIntegrityRuleDescriptionFile`）と AUTOGEN 行マスク（`buildAutogenLineMask`）の両方で当該箇所を検出対象外とするため、機械検査からも漏れる。ng-baseline（2026-09-17 消費後）に当該エントリは存在しない（同ファイルの REQ-002-044 ファントムは同日消費 c29f93dd で修正済みだが、IR-055 由来の 3 行 ID は当時から未修正のまま）
- **severity**: medium / **confidence**: high（ファントム参照の事実は全 REQ ファイル走査と現物 grep で一意に確認。原則の現行アンカー候補は REQ-002-027「配布成果物が実行時依存として使用するパスは、導入先環境で解決可能であること」等が近接するが、対応関係の確定は req-define 側の判断）
- **source_of_truth**: REQ-002（実在行集合）・REQ-010-069（IR-067 検出契約）を正とし、実在しない行 ID への根拠参照を検出事項とする
- **recommended_route**: IR-055 ルールファイルの related_req・description の参照先を実在 REQ 行へ再アンカー（req-define で対応行を確定）し、rule-ownership.md の AUTOGEN 派生表を再生成 → /agentdev/inspect-promote → /agentdev/backlog-review。IR-055 baseline 運用（2026-09-24 commit 610fafd5 で run3 分を登録済み）は本件の参照先確定に影響しないが、baseline の要件根拠記述が当該 3 行 ID に依存する点は後続 Case での確認を推奨
- **ng_classification**: pre-existing（IR-055 新設 commit 5111aac3 2026-08-20 由来の参照が、REQ-002 再構築後も更新されず残置。2026-09-01 以降の inspect サイクルで未検出。rules/IR-*.md 免除と AUTOGEN 免除の組合せにより docs-check でも検出されない盲点）
- **notes**: 前回までの診断（20260914・20260923 とも「dangling 参照 0件」判定）との差は、rules/ 配下 IR ルールファイルの related_req を免除慣行で除外し、AUTOGEN 派生表を機械生成領域として扱ったことに起因すると推定する。本検出は「免除領域の生成元（IR frontmatter）側でファントムが蓄積する」という検出構造上の盲点を含むため、docs-check route 候補 #1（下表）を併記する
- **対応方針（分類確定）**: 実在 REQ 行への再アンカー（req-define で対応行確定）＋ rule-ownership.md AUTOGEN 再生成。docs-check route 候補 #1（IR frontmatter related_req 実在性検査）は本成果物に診断記録として包含する（下表）。

### docs-check route 候補（診断記録として包含）

REQ-2 の検出構造上の盲点（rules/IR-*.md 免除 × AUTOGEN 派生表の機械検出除外）を補完する route 候補を、元 finding の診断記録から包含する。

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | IR ルールファイル frontmatter related_req の実在性検査: `docs/designs/integrity/rules/IR-*.md` の related_req ID 集合に対して REQ 行実在突合を行う（IR-067 の rules/ 免除・AUTOGEN 免除は検出対象を生成元側で検査する構造で補完） | REQ-2。related_req 抽出は frontmatter 形式が安定しており機械化可能。related_design 等の他フィールドへの拡張余地あり | ○（新規 IR 候補。IR-055 自身の検出契約と冗長しない範囲で） |

## DESIGN-4: superseded DEC-002 が現行 Design 本文で権威引用として残留（DEC-036 supersede 後の参照未更新）

- **disposition**: promote（2026-09-24 HITL 照会 → ユーザー承認により採用確定。修正様式は下記「ユーザー確定（HITL 承認）」のとおり）
- **category**: Decision 状態乖離 DRIFT / 廃止成果物参照残置
- **target**: 4箇所 — docs/designs/foundations/document-model.md:375、docs/designs/authoring/vocabulary-registry.md:28、docs/designs/local/runtime-package-boundary.md:271、docs/designs/workflows/workflow-skill-model.md:102
- **evidence**: DEC-002（OpenCode ソース・プロジェクション分離）は 2026-09-20 第11段実行で DEC-036 により superseded（docs/decisions/DEC-036.md frontmatter relations「supersedes: DEC-002、reason: OpenCode ソース・プロジェクション分離の v4 再定義（配備形態として adapter 境界へ統合）を本 Decision の Harness/Backend adapter 境界が所有する」、docs/designs/foundations/references/crosswalk-inventory.md の executed 記録、docs/README.md:82 の superseded 7件列挙に DEC-002 含む）。一方、上記 4箇所は source・projection 原則の現行根拠として `（DEC-002）` を裸権威引用し、superseded 注記も後継 Decision 参照もない。document-model.md と vocabulary-registry.md はファイル内に DEC-036 言及が 0件。runtime-package-boundary.md は L458 で DEC-036（v4 Harness/Backend adapter 境界）に言及しつつ L271 では DEC-002 引用のまま。workflow-skill-model.md:102 は「（REQ-002-007、DEC-002）」と現行 REQ 行と併記
- **判定の境界**: docs/designs/foundations/harness-separation-model.md:150 の「関連」節 bullet（DEC-002 を関係宣言として列挙）は relates-to 宣言として適正と判断し対象外とする。docs/decisions/ 配下の superseded 同士の参照（supersedes / target / 履歴・crosswalk 記録）も適正。docs/requirements REQ 側の superseded DEC 言及は前回 20260923 診断どおり注記付き意図的記述のみで本件とは別
- **severity**: low / **confidence**: medium（引用先 Decision の状態乖離は事実だが、DEC-036 が原則の現行所有とみなす解釈と、DEC-002 起源の原則として歴史的出典引用を許容する解釈の余地が残る。修正様式（参照更新か注記追記か）は意味判断）
- **source_of_truth**: DEC-036（accepted、supersedes DEC-002）> DEC-002（superseded）の source-of-truth priority に従い、現行規範の根拠引用を乖離候補と判定する
- **recommended_route**: 4箇所の `（DEC-002）` 権威引用を DEC-036 参照への更新または superseded 注記の付記へ同期（案: 「（DEC-002、現行は DEC-036）」等の縮約注記）→ /agentdev/inspect-promote → /agentdev/backlog-review
- **ng_classification**: pre-existing（DEC-002 supersession 実行 2026-09-20（第11段）由来。2026-09-22 / 09-23 の inspect サイクルの superseded 参照スキャンは REQ 側の注記付き記述確認にとどまり、Design 側の裸権威引用は未検出のまま残置）
- **notes**: 原則自体（原本 `src/opencode/`、投影 `.opencode/`）は現行も有効（REQ-002-007/008、workflow-skill-model 本文）であり、本指摘は参照先 Decision の状態乖離のみ。req-define入力案「superseded DEC-002 を権威引用する Design 4箇所を DEC-036 ベースの参照へ同期する」

> **ユーザー確定（HITL 承認）**
>
> promote 採用。修正様式は縮約注記式 — 「原則は DEC-002 由来、現行は DEC-036 体制」のような出典の正確な注記。DEC-036 は投影原則の所有者ではないため単純な参照置換ではない。AG-010 の v2:参照パターンが前例。

