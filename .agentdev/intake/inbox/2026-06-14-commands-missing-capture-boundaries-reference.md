# case-run/case-close/req-save/case-open/case-auto が capture-boundaries 参照を欠落

## 観測

REQ-0105（capture boundary 責務）が要求する `capture-boundaries` への参照および責務キーワードが、主要コマンド定義に記載されていない。

### 対象箇所

- `docs/commands/agentdev/case-run.md`（`capture-boundaries` 参照なし）
- `docs/commands/agentdev/case-close.md`（参照なし + 責務キーワード「回収・保存」なし）
- `docs/commands/agentdev/req-save.md`（参照なし + 責務キーワード「原則非関与」なし）
- `docs/commands/agentdev/case-open.md`（`capture-boundaries` 参照なし）
- `docs/commands/agentdev/case-auto.md`（`capture-boundaries` 参照なし）
- 件数: NG 5（`command-capture-duty`）

## 影響

各コマンドの capture 責務が明示されず、intake/learning の回収境界が運用上あいまいになる（REQ-0105 違反）。

## 推奨対応

各コマンド定義へ `capture-boundaries` 参照と該当する責務キーワード（case-close: 回収・保存、req-save: 原則非関与、他: capture 責務記述）を追記する。

## 分類

- finding category: integrity-rule-gap
- route: req-define
- 原因: 確認済

## 根拠

- 検査: `command-capture-duty`（strict）
- 根拠: REQ-0105（capture boundary）
