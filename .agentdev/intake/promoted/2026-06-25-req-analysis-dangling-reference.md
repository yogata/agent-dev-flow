# agentdev-req-analysis SKILL.md の dangling 前方参照

## 観測内容

`src/opencode/skills/agentdev-req-analysis/SKILL.md` が前方参照する `references/req-define-detailed-gates.md` が PR #1103 時点で存在しない。
SKILL.md の記述では SPLIT 予兆計算の詳細を当該ファイルに記載するとされているが、ファイル自体が未作成である。

## 影響

SKILL.md 読者が参照リンクを辿ると 404 になる。
req-define 実行時に SPLIT 予兆計算の詳細手順を参照できない（現在 SKILL.md 本文のみで完結しているか、詳細が欠落しているかの確認が必要）。

## 課題

dangling 参照を解消し、SPLIT 予兆計算ロジックの所在を確定する。

## 既存要件との関連

- Issue #1102（本件とは無関係、PR #1103 実装時に発見）
- PR #1103（merged, squash 88599d6c）
- 関連: REQ-0102-072/073（PR #1103 の主目的）

## 対応方針の方向性

事前確認: SPLIT 予兆計算ロジックが現在 SKILL.md 本文で完結しているか、詳細が欠落しているかを実装確認してから対応方針を決定する。
候補は以下のいずれか。

- `references/req-define-detailed-gates.md` を新規作成し SPLIT 予兆計算の詳細を記載する
- SKILL.md から dangling 参照を削除し、本文に詳細を直接統合する
- 参照を TBD マーカー付きで残し、明示的な未作成であることを示す
