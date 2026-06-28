# japanese-tech-writing の source/projection 不整合と USE FOR 欠落

## 観察

`check_integrity.ts` の Inventory カテゴリ（`source-projection-sync`）が、`japanese-tech-writing` が projection（inventory）に存在するが source（`src/opencode/skills/`）に存在しない点を NG 検出した（route: req-define）。同 Skill カテゴリ（`skill-use-for-boundary`）が USE FOR セクション不存在を WARNING 検出した（route: intake）。

`japanese-tech-writing` は `.opencode/skills/` 配下に実ディレクトリとして存在するが、`src/opencode/skills/`（配布物 source）に対応する实体がない。また junction ではなく実ディレクトリのため、他の `agentdev-*` スキルと異なる配置形態をとる。

## 課題

- `japanese-tech-writing` を配布対象（`src/opencode/skills/` 配下）へ昇格するか、projection（inventory）から除外するか（原因分類: 不明 — 配布方針の判断を要する）
- SKILL.md へ USE FOR / DO NOT USE FOR セクションを追加する（原因分類: 確認済 — 既存 SKILL.md に当該セクションなし）
- `agentdev-*` prefix に従わない点（INFO で既出）の扱い（原因分類: 仮説 — 意図的な例外か確認が必要）

## 根拠

実体確認結果:

- `src/opencode/skills/japanese-tech-writing`: 存在しない（`Test-Path` = False）
- `.opencode/skills/japanese-tech-writing`: 存在する。`Get-Item -Force` で LinkType が空（junction ではなく実ディレクトリ）

## 観測元

- `/repo/docs-check` 実行（2026-06-28）
- 検出カテゴリ: Inventory（`source-projection-sync` NG 1件）、Skill（`skill-use-for-boundary` WARNING 1件）
