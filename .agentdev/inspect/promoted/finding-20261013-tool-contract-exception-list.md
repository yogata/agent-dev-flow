# custom-tool-contracts 両版等価性の例外列挙漏れ（commitHash 版差異）

- 出所: inspect-docs 20261013T090730Z DS15（backlog-auto stage 1）
- 種別: 表現是正（例外明示リストの列挙漏れ解消）
- 対象: docs/designs/responsibilities/custom-tool-contracts.md:48,70-71

## DS15: 両版等価性の例外列挙漏れ

- category: Design（両版等価性の例外列挙漏れ）
- target: `docs/designs/responsibilities/custom-tool-contracts.md:48,70-71`
- evidence: :48 が「pr_merge はローカル版の取り込み確認情報として commitHash…を受理する。ローカル版では必須として検証し（実在確認）、GitHub 版では受理してマージ動作には使用しない」と版差異を宣言する。一方 :70 は「両版は操作名、入力構造…失敗の意味を同値とする」、:71 の例外明示リストは「ローカル版追跡Issueの通常ラベル非許容」「ローカル版 case の再オープン拒否」「isDraft の値差異」の3件のみで、commitHash の検証・不使用差異が列挙されていない。受理動作の版差異は :71 が列挙を求める種別（受理条件差）に該当する。
- severity: low
- confidence: medium
- source_of_truth: REQ-011-024（物理写像差異の宣言。custom-tool-contracts:60 が宣言義務の先例として適用）、REQ-111-011（commitHash 機構の源と推定）
- recommended_route: 表現是正候補。:71 の例外明示リストへ commitHash 受理差異を追記。
- ng_classification: 今回修正対象候補（:48 の契約は今回 delta で追加）。
- notes: REQ-011 には pr_merge 固有の要件行がなく（REQ-011-030/031/032 は pr_read/pr_create/pr_update）、commitHash 契約の REQ 源が REQ-111-011 であることの明示が無い点も附随観察。

## 処置方針

1. custom-tool-contracts.md:71 の例外明示リストへ、commitHash の検証・不使用差異（ローカル版は必須検証〔実在確認〕・GitHub 版は受理してマージ動作に不使用）を受理条件差として追記する
2. 附随観察: commitHash 契約の REQ 源（REQ-111-011 と推定）の明示も合わせて検討

## 処置判断の根拠（inspect-promote 2026-10-13）

- :48 の版差異宣言と :71 の例外明示リスト3件を現物実読で突合確認（commitHash 差異の未列挙は一意に確定）
- 修正は一意（例外リストへの追記）。REQ-011-024 の版差異宣言義務の先例（:60）により列挙義務の所在は確定

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: custom-tool-contracts.md:48・70-71 の現物実読で列挙漏れを再確認（例外リストは「ラベル非許容」「再オープン拒否」「isDraft 値差異」の3件で commitHash 未列挙）。
- Jev 評価: defer（0.59）に対し promote を最終判断（differenceReason: semantic_disagreement）。列挙漏れは現物突合で一意確定・修正一意であり、promote 基準〔明確な不整合・正規情報源特定済み・本質的競合なし〕に適合。REQ 源の推定は是正文言の付帯情報で列挙義務違反の成立に影響しない（観測 20261013T094827Z-5dc0 d14）。
