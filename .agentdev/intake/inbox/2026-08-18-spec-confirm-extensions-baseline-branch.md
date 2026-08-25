# SPEC確定候補: check_extensions.ts の baseline 分岐（SPEC 記述と実装のどちらを正とするか）

## 観測
integrity-contracts SPEC は「check_integrity.ts と check_extensions.ts は ... ng-baseline.json へ格納する」と記載するが、実装は check-extensions-baseline.json（現時点でファイル未作成のため baseline demotion が不活性）を使用し、updateExtensionsNgBaseline は additions manifest を要求しない無条件再生成となっている。

## 今回扱わない理由
SPEC 記述と実装のどちらを正とするかの確定判断を要し、Issue #2206・Issue #2209 の完了条件の範囲外。PR #2254 の SPEC確定候補として記録。

## 影響
check_extensions の NG baseline 運用契約が SPEC と実装で分岐しており、demotion 挙動の期待が文書と異なる。

## レビューで決めること
- SPEC 記述（ng-baseline.json 共用）へ実装を寄せるか、実装（check-extensions-baseline.json 分離 + 無条件再生成）を正として SPEC を改めるか。

## 根拠
- PR 2254 本文「SPEC確定候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2254）
