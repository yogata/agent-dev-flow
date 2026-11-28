---
name: agentdev-host-github-guidance
description: Guides GitHub operations on hosts without the ADF Custom Tool registration (Codex, Antigravity). USE FOR: invoking the agentdev_gh operation contract through the host connection adapter, resolving the GitHub execution route (plugin / gh), stopping and resuming when the host GitHub plugin is unavailable, switching to the gh route by the user's explicit judgment, comparing GitHub state before resuming an operation whose result is unknown. DO NOT USE FOR: GitHub operations on OpenCode or Senpi (the agentdev_gh tool is available there), implementing MCP, registering ADF tools, hooks, or guards on new hosts.
---

# ホスト別 GitHub 操作案内（host-github-guidance）

Codex と Antigravity で ADF の業務を行う際の GitHub 操作の案内である。両ホストは ADF の Custom Tool（`agentdev_gh`、`agentdev_third_party`）の登録対象外であるため、GitHub 操作は各ホスト接続領域の adapter が共通の agentdev_gh 操作契約（engine・操作スペック・読戻し照合〔VERIFY〕・失敗の意味）を提供する。上位の command と skill は agentdev_gh の操作契約のみを参照し、agentdev_gh を参照する配布スキルを両ホストの動作保証から除外しない。ADF は MCP を実装せず、両ホストへの Tool 登録・hook・guard・取得機構の登録も行わない。

## 操作の実行方法

adapter を導入先リポジトリの root から bun で起動する。要求は UTF-8（BOM なし）の JSON ファイルで渡し、結果は stdout の JSON で受け取る。終了コードは成功 0 / 失敗 1 である。

- Codex: `bun .agents/agentdev/codex/github/agentdev-gh-adapter.ts --input request.json`
- Antigravity: `bun .agents/agentdev/antigravity/github/agentdev-gh-adapter.ts --input request.json`

副作用操作（Issue・PR・Comment・Release の作成・更新・削除）は、OpenCode と同じく実行前に利用者の承認を得てから起動する（承認の判断は workflow と利用者側に留まり、adapter は判定しない）。書き込みは adapter 内の読戻し照合を通過した場合のみ成功になる（fail-closed）。

## 実行経路の解決

経路は導入先リポジトリの `.agentdev/config/github-route.json`（キー `codex` / `antigravity`、値 `plugin` / `gh`）で解決する。記録のないホストはプラグイン経路である。設定が読めない・値が不正な場合は経路を推定せず GitHub 操作の前に停止する（修正または削除後に再実行）。

- プラグイン経路（既定）: 各ホストの GitHub プラグインを agentdev_gh の操作契約に接続して使う。Codex は GitHub の hosted MCP server が tool 面である。Antigravity は利用者が構成する MCP サーバーであり、tool 面が公開情報で確認できないため全操作が停止する（実機確認は利用者が行う）。
- gh 経路（切替後）: 既存の gh 用 runner を使う。操作前に `gh repo view` で対象リポジトリへの認証と権限を確認し、不足していれば停止する。

## プラグイン利用不能時の停止と再開

プラグインが無効・未構成、または必要な操作を提供しない場合、GitHub 操作は失敗応答で停止する。adapter は暗黙に gh 経路へ切り替えない。

- 一時的な利用不能: 現在の設定を保持して復旧を待ち、復旧後に同じ操作を再実行する。停止中は GitHub 操作も経路設定の変更も行わない。
- 恒久的な利用不能: 利用者の明示判断によって `scripts/switch-github-route.ps1` で gh 経路へ切り替える。切替の承認と個別操作の承認は独立である。切替後の経路は再起動後も使われる。

失敗は adapter の欠陥（接続を修正して再検証する）とプラグインの能力不足（停止と切替の判断対象）に分けて記録する。プラグイン経路で提供されない操作（tool 面に該当 tool が無い、操作契約と意味が異なる等）は能力不足として扱い、別の経路で勝手に実行しない。

## 結果が不明な操作をまたぐ再開

書き込みの結果が不明になった場合（接続の切断等）、adapter は再実行しない。再開の前に GitHub の状態を照合し、重複作成を防ぐ。

1. 照合で操作対象が一意に確定できた場合: その対象で処理を継続する。
2. 行われていないと確定できた場合: 実行する。
3. 複数の候補が見つかる場合、または照合できない場合: 書き込まず停止して利用者の判断を求める。

照合には読み取り操作（`issue_list`、`issue_read`、`comment_list` 等）を使う。プラグイン経路と gh 経路のいずれでも同じ規則を適用する。検索軸（`issue_list` の `search`）の結果反映には時間差があるため、検索結果が 0 件でもそれだけで「未実行」と確定せず、再照会するか、対象を一意に特定できる別の読み取り（番号・本文等による確認）で交差確認してから判定する。

## 対象と対象外

| ホスト | 本案内 | GitHub 操作の手段 |
|---|---|---|
| Codex | 対象 | ホスト接続領域の adapter（プラグイン経由が既定） |
| Antigravity | 対象 | ホスト接続領域の adapter（tool 面が未確認のため停止。実機確認は利用者） |
| OpenCode / Senpi | 対象外 | `agentdev_gh`（ADF の Tool 登録があり、制約なしに利用可能） |

## 関連

- Codex 接続領域と Antigravity 接続領域（導入先では `.agents/agentdev/` 配下）: adapter と経路設定読取りの配置
- マルチホスト運用ガイド: 実際に使用した GitHub 実行経路と実機検証の実施者・結果の記録
