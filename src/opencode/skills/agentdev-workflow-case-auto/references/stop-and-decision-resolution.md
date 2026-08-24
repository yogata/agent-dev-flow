# STEP-4/5/6: 停止条件検出・adversarial-review 由来の停止伝播・bounded parent decision resolution（stop-and-decision-resolution）

> 本 reference は `agentdev-workflow-case-auto` SKILL.md の Control Plane STEP-4, STEP-5, STEP-6 詳細である。
> 停止条件検出（11項目）・停止理由分類（7軸＋上位合意矛盾/新規ユーザー判断）、adversarial-review 由来の停止伝播、bounded parent decision resolution（限定的親判断解決）を提供する。

## 目次

- STEP-4: 停止条件検出・停止理由分類
- STEP-5: adversarial-review 由来の停止伝播
- STEP-6: bounded parent decision resolution

## STEP-4: 停止条件検出・停止理由分類

### Purpose

11項目の停止条件を検出し、停止理由を分類軸で報告して再開可能な次コマンドを提示する。

### Input Resolution

1. SSoT 再構成: 各工程の結果、Issue/PR 状態、`case_auto_started_at` と L1 工程別タイムスタンプ
2. identifier 保持: Issue番号、PR番号、OU ID
3. 最小 scalar: 停止時刻、経過時間
4. runtime artifact: なし

### Preconditions

- STEP-3 で各工程の結果を受領

### Procedure

#### 停止条件（11項目）

以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する。

1. req-define 合意要件からの逸脱
2. 要件未合意の scope 拡大
3. repo 外実体変更の必要性
4. DB migration 実行の必要性
5. deploy/apply の必要性
6. 認証・秘密・権限変更の必要性
7. CI/test/lint 失敗が self-healing 不能
8. コンフリクト解消モデル Level 1〜3 全てを試行しても解消不能なコンフリクト（Level 2 インライン case-run 再実行を上限回数 2回試行しても解消しない場合、機械的競合 Level 1 で自動解決可能は停止条件外、remote hash 不一致は停止条件）
9. 作成元不明 branch / user-owned branch / 他作業 branch の削除検出
10. 未コミット変更の帰属不明
11. command 契約・実装不整合（execution_unit へ分割可能にも関わらず case-open が単一 Epic 子 Issue 上限により停止した場合を含む）

#### 実証Case停止時の評価ブランチ保持

停止条件該当時・blocked / failed 受領時・ユーザー中断時に、実証Caseで再開可能な場合は評価ブランチを保持する。blocked / failed を理由に評価ブランチを自動破棄せず、実証の明示的な終了・放棄時のみ必要な記録を残した後に破棄する。停止時報告には保持中の評価ブランチと再開手段を含める。

#### 停止時タイミング情報の追記

停止報告に `case_auto_started_at`、停止時刻（JST、人間が読みやすい形式）、経過時間、STEP-3 で記録した工程別タイムスタンプ内訳（停止時点までの工程分）を含める。

#### 停止理由分類（7軸＋上位合意矛盾/新規ユーザー判断）

停止条件を次の分類軸で報告する（HITL 境界の変更ではなく、再開コマンド選択とユーザー通知の精度向上が目的）。

| 分類軸 | 対応停止条件 |
|---|---|
| req-define 合意要件からの逸脱 | (1) |
| command 契約・実装不整合 | (11) |
| 要件未合意のスコープ拡大 | (2) |
| repo 外実体変更 | (3)(4)(5)(6) |
| CI/test/lint 失敗 | (7)(8) |
| branch 削除検出 | (9) |
| 未コミット変更の帰属不明 | (10) |
| 上位合意矛盾 | bounded parent decision resolution で decision_context が現行正規成果物間の矛盾に起因する場合 |
| 新規ユーザー判断事項 | 同 decision_context が新しいユーザー価値判断・対象範囲変更・外部契約変更を必要とする場合 |

execution_unit 分割可能性があるにも関わらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する（case-open の契約・実装不整合であり要件doc 側の問題ではない）。
各分類の定義、対応停止条件、再開コマンド候補の詳細は `agentdev-workflow-orchestration` を参照。

### Result

- 停止判定（11項目のいずれか）
- 停止理由分類（9軸のいずれか）
- 停止時タイミング情報

### Evidence

- 検出した停止条件と根拠、停止理由分類、停止時タイミング情報（開始時刻、停止時刻、経過時間、工程別内訳）

### Completion Verification

- 停止条件非該当時は次工程へ継続していること。該当時は停止理由・現在地点・再開可能な次コマンドが報告されていること

### Resume-Idempotency

- 停止判定は各工程の durable state からの評価であり副作用を持たない。再開時は停止報告の再開ポイントから再構成する

## STEP-5: adversarial-review 由来の停止伝播

### Purpose

下位 command から受領した adversarial-review 由来の user-decision-required + decision_context を伝播し、当該 execution_unit の自走を停止してユーザー判断を待機する。

### Input Resolution

1. SSoT 再構成: decision_context（下位 command が構造化したもの）
2. identifier 保持: Issue番号、execution_unit ID
3. 最小 scalar: なし
4. runtime artifact: なし（raw finding は解決対象としない）

### Preconditions

- STEP-3（各工程の実行）で下位 command から adversarial-review 由来の user-decision-required + decision_context を受領

### Procedure

case-auto は当該 execution_unit の自走を停止し、ユーザー判断を待機する。
停止伝播契約の詳細は case-auto command Design（project extension 経由参照）「adversarial-review 由来の停止伝播（case-auto の停止伝播受領）」節を正とする。

- **受領**: case-run 起源は result `blocked` + user-decision-required 分類、工程委譲起源は既存 status + `parent_decision_required`（workflow-contracts Design「adversarial-review 由来の停止信号」節、delegation-contracts Design「review 経路での parent_decision_required / decision_context 適用」節）。user-decision-required は case-run result enum 第5状態ではなく停止理由分類である
- **自走停止**: 当該 execution_unit のみ停止。他 ready 対象は継続（部分停止、STEP-3 Wave 反復制御）
- **ユーザー提示**: decision_context をユーザーへ提示し判断を待機
- **resume point**: case-run 起源は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源は当該工程の委譲起点
- **再開**: ユーザー判断解決後、resume point から再開。adversarial-review 再発動要否は adversarial-review Design「再 review 条件」「再 review 停止条件」に従い case-auto は独自判断しない

case-auto は停止伝播受領において review 直接起動、finding 解釈、採否、再評価を行わない。
これらは下位 command の責務であり、case-auto は伝播と再開のみを担う。
user-decision-required は STEP-4 の HITL 境界停止条件分類とは独立する停止理由分類である。
停止報告（STEP-8）には user-decision-required を停止理由分類として含める。

### Result

- 当該 execution_unit の自走停止
- decision_context のユーザー提示
- resume point 記録

### Evidence

- user-decision-required の受領形式（case-run 起源 / 工程委譲起源）、decision_context、resume point 記録

### Completion Verification

- 当該 execution_unit のみ停止し、他 ready 対象が継続（部分停止）していること。ユーザー提示と resume point が記録されていること

### Resume-Idempotency

- ユーザー判断解決後、resume point（durable state: Issue/PR 状態、委譲起点）から再開する。再 review 要否は case-auto が独自判断しない

## STEP-6: bounded parent decision resolution

### Purpose

下位 command から受領した decision_context を限定的に自律解決し、default-on + skip policy と自走性を両立する。

### Input Resolution

1. SSoT 再構成: 現行正規成果物（REQ、Decision、Design、Issue その他合意済み情報）
2. identifier 保持: Issue番号、execution_unit ID
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 下位 command から decision_context を受領

### Procedure

case-auto は下位 command から受領した decision_context を限定的に自律解決する。
default-on + skip policy と case-auto の自走性を両立し、ユーザー停止を本質的な場面へ集約する。
解決範囲、作業仮定の明示要件、停止理由分類の詳細は case-auto command Design（project extension 経由参照）「bounded parent decision resolution」節、delegation-contracts Design「case-auto による decision_context の限定的親判断解決」節、workflow-contracts Design「bounded parent decision resolution と停止・resume 伝播」節が正である。

| 分類 | 条件 | アクション |
|---|---|---|
| 自律解決 | decision_context が現行正規成果物（REQ、Decision、Design、Issue その他合意済み情報）から一意に回答可能 | ユーザー停止せず回答して下位 command を resume |
| 作業仮定で継続 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細 | 既存契約で許容された範囲に限り作業仮定と根拠を明示して自走継続 |
| 上位合意矛盾 | decision_context が現行正規成果物間の矛盾に起因 | 当該矛盾そのものが finding の対象であり一方を勝手に採用せず停止（STEP-4 停止理由分類「上位合意矛盾」） |
| 新規ユーザー判断事項 | 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要 | 既存停止経路でユーザーへ返す（STEP-4 停止理由分類「新規ユーザー判断事項」） |

- **resume**: 回答、根拠、作業仮定を下位 command へ返し、既存 resume point から処理を継続する。新規永続結果型は導入しない。adversarial-review 再実行要否は adversarial-review 側の再 review 契約に従い case-auto は独自判断しない
- **評価契約の扱い**: 実証Caseの評価契約の変更は自律解決・作業仮定の対象外とする。ユーザーが評価契約変更を明示した場合のみ、変更履歴と既存結果への影響を保持し、必要な再評価または再実行を継続する
- **中央集約 review engine とはならない**: case-auto は raw finding を解釈、採否、候補反映しない。下位 command が構造化した decision_context のみを解決対象とし、raw finding を case-auto へそのまま渡さない

### Result

- 自律解決時: 回答・根拠・作業仮定を下位 command へ返し resume
- 上位合意矛盾/新規ユーザー判断時: STEP-4 停止経路へ

### Evidence

- decision_context の分類（自律解決/作業仮定/上位合意矛盾/新規ユーザー判断）、回答と根拠（自律解決時）、作業仮定の明示（作業仮定継続時）

### Completion Verification

- 分類が4分類のいずれかであり、作業仮定で継続時に仮定と根拠が明示されていること。raw finding を解決対象にしていないこと

### Resume-Idempotency

- 回答・根拠・作業仮定を下位 command へ返し既存 resume point（durable state）から継続する。新規永続結果型は導入しないため再実行は冪等

## resume point

- 停止条件検出結果（11項目のいずれか該当・非該当）
- 停止理由分類（9軸のいずれか）
- adversarial-review 由来の user-decision-required 受領状態、decision_context、resume point
- bounded parent decision resolution 判定結果（自律解決/作業仮定/上位合意矛盾/新規ユーザー判断）

## 関連 STEP

- 前: STEP-3（input-resolution-and-orchestration）
- 次: STEP-8（conflict-resolution-and-reporting、停止報告時）

## 関連 Capability Skill

- `agentdev-workflow-orchestration`: 停止理由分類詳細、再開コマンド候補、capture 境界、bg task 破棄検知時の回復
- `agentdev-adversarial-review`: 停止伝播のみ受領（case-auto は直接起動しない）、再 review 条件・停止条件の正
- `agentdev-project-extensions`: case-auto command Design extension 経由（停止伝播契約、bounded parent decision resolution）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（子 task bg task 破棄検知時の回復で、未コミット変更の帰属が確認できない場合に強制 commit を行わない、整合確認できない場合は当該子 task を `blocked` とし「未コミット変更の帰属不明」（停止条件 (10)）として報告）
