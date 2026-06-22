# issue970 プロセス改善（SKILL 編集判断基準・バッチ Issue 追跡性）

## 観測

Issue #970 関連で 2 つのプロセス改善課題が残存。

### 課題一覧

1. **command-authoring サブセクション判断基準**: SKILL 編集時の「サブセクション化 vs リスト1行追記」の判断基準が明示されていない。PR #975 で Step 番号関連のサブセクションを追加したが、親リストの最後に「Step 番号の細分」を1行追加するだけでも同等の情報量だった可能性がある。
2. **バッチ Issue の OU ごと完了判定追跡性**: docs_chore 系バッチ Issue（Issue #970 では OU-002/009/010 を1 Issue に束ねた運用）で、OU ごとの完了判定が分散する。Issue 本文の OU×REQ/SPEC マッピング表と実 PR の diff 対応を手動で追う必要がある。spec-save/req-save で先行完了した OU が本筋 PR の diff に含まれない場合、Reviewer が PR を開いただけでは完了状態が分からない。

## 影響

- 今後の SKILL 編集で同じ「親リスト追記」可能な内容でもサブセクション化されるケースが散発し、SKILL 構造にばらつきが生じる
- Reviewer が「サブセクションにすべきだったか？」を毎回判断するコストが発生
- OU が複数にまたがるバッチ Issue で、どの OU がどの commit/PR で対応されたかを Issue 本文だけから追跡困難

## 課題

### command-authoring 判断基準
- command-authoring SKILL に「サブセクション化 vs リスト1行追記」の判断基準（情報量・独立性・将来拡張見込み等）を明示するか

### バッチ Issue 追跡性
- 今後の同種バッチで「OU ごとに sub-issue を分離」または「完了判定表を Issue 本体に保持」のいずれかで追跡性を改善するか
- バッチ Issue テンプレートに「OU × commit hash / PR 番号」の対応表欄を設けるか

## 既存要件との関連

- `agentdev-command-authoring` スキル品質（SKILL.md）
- バッチ Issue 運用（Epic #968）、OU 管理

## 根拠

- 元 inbox item:
  - `2026-06-21-issue970-command-authoring-subsection-criteria.md`
  - `2026-06-21-issue970-batch-ou-diff-tracking.md`
- Issue #970 / PR #975
