# REQ 行・Decision 変更を伴う Definition 変更での AUTOGEN 派生物再生成手順の明文化

## 背景

Case #3169 で REQ 3行 append・Decision 1件新規作成を含む Definition 変更を行った際、generate_indexes.ts 再生成が未実行のまま check_integrity（index-generation-consistency NG 6件）と check_autogen_freshness（鮮度違反 2ブロック）を実行すると必ず失敗することが確認された。再生成を実行して同一 commit に含めたところ check_integrity（ng 0 / warning 0）と check_autogen_freshness（0件）が合格した。同一問題クラス（AUTOGEN 再生成漏れ防止）の deferred 近縁4件が存在し、本件は case-open STEP-4 手順側の delta。

## 問題

- REQ 行追加と Decision 新規作成は AUTOGEN ブロック（README 索引・REQ 行数メトリクス・Decision 索引）の入力源を変えるが、definition-pr-and-idempotency.md の branch HEAD 実測手順は再生成実行を明示しておらず、変更作業と再生成の順序が手順上明文化されていない
- REQ 行数メトリクス（req-health-metrics.md の REQ-009 行数）と Decision 索引（docs/README.md・docs/decisions/README.md）は REQ 行追加のみで自動追随しない
- deferred に同一問題クラスの近縁4件（Phase 0 起因の AUTOGEN 陳腐化・docs_chore REQ 行 APPEND の missing-verification・autogen-index-regeneration-diff 拡張check の adr rename 未追随・AUTOGEN 鮮度 gate の日付境界発火）が存在し、統合整備の対象になる

## 望ましい変更

- case-open STEP-4 変更手順に「REQ 行・Decision 変更後、check 実測前に generate_indexes.ts 再生成（bun .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts）」を明文化する
- docs/knowledge/ への知識化判定も可能（評価レポートの反映先明確度 4/5・自動化適性 4/5。統合判断は req-define が確定する）

## 対象範囲

### 対象

- src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-4 実測手順の順序明示）
- case-ready 受入時の check_integrity 前提（PR 作成前に再生成して解消しておく運用）

### 対象外

- generate_indexes.ts 自体の変更（再生成機能は正しく機能している）
- AUTOGEN ブロック形式・索引形式の変更
- deferred 既存4件の個別処理（統合判断は req-define 変更影響分析の責務）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | STEP-4 変更手順への「check 実測前に generate_indexes.ts 再生成」明文化 |
| knowledge | docs/knowledge/ 候補 | AUTOGEN 派生物の再生成タイミング（REQ 行・Decision 変更と再生成の順序）の知識化判定対象 |
| RU 統合候補 | deferred 同一問題クラス4件 | 近縁エントリ（2026-08-18 Phase 0 起因分〔deferred 維持確定済み・次回再評価最優先候補〕等）との統合判断 |

## 既存対策確認

- **確認結果**: あり（近縁 deferred 4件の同一問題クラス観測あり・手順側の明文化なし）
- **該当ファイル**: なし（definition-pr-and-idempotency.md の branch HEAD 実測手順に再生成実行の明示なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 「変更作業 → 再生成 → check 実測」の順序が手順上明文化されていない。deferred 近縁4件はいずれも同一問題クラス（AUTOGEN 再生成漏れ防止）の観測で、本件は case-open STEP-4 手順側の delta。該当 deferred エントリなし（同一クラスの近縁4件あり）

## 制約

- 再生成した派生物（docs/README.md・docs/decisions/README.md・req-health-metrics.md）は同一 Definition PR の commit に含める必要がある
- case-ready 受入時の check_integrity でも同様に失敗し得るため、PR 作成前に再生成して解消しておくのが安全
- Phase 0（req-save/spec-save）起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる別経路が既存（2026-08-18・ユーザー承認で deferred 維持確定済み）

## 受け入れ条件

- [ ] definition-pr-and-idempotency.md の STEP-4 手順に「REQ 行・Decision 変更後、check 実測前に generate_indexes.ts 再生成」が明文化されること
- [ ] 再生成済み派生物の同一 PR 含入が手順として追跡可能であること

## 元 learning item / 根拠

- **要約**: REQ 行追加を伴う Definition 変更では AUTOGEN 派生物（REQ 行数メトリクス・Decision 索引）が必ず陳腐化する
- **根拠**: inbox「REQ 行追加を伴う Definition 変更では AUTOGEN 派生物が必ず陳腐化する — check 実測の直後に generate_indexes.ts 再生成を手順に組み込む」（Case #3169・PR #3170）: check_integrity NG 6件（expected 差分に DEC-045 行・REQ-009 行数 52 と明示）と check_autogen_freshness 鮮度違反 2ブロックを検出。generate_indexes.ts 再生成（docs/README.md・docs/decisions/README.md・req-health-metrics.md）を同一 commit に含め再検証合格
- **再発条件**: REQ 行追加または Decision 追加を含む Definition 変更を generate_indexes.ts 再生成なしで commit する場合
- **横展開可能性**: REQ 行追加・Decision 追加・REQ ファイル行数を計上するメトリクス変更を含む全 Definition PR に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, bug
- **関連Issue**: なし
