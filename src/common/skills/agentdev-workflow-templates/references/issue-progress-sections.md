---
title: Case Issue 工程記録テンプレート（進行状況・結果セクション）と review_dispositions 消費
---

<!-- 親: agentdev-workflow-templates SKILL.md「Case Issue 工程記録テンプレート」節と「review_dispositions の消費」節から参照される詳細仕様（遅延読み込み）。 -->

# Case Issue 工程記録テンプレート（進行状況・結果セクション）

Case Issue 本文テンプレートに、工程記録の「進行状況」「結果」セクションを定義する。
セクション名・順序・項目様式の正は `workflows/issue-lifecycle-records` Design（Case Issue 工程記録モデル）であり、本節はテンプレート投影のセクション形式を提供する。

## 対象テンプレートと配置

| テンプレート | 常設セクション | 条件付きセクション |
|---|---|---|
| `templates/case-open/root-case.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加。章を常設しない） |
| `templates/case-ready/root-case.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加。章を常設しない） |
| `issue_desc_feature.md` / `issue_desc_bug.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |
| `issue_desc_epic.md` | 目的、対象範囲・対象外、実行構成、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |
| `issue_desc_child.md` | 親Epic: #N（冒頭行）、目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |

## セクション仕様

- セクション見出しは「進行状況」「結果」とし、進行状況は `<!-- 【必須】 -->` マーカー付きの必須セクションとする。結果は完了・中止確定時にのみ作成する非常設セクションであり、起票時の本文には含めない
- 「進行状況」は 正規状態（Root Case のみ。open、ready、running、blocked、review、closed、cancelled の7値域。値の正は workflows/lifecycle-state-machine Design）と 開始日時・終了日時 を key-value 行（`- {key}: {value}`）で保持する。Child Issue は開始日時・終了日時のみを保持する（子状態は親 Epic の実行構成表が所有する）
- 表示用の進行状態4値、現在工程、担当役割、次の行動、最新記録参照、停止・待機理由は保存しない
- 「結果」は 成果物 と 残件の扱い を key-value 行で保持する。終了状態は進行状況の正規状態が正であり、重複保存しない
- 開始日時は初めて実装または検証に実着手した時刻（case-run で設定）であり、停止・再開で上書きしない。終了日時は Root Case は完了または中止確定時、Child は completed 確定時にのみ設定する
- 完了判定は case-close 等の判定主体が完了条件と証拠を照合して確定し、実行の申告だけで完了扱いにしない。case-run は完了条件チェックボックスを更新しない
- 本セクションは新規作成 Issue にのみ適用し、既存 Issue への遡及適用は行わない

# review_dispositions の消費（Issue 本文への転記廃止）

case-open / case-ready は draft-data の `review_dispositions` を Issue 本文へ全件転記しない。

- 採用内容（accepted disposition）は実行契約の該当章（対象範囲、実現方針、完了条件の検証方法）へ反映する
- 必要な採否理由（後から判断根拠を確認する必要があるもの）だけをコメントへ残す
- review_dispositions の構造（id、disposition、reason_code、reason、evidence）の正は既存の正規所有先（artifact-contracts Design「req_draft 出力構造」節）のままとし、本変更でスキーマを変更しない。Issue 本文へ転記用の同型セクションを定義しない
