# yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合

## 背景

yomiyasu 推敲工程（REQ-098）で lint 実行用の検査専用本文ファイルを、agentdev-workflow-lifecycle SKILL.md「文章品質・書込み規約」節の指示（リポジトリ外の一時ディレクトリ等）に従って OS TEMP 等へ配置すると、textlint 書込み guard の project root 外書込み fail-closed 拒否に毎回衝突する事象が 2 工程（Case #4054・#4069）で観測された。guard の拒否は正しい動作であり、配置手順側が workspace 外へ出ない標準手段へ整合すべき

## 問題

lifecycle SKILL.md L158（yomiyasu lint の実行経路: 「検査専用本文ファイルを非永続領域（リポジトリ外の一時ディレクトリ等）に新規作成」）と同文書内の L172-183（書込み guard の拒否対象: 「プロジェクトルート外パスへの書込み（いずれも fail-closed）」・回復: 「作成先をプロジェクトルート内の実行時作業領域へ変更」）が矛盾しており、指示に従う工程で guard 拒否が恒常的に発生する

## 望ましい変更

lifecycle SKILL.md L158 の配置指示を「project root 内の gitignore 対象領域（.agentdev/tmp/ 等・検査後削除）へ新規作成」へ統一する（同文書の guard 実効範囲と scripts/README.md の配置指針〔workspace 外 temp 禁止・project root 内限定・commit 対象外・検査後削除〕の 4 方針に整合）

## 対象範囲

### 対象

- agentdev-workflow-lifecycle SKILL.md「文章品質・書込み規約」節の yomiyasu lint 配置指示文言（L158）

### 対象外

- textlint 書込み guard の実装・実効範囲の変更（fail-closed は維持）
- yomiyasu lint スクリプト自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill SKILL | src/common/skills/agentdev-workflow-lifecycle/SKILL.md「文章品質・書込み規約」節（yomiyasu 推敲の適用規律・L158） | 検査専用本文ファイルの配置指示を project root 内 gitignore 対象領域へ統一 |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: src/common/skills/agentdev-workflow-lifecycle/SKILL.md（L158 配置指示・L172-183 guard 実効範囲と回復規定）・src/common/plugins/agentdev-textlint-guard scripts README（配置指針 4 方針）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 同一文書内で L158 の配置指示と L178/L183 の guard 境界が矛盾（指示文言の統一欠落）。2 工程で同一の guard 拒否を観測

## 制約

- 書込み guard の fail-closed は維持する（guard の解除・迂回は行わない）
- .agentdev/tmp/ は gitignore 対象（.gitignore 18 行）であり検査後削除を手順に含める

## 受け入れ条件

- [ ] lifecycle「文章品質・書込み規約」節の lint 一時ファイル配置指示が project root 内 gitignore 対象領域へ統一されていること
- [ ] 後続の yomiyasu lint 工程で guard 拒否が構造的に発生しないこと（1 工程以上での確認）

## 元learning item / 根拠

- **要約**: yomiyasu lint 一時ファイルの配置指示（リポジトリ外）が textlint 書込み guard の project root 外拒否と衝突する（2 工程観測）
- **根拠**: lifecycle SKILL.md L158 と L172-183 のファイル読取実測で同一文書内の指示矛盾を確認（2026-11-15）・Case #4054・#4069 の guard 拒否観測
- **再発条件**: lifecycle lint 手順の指示どおりリポジトリ外へ一時ファイルを作成しようとする工程
- **横展開可能性**: yomiyasu lint を実行する全工程（docs 推敲・GitHub 文章推敲）で同型の拒否が発生し得る。書込み guard 境界と配置手順の整合知識として横展開可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
