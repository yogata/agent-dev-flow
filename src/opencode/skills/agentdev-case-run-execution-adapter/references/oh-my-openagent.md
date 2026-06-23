# oh-my-openagent task()/ulw-loop 委譲実装ノート

AgentDevFlow 側（case-run）から oh-my-openagent のエージェント型（Sisyphus-Junior）を `task()` 経由で呼び出すための実装ノート。読者は AgentDevFlow の case-run 実装者。抽象IF（ハーネス非依存）は親の `SKILL.md` 参照。本ファイルは oh-my-openagent 固有の具象実装を扱う。

case-run は に基づき oh-my-openagent CLI の subprocess 起動を廃止し、`task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])` 委譲（委譲 prompt 内で `/ulw-loop` command を指定）に全面移行した。oh-my-openagent は CLI ツールとしてだけでなく OpenCode プラグインとしてエージェント型（Sisyphus-Junior 等）を提供しており、task() 経由で起動すると oh-my-openagent の実行エンジンをネイティブに利用できる。CLI subprocess で問題となっていた bash ハングアップ（case-run #971 事例）は、各ツール呼び出しごとの120秒 timeout で構造的に検知されるようになる。

## 起動方式（task() 委譲）

case-run は Sisyphus-Junior を task() 経由で起動する。CLI subprocess は使用しない。

```
task(
  subagent_type="Sisyphus-Junior",
  load_skills=["agentdev-case-run-execution-adapter"],
  prompt="/ulw-loop Implement Issue #N: <Issue本文>"
)
```

- `subagent_type="Sisyphus-Junior"`: oh-my-openagent が OpenCode プラグインとして提供するエージェント型。CLI subprocess を介さず oh-my-openagent の実行エンジンを直接利用する
- `load_skills=["agentdev-case-run-execution-adapter"]`: AgentDevFlow 側の adapter skill を読み込む。委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する
- 委譲プロンプト: `/ulw-loop Implement Issue #N: <Issue本文>`。委譲 prompt 内で `/ulw-loop` command を起動する。`/ulw-loop` command は Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲート（code review + QA review + gate review）を実行する
- 委譲プロンプト（worktree 指定）: `/ulw-loop Implement Issue #N:` 以降に worktree root とブランチ名を含める（後述「委譲プロンプト構築例」参照）

CLI subprocess を使わない理由: oh-my-openagent 内部の bash コマンドがハングアップした場合、CLI subprocess では case-run 側から検知不可能だった（case-run #971 事例: tui-state cancelled/lastTool:bash/toolCalls:129）。task() 経由では各ツール呼び出しが120秒 timeout で保護されるため、ハングアップは構造的に検知される。また oh-my-openagent issue #4027（重複オーケストレーション問題）は PR #4071 で解決済み（2026-05-21 クローズ）であり、task() 移行の技術的障壁はない。

## worktree 取り扱い

- case-run が task() の prompt 内で worktree root（`.worktrees/{N}-{type}/`）を相対パスで明示的に指定する。メインリポジトリパスは渡さない
- Sisyphus-Junior は worktree 内で作業する。`.omo/` 等のハーネス作業領域（`.omo/ulw-loop/ledger.jsonl` 等）は worktree 配下に作成され、AgentDevFlow 側は関与しない。worktree 削除時に `.omo/` も破棄される（永続状態として扱わない）

## PR 作成と URL 受領

### PR 作成

Sisyphus-Junior は実装完了後、`gh pr create` で直接 PR を作成する。PR 本文には Issue 番号（`Refs: #N`）を含める。委譲 prompt 内 `/ulw-loop` command の品質ゲート（code review + QA review + gate review）を通過した PR のみが作成される。

### URL 受領

Sisyphus-Junior は PR URL を task() result として返却する。case-run は result から PR URL（PR番号）を取り出す。CLI subprocess 時代の PR URL フォールバック検索は廃止された。Sisyphus-Junior が直接 PR 作成を行うため、PR URL は確実に result に含まれる。

## result 受領

Sisyphus-Junior の task() result は以下の3状態いずれかである（`agentdev-case-run-execution-adapter` の result 契約）:

- **`completed(pr)`**: PR番号/ PR URL を含む。case-run は PR URL を受け取りクリーンアップフェーズへ
- **`blocked`**: 回答可能な blocker の内容。Sisyphus-Junior が Issue コメントに SSoT として詳細本文を記録済み。case-run はエラー処理に従い停止、ユーザー報告
- **`failed`**: repository context で回答不能な blocker の内容。Sisyphus-Junior が Issue コメントに構造化記録済み。case-run はエラー処理に従い停止、ユーザー報告

### 終了コード、異常終了の活用

- task() result が空、エラー含み、異常終了時は、即 `failed` とせず「実装完了、検証未完了」として扱う。詳細は親 `SKILL.md` の「task() 起動失敗、異常終了時事後処理」参照
- result が構造化3状態のいずれかの場合は、result を優先する

## evidence 確認（ulw-loop 監査トレイル）

ulw-loop は Issue を success criteria に分解し、各 criterion に observable evidence を要求する。監査トレイル（`.omo/ulw-loop/ledger.jsonl`）は worktree 配下に配置される。

- case-run は監査トレイルの**内部構造に依存した処理、検証を行わない**。最終結果は PR URL で受領する
- 監査トレイルは worktree 削除時に破棄される（永続状態として扱わない）
- Sisyphus-Junior 内部で evidence 不足が検知された場合は ulw-loop の品質ゲートが機能し、`blocked` または `failed` として result に反映される

## timeout、中断

- CLI subprocess 時代の全体 timeout（廃止）は廃止された。Sisyphus-Junior の各ツール呼び出しごとに120秒 timeout が適用される
- ツール呼び出し timeout が発生した場合は、Sisyphus-Junior 内部でリトライまたは blocker 評価が行われ、最終的に result 契約（3状態）のいずれかとして case-run に返却される
- task() 起動失敗、異常終了時の事後処理は親 `SKILL.md` の「task() 起動失敗、異常終了時事後処理」参照
- 中断時の worktree クリーンアップは case-run 側の責務（Sisyphus-Junior 側にクリーンアップを期待しない）

## 委譲プロンプト構築例

case-run が Sisyphus-Junior を起動する際の委譲プロンプト構築例。実環境の Issue番号、worktree パス、ブランチ名に置き換えること。

```
/ulw-loop Implement Issue #N:

<worktree>
- worktree root: .worktrees/980-case/
- branch: case-980
</worktree>

<Issue body>
（gh issue view N で取得した Issue 本文を埋め込み）
</Issue body>
```

- `/ulw-loop Implement Issue #N:`: 委譲 prompt 内で `/ulw-loop` command を起動し、Issue #N の実装を指示する
- `<worktree>`: case-run が用意した worktree root とブランチ名を明示。メインリポジトリパスは含めない
- `<Issue body>`: 対象 Issue の本文。Sisyphus-Junior は完了条件、受け入れ基準を success criteria に分解する

## 委譲プロンプト雛形（委譲契約必須テンプレート、REQ-0146-002）

委譲プロンプトには以下の「## Findings / Capture候補」テンプレートを必須として含めること。Sisyphus-Junior が本筋外発見を分類、回収するための構造を提供する。

```markdown
## Findings / Capture候補

### intake
（intake 候補をここに記述。本筋外発見・intake inbox 該当項目等）

### learning
（learning 候補をここに記述。再発防止知見・学び等）
```

case-run は委譲プロンプト構築時に本テンプレート構造を維持し、Sisyphus-Junior からの result に含まれる回収項目を PR 本文に転記する。

## 懸念点、未検証事項

本実装ノートは 承認時点の記述であり、以下は実体検証が必要な項目である。実運用で判明した挙動は本ファイルに随時反映すること。

- **Sisyphus-Junior の PR 発行能力**: Sisyphus-Junior が `gh pr create` を確実に実行できるか。PR 本文品質、Refs 記述の確度は実証が必要。
- **task() と OpenCode セッションの協調安定性**: OpenCode セッション内から Sisyphus-Junior を task() 起動した場合の安定性、リソース消費、ログ可視性。
- **ulw-loop 監査トレイルの実体**: `.omo/ulw-loop/ledger.jsonl` の構造、サイズ、運用時の影響。worktree 削除時の破棄確認。
- **task() result の構造化信頼性**: result が常に3状態のいずれかで返却されるか。異常終了時の result 形式の確認。



