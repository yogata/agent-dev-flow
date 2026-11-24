# Antigravity 文書管理の接続指示

Antigravity 上で AgentDevFlow の command を適用する際の文書管理指示である。本指示は command 本文の条件を置き換えない。公開8コマンドの業務名・引数・編集範囲の正本は command 本文そのものであり、本指示はその適用手順のみを定める。

## 適用手順

1. **workspace の確認**: 指定された workspace root（`.agentdev/` マーカーで識別されるディレクトリ）を確認する。読み書きの対象は指定 workspace 配下に限定し、workspace が解決できない場合は実行を開始しない。
2. **公開入口の解決**: 業務名を `agentdev-workflow-<業務名>` スキル（Antigravity 公開入口 `.agents/skills/`）へ解決する。入口は command 全文（共通正本 `src/common/commands/agentdev/<業務名>.md`）と委譲先 Workflow Skill を返し、引数は無改変で渡す。
3. **command 全文の適用**: workflow を開始する前に、command 全文の入力・不変条件・ガードレールを最初に読み込む。入口が command 全文を返さない場合は workflow を開始しない。
4. **workflow の開始**: command 全文を適用した後、委譲先 Workflow Skill を読み込み、返された引数をそのまま用いて workflow を開始する。

## 全条件適用

- 適用条件の全体を command と Workflow Skill の両方から収集して適用する。command に重複して記載されない条件（Workflow Skill 側の契約、template、参照文書の条件を含む）も省略しない。
- 片方のみの条件で判定しない。条件の重複や表記の違いを理由に条件を減らさない。

## 参照の読み替え

- 共通正本の本文が OpenCode の投影経路で参照先を書いている場合は、対応する接続先へ読み替えて参照する。`.opencode/skills/` は公開入口 `.agents/skills/`（入口にない場合は共通正本 `src/common/skills/`）へ読み替える。`.opencode/commands/agentdev/` は共通正本 `src/common/commands/agentdev/` へ読み替える。
- 読み替えた参照先が存在しない場合は推測せず、失敗として報告する。

## 拒否規則（副作用の前）

- 適用条件への違反が判明した場合、いかなる副作用の前に実行を拒否し、違反した条件を明示して報告する。
- 編集対象が指定 workspace の外へ解決される場合、拒否する（越出し検査は接続 `antigravityAssertWriteTarget` が提供する）。
- 未知の業務名・引数は推測して実行せず、失敗として報告する。
