---
name: agentdev-workflow-orchestration
description: case-run の状態機械、サブエージェント protocol、self-healing loop、CI 対応 loop、1 Issue オーケストレーションの知識ベース。USE FOR: case-run の再開ポイント判定、自律修正ループ判定、CI 対応、subagent起動、障害伝播。DO NOT USE FOR: 単一Issue の基本的な Step 実行手順（case-run コマンド定義を参照）、work_type 判定（agentdev-workflow-lifecycle を参照）、乖離検出（agentdev-spec-compliance を参照）、子Issue 選択、Wave 構成生成（case-open/ case-auto を参照）
---

# case-run オーケストレーションナレッジベース

case-run コマンドのオーケストレーション知識ベース。状態機械、サブエージェントプロトコル、自律修正ループ、CI 対応ループ、エラー回復の判定基準と詳細構造を提供する。case-run は単一 Issue または単一 Wave（`#epic` 指定時: 現在 ready な Wave の子Issue を Sisyphus-Junior、ulw-loop（adapter skill + 委譲 prompt 内 `/ulw-loop` command）に並列委譲、最大5件）を処理し、Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない（Wave 構成生成は case-open、Wave 境界クローズは case-close の責務）。

## 状態機械

case-run は単一 Issue または単一 Wave（`#epic` 指定時）を処理する。Epic 全体（複数 Wave）の一括実行、Wave スケジューリング（次 Wave 判定）は提供しない。Epic 全体の進行は case-auto が case-run(#epic) → case-close(#epic) の反復制御を担い、Wave 内の子Issue 選択、並列委譲は case-run(#epic) が、Wave 境界クローズ、Epic Issue 本文ステータス追跡テーブル更新は case-close(#epic) が担う（単一書き手: ADR-0125、`docs/specs/workflows/epic-wave-model.md`、ADR-0128）。

### フェーズ構成

| フェーズ | Steps | 再開条件 |
|----------|-------|----------|
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| 実装フェーズ | 5-6 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 7-11 | PRが未作成 |

### 準備フェーズの既知の制約（Windows + ジャンクション環境）

- メインリポジトリで `sync-self-opencode.ps1`/ `install-consumer-opencode.ps1` が作成する `.opencode/` 配下のジャンクションリンクは、git worktree（`.worktrees/{N}`）へ伝播しない。worktree 作成後に個別に再作成が必要になる場合がある。
- worktree 内でジャンクション依存の整合性検査（`source-projection-sync` 等）を実行すると、projection 側が存在せず失敗することがある。提出フェーズのローカル検証で整合性検査を含む場合は注意。
- ジャンクション再作成は既存手順に準拠し、本スキルで新規手順は定義しない。詳細、復旧手順は `references/self-healing-and-errors.md` の該当セクションを参照。
- この制約は Windows + ジャンクション環境固有。`resolvePathWithFallback`によるランタイムパス→ソースパスの部分フォールバックはあるが、source/projection 双方向比較を要する検査までは補完しない。

### driver サブエージェント引き継ぎプロンプト制約

Windows + ジャンクション環境の worktree では `.opencode/skills/agentdev-*`、`.opencode/commands/agentdev/` が空になる（ジャンクション未伝播）。case-run Step 6 で実行担当サブエージェントへ引き継ぐプロンプトには、以下を**必須項目**として明記する。

- worktree 内 `.opencode/` は空（ジャンクション未伝播）であること
- source（`src/opencode/`）と projection（`.opencode/`）の編集は手動両辺編集を行うこと
- 同期スクリプト（`sync-self-opencode.ps1` 等）には依存しないこと
- 起動プロンプトテンプレートは `references/subagent-protocol.md` の「driver 起動プロンプトテンプレート（Windows + ジャンクション環境）」を参照

## 参照先

詳細は以下の reference files を参照:

| トピック | 参照先 |
|----------|--------|
| キャプチャ境界定義 | `references/capture-boundaries.md` — Intake/Learning 境界、分割ルール、コマンド責務境界 |
| 自律修正ループ、CI 対応ループ、エラー | `references/self-healing-and-errors.md` — 自律修正ループ、CI対応、エラー回復マップ |
| サブエージェント編集安全手順 | `references/subagent-protocol.md` — oldString最小化、Read検証、大規模ファイル分割、AST-grep推奨、driver 起動プロンプトテンプレート（Windows + ジャンクション環境） |

case-run コマンドのランタイムパス（projection 先）は `commands/agentdev/case-run.md`。command 本文内で case-run を参照する場合はこちらを使用。

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定基準、フェーズ定義
- **agentdev-epic-tracker**: Epic ステータス追跡プロトコル



