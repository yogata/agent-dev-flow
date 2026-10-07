---
draft_type: req_draft
topic_slug: session-supervisor-regular-ru-generation
status: draft
created_at: 2026-10-07T05:39:59.352Z
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  session 由来 RU の正規生成主体を実主体別（req-define-parent または session-supervisor）に拡張する。
  REQ-008-051 と artifact-contracts Design「RU アーティファクト契約（session由来RU）」節の生成主体規定を更新し、
  Supervisor がチャット合議内容を正式生成・保存する経路を正規に認める。req-define 親エージェントによる既存正規経路は維持し、
  担当していない役割の記録（詐称）と session-supervisor であることだけを理由とする今回限り例外承認の要求を禁止する。
  あわせて RU-0181 の冒頭と承認状態における今回限り例外としての扱いを正規ルートの記録へ更新する（generation_actor、
  26件の AC、目的・対象・依存関係等の本文、最新の後続工程承認は一切変更しない）。二段階承認・時刻順序・保存先・採番・
  8セクション・暫定7分類等の他契約は変更しない。新しい生成器・例外管理機構・checker・台帳・状態・schema・設定項目は追加しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      チャットで内容合意した session 由来 RU を Supervisor が正式に生成・保存する経路を正規に認め、実主体を generation_actor: session-supervisor と記録する。req-define 親エージェントが実際に生成する既存の正規経路は維持し generation_actor: req-define-parent を認める。generation_actor は実主体に応じて記録し、担当していない役割を記録しない。2026-10-07 のユーザー指示「session-supervisorを正規ルートとすること」に基づく一般契約変更であり、今回限り例外の反復ではない。
  - id: AG-002
    content: |
      session-supervisor であることだけを理由に、新しい session-supervisor RU の生成・保存に対して今回限りの例外承認を要求しない。内容承認と採番・保存・commit・push の二段階承認、生成時刻と合意時刻の意味と順序（generated_at >= agreement_confirmed_at）、pre-req-define、保存先、採番、本文8セクション、暫定7分類、依存先記録、session 論理URI 等の他の契約は変更せず、不正な主体や合意時刻の偽装を認めず、他の契約を弱化しない。
  - id: AG-003
    content: |
      変更は現行規定の同一制限を持つ3箇所（REQ-008-051、artifact-contracts Design「RU アーティファクト契約（session由来RU）」節の生成主体記述と frontmatter 必須フィールド表）と RU-0181 の記録更新に限定する。同じ制限を持つ現行 Guide、実行手順、Template、検証処理が見つかれば同じ変更を反映する（リポジトリ横断検索で docs/ 2ファイル3箇所のみ、src/ 配布物と検証処理に同一制限の記述なしを確認済み）。歴史記録（retired、superseded、reports）は書き換えない。最小差分と既存経路を優先し、新しい生成器、例外管理機構、checker、台帳、状態、schema、設定項目は追加しない。
  - id: AG-004
    content: |
      .agentdev/backlog/req-units/RU-0181.md の generation_actor は session-supervisor のまま維持し、冒頭 blockquote と「承認状態」節における今回限り例外としての扱いを正規ルートの記録へ更新する。26件の AC 本文、目的、対象、対象外、禁止、依存関係、v4 再収束の内容、frontmatter の他フィールド、および最新の承認状態（内容承認、永続化承認、承認記録の記入時刻、後続工程承認、baseline 記述）は一切変更しない。更新は main 0b442b1e 時点の本文に対する2行置換（冒頭 blockquote、承認状態の生成主体差異承認項）に限定し、以前の未承認の記述へ戻さない。
  - id: AG-005
    content: |
      既存の対象検証と構造・参照検証、変更全域の残存検索を実行する。C:/Users/ogatay/AppData/Local/hermes/cache/scratch/verify-ru0181.mjs は正規化後に --allow-approved-exception を付けずに実行できること（配置前に作成・実行済みであることの確認を含む）。docs 変更に対する既存プロジェクト推敲工程（yomiyasu）と textlint 検査を実施する。契約適合が確認できるまで完了扱いにしない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    target_area: 要件
    source_items: [AG-001, AG-002]
    content: |
      | REQ-008-051 | session由来RU（source_type: chat, generated_by: session）の frontmatter は、生成主体（generation_actor: 実主体に応じた req-define-parent または session-supervisor。担当していない役割を記録しない）、合意成立時刻（agreement_confirmed_at）、生成ステージ（generation_stage: pre-req-define）、論理キー（logical_key）の4フィールドを必須とすること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: RU アーティファクト契約（session由来RU）
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## RU アーティファクト契約（session由来RU）

      session由来RU（`source_type: chat`、`generated_by: session`）の生成、承認、保存、永続化の追跡可能な二段階手続きを定義する。
      本節は REQ-008 に基づき session 経路に不足する契約を追加し、既存の `source_type: chat` と7値の `tentative_classification` を維持する。

      ### 生成主体と生成時点

      - 生成主体: 実主体に応じて記録する。`req-define` 親エージェントが実際に生成する場合は `generation_actor: req-define-parent`、チャットで内容合意した session 由来 RU を Supervisor が正式に生成・保存する場合は `generation_actor: session-supervisor` とする。担当していない役割を生成主体として記録せず、`session-supervisor` であることだけを理由に今回限りの例外承認を要求しない
      - 生成時点: チャット内合意成立後、req-define 開始前（`generation_stage: pre-req-define`）
      - `agreement_confirmed_at` と `generated_at` は ISO 8601 形式とし、`generated_at >= agreement_confirmed_at` を満たすこと
      - 保存完了前に req-define を開始しないこと

      ### 二段階承認

      - 第1承認: 論理キー（`logical_key`）で特定したRU案の内容のみを対象とする。採番、保存、commit、push を行わない
      - 第2承認: 採番、保存、commit、push を許可する。第1承認のみではファイル作成、commit、push を行わない
      - 第1承認記録は対象RUの `logical_key` を列挙する

      ### 保存先と永続ID

      - 保存先: `.agentdev/backlog/req-units/`
      - 永続ID: 保存時に既存最大番号+1で割り当て（RU-NNNN 形式）
      - 保存後の `depends_on` は RU-ID で記録する

      ### session 論理URI

      - `sources[].type: chat` の場合だけ、`sources[].path` へ `session:...` を解決しない論理URIとして許可する
      - `type: chat` 以外の source で `session:...` を使用しない
      - `session:...` をファイル取得、URL取得、外部セッション取得の解決処理へ渡さない

      ### frontmatter 必須フィールド

      session由来RU の frontmatter は次を必須とする。

      | field | 値 |
      |---|---|
      | `source_type` | `chat` |
      | `generated_by` | `session` |
      | `generation_actor` | 実主体別: `req-define-parent`（req-define 親エージェントが生成）または `session-supervisor`（Supervisor が正式生成・保存） |
      | `agreement_confirmed_at` | ISO 8601 形式の合意成立時刻 |
      | `generation_stage` | `pre-req-define` |
      | `generated_at` | ISO 8601 形式の生成時刻（`>= agreement_confirmed_at`） |
      | `logical_key` | RU を一意に特定する論理キー |
      | `tentative_classification` | 既存7値のいずれか（欠落時は生成停止） |
      | `agentdev_handoff` | 配布物改善の場合 `true` |
      | `depends_on` | 依存先 RU-ID のリスト（保存後） |
      | `sources` | `type: chat`、`path: session:...` 形式 |
      | `status` | `draft` |

      ### RU 本文必須8セクション

      各RU本文は次の8セクションを必須とする。
      session 論理URI の解決なしに後工程が RU 内容を判断できる自足性を保つこと。

      1. 目的
      2. 対象
      3. 対象外
      4. 正規所有者とアンカー
      5. 依存関係
      6. 要件化の方向
      7. 決定的受け入れ条件
      8. Source Summary

      ### req-define による最終分類の扱い

      `tentative_classification` は暫定値であり、req-define による最終分類を先取りしない。
      req-define は `tentative_classification` を入力とし、document-model Design の文書7分類モデルへ照らして最終分類を確定する。

conflict_resolutions:
  - id: CR-001
    conflict: 今回限りの契約差異承認（RU-0181 保存時の例外扱い）と一般契約（REQ-008-051 と artifact-contracts の req-define-parent 固定制限）の衝突。同様の例外承認が反復して発生している。
    resolution: 2026-10-07 のユーザー指示「session-supervisorを正規ルートとすること」により、一般契約側を実主体別の正規経路へ改訂することで解消する。RU-0181 側の例外記録は正規ルートの記録へ更新し、例外承認への依存を除去する。本解消は後続コマンドで再確認しない。
  - id: CR-002
    conflict: 反復する例外承認の解消手段として、例外管理機構や checker 等の新規統制追加と、既存規定3箇所の最小差分更新の選択。
    resolution: 最小差分と既存経路を優先する合意（入力の実施範囲と承認）により、既存規定3箇所の更新と RU-0181 記録の更新に限定する。新しい生成器、例外管理機構、checker、台帳、状態、schema、設定項目は追加しない。

operation_units:
  - ou_id: OU-001
    target_req: REQ-008
    target_design: docs/designs/responsibilities/artifact-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      正規化後の docs/requirements/REQ-008.md の REQ-008-051 行と docs/designs/responsibilities/artifact-contracts.md「RU アーティファクト契約（session由来RU）」節を対象に機械検査（grep）を実行する。検査項目は (1) REQ-008-051 行が req-define-parent と session-supervisor の両方を含むこと、(2) 同節の生成主体記述が req-define 親エージェントによる生成（generation_actor: req-define-parent）と Supervisor による正式生成・保存（generation_actor: session-supervisor）の両正規経路を記述していること、(3) 同節 frontmatter 必須フィールド表の generation_actor 行が両値を含むこと、の3点である。
    pass_criteria: |
      3点すべて成立すること。req-define-parent を唯一の許容値とする生成主体規定が docs/ の現行規定上に残存しないこと（該当検索の一致 0 件）。
    on_failure: |
      fix-and-reverify。契約規定の不備は本 Case の本体変更にあたるため、対象3箇所の規定を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/ 全域（docs/reports/ は履歴記録領域として検出対象から除外）と src/ 全域、.agentdev/backlog/req-units/RU-0181.md を対象に、session-supervisor であることだけを理由とする今回限りの例外承認を要求する規定の残存を検索する（rg。See Also 等の参照行は検出対象外とする扱いを明示）。あわせて artifact-contracts 同節の二段階承認（第1承認・第2承認）と REQ-008-052〜058 の7行が原文どおりであることを git diff で確認する。検索網羅範囲が修正対象列挙（REQ-008.md、artifact-contracts.md、RU-0181.md）と一致することを確認する。
    pass_criteria: |
      主体のみを理由とする例外承認要求の現行規定が 0 件。二段階承認の許可構造（内容承認のみでは採番・保存・commit・push を行わない）が原文どおり維持されていること。REQ-008-052〜058 の7行に差分なし。
    on_failure: |
      fix-and-reverify。残存した同一制限の現行 Guide・実行手順・Template・検証処理は本 Case で同じ変更を反映して解消する。
  - id: TS-003
    target_item: AG-004
    verification: |
      変更適用後の .agentdev/backlog/req-units/RU-0181.md に対して (1) frontmatter 13フィールド（generation_actor: session-supervisor を含む）が不変であること、(2) 26件の AC 本文が合意済み内容案（C:/Users/ogatay/AppData/Local/hermes/cache/scratch/ADF-v4-canonical-convergence-revised-20261007.md）と逐語一致すること、(3) 文字列「今回限りの生成主体差異承認」の残存が 0 件であること、(4) 最新の承認状態（内容承認、永続化承認、承認記録の記入時刻、後続工程承認、baseline 記述）が保持されていること、を確認する。マージ後の main に対しては bun C:/Users/ogatay/AppData/Local/hermes/cache/scratch/verify-ru0181.mjs を --allow-approved-exception なしで実行する（配置前に作成・実行済みであることを確認する）。マージ前の worktree では同スクリプトの判定条件と等価の検査（diff・grep）を worktree の RU-0181.md へ適用する。
    pass_criteria: |
      全検査合格。verify-ru0181.mjs が終了コード 0 で終了し、"generation_actor": "regular-route" を含む JSON を出力すること。RU-0181 の差分が冒頭 blockquote 1行と承認状態の該当1行の計2行置換に限定されること。
    on_failure: |
      fix-and-reverify。RU-0181 の許可されていない変更（26件の AC、frontmatter、最新承認状態の改変）を検出した場合は当該変更を元に戻し、正規ルート記録への置換のみを再適用して再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |
      変更全域の差分（git diff、マージ前 worktree で実施）が REQ-008.md の1行、artifact-contracts.md の2行、RU-0181.md の2行の計5行置換のみであることを確認する。agreement_confirmed_at と generated_at の意味と順序規定（generated_at >= agreement_confirmed_at）、generation_stage: pre-req-define、保存先（.agentdev/backlog/req-units/）、採番（既存最大番号+1）、本文8セクション、暫定7分類、依存先記録、session 論理URI の各規定が原文どおりであることを確認する。歴史記録（docs/requirements/retired/、superseded Decision、docs/reports/）への変更が 0 件であることと、baseline tag baseline-v4-canonical-convergence-20261007 が 72e04cadc4ff8fa00b6f484f421975c99a75b449 を指すことを確認する。
    pass_criteria: |
      差分が5行置換（削除5行・追加5行）に一致し、他契約の規定変更が 0 件、歴史記録の変更が 0 件、baseline tag が不変であること。
    on_failure: |
      fix-and-reverify。意図しない差分は本 Case 内で除去して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs 変更（REQ-008.md、artifact-contracts.md）に対して既存プロジェクト推敲工程（yomiyasu）を適用する。agentdev-textlint-guard による書込み前検査と最終検査を実行する。変更後に docs の構造・参照検証（対象検証、targeted docs guard を含む docs-check 系検証）を実行する。
    pass_criteria: |
      推敲工程の実施と textlint 検査の合格（fail 0 件）。docs 構造・参照検証の fail 0 件。
    on_failure: |
      fix-and-reverify。検出された指摘は本 Case 内で解消して再検証する。

realization_actions:
  - id: RA-001
    concern: RU-0181 の今回限り例外記録から正規ルート記録への更新（durable state 実現面）
    responsibility: |
      .agentdev/backlog/req-units/RU-0181.md の冒頭 blockquote と「承認状態」節の「今回限りの生成主体差異承認」項を正規ルートの記録へ置換する。generation_actor: session-supervisor、frontmatter の他12フィールド、26件の AC 本文、目的、対象、対象外、禁止、依存関係、v4 再収束の本文内容、および最新の承認状態（内容承認、永続化承認、承認記録の記入時刻、後続工程承認、baseline 記述）は一切変更しない。文字列「今回限りの生成主体差異承認」を本文へ残存させない。変更は main 0b442b1e 時点の本文に対する2行置換に限定し、以前の未承認の記述へ戻さない。
      RU-0181 は本 Case の入力 RU ではなく消費対象としない。REQ-008-010 の case-ready 成功後削除の適用対象に RU-0181 を含めない（消費・削除しない）。
    ownership_hints:
      - '対象: .agentdev/backlog/req-units/RU-0181.md（baseline: main commit 0b442b1edfc1c2323e4b5303be14b914cd4bc274、sha256 b68d0102ef55d29822ecabcc1d0f1d220c5ee8dbdd46e5afeb3fee78cdb5087e）'
      - '置換1（冒頭 blockquote、23行目）: 次の行へ置換する -> > 永続ID: `RU-0181`。レビューと追加合意を反映した session 由来 RU。生成主体は正規ルートの実主体 `session-supervisor` であり、その記録は「承認状態」に保持する。'
      - '置換2（承認状態、602行目）: 次の行へ置換する -> - 生成主体の記録: 保存時の確認フォーム回答「今回限りの差異を承認し、そのまま実行する」に基づき、本 RU の `generation_actor` を実主体である `session-supervisor` として記録した。2026-10-07 のユーザー指示「session-supervisorを正規ルートとすること」により一般契約を正規ルートへ改訂しており、本 RU の生成主体記録は例外承認に依存しない正規ルートの記録である。'
      - '置換前文言（原本確認用、冒頭 blockquote）: > 永続ID: `RU-0181`。レビューと追加合意を反映した session 由来 RU。生成主体の今回限りの契約差異は「承認状態」に記録する。'
      - '置換前文言（原本確認用、承認状態項）: - 今回限りの生成主体差異承認: 保存前の確認フォームに対する「今回限りの差異を承認し、そのまま実行する」。本 RU の `generation_actor` は実主体である `session-supervisor` とする。現行 REQ-008-051 と artifact-contracts の固定値 `req-define-parent` との差異を承認されたものであり、一般契約の改訂や他 RU への例外適用ではない。'
      - '組立証拠: assemble-draft-section.ts による決定的組立（edit4/edit5、各 match 1・replaced 1、前後検査全合格、差分2行。RU-0181.step2.md と同等の結果を再現すること）'
      - '検証: verify-ru0181.mjs（--allow-approved-exception なし）の RU 側条件、TS-003'
    intent: |
      RU-0181 の生成主体記録を例外承認に依存しない正規ルートの記録とし、受け入れ条件（RU-0181 が正規主体の記録となり26件の AC が合意済み内容案と逐語一致する）を満たす。REQ-008-051 と artifact-contracts の契約更新と同一変更セットで適用し、単独での片側適用を行わない。
    verification_refs: [TS-003]
    source_items: [AG-004]

case_open_hints:
  epic_needed: false
```

# summary

## 確定根拠記録（人間可読補助。処理の正は draft-data YAML ブロックである）

- 入力: 単一の合意済み入力 C:/Users/ogatay/AppData/Local/hermes/cache/scratch/req-input-session-supervisor-regular-route.md（sha256 a52364abec4d6363f6d7650265053313b72274716ff235b63d1224de488ae44b）。RU-0181 は入力ではなく変更対象（参照専用）。RU-0181 の v4 全域再収束としての要件化・実装は本 draft の対象外であり、ユーザー承認済みの別 Root で処理する。本 Root はそれを開始せず、Supervisor照合後の単一case-autoに委ねる。一般プールの case-auto は本 draft では起動しない（Supervisor が両 draft を照合し、単一の case-auto で処理する）。
- 変更対象の実在確認（baseline: main 0b442b1edfc1c2323e4b5303be14b914cd4bc274）: REQ-008-051（docs/requirements/REQ-008.md 68行）、artifact-contracts.md 537行・568行。docs/・src/ 横断で req-define-parent / session-supervisor の同一制限はこの3箇所のみ。src/ 配布物（agentdev-workflow-req-define SKILL.md・references/input-and-dialogue.md、backlog-review コマンド・SKILL.md、references/contradiction-ru-and-persistence.md）はすべて正規原本（artifact-contracts Design）への委譲記述で再定義なし。
- Decision 判断（STEP-5）: Decision 不要。適用基準は Decision 禁止ゲート「artifact contract 変更（frontmatter 規約の変更）」「既存文書種別への適合」「運用ルールの変更」。根拠: 技術判断（構造・コンポーネント関係・スタック選定）を含まない、docs/decisions/ 全域に関連 Decision なし（session-supervisor / generation_actor / session由来RU / 生成主体 の検索で 0 件）、生成手続き（二段階承認・時刻順序・保存先・採番・8セクション・7分類）は不変。architecture-advisory 助言（4ラベル構造、確定事項4・推定事項3・ユーザー確認事項なし・ブロッカーなし）を分類採用済み。推定事項 P-2（同一変更セット一括更新）は artifact_actions と RA-001 の同一適用指示として反映、P-3（RU-0181 該当行の更新必須）は AG-004・RA-001・TS-003 として反映。
- design 対応事前確認: REQ-008-051 は既存行の意味変更であり、その design 対応（artifact-contracts「RU アーティファクト契約（session由来RU）」節）は ACT-DESIGN-001 として変更スコープに内包済み（traceability sidecar は未整備のため正規成果物の直接読取で確認。同節冒頭が REQ-008 依拠を明記）。
- Jev 先行評価（REQ-090 Stage 1）: 既存REQ照合判断 = UPDATE・追加確認不要（観測 20261007T051752Z-c11a、evaluator と最終判断一致）。要件展開の最終分類・Design 分離 = 最終判断は REQ行 が主たる帰属（既存要件行の意味変更が永続基準側の変更、Design は運用契約の対応更新。Jev は Design行 0.58・confidence 0.17 で差異あり、差異理由 semantic_disagreement を観測へ記録済み）、分離 = 既存分離構造の維持で新規分離なし（観測 20261007T051752Z-0904）。
- SPLIT 予兆計測（既存 REQ-008、UPDATE 対象）: 要件行数 61（シグナル +1）、関心分類数 4シグナル検出（+1）、成果物種別数 5種（+1）、Design 分離基準違反 0（+0）、合計 3（SPLIT 推奨域）。ただし本変更は APPEND を伴わない UPDATE のみであり、変更範囲は合意済み入力の限定修正（最小差分）に限定されるため SPLIT 提案は実施しない（提案契機は APPEND 実施前）。REQ-008 の体系再評価は RU-0181 の v4 再収束（別 Root）の評価対象である。
- 変更誘発境界リスク分析（5観点の確認記録）: dependency 境界（REQ-008-051 と artifact-contracts 節の同時更新必須。同一変更セット指示と TS-001/TS-002 で検査）、client/server 境界（generation_actor を読む実装は src/ に存在せず、消費契約は正規原本への委譲。TS-002 の残存検索で検査）、execution 境界（RU-0181 更新は契約更新と同一 Case 内で適用。verify スクリプトの worktree と main の時点差を TS-003 で扱い分け）、build/runtime 境界（docs と durable state のみで src/ 実装変更なし。TS-004 の差分5行限定で検査）、environment propagation 境界（baseline tag 不変・歴史記録不変更。TS-004 で検査）。
- 決定的組立証拠（assemble-draft-section.ts、baseline 内容ハッシュ・検査範囲・実行条件は各結果 JSON の evidence 参照）: edit1（REQ-008-051 行、行68、match 1・replaced 1・前後検査全合格）、edit2（生成主体 bullet、行537、同合格）、edit3（frontmatter 表 generation_actor 行、行568、同合格）、edit4（RU-0181 冒頭 blockquote、行23、同合格）、edit5（RU-0181 承認状態、行602、同合格）。事後検査: artifact-contracts の差分2行、RU-0181 の差分2行、例外承認文字列の残存 0 件、後続工程承認・26 AC・frontmatter の完全保持、verify スクリプト正規化後条件のシミュレーション全成立。
- 前工程引き継ぎ判定: agentdev_handoff = false（AgentDevFlow 本体の正規 REQ/Design と durable state の直接変更であり、配布物不具合の引き継ぎ RU ではない）。
