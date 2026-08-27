# agentdev-model-escalation（Plugin / Hook）

<!-- ADF-COVERS(implementation): REQ-053-001, REQ-053-014, REQ-053-015 -->

OpenCode セッションの同一性（sessionID・会話履歴）を保持したまま、ターン境界でモデルを昇格・復帰する ADF 汎用 Plugin（REQ-053、DEC-023）。実装詳細は Design `docs/designs/foundations/model-escalation-runtime.md` が所有する。

## 仕組み

- 設定: `.agentdev/agentdev.jsonc` の `modelEscalation` キー（provider/model 形式と variant）。Plugin 初期化時に読み込み、不在・解釈失敗時は機能を発動しない（要求 tool を提供せず、切替を行わない）。
- 要求受付: `escalate_model` / `revert_model` の 2 つの要求 tool を提供する。モデルは意味的判断（解決困難か、解決したか）のみを担い、tool の呼出のみを行う。
- 切替: `chat.message` フックで `output.message.model`（providerID / modelID / variant）を書換し、要求受理後の次ターン境界から昇格先モデル・variant で開始する。進行中の推論は切替えない。sessionID は不変。昇格状態の間は毎ターン再適用する。
- 状態保持: 昇格状態は sessionID 単位で Plugin 実行プロセス内に保持する。昇格直前に実際に使用していたモデル・variant を復帰先として記録する。OpenCode 再起動・セッション resume 時には normal へ戻る（安全側。再昇格要求で再開する）。
- 通知: 昇格時・復帰時に切替種別と切替前後のモデル・variant を含む一行を要求 tool の result として返す（一次手段）。切替確定ターンの system コンテキストへ切替事実の一行を注入する（補助）。
- 失敗報告: 切替前に昇格先 provider と model の解決を確認し、解決不能な場合は失敗を報告して状態を変更しない。成功として表示・記録しない。
- 無限反復防止: 状態機械（normal / escalated）が重複要求を拒否する。機構が自律的に切替を反復することはない。

## 導入（手動コピー）

導入スクリプトは提供しない（DEC-016 副作用ゼロ原則）。導入先リポジトリでの手順。

1. `plugin.ts`（と必要なら `agentdev.jsonc` テンプレート）を本ディレクトリから取得する
2. `plugin.ts` を導入先リポジトリの `.opencode/plugin/` へコピーする（単体ファイルで動作する。`agentdev-model-escalation/` ディレクトリごとのコピーでも可）
3. `agentdev.jsonc` テンプレートを導入先リポジトリの `.agentdev/agentdev.jsonc` へコピーし、`modelEscalation` の記述例をコメント解除して有効化する
4. 導入先リポジトリの `.gitignore` へ Plugin ファイルの除外を追加する（`.agentdev/agentdev.jsonc` は Git 管理対象のため除外しない）

`tests/`、`package.json`、`tsconfig.json` は開発用であり、導入先へのコピー対象外である。

## 外部依存

なし（omo 等の特定ハーネス拡張に依存しない）。JSONC は Plugin が自前で解釈する。

## テスト実行

```bash
bun install && bun test   # cwd: src/opencode/plugins/agentdev-model-escalation
```
