# 非 accepted ADR の現行根拠引用

## 観測
integrity-check により、accepted 以外のステータス（superseded/deprecated/proposed）の ADR が現行根拠として引用されている事例が4件検出された:

| 引用先ファイル | ADR | ステータス |
|--------------|-----|----------|
| `docs/requirements/REQ-0112.md` | ADR-0004 | superseded |
| `docs/requirements/REQ-0112.md` | ADR-0009 | deprecated |
| `docs/requirements/REQ-0112.md` | ADR-0014 | superseded |
| `docs/specs/patterns.md` | ADR-0001 | proposed |

## 今回扱わない理由
REQ-0108-125 は SHOULD レベル。修正には該当 ADR の現行受け継ぎ先（superseded-by 先等）の確認が必要。

## 影響
- 非 accepted ADR を根拠にすると、その ADR が将来削除・変更された際に参照整合性が崩れる
- REQ-0112 は3つの非 accepted ADR を同時に引用している

## レビューで決めること
- REQ-0112 で引用している ADR-0004/0009/0014 の現行受け継ぎ先を確認し、置換するか
- ADR-0001 (proposed) を patterns.md の参照先として受け入れるか、accepted に昇格するか

## 根拠
- integrity-check カテゴリ: ADR / accepted-adr-only-citation
- 分類: `canonical-conflict`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
