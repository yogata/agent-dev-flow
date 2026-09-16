# inspect-docs promoted 20260916T003324Z

> 本ファイルは inspect-promote（2026-09-16 実施、/agentdev/backlog-auto stage 2 inspect レーン経由、--auto なし、直列実行）の分類確定後、promote 採用分（F-01/F-02 の2件）を保存する。元ファイル `.agentdev/inspect/inbox/inspect-docs-finding-20260916T003324Z.md` は inbox から削除済み。reject 2件（旧 20260901T120043Z の F-08/F-09、解消済み）は同ファイルからのエントリ即時削除として処理（却下理由は当該 commit message 参照）。defer 12件は 3ファイル（20260901/20260907/20260914 残置分）として inbox 残置。
>
> - F-01: 移管済み REQ 行への旧行番号引用が Design/Decision 本文に大規模残存（約50ファイル・151箇所）。決定的検出・現物検証済みの明確な不整合
> - F-02: REQ-082 採番の numbering-policy 逸脱・063〜081 欠番の未記録。3シグナル現物検証済み
>
> 以下の本文は診断時点（commit `92c8d28b` 基線）の記録を保存する（「未処理成果物の確認」等の状態記述は当時のもの）。

## 検出事項リスト（promote 採用分）

### [REQ 構造] F-01: 移管済み REQ 行への旧行番号引用が Design/Decision 本文に大規模残存

- **category**: DRIFT（REQ 参照ID整合性: 参照先が取得できない記述）
- **target**: docs/designs/commands/case-auto.md（34箇所）、docs/designs/commands/case-run.md（22箇所）、docs/designs/responsibilities/artifact-contracts.md（16箇所）、docs/designs/commands/case-close.md（9箇所）、docs/designs/local/runtime-package-boundary.md（7箇所）、docs/decisions/DEC-008.md（5箇所）、docs/decisions/DEC-013.md（5箇所）ほか約50ファイル（designs 本文 130箇所 + decisions 本文 21箇所）
- **evidence**: REQ-006 は 9653d8d1「REQ-006 を6実行契約 REQ へ分割」により現行行は 105〜114 のみ、REQ-002 は現行行 001〜046（高位番号 048〜140 は過去の行再編で消滅）。行本体は REQ-029〜035 系等へ移管済みで、Design の ADF-COVERS 宣言ヘッダーは現行行（REQ-032-xxx/REQ-035-xxx 等）へ更新済み（designs の ADF-COVERS 行における欠落行参照は 0件）だが、本文の根拠括弧引用が旧行番号のまま残存。具体例: docs/designs/commands/case-close.md L84「### Epic Wave クローズ（REQ-006-021/022/023/027）」、docs/designs/responsibilities/artifact-contracts.md L91「（REQ-002-103）」、docs/designs/commands/case-auto.md L184「（REQ-006-014, REQ-006-024）」。現行根拠文脈 151箇所・67行ID（REQ-002系 23行ID・REQ-006系 38行ID 中心。履歴文脈（retired/廃止/旧/移管明示）58箇所は対象外、REQ-028系・REQ-010-053 はすべて履歴文脈）
- **severity**: medium / **confidence**: high（機械検出 + 個別サンプル目視確定 + git 履歴による移管経路確認）
- **source_of_truth**: 現行 REQ（REQ-002/REQ-006 の現行行体系と REQ-029〜035 への移管結果）を正とし、Design/Decision 側の旧行番号引用を検出事項とする
- **recommended_route**: UPDATE（旧行番号から現行所有行への付け替え一括是正。cleanup モデル処置候補: REFERENCE）。intake inbox の `2026-09-15-traceability-unknown-req-refs-existing-50.md`（ADF-COVERS 宣言 50箇所）と対象が重複・拡張関係（宣言側は #2879 で解消済み、本検出は本文引用側）のため、backlog-review での統合判定を要する
- **ng_classification**: pre-existing（0914 診断時点でも存在した既知構造。ただし前回診断の「サブ ID すべて実在」クリーン判定とは検出範囲が異なる（前回は宣言・関連節中心の走査と推定、今回 docs/designs・docs/decisions 本文全走査）。判定差異の要因確認は要ヒューマンレビュー）
- **notes**: req-define入力案「—」（行の意味変更を伴わない参照付け替えのため要件化不要）。是正はバッチ的な機械置換候補（docs-check route 候補 #1 参照）

### [REQ 構造] F-02: REQ-082 採番が numbering-policy（max+1）から逸脱し、063〜081 の欠番が未記録

- **category**: 横断契約矛盾（Design 採番規則と REQ 実体の不整合）
- **target**: docs/requirements/REQ-082.md × docs/designs/foundations/numbering-policy.md
- **evidence**: (a) numbering-policy「新規識別子は現行ファイル群（retired/ 含む）の最大番号+1」に対し、現行最大 062（retired 最大 043）の採用後の新規 REQ は 082（ee306369、Case #2846。REQ-082 本文に「2026-09-15 のユーザー裁定により分離移動…採番のみ付け替え」と記録）。(b) policy「採番の判断は人間または LLM が行わず決定的スクリプトが確定する」に対し、ユーザー裁定による番号指定の例外規定が policy に存在しない。(c) policy「欠番は各 README、索引類で『欠番』として明記」に対し、新規発生の 063〜081（19連番）の欠番明記が requirements/README・docs/README に存在しない（「番号には欠番が存在する」の汎用記述のみ）。計 3シグナル
- **severity**: medium / **confidence**: medium（ユーザー裁定による意図的採番である旨は REQ 側本文に記録済み。検出の本体は Design 側への例外記録・欠番記録の欠落）
- **source_of_truth**: 現行 REQ 側の実体（ユーザー裁定による REQ-082 の存立）を正とし、numbering-policy 側の未追随を検出事項とする
- **recommended_route**: UPDATE（numbering-policy へ「分割・付け替え時の採番例外」の記録を追加、または 063〜081 を意図的予約欠番として policy・README へ明記）
- **ng_classification**: 今回修正対象（ee306369、Case #2846 由来の波及。ただし採番自体はユーザー裁定によるため、修正対象は記録漏れ側）
- **notes**: req-define入力案「—」（Design 1行追記で解消可能な範囲）

## 推奨アクション（promote 採用分）

- F-01: 旧行番号引用の現行所有行への付け替え一括是正（対象約50ファイル・151箇所。機械列挙データは本診断の走査結果を再現可能。intake 既存 item との統合判定は backlog-review で実施）
- F-02: numbering-policy への分割時採番例外の記録追加または 063〜081 欠番の明記
- 後段: `/agentdev/backlog-review`

## 受け入れ条件（分類確定時に折込）

- docs-check route 候補 #1（REQ 行参照実在検査の docs/designs・docs/decisions 本文への適用拡大）・#2（REQ 番号ギャップ検査）は独立 route とせず、本成果物の要件化方向・受け入れ条件に含める（inspect-promote command 不変条件準拠）
- F-01 の前回診断（20260914T214425Z「REQ 参照ID整合性: dangling 0件」）との検出差異は走査範囲差（前回: 宣言・関連節中心、今回: docs/designs・docs/decisions 本文全走査）により説明される。現行状態としての旧行番号引用は分類時に現物検証済み（REQ-002 現行行 001〜046・REQ-006 現行行 105〜114、サンプル3箇所〔case-close.md L84・artifact-contracts.md L91・case-auto.md L184〕すべて現行不在行を引用）であり、判定差異の要因確認は本説明をもって解消したものとして扱う
- F-01 と intake inbox item `2026-09-15-traceability-unknown-req-refs-existing-50.md`（ADF-COVERS 宣言側 50箇所。#2879 で付け替え済みの報告あり・intake-promote 再評価待ち）の統合・重複判定は backlog-review が実施する（対象面が異なる: 宣言側 vs 本文引用側）
- F-02 の是正形態（numbering-policy への採番例外記録追加、063〜081 の意図的予約欠番としての policy・README 明記、または両方）の選択は RU → req-define 工程で確定する

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | REQ 行参照実在検査の docs/designs・docs/decisions 本文への適用拡大（IR-067 referenced-req-row-existence の対象範囲拡大、または同系統の新規検査） | F-01。今回の node 走査で 151箇所を決定的・再現性よく検出（ADF-COVERS 宣言側は 0件で、本文引用側が検査空白地帯） | ◎ |
| 2 | REQ 番号ギャップ検査: 現行 REQ 番号の max+1 採番規則・飛び番の README 欠番明記突合 | F-02。063〜081 の新規欠番が無記録のまま生成 | ○ |

## 既知 defer の継続・解消確認（原状継続を確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-04 (0914) | REQ-038-006 2フェーズ読込の内部アルゴリズム混入（MOVE、安定契約例外候補） | 原状継続（行本文変更なし） |
| F-05 (0914) | REQ-050-016 skill description 集約予算の SPLIT 候補 | 原状継続（行本文変更なし） |
| GUIDE-6 (0914) | artifacts-and-state.md 状態モデル制約節の過度一般化 | 原状継続（L144-152 同文のまま） |
| GUIDE-8 (0914) | command-selection.md L13 旧責務表現行 | 原状継続 |
| DESIGN-3 (0914) | command-file-format.md 将来拡張余地記述 | 原状継続（README authoring 行にも同旨残存） |
| F-10 (0901) | 検証実行結果非保存の REQ-012/021 二重規定（軽度 DUPLICATE） | 原状継続 |
| F-11 (0901) | REQ-016 移行完了状態の恒久 REQ 化（RETIRE 候補） | 原状継続 |
| F-12 (0901) | REQ-008-059 テーブル外見出し＋fixture 列挙（MOVE） | 原状継続 |
| F-08 (0901) | REQ-003 審議契約群の SPLIT 候補（REQ-003-035〜054） | **解消済み**（#2846 により REQ-082 へ分離、#2879 により参照付け替え完了） |
| F-09 (0901) | default-on・再起票禁止の REQ-003/014/015 二重規定（DUPLICATE） | **解消済み**（REQ-003 側の該当行が #2846 の縮小で消滅。現行は REQ-014-013 のみが規定） |
| F-04 (0907) | REQ-057 完了後 RETIRE 候補性 | 原状継続（バッチ Cases #2822〜#2858 完了進捗を再評価契機として記録。RETIRE 判断自体は意味判断のため defer 維持） |

## 未処理成果物の確認（診断時点の記録、存在報告のみ）

- `.agentdev/intake/inbox/`: 未処理 item 18件（2026-09-15 9件・2026-09-16 9件）。うち 2件は本診断の追跡調査で HEAD 時点で解消済みの可能性を確認（`2026-09-15-traceability-unknown-req-refs-existing-50.md`: ADF-COVERS 宣言側は #2879 で付け替え済み・designs 宣言行の欠落 0件、`2026-09-15-verification-scope-catalog-req030-022-025-dangling-refs.md`: catalog の REQ-030 節は 001〜014 へ再編済み・epic-wave-model 見出しは REQ-061-019 へ付け替え済み。いずれも intake-promote での再評価を要する情報としてのみ記録）
- `.agentdev/learning/inbox.md`: 未整理エントリ存在（183行）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: 空（RU 0件）
- `.agentdev/drafts/`: 空
- `.agentdev/inspect/inbox/`: 既存 3ファイル（20260901/20260907/20260914、分類確定済みの意図的残置。本ファイル追加で 4ファイル）

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性（親 ID）: dangling 0件。4桁 REQ 参照はすべて `v2:` 付き歴史識別子（DEC-001 所定の許容形式）。frontmatter id↔ファイル名不一致 0件・id 重複 0件・現行/retired 二重存在 0件
- 行レベル参照: ADF-COVERS 宣言（docs/designs）の欠落 0件、配布物（`.opencode` commands/skills）の行参照欠落 0件（94行IDすべて実在）、REQ ファイル間相互参照の欠落 0件。Designs/Decisions 本文の旧行引用は F-01 として検出
- 第一参照導線: docs/README REQ 表 51件・requirements/README AUTOGEN（現行 51・廃止 12）・実ファイル完全一致。docs/README Decision 28件（DEC-005/007 superseded 注記付き）一致
- 現行/廃止/世代境界: retired 12件すべて retired/ に実在、README 廃止表と一致。採番ギャップは F-02 のみ
- Design 状態乖離 DRIFT: draft Design 0件（accepted 170 + README）のため対象なし。Decision 状態乖離 DRIFT: proposed Decision 0件（accepted 26・superseded 2）のため対象なし
- 横断契約矛盾（guides・README 系）: 前回診断後のガイド変更（RU 削除の case-ready 帰属、Decision 定義、検出事項定義への inspect 系追記等）はすべて現行契約への整合化であり、ナビゲーション層の範囲超過なし。superseded Decision（DEC-005/007）が現行判断の根拠として無注記で使われる箇所なし
- REQ structure review: SPLIT/MERGE/RETIRE/DUPLICATE の新規検出 0件（F-08/F-09 解消、F-05/F-10/F-11 継続 defer）。Design分離基準違反の high-specificity 新規該当 0件（REQ-030-012 の STEP-5 言及、REQ-034-031 の結果状態列挙、REQ-048-011 の分類軸列挙はいずれも安定契約例外候補として観察メモに留める。REQ-038-006 は既知 defer F-04）
- 配布物（246ファイル）: 内部 ID 汚染 0件、UTF-8 BOM 0件、CRLF/LF 混在 0件（`scripts/node_modules/` 配下 vendored 4件は検査対象外）、frontmatter 重複 0件（コードフェンス内 frontmatter 例示 3件は文書例示として false positive）、H1/H2 見出し重複 0件、コードフェンス不対応 0件、存在しない command 参照 0件（README listing・本文相互参照とも 18 command と完全一致）、壊れた括弧 0件（検出パターン例示・vendored 由来の機械検出は false positive 確認済み）
- 相対リンク切れ: 0件（形式例示・プレースホルダ・backtick 内誤検出を除外後）

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- `.agentdev/intake/inbox/`・`.agentdev/learning/` の item 内容評価と処分（intake-promote / learning-promote の責務）
- vendored `node_modules/` 配下ファイルの品質
- `docs/knowledge/`・`docs/reports/`（STEP-1-1 のスキャン対象外。knowledge は backlog-review 管理、Report は Design 索引管理外）
- REQ-030-022/023/025・REQ-048-018〜021 の catalog 旧→新行対応表・棚卸し実施記録内の言及（履歴記録として設計された文脈）

## 審議記録

- 暫定分類（16検出事項: promote 2 / reject 2 / defer 12）→ adversarial-review 2系統独立 stream（A: 検出有効性の技術的反証 / B: 分類境界・プロセス的反証）→ counter-challenge → convergence → convergence audit 完了。unresolved な本質的争点なし
- promote 2件（F-01/F-02）は自律確定: 決定的検出・現物検証済み、正規情報源特定済み、分類に本質的競合なし（横断契約 Design「promote系判断確定とHITL境界」詳細判定表の自律確定可能要件8項を充足、HITL 移送条件該当なし）
- reject 2件（0901 F-08/F-09）は自律確定: 解消済み（#2846 による REQ-003-035〜054 の REQ-082 へ分離移管、REQ-003-054 消滅により default-on 規定は REQ-014-013 のみに単一化）。分類時に REQ-003/REQ-082/REQ-014 の行実在突合で現物確認済み。即時削除（却下理由は commit message 参照）
- defer 12件は自律確定: 採否・範囲・優先度が意味判断または再評価条件未充足のため inbox 残置
- ユーザー承認: 2026-09-16、backlog-auto 直列実行の親オーケストレータ経由の直列 HITL として分類全体と永続化（破壊的変更・commit/push 含む）を承認

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-16。実行基線: commit `92c8d28b`（working tree clean）
- 分類実行: /agentdev/inspect-promote（backlog-auto stage 2 inspect レーン）2026-09-16、--auto なし
- 後続: /agentdev/backlog-review
