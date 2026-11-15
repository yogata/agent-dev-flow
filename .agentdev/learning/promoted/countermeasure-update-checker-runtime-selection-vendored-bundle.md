# checker 実行ランタイム選択規律（vendored bundle → bun）の Design 補強

## 背景

agentdev-textlint-guard の vendored engine bundle（textlint-engine.bundle.json）を含む checker ラッパを node --experimental-strip-types で実行したところ、node v26 の既定 ESM loader が blob: URL 動的 import を fail-closed ブロックし gate が検査不能（exit 1・0 inspected）となった（Case #3970）。checker 依存 API と実行経路の使い分けの知見も蓄積している（Case #3988: distribution boundary は bun import wrapper・check_integrity は bun run 直実行）

## 問題

checker-execution-contracts.md「安定実行経路」節（L183-187）と ESM 互換性要件（L189-194）に「vendored bundle の blob: URL 動的 import は node 既定 ESM loader でブロックされる・vendored bundle 含有 checker のラッパ実行 command は bun を指定する」規律が不在（全文 grep で blob:・vendored 0 件実測）。L229 に「Bun ランタイム API（Bun.YAML 等）に依存する checker は bun 経由」は実在するが vendored bundle 規律は未収録

## 望ましい変更

checker-execution-contracts.md「安定実行経路」節へ実行ランタイム選択規律を追記する: (1) vendored bundle（blob: URL 動的 import）を含む checker は bun 経由で実行する（node は vendor 非依存 checker 向けの選択肢）(2) checker の依存 API（Bun.YAML・import.meta.path・require・vendored bundle）と実行経路の対応表

## 対象範囲

### 対象

- checker-execution-contracts.md「安定実行経路」節（実行ランタイム選択規律の追記）

### 対象外

- vendored bundle 生成機構（build:engine）の変更
- node ESM loader の仕様変更対応

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md「安定実行経路」節 | 実行ランタイム選択規律（vendored bundle 含有 → bun）と checker 依存 API 別経路対応表の追記 |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: docs/designs/integrity/checker-execution-contracts.md（L183-229・安定実行経路節・ESM 互換性要件・L229 Bun API 依存 checker の bun 経由規定は実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: vendored bundle の blob: URL import に対する実行ランタイム選択規律の収録欠落

## 制約

- 安定実行経路の標準（stdout 証跡を要する checker の module import 経由）は vendored bundle 非依存 checker の規律として維持
- blob: import の許可・不許可は node/bun のランタイム仕様差であり、checker 側での双対応実装は本変更の対象外

## 受け入れ条件

- [ ] 「安定実行経路」節に vendored bundle 含有 checker の実行ランタイム選択規律（bun 指定）が収録されていること
- [ ] checker 依存 API と実行経路の対応表が整備されていること
- [ ] 後続の textlint gate 実行でランタイム誤選択による検査不能が発生しないこと

## 元learning item / 根拠

- **要約**: vendored bundle を含む checker の node 経路実行が blob: URL import ブロックで検査不能になる（2 件）
- **根拠**: checker-execution-contracts.md L183-229 のファイル読取実測で vendored bundle 規律不在（全文 grep で blob:・vendored 0 件・2026-11-15 + STEP-4 review 再確認）・Case #3970・#3988 の実測観測
- **再発条件**: node --experimental-strip-types で vendored bundle を import する checker ラッパを実行する条件
- **横展開可能性**: TS checker の実行経路選択（bun/node）に依存する機械工程・gate spec 構成全般に適用可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
