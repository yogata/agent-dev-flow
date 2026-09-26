---
title: LLM 送信本文の識別子破損疑いは read-back 目視で断定せず filesystem 実在性と ID digit 突合で検証する
created: 2026-09-27
updated: 2026-09-27
---

# LLM 送信本文の識別子破損疑いは read-back 目視で断定せず filesystem 実在性と ID digit 突合で検証する

## 知識内容

issue_create / issue_update / pr_create 等で長文 body を送信した後の read-back 目視で「識別子の連続文字欠落・特定語の欠落」等の破損を疑った場合、目視の再読や LLM による文字列照合で断定してはならない。検証対象の読取も検証手段の記述も同一の LLM 出力経路を通るため循環検証となり、破損を過大にも過小にも報告し得る（Case #3158 では検証スクリプト側に破損形を書き込んだつもりが正形と同一文字列になっていた）。

破損疑い時の標準手順は機械検証に置き換える:

1. 本文から抽出したトークン（識別子・パス）の filesystem 実在性を fs.existsSync で照合する
2. REQ/DEC/ACT 等の ID digit（数値）を本文と正規参照先で突合する（数値は文字列破損に対して耐性が高い）
3. 検証スクリプト内の期待文字列も破損し得ることを前提に、正形はリポジトリ実ファイルから参照する

issue-operation-safety.md の read-back 規則（Tool 検証済み成功の信頼）は循環検証問題をカバーしない（grep 実証）。read-back 目視の再実施は循環の再発である。

## 適用条件

- issue_create / issue_update / pr_create 等で長文 body を送信し、送信後検証で本文破損を疑う場合
- read-back された本文の目視確認で「文字欠落・語欠落」等の破損疑いが生じた場合
- 検証スクリプトや期待値文字列を LLM 出力経路で作成している場合

## 適用対象

- case-open / case-ready / case-run の Issue・PR 本文照合手順
- agentdev-issue-management（Issue 操作の安全手順）の read-back 照合
- 対象外: agentdev_gh 側の VERIFY 契約の変更（Tool 操作契約どおり）

## 根拠

- Case #3158（case-open STEP-2）: Root Case Issue 本文を issue_create → issue_update 後の read-back 目視で破損疑いが連発。issue_read read-back と gh CLI 本文取得の突合で「検証スクリプト側の破損による誤検出」と確認し、fs.existsSync + REQ/DEC/ACT ID digit 突合で本文健全と確定した（PR #3159、Issue #3158）。

## 関連知識

- 配布側反映: agentdev-issue-management references/issue-operation-safety.md の operation-failed 時手順域への機械検証誘導（RU-0147 で要件化。将来 Case で反映）
- [checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（checker 出力の機械解析における別系統の破損知識）
