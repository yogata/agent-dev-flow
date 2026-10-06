# inspect-docs finding 20261006T151122Z（defer 残置分）

> 本ファイルは inspect-promote（2026-10-07 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（8件: F-01〜F-06・F-08・F-09）は `.agentdev/inspect/promoted/finding-20261006-*.md` へ保存済み（全8件自律確定、HITL 0件。うち F-03 は Jev defer 0.61 → promote 是正〔semantic_disagreement〕を adversarial-review が支持）。F-07 は暫定 promote から adversarial-review 経由で defer へ変更（文意は「旧識別子の参照先が現行行へ置換済み」の良性解釈が優勢、機械検査非検出。是正の要否が未確定の境界ケースとして F-10/F-11 と同区分）。reject 0件。GR-05 は分類対象外（前回 defer 確定項目の状況更新のみ）。
>
> adversarial-review 実施記録: Stream A（分類妥当性）/ Stream B（証拠適合）の2系統独立 review → counter-challenge → convergence audit 完了（新争点なし）。F-01/F-02/F-04/F-05/F-06/F-08 は全主張実証支持、F-09 は「完全置換」表現を部分置換/完全置換の正確な内訳へ補正、F-11 は事前条件（numbering-policy.md:66 に同等記述あり・:64 が README 欠番明記を義務付け）を確認済み。Jev 観測: 20261006T162724Z-b985（finding-disposition 11事項）・20261006T162755Z-6296（trigger）。
>
> 再評価条件:
> - F-07: 表現の誤解実害の観測時、または retired ID 参照の機械検査（retired-req-primary-ref 拡張）実装時
> - F-10: authoring/ 将来拡張の方針が決定される時（単一化の要否が確定する条件）
> - F-11: 欠番説明の収縮需要発生時（REQ-089 を予約欠番と同列化しない文言設計を要する）

- 実行日時: 2026-10-07T00:11 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer 照合・前回 intake 捕捉分の消費状況確認を実施、担当間矛盾なし、対象領域分離により重複候補なし）
- 前回診断: 20261004T162140Z（defer 残置分。10-05 実施の inspect-promote で promote 8件・defer 1件〔GR-11〕処理済み）。今回の対象差分は 10/5〜10/6 の正規コミット群（DEC-051 承認・d754ceec スロット型キュー移行・ce6bd072 IR-072 Design 拡張・19d3a4ab REQ-095-002 訂正・Case #3448〜#3506 系ほか）

## 検出事項リスト（defer 残置分）

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。

### Design（defer 1件）

#### F-07: IR-063 の retired REQ-046-006 を「現行要件行」と呼ぶ曖昧表現
- category: 廃止 REQ 由来記述残置の境界ケース（履歴説明節内の表現）
- target: `docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md:44`
- evidence: 「旧検査の識別子引用（REQ-046-006、REQ-010-064）は置換済みの現行要件行を指す」— REQ-046 は 2026-09-30 retired。retired REQ 行を「現行要件行」と称する表現は誤解を生み得る。ただし本節は前身検査廃止の履歴説明であり、IR-063 自身の検査契約の所有は :40 で明記済み。文意は「旧識別子の参照先が現行行へ置換済み」とも読める
- severity: low / confidence: medium（文意複数解釈、要ヒューマンレビュー）
- source_of_truth: 現行 REQ-010-065〜067（REQ-046 不変条件の継続所有者）
- recommended_route: 観察メモ・表現是正候補（「REQ-046-006（retired）」明示 or 参照先置換の明確化）
- ng_classification: pre-existing
- 処理記録: 2026-10-07 inspect-promote defer 確定（暫定 promote から review 経由で変更。adversarial-review で良性解釈が優勢と判定）

### Decision・guides・README（defer 2件）

#### F-10: authoring/ 将来拡張余地の重複言及
- category: 将来計画の混入（軽微・重複）
- target: `docs/designs/README.md:249`、`docs/designs/authoring/command-file-format.md:17`
- evidence: 両者が「authoring/ は REQ/Design/SKILL/guide 執筆規約の集約先として将来拡張余地あり（即時統合・authoring/ 削除は行わない）」と同一の将来拡張余地を記述
- severity: low / confidence: medium
- source_of_truth: document-model Design の分離基準（将来案は Design の非所有、ただし現状説明への接続語として許容範囲）
- recommended_route: 観察メモ（単一化候補）
- ng_classification: pre-existing
- 処理記録: 2026-10-07 inspect-promote defer 確定。adversarial-review で command-file-format.md:17-18 側に「現状は command のみ」の付加情報があり単純重複でない点、designs/README.md 側は索引の責務欄である点を確認。単一化の要否は判断事項

#### F-11: docs/README.md 要件欠番説明の内容過多候補
- category: README 索引 内容過多検出
- target: `docs/README.md`（要件節・欠番説明段落）
- evidence: 「REQ-063〜REQ-081 は…意図的予約欠番」「REQ-089 は J2 shadow 実験（commit 43bf2ec3 で採番後、52c7bc10 で完全 revert）由来の廃止識別子」— 個別欠番の由来履歴（commit 番号・日付・裁定経緯）を索引が詳述。採番ポリシーの正は numbering-policy.md であり同段落から参照済み
- severity: low / confidence: medium（numbering-policy 側に同等記述があるかの確認が事前条件。REQ-089 再利用禁止の告知として索引に存在価値もある）
- source_of_truth: designs/foundations/numbering-policy.md
- recommended_route: 候補提示のみ（「REQ-063〜081・084〜086・089 は意図的予約欠番（詳細は採番管理参照）」への収縮候補。numbering-policy.md との重複確認後）
- ng_classification: pre-existing
- 処理記録: 2026-10-07 inspect-promote defer 確定。adversarial-review で事前条件を確認: numbering-policy.md:66 に同等記述（同一 commit 番号を含む）あり、requirements/README.md にも第三の重複あり。ただし numbering-policy.md:64 が「requirements/README.md と docs/README.md で『欠番』として明記」を Design 義務としており、README の欠番明記自体は規定通り。また収縮案は REQ-089（廃止識別子）を予約欠番と同列化すると不正確になる文言設計の注意があるため、修正は軽微判断として defer 維持

## 既知 defer 項目の状況更新（前回 20261004T162140Z の defer 残置分）

| 項目 | 状況 | 証拠 |
|---|---|---|
| GR-05: supervisor-credential-bridge.md 実測記録埋め込み | 残存 | supervisor-credential-bridge.md:115（docs/knowledge/supervisor-bridge-credential-supply.md 側に同一実測の履歴があり複製に相当。cleanup モデル MOVE/REFERENCE 候補は継続） |

補正（2026-10-07 adversarial-review）: 上記「同一実測の複製に相当」の表現は厳密には不正確の可能性。guide:115 の実測は 2026-09-28 Case #3190 実行時（旧変数名言及 0 件の掃き出し検証）、knowledge 側 :47 の実測は Case #3080 の導入検証であり別 Case・別内容。ただし guide:115 が knowledge 側の履歴実測記録を参照しており両者に履歴実測記述が並存すること、実測記録の guide 埋め込み問題（GR-05 本体）が未解消なことは正確。
