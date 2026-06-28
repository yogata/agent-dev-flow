## 観測内容
2026-06-28 の `/repo/docs-check` 実行で、`check_integrity.ts` の Inventory カテゴリ（`source-projection-sync`）が NG 1件を検出した。`japanese-tech-writing` が projection（inventory）に存在するが source（`src/opencode/skills/`）に存在しない（route: req-define）。同 Skill カテゴリ（`skill-use-for-boundary`）が WARNING 1件を検出した。SKILL.md に USE FOR セクションが存在しない（route: intake）。

実体確認結果:
- `src/opencode/skills/japanese-tech-writing`: 存在しない（`Test-Path` = False）
- `.opencode/skills/japanese-tech-writing`: 存在する。`Get-Item -Force` で LinkType が空（junction ではなく実ディレクトリ）

## 影響
スキル配布基準とドキュメント標準の不一致。`japanese-tech-writing` が他の `agentdev-*` スキルと異なる配置形態（実ディレクトリ）をとり、SKILL.md に必須の USE FOR セクションが欠落。

## 課題
- `japanese-tech-writing` を配布対象（`src/opencode/skills/` 配下）へ昇格するか、projection（inventory）から除外するか判断する
- SKILL.md へ USE FOR / DO NOT USE FOR セクションを追加する
- `agentdev-*` prefix に従わない点の扱いを決定する（意図的な例外か確認）

## 既存要件との関連
なし
