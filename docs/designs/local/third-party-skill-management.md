---
title: third-party Skill 管理 Design
status: accepted
created: 2026-08-30
updated: "2026-10-03"
---

<!-- ADF-COVERS(design): REQ-097-001, REQ-097-002, REQ-097-003, REQ-097-004 -->

# third-party Skill 管理 Design

## 目的

third-party Skill の宣言と取得機構の正規仕様。
REQ-002-042 から REQ-002-044、REQ-029-009、REQ-052-011 の Design が所有する詳細。

## 宣言ファイル（skills.yaml）

- 配置: src/third-party/skills.yaml。配布成果物種別ではない宣言ファイル
  （case-schema/ 先行例と同様の位置づけ）
- スキーマ: name（kebab-case、agentdev-・repo- 接頭辞拒否）と source。
  revision 項目なし、取得形式を表す type 項目なし。版固定は source URL で表現する
- source 形式判定: 末尾が SKILL.md の URL は単一ファイル型、
  GitHub リポジトリ内 Skill ディレクトリ URL はディレクトリ型

## 取得プロファイル

- 単一ファイル型: .opencode/skills/<name>/SKILL.md へ正規化
- ディレクトリ型: Skill ディレクトリ配下を再帰取得し相対構造を保持。
  Skill ディレクトリ外のファイルは取得しない
- third-party Skill は src/opencode/skills/ 配下へ昇格配置せず、IR-068 の
  skill-projection-manifest の登録対象外とする（manifest は src/opencode/skills
  列挙の検出ビューであり、REQ-002-042 の取得機構経由配置に従う）

## 非破壊性と上書き保護

- 取得失敗時に開始前状態を維持する
- 機構管理外（repo-*、agentdev-、宣言に由来しない同名配置）の無断上書き禁止

## 個別特例統合

- 個別 Skill の利用前提は宣言データと各利用側の責務文書で管理する
- third-party Skill 固有の参照を ADF 本体へ埋め込まない
- source URL は宣言データとして運用者が登録する

## release archive 検証

- skills.yaml の archive 収録要否を package-release-archive.ps1 の投影範囲で検証する
  （収録除外時は archive 提供 consumer 環境での取得手段を明記する）

## 参照点集約

- 各 third-party Skill の参照点を宣言運用として管理する（機械検査対象外、IR-058 は
  宣言済み判定までを担当）

## third-party 成果物の包括定義

third-party 成果物 = ADF が製作していないが、配布成果物が依存し、宣言に基づいて導入時に ADF の管理下で配置・解決するもの。2形態とする:

| 形態 | 宣言の正 | 解決機構 | 配置先 |
|---|---|---|---|
| Skill 形式 | skills.yaml | acquire（取得機構） | .opencode/skills/<name>/ |
| package 形式 | package.json + bun.lock | 導入時生成（bun install + build） | plugin 配下 node_modules/・vendor/ |

環境ツール（bun、git、gh、OpenCode 自身）は対象外。利用者マシンのグローバル環境に存在する動作環境であって、ADF は配布先へ届ける責任も配置先も持たないため。

統一宣言ファイルは作らない。package 形式の正は lockfile であり、skills.yaml への二重管理は drift 発生源になる。包括定義の正は本 Design と用語集（glossary）が担い、README-INSTALL は consumer 向け案内としてこれを引用する。通知文書（THIRD-PARTY-NOTICES、REQ-029-013）の通知対象は版固定情報解決する package 形式の依存と解釈する。Skill 形式の本体は配布物へ含めない（REQ-002-043）のため、Skill 形式の依存への通知文書追記を要しない。

## 宣言ファイルの配置と解決（2候補）

- 既存「宣言ファイル（skills.yaml）」節の配置記述（src/third-party/skills.yaml）は第一候補（本体管理）を記すものであり、本節は第二候補と解決順を追加して既存配置を一般化する
- DEC-023 決定2 の宣言ファイル配置の記述（src/third-party/skills.yaml）は現行実現手段の説明であり、2候補化後も DEC-023 の意味は不変である（機構詳細の所有は REQ/Design）
- 解決順: worktree/src/third-party/skills.yaml（本体管理・優先）→ worktree/.agentdev/third-party/skills.yaml（consumer 管理・フォールバック）
- .agentdev/third-party/skills.yaml の位置づけ: consumer が管理する宣言ファイルであり、取得機構の実行前提状態として .agentdev/ へ格納される（REQ-002-012 の .agentdev/ 規定との整合）
- この2候補解決（候補探索 + 両不在時の fail-closed 案内）が「宣言ファイルが当該 consumer 環境で利用可能であることを取得手段が保証する」（REQ-029-009）の充足方式である。第二候補は consumer 作成の宣言を発見・読取する方式であり、取得手段が宣言の作成を保証するものではない
- 取得機構の全実行面（Custom Tool〔plugin.ts の resolveDeclarationPath 既定〕と後述の cli.ts）は同一の解決を使用する
- release archive は skills.yaml を収録しない（src/third-party/ は投影範囲外）。収録除外時の「archive 提供 consumer 環境での取得手段を明記する」義務（本 Design「release archive 検証」節）は README-INSTALL.md の third-party 節が充足する

## 一括実行面（cli.ts）

- 配置: src/common/tools/agentdev-third-party/cli.ts（tool package の構成物。scripts/ 直下ではない）
- 実行形式: bun src/common/tools/agentdev-third-party/cli.ts [--dry-run] [name]
- 中身は引数解き + runAgentdevThirdPartyOperation 呼び出しのみ。engine/acquisition/transport は全部既存再利用する
- 終了コードは取得成否に連動する。dry-run は計画表示のみで配置しない
- 入口の位置づけ: cli.ts は scripts 公開入口（REQ-050-001、DEC-021）に該当しない取得機構のバッチ実行面であり、この種の入口は本 CLI 1件に限定する。network access は取得機構の正規能力（Custom Tool と同じ transport）であって導入系スクリプトの network access 禁止（REQ-009-046）の適用対象外（DEC-047 決定2の利用者実行の依存解決手順と同型）
- DEC-023 決定2の取得経路列挙（third-party-sync コマンド・専用 Custom Tool）は現行実現手段の説明であり、cli.ts 追加後も DEC-023 の意味は不変である（機構詳細の所有は REQ/Design）

## drift 検知（導入系3経路）

- 対象経路: scripts/install.ps1、scripts/self-sync.ps1、scripts/consumer/archive/install.ps1（3経路は同期して追加・維持する）
- 検査内容: 宣言ファイルの name 列挙と .opencode/skills/<name>/ の配置（SKILL.md + provenance マーカー）の突合
- 宣言済みで配置欠落: ERROR 停止（終了コード分離）+ cli.ts の1行案内。textlint vendor 検知・案内（Test-TextlintVendorReady / Show-TextlintVendorGuidance）と同型・同体裁
- 宣言ファイルが解決できない環境（2候補とも不在）: 検査対象外として正常扱いする（third-party Skill 前提が当該環境にないものとする）
- 宣言読込: 既存 declaration パーサーの利用を基本とする。PowerShell からの呼び出しが困難な場合は PS 内蔵の最小 yaml 解析でよい——ただし name 列挙の抽出に限定し、構文検証は取得機構のパーサーを原本とする（二重実装の drift を防ぐ）。fail-closed は維持する
- package 形式側は既存 textlint vendor 検知がそのまま担当する（二重実装しない）

### ホスト別の取得先と欠落検査・復旧案内

外部Skillの取得先はホストごとに解決される。OpenCode は `.opencode/skills/<name>/` に正規化される。
Senpi は宣言ファイル解決（src/third-party/skills.yaml 優先、.agentdev/third-party/skills.yaml
フォールバック）とともに Senpi 向け skillsRoot への配置解決が実装される
（src/senpi/tools/agentdev-third-party-tool/）。drift 検知（導入系3経路）は OpenCode 配置に
加えて Senpi skillsRoot の存在確認を検査対象に含め、欠落時の復旧案内は third-party-sync
コマンド（cli.ts の1行案内）をホスト別に案内する。検証済み対応範囲と版の実値・組合せは
ガイド（consumer-project-setup.md・multi-host-operations.md）が所有する。
片ホストの実証を両ホストの全工程保証へ拡張しない。

## Design で確定する実装判断

- source URL 形式判定規則: GitHub blob/raw/tree URL 等の変種の扱いを確定する
- 取得トランスポート: git 依存の有無、REQ-009-048 の ZIP 展開環境を含む
  git-less 環境での動作を確定する
- 管理対象 Skill の判別方法: skills.yaml 宣言集合と予約接頭辞からの決定論的判定、
  provenance 履歴の要否を確定する

## v4 adapter 境界への接続

外部ソースからの取得操作（REQ-052-011・Custom Tool agentdev_third_party）は v4 の Harness/Backend adapter 境界（ADF v4 実装責務境界 Design・DEC-036）の I/O 側に位置づく。取得プロファイルと非破壊制御（本 Design 既有）は不変である。

定義の所有は v4-responsibility-boundaries へ参照する。既存節は不変とする。ADF-COVERS 宣言は追加しない。
