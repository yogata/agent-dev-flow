# 評価レポート

## メタデータ
- **実行日時**: 2026-09-21 01:58
- **対象エントリ数**: 2件（inbox: 2件, deferred: 138件〔棚卸し全件走査対象〕）
- **問題クラス数**: 1（未分類のみ。両エントリは根本原因・再発条件・予防策が異なる別問題のため単独エントリ扱い）
- **実行特性**: backlog-auto stage 2 learning 系統（v4.0.0 cutover 完了後初回）。deferred.md 全 138 エントリの棚卸し（v3 固有 prune 候補抽出・報告のみ）を付随実施

## 問題クラス一覧

### 未分類エントリ1: Definition PR 期待値（NG セット完全一致・autogen 0）の事前実測欠落

- **根本原因**: Definition PR 作成時の品質検証が UTF-8 健全性・期待内容出現回数の文字列検証にとどまり、構成済み tree（branch HEAD）全体に対する機械チェック（check_integrity・autogen gate・traceability）を実行していなかった
- **再発条件**: REQ 行追加や Design frontmatter 言及を含む docs 変更の Definition PR で、PR 作成時検証が文字列検証のみにとどまる場合
- **予防策**: case-open の Definition PR 作成手順へ「PR 本文期待値は branch HEAD 実測（check_integrity・autogen・traceability）で確定する」前置の追加

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（Case #3042・PR #3043） |
| 影響度 | 3/5 | 受入検査で NG 54→56・autogen 0→1 の乖離、解消の子 Issue 2 件割当て（#3044/#3045）。ただし検知・解消機構は機能し merge 阻止に至らず |
| 横展開性 | 3/5 | REQ 行追加・Design 変更を伴う Definition PR 作成全般。v4 内部 lifecycle の case-open 段階で同構造が残存 |
| 反映先明確度 | 4/5 | 反映先が definition-pr-and-idempotency.md に特定され、前置手順として具体化可能。inbox エントリの13フィールドが自足的に整備済み |
| 自動化適性 | 3/5 | 手順明文化 + 既存 checker 実行の徹底。case-open 手順内での実行義務化で対応 |
| プロジェクト固有知識再利用性 | 3/5 | check_integrity・autogen gate 実行契約と結びつく固有手順知見 |
| 再発可能性 | 4/5 | REQ 行追加を伴う Definition PR は今後も発生。期待値宣言の事前実測は未整備のまま |
| 費用対効果 | 4/5 | 既存配布 reference への前置追記のみで予防可能 |
| **加重合計** | **25/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap）→ 採用。乖離検知（case-ready 受入検査・増減理由型記録）は機能したが、PR 作成時の期待値実測前置は未整備（definition-pr-and-idempotency.md に期待値・実測・check_integrity の記述なしを機械確認済み）

### 未分類エントリ2: 境界 close の AUTOGEN drift 再生成処置が直接 commit 禁止制約と競合（warn 先送り）

- **根本原因**: 計測日期待値が committer date（%cI）導出のため squash merge の日付跨ぎで drift する機構自体は Design 正典化済みだが、正典化された処置「drift 検出時は generate_indexes で再生成してから green 判定」が、境界が main 直接 commit を禁止する局面（tag 作成直前の RC 境界等）では実行できないという運用ギャップが未規定
- **再発条件**: squash merge を伴う境界 close が、最終実装 PR の AUTOGEN 再生成実行日とは異なる日付（local TZ 深夜跨ぎ等）で完了する場合
- **予防策**: (1) 再生成不能局面では drift を時間依存の測定誤差として増減内訳記録付き warn 扱いとする明文化 (2) 境界 close の merge 完了を再生成と同一日内に収める運用 (3) tag 実施側へ次回 docs commit の generate_indexes で解消する旨の引継ぎ明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（Case #3042・PR #3047/#3048/#3049 merge 後） |
| 影響度 | 2/5 | warn 先送り。tag 対象ツリーは不変で健全な結果に帰着 |
| 横展開性 | 3/5 | squash merge を伴う境界 close 全般。深夜跨ぎ merge は現実的に発生し得る |
| 反映先明確度 | 4/5 | autogen-freshness-gate Design「計測日driftの発生機構」節の処置補遺 + docs-and-design-promotion.md gate 節。予防策候補が具体的 |
| 自動化適性 | 2/5 | 判断規則の明文化が主体（再生成可否の事前判定） |
| プロジェクト固有知識再利用性 | 3/5 | RC 境界・境界 close 運用の固有知識。第17段実践（CR-002 正当化）の前例を規則化する素材 |
| 再発可能性 | 3/5 | 深夜跨ぎ squash merge は発生し得る。ただし直接 commit 禁止境界は RC 境界等に限定的 |
| 費用対効果 | 3/5 | Design 1 節 + 配布 reference 数行の追記で運用ギャップ解消 |
| **加重合計** | **21/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap / guardrail insufficiency）→ 採用。drift 機構 3 種・gate 手順は Design・配布 reference に正典化済み（PR #3043/#3049）だが「再生成不能局面での扱い」は Design drift 節・gate 節とも未規定（本文確認済み）。第17段の正規経路実践（case-run 成果物 commit としての再生成・CR-002 正当化）を規則化する補遺として昇華価値あり。優先度はエントリ1より低い（影響度差を反映）

### 重複判定（既存昇華済み成果物・deferred との突合）

- エントリ1: 過去 promoted `measure-update-case-open-design-declaration-followup.md`（missing-design 0 件ゲート化・PR #3049 反映済み）は traceability 縦の宣言追随、`command-case-run-autogen-preregeneration.md` は再生成 commit 前置であり、いずれも「PR 本文期待値の実測確定」という本エントリの本質をカバーしない。deferred L2503（Definition 変更によるテスト期待文言陳腐化）は別問題クラス。duplicate なし
- エントリ2: 過去 promoted `measure-update-autogen-measure-date-committer-drift.md`（第16段正典化の直接由来）は機構明示・gate 必須実行・再生成による解消までをカバー。本エントリはその処置が実行不能になる境界ケース（直接 commit 禁止局面）の扱いという残存デルタに絞られ、機構論と重複しない。deferred L1411（date rollover 判定の運用）は相補関係。duplicate なし

## promote 時prune結果

- **対象エントリ数**: 2件（inbox 由来）
- **prune実施**: あり（staged 2件。deferred.md 追記・検証後に除去。証拠は採用済み成果物「元learning item / 根拠」セクションへ全文保存）
- **prune候補**: 2件
- **prune却下**: 0件

## 全体傾向
- 両エントリとも第16段 RC fixes 由来で、AUTOGEN drift 機構の正典化（第16段）と正規経路実践（第17段）の間に残った「適用境界の穴」を記録する性格が共通する（処分区分5: 既存対策の更新）
- 8軸スコアは 25/40・21/40 と中程度。単発ながら反映先明確度・費用対効果が高く、既存正典への小規模な補遈で解消する
- deferred.md 138 エントリの大半（103 件）は v4 でも該当し続ける環境挙動（Windows/bun/git/gh）・checker 運用・委譲・QG 系知見であり、v3 固有と断定できる構造消滅エントリは 10 件（無条件 7・条件付き 3）に限定される

## Decision候補除外記録
- **対象item**: エントリ1（Definition PR 期待値事前実測）
- **除外理由**: 運用ルール（手順の明文化。技術判断不在）
- **根拠事実**: 予防策が case-open 配布 reference の手順前置追加であり、アーキテクチャ上の決定・技術選定を含まない
- **代替反映先候補**: 配布skill reference（definition-pr-and-idempotency.md）
- **対象item**: エントリ2（drift 再生成不能局面の扱い）
- **除外理由**: 仕様変更のみ・運用ルール（gate 判定基準の補遺。技術判断不在）
- **根拠事実**: 現行 gate 契約は不変で、境界ケースの扱い（warn 判定・引継ぎ記録）の追記のみ。author date 基準切替等の技術判断は Design が既に「将来の評価対象」として記録済み
- **代替反映先候補**: Design（autogen-freshness-gate.md drift 節）・配布skill reference（docs-and-design-promotion.md）

## adversarial-review 記録（STEP-4）

- **発動条件判定**: 発動（default-on。skip 条件〔inbox 1 件のみかつ既存対策重複確実、または inbox 空〕非該当 — 2 エントリで既存対策との重複は確実ではない）
- **レビュー戦略**: 対象=本レポートの処分判定と棚卸し候補選定。目的=(a) 既存対策の過大評価による誤廃棄 (b) v4 で該当し続ける知見の誤候補化（汎用知見混在チェック） (c) 問題クラス誤統合 (d) 昇華不要ノイズの promoted 混入の検出。証拠=Design・配布 reference の本文、custom-tool-contracts、過去 promoted 成果物、git 履歴
- **challenge（2系統の独立 stream）**:
  - stream-1（処分判定妥当性）: F1-1 区分3と区分5の境界（→ 区分5妥当: PR #3049 で追加済みの同 reference 手順への拡張であり fix gap）／F1-2 エントリ2は第17段実践により廃棄とする余地（→ 前例は知識だが規則ではない。Design drift 節・gate 節とも再生成不能局面を未規定のため採用維持。優先度低の注記を付す）／F1-3 単発のため deferred が適切では（→ 13フィールド自足・予防策具体化済み・再評価条件不要のため採用維持）
  - stream-2（棚卸し候補妥当性）: F2-1 L1725 の前提解消は pr_update の現行契約存在で検証要（→ custom-tool-contracts.md L36/L42 で pr_update〔title/body 部分更新〕が基本操作と確認・候補確定）／F2-2 L-002 の v4 正典化は横断契約 Design の集約所有で検証要（→ v4-responsibility-boundaries.md L41「HITL 判断確定原則」節で確認・候補確定）／F2-3 L2676 の技法混在（→ 条件付き候補として両論併記）／F2-4 worktree 系エントリの現行性（→ agentdev-git-worktree が v4 配布スキルとして存在するため実装 worktree 系は候補外で妥当）
- **convergence**: inbox 2 件は採用（区分5）で合意。棚卸し候補は無条件 7 + 条件付き 3 で合意
- **convergence audit**: 合意候補を削除禁止基準（判断基準・技術知識・プロジェクト固有知識を含むエントリは削除不可）で再検査した結果、L601（ADR frontmatter）は「対象文書の実形式を確認してから完了条件を書く」という判断基準を含み削除禁止基準に触れる余地があるため無条件候補から条件付き候補へ降格した。その他の無条件候補は適用先の消滅または正典化済みにより維持
- **unresolved**: なし（条件付き候補 3 件は親でのユーザー承認判断に委ねるものであり本 workflow の unresolved ではない）

## 自律確定記録（STEP-5 証跡）

- **エントリ1**: 確定処置 = promote（採用、処分区分5）。主要根拠: (1) 反映先ファイルに期待値実測前置が不在であることを grep で機械確認 (2) 8軸 25/40・反映先明確度 4 (3) 再発条件が v4 の標準Definition PR 作成で現実的に残存。HITL 不要理由: 親委譲 CONTEXT が「廃棄または採用の自律確定」を明示授権し、未整備ギャップの機械根拠が取得済みで処置が一意に確定できる
- **エントリ2**: 確定処置 = promote（採用、処分区分5）。主要根拠: (1) Design drift 節・docs-and-design-promotion.md gate 節の本文に再生成不能局面の扱いが不在であることを機械確認 (2) 第17段実践（CR-002 正当化）が明文化すべき正規経路を提供 (3) 過去 promoted（committer-drift）と機構論が重複しない残存デルタに範囲を明示。HITL 不要理由: 同上（影響度低を反映し優先度低と注記）
- **破壊的変更**: なし（inbox.md は正規の deferred 移動手続によるクリアのみ。deferred.md からの削除は今回 staged 2 件〔追記分〕のみで、既存 138 エントリは不変）

## deferred 棚卸し結果（v3 固有 prune 候補抽出・報告のみ）

- **性質**: 削除実行は本 workflow では行わない。候補リストは親でのユーザー承認後に削除される（MUST NOT: deferred.md からの既存エントリ削除）
- **3分類集計（全 138 実エントリ）**: v3 固有 prune 候補 10（無条件 7・条件付き 3）/ v4 でも該当 103 / 再評価条件未充足 25
- **詳細**: 完了報告に全候補リスト（行範囲・カテゴリ・根拠・汎用知見の有無）を含む
