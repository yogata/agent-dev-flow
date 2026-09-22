# inspect-docs promoted 20260922T042123Z

> inspect-promote（2026-09-22 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし・in-context 審議）の採用済み成果物。
> 新規検出事項 1件（F-01）を採用した。
> 対論型レビュー（in-context 審議: 2系統独立 stream・対称的相互反証・convergence audit、unresolved 0件）を実施。F-01 は HITL 確定（ユーザー承認 2026-09-22、promote・推奨案選択）により採用。
> 同時処分: F-10/F-12（0901）・F-04/F-05/GUIDE-6（0914）は defer 継続（inbox 残置・再評価条件に変化なし、自律確定）。

## 検出事項リスト（promote 採用分）

### F-01: REQ-090-007/008 に移行完了記録・ファイルパス直接参照・リリース証跡が要件行として残留

- **id**: F-01
- **category**: MOVE（REQ/Design 境界違反: 作業履歴残留・ファイルパス直接参照・リリース証跡）＋ RETIRE 候補（移行完了状態類型）
- **target**: docs/requirements/REQ-090.md:22（REQ-090-007）、docs/requirements/REQ-090.md:23（REQ-090-008）
- **evidence**: (a) REQ-090-007 は「docs/designs/workflows/references/execution-unit-construction.md 内の旧 case-open 所有表現（6箇所）および docs/designs/README.md 横断 Design 一覧の当該行が case-ready 実行契約へ整合して更新されていること」— 具体パスと箇所数を含む反映作業の完了記録が主たる文意であり、当該状態は既に充足済み。(b) REQ-090-008 は「Jev 実装開始直前の最新 main に v4.0.2 tag が存在すること」— リリース証跡（tag 存在確認）が要件行。同じく -008 後半の基準点 revert 条件は Case 受け入れ条件の性質。(c) 適用範囲節にも「欠番記録3ファイル、採番スクリプトの最小修正、新規 REQ は REQ-090」等の作業項目列挙（補助根拠）。計 3シグナル以上
- **severity**: high / **confidence**: medium（シグナルの存在は機械的に確定。REQ-090-006 が「合意済み」と明記する構成への依存が初出時の medium 根拠だったが、promote 確定時点で下記の検証記録・反証検証により不整合実在は確定）
- **source_of_truth**: 現行 REQ（REQ-004-049: 作業手段は REQ 要件行に混入させない。document-model Design「REQ 内容契約」: 要件行は検証可能な状態要件、反映作業を含まない。REQ-001-067: 作業履歴・ファイルパターン等は Design/作業記録へ移管。document-model 廃止候補判定基準「移行完了状態」「作業手段主題」類型）
- **recommended_route**: MOVE（作業記録・tag 証跡・パス指定詳細を Case 受け入れ条件・作業記録側へ寄せ、REQ-090 は Jev 組込みの恒久状態要件（-001〜-006、-009、-010）に縮約）または RETIRE 候補化の評価（移行完了状態として REQ-045/REQ-046 系の恒久化要否再評価）。route 選択は req-define の再合意で確定すること。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（2026-09-22 commit 2d7880fa 追加行）
- **検証記録（inspect-promote 2026-09-22）**: REQ-090.md:22-23 実読で REQ-090-007 に反映作業完了記録（パス＋箇所数指定）、REQ-090-008 に v4.0.2 tag 証跡が REQ 行として残留していることを確認。充足状態: execution-unit-construction.md 内 case-open 言及 0件（grep 確認）、docs/designs/README.md:154 は「case-ready Design（運用主体）」表記で REQ-090-007 の記述状態は充足済み、v4.0.2 tag 実在（git tag 確認、REQ-090-008 前半も充足）。すなわち「既に充足済みの作業完了状態」が REQ 行として残留している
- **HITL 承認記録**: 2026-09-22、ユーザー承認（promote・推奨案選択）。HITL 提示には代替案 defer（REQ-090 新設当日の時間的近接性を考慮した運用後再評価）を併記し、ユーザーは promote を選択。初出時の confidence medium の根拠（REQ-090-006「合意済み」への依存）は、同節が観測 JSON schema の自由度に関する言及であり REQ-090-007/008 の REQ 行保持合意ではないことの反証検証（adversarial-review）により解消
- **修正内容（実施 Case 向け具体案）**:
  - REQ-090-007（REQ-090.md:22）を削除または恒久状態要件へ縮約: 反映作業の完了状態は Case #3056 の受け入れ条件・作業記録側で既に充足・記録済み（execution-unit-construction.md 更新済み・README 行整合済み）
  - REQ-090-008（REQ-090.md:23）前半「Jev 実装開始直前の最新 main に v4.0.2 tag が存在すること」を削除（リリース証跡は tag・作業記録側で確認済み）。後半「Jev を無効化した場合（API key 未設定を含む）、既存 Workflow の挙動を基準点時点と同等に維持できること」の恒久状態要件としての保持要否は req-define の再合意で判断
  - MOVE（縮約）か RETIRE（移行完了状態類型として恒久化要否評価）かの route 選択は req-define で確定すること
- **notes**: REQ-090 は 2026-09-22 新設（commit 2d7880fa）の REQ であり、REQ 行の再構成は req-define の再合意プロセス（RU 経由）でのみ実施する（直接修正しない）。REQ-090-001/002 の「model ID typesafe-ai/jev」「AI_GATEWAY_API_KEY」等の詳細値例示は安定契約例外候補（検出事項化せず・閾値未満の観察メモから外れた対象外）。docs/README.md:15 / requirements/README.md / numbering-policy.md:64 の「（次の新規 REQ は REQ-090）」括弧書きの成立済み予告化も観察メモ（1シグナル、検出事項化せず）
- **req-define入力案**: 「REQ-090-007/008 の反映作業記録・v4.0.2 tag 証跡を REQ 要件行から除去し、恒久状態要件のみを残す。作業条件は当該 Case（#3056）の受け入れ条件として既に充足・記録済みのため、REQ 側の保持必要性を再評価する」

## 統合審査の指示（backlog-review 向け）

- 単独検出事項（1件）。REQ-090 の行再構成（MOVE 縮約 or RETIRE 評価）として単独 RU 化を推奨する
- REQ-090 は 2026-09-22 新設の REQ であるため、RU は req-define での再合意を経由する導線（RU → req-define → case-open）を前提とすること

## 出典

- 新規検出事項（F-01）: `.agentdev/inspect/inbox/inspect-docs-finding-20260922T032349Z.md`（2026-09-22 処分時に削除。git 履歴 commit 3164f4c7 参照）
- 同時処分の defer 継続: `inspect-docs-finding-20260901T120043Z.md`（F-10/F-12 defer 継続）・`inspect-docs-finding-20260914T214425Z.md`（F-04/F-05/GUIDE-6 defer 継続）の各ヘッダ注記・審議記録参照
- 診断実行: `/agentdev/inspect-docs`（backlog-auto stage 1 単独実行）2026-09-22
- 後続: `/agentdev/backlog-review` による RU 生成
