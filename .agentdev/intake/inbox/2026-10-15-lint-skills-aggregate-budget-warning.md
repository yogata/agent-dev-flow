# lint_skills aggregate description budget warning の運用の扱いを整理する

## 観測

#3719（Epic #3717 Wave-2）の説明文 600 字以内化修復後も、lint_skills で aggregate description budget warning 1 件が継続検出される: total 20362 chars across N=58 SKILL.md files（avg 351.1）> 350*58=20300（超過 62 文字）。AG-005 層1 正規定義（docs/designs/skills/agentdev-skill-authoring.md「skill 記述基準（層1〜3）」）では集約予算超過は正規に warn（傾向管理）であり厳格違反（検証不通過）ではないが、lint_skills は warning 存在でも exit 1 を返す（cli_utils.ts determineExitCode）。docs-check 全体判定では「NG 0（厳格違反なし）/ warning 1（傾向管理）」の区別の保持が必要となる。あわせて case-close 側の統合後 main 再計測で、git 管理外ローカルユーザースキル 4 スキル（explainer、explainer-book、first-reader、yomiyasu。.gitignore の .opencode/skills/* 除外対象）の USE FOR / DO NOT USE FOR トリガー欠落 warning 8 件（実装 warn レベル）が main root 実行時にのみ検出される環境差も観測（worktree 実行では不在のため非検出）。

## 今回扱わない理由

#3719 の対象外（未合意の文書品質改善・検査規則の一般的改定）として確定。集約予算の解消には 55 スキル description の合計 1000 文字超の削減が必要。本件の修復で総量は 20742 → 20362 へ 380 文字減少済み。

## 影響

lint_skills が常に exit 1 を返す状態が継続し、docs-check 全体の終了コード判定で「warning 由来 exit 1」と「strict failure 由来 exit 1」の出力区別の手間が毎回生じる。ローカルユーザースキル由来の warning 8 件は実行環境により検出数が変動する。

## レビューで決めること

- 集約予算の解消方針（description 削減のバッチ実施単位・優先スキルの選定）
- lint_skills 出力の summary への NG/warning 区別の明示（determineExitCode の warning 駆動と出力区別の整合）
- git 管理外ローカルユーザースキルの走査扱い（走査対象維持＋baseline 登録か、実行環境ラベルへの記録方針か）

## 根拠（任意）

- 観測元: Case #3719（PR #3721 本文 intake 1 件目 + case-close 統合後 main 再計測 2026-10-15）
- 証拠: lint_skills 統合後 main 実行（summary: ok 814 / ng 0 / warning 9 / info 5、.agentdev/tmp/cc-08-lintskills.json）
- AG-005 層1 定義: docs/designs/skills/agentdev-skill-authoring.md 119 行・142 行
- 関連: Epic #3717、PR #3721
