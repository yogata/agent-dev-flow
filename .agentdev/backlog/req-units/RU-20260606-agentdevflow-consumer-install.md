---
source_type: chat
generated_by: session
generated_at: 2026-06-06T14:51:57+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-06-agentdevflow-consumer-install
---

# RU: consumer repo への AgentDevFlow 導入方法整理

## 背景

AgentDevFlow を agent-dev-flow repo 自身だけでなく、他の consumer repository にも適用できる形にする。

現状では、agent-dev-flow repo 自身の self-hosting projection と、consumer repository への導入方法が明確に分離されていない。

特に `.agentdev/`, `.agentdev-plugin/`, `.opencode/`, `.sisyphus/` の責務境界を README と実装配置で明確にする必要がある。

## 問題

consumer repository に AgentDevFlow を導入する際、agent-dev-flow 本体の clone 先と、AgentDevFlow が生成・管理する domain state の置き場が混同される可能性がある。

`.agentdev/` は consumer repository 固有の永続状態領域として使用されるため、ここに agent-dev-flow 本体を clone してはならない。

また、agent-dev-flow repo 自身の self-hosting projection と consumer repository への install 処理を同じスクリプトで扱うと、責務が混在する。

## Source Summary

このRUは、チャット内で合意した以下の内容を統合する。

- consumer repository では、agent-dev-flow 本体を `.agentdev-plugin/` に clone する
- `.agentdev/` は consumer repository 固有の永続状態領域として扱う
- `.opencode/` は OpenCode runtime projection として扱う
- `.sisyphus/` は一時作業領域として扱う
- agent-dev-flow repo 自身では `.agentdev-plugin/` を使わない
- self-hosting projection と consumer install は別スクリプトに分離する
- root 直下 `sync-opencode.ps1` は不要であり、削除対象とする
- README.md に consumer repository への導入方法を整理する
- 上記の導入方法に適合するように、ファイル構成と実装を整理する

## 統合理由

導入方法、状態領域、runtime projection、スクリプト責務が同一の設計判断に属するため、1つのRUとして扱う。

`.agentdev/` と `.agentdev-plugin/` の分離は、README記載だけでなく、consumer install script の配置・導入対象・gitignore方針にも影響する。

root 直下 `sync-opencode.ps1` の削除も、self-hosting projection と consumer install の責務分離に含まれるため、同一RUで扱う。

## 要件化の方向

README.md に consumer repository への導入手順を追加する。

consumer repository では、agent-dev-flow 本体を `.agentdev-plugin/` に clone する方式を標準とする。

導入コマンド例:

````powershell
git clone https://github.com/yogata/agent-dev-flow .agentdev-plugin
pwsh .agentdev-plugin/scripts/install-consumer-opencode.ps1 -TargetRepoRoot . -Mode junction
````

consumer repository の標準構成を以下のように整理する。

````text
target-repo/
  .agentdev/
    intake/
    learning/
    backlog/
    req-units/
    ...

  .agentdev-plugin/
    src/
    scripts/
    docs/
    ...

  .opencode/
    commands/agentdev/
    skills/agentdev-*/

  .sisyphus/
````

責務を以下のように定義する。

- `.agentdev/`: consumer repository 固有の AgentDevFlow domain state
- `.agentdev-plugin/`: agent-dev-flow 本体の local plugin checkout
- `.opencode/`: OpenCode runtime projection
- `.sisyphus/`: 一時作業領域

consumer repository 側の推奨 `.gitignore` を README.md に記載する。

````gitignore
.agentdev-plugin/
.sisyphus/

.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
````

`.agentdev/` は gitignore しない。

self-hosting projection と consumer install を別スクリプトに分離する。

````text
agent-dev-flow/
  scripts/
    sync-self-opencode.ps1
    install-consumer-opencode.ps1
    check-consumer-opencode.ps1
````

root 直下 `sync-opencode.ps1` は残さない。

agent-dev-flow repo 自身の構成は以下のように整理する。

````text
agent-dev-flow/
  .agentdev/
  .sisyphus/
  src/opencode/
  .opencode/
  scripts/
    sync-self-opencode.ps1
    install-consumer-opencode.ps1
    check-consumer-opencode.ps1
````

consumer install の対象は AgentDevFlow の public runtime artifacts に限定する。

導入対象:

- `.opencode/commands/agentdev/`
- `.opencode/skills/agentdev-*/`

導入対象外:

- `.opencode/commands/repo/`
- `.opencode/skills/repo-*/`
- agent-dev-flow repo 自身の `.agentdev/`
- agent-dev-flow repo 自身の `.sisyphus/`

## 主対象REQまたは変更対象候補

新規REQまたは既存の AgentDevFlow consumer project 導入モデルに関するREQへの APPEND とする。

変更対象候補:

- README.md
- scripts/
- root 直下 `sync-opencode.ps1`
- docs/guides/artifacts-and-state.md
- 関連する consumer project / runtime projection / repo type の仕様文書

## 対象外

- package manager / marketplace plugin としての配布方式
- lock file 形式の確定
- Git submodule 運用の確定
- junction 以外の全OS対応詳細
- consumer repository 固有 command / skill の設計
- agent-dev-flow 以外の既存 repository への実適用作業

## 受け入れ条件

- README.md に consumer repository への導入手順が記載されている
- README.md 上で `.agentdev/` と `.agentdev-plugin/` の責務が区別されている
- `.agentdev/` が consumer repository 固有の永続状態領域として説明されている
- `.agentdev-plugin/` が agent-dev-flow plugin 本体の clone 先として説明されている
- agent-dev-flow repo 自身では `.agentdev-plugin/` を使わないことが説明されている
- consumer install 用スクリプトが `scripts/` 配下に整理されている
- self-hosting projection 用スクリプトが `scripts/` 配下に整理されている
- root 直下 `sync-opencode.ps1` が削除されている
- self-hosting projection 用スクリプトと consumer install 用スクリプトの責務が分離されている
- consumer install が `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を対象にしている
- consumer install が `.opencode/commands/repo/` と `.opencode/skills/repo-*/` を導入対象にしない
- consumer repository 向け `.gitignore` 方針が README.md に記載されている
- `.agentdev/` を gitignore 対象にしないことが明示されている
