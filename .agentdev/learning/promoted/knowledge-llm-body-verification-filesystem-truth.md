# LLM 送信本文検証の循環検証回避（filesystem 実在性 + ID digit 突合）

## 背景

Case #3158（case-open STEP-2）で Root Case Issue 本文を issue_create → issue_update した後の read-back 目視で「REQ-090-002 の連続文字欠落、特定語の欠落」を疑う事象が連発した。 検証スクリプト側に破損形を書き込んだつもりが正形と同一文字列になっており、検証対象の読取も検証手段の記述も同一の LLM 出力経路を通る循環検証が発生していた。

## 問題

- 目視・文字列照合ベースの検証は循環し、破損を過大にも過小にも報告し得る（検証対象と検証手段が同じ出力経路を通るため区別不能）
- issue-operation-safety.md の read-back 規則（Tool 検証済み成功の信頼）は循環検証問題をカバーしない（grep 実証）。 docs/knowledge/ に同主題なし

## 望ましい変更

長文本文の送信後検証で破損を疑った場合の標準手順として「抽出トークンの fs.existsSync 一致 + ID digit 突合（数値は破損耐性が高い）」の機械検証を確立する。 検証スクリプト内の期待文字列も破損し得ることを前提に、正形をリポジトリ実ファイルから参照する。

## 対象範囲

### 対象

- issue_create / issue_update / pr_create 等で長文 body を送信する全工程（case-open / case-ready / case-run の Issue・PR 本文照合手順）
- agentdev-issue-management（Issue 操作の安全手順）

### 対象外

- agentdev_gh 側の VERIFY 契約の変更（Tool 操作契約どおり）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書候補） | 循環検証回避の機械検証手順（fs.existsSync + digit 突合） |
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | read-back 照合で破損を疑った場合の機械検証手順への誘導 |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし（issue-operation-safety.md の read-back 規則は循環検証問題をカバーせず）
- **ギャップ分類**: なし（新規知識）
- **ギャップ詳細**: LLM 出力経路を共有する検証の循環性リスクとその回避手順が未整備

## 制約

- 目視の再読ではなく機械検証で判定する（read-back 目視の再実施は循環の再発）

## 受け入れ条件

- [ ] 破損疑い時の判定が filesystem 実在性 + 数値突合の機械検証に置き換わること
- [ ] 検証スクリプトの期待値はリポジトリ実ファイルから参照することが手順化されること

## 元 learning item / 根拠

- inbox 2026-09-26「LLM 送信本文の識別子破損疑いは read-back 目視で断定せず filesystem を truth source とする機械検証で判定する」（Case #3158、PR #3159、Issue #3158）: issue_read read-back と gh CLI 本文取得の突合で「検証スクリプト側の破損による誤検出」と確認、fs.existsSync + REQ/DEC/ACT ID digit 突合で本文健全と確定
