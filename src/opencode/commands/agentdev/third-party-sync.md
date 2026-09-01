---
description: third-party Skill を宣言（skills.yaml）に基づき利用者環境へ取得・同期する人間向け公開入口
---

# third-party Skill 同期

third-party Skill（ADF が製作していない外部由来の skill）を宣言ファイル（skills.yaml）に基づいて利用者環境へ取得・同期する人間向け公開入口である。
取得手順本体を所有せず、third-party Skill 取得専用 Custom Tool へ委譲する。
skills.yaml への宣言追加だけで取得対象へ追加でき、機構コードの変更を要求しない。

## 入力

- 対象 Skill 名（省略時は全件）。skills.yaml に宣言された name を1つ指定する
- dry-run 指定（任意）

## 出力

- 取得結果報告: 対象一覧、取得成否、配置パス、管理外衝突の検出状況（セッション内テキスト出力）
- dry-run 指定時: 実行される予定の計画表示のみ。取得・配置の変更は発生しない

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-third-party-sync` スキルへ委譲する。
入力解決、skills.yaml の読込と検証、対象選択、取得実行の Custom Tool 委譲、結果検証・報告は同スキルが所有する。
取得の副作用実行は third-party Skill 取得専用 Custom Tool の操作契約が担う。

## 不変条件

- 取得対象は skills.yaml に宣言された Skill のみ
- 取得結果は `.opencode/skills/<name>/SKILL.md` に正規化配置される（単一 SKILL.md source URL 型）
- dry-run 指定時は計画表示のみで取得を実行しない
- 取得失敗時は開始前状態を維持し、失敗を成功扱いとしない

## ガードレール

- 取得手順本体を所有しない。副作用を伴う取得は third-party Skill 取得専用 Custom Tool の操作契約経由のみ
- scripts/ 直下の公開入口を追加・要求しない
- 機構管理外の既存配置（`repo-*`、`agentdev-*`、宣言に由来しない同名配置）を無断で上書きしない。衝突検出時は取得を停止し報告する
- skills.yaml のスキーマ定義と取得プロファイル（source 形式判定、正規化、再帰取得）の実装を本コマンドで行わない
