# docs-and-design-promotion.md への bun test 3 cwd 分割正規形への明示参照追加

## 観測内容

case-close STEP-3 reference（src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md L80-87）の bun test 実行コマンド欄は分割①のみを記述し、3 cwd 分割正規形の②③・依存パッケージ前置・環境ラベル 3 要素を明示していない。「bun test 実行形態契約に従う」従属宣言はあるが、契約の所在（agentdev-quality-gates skill references/qg-4-final-acceptance.md）への明示参照がない。読者が分割①のみを full suite と誤解する余地がある。

Skill 側修正は Issue #2507（document のみ対象）の範囲外だった。

## 影響

case-close 実行者が integrity suite 検証を分割①のみで完了と誤解するリスク。

## 課題（レビューで決めること）

- docs-and-design-promotion.md への qg-4-final-acceptance.md への明示参照追加の実施
- 環境ラベル・依存パッケージ前置の記載粒度

## 既存要件・契約との関連

- bun test 実行形態契約（agentdev-quality-gates skill references/qg-4-final-acceptance.md、3 cwd 分割正規形）、case-close STEP-3 reference の参照構造。

## 根拠

- PR #2523 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2523 ）
