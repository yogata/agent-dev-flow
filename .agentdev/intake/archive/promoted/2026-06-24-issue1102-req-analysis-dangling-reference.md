# agentdev-req-analysis SKILL.md の dangling前方参照 (references/req-define-detailed-gates.md)

## 発生源

- Issue: #1102（本 Issue とは無関係、PR #1103 実装時に発見）
- PR: #1103 (merged, squash 88599d6c)
- 発生日: 2026-06-24

## 内容

`src/opencode/skills/agentdev-req-analysis/SKILL.md` が前方参照する `references/req-define-detailed-gates.md` が PR #1103 時点で存在しない。SKILL.md の記述では SPLIT 予兆計算の詳細を当該ファイルに記載するとされているが、ファイル自体が未作成。

影響: SKILL.md 読者が参照リンクを辿ると 404 になる。req-define 実行時に SPLIT 予兆計算の詳細手順を参照できない（現在は SKILL.md 本文のみで記述が完結しているか、または詳細が欠落しているかの確認が必要）。

PR #1103 は REQ-0102-072/073 の実装が主目的であり、本 dangling 参照は既存事象で本 Issue と無関係のため未対応とした。

## 推奨対応先

以下のいずれかを実施する別 Issue を起票:

- (a) `references/req-define-detailed-gates.md` を新規作成し SPLIT 予兆計算の詳細を記載
- (b) SKILL.md から dangling 参照を削除し、本文に詳細を直接統合
- (c) 参照を TBD マーカー付きで残し、明示的な未作成であることを示す

事前確認事項: SPLIT 予兆計算ロジックが現在 SKILL.md 本文で完結しているか、詳細が欠落しているかを実装確認してから対応方針を決定。

## 現在の追跡状態

- PR #1103 Findings に「既存の dangling 参照」として記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
