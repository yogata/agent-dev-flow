# AGENTS.md

AgentDevFlow を編集するエージェント向けのリポジトリガードレール。このファイルは簡潔に保つこと。ほぼすべての変更で有用なルールのみを記載する。詳細なワークフローは現行 REQ、ADR、SPEC、ガイド、スキル、テンプレート、またはスクリプトに置くこと。

## プロジェクト識別

- 本リポジトリは AgentDevFlow プラグインを管理する。
- 公開コマンドは `/agentdev/*` 名前空間を使用する。原本は `src/opencode/commands/agentdev/`、実行時の配置先は `.opencode/commands/agentdev/`。
- AgentDevFlow スキルは `agentdev-*` プレフィックスを使用する。原本は `src/opencode/skills/`、実行時の配置先は `.opencode/skills/`。
- AgentDevFlow が永続的に保持するドメイン状態は `.agentdev/` に格納する。
- 現行 REQ または ADR が互換性ノートを明示的に要求する場合を除き、旧式の `/issue/*`、`/tips/*`、`issue-*`、`tips-*` という名前を再導入しないこと。

## 信頼できる情報源の優先順位

文書間で矛盾がある場合、以下の順序で優先する:

1. 現行 REQ: `docs/requirements/REQ-0101.md` ～ `docs/requirements/REQ-0141.md`（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）。
2. ADR: 承認済みのアーキテクチャ決定については `docs/adr/ADR-*.md`。
3. SPEC: 現在のシステム動作と書式ルールについては `docs/specs/*.md`。
4. ガイドとインデックス: ナビゲーションと運用者向け説明については `docs/guides/*.md`、`docs/DOC-MAP.md`、および README ファイル。
5. 廃止済み REQ: 履歴目的のみで `docs/requirements/retired/REQ-*.md` および `docs/requirements/mapping-table.md`。

廃止済み REQ を現在の権威として引用しないこと。廃止済み REQ が非廃止資料で言及されている場合、履歴であることを明記するか、現行の後継者を指すこと。

## アーティファクトの境界

- `.agentdev/` は Intake、Learning、Backlog の RU、整合性アーティファクト、およびコマンド間で受け渡す管理ドラフトの正となる、永続的に保持するドメイン状態である。
- `.sisyphus/` は実行時作業領域である。現在の AgentDevFlow ドメイン状態や現在の REQ の信頼できる情報源として扱わないこと。
- agent-dev-flow が管理するドラフト（要件ドラフト、是正検討ドラフト、コマンド間の中間ドラフト）は `.agentdev/drafts/` に配置する。`.sisyphus/` はドラフトの生成先・保存先・入力元・受け渡し先として扱わない。
- スキルのサポート資料は `references/` を正となるディレクトリとする。`reference/` は移行履歴の文書化を除き、廃止扱いとする。
- 関連する現行 REQ、ADR、またはコマンドワークフローが要求する場合を除き、`.agentdev/`、`.sisyphus/`、`docs/`、コマンド、スキル間でアーティファクトを移動させないこと。

## 編集ガードレール

- コマンドは薄く保つこと: 公開 API、入力、出力、ガードレール、高レベルのステップのみ。
- 再利用可能な判断はスキルに、長い詳細はスキルの `references/` に、固定文言はテンプレートに、決定的なチェックはスクリプトに置くこと。
- コマンドを編集する際、`agent` などのフロントマターをコマンドの責務に合わせて維持すること。
- 正となる文書を追加または移動する際、同じ変更で関連するインデックス、DOC-MAP、リンク、相互参照を更新すること。
- ドキュメント編集後、壊れた相対リンク、古い REQ 範囲、旧式のコマンド名、`reference/` と `references/` の乖離を確認すること。
- 既存のライフサイクル状態、ディレクトリ名、用語を優先すること。新しい要件または更新された要件に裏付けられた場合を除き、新しいワークフロー状態を発明しないこと。
- REQ 要件行には振る舞い・制約・状態のみを書くこと。実装指示・Step 番号参照・ファイル編集詳細は REQ に混入させず、該当する command reference・skill・SPEC に配置すること（REQ-0102-006/007/023）。

## ワーキングスタイル

- 基本言語を日本語とすること。
- 要求されたタスクに直接対応する、影響範囲を絞った変更を行うこと。
- 新しい構造を導入する前に既存のスタイルに合わせること。
- 隣接するリファクタリングや推測によるクリーンアップを避けること。
- タスクが曖昧な場合、重要な仮定を明記すること。
- 複数ステップにわたる変更では、簡潔な計画を立て、最も狭い有用なチェックで結果を検証すること。
- req-define に構造化された要件が渡された場合は別のエージェントでの使用を想定して、AskUserQuestionを使用せずに質問すること。

## ハーネス選定

本プロジェクトは case-run コマンドの実行ハーネスとして [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) を選定し、導入済み。

- 起動方法の詳細は `.opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md` 参照
- AgentDevFlow を利用する各プロジェクトは、自分の AGENTS.md でハーネスを選定する
