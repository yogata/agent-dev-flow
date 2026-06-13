# integrity checker (docs-check) の false positive 10 パターン総合改善

## 観測

`.agentdev/intake/inbox/` の 10 件の intake item が、いずれも integrity checker（`scripts/check_integrity.ts`）の false positive を報告している。文書側に問題はないが、checker が正常な文書に対して NG / Warning を発生させている。共通根因は checker heuristic の文脈認識不足。

### 個別 FP パターン

| # | 元 item | checker 検査 | FP の仕組み | 文書側の実態 |
|---|---------|-------------|-------------|-------------|
| 1 | broken-placeholder-link-req-nnnn | `broken-file-link` | code span 内のフォーマット説明 `` `[REQ-NNNN](REQ-NNNN.md)` `` を実ファイル参照と誤認 | REQ-0108-041 の説明文字列。壊れリンクではない |
| 2 | req-range-stale-in-project-docs-guide | `req-range-staleness` | retired 範囲「REQ-0001〜REQ-0050」を active 範囲と誤認 | L25 active 範囲は正確。L26 は retired 明示 |
| 3 | docs-review-deprecated-in-inventory | `cmd-deprecated-in-inventory` | docs-review を非推奨コマンドと誤認 | frontmatter に deprecation なし。body 内 "deprecated" は ADR status 説明 |
| 4 | commands-missing-capture-boundaries-reference | `command-capture-duty` | 固定キーワード（`capture-boundaries` ファイル名・`回収・保存` 等）の部分一致で検出。スキル参照表現を認識不可 | 全5コマンドが `agentdev-workflow-orchestration` スキル参照で capture 責務を記載済み |
| 5 | bugfix-docs-rule-conflict-req0104-vs-req0108 | `bugfix-docs-consistency` | `includes("不要")` の素朴部分文字列一致。REQ-0104-034 の「REQ作成を不要とする」を「docs 更新不要」と誤解釈 | REQ-0104-034 は bugfix の docs 更新を明示的に要求。REQ-0108 と整合 |
| 6 | case-close-template-glob-missing | `template-path-integrity` | glob pattern `issue_comment_*.md` を literal path として `fs.existsSync()` 確認 | template 6 ファイル実在。REQ-0108-115(e) が glob skip を要求 |
| 7 | workflow-status-prohibition-overmatch | `workflow-status-prohibition` | phase 語 + status 語が同一行という粗い正規表現。廃止説明・否定文脈を区別しない | REQ-0105.md:79, :113, patterns.md:52 はいずれも廃止説明または否定記述 |
| 8 | adr-readme-index-stale-retired | `checkAdrReadmeIndexSync` | README 全文から `ADR-\d{4}` を抽出し、retired セクションを区別せず | README は "Retired / Historical View" で `retired/ADR-*.md` に正しくリンク済み |
| 9 | phantom-adr-0099-in-req-0112 | `adr-req-crossref` / `broken-adr-ref` | 範囲表現「ADR-0001 から ADR-0099」の上限値を個別 ADR ファイル参照と誤認 | REQ-0112-047 の履歴番号帯の境界マーカー |
| 10 | legacy-bare-slash-case-open | `legacy-namespace` / `expanded-legacy-namespace` | `req-save/case-open` という path fragment を bare-slash コマンド起呼と誤認 | REQ-0108-076 が path fragment を標準 finding 対象外と明記 |

## 影響

- checker が正常な文書に対して継続的に NG / Warning を発生させ、シグナルノイズ比が著しく低下
- strict severity の誤検出（items 1,4,6,7,8,9,10）は docs-check 実行時にノイズとして表面化
- 実行者が誤った修正を施すリスク（items 1,5,9,10 では item の推奨対応が文書破壊を招く）
- checker に対する信頼性低下

## 課題

checker heuristic が文脈（code span・retired 範囲・否定文・path fragment・glob・README section 構造・範囲表現）を認識せず、素朴な文字列一致・正規表現で判定している。以下の改善方向がある:

1. **code span / inline code の除外**: `broken-file-link` が code span 内をスキャンしないよう修正（pattern 1）
2. **retired / 履歴文脈の認識**: active 範囲と retired 範囲の記述行を区別するよう `req-range-staleness` を修正（pattern 2）
3. **非推奨判定の精度向上**: frontmatter の deprecation marker のみを根拠とするよう `cmd-deprecated-in-inventory` を修正（pattern 3）
4. **等価表現の認識**: スキル参照等の等価表現を capture 責務記載として認めるよう `command-capture-duty` を修正（pattern 4）
5. **文脈付きキーワード判定**: `includes("不要")` を文脈解析に置き換えるよう `bugfix-docs-consistency` を修正（pattern 5）
6. **glob pattern の skip**: `*` を含む path を個別ファイル検査から除外するよう `template-path-integrity` を修正。REQ-0108-115(e) 準拠（pattern 6）
7. **廃止・否定文脈の除外**: phase 語 + status 語の同行出現において、廃止説明・否定記述行を除外するよう `workflow-status-prohibition` を修正（pattern 7）
8. **README section 構造の認識**: retired セクション内の ADR 番号を actual set から除外するよう `checkAdrReadmeIndexSync` を修正（pattern 8）
9. **範囲表現の認識**: 「X から Y」「X〜Y」等の範囲表現を個別参照と区別するよう `adr-req-crossref` / `broken-adr-ref` を修正（pattern 9）
10. **path fragment の除外**: word-boundary / path-fragment 除外ロジックを追加するよう `legacy-namespace` を修正。REQ-0108-076/077 準拠（pattern 10）

## 既存要件との関連

- **REQ-0108-013**: 検査の false positive は finding 修正または除外ルール追加で対処すること
- **REQ-0108-076**: path fragment は標準 finding 対象外
- **REQ-0108-077**: 同一根拠からの重複 finding 禁止
- **REQ-0108-115(e)**: glob pattern（`*` を含む）は個別ファイル検査を skip
- **REQ-0108-123**: workflow-status-prohibition（自己参照免除あり）
- **REQ-0108-125**: 現行要件の根拠としての retired 文書引用は warning 対象外
- **REQ-0108-140**: REQ 範囲表記の鮮度検査（active 範囲が対象）
- **REQ-0108-142**: false positive は finding 修正または除外ルール追加
- **REQ-0108-222**: 同一是正方針で統合可否判断（機械的分割禁止）

## 対応方針の方向性

- **route**: req-define（checker / 検査ルールの改善）
- **category**: integrity-rule-gap
- 10 パターンを個別に直すか、checker に共通の「文脈認識レイヤー」を導入するかは req-define で判断
- REQ-0108-222 に基づき、統合 RU として扱うか分割するかは backlog-review / req-define で判断

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-broken-placeholder-link-req-nnnn.md`
- `.agentdev/intake/inbox/2026-06-14-req-range-stale-in-project-docs-guide.md`
- `.agentdev/intake/inbox/2026-06-14-docs-review-deprecated-in-inventory.md`
- `.agentdev/intake/inbox/2026-06-14-commands-missing-capture-boundaries-reference.md`
- `.agentdev/intake/inbox/2026-06-14-bugfix-docs-rule-conflict-req0104-vs-req0108.md`
- `.agentdev/intake/inbox/2026-06-14-case-close-template-glob-missing.md`
- `.agentdev/intake/inbox/2026-06-14-workflow-status-prohibition-overmatch.md`
- `.agentdev/intake/inbox/2026-06-14-adr-readme-index-stale-retired.md`
- `.agentdev/intake/inbox/2026-06-14-phantom-adr-0099-in-req-0112.md`
- `.agentdev/intake/inbox/2026-06-14-legacy-bare-slash-case-open.md`
