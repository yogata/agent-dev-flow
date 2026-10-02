# マルチホスト運用ガイド（OpenCode と Senpi の併存利用）

OpenCode と Senpi（OmO Native v5）を併存利用するための運用手順をまとめたガイドである。
構造の正はマルチホスト原本モデル Design（[マルチホスト原本モデル](../designs/foundations/multi-host-canonical-model.md)）、意思決定の正は [DEC-049](../decisions/DEC-049.md)、成果の正は [REQ-099](../requirements/REQ-099.md) とする。本ガイドは基準を複製せず、手順と判断材料へ導く。

## 構造の全体像

AgentDevFlow は共通原本とホスト別接続領域に分かれる。

| 領域 | パス | 内容 |
|---|---|---|
| 共通原本 | `src/common/` | 業務契約・本文（commands、skills）、template、Tool engine、guard 共通判定 |
| OpenCode 接続 | `src/opencode/` | OpenCode 用 plugin/hook の原本、Tool 登録配線、guard 接続 |
| Senpi 接続 | `src/senpi/` | Senpi 用 Tool 登録単位、Skill 探索接続、guard 接続 |

導入時の投影は installer が行う。OpenCode 配置対象では `.opencode/` 配下の commands、skills、tools、plugins が共通原本へのジャンクションになる。Senpi 配置対象では `.senpi/` 直下へ `src/senpi/` 配下の各サブディレクトリが個別ジャンクションとして投影される。投影の選択と切替手順は [Consumer Project 導入](consumer-project-setup.md) を参照する。

両ホストの公開入口は同じ共通原本を参照する。ホスト別の業務手順のコピーは存在せず、共通原本への編集が両ホストへ反映される。

## 対応を確認した組合せ

対応済み宣言は検証した組合せに限定される（REQ-099-011）。

| 軸 | 確認した値 | 裏付け |
|---|---|---|
| ADF | Wave 2 接続実装を統合した main（2026-10-02 時点） | 各 Wave 2 PR の検証記録 |
| OpenCode | OmO v4.19.4 を想定した接続（first-class reference harness） | 共通 resolver 契約テスト、installer projection テスト |
| Senpi | OmO Native v5 を想定した接続 | senpi-skill-discovery 契約テスト、Senpi Tool 登録テスト、guard 接続テスト |
| バックエンド | GitHub 実装とローカルIssue実現（操作契約は Custom Tool 操作契約に限定） | Tool engine の共通契約テスト |

実ランタイムでの全組合せ試験の試験記録は Epic #3316 の統合検証（Issue #3324）を参照する。対象は REQ-099-007 の OpenCode×GitHub、OpenCode×ローカルIssue、Senpi×GitHub、Senpi×ローカルIssue である。配置の完了や契約テストの結果をもって、全組合せの実行対応済みと報告しない。

## バックエンドとホストの選択

ホスト選択（OpenCode / Senpi / both）とバックエンド選択（GitHub / ローカルIssue）は独立した軸である。

- OpenCode 側の `agentdev_gh` は既定で GitHub 実装へ接続する。ローカルIssue を使うリポジトリ種別（consumer-generated）では `-LocalMode` による導入で Local 実装へ差し替わる
- Senpi 側の `agentdev_gh` 登録単位は既定で GitHub 実装へ接続する。Senpi 向け投影パス（`.senpi/tools/agentdev-gh/`）に Local 実装が存在する場合のみ、単一の runner として Local 実装へ差し替わる
- 同じ Tool 名で両バックエンドを同時有効化しない。選択したバックエンドの1つに接続する
- バックエンドの疎通確認と診断は「受入確認と診断」節を参照する

## 運用責任（ユーザーに留保される判断）

クロスホスト排他機構は存在しない（DEC-049 決定(5)）。実行中台帳、起動拒否、ホスト間競合の機械的防止のいずれも新設されていない。次の3点はユーザーの運用責任である。

1. **同一 Case を両ホストで同時処理しない**。1つの Case Issue を複数ホストで同時に実行すると、同一の永続状態に対する書込みが競合する。機械的な防止は働かない
2. **切替前に旧ホストの実行を停止する**。実行中の command（case-auto 等）を停止したことを確認してから切替操作へ進む
3. **切替前に永続状態を確認する**。次節の確認手順に従い、GitHub Issue/PR と `.agentdev/` の状態が切替元ホスト側で収束していることを確認する

生きた session や task を別ホストへ移送する手段は存在しない。切替は永続成果物を起点にした再開である。

## 切替・復帰手順

切替は「旧ホストの停止」から「新ホストでの再開」までの3段階で行う。手順は durable state と再構成の契約（[durable state と再構成](../designs/foundations/v4-durable-state-and-recovery.md)）に依拠する。

### 1. 切替元ホストの停止

実行中の command と背景 task を停止する。停止前に出力中の成果物がある場合は、その command の状態遷移に従って保存を完了させる。

### 2. 永続状態の確認

切替元ホスト側で次を確認する。

| 確認対象 | 権威の置き場所 | 確認方法 |
|---|---|---|
| Case/子Issue の状態、PR の state、Definition 確定状態 | GitHub Issue/PR（本文状態節・state・ラベル写像） | `agentdev_gh` の `issue_read`、PR 照会で現行値を確認 |
| `.agentdev/` のドメイン状態（drafts、intake/learning、検出事項等） | repo 内正規状態（git 管理対象） | git status で未 commit の変更がないことを確認。残っていれば切替元ホスト側で commit と push を完了させる |
| worktree、ブランチ、junction 等のローカル環境 | 保存しない（正規状態から再構成） | 確認不要。切替先ホストで再構成される |

現在 stage や workflow route といった cursor 的状態はどこにも保存されない。再開時に最も早い未収束 stage から自動で再構成されるため、切替時に手作業で引き継ぐ項目ではない。

### 3. 切替先ホストでの再開

切替先ホストから同一の Case Issue を入力に `case-auto` を再実行する。中断再開の入力解決は SSoT 再構成を最優先とし、GitHub Issue/PR と repo 内正規状態から実行状態を復元する。

部分失敗（commit 成功・Issue 更新失敗 等）が残っている場合は、権威順（GitHub 正規状態 > repo 内正規状態 > ローカル実行環境状態）で成立した書込みを確認する。未成立分は冪等経路で再実行する。自動解消できない場合、workflow は停止して報告する。切替元ホストへの巻き戻しも同一の手順で行える（切替先で再開した実行を停止し、永続状態を確認してから元のホストで再開する）。

## 受入確認と診断

- **配置検査と実行環境診断の区別**: `install.ps1 -Mode check`（self-hosting では `self-sync.ps1 -Mode check`）は投影の整合を検査する。実行環境の診断も併せて報告する。両者は別の報告として読む。CLI 未導入でも配置は可能である（REQ-099-011）
- **バックエンドの疎通確認**: 本格実行の前に、`issue_read` 等の軽量な読み取り操作を1回実行する。構造化応答が返ることを確認する。手順と障害時の診断は [Consumer Project 導入](consumer-project-setup.md)「投入前の疎通確認」節を参照する
- **両ホストの受入確認**: 同一リポジトリで OpenCode と Senpi の両方から軽量な操作を試し、両方の接続が機能することを確認してから本格実行へ進む

## Command 対応表

両ホストで業務名と引数の意味を維持する（REQ-099-003、REQ-002-009）。名前空間と呼出し構文の表記は次のとおり異なる。

- OpenCode: `/agentdev/<業務名>`。slash command である。`.opencode/commands/agentdev/` に投影された command 本文が Workflow Skill へ委譲する
- Senpi: `agentdev-workflow-<業務名>`。skill 名である。Skill 探索接続が Senpi 公開入口 `.senpi/skills/` を優先し、共通原本 `src/common/skills/` へ fallback する

引数の意味は command 本文と Workflow Skill 本文が共通原本の単一原本であるため、両ホストで同一である。Custom Tool の引数も host 非依存の公開スキーマ（`src/common/tools/agentdev-*/public-schema.ts`）を共通参照する。

全公開 command の対応表を次に示す（2026-10-02 時点、13件）。

| 業務名 | OpenCode での入口 | Senpi での入口 | 共通の到達先 |
|---|---|---|---|
| req-define | `/agentdev/req-define` | `agentdev-workflow-req-define` | `src/common/skills/agentdev-workflow-req-define/` |
| case-auto | `/agentdev/case-auto` | `agentdev-workflow-case-auto` | `src/common/skills/agentdev-workflow-case-auto/` |
| backlog-auto | `/agentdev/backlog-auto` | `agentdev-workflow-backlog-auto` | `src/common/skills/agentdev-workflow-backlog-auto/` |
| backlog-review | `/agentdev/backlog-review` | `agentdev-workflow-backlog-review` | `src/common/skills/agentdev-workflow-backlog-review/` |
| intake-capture | `/agentdev/intake-capture` | `agentdev-workflow-intake-capture` | `src/common/skills/agentdev-workflow-intake-capture/` |
| intake-from-github | `/agentdev/intake-from-github` | `agentdev-workflow-intake-from-github` | `src/common/skills/agentdev-workflow-intake-from-github/` |
| intake-promote | `/agentdev/intake-promote` | `agentdev-workflow-intake-promote` | `src/common/skills/agentdev-workflow-intake-promote/` |
| learning-promote | `/agentdev/learning-promote` | `agentdev-workflow-learning-promote` | `src/common/skills/agentdev-workflow-learning-promote/` |
| inspect-docs | `/agentdev/inspect-docs` | `agentdev-workflow-inspect-docs` | `src/common/skills/agentdev-workflow-inspect-docs/` |
| inspect-skills | `/agentdev/inspect-skills` | `agentdev-workflow-inspect-skills` | `src/common/skills/agentdev-workflow-inspect-skills/` |
| inspect-promote | `/agentdev/inspect-promote` | `agentdev-workflow-inspect-promote` | `src/common/skills/agentdev-workflow-inspect-promote/` |
| issue | `/agentdev/issue` | `agentdev-workflow-issue` | `src/common/skills/agentdev-workflow-issue/` |
| third-party-sync | `/agentdev/third-party-sync` | `agentdev-workflow-third-party-sync` | `src/common/skills/agentdev-workflow-third-party-sync/` |

case-open、case-ready、case-run、case-close、case-revise は内部 lifecycle 段階であり、公開入口を持たない。`case-auto` が内部で解決して駆動するため、対応表の対象外である。

### 対応表の生成規律と検証方法

本対応表は `src/common/commands/agentdev/` の実ファイル列挙から生成する。表が実装と一致しているかは次の手順で確認する。

1. `src/common/commands/agentdev/*.md`（README を除く）を列挙し、command 数を数える
2. 各 command 本文の workflow 節から委譲先の Workflow Skill 名（`agentdev-workflow-*`）を読み取る
3. 委譲先の `src/common/skills/<skill名>/SKILL.md` が存在することを確認する
4. OpenCode 側は installer の管理列挙に `commands\agentdev` が含まれることを確認する。これで `.opencode/commands/agentdev/` が共通原本への junction として解決される
5. Senpi 側は Skill 探索接続（`src/senpi/skill-discovery/`）の探索契約で委譲先 skill が解決されることを確認する。契約は公開入口優先、canonical fallback の順である
6. 表の行数が列挙数と一致し、各行の到達先が上記の確認結果と一致していれば一致と判定する。不一致があれば表を修正する

この手順の実行結果は対応表の更新 PR の検証差分に記録する（REQ-099-018）。

## 関連文書

- [Consumer Project 導入](consumer-project-setup.md): 導入手順、配置対象ホストの選択と切替、`.gitignore` 推奨設定
- [マルチホスト原本モデル](../designs/foundations/multi-host-canonical-model.md): 共通原本とホスト別接続の配置契約
- [DEC-049](../decisions/DEC-049.md): マルチホスト配布モデルの意思決定
- [REQ-099](../requirements/REQ-099.md): マルチホスト併存利用の要件
- [durable state と再構成](../designs/foundations/v4-durable-state-and-recovery.md): 永続状態の権威と再構成の契約
- [コマンド選択](command-selection.md): 状態から次のコマンドを選ぶ入口表
