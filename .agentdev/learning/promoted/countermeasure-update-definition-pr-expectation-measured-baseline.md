# Definition PR 期待値宣言の事前実測前置（branch HEAD 機械チェックによる期待値確定）

## 背景

第16段 RC fixes（Case #3042）の case-ready で、Definition PR #3043 は PR 本文期待値として「check_integrity NG セット baseline 完全一致・autogen 0」を宣言して merge されたが、merge 後受入検査（@97953f3e）で NG 54→56（IR-061 AUTOGEN 不整合・workflow-status-prohibition ヒューリスティック NG の 2 件追加）と autogen 鮮度違反 0→1 を観測した。乖離は増減理由型（両方向差分: 除去 0・追加 2・総数 962 不変 = 2 check の ok→ng 反転）で記録され、解消責務は子 Issue #3044（索引再生成）・#3045（checker 実装と文言調整）へ割当てられた。case-open の deviation capture（commit c8d33c8e）由来の学びである。

## 問題

Definition PR 作成時の品質検証が UTF-8 健全性・期待内容出現回数の文字列検証にとどまり、構成済み tree（branch HEAD）全体に対する機械チェック（check_integrity・autogen 鮮度 gate・traceability）が実行されていない。REQ 行追加（REQ-001-069 による req-health-metrics AUTOGEN 期待値 64→65）と Design 節追加文言（frontmatter キー列挙の共起）が checker 検出パターンに掛かることを事前予測できず、PR 本文の期待値宣言と merge 後実測が乖離した。受入検査側の検知・解消機構は機能したが、期待値宣言の正確性は merge 後でなければ検証できない状態になっている。

## 望ましい変更

case-open の Definition PR 作成手順に「PR 本文へ期待値を宣言する前に branch HEAD 実測で check_integrity・check_autogen_freshness・traceability を実行し、期待値を実測値で確定する」前置を追加する。文字列検証（UTF-8 健全性・期待内容出現回数）は前提として維持し、tree 全体の機械チェックをその前に実行する順序を明示する。

## 対象範囲

### 対象

- case-open の Definition PR 作成手順（品質検証の実行順序と期待値確定の前置）

### 対象外

- case-ready 受入検査・deviation capture 機構（現行どおり維持。本変更は merge 前の期待値正確性向上が目的）
- check_integrity・check_autogen_freshness・traceability の各 checker 実装（既存実装を利用するのみ）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | Definition PR 作成手順へ期待値実測前置（branch HEAD での check_integrity・autogen・traceability 実行と期待値の実測確定）を追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | Root Case 本文の受入検査節に記載する期待値の由来（実測）明記の検討 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（PR #3049 で REQ 行変更を伴う Case の missing-design 0 件ゲートを追加済み）、docs/designs/integrity/autogen-freshness-gate.md（drift 機構 3 種明記、PR #3043）、src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（AUTOGEN 鮮度 gate 節、PR #3049）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: missing-design 0 件ゲート（traceability 縦）と AUTOGEN gate の境界 close 時実行は整備済みだが、Definition PR 作成時点で branch HEAD の check_integrity NG セット・autogen 違反数を実測して PR 本文期待値を確定する前置は definition-pr-and-idempotency.md に存在しない（期待値・実測・check_integrity の記述なしを機械確認済み）

## 制約

- checker 実行は case-open の実行形態契約（bun 実行ランナー・repo root 起 cwd）に従う
- baseline 比較の前提（baseline @60120646 detached worktree 等の参照先）は既存の増減理由型記録運用を維持する
- 期待値実測の実行により case-open の所要時間は増加する。実行対象は REQ 行追加・Design 変更を伴う Definition PR に限定する判断は req-define が行う

## 受け入れ条件

- [ ] definition-pr-and-idempotency.md の Definition PR 作成手順に、PR 本文期待値の宣言前に branch HEAD 実測（check_integrity・check_autogen_freshness・traceability）で期待値を確定する前置が記載されていること
- [ ] 前置の手順が既存の文字列検証（UTF-8 健全性・期待内容出現回数）と排他的でなく、その前に実行する順序として明示されていること

## 元learning item / 根拠

- **要約**: Definition PR の期待値宣言（NG セット完全一致・autogen 0）が merge 後実測で +2 NG・+1 autogen 違反と乖離した。PR 作成時検証が文字列検証のみで branch HEAD 全体の機械チェックを含まないため
- **根拠**: Case #3042・Definition PR #3043（merge 後受入検査 @97953f3e で NG 54→56・autogen 0→1 を観測）。乖離は REQ 行追加（REQ-001-069）と Design frontmatter キー列挙文言が checker 検出パターンに掛かったことによる。case-open deviation capture commit c8d33c8e、解消子 Issue #3044/#3045
- **再発条件**: REQ 行追加や Design frontmatter 言及を含む docs 変更の Definition PR で、PR 作成時検証が文字列検証のみにとどまる場合
- **横展開可能性**: REQ 行追加・Design 節追加を伴う Definition PR 作成全般。v4 内部 lifecycle（case-auto 駆動の case-open 段階）で同構造が残存する

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, integrity
- **関連Issue**: #3042、PR #3043、#3044、#3045
