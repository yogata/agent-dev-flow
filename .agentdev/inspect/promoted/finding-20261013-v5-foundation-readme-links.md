# docs/README・guides/README の v5 基盤導線追加

- 出所: inspect-docs 20261011T033142Z GR02（backlog-auto stage 1）
- 種別: 表現是正（README 導線の現行性）
- 対象: docs/README.md:8、docs/guides/README.md:18

## GR02: README 導線の現行性

- category: README 導線の現行性
- target: `docs/README.md:8`、`docs/guides/README.md:18`
- evidence: 両導線は「第4世代（v4）の現在像」を定義する正規文書を案内し、accepted な v5 基盤 REQ-104〜109 / DEC-053〜056 への導線を含まない。
- severity: medium
- confidence: medium
- source_of_truth: accepted DEC-053〜056、REQ-104〜109
- recommended_route: 表現是正候補。v5 基盤への導線を追加するか、移行期の v4 実行契約維持と v5 基盤確定を併記する。
- ng_classification: 今回修正対象候補（v5 delta 由来）。
- notes: DEC-055 は v5 実現確定まで現行実行契約を維持する。v4 文書の実行上の正当性と v5 基盤への導線欠落は分けて扱う。

## 処置方針

1. docs/README.md と guides/README.md の現在像案内に、accepted v5 基盤（REQ-104〜109、DEC-053〜056）および v5.1（REQ-110/111、DEC-057/058）への導線を追加する
2. 移行期の契約維持（DEC-055: v5 実現確定まで現行実行契約を維持）との整合を取り、「現行実行契約の正（v4）」と「v5 基盤の確定状態」を併記する形式を第1案とする

## 処置判断の根拠（inspect-promote 2026-10-13）

- docs/README.md:8「第4世代（v4）の現在像を定義する正規文書への導線は次のとおりである。」、guides/README.md:18「第4世代（v4）の現在像を定義する基準は次の正規文書である。」を現物実読確認（いずれも v4 のみ）
- v5 基盤は accepted（DEC-053〜056・REQ-104〜109）で事実
- 入口 README の導線追加は是正要求の確定であり、具体的配置は backlog-review・req-define で確定

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: docs/README.md:8・guides/README.md:18 の現物実読で v4 のみの案内を再確認。
- Jev 評価: promote（0.52）で最終判断と一致（観測 20261013T094553Z-2a11 d11）。
