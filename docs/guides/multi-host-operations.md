# マルチホスト運用ガイド（OpenCode と Senpi の併存利用、Codex と Antigravity の限定配布）

OpenCode と Senpi（OmO Native v5）を併存利用するための運用手順に加え、Codex と Antigravity の限定配布と GitHub 操作の接続についても案内するガイドである。
構造の正はマルチホスト原本モデル Design（[マルチホスト原本モデル](../designs/foundations/multi-host-canonical-model.md)）、意思決定の正は [DEC-049](../decisions/DEC-049.md)、Codex と Antigravity の限定配布の意思決定は [DEC-069](../decisions/DEC-069.md)、新ホストの GitHub 接続と gh 経路切替の意思決定は [DEC-071](../decisions/DEC-071.md)、成果の正は [REQ-099](../requirements/REQ-099.md) とする。本ガイドは基準を複製せず、手順と判断材料へ導く。

## 構造の全体像

AgentDevFlow は共通原本とホスト別接続領域に分かれる。

| 領域 | パス | 内容 |
|---|---|---|
| 共通原本 | `src/common/` | 業務契約・本文（commands、skills）、template、Tool engine、guard 共通判定 |
| OpenCode 接続 | `src/opencode/` | OpenCode 用 plugin/hook の原本、Tool 登録配線、guard 接続 |
| Senpi 接続 | `src/senpi/` | Senpi 用 Tool 登録単位、Skill 探索接続、guard 接続 |
| Codex 接続 | `src/codex/` | Codex 用 Skill 探索接続、GitHub 接続 adapter、入口構成、文書管理の接続指示 |
| Antigravity 接続 | `src/antigravity/` | Antigravity 用 Skill 探索接続、GitHub 接続 adapter、入口構成、文書管理の接続指示 |

導入時の投影は installer が行う。OpenCode 配置対象では `.opencode/` 配下の commands、skills、tools、plugins が共通原本へのジャンクションになる。Senpi 配置対象では、共通原本の `agentdev-*` スキルが Senpi 公開入口 `.senpi/skills/` へ個別ジャンクションとして投影され、あわせて接続投影として `.agents/agentdev/common`（共通原本全体）と `.agents/agentdev/senpi`（Senpi 接続領域全体）が配置される。Codex・Antigravity 配置対象（`-AgentHosts` による明示選択）では、共有入口 root `.agents/skills/` へ共通原本の `agentdev-*` スキルがジャンクションとして投影され、あわせて接続投影として `.agents/agentdev/common` と各ホスト接続領域全体（`.agents/agentdev/codex`、`.agents/agentdev/antigravity`）が配置される。投影の選択と切替手順は [Consumer Project 導入](consumer-project-setup.md) を参照する。

両ホストの公開入口は同じ共通原本を参照する。ホスト別の業務手順のコピーは存在せず、共通原本への編集が両ホストへ反映される。

Codex 接続と Antigravity 接続は限定配布である（DEC-069）。接続領域の原本（`src/codex/`、`src/antigravity/`）はリリースアーカイブに同梱され、installer は `-AgentHosts` による導入先リポジトリ単位の明示選択に応じて共有入口 root（`.agents/skills/`）へ共通原本の `agentdev-*` スキルを投影する。移管しない4機構と GitHub 操作の境界は「Codex と Antigravity の限定配布」節のとおりである。

## 対応を確認した組合せ

対応済み宣言は検証した組合せに限定される（REQ-099-011）。

| 軸 | 確認した値 | 裏付け |
|---|---|---|
| ADF | Wave 2 接続実装を統合した main（2026-10-02 時点） | 各 Wave 2 PR の検証記録 |
| OpenCode | OmO v4.19.4 を想定した接続（first-class reference harness） | 共通 resolver 契約テスト、installer projection テスト |
| Senpi | OmO Native v5 を想定した接続 | senpi-skill-discovery 契約テスト、Senpi Tool 登録テスト、guard 接続テスト |
| Codex | 限定配布（Skill 探索と入口構成に加え GitHub 接続 adapter。Tool 登録・hook・guard・取得機構なし。installer は `-AgentHosts` による選択投影） | codex-skill-discovery 契約テスト、構造テスト、Codex GitHub 接続（mapping・transport・adapter）の契約テスト、installer 選択投影の振る舞い試験（実機での組合せ検証なし） |
| Antigravity | 限定配布（同上。GitHub 接続は能力表が全操作未確認のため停止。実機確認は利用者） | antigravity-skill-discovery 契約テスト、構造テスト、Antigravity GitHub 接続 adapter の契約テスト、installer 選択投影の振る舞い試験（実機での組合せ検証なし） |
| バックエンド | GitHub 実装とローカルIssue実現（操作契約は Custom Tool 操作契約に限定） | Tool engine の共通契約テスト |

実ランタイムでの全組合せ試験の試験記録は Epic #3316 の統合検証（Issue #3324）を参照する。対象は REQ-099-007 の OpenCode×GitHub、OpenCode×ローカルIssue、Senpi×GitHub、Senpi×ローカルIssue である。配置の完了や契約テストの結果をもって、全組合せの実行対応済みと報告しない。Codex と Antigravity の GitHub 操作は「Codex と Antigravity の限定配布」節のとおりホスト接続領域の adapter 経由で行い、実機での確認は利用者が行う。

## バックエンドとホストの選択

ホスト選択（OpenCode / Senpi / both）とバックエンド選択（GitHub / ローカルIssue）は独立した軸である。

- OpenCode 側の `agentdev_gh` は既定で GitHub 実装へ接続する。ローカルIssue を使うリポジトリ種別（consumer-generated）では `-LocalMode` による導入で Local 実装へ差し替わる
- Senpi 側の `agentdev_gh` 登録単位は既定で GitHub 実装へ接続する。Senpi 向け投影パス（`.senpi/tools/agentdev-gh/`）に Local 実装が存在する場合のみ、単一の runner として Local 実装へ差し替わる
- 同じ Tool 名で両バックエンドを同時有効化しない。選択したバックエンドの1つに接続する
- バックエンドの疎通確認と診断は「受入確認と診断」節を参照する

## Codex と Antigravity の限定配布

Codex と Antigravity への対応は限定配布である（DEC-069、GitHub 接続は DEC-071 が部分置換）。取り込みの根拠と境界は次のとおりである。

- **取り込みの根拠**: ADF が補うのは共通原本への接続（Skill 探索、command 全文の適用）、GitHub 操作の接続（agentdev_gh 操作契約の adapter 提供）、品質の終了時確認に限定する。ホストが既に持つ能力（GitHub プラグイン等）を ADF で再実装しない
- **移管しない機構**: Custom Tool 登録（`agentdev_gh`、`agentdev_third_party`）、hook、guard、third-party 取得機構の4機構は両ホストへ移管しない。MCP サーバー化と ADF 独自の MCP 接続も行わない
- **GitHub 操作**: ホスト接続領域の adapter が共通の agentdev_gh 操作契約（engine・読戻し照合・失敗の意味）を各ホストの GitHub プラグインへ接続して行う。操作契約を参照する上位の command と skill は OpenCode・Senpi と同じ参照先を使う
- **OpenCode の併用**: 終了時の品質ゲートのために限定する。GitHub 操作の引き渡しを前提としない。それ以外の機能に OpenCode の併用を前提としない

### 能力比較

| 項目 | OpenCode | Senpi | Codex・Antigravity |
|---|---|---|---|
| 公開入口 | `/agentdev/<業務名>` slash command | `agentdev-workflow-<業務名>` スキル | `agentdev-workflow-<業務名>` スキル |
| Custom Tool（`agentdev_gh` 等） | 登録あり | 登録あり | 登録なし（ホスト接続領域の adapter が同じ操作契約を提供） |
| guard・hook | 接続あり | 接続あり | なし |
| installer 投影・リリース同梱 | 対象 | 対象 | 限定（`-AgentHosts` 明示選択時に共有入口 root のみ投影。接続領域原本はリリースアーカイブに同梱） |

### 取り込みとその根拠

取り込みは次の3つである。ホストの既存能力に同等のものがあるかどうかと、取り込むと判断した根拠を併記する。ホストの能力は公開資料に基づき、公開資料に記載のないものは「記載なし」とする。取り込まない機構と GitHub 操作の扱いは、本節冒頭の4項目のとおりである。

| 取り込み | ホスト既存の能力 | 不足と判断した根拠 | 対象契約 |
|---|---|---|---|
| Skill 探索の接続 | あり（`.agents/skills` 配下のスキルを name と description で発見し、選択時に `SKILL.md` を読み込む） | 指定 workspace への拘束と、共通原本 `src/common/skills/` への fallback の記載がない | `src/common/skills/agentdev-skill-resolution/`（skill-resolution） |
| command 全文の適用 | 記載なし | スキルの読込前に command 本文を適用する機構の記載がない | `src/common/skills/agentdev-skill-resolution/`（command-entry） |
| 終了時の品質ゲート | 未確認 | ホスト側に同等の最終検査があることを公開資料で確認できていないため、ADF 既存の `gate.ts` を使う | `src/opencode/plugins/agentdev-textlint-guard/gate.ts` |

### 公開典拠

Codex の入口 root（`.agents/skills`）は Codex の公開文書（[Build skills](https://learn.chatgpt.com/docs/build-skills)）に基づく。Antigravity の入口 root（`.agents/skills`）は Antigravity の公開資料（[Agent skills](https://antigravity.google/docs/skills/)）が示す既定の root に基づく。Antigravity は公開情報に基づく静的検討であり、実機確認は行っていない。

### GitHub 実行経路（Codex・Antigravity）

Codex と Antigravity の GitHub 操作は、ホスト接続領域の adapter が共通の agentdev_gh 操作契約を提供する。adapter は導入先リポジトリのルートから bun で起動し、結果は stdout の JSON で返る（終了コードは成功 0 / 失敗 1）。操作前の承認と書込み後の読戻しは OpenCode と同じ規則で維持される。

- **実行経路の解決**: `.agentdev/config/github-route.json`（キー `codex` / `antigravity`、値 `plugin` / `gh`）。記録のないホストはプラグイン経路である。設定が読めない・不正な場合は経路を推定せず GitHub 操作の前に停止する
- **プラグイン経路（既定）**: 各ホストの GitHub プラグインに接続する。Codex の tool 面は GitHub の hosted MCP server である。プラグインが無効・未構成・操作非提供の場合は GitHub 操作を利用者の判断まで停止し、暗黙に gh 経路へ切り替えない
- **gh 経路（切替後）**: 既存の gh 用 runner を使う。操作前に `gh repo view` で認証と権限を確認する。切替は利用者の明示判断によって `scripts/switch-github-route.ps1` でのみ行い、切替後の経路は再起動後も使われる
- **結果が不明な操作をまたぐ再開**: 書込みの結果が不明になった場合は再実行せず、再開前に読み取り操作で GitHub の状態を照合して重複作成を防ぐ（一意なら継続、未実行なら実行、複数候補または照合不能なら停止して利用者の判断を求める）
- **失敗の分類**: 失敗は adapter の欠陥（接続を修正して再検証）とプラグインの能力不足（停止と切替の判断対象）に分けて記録する

停止と再開、切替の手順の詳細は共通案内スキル `agentdev-host-github-guidance` を参照する。

#### GitHub 実行経路の実績記録

新ホストの対応はホスト単位で判定し、実際に使用した GitHub 実行経路と実機検証の実施者と結果を本表に記録する。

| ホスト | 実際に使用した経路 | 実機検証の実施者 | 実績 |
|---|---|---|---|
| Codex | プラグイン経路（GitHub hosted MCP server の tool 面への対応付け。リポジトリ操作の契約試験は 偽 transport で実施） | 未実施（利用者の確認待ち） | 契約試験合格（issue 更新の labels・一覧系を含む主要操作。search・コメント削除・Release 作成・Release 公開は tool 面の能力不足として停止を確認）。実ホストでのプラグイン接続は未確認 |
| Antigravity | プラグイン経路（能力表が全操作未確認のため全操作が停止する設計） | 未実施（利用者の確認待ち） | 停止動作の契約試験合格。能力表の確認と実機検証は利用者が行う |

gh 経路は切替後に利用できる。gh 経路の主要操作系列（読戻し検証を含む）は共通判定（four-combination 共通 helper）により両ホストの adapter で契約試験合格している。

### 利用者が行う動作確認項目と期待結果

| 確認項目 | 期待結果 |
|---|---|
| 入口スキルの解決 | `agentdev-workflow-<業務名>` が各ホストの入口 root から解決できる |
| command 本文の読込 | 業務名に対応する command 全文が読み込まれ、引数の意味が OpenCode・Senpi と同一である |
| 書込先の拘束 | 共通原本領域外への書込が接続の判定で拒否される |
| GitHub 操作の実行 | adapter の起動（`bun .agents/agentdev/<ホスト>/github/agentdev-gh-adapter.ts --input request.json`）で GitHub 操作が共通の操作契約により実行され、構造化応答（JSON）が返る |
| GitHub 操作の能力確認 | プラグイン経路で提供されない操作は構造化失敗で停止する（暗黙の経路切り替えなし）。Codex は実機での接続確認、Antigravity は能力表の確認と実機検証を利用者が行う |
| 終了時の品質ゲート | 対象 worktree に対する最終検査（`gate.ts`）の終了コードが `0` である。違反がある場合は終了コード `1` となり、成功として扱われない |

### 終了時の品質ゲート

両ホストには書込み前 hook を登録しない。終了時の品質ゲートは導入の選択に応じて区別する。

- OpenCode を選択した導入では、作業に使った worktree を閉じる前に OpenCode 向けの最終検査（`gate.ts`）を対象 worktree に対して実行し、不合格のまま閉じない
- OpenCode を選択していない導入では、OpenCode 用 plugin に依存する検査（`gate.ts` による文章品質検査）を終了時の品質ゲートの対象外とし、結果にその旨を記録する。plugin に依存しない終了時の必須検査（`bun test` 等）は実施し、その失敗を成功として扱わない

OpenCode を選択した導入での `gate.ts` の実行手順は次のとおりである。

1. 対象 worktree で変更を確定させる
2. AgentDevFlow が導入済みの配置にある `gate.ts` を、`--root` に対象 worktree のパスを指定して実行する（`gate.ts` の配置場所は plugin の README「導入時の依存生成手順」の表を参照）

```bash
bun <plugin 配置>/gate.ts --root <対象 worktree のパス>
```

期待結果は終了コード `0`（拒否対象の違反ゼロ）である。終了コード `1`（違反あり、検査不能、未完了、対象 0 件）と `2`（引数エラー）は不合格であり、成功として扱わない。検査対象は対象 worktree の `docs/` 配下の Markdown ファイルと、追加対象として設定したファイルである。plugin の依存成果物が未生成の場合は検査不能として不合格になるため、事前に plugin の README に従って生成する。

接続領域の構成と手順の詳細は `src/codex/README.md` と `src/antigravity/README.md` を参照する。

## 運用責任（ユーザーに留保される判断）

クロスホスト排他機構は存在しない（DEC-049 決定(5)）。実行中台帳、起動拒否、ホスト間競合の機械的防止のいずれも新設されていない。次の3点はユーザーの運用責任である。

1. **同一 Case を両ホストで同時処理しない**。1つの Case Issue を複数ホストで同時に実行すると、同一の永続状態に対する書込みが競合する。機械的な防止は働かない
2. **切替前に旧ホストの実行を停止する**。実行中の command（case-auto 等）を停止したことを確認してから切替操作へ進む
3. **切替前に永続状態を確認する**。次節の確認手順に従い、GitHub Issue/PR と `.agentdev/` の状態が切替元ホスト側で収束していることを確認する

生きた session や task を別ホストへ移送する手段は存在しない。切替は永続成果物を起点にした再開である。

## 切替・復帰手順

切替は「旧ホストの停止」から「新ホストでの再開」までの3段階で行う。手順は durable state と再構成の契約（[durable state と再構成](../designs/foundations/durable-state-and-recovery.md)）に依拠する。

### 1. 切替元ホストの停止

実行中の command と背景 task を停止する。停止前に出力中の成果物がある場合は、その command の状態遷移に従って保存を完了させる。

### 2. 永続状態の確認

切替元ホスト側で次を確認する。

| 確認対象 | 権威の置き場所 | 確認方法 |
|---|---|---|
| Case/子Issue の状態、PR の state、Definition 確定状態 | GitHub Issue/PR（本文状態節・state・ラベル写像） | `agentdev_gh` の `issue_read`、PR 照会で現行値を確認 |
| `.agentdev/` のドメイン状態（drafts、intake/learning、検出事項等） | repo 内正規状態（git 管理対象） | git status で未 commit の変更がないことを確認。残っていれば切替元ホスト側で commit と push を完了させる |
| worktree、ブランチ、junction 等のローカル環境 | 保存しない（正規状態から再構成） | 確認不要。切替先ホストで再構成される |

現在の stage や workflow route といった進行位置を指す状態（cursor）はどこにも保存されない。再開時に最も早い未収束 stage から自動で再構成されるため、切替時に手作業で引き継ぐ項目ではない。

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
- Codex と Antigravity: Senpi と同じ `agentdev-workflow-<業務名>` を公開入口とする。入口 root は Codex・Antigravity とも `.agents/skills` である（限定配布）

引数の意味は command 本文と Workflow Skill 本文が共通原本の単一原本であるため、両ホストで同一である。Custom Tool の引数も host 非依存の公開スキーマ（`src/common/tools/agentdev-*/public-schema.ts`）を共通参照する。

全公開 command の対応表を次に示す（8件）。

| 業務名 | OpenCode での入口 | Senpi での入口 | 共通の到達先 |
|---|---|---|---|
| req-define | `/agentdev/req-define` | `agentdev-workflow-req-define` | `src/common/skills/agentdev-workflow-req-define/` |
| case-auto | `/agentdev/case-auto` | `agentdev-workflow-case-auto` | `src/common/skills/agentdev-workflow-case-auto/` |
| backlog-auto | `/agentdev/backlog-auto` | `agentdev-workflow-backlog-auto` | `src/common/skills/agentdev-workflow-backlog-auto/` |
| phase-tasks-create | `/agentdev/phase-tasks-create` | `agentdev-workflow-phase-tasks-create` | `src/common/skills/agentdev-workflow-phase-tasks-create/` |
| phase-tasks-update | `/agentdev/phase-tasks-update` | `agentdev-workflow-phase-tasks-update` | `src/common/skills/agentdev-workflow-phase-tasks-update/` |
| phase-artifacts-update | `/agentdev/phase-artifacts-update` | `agentdev-workflow-phase-artifacts-update` | `src/common/skills/agentdev-workflow-phase-artifacts-update/` |
| phase-review | `/agentdev/phase-review` | `agentdev-workflow-phase-review` | `src/common/skills/agentdev-workflow-phase-review/` |
| phase-transition | `/agentdev/phase-transition` | `agentdev-workflow-phase-transition` | `src/common/skills/agentdev-workflow-phase-transition/` |

case-open、case-ready、case-run、case-close、case-revise は内部 lifecycle 段階であり、公開入口を持たない。`case-auto` が内部で解決して駆動するため、対応表の対象外である。
backlog-review、intake-promote、learning-promote、inspect-docs、inspect-promote も公開入口を持たない内部 workflow であり、`backlog-auto` が Workflow Skill として駆動するため、対応表の対象外である。

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
- [DEC-069](../decisions/DEC-069.md): Codex・Antigravity の限定配布とホスト既存能力の優先
- [DEC-071](../decisions/DEC-071.md): 新ホストの GitHub 接続と gh 経路切替
- [REQ-099](../requirements/REQ-099.md): マルチホスト併存利用の要件
- [durable state と再構成](../designs/foundations/durable-state-and-recovery.md): 永続状態の権威と再構成の契約
- [コマンド選択](command-selection.md): 状態から次のコマンドを選ぶ入口表
