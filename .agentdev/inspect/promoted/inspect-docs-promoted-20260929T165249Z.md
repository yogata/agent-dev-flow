# inspect-docs promoted findings 20260929T165249Z.md

- 保存日: 2026-09-30（backlog-auto stage 2 inspect 系統・inspect-promote。--auto なし）
- 来源: .agentdev/inspect/inbox/inspect-docs-finding-20260929T165249Z.md から promote 判定分を原状保存（HITL・自律確定の別は処理記録参照）

#### RQ-31: retired/REQ-013.md:28 が現行不存在の REQ-006-040 を参照（dangling 行参照）
- **category**: 参照ID整合性（行レベル）
- **target**: docs/requirements/retired/REQ-013.md:28（REQ-013-005 行）
- **evidence**: 「REQ-006-040 が DOC-MAP を含まない『要件、成果物、SPEC の整合確認と Decision 必要判断に対する Decision 作成済み確認を行うこと』であること」。現行 REQ-006.md の要件テーブルは REQ-006-105〜114 のみ（REQ-006-001〜104 全欠番、分割記録なし REQ-006.md 本文に確認できず）。同一内容の現行行は REQ-032-002（REQ-032.md:20）
- **severity**: low-medium / **confidence**: high（参照不能性は grep 実測）
- **source_of_truth**: 現行 REQ-032（case-close 実行契約）> retired REQ-013（履歴記録）
- **recommended_route**: req-define 再壁打ち（retired 側への移管注記、または REQ-006 側の分割元/分割先記録への行ID追記。retired 本文の書換えは避ける方針判断を含む）
- **ng_classification**: pre-existing
- **notes**: REQ-006-041〜104 の大量欠番の由来記録が REQ 内に存在しない点は 20260926 RQ-13（行番号欠番集約）の対象追加提案としても扱える

#### RQ-32: REQ-046「横断正規化後の不変条件」の廃止判定予約が未消化
- **category**: RETIRE（世代境界）
- **target**: docs/requirements/REQ-046.md:13-14（目的節）
- **evidence**: 「v4 移行完了後（v4.0.0 final 後）に本 REQ の廃止判定を行う予約を第13段 full validation で記録する」。リポジトリには v4.0.1/0.2/0.3 タグが存在し v4.0.0 final 通過済み。REQ-046-001〜008 の恒常検査は REQ-010-065〜067（REQ-010.md:38-40）が所有済み
- **severity**: low-medium / **confidence**: medium（「第13段 full validation」の実施記録は docs/reports/ 側で未確認）
- **source_of_truth**: 現行 REQ-046（自己予約記録）> 現行 REQ-010（恒常検査所有）> git tag 証跡
- **recommended_route**: RETIRE 判定の実行（DEC 化して廃止、恒常不変条件の所有集約先を明示して retired へ）。最低限予約の消化状況の現行化
- **ng_classification**: pre-existing

#### RQ-33: REQ-090-007 が REQ-035 の宣言と同一内容の重複宣言
- **category**: MOVE / DUPLICATE
- **target**: docs/requirements/REQ-090.md:22（REQ-090-007）
- **evidence**: 「Epic/Wave 構成の正規判断所有者は case-ready であること」⇔ REQ-035.md:12「Wave 構成の生成は case-ready 実行契約 REQ が…所有する」。8e196955 の簡約化で Jev 固有の文意が消失し REQ-035 の重複となった。docs/designs/README.md 先頭の ADF-COVERS 宣言に REQ-090-007 が残存し「Design インデックスが implementation を保持する」不自然な対応関係
- **severity**: low / **confidence**: medium（REQ-090-027/028 の T1 持ち越し判断単位として意図残存の可能性）
- **source_of_truth**: 現行 REQ-035（Epic と Wave 実行モデル）+ REQ-061（case-ready 実行契約）
- **recommended_route**: req-define 再壁打ち（REQ-035/061 への参照化または行削除・REQ-090-004 文脈への統合）。designs/README.md covers 宣言の除去は Design 側修正とセット
- **ng_classification**: fix-target（8e196955 以降の構造）

#### DS-21: case-auto.md:158 が superseded DEC-015 を「現行の責務体制は」と現行権威表記
- **category**: Decision current-authority（superseded Decision の現行権威引用）
- **target**: docs/designs/commands/case-auto.md:158（:165 も同形式の見出し）
- **evidence**: 「複数 execution_unit 並列 orchestration（REQ-006、v2:ADR-0129 由来、現行の責務体制は DEC-015（superseded by DEC-036/038/039））」。「現行の責務体制は」が superseded 側を指す。正しいハウススタイルは「DEC-002 由来、現行の責務体制は DEC-036」（document-model.md:375 等）
- **severity**: low-medium / **confidence**: medium（supersession 注記が併記され誤読リスクは限定。本文の所有記述は REQ-034-035/036 を引き内容の誤りではない）
- **source_of_truth**: DEC-015 frontmatter（status: superseded）+ DEC-036（主後継）+ decisions/README.md Decision Map
- **recommended_route**: designs 修正（「〜由来、現行の責務体制は DEC-036/038/039」形式へ統一）
- **ng_classification**: pre-existing
- **notes**: 20260926 DC-02（DEC-015 補完後継逆参照欠落）の designs 側新規証拠

#### DS-23: custom-tool-contracts.md が REQ-090 行をほぼ逐語複製（二重保守リスク）
- **category**: Design-vs-REQ 代替（保守性）
- **target**: docs/designs/responsibilities/custom-tool-contracts.md:87-88
- **evidence**: 「決定的処理として確定できないことと…（REQ-090-024）は独立の条件であり…判定する（REQ-090-018）」「観測識別子の安定性: …（REQ-090-026）」「条件付き評価の発動条件: …（REQ-090-025）」= REQ-090.md:32/39/40 とほぼ逐語一致。bd666243 の「Design 同期」で導入
- **severity**: low / **confidence**: medium（同期運用として意図的。REQ 行変更時に Design 側の追随が必須化する二重保守構造）
- **source_of_truth**: REQ-090（義務水準の所有）+ document-model.md:41（Design は「現在のHOW」）
- **recommended_route**: 方針提案（「REQ 行を Design が逐語複製しない・参照+Tool 視点の再構成に留める」方針の明文化を backlog 経由で検討）
- **ng_classification**: 判断保留

#### DS-24: custom-tool-contracts.md:89 に実測観測ファイル名の刻印
- **category**: Design への実測値埋め込み（document-model 対象外列）
- **target**: docs/designs/responsibilities/custom-tool-contracts.md:89
- **evidence**: 「（実測観測: `.agentdev/jev-observations/20260923T133911Z-6859.json`）」。時点依存の観測ファイル名を Design 本文に刻印し陳腐化リスク
- **severity**: low / **confidence**: medium
- **source_of_truth**: document-model.md:41（Design の対象外列「実測値」）+ docs/README.md Report 分離原則
- **recommended_route**: designs 修正（「実測観測により確認済み」程度の一般化表現へ格下げ）
- **ng_classification**: fix-target（d0c02fe0 系で追加）
- **notes**: 20260928 promote 済み DS-17（Design 内の固定件数・実測値埋め込み）の同種新規行

#### DC-14: docs/README.md の DEC-028 行に superseded 注記が導出されていない
- **category**: README index（AUTOGEN 注記の導出漏れ or 仕様の曖昧性）
- **target**: docs/README.md:116
- **evidence**: DEC-028 frontmatter は status: accepted + superseded_by: DEC-047 + supersede_note。index-auto-generation.md:189（rule 6）は「superseded_by を持つ全 DEC 行へ注記を導出」と定義するが、DEC-028 行「| [DEC-028](decisions/DEC-028.md) | 文章表層品質の共通実行基盤 |」に注記なし。他の superseded_by 保持行（DEC-040/043 等）は注記済み
- **severity**: low / **confidence**: medium（status: accepted のため意図的除外の可能性。ただし spec 文言は「全 DEC 行」）
- **source_of_truth**: index-auto-generation.md rule 6（生成仕様の正）
- **recommended_route**: 生成器仕様の適用条件明確化（status: superseded 限定なら spec 文言修正、全行適用なら DEC-028 行注記生成）のいずれかで是正
- **ng_classification**: pre-existing

#### DC-15: decisions README トピック別ビューに DEC-047 未掲載（v4 系未反映の対象追加）
- **category**: docs/decisions/README.md 索引整合（トピック別ビュー）
- **target**: docs/decisions/README.md:139-174（トピック別ビュー）
- **evidence**: 「配布基盤・ソースモデル」（:147-160）は DEC-002〜028 で構成され、DEC-047（textlint 依存実体の版固定情報解決、related_reqs: REQ-029/REQ-053）がどのトピックにも未掲載。DEC-028 行（:160）の説明も部分後継 DEC-047 に触れない。トピック別ビュー全体が v4 系 DEC-031〜047 をほぼ未掲載
- **severity**: low / **confidence**: medium（網羅要件の明文化なし。選択制なら設計内）
- **source_of_truth**: DEC-047 frontmatter（トピック適合性）
- **recommended_route**: トピック別ビューへ DEC-047 追加。ビュー全体の網羅性ポリシー（選択制なら明記）の確定
- **ng_classification**: pre-existing
- **notes**: 20260926 DC-07/DC-10（Decision Map v4-era 未反映）の系譜で対象追加

