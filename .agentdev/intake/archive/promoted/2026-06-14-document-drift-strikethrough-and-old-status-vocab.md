# 文書内の打消し線と旧 status 語彙の残存（document-drift）

## 観測

廃止内容の表現として打消し線（`~~...~~`）が使われている箇所と、正規化済みの status 語彙（`migrated` / `retired-no-successor` / `historical-only`）へ未移行の `superseded` 系記述が残存している。

### 対象箇所

- 打消し線（REQ-0108-204）:
  - `docs/specs/integrity-contracts.md:85`
  - `docs/specs/system.md:41`
- 旧 status 語彙（REQ-0108-207）:
  - `docs/requirements/REQ-0101.md:42`
  - `docs/requirements/REQ-0112.md:16`
- 件数: Warning 4（`strikethrough-in-docs`、`old-status-vocabulary`）

## 影響

打消し線は obsolete 内容の可読性を損ね、旧 status 語彙は REQ-0108-207 の正規化方針と矛盾する。

## 推奨対応

打消し線は該当内容を削除または別セクションへ再構成する。status 語彙は `superseded` 系から `migrated` / `retired-no-successor` / `historical-only` の正規形へ更新する。

## 分類

- finding category: document-drift
- route: intake
- 原因: 確認済

## 根拠

- 検査: `strikethrough-in-docs`（heuristic、REQ-0108-204）、`old-status-vocabulary`（heuristic、REQ-0108-207）
