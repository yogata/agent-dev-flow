# gh-cli skill の load_skills 欠落によるエンコーディング破損再発

## 背景

Windows 環境で case-open/case-run/case-close/case-update のサブエージェントが gh CLI を使用して Issue/PR を作成・更新する際、`agentdev-gh-cli` スキルの安全な書き込み手順（`--body-file` 必須、`[System.IO.File]::WriteAllText` + UTF8Encoding($false)）が遵守されず、日本語本文のエンコーディング破損が繰り返し発生している。

`agentdev-gh-cli` スキル自体には `--body` 直接指定の禁止と `--body-file` 必須のガイドラインが存在するが、各 case 系コマンドの frontmatter `load_skills` に `agentdev-gh-cli` が含まれていないため、サブエージェントが当該スキルをロードせずに gh CLI を使用するケースがある。

## 問題

case-open.md, case-run.md, case-update.md, case-close.md の全4ファイルの frontmatter に `load_skills` フィールドが存在せず、`agentdev-gh-cli` スキルがサブエージェントに確実にロードされない。結果として:
- `--body` 直接使用による PowerShell エンコーディング変換の介入
- バッククォート `` `a `` が BEL 文字 (0x07) に展開される文字化け
- Issue/PR 本文の読取不能化と後続フェーズへの波及

## 望ましい変更

case-open.md, case-run.md, case-update.md, case-close.md の frontmatter に `load_skills: [agentdev-gh-cli]` を追加し、サブエージェントが必ず `agentdev-gh-cli` スキルをロードするようにする。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-open.md` — frontmatter のみ
- `src/opencode/commands/agentdev/case-run.md` — frontmatter のみ
- `src/opencode/commands/agentdev/case-update.md` — frontmatter のみ
- `src/opencode/commands/agentdev/case-close.md` — frontmatter のみ

### 対象外

- `agentdev-gh-cli` スキル本体の変更（既に十分な対策あり）
- ステップ本文の変更（既に `agentdev-gh-cli` 参照あり）
- 他のコマンドファイル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-open.md` | frontmatter に `load_skills: [agentdev-gh-cli]` 追加 |
| command | `src/opencode/commands/agentdev/case-run.md` | frontmatter に `load_skills: [agentdev-gh-cli]` 追加 |
| command | `src/opencode/commands/agentdev/case-update.md` | frontmatter に `load_skills: [agentdev-gh-cli]` 追加 |
| command | `src/opencode/commands/agentdev/case-close.md` | frontmatter に `load_skills: [agentdev-gh-cli]` 追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/SKILL.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: agentdev-gh-cli スキルに `--body` 禁止・`--body-file` 必須・VERIFY 手順が定義されているが、各コマンドの frontmatter `load_skills` に当該スキルが含まれていないため、サブエージェントがスキルをロードせずにガイドラインを逸脱するケースが発生する

## 制約

- frontmatter の変更のみ。ステップ本文・ガードレールの変更は最小限
- 既存の `description` および `agent` フィールドは変更しない
- スキル名は `agentdev-gh-cli`（ハイフン区切り）で統一
- junction/symlink の再同期が必要（src → .opencode 反映）

## 受け入れ条件

- [ ] 4コマンドファイルの frontmatter に `load_skills: [agentdev-gh-cli]` が追加されている
- [ ] `.opencode/commands/agentdev/` 配下の junction 経由で反映されている
- [ ] case-open で Issue 作成時に agentdev-gh-cli スキルがロードされる
- [ ] 既存のテスト・スクリプトに影響がない

## 元learning item / 根拠

- **要約**: Windows 環境で gh CLI の `--body` 直接使用によるエンコーディング破損が複数回発生。agentdev-gh-cli スキルに対策は存在するが、コマンド側でスキルをロードしていないため適用されていない
- **根拠**: Issue #576 で case-open 作成の本文が全て文字化け。PR #609 でバッククォート展開による BEL 文字混入。いずれも `--body` 直接使用が原因
- **再発条件**: Windows 環境でサブエージェントが agentdev-gh-cli をロードせずに gh CLI を使用する場合
- **横展開可能性**: Windows 環境で gh CLI を使用する全コンテキストで発生可能。PowerShell のバッククォート展開は環境固有だが、エンコーディング変換の問題はより汎用的

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #576, PR #609
