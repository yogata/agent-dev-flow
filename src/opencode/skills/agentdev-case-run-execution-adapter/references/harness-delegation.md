# harness 委譲実装ノート

AgentDevFlow 側（case-run）から実行担当サブエージェントを委譲起動するための実装ノート。
読者は AgentDevFlow の case-run 実装者。
抽象IF（ハーネス非依存）は親の `SKILL.md` 参照。
本ファイルは harness 固有の委譲起動仕様を扱う。具体的な harness の選定は AGENTS.md 参照（REQ-0162-002）。

case-run は AGENTS.md で選定された外部実行基盤のエージェント型（実行担当サブエージェント）へ、adapter skill（`agentdev-case-run-execution-adapter`）を読み込んで委譲を起動する（委譲 prompt 内で実行 command を指定）。
起動手段、実行制御パラメータの詳細は本ファイルおよび AGENTS.md 参照。

## 起動方式（委譲）

case-run は実行担当サブエージェントを委譲起動する。
具体的な起動コード、API は AGENTS.md で選定された harness の仕様に従う。

- adapter skill（`agentdev-case-run-execution-adapter`）: AgentDevFlow 側の adapter skill を読み込む。委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する
- 委譲プロンプト: 実行 command を prompt 内で指定し Issue #N の実装を指示する（command の具体名は AGENTS.md 参照）。実行 command は Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲート（code review + QA review + gate review）を実行する
- 委譲プロンプト（worktree 指定）: 実行 command 指定以降に worktree root とブランチ名を含める（後述「委譲プロンプト構築例」参照）

各ツール呼び出しは120秒 timeout で保護され、ハングアップは構造的に検知される。

## worktree 取り扱い

- case-run が委譲の prompt 内で worktree root（`.worktrees/{N}-{type}/`）を相対パスで明示的に指定する。メインリポジトリパスは渡さない
- 実行担当サブエージェントは worktree 内で作業する。ランタイム作業領域（実行監査トレイル等）は worktree 配下に作成され、AgentDevFlow 側は関与しない。worktree 削除時にランタイム作業領域も破棄される（永続状態として扱わない）

## PR 作成と URL 受領

### PR 作成

実行担当サブエージェントは実装完了後、PR 作成手続き（`agentdev-gh-cli`）で PR を作成する。
PR 本文には Issue 番号（`Refs: #N`）を含める。
委譲 prompt 内 実行 command の品質ゲート（code review + QA review + gate review）を通過した PR のみが作成される。

### URL 受領

実行担当サブエージェントは PR URL を委譲 result として返却する。
case-run は result から PR URL（PR番号）を取り出す。
実行担当サブエージェントが直接 PR 作成を行うため、PR URL は確実に result に含まれる。

## result 受領

実行担当サブエージェントの委譲 result は以下の4状態いずれかである（`agentdev-case-run-execution-adapter` の result 契約）:

- **`completed-pr`**: PR番号/ PR URL を含む。case-run は PR URL を受け取りクリーンアップフェーズへ
- **`blocked`**: 回答可能な blocker の内容。実行担当サブエージェントが Issue コメントに SSoT として詳細本文を記録済み。case-run はエラー処理に従い停止、ユーザー報告
- **`failed`**: repository context で回答不能な blocker の内容。実行担当サブエージェントが Issue コメントに構造化記録済み。case-run はエラー処理に従い停止、ユーザー報告
- **`delegation-unavailable`**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す（REQ-0162-004）

### 終了コード、異常終了の活用

- 委譲 result が空、エラー含み、異常終了時は、即 `failed` とせず「実装完了、検証未完了」として扱う。詳細は親 `SKILL.md` の「委譲起動失敗、異常終了時事後処理」参照
- result が構造化4状態のいずれかの場合は、result を優先する

## evidence 確認

実行 command は Issue を success criteria に分解し、各 criterion に observable evidence を要求する。
ランタイム作業領域（実行監査トレイル等）は worktree 配下に配置される。

- case-run はランタイム作業領域の**内部構造に依存した処理、検証を行わない**。最終結果は PR URL で受領する
- ランタイム作業領域は worktree 削除時に破棄される（永続状態として扱わない）
- 実行担当サブエージェント内部で evidence 不足が検知された場合は実行 command の品質ゲートが機能し、`blocked` または `failed` として result に反映される

## timeout、中断

- 実行担当サブエージェントの各ツール呼び出しごとに120秒 timeout が適用される
- ツール呼び出し timeout が発生した場合は、実行担当サブエージェント内部でリトライまたは blocker 評価が行われ、最終的に result 契約（4状態）のいずれかとして case-run に返却される
- 委譲起動失敗、異常終了時の事後処理は親 `SKILL.md` の「委譲起動失敗、異常終了時事後処理」参照
- 中断時の worktree クリーンアップは case-run 側の責務（実行担当サブエージェント側にクリーンアップを期待しない）

## 委譲プロンプト構築例

case-run が実行担当サブエージェントを起動する際の委譲プロンプト構築例。
実環境の Issue番号、worktree パス、ブランチ名に置き換えること。実行 command の具体名は AGENTS.md 参照。

```
<execution-command> Implement Issue #N:

<worktree>
- worktree root: .worktrees/980-case/
- branch: case-980
</worktree>

<Issue body>
（Issue 本文読込手続き（agentdev-gh-cli）で取得した Issue 本文を埋め込み）
</Issue body>
```

- `<execution-command> Implement Issue #N:`: 委譲 prompt 内で実行 command を起動し、Issue #N の実装を指示する
- `<worktree>`: case-run が用意した worktree root とブランチ名を明示。メインリポジトリパスは含めない
- `<Issue body>`: 対象 Issue の本文。実行担当サブエージェントは完了条件、受け入れ基準を success criteria に分解する

## 委譲プロンプト雛形（委譲契約必須テンプレート、REQ）

委譲プロンプトには以下の「## Findings / Capture候補」テンプレートを必須として含めること。
実行担当サブエージェントが本筋外発見を分類、回収するための構造を提供する。

```markdown
## Findings / Capture候補

### intake
（intake 候補をここに記述。本筋外発見・intake inbox 該当項目等）

### learning
（learning 候補をここに記述。再発防止知見・学び等）
```

case-run は委譲プロンプト構築時に本テンプレート構造を維持し、実行担当サブエージェントからの result に含まれる回収項目を PR 本文に転記する。



