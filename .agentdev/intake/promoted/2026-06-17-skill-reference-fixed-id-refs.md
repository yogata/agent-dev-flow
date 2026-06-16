# 配布対象 skill reference の固定 REQ/ADR 参照残存（REQ-0103-079 違反）

## 観測

Issue #801 で SKILL.md から宣言されている reference 13件の固定 REQ/ADR 参照を是正したが、対象外だった reference 2件に同種違反が残存している。

### 対象ファイル

| ファイル | 残存参照 | 状態 |
|---|---|---|
| `src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` | REQ-0119-005, REQ-0119-006, REQ-0111-004, ADR-0112 §4, §5, §6 | **REQ-0111 は retired 確定。存在しない参照先。** REQ-0119 は Epic #828 OU-04 で行追加あり、番号ずれの可能性 |
| `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md` | REQ-0104-021 | REQ-0104 は OU-02 で行追加あり（048-052）。021 は存続するが文脈変化 |

## 影響

- consumer project 配布時、存在しない/変更される可能性のある REQ/ADR への解決不能参照が残る
- REQ-0111-004 は退役REQへの参照であり、配布先で実体が不存在
- Issue #801 で是正した13件と同種の違反パターン（REQ-0103-079 違反）

## 課題

- 固定 REQ-NNNN / ADR-NNNN 参照を `{REQ-ID}` / `{ADR-ID}` プレースホルダーまたは自然文に置換する
- REQ-0111-004 参照は退役REQへの言及のため、自然文での説明に置換する必要がある
- 是正観点は Issue #801（PR #802）と同一パターン

## 既存要件との関連

- REQ-0103-079: 配布対象 skill reference の固定 REQ/ADR 参照禁止
- Issue #801 / PR #802: 同種違反の是正済み（SKILL.md 13件）
- 今回は reference ファイル2件の取り残し

## 根拠

- 発見元: Issue #801 の Step 8 grep検証（PR #802 の Findings / Capture候補）
- 関連: PR #802, Issue #801, Epic #828（REQ-0111退役確認、REQ-0104/0119更新）
