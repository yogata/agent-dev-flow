# SPEC確定候補: check_extensions.ts --scenario の TS-006 標準実行手段としての契約化

## 観測内容

check_extensions.ts の --scenario モードが実装済みだが、docs-check/case-run の変更経路 routing 等における標準実行手段としての位置づけが契約化されていない。実行手段が存在しても workflow から参照されない場合、シナリオ検証の実施が属人的判断に残る。

## 影響

- --scenario による検証が実施されない経路が生じ得る
- 導入済み検証資産の活用が進まない

## 課題

TS-006 標準実行手段として integrity-contracts 等へ契約化する。SPEC 内容追加を伴うため case-close スコープ外と見送り記録済み。選定は backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: check_extensions.ts、integrity-contracts.md
- 関連: TS-006、SPEC 確定候補群

## 出典

- 発生日: 2026-08-15
- 取得元: case-close 見送り記録（SPEC確定候補）
- 元 item: intake-2026-08-15-spec-candidate-scenario-mode-ts006-standard.md
- 注記: intake-promote 経路C review で採用。現状の契約状態は backlog-review 分析時に再確認すること
