# artifact-responsibilities SPEC「重複許容基準」適用例集の追記

## 観測内容
- 3 由来で artifact-responsibilities.md SPEC の「重複許容基準」適用例を SPEC 本文へ追記する候補が挙がっている
  - `inspect-skills` references の重複許容基準の具体的適用フローが SPEC 本文に未記載
  - project extensions boilerplate（15 command 共通）の正の情報源明示強化
  - PR #1534 の SPEC 確定候補として記録され、case-close で「見送り」選択（後続 spec-save で対応）
- 3 由来とも SPEC 本文への適用例追記が目的

## 影響
- 重複許容基準の適用フローが SPEC 本文にないため、今後同種の判定が必要な配布物が増えるたびに references を横断して参照する必要がある
- project extensions boilerplate の重複許容が「正の情報源明示」によって担保されていることが SPEC 読者に伝わらない

## 課題
- artifact-responsibilities.md SPEC に「重複許容基準」適用例集を追記し、複数の適用パターンを一覧化する
- 適用例: inspect-skills references のパターン、project extensions boilerplate のパターン

## 既存要件との関連
- REQ-0119-034: 同一契約再定義抑止の原則
- REQ-0147-001: SPEC 重複許容基準
- CR-002: SPEC 修正は case-run 都度 spec-save

## 対応方針の方向性
- SPEC 本文に適用例集セクションを新設し、各適用パターン（フロー + 具体例）を記述
- references 側は SPEC 本文への参照に縮約
- 本件は PR #1534 で「見送り」選択された SPEC 確定候補を含むため、後続 spec-save で処理することを前提とする（CR-002 合意）

## 出典
- 元 intake item:
  - intake-2026-07-18-inspect-skills-spec-duplication-allowance.md
  - intake-2026-07-18-0545-spec-confirmation-candidates-deferred.md（候補1: artifact-responsibilities.md 重複許容基準適用例追記）
  - intake-2026-07-18-0545-project-extensions-boilerplate-source-clarification.md
