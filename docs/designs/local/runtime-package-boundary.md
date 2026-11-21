---
title: 実行時パッケージ境界
status: accepted
created: 2026-08-20
updated: "2026-11-21"
---
<!-- ADF-COVERS(implementation): REQ-002-007, REQ-002-008, REQ-002-011, REQ-002-019, REQ-002-027（REQ-002-020 は distribution-boundary 側へ移管〔REQ-123-003〕） -->
<!-- ADF-COVERS(implementation): REQ-113-001, REQ-113-002（tsconfig 参照共有と typecheck 組込みの実装対応） -->
<!-- ADF-COVERS(implementation): REQ-009-002, REQ-009-003, REQ-009-006, REQ-009-007, REQ-009-008, REQ-009-009, REQ-009-010, REQ-009-011, REQ-009-012, REQ-009-013, REQ-009-014, REQ-009-015, REQ-009-016, REQ-009-017, REQ-009-018, REQ-009-019, REQ-009-020, REQ-009-021, REQ-009-022, REQ-009-023, REQ-009-024, REQ-009-025, REQ-009-035, REQ-009-036, REQ-009-037, REQ-009-038, REQ-009-039, REQ-009-046, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-044-004 -->
<!-- ADF-COVERS(implementation): REQ-011-006 -->
<!-- ADF-COVERS(implementation): REQ-050-001, REQ-050-004, REQ-050-007, REQ-050-008, REQ-050-010, REQ-050-013（REQ-050-002/003/005/015 はジャンクション判定の install-script-usability へ移管に伴い同 Design 側へ移動〔REQ-123-003〕） -->
<!-- ADF-COVERS(implementation): REQ-052-007（scripts/consumer/archive/install.ps1、scripts/install.ps1 の宣言を docs 正規配置先へ移管） -->
<!-- ADF-COVERS(implementation): REQ-029-012, REQ-029-013（textlint guard 依存実体の版固定情報解決と 3rd-party 依存の通知） -->
<!-- ADF-COVERS(implementation): REQ-112-001, REQ-112-002, REQ-112-003（local ツール package の tsconfig 参照共有と typecheck 検査契約節が implementation 実体） -->
<!-- ADF-COVERS(design): REQ-029-012, REQ-029-013（本体リポジトリ sync 節と 3rd-party 依存の通知小節が design 実体） -->
<!-- 注: install/self-sync 各 ps1（scripts/）は走査対象拡張子外のため、導入器実装行の宣言は本 Design（正規仕様所有者）へ配置。実装実体は scripts/install.ps1、scripts/self-sync.ps1（内部処理は scripts/consumer/、scripts/self/ 配下） -->
<!-- ADF-COVERS(design): REQ-002-047 -->
<!-- ADF-COVERS(design): REQ-009-002（同期とインストール分離と REQ-050-001 3本構成の現行化の構造判断） -->
<!-- ADF-COVERS(design): REQ-050-009 -->
<!-- ADF-COVERS(design): REQ-091-001, REQ-091-002, REQ-091-003, REQ-091-004, REQ-091-005 -->
<!-- ADF-COVERS(design): REQ-112-001, REQ-112-002, REQ-112-003（local ツール package の tsconfig 参照共有と typecheck 検査契約節が design 実体） -->
<!-- ADF-COVERS(design): REQ-113-001, REQ-113-002（local ツール package の tsconfig 参照共有と typecheck 検査契約節が design 実体） -->
<!-- ADF-COVERS(design): REQ-050-014（scripts 公開入口と内部配置節の旧公開入口3本現役導線禁止条項が design 実体） -->
<!-- ADF-COVERS(implementation): REQ-123-003（REQ-123-003 のスリム化編集の実装実体。ハブ化と重複排除・移管済み必須仕様の削除。REQ-123.md 冒頭 inline ADF-COVERS(design) 宣言と REQ-116 型 covers 宣言構成） -->

# 実行時パッケージ境界

> **Scope**: 本 Design は agent-dev-flow リポジトリ内部設計文書（REQ-001）。物理構造・同梱許可/禁止パス規則・インストール境界契約を定義。配布依存境界の検証モデル・projection 分離・gate 契約は `../integrity/distribution-boundary.md` 正規所有（REQ-029、DEC-014）。

## 4 種のリポジトリ種別（Repo Type）

> plugin/npm/package 配布形態は現在未対応（REQ-009-009 参照）。REQ-009-006 は5種として `plugin-future` を含めて定義し、本表は現行実装済みの4種のみを扱う。

| Type ID | `.opencode/` の意味 |
|---------|---------------------|
| `self-hosting` | 実行時配置先（ジャンクション → `src/common/`〔plugin は `src/opencode/plugins/`〕） |
| `consumer-with-agentdev` | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 |
| `consumer-local` | プロジェクトローカルカスタマイズ専用 |
| `consumer-generated` | link mode による AgentDevFlow 実行時位置（`tools/agentdev-gh/` のみ Local 実装へ接続） |

種別判定: `src/common/`・`src/opencode/` 存在かつ `.opencode/` ジャンクションなら `self-hosting`、`.opencode/commands/agentdev/` か `.opencode/skills/agentdev-*/` が存在（link 含む）なら `consumer-with-agentdev`、`.opencode/tools/agentdev-gh/` が `src/common/tools/agentdev-gh/local/` への link なら `consumer-generated`、`.opencode/` があり `agentdev` 名前空間を含まないなら `consumer-local`、いずれでもなければ N/A。

## リポジトリ種別別 `.opencode/` 意味と配布パッケージ構造

### 本体リポジトリ（self-hosting）

```
.opencode/                       → real directory (not junction)
  commands/agentdev/             → junction → src/common/commands/agentdev/
  skills/agentdev-*/             → junction → src/common/skills/agentdev-*/ (per skill)
  tools/agentdev-*/              → junction → src/common/tools/agentdev-*/ (per tool)
  plugins/agentdev-*/            → junction → src/opencode/plugins/agentdev-*/ (per plugin)
src/common/                      → 共通原本（commands、skills、tools engine、guards）
src/opencode/                    → OpenCode 接続領域（plugin/hook 原本、ホスト固有接続）
```

- 原本編集は `src/common/` と `src/opencode/` で実施。`scripts/self-sync.ps1` が各対象を個別ジャンクション管理（`agentdev-*` グロブ動的列挙）
- **scripts/ 配下の配布境界**: 配布対象は `*.ts`、`lib/*.ts`、`tests/*.test.ts`、`package.json`、`tsconfig.json`、`bun.lock`、`.gitignore`、`README.md`。除外は `node_modules/`（consumer 側で再生成）。テスト一時フィクスチャ生成先は `os.tmpdir()`
- **vendored bundle 再生成**: vendored engine bundle（`vendor/textlint-engine.bundle.json`、`vendor/kuromoji-dict/`）は git 管理対象外とし `bun install && bun run build:engine` で再生成（REQ-029-012）。導入系スクリプトは vendor 欠落検知時に fail-closed 停止（DEC-016）。焼き付きパス検出は plugin 本体実装仕様が所有
- **3rd-party 依存の通知**: third-party 依存とライセンス種別は THIRD-PARTY-NOTICES.md（repo root）が宣言（REQ-029-013）。様式・範囲・更新契機は当該文書を正とし release archive は同梱

### Consumer 種別（導入済み・ローカル・ローカル版 link mode）

| 種別 | `.opencode/` 構成 | 備考 |
|------|------------------|------|
| `consumer-with-agentdev` | `commands/agentdev/`、`skills/agentdev-*/` は symlink/junction、`{local}` 配下は直接管理 | symlink/junction 推奨。`.agentdev/` が存在 |
| `consumer-local` | `commands/{local}/`、`skills/{local}-*/` のみ | `agentdev` 以外の名前空間（REQ-009-008）。検出時は docs-check（IR-016）が NG 報告 |
| `consumer-generated` | `commands/agentdev/`・`skills/agentdev-*/` は `src/common/` 配下へ link、`tools/agentdev-gh/` のみ `.../local/` へ link | Plugin ローダーシムは投影成果物として生成し apply が欠落・誤解決を検知して再生成。`commands/`・`skills/`・ひな形は git 管理対象外（REQ-009-008、REQ-009-016）。`.agentdev/issues/` はローカルIssue（REQ-009-026） |

## プロジェクトローカル命名規則（Project-Local Naming Rules）

| 名前 | 種別 | 使用可能リポジトリ種別 |
|------|------|-------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | 同上 |
| `.agentdev/` | ドメイン状態ディレクトリ | 同上 |

命名規約: 予約名以外（REQ-009-008）・kebab-case（REQ-002-011）・独自 skill は `.opencode/skills/{project}-*/` に配置。

## 導入方式ポリシー（Installation Method Policy）

provisioning（チェックアウトの取得）は利用者の責務であり、git clone とソース ZIP 展開の2形態を正規形とする（REQ-009-010、REQ-009-046、DEC-016）。install スクリプトはチェックアウト済み `.agentdev-plugin/` を前提に junction 設定のみを行い、provisioning と network access を行わない。install 手段は link mode に限定される。

Symlink 制約: Windows ジャンクション `mklink /J`（管理者権限不要）/ `mklink /D`（開発者モードまたは管理者権限）/ Unix `ln -s`。

| 方式 | 状態 | 推奨度 |
|--------|--------|--------|
| Symlink / ジャンクション | 対応済み | **推奨**（更新自動反映、原本単一管理） |
| Copy | 対応済み | 非推奨（乖離リスク。docs-check〔IR-016〕が検出） |
| Git submodule / Plugin / npm / package | 検討可能 / 未対応 | 実験的 / REQ-009-009 参照 |
| Release archive projection | 別投影 | REQ-009-045、copy インストールの延長ではない |

## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）

| リポジトリ種別 | 同期対象 |
|-----------|----------|
| `self-hosting` | `self-sync.ps1` による選択的ジャンクション（opencode 実行時ファイル以外） |
| `consumer-with-agentdev` | `install.ps1` による AgentDevFlow 提供ファイルのみ（ローカルカスタマイズは同期の影響を受けない） |
| `consumer-local` / `consumer-generated` | なし（適用対象外。generated は link 設定により接続） |

両入口は apply（同期実行）・check（乖離検出・終了コード判定）・dry-run（変更予測）の3モード（REQ-050-002〜005）。旧状態確認専用スクリプトの検査能力は `install.ps1 -Mode check` が包含する（REQ-050-004。検査項目一覧は install-script-usability Design「install.ps1 -Mode check の検査カタログ」参照）。

## scripts 公開入口と内部配置

- 公開入口2本: consumer 向け `scripts/install.ps1`、self-hosting 向け `scripts/self-sync.ps1`。入口名は安定契約（REQ-050-001）
- 内部配置: consumer 専用処理は `scripts/consumer/`、配布・検証処理は `scripts/self/release/`、保守処理は `scripts/self/maintenance/`。release 生成・信頼境界検証・保守処理・単体実行しない内部共通処理を scripts/ 直下に配置しない
- 旧公開入口3本を現役導線として残さず旧入口名を利用者へ実行させる記述を現行文書群へ残さない（REQ-050-014 が所有）
- supervisor-bridge の原本は `scripts/self/supervisor-bridge/` 配下（credential 供給ブリッジ。手順と失敗署名は docs/guides/ と docs/knowledge/ が所有）。release archive には含まれない（配布範囲外・自己開発環境限定）。REQ-050-009 の内部配置列挙に本配置を含む
- archive 専用 installer の原本は `scripts/consumer/archive/install.ps1` として分離保持。release archive 内では `scripts/install.ps1` の名で配置し、両版は異なる installation projection として同一実装へ強制統合しない（REQ-050-010）
- 誤実行防止の環境判定は install-script-usability「誤実行防止（リポジトリ種別判定）の案内メッセージ」正規所有（REQ-050-006・移管 REQ-123-003）

## Tools / Plugins の配布・投影

Custom Tool（原本: src/common/tools/）と Plugin / Hook（原本: src/opencode/plugins/）を正規配布種別として扱い（REQ-052）、原本と実行時投影は Command / Skill と同一の source・projection 原則に従う（配備形態の正は DEC-049）。公開入口は2本に固定し、Tool / Plugin の追加で新たな公開入口を作らない（REQ-050-001、REQ-052-008）。

repo-local Plugin（REQ-002-045）の配布除外と自己ホスト投影の契約は `../integrity/distribution-boundary.md`「repo-local Plugin の配布除外と自己ホスト投影」節が正規所有する（移管 REQ-123-003）。

## link mode 接続手順技術詳細

`commands/agentdev/`・`skills/agentdev-*/` は通常版・LocalMode とも `src/common/` 配下へ接続（REQ-009 decision #2）。`tools/agentdev-gh/` は通常版 `src/common/tools/agentdev-gh/`、`-LocalMode` 時 `src/common/tools/agentdev-gh/local/`（Local 実装）へ接続（REQ-009 decision #3, REQ-011-006）。

- Local 実装の原本は `src/common/tools/agentdev-gh/local/` でローカル版は共通原本を変更しない（REQ-009-015/016）。ローカル版は通常版と同じ操作契約で、Issue と PR の読取り・更新・作成済み状態・取り込み結果をローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の記録へ読み替える（REQ-009-026〜032）。上位 command と skill は Tool 操作契約を参照しローカル版専用の別名 skill や分岐を持たない。ローカルIssueスキーマ原本は [ローカルIssue共通スキーマ](local-case-file.md) で、パッケージは原本を再定義せず `case-schema/` を含める。汎用バックエンド抽象化・`src/opencode-local/`・ローカル版 command・template は作成しない
- `scripts/install.ps1` は `-Mode`（dry-run / check / apply）に `-LocalMode` スイッチを併用でき、`-Mode` は `-LocalMode` の有無に従属せず従来どおり動作する。別スクリプトは新設せずエントリポイントを単一に維持する
- **link target 確認と更新運用**: link は意図した target かを確認し（REQ-009 decision #6, REQ-009-010）意図した target 以外へ解決される場合は設定を停止する。link 設定は導入先リポジトリでだけ実行し、更新時は既存 link を解除して同じ target へ再接続し差分生成や変換処理は行わない。更新は利用者の責務であり（REQ-009-049）git pull 後に install を再実行。apply は冪等で再実行で junction 構成を変化させない。チェックアウト検証は install-script-usability「チェックアウト未検出時のエラーメッセージ」参照

### ジャンクション状態の判定と自己修復

ジャンクション対象の状態分類（正常 / wrong target〔管理物・確認不能〕/ ジャンクション以外）、モード別挙動（apply の自己修復・check 報告・dry-run 予測表示）、正本解決条件（`Get-TargetSourcePath`）、修復可否判定（`Test-ManagedProjectionJunction`・`Test-ManagedSenpiJunction`）、収束条件の契約は [install-script-usability.md](install-script-usability.md)「ジャンクション状態の判定と自己修復」節が正規所有する（移管 REQ-123-003。REQ-050-002/003/005/015、REQ-058-001/004/005/006/008/012）。

## 配布物依存スキルの src 昇格（REQ-002-001/002、v2:ADR-0134）

昇格基準・昇格手順・現行の境界は `../integrity/distribution-boundary.md`「配布物依存スキルの src 昇格」節が正規所有する（移管 REQ-123-003）。昇格判定は「配布物が当該スキルを参照するか否か」で機械的に行い、IR-058 が `git ls-files` 突合とテキスト参照走査で検出する。

## v4 adapter 境界への接続

本 Design のリポジトリ種別、.opencode/ 意味、link mode、Tools / Plugins 配布は Harness/Backend adapter 境界の下で維持される。配備形態の原本は DEC-049、配置契約と投影モデルはマルチホスト原本モデル Design（multi-host-canonical-model.md）が所有。ローカル版 Custom Tool の原本は共通原本側 Tool engine 領域にあり src/opencode/ への型・schema 参照を持たない（REQ-009-015/016）。

## local ツール package の tsconfig 参照共有と typecheck 検査契約

ルート package（`src/common/tools/<name>/`）と Local 実装 package（`.../local/`）の `tsconfig.json` を二重管理しない。Local 側はルート側へ `extends` で参照し差分は `include` 等の Local 固有設定へ限定。Local package の `typecheck`（`tsc --noEmit`）を本体リポジトリの品質検査経路へ組み込む（誤 import 修正完了後・検査 pass を前提）。この契約は Local 版の配布対象除外（REQ-009-016）を変更せず本体リポジトリ内の検査実行の追加である。

## 関連項目（See Also）

- [Consumer Project Setup Guide](../../guides/consumer-project-setup.md)（導入手順）
- [配布依存境界](../integrity/distribution-boundary.md)（検証モデル・gate 契約・src 昇格・repo-local Plugin 配布除外）
- [ローカルIssue共通スキーマ](local-case-file.md)（ローカルIssueスキーマ）
- REQ-009-006~065、REQ-009（リポジトリ種別 / `.opencode/` 意味 / 命名 / 導入 / 同期範囲 / link mode）
