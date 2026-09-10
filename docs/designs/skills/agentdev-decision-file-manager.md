---
title: `agentdev-decision-file-manager` Design
status: accepted
created: 2026-06-21
updated: 2026-09-10
---
<!-- ADF-COVERS(implementation): REQ-001-056, REQ-001-057, REQ-001-058, REQ-001-059, REQ-001-060, REQ-004-044, REQ-004-045 -->
<!-- ADF-COVERS(implementation): REQ-059-001 -->

# `agentdev-decision-file-manager` Design

## 目的

Decision ファイルの作成、追記、更新を管理する知識ベースとして採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェックを提供する。

## 適用対象

- req-save（Decision ファイル保存時、採番、CREATE 操作、`new:{topic-slug}` 形式から確定番号への置換）
- case-open（Issue 作成時の Decision 参照）
- case-run（実行時の Decision 参照）

## 提供する判断、操作

- Decision 番号採番（最大番号 +1、欠番再利用禁止）
- CREATE / APPEND / UPDATE 操作モード選択
- ステータス遷移ルール（proposed → accepted → deprecated / superseded）
- 整合性チェック（frontmatter、ID、日付フォーマット、ステータス遷移）
- 現行 Decision（`docs/decisions/DEC-{NNN}.md`）と廃止 Decision（物理削除、または各 retired/ ディレクトリへの移動）の区別

## 参照する references

- `templates/doc_decision.md`（Decision テンプレート）

## 現在の動作

- DEC-{NNN} 形式で3桁ゼロ埋め採番
- 初期ステータスは `proposed`（req-save で作成時）
- 単なる廃止、削除、移行は新規 Decision ではなく `retire` / `supersede` で処理
- accepted 後は非セマンティックな軽微修正のみ許可
- 確定番号は req-save が本スキルの採番ルールで確定し、draft 内の全 Decision 参照（`new:{topic-slug}` 形式）を置換

## 対象外

- Decision 作成ガイドライン、Decision 必要かどうかの判定（`agentdev-decision-guidelines` 担当）
- 要件分析手法（`agentdev-req-analysis` 担当）

## 検証観点

- frontmatter 必須フィールドの充足
- ID とファイル名の一致
- 日付フォーマットの正当性
- ステータス遷移が許容遷移に従っているか
- Decision 本文が意思決定文書として成立しているか（決定内容の明示、文脈、根拠、代替案と却下理由、影響、判断主体の明確さ）。要件（満たすべき成果）と現在の実装構成の詳細は REQ/Design への移送候補として提示する（文書種別責務の原本は document-type-responsibilities Design）

## accepted Decision 直接編集チェックリスト

accepted Decision へ直接編集を実施する場合、次のチェックリストを全て満たすことを確認する（REQ-001、agentdev-decision-guidelines「accepted Decision の更新規則」準拠）。

### 事前確認

- [ ] 対象 Decision の status が `accepted` である
- [ ] 当該編集が非意味修正6件のいずれかに該当する
- [ ] 当該編集が意味変更6件のいずれにも該当しない
- [ ] 明示承認記録が存在する

### 事後確認

- [ ] 決定内容、適用範囲、必須条件、制約、正規所有者、採用方式、観測可能結果が変更されていない
- [ ] 意味変更を表記修正として扱っていない
- [ ] accepted Decision の過去版を無言で書き換えていない
- [ ] Report（Release Report 等）へ規範要件または必達条件を移していない

### 非意味修正6件の確認

編集内容が次のいずれかに該当することを確認する。

1. 誤字または文字化けの修正
2. 壊れたリンクまたは誤ったファイルパスの修正
3. タイトルと本文の不一致修正
4. 意味を変えない表記統一
5. 決定内容でも制約でもない移行時ラベルの除去
6. 履歴注記、関連リンク、日付などの補助情報修正

## related_reqs フィールド管理

- CREATE 時: req-save が要件doc（draft-data）の Decision 対象操作から関連 REQ の初期値を
  決定的に取得する規約に基づき保存する（取得元の draft-data 内構造は patterns.md
  （ACT-DESIGN-001）で確定する。draft-data schema の拡張要否は REQ-008・DEC-003 の管轄との
  整合で design-save 時に確定する）
- UPDATE 時: 関連 REQ の変更（要件再構成、Decision の置換・再確認）をフィールド更新として
  扱う。status 遷移とは独立に更新できる
- 検証: REQ 識別子形式（REQ-{NNNN}）、空宣言と未宣言の区別、実在 REQ の指先確認
- 承認記録: accepted 遷移時の「## 承認記録」セクション形式（日付・遷移・理由）の追記を
  UPDATE 操作の標準手順に含める（形式の正規所有は patterns.md Design）

## See Also

- [agentdev-decision-guidelines.md](agentdev-decision-guidelines.md)
- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)
- [commands/req-save.md](../commands/req-save.md)
- REQ-001（Decision ライフサイクル標準化）
