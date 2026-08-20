# STEP-1/2: 入力解決・壁打ち対話（input-and-dialogue）

> 本 reference は `agentdev-workflow-req-define` SKILL.md の STEP-1、STEP-2 詳細である。
> セッションコンテキスト検知・入力解決と壁打ち対話を提供する。

## 目次

- STEP-1: セッションコンテキスト検知・入力解決
- STEP-2: 壁打ち対話（引き継ぎ判定含む）

## STEP-1: セッションコンテキスト検知・入力解決

### Purpose

引数とセッション状態から有効な Requirement Source を構成し、入力ソースを確定する。

### Input Resolution

1. SSoT 再構成: 明示入力ファイル（設計メモ、RU、検出事項）および実証Issue 本文の実ファイル読込
2. identifier 保持: RU-ID、Issue番号（URL 指定時、実証Issue 指定時）
3. 最小 scalar: なし
4. runtime artifact: セッション履歴・現在コンテキスト（推論の入力、権威情報源ではない）

### Preconditions

- req-define command が起動している

### Procedure

- **引数なし単体実行時**: `agentdev-req-analysis` に従い、当該セッション履歴・現在コンテキストから6項目（要件内容、work_type、scale、Decision、構造化、適用範囲）を推論し信頼度付きで表示する。Confirmed のみで要件doc自足可能なら STEP-3 以降へ、部分的不足で補足質問解消可能なら壁打ち（STEP-2）へ、有効な Requirement Source 構成不能なら RU 自動検出へ
- **明示入力ファイル指定時**: Read tool で読み込み、壁打ちの初期コンテキストとして扱う。複数ファイル指定時は全て読み込む
- **RU 自動検出**: 引数なしでセッションから有効な入力を構成できなかった場合のみ、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し1件なら自動検出する。0件なら STEP-2 へ。2件以上なら候補一覧を表示し自動選択しない
- **実証Issue 明示指定時**: 引数に実証Issue を指定された場合、当該実証の正式化を主たる入力として扱う。評価契約、最終評価結果、参照証拠を当該 Issue 本文と関連 PR から取り込む。実証Issue 明示指定時に RU 自動検出と混在する場合は、どちらを処理するかユーザーへ確認する（入力優先規定。詳細は req-define command Design（extension 経由）参照）
- **session由来RU 受領時**: 読み込んだRU が `source_type: chat` かつ `generated_by: session` の場合、session由来RU 消費契約に従う。`session:...` 論理URI の解決、必須8セクション読み取り契約、`tentative_classification` → 最終分類の扱いは正規原本（一時成果物ライフサイクル要件、artifact-contracts Design）へ委譲する
- セッション履歴、現在コンテキストおよび RU のいずれからも有効な入力を構成できない場合、壁打ち対話を開始する

### Result

- 入力ソース確定（セッション推論 / 明示ファイル / RU / 実証Issue / 対話開始）

### Evidence

- 6項目推論結果（信頼度付き）、読み込んだ入力ファイルの一覧

### Completion Verification

- 入力ソースが一意に確定し、RU 複数候補時は自動選択していないこと。実証Issue 明示指定と RU 自動検出が混在した場合は処理対象をユーザー確認済みであること

### Resume-Idempotency

- 読取と推論のみで副作用を持たない。再実行時は同一入力から同一のソース確定に到達する

## STEP-2: 壁打ち対話（引き継ぎ判定含む）

### Purpose

`agentdev-req-analysis` に従って要件を深掘りし、合意内容を確定する。

### Input Resolution

1. SSoT 再構成: 明示入力ファイルの内容（開始点として活用）
2. identifier 保持: RU-ID
3. 最小 scalar: なし
4. runtime artifact: 壁打ちで確定した合議内容（draft-data 下書きへ逐次反映）

### Preconditions

- STEP-1 で入力ソースが確定している

### Procedure

`agentdev-req-analysis` に従って深掘りする。
明示入力ファイルがある場合、その内容を開始点として活用する。
確定した合意内容は都度 draft-data 下書き（runtime artifact）へ反映し、対話ターン依存状態と durable state を分離する。

**前工程からの引き継ぎ判定**: 入力が AgentDevFlow 本体、配布 command、配布 skill、配布 template、配布 script の不具合または改善点を対象とする場合、`agentdev-workflow-lifecycle` に従い前工程からの引き継ぎ用 RU 入力として整理する。
現在プロジェクトの通常要件docとして定義せず、出力に `agentdev_handoff: true` を含める。

**実証Case判定**: 実証必要性を推論する。推論の観点は次の3つである: 調査・設計だけでは重要な採否判断を確定できないか、実行・測定・観察が必要か、単なる追加調査でないか。単なる追加調査だけを理由に実証Caseとしない。
ユーザーが実証を明示している場合は再確認せず実証Caseとして扱う。明示していない場合は実証を推奨する理由を提示し、壁打ちにより実証Caseへの移行を確定する。
実証Caseとして確定した後は評価ブランチ利用を別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出する。
実証は work_type とは別の性質として扱い、work_type の値を実証のために増やさない。
実証Case判定と評価契約の意味論は評価ブランチ実証ワークフロー要件が正規所有し、本 workflow は判定の実行位置を提供する。

### Result

- 深掘り済み要件内容、`agentdev_handoff` 判定結果、実証Case判定結果（実証/通常の別）

### Evidence

- draft-data 下書きの合意項目、引き継ぎ判定の根拠、実証Case判定の根拠（実証必要性推論、ユーザー明示の有無）

### Completion Verification

- 合意内容が draft-data 下書きに反映されており、未解決質問・未解決衝突が残っていないこと（残る場合は対話継続）。実証を推奨した場合は実証Caseへの移行の確定または却下が済んでいること

### Resume-Idempotency

- 対話中断後は draft-data 下書きから合意済み内容を再構成し、未解決項目のみ再対話する。合意済み項目を再質問しない

## 関連 STEP

- 前: なし（workflow 開始）
- 次: STEP-3（requirement-development.md）

## 関連 Capability Skill

- `agentdev-req-analysis`: セッションコンテキスト検知、壁打ち深掘り
- `agentdev-workflow-lifecycle`: 前工程引き継ぎ判定

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（壁打ちフェーズのみ、実装コード禁止）
- 不変条件（関連ドキュメントの個別ファイル列挙をユーザーに求めない）
- G04（明示入力ファイルは参照専用、RU 削除しない）
- 不変条件（inbox.md/deferred.md 直接ロード禁止、採用済み成果物の直読み禁止）
