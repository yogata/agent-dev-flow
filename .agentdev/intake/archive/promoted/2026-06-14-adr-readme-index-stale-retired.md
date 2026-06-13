# ADR README インデックスが retired ADR-0001〜0023 を実体なしで列挙

## 観測

ADR README インデックスが ADR-0001〜ADR-0023（23 件）を列挙しているが、これらは `docs/adr/retired/` へ移動済みであり、`docs/adr/`（current）には対応ファイルが存在しない。インデックスが退役移行に追従していない。

### 対象箇所

- `docs/adr/README.md`（ADR-0001〜ADR-0023 のインデックスエントリ）
- 件数: NG 23（`adr-readme-index`）

## 影響

current ADR 一覧が実体と乖離し、読者が存在しない current ADR を探すことになる。

## 推奨対応

`docs/adr/README.md` の current インデックスから ADR-0001〜0023 を削除し、retired セクション（または `docs/adr/retired/README.md`）へ整理する。

## 分類

- finding category: broken-reference
- route: req-define
- 原因: 確認済（ADR 退役移行時にインデックス更新が漏れた）

## 根拠

- 検査: `adr-readme-index`（strict）
- 根拠: REQ-0112-050（current/retired 区別）
