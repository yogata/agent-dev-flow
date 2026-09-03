# SPEC確定候補: check_extensions.ts の baseline 分岐（SPEC 記述と実装のどちらを正とするか）

## 観測内容

integrity-contracts SPEC は「check_integrity.ts と check_extensions.ts は ... ng-baseline.json へ格納する」と記載するが、実装は check-extensions-baseline.json（現時点でファイル未作成のため baseline demotion が不活性）を使用し、updateExtensionsNgBaseline は additions manifest を要求しない無条件再生成となっている。

SPEC 記述と実装のどちらを正とするかの確定判断を要し、Issue #2206・Issue #2209 の完了条件の範囲外として PR #2254 の SPEC確定候補として記録された。

## 影響

check_extensions の NG baseline 運用契約が SPEC と実装で分岐しており、demotion 挙動の期待が文書と異なる。

## 課題（レビューで決めること）

- SPEC 記述（ng-baseline.json 共用）へ実装を寄せるか、実装（check-extensions-baseline.json 分離 + 無条件再生成）を正として SPEC を改めるか。

## 既存要件・契約との関連

- integrity-contracts Design（docs/designs/integrity/integrity-contracts.md）の baseline 運用契約と check_extensions 実装の整合。
- Issue #2206・Issue #2209 の完了条件では範囲外とされた SPEC 確定事項。

## 根拠

- PR 2254 本文「SPEC確定候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2254 ）
