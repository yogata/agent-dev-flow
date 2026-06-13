# REQ-0119 が superseded 済み ADR-0111 を根拠として引用している

## 観測

`docs/requirements/REQ-0119.md` が ADR-0111（status: superseded）を current の根拠として引用している。accepted 以外の ADR を現行根拠として引用すべきでない。

### 対象箇所

- `docs/requirements/REQ-0119.md`（ADR-0111 引用）
- 件数: Warning 1（`accepted-adr-only-citation`）

## 影響

superseded された ADR を権威ある現行根拠として示すことで、読者が古い決定を現行と誤認する。

## 推奨対応

ADR-0111 の後継（supersede 先）ADR へ引用を差し替える、または歴史参照である旨を明記する。

## 分類

- finding category: workflow-gap
- route: intake
- 原因: 確認済

## 根拠

- 検査: `accepted-adr-only-citation`（heuristic、REQ-0108-125 / REQ-0112-050）
