# project-docs-and-specs.md の REQ 範囲が REQ-0050 で古い

## 観測

`docs/guides/project-docs-and-specs.md` が REQ 範囲を `REQ-0001〜REQ-0050` と記述しているが、実際の最終 active REQ は REQ-0122（active 21 件）であり、範囲記述が旧い。

### 対象箇所

- `docs/guides/project-docs-and-specs.md`（`REQ-0001〜REQ-0050`）
- 件数: NG 1（`req-range-staleness`）

## 影響

読者が REQ 範囲を過小評価し、REQ-0051 以降の要件を見落とす可能性がある。

## 推奨対応

当該ガイドの REQ 範囲を `REQ-0101〜REQ-0122`（現行 active 範囲）へ更新する。

## 分類

- finding category: obsolete-structure
- route: intake
- 原因: 確認済

## 根拠

- 検査: `req-range-staleness`（strict）
