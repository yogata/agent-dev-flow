# req-define.md に旧 namespace の bare-slash `/case-open` が残存

## 観測

`docs/commands/agentdev/req-define.md`（投射先 `.opencode/commands/agentdev/req-define.md`）内に、旧 namespace の bare-slash 形式 `/case-open` が記述されている。旧 namespace 検査と拡張旧 namespace 検査が同一行を重複検出。

### 対象箇所

- `.opencode/commands/agentdev/req-define.md`（`/case-open` bare slash form）
- 件数: NG 2（`legacy-namespace`、`expanded-legacy-namespace`）

## 影響

AGENTS.md の公開コマンドは `/agentdev/*` 名前空間を使用する方針に違反し、bare-slash 表記は consumer 側で誤ったコマンド解釈を誘発しうる。

## 推奨対応

`/case-open` を正規の `/agentdev/case-open` 形式に置換する。

## 分類

- finding category: obsolete-structure
- route: intake
- 原因: 確認済

## 根拠

- 検査: `legacy-namespace`（strict）、`expanded-legacy-namespace`（heuristic）
