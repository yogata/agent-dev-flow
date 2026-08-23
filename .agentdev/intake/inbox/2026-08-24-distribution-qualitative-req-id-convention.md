# 配布物の要件ID 参照は定性参照で表現し対応宣言は docs・テスト側へ配置する運用の明文化

## 観測

PR #2423（Issue #2419）では配布物（agentdev-traceability スキル配下）に concrete な要件行ID を記載できない制約（配布依存境界、DEC-014）により、SKILL.md・コードコメントは対象契約を「トレーサビリティモデルの対応関係の完全性規則」等の定性参照で表現し、REQ-012-051 の対応宣言（ADF-COVERS）は docs 側 Design（implementation）と repo-local テスト traceability_classification.test.ts（verification）へ配置する運用が踏襲された。case-run では初回に concrete ID 記載で IR-055 回帰テストと traceability_integration テストが fail し、コミット前に修正済み（PR #2423 本文「検証差分」finding 差分）。同一運用知見は learning inbox の既存エントリ（PR #2391、PR #2424）にも記録されている。

## 今回扱わない理由

運用の明文化（skill-authoring ガイダンス等への記載）は case-close の変更範囲に含めない（Design確定候補の処理パターン (c) 見送り、後続へ委ねる）。

## 影響

定性参照・宣言配置の運用がガイダンス化されない限り、配布 skill を編集するたびに IR-055・concrete-id 違反の検出器によるコミット前/後検出に依存する状態が続く（検出器は機能しているが、初回実装の手戻りが反復している: PR #2391、PR #2424、PR #2423 で同型）。

## レビューで決めること

- 「配布物本文は定性参照、対応宣言（ADF-COVERS）は docs 側 Design・repo-local テスト配置」の運用を agentdev-skill-authoring 等のガイダンスへ明記するか（learning inbox 既存エントリ2件〔PR #2391・PR #2424〕の予防策候補と統合するか）

## 根拠

- PR #2423 本文「Design確定候補」2件目、同「検証差分」finding 差分（新規2件→修正済み）
- learning inbox 既存エントリ「配布 skill への実行手順記載は fenced code block とプレースホルダーで書く」（PR #2391）、「配布 Workflow Skill 本文への具象 REQ ID 記載は IR-055 違反になるため対応宣言は command Design へ置く」（PR #2424）
- docs/designs/integrity/rules/IR-055、配布依存境界 Design（DEC-014）
