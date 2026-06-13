# 全 REQ の frontmatter に `tags` フィールドが未設定

## 観測

`required-fields` 検査（`check_integrity.ts`）において、active REQ 全件および retired REQ-0111 の frontmatter に必須の `tags` フィールドが存在しないことを検出した。同一原因・同一是正方針のため一括整理。

### 対象箇所

- active REQ: `docs/requirements/REQ-0101.md`〜`REQ-0110.md`、`REQ-0112.md`〜`REQ-0122.md`（REQ-0111 は retired 扱い、計 21 件）
- retired REQ: `docs/requirements/retired/REQ-0111.md`（`retired-required-fields`）
- 件数: NG 22

## 影響

REQ frontmatter の正規形（REQ-0101 管理基準）に違反し、後続コマンド・検査が `tags` を前提とする場合に一貫性が崩れる。

## 推奨対応

全 REQ ファイルの frontmatter に `tags:` フィールドを一括付与する。各 REQ のドメイン分類に沿った tag 値を設定する。

## 分類

- finding category: canonical-conflict
- route: req-define
- 原因: 確認済（既存 REQ が `tags` 必須化より前の時点で作成され未追従）

## 根拠

- 検査: `required-fields`（strict）、`retired-required-fields`（strict）
- 根拠 REQ: REQ-0101（文書・REQ 管理基準）
