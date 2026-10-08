# QG-4: Final Acceptance Gate

case-close で PR マージ前に、最終受け入れ状態を確認する Gate。
本ファイルは QG-4 の判定基準、検査観点を定義する。
共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## v4 Quality モデルへの接続

本 Gate は ADF v4 Quality モデル（v4-quality-gate-model Design）の lifecycle 級 semantic Gate 群として再導出された QG-4（Final Acceptance）である。
本ファイルの 3 層は同 Design「再導出結果（lifecycle 級 semantic Gate 群）」表の QG-4 行と次のように対応する。

| 層 | 対応内容 |
|---|---|
| Verification Obligation | test strategy 3 要素完全性・リスクから test strategy への投影完全性・full integrity suite 受入れ・traceability check 前提手順・verify-only 証拠ソース・正規契約からの検証義務導出（判断方法 3 分類・確定権限区分の適用）と完了判定の双方向忠実性・not applicable 根拠確認・完了条件単位の最終評価（証拠の意味対応、全称・不存在条件の反例探索、非循環証拠、反例の対象外化禁止、検証方法弱化禁止、必須未達存在時の close 拒否、親横断義務の Epic/Root 最終終了時評価）（v4-quality-gate-model Design「QG-2 / QG-4 の受け入れ義務保存拡張」節） |
| Verifier | deterministic + semantic |
| Evidence | QG-4 結果コメント・suite 実行ログ・SSoT コメント（機械的証拠） |

- 対象遷移（v4 lifecycle deterministic gate predicate 接続点）: closing 前（子 Issue・Epic・Root Case の close 前）
- 判定値と Gate predicate の写像: `pass`/ `warn` のみ close 可。QG-4 は `partial` を不可として扱い、再判定は当該 close 内で完了させる。写像の正規定義は v4-quality-gate-model Design「判定値と遷移接続」節と [common-gate-contract.md](common-gate-contract.md)「5 概念への写像」を参照する
- 証拠分類の直交: 上表 Evidence の証拠分類（機械的）は Evidence の属性であり、Verifier 分類（deterministic/ semantic）とは直交する。正規定義は v4-quality-gate-model Design「証拠種別と Verifier 分類の直交」節を参照する
- v3 からの処遇: 保持（verify-only closure 証拠ソースと full suite 受入れ基準を維持。同 Design「QG-1〜QG-4 個別処遇対応表」の QG-4 行）
- 責務分界: Gate の意味契約の正は v4-quality-gate-model Design が所有し、full integrity suite 受入れ基準・bun test 正規形・機械受理基準の正規形は本スキル Design（本ファイルおよび references）が原本として保持する（二重管理を行わない）

## 目次

- [v4 Quality モデルへの接続](#v4-quality-モデルへの接続)
- [配置](#配置)
- [検査観点](#検査観点)
- [bun test フル suite 正規形（実行形態契約）](#bun-test-フル-suite-正規形実行形態契約)
- [pass/ fail 基準](#pass-fail-基準)
- [完了条件チェックボックス評価の具体手順](#完了条件チェックボックス評価の具体手順)
- [traceability check の横断 durable state 前提手順](#traceability-check-の横断-durable-state-前提手順)
- [委譲接続点](#委譲接続点)
- [責務境界](#責務境界)
- [See Also](#see-also)

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| case-close | STEP-2（達成判定、test strategy 処理完了確認）、STEP-3（docs 検証）、STEP-3-1（close 時局所確認） | PR/ CI 結果/ Issue 完了条件チェックボックス/ Issue テスト戦略項目/ PR Findings/ docs |

## 検査観点

### 1. 完了条件チェックボックス全達成

Issue 本文の `完了条件` セクションの全チェックボックスが `[x]`（達成）になっているか。

- **fail**: 未達チェックボックス（`- [ ]`）が残る。構造化エラーで停止（case-close の完了条件評価専任責務、`POL-completion-checkbox-single-writer`）。
- **pass**: 全チェックボックスが `[x]`。

#### 達成判定

unchecked 項目を達成判定する。
証拠ソース（コミット、PR、CI 結果等）に基づき、`agentdev-workflow-orchestration` のプロトコルに従い達成可否を判定する。

#### 未達項目の取り扱い

- 達成不可項目 → case-run への差し戻し（case-close の完了条件評価専任責務）。
- 今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない（case-close 不変条件）。
- スコープ外項目は `> ℹ️ 別途確認: {項目名}` 形式に変換（case-run STEP-S5 の責務）。

#### verify-only PR と verify-only closure の証拠ソース契約

完了条件評価の証拠ソースは、変更の有無に応じて次の2経路を区別する。

verify-only PR（実装差分0件、検証のみ）の場合、完了条件評価は PR 本文の verify-only 根拠欄（実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果）を証拠ソースとして認める。
verify-only PR の判定基準（PR 変更ファイル一覧が空配列、根拠欄の記載十分性、受け入れ基準の検証充足）は case-close 側の規則が定め、QG-4 は当該判定を経た PR のみを PASS とする。

verify-only closure（PR も carrier commit も存在しない Issue 完了）の場合、完了条件評価は case-run が記録した SSoT コメント（Issue コメント）の実行コマンド列と検証結果を証拠ソースとして認める。
verify-only closure では SSoT コメントが存在しない場合、または検証結果の記載が欠落する場合は完了扱いとしない。
verify-only closure の判定条件（execution contract での事前確定または実行結果による変更不要確定）は case-run・case-close の各 command Design が定め、QG-4 は当該判定を経た完了のみを PASS とする。

carrier commit（差分捏造）による verify-only PR 作成の禁止は case-run の実行契約（command Design）が所有する規則であり、本 reference は引用形式で言及するにとどめる。
docs_chore 特例フロー（main 直接 commit が存在する PR なし完了）は、直接 commit 内容で QG-4 を検証する別経路であり、verify-only PR・verify-only closure のいずれの証拠ソース契約とも区別する。

### 2. CI 通過確認

PR の CI が全て通過しているか。

- **fail**: CI 失敗。case-run に差し戻し（case-close 前出出力検証表 STEP-4 の検証基準）。
- **partial**: CI 実行中（pending）。CI 完了を待ってから再試行。
- **pass**: CI 全通過。

### 3. docs 整合性（機能追加固有）

機能追加の場合、以下が満たされているか。

- REQ 作成、インデックス記載
- Design 更新
- Decision 作成（必要な場合）
- 関連ドキュメント整合性確認
- README 索引整合性確認

- **warn**: 不足項目がある。不足の原因を分類する（REQ-{NNNN}-{NNN}）。証拠不足は証拠再取得、実装不具合・上流成果物の不備は正規所有工程〔case-run 差し戻し、case-close STEP-3 docs 検証・確定〕への処置、人間判断への引き上げ条件（REQ-{NNNN}、`<foundations/v4-responsibility-boundaries>` Design「人間判断への引き上げ条件」節）に該当する場合のみユーザー判断へ（case-close 不変条件・REQ-{NNNN}-{NNN}）。
- **pass**: 全て確認済み、または機能追加以外で docs 影響なし。

### 4. 文書分類ポリシー適合

最終ドキュメント状態が document-model Design の Document Classification Policy に適合しているか。

- **warn**: 分類ポリシーとの不適合候補がある。不適合の原因を分類して警告表示し、修正の実行は Gate が所有せず正規所有工程（case-close STEP-3 の docs 検証・確定）へ任せる。人間判断への引き上げ条件に該当する場合のみユーザー判断へ。
- **pass**: 分類ポリシーに適合。

### 5. close 時 Design/ commands/ skills 更新漏れ（局所確認）

今回の変更に伴う更新漏れの局所確認（case-close STEP-3-1）。

- Design 本文と実装の最終矛盾
- command 定義の更新漏れ
- skill 責務境界の変更漏れ

- **warn**: 更新漏れ候補がある。警告表示し、修正の実行は Gate が所有せず正規所有工程（case-close STEP-3 の docs 検証・確定）へ任せる。人間判断への引き上げ条件に該当する場合のみユーザー判断へ。
- **pass**: 更新漏れなし。

> **局所予防の範囲**: この確認は close 時の局所的な漏れ検出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない。

### 6. test strategy 処理完了

Issue 本文のテスト戦略セクションに含まれる全 test strategy 項目（verification / pass_criteria / on_failure の3要素構造）が処理済みであることを確認する。
各項目は「合格」（pass_criteria を満たす）または PR 本文の `## Findings / Capture候補` セクションへの Findings 記録（record-in-findings）のいずれかに分類されていること。

- **fail**: 未処理の test strategy 項目が残る。構造化エラーで停止（case-close の完了条件評価専任責務）。未処理項目が残る場合は完了扱いとしない。
- **pass**: 全項目が合格または Findings 記録済み。
- **N/A**: Issue 本文にテスト戦略セクションが存在しない場合（旧形式 Issue 等）。本観点は skip する。

> **前提**: test strategy 項目の検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復は case-run の実行担当サブエージェントが実施する。
> QG-4 はその処理結果（PR 本文の Findings 記録を含む）を最終確認する。

### 7. 機械横断是正向け完了判定

機械的テキスト置換、複数ディレクトリ横断是正を含む PR 向けの完了判定検査項目（L-012、PR #1090 / #1122 由来）。

- **検査項目**: 機械横断是正を含む PR は PR 本文に再 grep 結果（0 件）が記載されていることを完了条件とする
- **fail**: 再 grep 結果（0 件）の記載がない場合、完了扱いとしない（構造化エラーで停止）

### 8. PR 対象範囲 vs 全体 判定マトリクス

完了条件が横断評価（全成果物を横断する評価）を含む場合、PR が一部ファイル修正の時に「PR 対象範囲」で評価するか「全体（リポジトリ全体、または当該 Design/REQ 全体）」で評価するかを判定する（境界ケース #1532 由来）。

#### 判定マトリクス

| 完了条件の性質 | PR 修正範囲 | 評価スコープ | 理由 |
|---------------|------------|-------------|------|
| ファイル存在、識別子存在（パス指定、ID 指定） | PR に当該ファイル/ ID が含まれる | PR 対象範囲 | 対象が明示されており、PR 内で完結 |
| ファイル存在、識別子存在 | PR に当該ファイル/ ID が含まれない | 全体 | PR 外の対象も評価対象 |
| 数値閾値（NG 件数、IR 違反件数等の集計値） | 集計対象ファイルが PR に含まれる | 全体（再 grep、再検査を実施） | PR 外の変更が集計値に影響する可能性 |
| 横断是正（複数ディレクトリ機械的置換） | PR が一部ディレクトリのみ | 全体（再 grep 0 件確認） | 横断是正は全体で 0 件であることが本質 |
| Design 適合性確認 | Design 変更を含む PR | 全体 | Design と実装の全体整合性が対象 |

#### 評価手順

1. Issue 本文の完了条件チェックボックスから評価対象（ファイル/ ID/ 集計値/ 横断是正/ Design）を分類する
2. PR 変更ファイル一覧（`agentdev_gh` の pr_changed_files 操作）を取得する
3. 上記マトリクスを適用し、各完了条件の評価スコープ（PR 対象範囲 または 全体）を決定する
4. 決定した評価スコープで達成判定を実施する
5. 評価スコープが「全体」の場合、再 grep / 再検査 / 再計測を実施し、最新の証拠を取得する

判定:

- **fail**: 評価スコープの決定が曖昧、または決定したスコープで達成判定できない。
- **warn**: 評価スコープは決定したが、証拠が PR 時点のスナップショットに留まる（全体再評価を実施していない）。可能であれば全体再評価を推奨。
- **pass**: 各完了条件の評価スコープが決定済みで、決定したスコープで達成確認済み。

> **参照**: case-close STEP-2 は本マトリクスに従い PR 範囲 vs 全体の評価スコープを決定する。

### 9. 識別子中心評価の運用実例集

識別子中心評価（識別子を主評価値、実測値を補助値とする運用）の運用実例集。
主評価値は安定（実装進行中に変動しない）で、補助値はスナップショット（変動する）ため、識別子を主軸とすることで QG-3 前置 staleness check、QG-4 最終評価が安定して参照解決する（境界ケース #1532 に関連）。

#### 主評価値と補助値の使い分け

| 評価軸 | 種別 | 性質 | 用途 |
|--------|------|------|------|
| ファイル相対パス（配布コマンド定義の `case-run.md` 等） | 主評価値 | 安定 | 完了条件の判定主軸、staleness check の参照解決 |
| NG 識別子（`NG-xxx`） | 主評価値 | 安定 | 完了条件の判定主軸 |
| IR ID（`IR-NNN`） | 主評価値 | 安定 | 完了条件の判定主軸 |
| REQ ID（`REQ-NNNN-MMM`） | 主評価値 | 安定 | 完了条件の判定主軸 |
| NG 件数、IR 違反件数等の集計値 | 補助値 | 変動 | 識別子リストに付随する参考情報、再計測で更新 |
| ファイル行数、LF 数 | 補助値 | 変動 | 到達可能性検証（QG-2 観点6）の参考情報 |

#### 運用実例

**実例1: 完了条件の識別子中心記載（case-ready 責務）**

完了条件・事前状態の識別子中心記載は case-ready の責務である。
case-open は Root Case 確立時に完了条件を確定しない。
件数等の変動しやすい実測値は補助値として扱う。

```
## 完了条件（識別子中心）

- [ ] `agentdev-workflow-case-run` Workflow Skill（`.opencode/skills/agentdev-workflow-case-run/SKILL.md`）に staleness check Step が追加されていること
- [ ] 解消対象の NG 違反が解消されていること
- [ ] IR 違反が 0 件であること（参考: 現行 3 件）
```

**実例2: QG-3 前置 staleness check**

case-run の QG-3 前置 staleness check は完了条件の識別子（ファイルパス、NG ID、IR ID）を入力として、検出時点から起票時点までの状態変動を検出する。
件数（補助値）は変動するため主軸にしない。

**実例3: QG-4 完了条件最終評価**

case-close は完了条件を主評価値（識別子）で最終評価する。
補助値（件数等）は QG-4 観点8「PR 対象範囲 vs 全体 判定マトリクス」に従い全体再評価した最新値を参照する。

判定:

- **pass**: 完了条件が識別子中心で記載され、補助値が補助値として明示されている。
- **warn**: 完了条件が実測値中心で記載されており、識別子ベースの staleness check が困難。可能であれば識別子中心への記載見直しを推奨。
- **N/A**: 完了条件が識別子を含まない性質（例: テキスト品質の主観評価）の場合、本観点は skip する。

### 10. フル suite 機械受理（bun test 正規形）

test strategy が bun test フル suite の実行を要求する case では、フル suite の受理が機械受理基準（後述「bun test フル suite 正規形（実行形態契約）」の機械受理基準）を満たすことを確認する。
受理判断は PR 本文への記録の機械的検証（記録存在・形式・由来分類の完備）により行い、手動判断（記録を伴わない裁量判断）で代替しない。

- **fail**: 機械受理基準の記録が欠落する（正規ランナー構成確認の記録欠落、正規形以外の実行形態、環境ラベル欠落、件数突合未記録、由来分類未付与、終了コード・版・検査範囲の記録欠落）場合、または未登録の既知欠陥と由来不明の fail が合格の根拠に残存する場合。
- **pass**: 機械受理基準の全記録が存在し、由来不明 fail が 0 件である場合。
- **N/A**: test strategy が bun test フル suite の実行を要求しない場合、本観点は skip する。

### 11. 正規契約からの検証義務導出と完了判定の双方向忠実性

完了条件単位の達成判定は、正規契約（REQ、Decision、Design、Issue 本文の実行契約）から導出した検証義務に基づいて行う。
case-run が提示した検査対象、期待結果、除外条件、合格申告をそのまま最終基準として利用せず、実装結果から検証基準を逆算しない（v4-quality-gate-model Design「QG-2 / QG-4 の受け入れ義務保存拡張」節の実行時詳細）。

#### 検証義務の導出手順

1. 正規契約から検証義務を独立に形成する。導出対象は各義務の評価対象範囲、期待結果、反例条件、許容される除外である
2. 各検証義務の導出方法を、判断方法の 3 分類で判別する。3 分類は難易度順の段階構造ではなく性質による判別である:
   - **決定的処理**: 入力と確定済み規則から一意に導出できる処理（完了条件チェックボックスの抽出、識別子の照合、対象集合の列挙等）。決定的処理で導出する
   - **閉じた意味評価**: 必要な事実、判断基準、結果空間を評価前に限定でき、評価入力の構成に別の未解決意味判断を隠さない意味判断（証拠と基準の突合、根拠の有無判定等）。限定した事実・判断基準・結果空間を明示した上で評価する
   - **開いた推論**: 結果空間を事前に完全には限定できない推論。既存の判断権限モデルに従う工程（正規所有工程への差し戻し判断、adversarial-review、人間判断への引き上げ条件の適用等）へ引き渡す
3. 単純な全ツリー検索等の単一手段をすべての検証義務へ一般化しない。義務ごとに手順 2 の判別結果に応じた手段を適用する
4. 各検証義務の確定権限を判別する。正規契約からの導出で確定できる義務は Gate が判定し、委譲された裁量の範囲の義務は既存の裁量契約に従い、人間に留保された判断は既存の判断権限モデルに従ってユーザー判断へ引き上げる。新しい判断権限モデルを作らない

#### 双方向忠実性

- 正規契約で要求される事項を勝手に非該当化しない。必須条件の未達・未証明を `warn` や非該当の解釈で通過させない
- 正規契約で許容または対象外とされた事項を独自に必須化しない。対象外事項の再検証を新たな義務として追加しない
- 正規契約だけでは判定不能で新たな規範判断が必要な場合は既存の判断権限モデルに従う。Gate の裁量で新しい目的、対象範囲、外部契約、受け入れ条件、恒久規範を追加しない

#### not applicable の根拠確認

完了条件単位の判定を not applicable（非該当）とする場合、次を確認する:

1. 正規契約上の根拠（対象外記述、適用条件の不存在、当該観点の skip 条件等）が存在すること。Gate の裁量による非該当化を根拠としない
2. 根拠を判定記録へ明示すること。根拠のない非該当化は未達として扱う

判定:

- **fail**: 正規契約に根拠のない非該当化、正規契約外の独自必須化、case-run の合格申告を最終基準とした判定、単一手段で全検証義務を代替した導出、根拠のない not applicable が存在する。
- **pass**: 検証義務が正規契約から判断方法 3 分類に従い導出され、確定権限の判別と双方向忠実性が守られ、not applicable に正規契約上の根拠が存在する。

### 12. 完了条件単位の最終評価と非循環証拠

完了条件単位の評価区分（観点 11 で導出した検証義務に基づく pass / fail / blocked / not applicable）の適用、証拠の意味対応、全称・不存在条件の反例探索、非循環証拠、反例の対象外化禁止、検証方法弱化禁止、必須未達存在時の close 拒否、親横断義務の Epic/Root 最終終了時評価を検査する（v4-quality-gate-model Design「QG-2 / QG-4 の受け入れ義務保存拡張」節の実行時詳細。完了条件単位の評価区分と Gate 判定値の写像境界は common-gate-contract「完了条件単位の評価区分と Gate 判定値の写像境界」節）。

#### 検査手順

1. 各完了条件の判定を完了条件単位の評価区分で区別して記録する。not applicable には正規契約上の根拠を要求し、未投影、未実装、未検証、証拠不足、検証不能、予定変更対象外、実行担当の責務外判断を根拠にした非該当化を fail とする（観点 11 の not applicable 根拠確認と同一根拠を消費する）
2. 各 pass 判定の証拠がその条件の意味命題を実際に立証していることを確認する。条件ID・名称の一致、テスト名の類似、関連ファイルの検査といった形式的一致のみの達成証拠は fail とする
3. 「残存0件」「全経路」「すべて整合」「漏れなし」等の全称・不存在条件では、正規契約から導出した評価範囲への反例探索を確認する。変更ファイルのみまたは実装担当が選択した対象のみの確認で全評価範囲を被覆していない pass 判定は fail とする
4. Issue closed、PR merged、Child completed、Wave 完了、QG pass、完了条件チェック済み等の工程状態が、成立前提である機能・品質・契約条件の証明へ循環利用されていないことを確認する。工程状態自体が明示的な完了条件である場合は当該条件に限り直接証拠として利用できる（例外成立を判定記録で確認する）
5. 現在の完了条件を否定する反例 finding が、intake、learning、後続 Issue、Findings、別途確認等への分類だけで当該条件の達成扱いになっていないことを確認する。切り離しには正規な要件変更、対象範囲変更またはあらかじめ定められた項目固有処置を要する
6. 合意済み検証方法を別手段へ変更した判定では、元の検証義務に対する同等以上の観測能力と未証明範囲の不増の確認を要求する。同等性未確認の代替検査（通し実行から単体テスト、実 runtime から静的構造確認、実ホストからスタブ、リポジトリ全体から変更ファイルのみへの変更を含む）による pass 判定は fail とする
7. 終了対象が負う必須完了条件に fail、blocked、未判定、未投影、証拠不足、検証不能、意味不一致、未解決反例が1件でも存在する場合、close を拒否する。必須未達を Gate 全体の warn で通過させない
8. 子 Issue の終了は当該子が負う必須条件で判定し、親に残る横断義務の未完了を理由に条件を満たした子 Issue の終了を禁止しない。親の横断義務は Epic または Root Case の最終終了時に評価し、未成立が残る場合は Epic/Root を close しない

上記の構造的検査（証拠・根拠の性質検査、必須未達の集約、close 可否判定）は `agentdev-workflow-case-close` スキル配下の実行コード `scripts/src/final-acceptance.ts` の決定的関数 `evaluateFinalAcceptance` で行う（case-close STEP-2 の完了条件単位最終評価と同一の判定処理を消費する）。本関数は既存の QG-4 判定手順が消費する決定的検査であり、新しい品質ゲート、新しい結果状態、恒久的な受け入れ義務台帳を構成しない。

判定:

- **fail**: 形式的一致のみの達成証拠、評価範囲を被覆しない反例探索、工程状態の循環利用、反例の分類のみによる達成扱い、同等性未確認の検証方法変更による pass、根拠のない not applicable、必須未達の残存、必須未達の warn 通過、親横断義務未成立での Epic/Root close が存在する。
- **pass**: 完了条件単位の評価区分が正規契約から導出した検証義務に基づき適用され、証拠が意味命題を立証し、全称・不存在条件の反例探索が評価範囲を被覆し、非循環証拠で判定され、必須未達が存在せず、子完了と親横断義務が分離判定されている。

## bun test フル suite 正規形（実行形態契約）

`workflow_body_contract.test.ts` は配布Skill本文を複数回読み込んで検査する。同テストには明示的なタイムアウトを設定し、負荷確認では単体実行とフルsuiteの所要時間を分けて記録する。

full integrity suite 合格判定に用いる bun test フル suite の実行形態を、次のとおり正規形として確定する。
本契約は QG-4 の実行形態要件であり、実行環境の前提（worktree 構造的制約、依存パッケージ未伝播）は `agentdev-git-worktree` の worktree 構造的制約を参照する。
フル suite の実行は「正規ランナー構成確認 → 分割実行」の順で行い、構成確認を最初の前置ステップとする。
対象リポジトリの構成は可変であるため、本契約は構成確認の結果に応じた分割実行の枠組みを定義する。

### 正規ランナー構成確認（前置ステップ）

フル suite 実行の最初に、対象リポジトリの正規ランナー構成を確認する。
確認対象は package.json の scripts 定義等、リポジトリが採用するテストランナーの構成である。
ランナー不一致（例: vitest 運用のリポジトリで bun test を直接実行）に起因する擬似 fail を予防する。

確認手順:

1. package.json の scripts 定義（test 関連）を読み、正規のテストランナーと実行形態を特定する
2. workspace 構成（root workspace projects の有無と収録範囲）を確認する
3. 特定した正規ランナーが bun test であるか判定する
4. bun test 以外の場合は正規ランナーに合わせた実行形態へ切り替え、その構成を実行記録へ明示する

### 分割実行の枠組み

フル suite は分割実行で網羅し、分割の単位は root workspace projects と未収録プロジェクト個別実行とする。

分割手順:

1. workspace 定義に収録される各プロジェクト（root workspace projects）を個別に実行する
2. workspace 定義に未収録のテスト配置（plugins、scripts 等）を個別に実行する
3. 各実行の対象は `./` prefix 付きで明示指定し、cwd はリポジトリルートに統一する
4. 全分割実行の和集合がリポジトリ内の全 test ファイルを網羅することを件数突合で確認する

本リポジトリ（agent-dev-flow）における bun test の具体形は次の「3 cwd 分割実行」とする。

### 3 cwd 分割実行

フル suite（リポジトリ内の全 test ファイル）は、単一のカレントディレクトトリビアな実行（`bun test` 単体等）で代替しない。
次の3分割実行とし、各実行の cwd はリポジトリルート（worktree root または main root）に統一する。
各実行は `./` prefix 付きで対象ディレクトリを明示指定する。

| 分割 | 対象 |
|---|---|
| ① integrity suite | integrity 検査スイート全体 |
| ② src 側 skill script テスト | 配布 skill の script テスト群 |
| ③ repo ルート系 guard テスト | plugins・発行系等の repo ルート直下テスト |

起動コマンド（`<integrity-detector-skill>` は対象リポジトリの integrity 検査 skill 名に解決する）。各実行は stdout・stderr を分離した退避ファイルへ併退避し、stderr リダイレクト（`2>`）を常時付与する。退避ファイル名は実行ごとに採番し、stdout 側と stderr 側の対応が判別できる形とする:

```bash
bun test ./.opencode/skills/<integrity-detector-skill>/scripts/ >stdout-1.log 2>stderr-1.log
bun test ./src/common/skills/ >stdout-2.log 2>stderr-2.log
bun test ./.opencode/plugins/ ./scripts/ >stdout-3.log 2>stderr-3.log
```

- **worktree での分割③ 対象欠落の環境差**: worktree では `.opencode/plugins` の junction 未伝播により、分割③の対象（plugins）が実行対象から欠落し得る。この環境差を隠蔽せず、実行記録から実施範囲を判別できるように扱う。件数突合（「Ran N tests across M files」の N/M 件数）と環境ラベル（実行環境、junction 伝播状態）の双方から分割③の実施範囲（plugins 分割の実施・未実施の別）を判別可能に記録し、plugins 分割が未実施の場合は未実行対象を実行済みとして扱わない。plugins 分割を代替する検証手順（main root からの読取専用実行等）を運用する場合は、実在を確認した実行コマンド・手順のみを用い、実在確認していない CLI option を正規手順として固定しない

- **worktree 環境での checker 実行 fallback（junction 投影構成前置・zero-targets 無効分類・main root 切替）**: worktree 環境で `.opencode/skills/*` junction を前提とする検査を実行する場合の fallback 手順（fallback 判定、temp 領域への junction 投影構成を前置手順として実施してから検査、投影構成を作業 worktree へ適用しない）と、fallback 経路で検査対象が 0 件（zero-targets）に解決された場合の無効分類（検査を実施していない無効実行として記録し、合格として扱わない）、main root での再実行へ切替える条件（投影構成不能・fallback で検査対象が空・結果の信頼性が確保できない場合に main root 実体 + `--root` 明示指定の読取専用再実行へ切替）は checker 実行契約 Design（checker 実行契約と検出基盤規則）「worktree 環境での checker 実行 fallback（junction 未伝播時の SoT 直参照）」節が正であり、本 reference は参照のみを行う（実行条件の二重定義をしない）

- **環境差 fail の由来分離手順**: worktree 環境差に起因する fail・未実施の由来分離（main root 対照実行、baseline 再現、同一条件実行の3手段）と明示記録の運用は、docs/knowledge/worktree-environment-fail-classification.md を参照する。本節の「fail 由来分類」と併用する

- **依存パッケージ前置**: フル suite 実行の前に、正規テストが参照する package 境界（後述の対象ディレクトリ集合の両方）ごとに、必要な依存が解決可能な状態であること。本前置は `bun install` の実施そのものではなく依存解決状態を要求する契約であり、依存解決済みの正規環境を `bun install` 未実施であることのみを理由に fail としない。依存整備の要否をリポジトリルートの package.json / node_modules の有無のみで判定しない。node_modules は gitignore 対象のため worktree へ未伝播であり、依存未解決のまま実行した場合は integrity suite・分割② の一部テストが依存解決失敗で fail する

  依存が未解決の場合の正規整備手段は次の2つであり、フル suite 正規形・bun test 単独実行の別を問わず同一の許容手段を適用する（`agentdev-git-worktree` の worktree 構造的制約と同じ許容手段・適用範囲）:

  1. 依存を所有する package ディレクトリを対象とする `bun install`（package 単位の整備。リポジトリルートでの `bun install` を一般原則としない）

     ```bash
     bun install --cwd src/common/skills/agentdev-project-extensions/scripts
     bun install --cwd .opencode/skills/repo-agentdev-integrity/scripts
     ```

  2. main 側 `node_modules` への junction 作成（検証後に junction エントリのみを削除し、参照先の main 側 `node_modules` は破壊しない。手順詳細は `agentdev-git-worktree` の worktree 構造的制約を参照）

  - **対象ディレクトリ集合**: `agentdev-project-extensions` スキルの `scripts` ディレクトリ（zod 等の依存解決。分割② のテストと integrity suite からの相対 import 参照の前提）と `.opencode/skills/` 配下の `repo-` プレフィックス検査基盤の `scripts` ディレクトリ（worktree 実体。`typescript`・`@types/bun`・`@types/node` の依存解決）の両方
  - **tsc 型検証の型解決前提**: tsc 型検証（`tsc --noEmit`）を含む場合は、対象パッケージでの `bun install` による `@types/bun` 等の復元を前提とする。node_modules 未整備の状態では tsc の型解決が失敗する
  - **整備後の再実行手順**: 依存整備実施後は、依存解決失敗で fail したテスト・型検証を同一環境で再実行して当該 fail の解消を確認し、依存整備実施済みの旨（整備手段を含む）を環境ラベル（依存パッケージ状態）へ記録する

- **bun test 単独実行・ファイル単体指定の実行形態契約**: フル suite 正規形以外の bun test 実行（単独実行・ファイル単体指定を含む）の実行形態一般規約（repo root 起 cwd 統一、`./` 付きパス指定、逸脱時の検知条件）は、checker 実行契約 Design（checker 実行契約と検出基盤規則）「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節が所有する

- **Bun 依存 checker の実行経路**: integrity 検査の checker スクリプトを bun test の枠組み外で個別実行する場合は、Bun ランタイム API（Bun.YAML 等）に依存する checker を bun 経路で実行する。実行経路の使い分けの正契約は checker 実行契約 Design（checker 実行契約と検出基盤規則）「安定実行経路」節が所有する
- **実行形態規律（集約）の参照**: tsc（typecheck）は対象 package 配下を cwd として実行する、bun test は worktree root を cwd とし `./` 付きパス指定で実行する、worktree 再作成後は bun install を前置する（依存パッケージの未伝播対策）、分割実行②の対象で未収録の配置（tools 等）がないかを実行前に確認する、checker の ESM 互換性は個別差があるため実行不能な checker は bun 経由（モジュール import）へ切替える — の集約契約は checker 実行契約 Design「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節の「実行形態規律（集約）」が正であり、本 reference は参照のみを行う

- **timeout 明示指定**: bun test フル suite 全体実行を含む検証の実行指示は、実行 timeout を明示指定する。全体実行の実測所要時間は既定 timeout を超え得るため、**300〜600 秒の指定を標準**とする。timeout 未指定（既定値での打ち切り）で全体実行を打ち切った結果を fail 証跡として扱わない
- **件数突合**: 各実行結果の「Ran N tests across M files」の N/M 件数突合を行う。bun test はテスト結果サマリー（`Ran N tests across M files` 等の件数サマリー）を stderr へ出力するため、突合の根拠は stderr 側の退避ファイルとする。直前実績と比較して件数が急減していないかの妥当性を検証する（固定値の期待値化は行わない）
- **証跡の stdout・stderr 分離併退避（`2>` 常時付与）**: 各分割実行の証跡は stdout と stderr を分離してファイルへ併退避する。bun test は fail の詳細に加えて件数サマリーを stderr へ出力するため、stderr リダイレクト（`2>`）の付与を常時明示し、stdout のみの退避では「fail 由来分類」に必要な情報と件数突合の根拠が失われる。PowerShell コンソール上の表示出力はコンソールコードページによる再解釈を含むため証跡として扱わず、退避ファイルをもって証跡とする
- **カレントディレクトトリビアな実行の禁止**: 対象スイートには cwd 依存テストが混在するため、`bun test` 単体等での実行で正規形を代替しない
- **終了コード・版・検査範囲の保持**: 各分割実行の終了コード（検証コマンド自体の終了コード。表示用のパイプや後続処理の終了コードによる変換後の値ではない）、実行した正規ランナーの版、検査範囲（対象ディレクトリと実施範囲。分割③ 対象欠落等の環境差を含む）を証跡として保持する。保持先は既存の証跡チャネル（退避ファイル、PR 本文検証差分セクション、SSoT コメント）とし、新しい証跡基盤を追加しない

### 保存済み検証証跡からの解析と再実行条件

検証の実行と、保存された結果の表示・解析は分離する。

- 件数、失敗明細、サマリーの表示変更は、保存済み証跡（退避ファイル、PR 本文検証差分セクション、SSoT コメント）の読み戻しで行う。同一情報の取得だけを目的としたテスト・検査の再実行をしない
- 再実行は正当理由に該当する場合のみ実行する。正当理由は変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落の6種とし、実行記録へ該当した正当理由を明示する
- 保存出力の欠落、切断、タイムアウト、検査範囲欠落は完全な合格証拠として扱わない。timeout 打ち切り扱い（fail 証跡としない）、件数突合、PowerShell コンソール表示を証跡扱いしない既存規律を維持する
- 必須の版境界における再検証、close の最終検証（origin/main 取り込み済み・マージ直前の branch HEAD での実行）、QG-4 独立再検査、full suite 実行の省略禁止は維持する。同一版であることだけを理由に必要な再現確認・独立検査を拒否しない

### 環境ラベル

フル suite の実行記録には環境ラベルを付す。
環境ラベルは次の3要素で構成する。

- **実行環境**: worktree root または main root の別とパス
- **junction 伝播状態**: worktree では `.opencode/skills/agentdev-*` junction の未伝播、main では junction 構成の鮮度（未再構築の stale junction 有無）
- **依存パッケージ状態**: gitignore 対象 node_modules の伝播状態と `bun install` の要否・実施済み否か

採取手順（各実行の直前に採取し、実行記録と同じ PR 本文セクションへ記録する）:

1. **実行環境**: `git rev-parse --show-toplevel` で top-level パスを取得し、パスが `.worktrees/` 配下かで worktree / main の別を判定する。ブランチ名（`git branch --show-current`）と HEAD hash を併記する
2. **junction 伝播状態**: 対象 root 直下の `.opencode/skills/` 配下で junction エントリの有無を確認する（main root: junction 構成が存在するか、stale junction（参照先不在）の有無。worktree: 未伝播である旨）
3. **依存パッケージ状態**: integrity scripts ディレクトリと Project Extensions scripts ディレクトリの `node_modules` 存在確認結果と、`bun install` 前置の実施有無を記録する（整備手段と選択根拠は `agentdev-git-worktree` worktree-operations「bun test 実行の環境前提」の選択基準参照）

### fail 由来分類

フル suite の合格判定は、fail 全件の由来分類（変更由来 / pre-existing / 実行形態由来 / 不明）と検証環境の記録を前提とする。
由来分類は fail が 1 件以上ある場合に全 fail へ必須とし、由来不明の fail を合格の根拠にしない。
検証完了基準は由来不明 0 件である。
pre-existing と分類する根拠は、ワークツリー変更ゼロの baseline commit で同一テストを再実行し、同一 fail が再現することの確認とする。
remediation 開始後に作成した commit や base ブランチ比較のみを pre-existing の証拠として採用しない。
由来判定の基準 commit は remediation 開始前の baseline commit とする。
実行形態由来は、起動 cwd、ランナー、パス指定形式等の実行形態に起因する fail として分類し、実装由来（変更由来）と区別して記録する。実行形態由来と判定した fail は、当該実行結果を合格の根拠にせず、実行形態規律（checker 実行契約 Design「実行形態規律（集約）」節）へ適合させて再実行した結果を採用する。規律適合後の再実行でも fail が解消しない場合は、変更由来・pre-existing・不明のいずれかへ改めて由来分類する。実行形態由来の判定根拠は、環境ラベル（実行環境、junction 伝播状態、依存パッケージ状態）と起動コマンドの記録による。
本節の4分類と agentdev-quality-gates Design 機械受理基準の分類語彙の対応は次のとおりとし、機械受理基準の判定は本節の4分類で行う。

| 本節の分類 | 対応する Design 語彙 |
|---|---|
| 変更由来 | 当該変更起因 |
| pre-existing | 既知欠陥、環境依存（baseline commit で再現する fail） |
| 実行形態由来 | 語彙対応なし（本節で新設した分類。対応: 実行形態規律へ適合させて再実行し、その結果を採用） |
| 不明 | いずれにも分類できない fail |

証跡手順（fail 発見時にこの順序で実行し、記録を PR 本文の検証差分セクションへ残す）:

1. **単独再実行**: fail したテストファイルを単独で再実行し、再現性（同一 fail の再現 / 非再現）を確認する。単独実行結果（起動コマンド、pass/ fail 件数）を記録する。単独実行で再現しない fail は、同一環境ラベル下でのフル suite 再実行により状態依存性を確認する
2. **フル再実行**: 単独再実行の後にフル suite（同一 cwd 分割）を再実行し、fail 件数の変化を確認する。単独→フルの順序で得られた両記録は、fail が個別テストの問題か suite 実行の相互作用かを区別する証拠となる
3. **同一環境件数比較**: 単独再実行とフル再実行の pass/ fail 件数を、同一環境ラベル（実行環境、junction 伝播状態、依存パッケージ状態の3要素が一致する実行）の間でのみ比較する。環境ラベルが異なる実行結果の件数差を由来判定の根拠にしない。件数比較の結果（fail 件数の一致・不一致と、その解釈）を記録する
4. **baseline 再現確認**: pre-existing と分類する場合は、ワークツリー変更ゼロの baseline commit で同一テストを再実行した再現確認を記録する。baseline 再現確認の実施手順は、stash による退避を行わない detached worktree による baseline 比較（`agentdev-git-worktree` worktree-operations「git stash 運用手順（一時退避）」の detached worktree 標準手順）を用いる

#### baseline 系 durable state の並行追随差に起因する疑似 fail の3点対照手順

baseline 系 durable state（baseline commit、baseline 期待値・許容リスト等、並行 Case の merge で更新される基準状態）は、worktree 作成元の分岐点（baseline）と origin/main の現行状態との間に追随差を持ち得る。分岐点以降に origin/main へ他 Case の merge が入った状況では、当該変更と無関係なテストが baseline の陳腐化により疑似 fail することがある。この疑似 fail の由来分類は、次の3点対照手順で確定する。

| 対照 | 手順 | 判定への寄与 |
|---|---|---|
| ① 単独再実行 | fail したテストを同一環境ラベル下で単独に再実行し、再現の有無を確認する | 再現しない場合は状態依存・相互作用由来として本節証跡手順 1〜2 へ分岐する |
| ② 分岐点 main root 再現 | 分岐点 baseline での同一テスト再現を確認する。detached worktree による baseline 比較（`agentdev-git-worktree` worktree-operations「git stash 運用手順（一時退避）」の detached worktree 標準手順、stash を使わない）または分岐点 commit 指定の main root 読取系実行で行う | ② の再現有無だけで由来を確定せず、③の現行 baseline 差し替え再実行と併せて分類する |
| ③ 現行 baseline 差し替え再実行（検証後に旧状態へ復元） | baseline 系 durable state を現行（origin/main 追随後）の状態へ一時差し替えし、同一テストを再実行する。検証完了後、旧状態へ復元する | ③ で fail が解消する場合、fail は baseline 追随差（baseline の陳腐化）起因の疑似 fail と分類する |

由来分類への写像:

- ② で同一 fail が再現し ③ で解消する場合、かつ分岐点と現行 baseline 系 durable state の追随差が確認できる場合は **pre-existing（baseline 追随差起因）** と分類し、当該変更由来としては扱わない
- ② で同一 fail が再現し ③ でも解消しない場合は、ワークツリー変更ゼロの分岐点 baseline で同一 fail が再現するという既存基準に基づき **pre-existing** と分類する。baseline 系 durable state の追随差起因とは分類しない
- ② で再現しない場合、または②と③の結果が一致せず由来を説明できない場合は **不明** とし、同一環境ラベル下の再検証と追加調査を行う。別途、当該変更との因果関係を確認できた場合のみ **変更由来** と確定する

差し替え・復元の取扱い:

- ③ の baseline 差し替えは検証用の一時操作とし、差し替え対象のパスと旧状態を事前に記録した上で、検証完了後に同一の旧状態へ復元することを必須とする。復元後、`git status --porcelain` で baseline 系 durable state の差分が残留していないことを確認し、復元漏れを残留変更として扱わない
- 3点対照の実行記録（各対照の起動コマンド、pass/ fail 件数、判定、復元確認）を PR 本文の検証差分セクションへ残す。証跡は本節「証跡の stdout・stderr 分離併退避（`2>` 常時付与）」の形式に従う
- 分岐点以降の追随差の有無は、検証開始前に `git fetch origin` 後の `git log --oneline origin/main -1` と worktree 作成元 baseline commit の比較で確認できる（`agentdev-git-worktree`「main の鮮度確認」参照）

### 機械受理基準

フル suite の受理判断は、次の受理由件の記録が PR 本文に機械的に検証可能な形で存在することを満たす場合のみ pass とする。
受理由件は記録の存在と形式で判定し、判定者による内容の裁量判断を含まない（観点 10 の判定基準）。

1. 正規ランナー構成確認の記録: 正規ランナー構成確認（package.json scripts 定義等の確認結果と判定した正規ランナー）の記録が存在すること
2. 正規形実行の記録: 3 cwd 分割それぞれの起動コマンド（`./` prefix 付き、cwd はリポジトリルート）の実行記録が存在すること
3. 環境ラベルの記録: 環境ラベルの3要素（実行環境、junction 伝播状態、依存パッケージ状態）が記録されていること。採取手順は「環境ラベル」節のとおり
4. 件数突合の記録: 各分割実行の「Ran N tests across M files」件数が記録されていること
5. fail 全件の由来分類: fail が 0 件、または全 fail に由来分類（変更由来 / pre-existing / 実行形態由来 / 不明）が付与され、由来不明が 0 件であり、実行形態由来と分類した fail については実行形態規律へ適合させて再実行した結果の採用が記録されていること
6. baseline 基準の明示: 由来判定が remediation 開始前の baseline commit 基準で行われたことが記録されていること
7. pre-existing fail の baseline 再現確認の記録: pre-existing と分類した fail がある場合、ワークツリー変更ゼロの baseline commit で同一テストを再実行した同一 fail 再現確認の記録が存在すること。baseline 再現確認は detached worktree による baseline 比較（`agentdev-git-worktree` worktree-operations「git stash 運用手順（一時退避）」の detached worktree 標準手順、stash を使わない）で実施したことが記録から確認できること。単独→フル再実行の証拠順序と同一環境件数比較の実施は「fail 由来分類」節の証跡手順に従う
8. 終了コードの記録: 各分割実行の終了コードが記録されていること。記録する終了コードは検証コマンド自体の終了コードであり、表示用のパイプや後続処理の終了コードへの変換を行わない。非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない
9. 実行ランナー版の記録: 実行した正規ランナーの版（bun のバージョン等）が記録されていること。必要な版境界（ランナー版変更後に該当する再検証）を判別できる情報とする
10. 検査範囲の記録: 各分割実行の対象ディレクトリ（`./` prefix 付き指定）と実施範囲が記録されていること。worktree での分割③ 対象欠落（plugins 未伝播）等の環境差を含む実施範囲が記録から判別できること。検査範囲が欠落した実行結果を完全な合格証拠として扱わない

いずれかの記録が欠落する場合、由来不明の fail が残存する場合、未登録の既知欠陥を合格の根拠にする場合は fail とする。

## QG-4 checker 実測手順（merge 直前 HEAD・evidence 化・baseline 登録漏れ検査）

QG-4 で個別 checker（full integrity suite 以外の integrity checker、IR 検査）を実測する場合、次の3要素を満たして実施する。

1. **merge 直前 HEAD 実施**: checker 実測は、merge 直前の origin/main 取り込み済み branch HEAD で実施する。古い branch HEAD・分岐時点の baseline での実測結果を QG-4 の判定根拠に使わない。実行 HEAD（branch 名と commit hash）を実行記録へ残す
2. **evidence 化**: 検出した新規 NG の出所が自 Case 変更であることを evidence として記録する。fail 由来分類（既知欠陥・環境依存・当該変更起因）を付与し、実行 HEAD・checker 種別・検出箇所を PR 本文等の検証記録へ残す
3. **baseline 登録漏れ検査**: provenance-tracked baseline（NG baseline）への登録漏れを検査する。自 Case 変更で解消済みの既存 NG が baseline に残存していないか（stale baseline entry）、新規 NG が未登録のまま通過扱いになっていないかを確認する。stale entry を検出した場合は case-close の baseline 更新手順へ引き継ぐ

## pass/ fail 基準

- **pass**: 上記 1, 2, 6, 7, 8, 11, 12 を満たし（3, 4, 5, 9 は warn 以下、10 はフル suite 実行を要求する case では必須）、マージ可能。
- **fail**: 観点 1（未達チェックボックス）、観点 2（CI 失敗）、観点 6（test strategy 未処理項目）、観点 7（機械横断是正の再 grep 証拠未記載）、観点 8（PR 範囲 vs 全体の評価スコープ決定不能、または決定スコープで未達）、観点 10（フル suite 機械受理基準の記録欠落、由来不明 fail の残存）、観点 11（正規契約に根拠のない非該当化、独自必須化、合格申告依存の判定、単一手段の全義務代替、根拠のない not applicable）、観点 12（形式的一致のみの達成証拠、評価範囲を被覆しない反例探索、工程状態の循環利用、反例の分類のみによる達成扱い、同等性未確認の検証方法変更、必須未達の残存または warn 通過、親横断義務未成立での Epic/Root close）。構造化エラーで停止。
- **partial**: CI pending 等、判定に必要な証拠が未取得。証拠取得後に再判定。

QG-4 は最終受け入れの二値性が強く、`pass`/ `fail` を基本とする。
`partial` は CI 保留等の例外的状況のみ。

## 完了条件チェックボックス評価の具体手順

case-close STEP-2 での完了条件チェックボックス評価:

1. Issue 本文の `完了条件` セクションを読み取る
2. unchecked 項目（`- [ ]`）を抽出
3. 各 unchecked 項目を達成判定（証拠ソース: コミット、PR、CI 結果）
4. 達成判定した項目を `[x]` に更新（`agentdev_gh` の issue_update 操作）
5. **事後確認**: 更新後に Issue 本文を再読込し、全 `- [ ]` が `[x]` に反映されたことを確認。未反映の場合は再更新（最大 2 回）
6. 未達項目が残る場合 → 構造化エラーで停止（完了条件評価専任責務）

### 責務帰属

完了条件チェックボックスの評価、更新は **case-close の責務**（STEP-2）である。
QG-4 は判定基準を提供し、case-close が実際のチェックボックス更新を実行する。

> **注意**: 旧設計では case-run がチェックボックス更新を担う箇所があったが、完了条件チェックボックスの最終評価、更新は case-close QG-4 に集約する。
> case-run STEP-S5 のチェックボックス更新は実装中の進捗反映（work plan チェックボックス）に限定する。

## traceability check の横断 durable state 前提手順

QG-4 の traceability check は Design ヘッダの ADF-COVERS 宣言とトレーサビリティポリシー（`traceability/policy.yaml`）という単一 PR の差分に閉じない横断 durable state を判定対象とするため、次の前提手順を要求する。

- worktree root 起点の判定で検出対象の完全性が確定できない場合、main 側 root で check を再実行し、トレーサビリティポリシー（`traceability/policy.yaml`）登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない
- main 側 root での check 再実行を worktree 検証から行う場合の汎用手順（`bun <path>` 形式・`--root <worktree root>` 指定・読取系 check の実行に限定・worktree 内検査結果との混在禁止）は `agentdev-git-worktree` references `worktree-operations.md`「main root 実体 + --root 指定による読取系 checker 実行手順」を参照する
- トレーサビリティポリシー不在時は全要件行を検証対応必須として扱う安全側既定は維持する
- checker 実装（--root の意味・検査項目）の変更は本前提手順に含まない。main 側 root での再実行は読取系 check の実行のみで行う

Design 保存（Design 本体へ要件を反映する case-ready / case-revise 内部責務の保存工程。v4 標準ライフサイクルの語彙）における Design ヘッダの既存 ADF-COVERS 宣言ブロックの更新要否確認（横断 durable state の書き込み側前提）は `agentdev-design-file-manager` の Design 保存手順が定める。

## 委譲接続点

QG-4 の検査をサブエージェントに委譲する場合:

- サブエージェントは達成判定候補、証拠候補、未達候補のみを返す。
- 親エージェントが pass/fail を確定し、チェックボックス更新、マージ判断を行う。

## 責務境界

- QG-4 は**判定基準の提供と判定結果の提示**に限定する。
- チェックボックス更新、PR マージ、Issue クローズは case-close コマンドの責務。
- QG-4 は fail 判定後の修正を所有しない（REQ-{NNNN}-{NNN}）。失敗原因を分類し（REQ-{NNNN}-{NNN}）、実装不具合は case-run 差し戻し、証拠不足は証拠再取得、人間判断への引き上げ条件に該当する原因の場合のみユーザー判断へ移行する。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- [qg-3-implementation-deviation.md](qg-3-implementation-deviation.md)（前工程の実装乖離検出。QG-4 は QG-3 pass を前提とする）
- **agentdev-workflow-orchestration**: 達成判定プロトコル、証拠ソース
- **agentdev-issue-management**: Issue 本文更新、前後内容比較
