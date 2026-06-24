# SPEC 操作契約テーブルと contracts.md の同期漏れ

## 観測内容

`docs/specs/skills/agentdev-gh-cli.md` の操作契約テーブルは `references/contracts.md` の要約であるが、Issue close 操作の `close 理由` 列が SPEC のみ欠落していた（contracts.md 行74、標準版 SKILL.md 行42 には存在）。
PR #1123 で SPEC 側を補正したが、両者の同期を保つ機構が存在しない。

## 影響

- contracts.md 更新時に SPEC 操作契約テーブルの追従漏れが再発するリスクがある
- inspect-skills 検査が SPEC ↔ references 間のフィールド欠落を検出対象としていない（現在はファイル参照妥当性中心）

## 課題

SPEC 操作契約テーブルと contracts.md の同期を恒久的に担保する機構を設ける。

## 既存要件との関連

- Issue #1113、PR #1123（merged, squash）
- 対象: `docs/specs/skills/agentdev-gh-cli.md`（操作契約テーブル）、`references/contracts.md`

## 対応方針の方向性

- inspect-skills 検査対象へ「SPEC 操作契約テーブル ↔ contracts.md フィールド一致」を追加する
- contracts.md と SPEC テーブルの単一情報源化（一方を生成元にする等）を検討する
