# subagent edit操作の安全手順・大規模ファイル分割委譲ガイダンス追加

## 背景

Wave 3のサブエージェントがcheck_integrity.tsの関数に対し連続editを実行した際、内側関数定義をoldStringに含めてしまい関数ボディ全体を削除する破損が発生。また2771行のテストファイル修正を単一タスクに委譲し30分タイムアウトで失敗した。いずれもsubagentへの委譲時のedit安全性が担保されていないことが根本原因。

## 問題

subagentへの委譲時に、(1) oldString範囲の適切さの検証、(2) 連続edit時の関数破損リスクの回避、(3) 大規模ファイルのタイムアウトリスクの回避、が担保されていない。

## 望ましい変更

workflow-orchestration skillのサブエージェントprotocolに、edit安全手順（oldString最小化・edit後Read検証）と大規模ファイル分割委譲ガイダンス（1000行超は分割して並列委譲、機械的置換はAST-grep推奨）を追加する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` — サブエージェントprotocol
- `.opencode/skills/agentdev-workflow-orchestration/references/` — 詳細手順（必要に応じて新規ファイル）

### 対象外

- edit tool自体の変更
- Sisyphusの委譲ロジック変更
- check_integrity.ts や check_integrity.test.ts の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | サブエージェントprotocolにedit安全手順を追加 |
| skill | `.opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md`（新規または既存） | edit安全手順・大規模ファイル分割委譲の詳細ガイダンス |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: workflow-orchestrationに「サブエージェント protocol」の記載は存在するが、edit操作の安全性に関する具体的な手順（oldString最小化、edit後Read検証、大規模ファイルの分割委譲）が不在

## 制約

- subagentの挙動自体は制御できないため、プロンプト/指示レベルでの予防に留める
- 「edit後にReadで確認」はオーバーヘッドが増えるが、破損リスクとのトレードオフ
- AST-grep推奨は強制ではなくベストプラクティスとして扱う

## 受け入れ条件

- [ ] workflow-orchestrationのサブエージェントprotocolにedit安全手順が追加されている
- [ ] 大規模ファイル（1000行超）の分割委譲ガイダンスが追加されている
- [ ] 機械的置換のAST-grep推奨が記載されている

## 元learning item / 根拠

- **要約**: subagent委譲時のedit操作で関数定義破損とタイムアウトが発生
- **根拠**: (1) check_integrity.tsのscanDir関数を含むoldStringで2回連続edit → checkPatternResidualとcheckReqBacklogResidualが融合する破壊的状態。(2) 2771行のテストファイル修正を単一タスクに委譲 → 30分タイムアウト
- **再発条件**: (1) 入れ子関数を持つファイルの連続edit、(2) 1000行超のファイルを単一タスクに委譲、(3) subagentがコンテキスト理解に時間を要する
- **横展開可能性**: subagent利用全般に適用される。大規模ファイル操作で継続的に再発リスクあり

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: PR #592, Issue #586, Issue #572, PR #573
