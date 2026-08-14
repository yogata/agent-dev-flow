# intake: check_extensions.ts --scenario の TS-006 標準実行手段としての契約化（SPEC確定候補 見送り）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 `## SPEC確定候補` 2（case-close Step 3-2 SPEC 確定フロー 処置 (c) 見送り）

## 問題事象

`check_extensions.ts --scenario` モード（TS-006 系 Extension シナリオ S1〜S9 を一括検証）が実装済みだが、docs-check / case-run の変更経路 routing 等における標準実行手段としての位置づけが契約化されていない。

## 影響

- 実行手段が存在しても workflow から参照されない場合、シナリオ検証の実施が属人的判断に残る

## 発生局面

case-close（Step 3-2 SPEC 確定フローの確定判断）

## 検知方法

`--scenario` 実行（9/9 PASS、PR 2116 テスト結果）と各 workflow 定義の参照確認。

## 見送り根拠（case-close Step 3-2 処置 (c)）

- 本候補は integrity-contracts / 各 command・skill SPEC への新規契約追加であり、case-close の SPEC 確定フローが許す編集（draft→accepted 昇格）の範囲外
- docs 編集は本 remediation では OU-005（同期済み）・OU-007（cleanup）にスコープ分けされているため、spec-save（UPDATE）での対応が正規経路

## 想定される対応方向

- integrity-contracts（Workflow × 使用ツールマトリックス）等へ `--scenario` の標準実行契約を追加（spec-save UPDATE）
- 選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`, `docs/specs/integrity/integrity-contracts.md`

## 出典引用

PR 2116 本文 `## SPEC確定候補` 2 より:

> checker --scenario モードの位置づけ: check_extensions.ts --scenario を TS-006 系 extension 検証の標準実行手段（docs-check / case-run の変更経路 routing 等）に組み込むかどうかの契約化

## タグ

#intake #spec-candidate #integrity-contracts #extension-migration #epic-2099
