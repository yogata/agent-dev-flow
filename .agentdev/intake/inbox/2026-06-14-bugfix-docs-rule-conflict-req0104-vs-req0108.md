# bugfix 時の docs 更新規則が REQ-0104 と REQ-0108 で競合

## 観測

`bugfix-docs-consistency` 検査が、REQ-0104（bugfix では docs 更新しない）と REQ-0108（docs 更新を要求）の間で bugfix 時 docs 更新規則が競合していることを検出した。

### 対象箇所

- `docs/requirements/REQ-0104.md` と `docs/requirements/REQ-0108.md`（bugfix docs 更新規則）
- 件数: Warning 1（`bugfix-docs-consistency`、REQ-0108-215）

## 影響

実行者が bugfix 時の docs 更新要否を REQ 間で矛盾した指示として受け取る。

## 推奨対応

REQ-0104 と REQ-0108 の bugfix docs 更新規則を整合させる（どちらかへ寄せる、または適用境界を明示化する）。

## 分類

- finding category: workflow-gap
- route: req-define
- 原因: 確認済

## 根拠

- 検査: `bugfix-docs-consistency`（heuristic、REQ-0108-215）
