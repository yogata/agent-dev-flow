# inspect-docs promoted 20260908T120350Z（promote 採用分）

> 本ファイルは inspect-promote（2026-09-08 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、promote となった検出事項のみを保存する（5件）。
> 採用元 finding ファイルは `inspect-docs-finding-20260908T120350Z.md`。本 promoted 保存後に inbox 側から当該ファイルを削除済み。
> 旧 defer 残置分（20260822 F-05、20260901 F-08〜F-12/F-27/F-34、20260907 F-04 の計9件）は再評価の結果、再確認条件が不変・未解消のため defer 継続（inbox 残置、不改変）。
> 判定根拠の詳細・証拠は元 finding の記載による（adversarial-review はユーザー明示要求なし・発動条件不成立のため skip、従来フロー継承）。対象5件は全件自律確定（HITL 対象なし。workflow-contracts Design「promote系判断確定とHITL境界」詳細判定表に従い判定。F-01〜F-04 は公開スキーマ・実行時 validator・テスト・ディスパッチ網羅の機械的照合で確定、F-05 は温存実体の不存在確認で確定。処置形態の判断は backlog-review／req-define へ委ねる）。
> backlog-review との統合マーカーを各 finding に記載（intake promoted との二重修正の回避のため）。

## promote 一覧

### F-01: agentdev-issue-tracking SKILL の issue_list 絞り込み記述が現行 Tool 契約と矛盾（high/high）

- **対象**: src/opencode/skills/agentdev-issue-tracking/SKILL.md:60, 66, 91, 100
- **根拠**: L66「labels・search パラメータは Tool が invalid-input として拒否するため指定せず、結果の絞り込みは応答一覧をクライアント側で行う」および L60/91/100「role 単位で列挙。絞り込みは応答一覧をクライアント側で行う」。REQ-011-022（2026-09-08 更新）は絞り込みを含む構造化結果を操作契約に要求し、accepted Design custom-tool-contracts.md はサーバ側絞り込みクエリ推送を定める。実体も矛盾（contracts.ts issue_list 入力は role/kind/state/trackingState/labels/search を受理、plugin.ts 公開スキーマに labels/search を含む、plugin.test.ts L103 が全フィルタ指定の要求を正当要求として検証）
- **受け入れ条件**: 当該4箇所の標準呼出形式記述を現行契約（Tool 側絞り込み軸: role/kind/state/trackingState/labels/search）へ現行化する。docs-check ルール候補「配布物 skill の Tool 操作パラメータ言及と公開スキーマ（plugin.ts / contracts.ts）の機械照合」を要件化方向の受け入れ条件に含める
- **統合マーカー**: F-02 と同一 Case での一括現行化候補。intake promoted との直接重複なし

### F-02: agentdev-workflow-issue SKILL の「絞り込みはクライアント側」記述残置（medium/high）

- **対象**: src/opencode/skills/agentdev-workflow-issue/SKILL.md:71
- **根拠**: L71「`issue_list`（role 単位で列挙。絞り込みは応答一覧をクライアント側で行う）で既存追跡Issueを検索し」。Tool は kind/state/trackingState/labels/search による絞り込みを操作契約として提供（REQ-011-022、custom-tool-contracts.md、plugin 公開スキーマ）。F-01 と同根
- **受け入れ条件**: 当該行の呼出形式記述を現行契約へ現行化する（F-01 と一括）
- **統合マーカー**: F-01 と同一バッチ候補

### F-03: agentdev-gh Local 実装 README の操作契約記述が実装・Design に対して陳腐化（medium/high）

- **対象**: src/opencode-local/agentdev-gh/README.md:4, 26, 31
- **根拠**: L4「16操作 + 温存中の `issue_comment`」に対し runner-local.ts の操作ディスパッチは16操作のみ。L26 の `issue_comment` 読み替え行（旧 `### {日時}` 形式）は廃止済み操作名。L31 pr_read「body の論理範囲の直列化は #2688 が確定する」に対し実装は serializePrBody による3セクション直列化を実装済み（runner-local.ts L1230-1239、L1285）、accepted Design local-case-file.md も同範囲を定義済み、#2688 は #2694（dad9a860）で完了済み
- **受け入れ条件**: README の当該3箇所を現行の16操作・Comment CRUD（`### c{NN}` 形式）・論理 PR 本文3セクション直列化契約へ現行化する
- **統合マーカー**: intake promoted `2026-09-08-local-runner-readme-16op-catalog-alignment.md` と同一対象（出所違いの二重起票）。backlog-review で単一変更へ統合すること。F-04 と同一バッチ候補

### F-04: case-schema/case-file.md（運用参照資料）が正本 Design と矛盾（medium/high）

- **対象**: src/opencode-local/agentdev-gh/case-schema/case-file.md:71, 75
- **根拠**: L71 の PR 系操作列挙に pr_update が欠落（正本 local-case-file.md L141 は pr_update を含む）。L75「issue_comment の読み書きは…」は廃止済み旧操作名（正本同 L150 は Comment 操作（comment_create、comment_list、comment_update、comment_delete）の読み替えを定義）。本ファイル冒頭は「Design と矛盾してはならない」と自己宣言
- **受け入れ条件**: L71 の操作列挙へ pr_update を追加、L75 の操作名を Comment 操作4種へ置換する（正本 local-case-file.md と同一文言へ整合）
- **統合マーカー**: F-03 と同一バッチ候補。intake promoted との直接重複なし

### F-05: custom-tool-contracts.md の issue_comment「一時的に温存する」条項が遷移完了後も残置（low/medium）

- **対象**: docs/designs/responsibilities/custom-tool-contracts.md:35
- **根拠**: 「移行完了までの間は一時的に温存する」。全配布物呼出元の Comment 操作移行は完了し（操作呼出 0件、テンプレートファイル名は用途識別子として正当）、GitHub 版 contracts.ts とローカル版 runner-local.ts のいずれも issue_comment を実装しない。「温存」される実体がリポジトリ内に存在しない状態で条項のみが残置
- **受け入れ条件**: 温存条項を除去する、または「温存完了（廃止確定）」として現行状態へ明記する（cleanup モデル RETIRE / INFERENCE 判断）。外部 consumer 環境で旧 runner を保持し得る期間の考慮を処置判断に含める
- **統合マーカー**: intake promoted `2026-09-08-custom-tool-contracts-post-migration-prose-update.md` と同一対象領域（廃止節・移行期間条項、出所違いの二重起票）。backlog-review で単一変更へ統合すること

## 参照

- 検出実施: /agentdev/inspect-docs（backlog-auto stage 1）2026-09-08
- 分類実施: /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）2026-09-08、--auto なし
- 判定内訳: promote 5件（全件自律確定）／ defer 9件継続（20260822 F-05、20260901 F-08〜F-12/F-27/F-34、20260907 F-04。再確認条件不変のため不改変・inbox 残置）／ reject 0件
- 後続: /agentdev/backlog-review（stage 3）
