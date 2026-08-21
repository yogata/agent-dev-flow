---
name: agentdev-req-structure-diagnostics
description: inspect-docs コマンドの REQ 構造診断ロジックの知識ベース。USE FOR: REQ参照ID整合性確認、第一参照導線確認、現行/廃止/世代境界確認、6観点診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）、未処理成果物確認、問題候補出力スキーマ。DO NOT USE FOR: backlog 統合手順、intake pipeline、work_type 判定。
---
<!-- ADF-COVERS(verification): REQ-001-050, REQ-001-051, REQ-001-052 -->

# REQ 構造診断知識ベース

inspect-docs コマンドの REQ 構造診断知識ベース。
REQ参照ID整合性、第一参照導線、現行/廃止/世代境界、6観点診断、未処理成果物確認、問題候補出力スキーマの判定基準と検出シグナルを提供する。
検査対象を直接修正しない診断専用であり、本スキルは判定ロジックの提供のみを行い、ファイル変更や成果物処理は行わない。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-req-structure-diagnostics` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/designs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-req-structure-diagnostics.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/designs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/designs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/designs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| inspect-docs | docs全体の意味整合性レビューにおける REQ 構造診断ロジックの提供（REQ参照ID整合性、第一参照導線、現行/廃止境界、Design分離基準違反検出、6観点診断、未処理成果物確認、問題候補出力スキーマ、配布物統合性検出（構文健全性、文意保持、責務整合、NG 分類）） |

## cleanup モデル（6処置）と6観点診断の別軸性

本スキルの6観点診断（SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT）と、document-model Design（extension 経由）「恒久基準と非規範情報の整理」の cleanup 6処置（KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE）は別軸である。
診断観点は REQ 体系の構造的問題を検出する軸であり、cleanup 6処置は非規範情報の整理処置を表す軸である。
両者の対応関係は document-model Design が正規所有し、本スキルは再定義しない。
REQ 内の内部実装方式（cleanup モデルの対象カテゴリ）の残留は Design 分離基準違反の検出シグナルとして扱い、検出事項には cleanup 6処置の候補を推奨 route に併記できる。
処置に伴う文書変更は行わない（診断専用）。

## 参考文献

| ファイル | 内容 |
|----------|------|
| `references/req-structure-review.md` | REQ参照ID整合性確認、第一参照導線確認、現行/廃止/世代境界確認、Design分離基準違反検出、配布物 ID 汚染検出、配布物統合性検出（構文健全性、文意保持、責務整合、NG 分類、docs-spec-rebuild-integrity Design 準拠）、Design 三層構造の整合性検出、HOW 除去後の acceptance-criteria 順位検証、6観点診断（観点、検出シグナル、シグナル閾値）、未処理成果物確認、診断結果の出力（問題候補出力スキーマ7フィールド） |

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定、フェーズ定義

