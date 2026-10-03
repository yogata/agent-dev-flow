---
title: `agentdev-workflow-templates` Design
status: accepted
created: 2026-06-21
updated: 2026-10-03
---
<!-- ADF-COVERS(implementation): REQ-007-002, REQ-007-003, REQ-007-005, REQ-017-003 -->
<!-- ADF-COVERS(implementation): REQ-048-001, REQ-048-002, REQ-048-008, REQ-048-016, REQ-014-016 -->
<!-- ADF-COVERS(implementation): REQ-100-005, REQ-100-008 -->

# `agentdev-workflow-templates` Design

## 目的

agentdev 系コマンドで使用する Issue/PR 本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。

## 適用対象

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造、規約を確認する場合

## 提供する判断、操作

- Issue 本文テンプレート（feature / bug / epic / child）
- コメントテンプレート（bug_analysis / feature_technical / update / review_ng / feature_implementation / bug_record）
- PR 本文テンプレート（`## Findings / Capture候補`、`## Design確定候補` セクション含む）
- テンプレート選定ルール（work_type、Issue 種別、フロー種別）
- セクション規約（`<!-- 【必須】 -->`、`<!-- 【任意】 -->` マーカー）

## 参照する references

- `templates/issue_desc_feature.md`
- `templates/issue_desc_bug.md`
- `templates/issue_desc_epic.md`
- `templates/issue_desc_child.md`
- `templates/issue_comment_bug_analysis.md`
- `templates/issue_comment_feature_technical.md`
- `templates/issue_comment_update.md`
- `templates/issue_comment_review_ng.md`
- `templates/issue_comment_feature_implementation.md`
- `templates/issue_comment_bug_record.md`
- `templates/pr_desc.md`

## 現在の動作

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- 変数置換後の本文は Custom Tool `agentdev_gh` の操作契約経由で渡すこと。本文の byte 保持（LF、空行、インデントを含む行構造）を維持し、Tool 内 VERIFY に委任する。文字列変数での本文持ち回りを禁止する（Tool への受け渡し手段は Tool 内部に隠蔽する）
- コメントテンプレート（`issue_comment_*.md`）の投稿は Custom Tool `agentdev_gh` の comment_create 操作で行う。テンプレートファイル名は用途識別子であり、Tool 操作名を指さない
- テンプレートの構造を維持する（セクションの削除、順序変更禁止）。Markdown 行構造（LF、セクション間空行、インデント）の保持を含む
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可
- `<!-- 【任意】 -->` マーカー付きセクションは省略可能
- 変数に該当するデータがない場合は「該当なし」と記載
- 本文テンプレートは Issue 本文の構造のみを規定し、Issue タイトルを規定しない。テンプレート例・変数値にタイトル書式を複製せず、起票時のタイトル書式と付与・更新の場面は `workflows/issue-title-policy` Design（Issue タイトル記述規則）を参照する。Epic 分解テーブルの内容列（子 Issue タイトルの転記先）も同 Design「Wave 投影」節の書式に従う
- PR テンプレート（pr_desc.md）は verify-only PR の根拠欄を含む。根拠欄には種別 verify-only、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。case-run は verify-only PR 作成時に当該欄を埋め、case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む（[case-run.md](../commands/case-run.md)「verification-only PR（実装差分なし、検証のみ）（v2:REQ-0158-002）」、[case-close.md](../commands/case-close.md)「verification-only PR の files_checked 空確認（v2:REQ-0158-002）」参照）
- PR テンプレート（pr_desc.md）の関連Issueセクションは、マージ時の Issue 自動クローズを抑止し、case-close 工程の明示クローズ契約と整合する `Refs: #$ISSUE_NUMBER` 形式である

## review_dispositions の消費

Root Case 本文のレビュー判断セクションへの review_dispositions 全件転記を行わない。

- 採用内容（accepted disposition）は実行契約の該当章（対象範囲、実現方針、完了条件の検証方法）へ反映する
- 必要な採否理由（後から判断根拠を確認する必要があるもの）だけをコメントへ残す
- review_dispositions の構造（id、disposition、reason_code、reason、evidence）の正は既存の正規所有先（artifact-contracts Design「req_draft 出力構造」節）のままとし、本変更でスキーマを変更しない。Issue 本文へ転記用の同型セクションを定義しない

## 完了条件検証項目の記述ガイドライン（AG-006）

完了条件チェックボックスの検証項目（3要素構造: 条件 / 検証方法 / 合格条件）に記述する合格条件（pass_criteria）は QG-4 評価で REQ content と照合される。Issue 本文に独立したテスト戦略セクションを生成しない（REQ-017-003）。

### 共通 pass_criteria のリスクと REQ 個別期待値推奨

複数 REQ へまたがる共通の pass_criteria を起票する場合、各 REQ の pipeline stage（promote 系、review 系等）の違いを吸収せず、単一の文字列一致を要求すると QG-4 評価時に REQ content と pass_criteria 期待値が食い違う。
共通化は避け、REQ 単位の個別期待値を合格条件へ記述することを推奨する。

### 変更対象外 REQ 検証の正しい表現

「変更対象外 REQ の変更がないこと」を検証する場合は「存在しないこと」と書かず「diff がないこと」として表現する。
実在する REQ を「存在しないこと」と記述すると検証意図と検証方法がずれる。既存 REQ への変更有無の検証に「存在しないこと」を使用しない。「存在しないこと」は新規作成禁止の未作成確認の場合のみ使用する。

### テンプレートへのガイド反映

feature、bug、child の各 issue_desc テンプレートは完了条件セクションへ本ガイドラインの要点を HTML コメントとして埋め込み、記述者が合格条件を記述する際に参照できるようにする。
epic テンプレートは完了条件の評価対象が子 Issue の結果であるため、個別の検証項目記述の対象外とする。

### 構造変更 PR の完了条件と契約テスト期待値

- 構造変更（command、skill、template の構造様式変更）を伴う PR の完了条件には、当該構造を固定する契約テストの期待値更新を明示的に含める
- 本文圧縮・機械的リライトの実施前には、当該ファイルを参照する `*.test.ts` を grep し、期待値に埋め込まれた固定トークン（原文断片）の有無を確認する手順を thin 化手順へ組み込む
- PR テンプレートの完了条件セクションに、本確認の実施有無を記録する欄を設ける

## execution contract セクション（Issue template 拡張）

execution contract を独立した Issue 本文物項目として生成しない。実行契約の要素は本文基本構造の各章へ分布させる:

- 変更対象成果物 → 対象範囲の主な変更対象（実行単位が所有する機械比較可能な宣言。最終変更ファイル一覧と区別し、実差分の正は Git 差分）
- 必須品質統制 → 完了条件の検証方法・合格条件への統合（テスト戦略・必須品質統制の別章を設けない。artifact-quality-control-routing Design の能力キーに基づく検証を case-ready が完了条件へ展開する）
- 関連 Decision 拘束条件 → 実現方針（再判断不可の合意がある場合）または完了条件の検証方法
- scope-affecting impact candidate → 対象範囲（case-open が事前探索した候補の反映）
- adversarial-review 発動契約（任意）→ 廃止（ユーザー明示指定の専用保存・伝播を行わない。REQ-015-002）

### 対象範囲表記の正規形

Issue 本文の対象範囲にローカル版（src/opencode-local 配下等）の references パスを記載する際は、配置領域の接頭辞（src/opencode-local/）を明示し、配布物（.opencode/）の同名パスと区別できる表記を正規形とする（維持）。

### 形式の唯一性

変更後の形式を唯一の現行形式とする。presence-based 判定（Execution Contract セクションの存在有無による新旧 Issue 識別）、旧形式テンプレートの維持・移行、旧形式を一律 blocked としない運用、見出し・スキーマ版による新旧判別を行わない。新形式内の章読み取りと Issue 構造の判別は、新旧併存のための形式判定とは区別する。

## Execution Contract

### 変更対象成果物
- （artifact type と対象パスのリスト）

### 必須品質統制
- （artifact-quality-control-routing Design に基づく能力キーと検証項目）
- 監査値（bun test 件数・検出件数等）には計測基準（基準 commit または時点）を併記する

### 関連 Decision 拘束条件
- （該当 Decision と完了条件/test strategy への反映）

### scope-affecting impact candidate
- （case-open が事前探索した候補）

### adversarial-review 発動契約（任意）
- （ユーザー明示指定時のみ記録）
```

### 対象範囲表記の正規形

Issue 本文の対象範囲にローカル版（src/opencode-local 配下等）の references パスを記載する際は、配置領域の接頭辞（src/opencode-local/）を明示し、配布物（.opencode/）の同名パスと区別できる表記を正規形とする。

### presence-based 判定

case-open は新規 Issue 作成時および case-ready / case-revise による新契約更新時に「Execution Contract」
セクションを必ず付与する。
case-run は当該セクションの存在有無により新旧 Issue を識別する。

### legacy Issue テンプレート

本変更以前の Issue テンプレートは廃止せず、履歴として維持する。既存の
issue_desc_feature.md、issue_desc_child.md は新テンプレートへ移行する。
issue_desc_bug.md、issue_desc_epic.md は bugfix/maintenance/docs_chore または backlog 由来であり、
execution contract セクションの付加を検討するが必須とはしない（work_type により
execution contract 責務が軽量なため）。

## テンプレート正規形（Parent 配置・Epic 実行構成）

Epic Issue・子 Issue テンプレートの次の正規形を本 Design が正規所有する。
テンプレート（issue_desc_child.md / issue_desc_epic.md）と agentdev-epic-tracker references は本正規形の実装ビューであり、乖離しない。

### Parent 配置の正規形

- 子 Issue 本文の先頭行に `親Epic: #N`（N = 親 Epic Issue 番号）を配置する
- 配置は case-ready がテンプレート適用時に行う。agentdev-epic-tracker は本形式を親 Epic 検出の正規パターンとする
- 新規 Issue では旧形式（`Parent: #N`、「## 親Issue」セクション配置）を使用しない。旧形式を恒久的に読み続ける互換層を残さない

### Epic 実行構成の正規形

- 実行構成（Epic 本文の子 Issue、Wave、意味的依存、子状態）は一つの表 `| Wave | Issue | 前提 | 状態 |` 形式で保持する（Wave = 所属 Wave 番号、Issue = `#N`、前提 = 意味的依存（依存先 Issue。なしは `-`）、状態 = 子状態4値）
- 実行構成は Issue 本文に一つだけ存在し、分解表と実行順序表の二重保持を行わない
- 状態の初期値は `pending`（更新は取りまとめ（case-close と工程記録の取りまとめ）が per-Epic の単一書き手として行う）
- 状態は pending / completed / blocked / failed の4値のみとし、ready、running、Wave 状態、状態別件数を Issue 本文へ保存しない。PR 番号・URL は状態列に付記せず、子 Issue の結果・PR 自体から取得する
- テンプレート選定規則は本 Design が、Wave 構成（wave 番号の付番）は case-ready Design「v3 epic-wave-model Design からの吸収」節（Wave 構成ルール）がそれぞれ所有する責務分担を維持する

## 対象外

- ワークフローのフェーズ定義や遷移ロジック（`agentdev-workflow-lifecycle` 担当）
- パターン分類や判定基準（`agentdev-workflow-lifecycle` 担当）
- 要件分析手法や品質基準（`agentdev-req-analysis` 担当）

## 検証観点

- テンプレートの構造を維持しているか
- `<!-- 【必須】 -->` マーカー付きセクションを省略していないか
- 変数に該当するデータがない場合は「該当なし」と記載しているか

## backlog 系テンプレート列挙の整理

references セクションに列挙された backlog 系テンプレート2ファイル（`issue_desc_backlog_child.md`、`issue_desc_backlog_epic.md`）は不要（ユーザー判断確定）。

### 整理内容

- 当該2ファイルの列挙を references セクションから削除する
- カタログ Design としての整合性を列挙削除により確保する
- 原本ドラフトが挙げていた L34-35 は references セクション内の列挙行の近似であり、実施時に正確な行を再特定する

## 配布 template の運用手順（テンプレート作成・更新時の注意事項）

配布 template（テンプレートファイル）本文に ADF-COVERS 宣言を付与しない。
テンプレートを消費する実装の対応宣言は、親 SKILL.md（または該当実装を規定する docs 配下の
正規成果物）へ集約する。テンプレート本文の宣言は配布物内部 ID 契約テスト違反
（配布物本文の concrete ID 記載）を生むため禁止する。

## See Also

- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [agentdev-issue-management.md](agentdev-issue-management.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-close.md](../commands/case-close.md)

## 実行識別情報・検証差分のテンプレートセクション形式

実行識別情報を独立した Issue 本文物項目として生成しない。

- Issue 番号、PR 番号、親Epic 参照、Epic 実行構成の対応関係があれば、実行単位・委譲単位・Case・GitHub Issue・PR・ADF 成果物は最小限の識別子で相関できる。識別子間の対応は Issue 構造と PR から再構成し、本文へ一覧化しない
- 検証差分（検証実行の対象範囲と結果）は完了条件の検証方法・合格条件とコメント・PR 本文の証拠から参照する。独立した実行識別情報セクション、検証差分セクションを設けない
- 監査値（test 件数・検出件数等）には計測基準（基準 commit または時点）を併記する（REQ-017-018 維持）。記録先は完了条件の検証方法に付随する証拠とする

## Case Issue 工程記録テンプレート

Case Issue 本文の工程記録テンプレート（issue_desc_feature.md、issue_desc_child.md、issue_desc_epic.md）は次の様式に従う。

### 本文構造

- Standard Case / Child Issue: 目的、対象範囲・対象外、実現方針（再判断してはならない合意がある場合のみ。非常設）、完了条件、進行状況、結果（完了・中止確定時のみ。非常設）
- Epic Root: 上記に実行構成（`| Wave | Issue | 前提 | 状態 |` の一つの表）を加える
- Child Issue の本文冒頭行は `親Epic: #N`

### 完了条件

各項目をチェックボックス形式（`- [ ] 条件（検証方法: ...、合格条件: ...）`）で保持し、必要な品質検証を統合する。達成状態の確定（`[ ]` → `[x]`）は case-close だけが行う（REQ-032-001）。

### 進行状況

- Standard Case / Epic Root: 正規状態（実行継続 / 完了 / 中止）と開始日時・終了日時のみ
- Child Issue: 開始日時・終了日時のみ（状態は Epic 実行構成が所有）

### 結果

完了・中止確定時にのみ作成する。成果物（PR リンク等）と必要な残件を記載し、終了状態を重複保存しない。

### コメント

停止・失敗の理由、重要な判断変更、検証のみで完了する Issue の証拠、非自明なレビュー判断のみを記録対象とする（issue_comment_record_hold.md、issue_comment_record_decision_change.md、検証証拠用テンプレートを残存させ、着手・引き渡し・再開用テンプレートの使用を廃止する）。

## v4 責務分類

ADF v4 の責務分類（正典: DEC-048、foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本 Design の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）。語彙の原本は foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節であり、本節はその確定値を記録する。

- **意味判断担当**: 0 件
- **決定的処理委譲先**: なし（テンプレート本体は Template 種別資産）
- **知識提供**: テンプレート選定規則・セクション規約
