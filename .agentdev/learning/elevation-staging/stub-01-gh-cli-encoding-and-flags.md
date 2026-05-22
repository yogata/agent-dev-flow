# gh-cli エンコーディング安全化とフラグ統一ルール

## 背景

Windows (PowerShell 7) 環境で gh CLI の UTF-8 出力を pwsh パイプライン・リダイレクト・Write tool 経由で処理すると日本語が文字化けする問題が3回発生（評価スコア 35/40）。また gh CLI のファイル入力フラグを推測で `--comment-file` と誤認し `--body-file` が正解だった問題も1回発生（評価スコア 24/40）。両クラスとも反映先が `agentdev-gh-cli` スキルであり、統合して反映する。

## 問題

1. **エンコーディング問題**: pwsh の `>` リダイレクト・パイプライン経由で gh CLI の JSON 出力を読み取ると日本語が文字化けする。Write tool で生成したファイルの BOM 付与も原因の一つ
2. **フラグ誤認**: gh CLI サブコマンド間で `--body-file` / `--body` フラグ体系が統一されていることを認識せず、存在しない `--comment-file` を推測で使用してエラー

## 望ましい変更

`agentdev-gh-cli` スキルの読み取り手順（Section 3-4）を全面改定し、以下を反映:
- pwsh パイプライン/リダイレクト経由の読み取りを禁止
- Python subprocess または Node.js execSync 経由の読み取りを標準化
- Write tool ではなく `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` でファイル書き出し
- gh CLI 全サブコマンドのファイル入力フラグ統一ルール（`--body-file` / `-F`）の明記

## 対象範囲

### 対象

- `.opencode/skills/agentdev-gh-cli/SKILL.md`

### 対象外

- 他のスキル・コマンド（本スタブの変更対象外）
- GitHub 上のデータ（文字化けは pwsh パイプラインのみの問題）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-gh-cli/SKILL.md` | Section 3-4 読み取り手順の全面改定、フラグ早見表の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/SKILL.md`
- **ギャップ分類**: guardrail insufficiency（エンコーディング 9/10 対応済、Python subprocess 推奨未明記）+ fix gap（--body-file 統一ルール未記載）
- **ギャップ詳細**: pwsh `>` リダイレクトの安全判定が実環境と乖離、`--body-file` 統一ルールの記載なし

## 制約

- 本変更は Windows 環境固有のワークアラウンドを含むが、非 Windows 環境でも Python subprocess 方式は動作するため互換性の問題はない
- 既存のコマンド（case-close, case-run 等）が gh-cli スキルを参照しているため、セクション番号の変更は追従が必要

## 受け入れ条件

- [ ] agentdev-gh-cli SKILL.md の Section 3 に pwsh `>` リダイレクト禁止と Python subprocess 推奨が明記されている
- [ ] agentdev-gh-cli SKILL.md の Section 4 に Write tool 禁止と `[System.IO.File]::WriteAllText` 推奨が明記されている
- [ ] gh CLI 全サブコマンドのファイル入力フラグが `--body-file` または `-F` に統一されていることが早見表で示されている
- [ ] 既存のセクション構造を壊さず、追加・修正の差分で対応している

## 元learning item / 根拠

- **要約**: Windows 環境での gh CLI 文字化け（3件）とフラグ誤認（1件）の統合対応
- **根拠**: pwsh stdout エンコーディング変換・BOM 付き UTF-8 出力・`>` リダイレクト encoding 処理に問題あり。フラグ体系は gh CLI 全サブコマンドで `--body-file` 統一
- **再発条件**: Windows 環境で gh CLI の JSON 出力・ファイル入出力を PowerShell 経由で扱う場合、およびフラグ名を推測で記述する場合
- **横展開可能性**: 高（gh CLI に限らず Windows 環境で CLI ツールの UTF-8 出力を扱う全般）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #274, PR #275, Issue #194, PR #282, Issue #283, PR #303
