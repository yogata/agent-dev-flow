# knowledge README 変更 Case の検証ルーティング（targeted docs guard + check_knowledge_docs 両立）

## 背景

Case #3146（DEL-3146-1）で docs/knowledge/README.md を含む変更の検証で、targeted docs guard（check_changed_docs.ts）に --files で同ファイルを明示指定しても files_checked に含まれず、guard 単独では knowledge README 列挙整合が検査されないことが判明した。

## 問題

- targeted docs guard の検査対象種別に docs/knowledge/ は含まれない（Design 上の対象外。代替検査運用は REQ-010-077 で明記済み）
- knowledge README の列挙整合は check_knowledge_docs.ts が正規担当という検査責務分離だが、(i) agentdev-doc-diagnostics に knowledge ルーティングの記述なし（grep 実証）、(ii) case-run / case-close の検証手順に check_knowledge_docs.ts 実行の明示なし
- guard のみで合格判定すると false-clean リスク（readme-listing-mismatch を見逃す）

## 望ましい変更

docs/knowledge/README.md を変更する Case の検証手順に check_knowledge_docs.ts の実行を必須化し、agentdev-doc-diagnostics に targeted docs guard と check_knowledge_docs.ts の検査責務分担を記載する。

## 対象範囲

### 対象

- agentdev-doc-diagnostics（検査ルーティング知識）
- case-run / case-close の docs 検証手順

### 対象外

- check_changed_docs.ts への docs/knowledge/ 対象追加（検査責務分離の現行設計を維持）
- check_knowledge_docs.ts 自体の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-doc-diagnostics/ | knowledge README 変更時の検査ルーティング（guard 対象外 + check_knowledge_docs 必須）を記載 |
| 配布skill reference | case-run / case-close の docs 検証手順 reference | knowledge README 変更 Case での check_knowledge_docs.ts 実行を明示 |

## 既存対策確認

- **確認結果**: あり（guardrail insufficiency）
- **該当ファイル**: targeted-docs-guard-implementation.md（docs/knowledge/** 対象外と代替検査運用 REQ-010-077 を明記済み）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: check_knowledge_docs.ts との検査責務分担明示と workflow 検証手順への実行必須化が未整備

## 制約

- 検査結果の解釈時に guard と check_knowledge_docs.ts の担当範囲の違いを認識可能にすること

## 受け入れ条件

- [ ] knowledge README 変更 Case の検証手順に check_knowledge_docs.ts 実行が明示されること
- [ ] agentdev-doc-diagnostics に検査責務分担が記載されること

## 元 learning item / 根拠

- inbox 2026-09-26「targeted docs guard は docs/knowledge/README.md を検査対象外とし、knowledge README 整合は check_knowledge_docs.ts が正規担当」（Case #3146、PR #3152、DEL-3146-1）: guard --json の files_checked 不含を確認、check_knowledge_docs.ts で readme-listing-mismatch 0 件を確認、case-close STEP-3 でも両立を再確認
