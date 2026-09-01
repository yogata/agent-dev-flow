# integrity-contracts の archive レイアウト記述と REQ-002-043 の記述緊張（1件）

## 背景

docs/designs/integrity/integrity-contracts.md L528/536 に archive 内 `skills/japanese-tech-writing/**` の格納記述が現存し、REQ-002-043（知識非保持原則・配布成果物は一般規則のみ保持）と字面上の緊張が継続している。

## 問題

記述が REQ-002-043 の趣旨（日本語技術文書規範の配布物への同梱を前提としない）と読み取れる状態で、解釈が分岐する。

## 望ましい変更

archive レイアウト記述を現行の third-party 管理方針（skills.yaml 宣言・取得機構）と整合する形へ現行化する。REQ 側を正とする source-of-truth priority に従い、記述側を修正する。

## 対象範囲

### 対象

- docs/designs/integrity/integrity-contracts.md L528/536 の archive レイアウト記述

### 対象外

- REQ-002-043 本体（REQ 側は変更しない）
- third-party-sync 機構自体

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/integrity/integrity-contracts.md | archive レイアウト記述の現行化 |

## 既存対策確認

- **確認結果**: 既存対策なし（記述現行のまま）
- **ギャップ分類**: fix gap

## 制約

- REQ 側を正とし、Design 記述側のみ修正する
- japanese-tech-writing の取得運用（third-party-sync）の現状と整合させる

## 受け入れ条件

- [ ] archive レイアウト記述が REQ-002-043 と字面・趣旨の両面で緊張しない
- [ ] third-party 管理の現行方針と整合している

## 元learning item / 根拠

- **根拠**: integrity-contracts.md L528/536 の記述現存確認（L516-536 検証済み）
- **横展開可能性**: archive レイアウト契約の運用

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
