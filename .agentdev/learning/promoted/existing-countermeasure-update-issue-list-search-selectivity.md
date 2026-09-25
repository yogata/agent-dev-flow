# 既存対策の更新: issue_list search トークンの選択性指針（頻出トークン回避・state 限定の補完）

## 背景

case-open STEP-5 冪等検出（Case #3103）で `issue_list`（search: "RU-0124"、state: closed）を実行したところ、safety page limit（10 pages × 100）に到達する operation-failed となった。
同トークンは同一バッチ兄弟 Case の Issue 本文（CR-002・wave_hints 記録等）に頻出するため、検索対象が実質絞れていない。
再試行前に入力フィルタの決定的違反（page limit 到達）と一時的 API エラーの区別を判断し、1回再試行は同一の決定的失敗になるため実施せず、検索条件を state: open に限定して再実行し検出完了（作成直後の Root Case / Definition PR は open 状態にしか存在しないため、open 限定でも本 Case の冪等検出要件を満たす）。既存 open Root Case 0 件を機械確認して重複生成なしを確定した。

## 問題

REQ-092-001 は広範 filter 時の search 併用を規定するが、search トークン自体の選択性（Issue 本文に頻出する相互参照トークンの回避）と、冪等検出など既存 open 成果物の検出を目的とする場合は state: open 限定で足りるという知見が運用文書に明記されていない。
頻出トークン + closed を含む広フィルタの組合せは、search 併用要件を満たしていても page limit 到達の決定的失敗を引き起こし得る。

## 望ましい変更

issue_list 冪等検出の手順（case-open / issue tracking 系 skill references）に、search トークンの選択性指針を追記する。

- search トークンはタイトル等に偏在しない高選択性トークンを使い、同一バッチ内で相互参照される頻出トークン（RU 番号・REQ 行 ID 等の本文側頻出語）+ closed を含む広フィルタの組合せを避ける。
- 冪等検出（既存 open 成果物の検出）は state: open 限定で十分なケースが多い旨の指針を明示する。
- 再試行前に入力フィルタの決定的違反（page limit 到達）と一時的 API エラーを区別する判断基準を明示する。

## 対象範囲

### 対象

- issue_list 運用規律の運用文書（配布 skill reference issue-operation-safety.md）
- case-open STEP-5 冪等検出の手順記述
- REQ-092 関連行への選択性指針明示の要否

### 対象外

- agentdev_gh Custom Tool（issue_list 実装・safety page limit の値）の変更
- REQ-092-001/002/003 の契約文言の変更（残余知見の反映先は運用文書側。REQ 行変更の要否は req-define が判断）
- 追跡Issue論理スキーマ（agentdev-issue-tracking）の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md（実在確認済み） | search トークンの選択性指針（頻出トークン回避・state/role 併用）と決定的違反 vs 一時的エラーの区別の追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/SKILL.md | STEP-5 冪等検出における issue_list 実行手順への選択性指針注記 |
| REQ | docs/requirements/REQ-092.md | REQ-092-001 への選択性観点明示の要否判断 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: docs/requirements/REQ-092.md（REQ-092-001: 広範 filter 時の search 必須併用〔REQ-092.md:24 実読確認済み〕、REQ-092-003: page limit 到達時の contingency 補完手順）、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: search 併用は規定されているが、(1) search トークンの選択性（本文頻出トークンの回避）(2) 冪等検出目的の state: open 限定の有用性 (3) 決定的違反と一時的エラーの再試行判断基準が運用文書に明記されていない。

## 制約

- REQ-092-002（labels は論理軸の物理マッピング専用）の契約との整合を維持する。
- state: open 限定は冪等検出（作成直後の成果物検出）に限る。closed 成果物を参照する後続検索には適用しない。

## 受け入れ条件

- [ ] issue 運用文書に search トークンの選択性指針が追記されている
- [ ] 冪等検出の state: open 限定指針と決定的違反 vs 一時的エラーの区別が確認できる

## 元learning item / 根拠

- **要約**: issue_list が本文頻出トークンの search + state closed 組合せで safety page limit に到達し失敗する（選択性指針の残余ギャップ）。
- **根拠**: Case #3103（PR #3104）の case-open STEP-5 冪等検出実失敗。search: "RU-0124" × state: closed で page limit 到達（operation-failed・retryable 表示）。state: open 限定への条件変更で検出完了。Custom Tool agentdev_gh（issue_list）の運用知見。
- **再発条件**: 同一バッチ内で相互参照されるトークン（RU 番号・REQ 行 ID 等）を search に使い、state を限定しない場合に再発。
- **横展開可能性**: issue_list を使用する全 workflow（case-open、issue tracking、backlog 系）に共通する Custom Tool 運用知見。ユーザーHITL承認（2026-09-25）により既存対策の更新として確定。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（運用規律追記）
- **関連Issue**: Case #3103（PR #3104）
