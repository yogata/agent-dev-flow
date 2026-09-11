# case-run の品質ゲート表への full check_integrity 追加

## 観測内容

- 発生源: PR 2765（Issue 2758 / Epic 2755 W2）の Findings を回収
- capture 元: case-close 単一 Issue ルート（Issue 2758、PR 2765）
- captured_at: 2026-09-10

case-run の品質ゲート表に full `check_integrity` を追加すべき候補。Issue 2758 で検出された reference-path-existence 4件（perspective-registry.md:20-21 の diagnostic-categories.md 参照リンク切れ）は case-run のゲート表に含まれず、case-close の最終 gate で初めて検出され blocked 判定となった。full check_integrity を case-run gate 表へ追加すれば同種のブロックを前段で検出できる。

## 影響・課題

- 検出されなかった理由は2つある: ① case-run の gate 実施表に check_integrity フル実行が含まれていなかった、② フル suite は worktree で実行され `.opencode/skills/*` は gitignore のため junction が存在せず当該検査が発火しなかった（PR 2763 検証差分・blocker コメント 5614864691 由来）
- gate 表への追加に加え、worktree 環境で docs/designs 側リンク検査をどう前段で発火させるか（junction 未伝播制約の解消）が技術課題として残る

## 後続判断に残る選択肢

- case-run gate 表への full check_integrity 追加の実施方式
- worktree での junction 未伝播制約の解消方式（junction 作成の自動化、検査側の src/opencode 直参照への fallback 等）

## 既存要件・契約との関連

- REQ-031（case-run 実行契約）、REQ-007（完了報告と成果物品質ゲート）、REQ-018（worktree 構造的制約とテスト fallback）
