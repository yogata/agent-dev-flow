# REQ/SPEC 内の workflow status / 6 マイクロフェーズ記述の検出

## 観測
integrity-check により、REQ/SPEC 内に workflow status や 6 マイクロフェーズ（requirement/analyzed/created/in_progress/review/done）の状態管理モデル記述が8件検出された:

**NG 8件:**

| ファイル | 行 | 検出内容 |
|----------|-----|---------|
| `docs/requirements/REQ-0105.md` | 6 | tags に `intake, learning, backlog-review, backlog-save, requirement-unit, domain-state` |
| `docs/requirements/REQ-0105.md` | 57 | `backlog-review` 生成 draft に `status: reviewed` を持つ要件 |
| `docs/requirements/REQ-0105.md` | 58 | `backlog-save` が `status: reviewed` のみ処理 |
| `docs/requirements/REQ-0105.md` | 59 | `status` を `saved` に更新する要件 |
| `docs/requirements/REQ-0105.md` | 60 | `status: saved` の再処理禁止 |
| `docs/requirements/REQ-0105.md` | 65 | 対象セクションに intake/review の後続ルート記述 |
| `docs/requirements/REQ-0108.md` | 139 | REQ-0108-123 自体（禁止ルールの記述がパターンにマッチ） |
| `docs/specs/patterns.md` | 53 | `status` フィールドを持たない旨の記述 |

## 今回扱わない理由
REQ-0108-123 の禁止ルールに照らし、false positive（禁止ルール自体の記述や否定形の言及）が含まれる可能性があるため、確認が必要。

## 影響
- REQ-0105 は backlog-review/save 間のステータス連携を要件として定義している
- REQ-0108-123 のパターンマッチが否定形（「status フィールドは持たない」）にも反応している可能性

## レビューで決めること
- REQ-0105 の `status: reviewed/saved` は backlog-review/save 間の連携用一時ステートであり、workflow status 禁止の対象外か
- REQ-0108-123 のルール自体の記述は false positive として扱うか
- patterns.md の否定形記述（「status フィールドは持たない」）を除外ルールに追加するか

## 根拠
- integrity-check カテゴリ: LifecycleBoundary / workflow-status-prohibition
- 分類: `canonical-conflict`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
