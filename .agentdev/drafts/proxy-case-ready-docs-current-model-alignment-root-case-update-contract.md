# proxy-case-ready payload: Root Case #3293 更新（STEP-4: execution contract 確定）

適用手順（resume 実行者）: `gh issue view 3293 --json body` で現行本文を取得し、次の3操作を適用して本文全体を `agentdev_gh` issue_update で更新する。Markdown 行構造（LF、セクション間空行、インデント）を保持すること。この update は Definition PR merge 完了後に実行する。

1. 置換（「Case 状態と次工程」セクション内の Definition PR 行）:
   - 現行: `- Definition PR: 作成済み: PR #3294`
   - 置換後: `- Definition PR: merge 済み: PR #3294（92edf6ae）`
2. 挿入（次の「## Execution Contract」セクション全文を「## Definition Package」セクションの直後、「## Case 状態と次工程」セクションの直前に挿入する）:
3. 他のセクション（概要・実行識別情報・対象 REQ・レビュー判断・補足情報）は変更しない。

挿入するセクション（verbatim）:

```markdown
## Execution Contract
<!-- Execution Contract: case-ready STEP-4 で確定。case-run は本セクションを既確定契約として消費し、不足契約の補完を行わない（REQ-061）。実行構造（Epic / Child Issue / Wave）は STEP-5・STEP-6 の確定後に「実行構造」セクションとして記録される -->

### 対象範囲

2026-10-01 時点で成立済みの AgentDevFlow 第4世代運用モデルと ADF 判断アーキテクチャ（REQ-096 / DEC-048）、文書種別責務（REQ-001）を、docs/** の現行正規文書全体へ意味的に行き渡らせる 7 合意項目（AG-001〜AG-007）: 判断アーキテクチャの横断整合、Design 状態評価の証拠保存先是正、現行 Design 本文の現在形純化、第3世代→第4世代移行文書の現在責務分離、入口文書の現在像への統合、規範重複の限定的縮約、実装投影・検証の最終同期と最終横断検証。各合意項目の本文の正は Definition PR #3294（merge 済み）の Definition Package 記録と draft-data 遺産（Issue 本文と Git 履歴）である。

対象外: 新しい設計思想の追加、新規 Decision、accepted Decision 本文の変更、新規恒久文書種別の追加、DEC-008 frontmatter への相互参照追記（CR-004・将来 intake）、accepted Decision・Report・Jev 観測の過去判断内容の書き換え。

### 変更対象成果物

Definition 面（Definition PR #3294 として merge 済み・実装対象外）:
- req: docs/requirements/REQ-034.md（REQ-034-032 行）、docs/requirements/REQ-061.md（REQ-061-003 行）、docs/requirements/REQ-032.md（REQ-032-025 行と適用範囲の見送り記録記述）
- design: docs/designs/commands/case-auto.md、docs/designs/commands/case-ready.md、docs/designs/commands/case-close.md、docs/designs/foundations/system.md、docs/designs/foundations/v3-v4-crosswalk.md、docs/designs/foundations/v4-migration-and-release.md、docs/designs/skills/agentdev-design-file-manager.md
- design: docs/designs/README.md（Design 管理インデックスの要約列追随。宣言外変更として overlap 突合で警告記録済み。REQ-001-026/028 のインデックス整合追随として受入）

実現面（Child Issue で実施）:
- implementation: src/opencode/skills/**（case-auto・case-ready・case-close・design-file-manager 系の実行時投影。RA-001・RA-002）
- tests / traceability / AUTOGEN 索引: 検証資産の同期（RA-003、RA-006 の索引再生成）
- guide: docs/README.md、docs/guides/README.md、docs/guides/charter.md、docs/guides/project-docs-and-specs.md（RA-004）
- design: docs/designs/** 横断の現在形純化（RA-005）、規範重複の限定的縮約（RA-006 の縮約部分）

### 関連 REQ / Decision / Design

- REQ: REQ-034-032・REQ-061-003・REQ-032-025（対象要件行）、REQ-001（文書種別責務・純化基準）、REQ-096（判断アーキテクチャの正）、REQ-088（三層責務・Project Contract）、REQ-048 / REQ-015（統制縮小・review skip 基準）
- Decision: DEC-048（判断アーキテクチャ・現行正）、DEC-008（歴史的判断記録として参照維持・本文編集禁止）、DEC-034（移行アーキテクチャ原則）、DEC-001（憲章）、DEC-027（統制縮小）。proposed Decision は 0 件（case-ready STEP-3 で frontmatter 機械確認済み。Decision 受理評価対象なし・accepted 遷移なし）
- Design: Definition merge 済み 7件（上記）、docs/designs/**（横断純化・縮約対象）、docs/designs/README.md（管理インデックス）

### 完了条件

決定的受け入れ条件 AC-01〜AC-15（Source: RU-20261001-01 §7。draft-data 遺産から転記。本セクションが正）:

- AC-01 判断権限の一貫性: 現行 REQ、Design、Guide、実行時投影のいずれにも、「唯一解でないこと」「意味判断であること」「難しいこと」「確信度」「評価器間の不一致」「blocked / failed 等の結果状態」だけを理由として人間判断へ移送する正規規則が残っていないこと。
- AC-02 case-auto の親判断解決: REQ-034-032 と case-auto の bounded parent decision resolution が REQ-096 の確定権限3分類と一致し、正規契約からの導出と委譲された裁量を自律確定可能範囲として扱うこと。
- AC-03 case-ready の判断境界: Definition 受入、proposed Decision 受理、意味的不整合処理について、「新しい意味判断」「一意確定不可」という語だけで HITL を決めず、人間に留保された判断か、既存契約内で解消可能かに基づいて処理すること。
- AC-04 失敗原因別回復: 主要 workflow の停止・失敗説明が REQ-096 の原因別処理と矛盾せず、実装不具合、証拠不足、外部依存障害、運用前提不足、上流投影不備、解決可能な不一致、未解決規範矛盾、人間留保判断を区別できること。
- AC-05 Design 現在形: 現行 docs/designs/** が REQ-001-003 / REQ-001-014 に従い、現在の構造、動作、責務、データ、規則、パラメータを記述し、完了済み移行経緯、作業履歴、監査・評価・検証実績、将来予定を現在 Design 本文へ保持しないこと。
- AC-06 Design 履歴再生成防止: Design accepted 昇格・見送り処理が Design 本文へ `対応記録` 等の作業履歴を新規生成しないこと。REQ-032-025、Design、Skill、reference、必要な実装投影が同じ保存方針へ一致していること。
- AC-07 既存 Design の対応記録整理: 既存の `## 対応記録` のうち、現在設計ではない昇格日、Case/PR、評価結果等の履歴情報が現行 Design 本文から除去されていること。現在契約として必要な情報が対応記録節にしか存在しない場合は、現在形の適切な節へ移してから履歴部分を除去すること。
- AC-08 移行文書の責務分離: 第3世代→第4世代の現在サポート対象となる利用者移行契約と、AgentDevFlow 本体の過去の再編履歴が分離され、現在 Design が過去の再編段階を正規状態として参照しないこと。
- AC-09 入口文書の現在像: docs/README.md と docs/guides/** から、第4世代の三層責務、Project Contract、現在の標準導線、判断権限モデル、文書責務へ矛盾なく到達できること。Guide は基準本文を複製せず、正規文書への導線を提供すること。
- AC-10 Project Contract の説明: project-docs-and-specs.md が REQ / Decision / Design の関係を維持しつつ、それらだけが Project Contract 全体ではないことを説明し、REQ-088 と v4 Operating Model の論理ビューへ案内すること。
- AC-11 正規所有者の一方向化: 今回修正する各判断・文書責務について正規所有者が一つに定まり、他文書は参照または投影として扱われること。同じ規範本文を複数箇所で独立管理しないこと。
- AC-12 accepted Decision と Report の履歴保持: 現在像への整合を理由として accepted Decision の過去判断内容や既存 Report / 観測事実を書き換えていないこと。
- AC-13 実装整合: 文書変更に対応する実行時投影・Skill・reference・検証が存在する箇所について、旧契約が残存せず、代表ケースで期待挙動を確認できること。
- AC-14 整合性検査: docs-check、inspect-docs、変更文書ガード、影響対象試験、索引整合、文章品質検査の必要項目が合格すること。既知の基準外警告が残る場合は今回変更起因か既存かを区別し、今回変更起因の未解決 NG を残さないこと。
- AC-15 意味上の完了: ファイル単位の修正完了ではなく、少なくとも次の関心ごとに「共通原則 → REQ → Design → Guide/概要 → 実行時投影 → 検証」が同じ意味になっていること: 判断方法と確定権限、人間判断境界、失敗・停止時の回復責務、Design の現在設計責務、Design 状態評価の証拠保存先、第3世代→第4世代移行の現在責務、Project Contract と文書入口。

### test strategy

テスト戦略 TS-001〜TS-009。各 TS の 3 要素（verification / pass_criteria / on_failure）の正は対応子 Issue 本文の「テスト戦略」セクションである（子 Issue 単独自足）。OU → TS 割当て:

| TS | target_item（AG） | 担当 OU | Child Issue |
|---|---|---|---|
| TS-001 | AG-001（case-auto 系対象部分） | OU-0001 | 子 Issue 1 |
| TS-002 | AG-001（case-auto Design 対応節） | OU-0001 | 子 Issue 1 |
| TS-001 | AG-001（case-ready 系対象部分） | OU-0002 | 子 Issue 2 |
| TS-002 | AG-001（case-ready Design 対応節） | OU-0002 | 子 Issue 2 |
| TS-003 | AG-002 | OU-0003 | 子 Issue 3 |
| TS-004 | AG-003 | OU-0004 | 子 Issue 4 |
| TS-005 | AG-004 | OU-0005 | 子 Issue 5 |
| TS-006 | AG-005 | OU-0006 | 子 Issue 6 |
| TS-007 | AG-006 | OU-0007 | 子 Issue 7 |
| TS-008 | AG-007（最終横断検証） | OU-0008 | 子 Issue 8 |
| TS-009 | AG-007（代表ケース検証） | OU-0008 | 子 Issue 8 |

on_failure の共通処置: fix-and-reverify。意味変更が必要になる場合は record-in-findings（本 Case の対象外として既存の判断境界に従う）。

### 必須品質統制

- document 変更 → 文書品質査読能力（textlint 共通基盤〔agentdev-textlint-guard gate〕、targeted docs guard、docs-check 関連検査）
- design 変更 → 同上に加え docs-check の Design 関連検査・check_integrity
- implementation（Skill・Workflow Skill）変更 → Skill 品質査読能力（skill 構造 lint・Command/Skill 参照妥当性）+ textlint gate
- tests 変更 → 当該テストの実行と影響範囲検出に基づく既存試験
- AUTOGEN 索引 → 手編集禁止。差分が必要な場合のみ既存生成器で再生成
- 最終横断検証（TS-008）は OU-0008 が実施し、親 Epic Issue の完了報告へ記録する

### scope-affecting impact candidate

- docs/designs/foundations/system.md を OU-0001 と OU-0002（同一 Wave 1・並列）が共有。system.md の主要編集は Definition PR #3294 で単一実施済みであり、追加修正が生じる場合のみ衝突リスク。重複許容（衝突解消担当は後着 merge 側・マージ順序は case-auto orchestration の Wave 1 fan-in 順序）を Epic Issue 本文の Wave 重複前置検出節へ記録済み
- docs/designs/commands/case-ready.md を OU-0002（Wave 1）と OU-0004（Wave 2・`## 対応記録` 見出し除去）が順次変更。Wave 1 → Wave 2 の順序で構造的に回避され、後続側（OU-0004）が rebase 前提
- OU-0006・OU-0007 は target_design を持たず、対象パスは RA-004・RA-006 の ownership_hints が所有する（REQ-061-019 の比較対象は検出不能として報告済み）
- 見送り記録保存先変更（REQ-032-025）は case-close の Design 状態評価動作に影響する。OU-0003 の同期後の case-close 実行から新契約が適用される
- Definition PR #3294 の overlap 突合で docs/designs/README.md を宣言外変更として機械検出（警告記録済み）。Design 管理インデックス追随（REQ-001-026/028）として受入
- Definition branch 分岐以後の main に無関係 chore commit 2件（fefa9d6f・3016eb18）が存在したが、merge 時の docs 定義への競合は発生しない（merge 実績で確認）

### ユーザー明示 review 発動契約

- 該当なし。ユーザー明示指定なし（adversarial-review は REQ-015-003 により skip 判定記録済み。case-run 側が一時会話コンテキストのみを根拠に新規発動契約を追加しない前提をここで確定する）

### work_type / scale / Issue structure

- work_type: maintenance / scale: large
- Issue structure: Epic 構成（Epic Issue 1 件 + Child Issue 8 件〔OU-0001〜OU-0008、全て operation: update・issue_policy: single・scale: standard〕+ Wave 6 本）。3軸判断の確定根拠（依存強度: 必須・Epic サイズ: 8/上限 10・機能的一貫性: 一貫）は Epic Issue 本文「構成推論の根拠（3軸判断）」節に記録
```
