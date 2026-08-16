# harness 委譲実装ノート

AgentDevFlow 側（case-run）から実行担当サブエージェントを委譲起動するための実装ノート。
読者は AgentDevFlow の case-run 実装者。
抽象IF（ハーネス非依存）は親の `SKILL.md` 参照。
本ファイルは harness 固有の委譲起動仕様を扱う。具体的な harness の選定は AGENTS.md 参照。

case-run は AGENTS.md で選定された外部実行基盤のエージェント型（実行担当サブエージェント）へ、adapter skill（`agentdev-case-run-execution-adapter`）を読み込んで委譲を起動する（委譲 prompt 内で実行 command を指定）。
起動手段、実行制御パラメータの詳細は本ファイルおよび AGENTS.md 参照。

## 目次

- [起動方式（委譲）](#起動方式委譲)
- [worktree 取り扱い](#worktree-取り扱い)
- [PR 作成と URL 受領](#pr-作成と-url-受領)
- [result 受領](#result-受領)
- [evidence 確認](#evidence-確認)
- [timeout、中断](#timeout中断)
- [委譲プロンプト構築例](#委譲プロンプト構築例)
- [委譲プロンプト雛形（委譲契約必須テンプレート）](#委譲プロンプト雛形委譲契約必須テンプレート)
- [委譲プロトコルと category 設計](#委譲プロトコルと-category-設計)
- [委譲起動失敗、異常終了時事後処理](#委譲起動失敗異常終了時事後処理)

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
- **`delegation-unavailable`**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す

### 終了コード、異常終了の活用

- 委譲 result が空、エラー含み、異常終了時は、即 `failed` とせず「実装完了、検証未完了」として扱う。詳細は本ファイル後述「委譲起動失敗、異常終了時事後処理」参照
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
- 委譲起動失敗、異常終了時の事後処理は本ファイル後述「委譲起動失敗、異常終了時事後処理」参照
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

## 委譲プロンプト雛形（委譲契約必須テンプレート）

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

## 委譲プロトコルと category 設計

adapter skill 経由の委譲は、case-run に限らず subagent 委譲する全場面（case-auto/ case-open/ case-run/ case-update/ case-close）で共通する category 設計と MUST NOT DO 記載の要件に従う（Issue #1538 由来）。本節は委譲プロトコルと category 設計の関係を整理し、事務的手続きで `unspecified-high` を推奨する根拠を明示する。

### `writing` category の発火スキルとの相互作用

`writing` category は執筆作業（docs 記述、article 作成、REQ/ ADR/ SPEC 本文執筆等）を想定した category であり、`japanese-tech-writing` 等の発火スキルと結合する設計である。事務的手続きの委譲に `writing` を使用すると、subagent が発火スキルの文書監査・校正的振る舞いに引きずられ、本来責務（Issue 作成、VERIFY、状態遷移等）から逸脱するリスクがある。

Issue #1538 では case-auto から case-open を `category=writing` で委譲した際、subagent が文書監査ファイル生成（`japanese-audit`、`replacement-dictionary` 等、case-open 責務外）と draft 作成（`.agentdev/drafts/` 配下）へ逸脱した。`category=unspecified-high` と MUST NOT DO 強化プロンプトで解消したが、選定基準が未明文化だったため要件化した。

### 事務的手続きで `unspecified-high` を推奨する根拠

`unspecified-high` は特定の発火スキルと結合しない既定の category であり、事務的手続き（Issue 作成、VERIFY、ラベル設定、状態遷移、コメント追加等）の委譲に適する。理由は以下の通り:

- 発火スキルによる振る舞い誘導が発生しないため、subagent が委譲 prompt の指示通りに事務的手続きへ集中する
- `writing` 等の特定 category と異なり、command 名と category 名の意味的距離が大きくても subagent の振る舞いを誤誘導しない
- 事務的手続きは evidence-backed な成果物（Issue 番号、PR 番号、VERIFY 結果等）が明確であり、特定 category の文脈を必要としない

### category 選定ガイドラインと MUST NOT DO 必須化の適用

adapter skill 経由の委譲（case-run からの実行担当サブエージェント委譲を含む）は、以下を満たす:

- **category 選定**: 委譲先 command の責務と category 名の意味的距離を評価し、誤誘導しない category を選定する。事務的手続きには `unspecified-high` を推奨し、`writing` は執筆作業のみに限定する
- **MUST NOT DO 必須**: 委譲 prompt に MUST NOT DO セクションを必須で記載する。当該 command 責務外のファイル作成、REQ/ SPEC/ src の直接修正、文書監査の実施、capture 境界を超える `.agentdev/` 直接変更等を列挙する
- **プロンプトテンプレート**: category 選定基準と MUST NOT DO 記載要件を統合した形式とし、特定 command 名と category 名の意味的距離が大きい場合の注意事項を含む

adapter skill は本要件を宣言的に定義し、case-run からの委譲 prompt 構築時に参照される。詳細な category 選定ガイドラインは `case-auto.md` の「Subagent 委譲プロトコル」節、MUST NOT DO 記載要件は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照。

## 委譲起動失敗、異常終了時事後処理

実行担当サブエージェントの委譲起動失敗、異常終了時（エージェント型利用不可、異常終了、実行 command 内部エラー等）は即 `failed` とせず**実装完了、検証未完了**として扱い、以下の手順で事後処理する:

1. **委譲起動失敗状況確認**: 委譲 result が異常終了、空、エラー含みの場合、実行担当サブエージェントが実装をどこまで進めたかを worktree で確認する
2. **worktree git status 確認**: worktree で `git status`、`git diff --stat` を実行し、未コミット変更の有無を確認する
3. **変更残留時の分類**:
   - **未コミット変更あり**: 実装が進捗している可能性が高い。以下の検証ステップに進む
   - **未コミット変更なし**: 実装が開始されていない、または実行担当サブエージェントがクリーンアップ済み。`failed` として処理し、Issue コメントに状況を構造化記録する
4. **残留箇所の grep 検出**（未コミット変更ありの場合）:
   - Issue の完了条件、受け入れ基準から抽出したキーワードで `git diff` 内容を grep し、実装の網羅性を確認する
   - テスト実行（`bun test`、`bunx tsc` 等）を実施し、実装が検証可能な状態か確認する
5. **手動修正または PR 化**:
   - 検証が通る場合: 未コミット変更をコミットし、PR を作成して `completed-pr` として処理する。PR 本文の `## Findings / Capture候補` に「実行担当サブエージェント委譲異常終了、事後処理で PR 化」を記録する
   - 検証が通らない、実装が不完全: `blocked`（回答可能な場合）または `failed`（repository context で回答不能）として処理し、Issue コメントに状況を構造化記録する

事後処理で PR 化した場合、`completed-pr` の SSoT は PR 本文（他の completed と同じ）。委譲異常終了事実は PR 本文の Findings セクションに明記する。



