---
name: agentdev-workflow-third-party-sync
description: "third-party-sync command の workflow 実装本体。third-party 宣言（skills.yaml）の読込と検証、対象選択と管理外衝突の事前判定、third-party Skill 取得専用 Custom Tool への委譲による取得実行、結果検証・報告の workflow を所有する。USE FOR: third-party-sync 実行時の workflow 実行（入力解決・宣言読込検証・対象選択・衝突事前判定・Tool 委譲・結果報告）。DO NOT USE FOR: 取得プロファイルと非破壊制御の本体実装（third-party Skill 取得専用 Custom Tool の責務）、source URL 形式判定と取得トランスポート（Custom Tool 内部の実装判断）、skills.yaml 自体の管理（宣言データの運用）、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# third-party-sync workflow スキル

third-party-sync command の workflow 実現本体。
third-party 宣言（skills.yaml）に基づき、対象 Skill の選択から third-party Skill 取得専用 Custom Tool への委譲、結果報告までの workflow を所有する。
取得手順本体と副作用実行は所有せず、Custom Tool の操作契約へ委譲する。

third-party-sync command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実現本体を提供する。

## 入力

- third-party-sync command から渡される対象 Skill 名（省略時は全件）
- dry-run 指定（任意）

## 出力

- 取得結果報告: 対象一覧、取得成否、配置パス、管理外衝突の検出状況
- dry-run 指定時: 計画表示のみ（取得・配置の変更なし）

## 副作用

- 取得・配置の副作用は third-party Skill 取得専用 Custom Tool の操作契約経由のみ。本スキル自身は取得・配置・削除の副作用を持たない
- skills.yaml の読み込みは read-only。本スキルは宣言ファイルを書き換えない

## workflow model（対話操作完結型、STEP model 対象外）

本スキルは対話操作完結型の workflow であり、STEP model の対象外である。
resume point / export / import を持たない。
durable state は skills.yaml の宣言と配置済み Skill であり、中断時は同一指示から再実行して現在状態を再構成できる。
工程ラベルは順序ラベルであり resume point ではない。

| STEP | 名称 | 内容 |
|---|---|---|
| STEP-1 | 入力解決・skills.yaml 読込と検証 | 入力を解決し、宣言を読み込んで検証する（下記「STEP-1 宣言の読込と検証」） |
| STEP-2 | 対象選択・管理外衝突の事前判定 | 全件または指定名で対象を選び、管理外衝突を事前判定する（下記「STEP-2 対象選択と衝突事前判定」） |
| STEP-3 | 取得実行（Custom Tool 委譲） | 取得を Custom Tool 操作契約へ委譲する。dry-run 指定時は計画表示のみ |
| STEP-4 | 結果検証・報告 | 成功読み戻しの確認と取得結果報告、失敗時の状態維持と要因報告 |

## STEP-1 宣言の読込と検証

third-party 宣言（skills.yaml）を読み込み、次の検証を行う。検証に不合格がある場合は取得へ進まず、不合格内容を報告する。

| 検証項目 | 基準 |
|---|---|
| 構文 | YAML として解析できる |
| name 形式 | kebab-case。`agentdev-`、`repo-` 接頭辞は拒否する |
| source 必須 | 各宣言に source URL を持つ |
| スキーマ外項目なし | revision 項目、type 項目を持たない。版固定は source URL で表現する |

宣言が不存在または空の場合は「取得対象なし」を報告して完了する。

## STEP-2 対象選択と衝突事前判定

- 対象選択: 指定 Skill 名がある場合は該当宣言のみを選ぶ。指定名が宣言に存在しない場合は取得を実行せず、宣言されていない旨を報告する。省略時は全宣言が対象
- 管理外衝突の事前判定: 対象の配置先（`.opencode/skills/<name>/`）について、機構管理外の既存配置（`repo-*`、`agentdev-*`、宣言に由来しない同名配置）との衝突を検出する。衝突を検出した場合は当該対象を停止とし、上書きしない旨を含めて報告する。宣言に由来する同名配置は管理対象であり、更新対象として扱う

## STEP-3 取得実行（Custom Tool 委譲）

third-party Skill 取得専用 Custom Tool の操作契約（Custom Tool 操作契約 Design の「third-party Skill 取得」節）へ委譲する。

- 入力: 対象 Skill 名（省略時は全件）、dry-run 指定
- dry-run 指定時: 取得を実行せず計画表示のみで完了する。計画には対象一覧、配置先、source 形式（単一 SKILL.md URL 型 / GitHub Skill ディレクトリ型）、管理外衝突の事前判定結果を含める
- Tool の成功応答は読み戻し検証済みであることを操作契約が保証する。本スキルは応答の成功区分をそのまま受け入れる
- 取得の正規化配置（単一 SKILL.md URL 型は `.opencode/skills/<name>/SKILL.md`、ディレクトリ型は相対構造保持）と非破壊性・上書き保護は Tool 側の保証に従う

## STEP-4 結果検証・報告

- 成功時: Tool が返した取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）を利用者へ報告する。取得された SKILL.md が配置パスへ読み戻せることを Tool の検証済み成功応答により確認する
- 失敗時: 失敗を成功扱いとしない。Tool が開始前状態へ解消したことを応答で確認し、失敗要因を報告する
- 部分取得: 複数対象の一部が失敗した場合は、成功対象と失敗対象（要因）を分けて報告する。失敗対象の状態は Tool の保証（開始前状態の維持）に従う

## 共通制約

- **Tool 操作契約経由**: 取得・配置の副作用は third-party Skill 取得専用 Custom Tool の操作契約経由のみ。本スキルで取得トランスポート、source URL 形式判定、正規化、再帰取得を実装しない
- **非破壊性の維持**: 機構管理外の既存配置を無断で上書きしない。衝突検出時は停止して報告する
- **dry-run 契約**: dry-run 指定時は Tool への取得実行を伴わず、計画表示のみで完了する
- **宣言追加のみの拡張**: 取得対象の追加は skills.yaml への宣言追加のみで行う。機構コードの変更を要求しない
- **scripts 公開入口の不使用**: scripts/ 直下の公開入口を追加・要求しない

## See Also

- **third-party-sync command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **Custom Tool 操作契約 Design**: 「third-party Skill 取得」操作契約の正
- **third-party Skill 管理 Design**（local ドメイン）: 宣言スキーマ、取得プロファイル、非破壊性の正
- **DEC-023**: third-party Skill の分離管理と取得機構の導入
