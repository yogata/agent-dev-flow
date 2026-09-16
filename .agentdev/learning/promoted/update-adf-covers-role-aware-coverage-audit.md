# ADF-COVERS coverage 突合の役割区別必須化（implementation 集約の誤認防止）

## 背景

Case #2824（PR #2874）の配布物 ADF-COVERS 宣言 cleanup・集約突合において、REQ ID の有無のみで突合した初回判定が、役割別の再突合で反転する事象が case-run・case-close の両面で発生した。REQ-057-028 が判定基準の中核を既に所有するが、突合時の役割フィルタ適用と除去後検査という運用詳細が workflow 手順に明記されておらず、実行者ごとの判断に委ねられていた。

## 問題

ADF-COVERS 宣言は role（design / implementation / verification）を持つが、REQ 行単位で宣言集合を突合する際に役割フィルタの適用を省略すると、docs 配下の verification・design 役割宣言まで implementation 集約済みと同一視され、配布物本体宣言の除去可否（cleanup）を誤判定する。誤って除去すると traceability check の missing-implementation が新規発生し、coverage の対応関係が喪失する。

## 望ましい変更

- coverage 突合（除去可否判定）に役割フィルタ＋docs/ パスフィルタの適用を必須とする手順の明記
- 除去実行後に traceability check で role 別 coverage の不変（新規 missing 0）を確認する後置検査の規定
- 判定基準の中核は REQ-057-028 の既存規定に従い、本変更は運用詳細の整備に留める

## 対象範囲

### 対象

- 配布物 ADF-COVERS 宣言の除去・移動・集約判定を行う workflow 手順（case-run の cleanup 判定、case-close STEP-3 の集約突合）
- agentdev-traceability の coverage 利用時の注意（役割付き出力の解釈）

### 対象外

- ADF-COVERS 宣言形式・3役割モデル自体の変更（traceability の正規契約が所有）
- traceability check の検査種別・計上仕様の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| REQ（運用詳細） | docs/requirements/REQ-057.md（REQ-057-028 行） | 役割フィルタ＋docs/ パスフィルタ必須化・除去後 role 別 coverage 確認の運用詳細候補 |
| 配布skill | .opencode/skills/agentdev-traceability/SKILL.md（coverage 利用手順） | coverage 突合時の役割フィルタ適用注記 |
| 配布skill | case-run / case-close の cleanup・集約突合手順（references） | 役割区別突合と除去後検査の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: docs/requirements/REQ-057.md（REQ-057-028: 除去はカバー対象の docs 集約済み確認後に実行、対応関係喪失防止）
- **ギャップ分類**: fix gap / application miss
- **ギャップ詳細**: 判定基準の中核は存在するが、(a) 役割フィルタ＋docs/ パスフィルタの突合手順への必須化、(b) 除去後の role 別 coverage 不変確認（後置検査）が workflow 手順・traceability 利用時に明記されていない

## 制約

- 配布依存境界: 配布物本文の要件行参照は意味参照とし、具体 REQ ID は ADF-COVERS 宣言行に限定する
- 判定基準の所有は REQ-057-028 行に維持する（二重定義しない）

## 受け入れ条件

- [ ] coverage 突合の cleanup 判定手順に役割フィルタ＋docs/ パスフィルタの適用が必須として明記されていること
- [ ] 除去実行後に traceability check で新規 missing 0 を確認する後置検査が規定されていること
- [ ] REQ-057-028 と手順の間で判定基準の二重定義が生じていないこと

## 元learning item / 根拠

- **要約**: coverage 突合で宣言の役割を区別せず集合を結合すると、verification・design 役割の docs 宣言を implementation 集約と誤認し、配布物宣言 cleanup の可否を誤判定する。Case #2824 / PR #2874 の case-run・case-close 両面で観測（初回の役割非区別突合で removable 判定された 2 宣言が、役割フィルタ＋docs/ パスフィルタ適用の再突合で blocked へ反転）。
- **根拠**: REQ-053-023 は docs 側に verification 宣言のみで implementation は配布物側 2 件が唯一の所有（docs 集約未完了）であり、役割を無視した突合では除去安全性を誤判定する。実行時は役割区別突合で docs 集約未完了を認定し、cleanup 前置条件として残置、判定基準を REQ-057-028 行と PR 本文の Design 確定候補へ記録して対応した。
- **再発条件**: ADF-COVERS 宣言の除去・移動判定で役割を区別せず REQ ID の存在のみを突合する場合
- **横展開可能性**: 宣言 cleanup・集約を扱う全 workflow（case-run / case-close / inspect 系）と traceability check の解釈で発生し得る
- **prune 証拠**: inbox.md 2026-09-16 実行分「coverage 突合では役割（implementation / verification / design）を区別せず集合を結合すると誤認が生じる」「coverage 突合で役割を区別しないと verification・design 役割の docs 宣言を implementation 集約と誤認する」の2エントリ（削除前の完全本文は git 履歴の inbox.md @ 795bfb19 を正とする）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, workflow
- **関連Issue**: Case #2824、PR #2874
