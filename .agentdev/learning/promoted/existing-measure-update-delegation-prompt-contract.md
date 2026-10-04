# 委譲 prompt の cleanup 権限記述の契約整合（case-open は draft/RU を削除しない）

## 背景

orchestration からの case-open 委譲 prompt に「On success: perform the workflow's own cleanup criteria for draft and source RU (case-open owns RU removal on success)」の指示が含まれたが、現行契約では case-open は draft / RU を削除しない（agentdev-workflow-case-open SKILL.md「行わない副作用」、capture-and-completion.md STEP-6-2、REQ-030-007。削除は case-ready が実行）（Root Case #3424・Definition PR #3426・RU-20261004-07）。

## 問題

委譲 prompt 生成側が case-open の cleanup 権限を旧設計または誤記として宣言しており、workflow 契約の正（case-ready 所有）を反映していない。契約を知らない委譲実行者は誤って draft/RU を削除し得る。

## 望ましい変更

case-open 委譲 prompt テンプレート（orchestration 側生成面）から「case-open owns RU removal」相当の文言を除去し、cleanup 権限の記述を workflow 契約と突合する手順を委譲 prompt 生成側に設ける。兄弟 Case の委譲にも同一文言が含まれる可能性の確認も行う。

## 対象範囲

### 対象

- case-open 委譲 prompt を生成する orchestration 側（case-auto / backlog 由来の委譲指示テンプレート）
- 委譲 prompt の契約整合確認手順

### 対象外

- REQ-030-007 の契約自体（現行維持）
- case-open workflow skill 本文（契約は正しく記載済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | case-auto orchestration 側の委譲 prompt 生成手順 | cleanup 権限文言の除去・契約突合の手順化 |

## 既存対策確認

- **確認結果**: 既存対策なし（委譲指示面の整合確認手順なし）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 委譲 prompt の指示と workflow 契約の突合手順が存在しない

## 制約

- 委譲実行者側の「契約側を正として扱う」運用は維持する（本件は生成側の是正）

## 受け入れ条件

- [ ] 委譲 prompt テンプレートから case-open 所有でない cleanup 権限文言が除去される
- [ ] 委譲指示と workflow 契約の突合手順が整備される

## 元learning item / 根拠

- **要約**: case-open 委譲指示の cleanup 権限記述が現行契約（REQ-030-007・削除は case-ready 所有）と乖離（1件）
- **根拠**: Root Case #3424・PR #3426（契約を正として draft・RU を保持し削除を実施しなかった記録）
- **再発条件**: orchestration 側が workflow 契約と乖離した cleanup 権限を委譲 prompt に埋め込む場合
- **横展開可能性**: 全 workflow 委譲 prompt 生成面

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし
