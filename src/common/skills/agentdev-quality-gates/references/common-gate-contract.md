# 共通ゲート契約

QG-1〜QG-4 全 Gate が共通して従う契約を定義する。
各 Gate の参照ファイルは本契約を前提とする。

## 判定結果

各 Gate は以下のいずれかの判定結果を返す。

| 結果 | 意味 | 後続アクション |
|------|------|---------------|
| `pass` | 全検査観点を満たす | 次フェーズへ進行 |
| `warn` | 構造は保たれているが改善推奨事項がある | 進行可能（警告を併記） |
| `fail` | 構造的欠陥、重大乖離、未達項目がある | 失敗原因を分類し、原因別処理に応じて処置する（REQ-{NNNN}-{NNN}/{NNN}）。実装不具合は正規所有工程の修正ループ〔case-run 差し戻し〕、証拠不足は証拠再取得、上流成果物の投影・整合不備は正規所有工程への差し戻し。人間判断へ移行するのは正規情報源間の未解決規範矛盾、人間に留保された新しい判断の場合のみ |
| `partial` | 一部検査が未完了、判定保留 | 残余検査の証拠を再取得して判定を完了する（証拠不足の自動回復）。運用上の介入が必要な場合はその旨を報告する |

### pass/ warn/ fail の運用

- QG-1/ QG-2/ QG-3 は `pass`/ `warn`/ `fail` の 3 値を使用する。
- QG-4 は最終受け入れの二値性が強く、`pass`/ `fail` を基本とする（`partial` は CI 保留等の例外的状況のみ）。
- `partial` は判定に必要な証拠が取得できない場合のみ使用し、推論不足の言い訳にしない。

## Evidence-First 原則

全 Gate の判定は**証拠（evidence）に基づく**。
推測、記憶、暗黙前提で判定してはならない。

### 証拠の種類

| 証拠種別 | 例 | 取得方法 |
|---------|---|---------|
| 機械的証拠 | ファイル存在、チェックボックス構文、テーブル列数、CI 終了コード | ツール呼び出し（Read/ Grep/ Glob/ gh CLI）で取得 |
| 構造的証拠 | frontmatter 形式、必須セクション有無、Decision 記録有無 | Read tool で対象ファイルを読み取って確認 |
| 推論証拠 | チェックボックスの測可能性、乖離の重大度、網羅性 | 本スキルの基準を適用してエージェントが推論 |

### 証拠の記録

判定結果には、どの証拠に基づき判定したかを明示する。
特に `warn`/ `fail` 判定時は根拠となる証拠を報告に含める。

## Gate 結果フォーマット

各 Gate の判定結果は以下の形式で報告する。

```markdown
## QG-{N}: {Gate名}

- **判定**: pass / warn / fail / partial
- **対象**: {検査対象成果物}
- **証拠**: {判定根拠}
- **推奨アクション**: {pass: 進行 / warn: 警告併記して進行 / fail: 失敗原因分類と差し戻し先}
```

### QG-3 の拡張フォーマット

QG-3 は乖離検出結果を含むため、上記に加えて乖離報告を付加する。
詳細は `qg-3-implementation-deviation.md` の報告フォーマットを参照。

## 共通の検査原則

### 1. 局所性の原則

各 Gate は配置コマンドのフェーズ内で完結する。
次フェーズ、前フェーズの成果物を再検証しない（ただし直前フェーズの出力を入力として参照するのは可）。


### 2. 委譲接続点の尊重


サブエージェントに探索を委譲する場合、サブエージェントは**候補、根拠のみを返し、判定の確定は親エージェントが行う**。
サブエージェントが Gate の最終判定を下さない。


### 3. 修正の所有境界


全 Gate で、fail 判定後の修正そのものを Gate が所有しない（REQ-{NNNN}-{NNN}）。
Gate は証拠、合否判定、乖離・失敗原因の分類と推奨アクションの提示を所有する。修正の実行は正規所有工程（実行担当サブエージェント委譲内の自律修正ループ、または case-run 差し戻し後の修正ループ）に任せる。
例外は実行担当サブエージェント委譲内の自律修正ループ（test-fix ループ: CI/lint 失敗の機械的再試行）のみで、これは Gate の外にある。

### 4. トレーサビリティ対応関係の参照

Gate が成果物と要件の対応関係（coverage、impact、check）を参照する場合、対応関係は decision / design / implementation / verification の4役割で表現される役割付きモデルを前提とする。

- Decision 対応は任意役割であり、Decision 対応の欠落を Gate 不合格の理由にしない（Decision 欠落非計上）
- Design 対応と implementation 対応は全要件行で必須、verification 対応の要否は検証スコープポリシー（project の `traceability/policy.yaml`）が決定する
- 対応関係の参照・検査の実行手順と検査結果の解釈は `agentdev-traceability` スキルを参照する

## 5 概念への写像

本契約の判定結果・証拠・Gate は ADF v4 Quality モデル（v4-quality-gate-model Design）の 5 概念（Quality Policy / Verification Obligation / Verifier / Evidence / Gate）へ次のように写像する。

### verdict と Gate predicate の写像

Verifier の verdict は `pass`/ `warn`/ `fail`/ `partial` の 4 値であり（「判定結果」節）、Gate predicate への写像は次のとおり。

| verdict | Gate predicate への写像 |
|---------|------------------------|
| `pass` | 遷移可 |
| `warn` | 遷移可（対応記録コメントへの記録を条件とする） |
| `fail` | 遷移不可 |
| `partial` | 判定保留として遷移不可（残余 Obligation の解消後に再判定が必要） |

QG-4 は `partial` を不可として扱い、再判定は当該 close 内で完了させる。
QG-1〜QG-4 は lifecycle 級 semantic Gate であり、遷移に直接接続せず、v4-lifecycle-state-machine の deterministic gate predicate 接続点（唯一の接続点）を経由して遷移を制御する。
正規定義は v4-quality-gate-model Design「判定値と遷移接続」節を参照する。

### 証拠 3 分類と Verifier 分類の直交

「証拠の種類」節の証拠 3 分類（機械的/ 構造的/ 推論）は Evidence の属性であり、Verifier 分類（deterministic/ semantic）とは直交する。
構造的証拠はいずれの Verifier からも生成され得る。
二つの分類を 1:1 対応として扱わない。
正規定義は v4-quality-gate-model Design「証拠種別と Verifier 分類の直交」節を参照する。

### 完了条件単位の評価区分と Gate 判定値の写像境界

完了条件単位の評価は、次の 4 値の評価区分を取り得る（v4-quality-gate-model Design「QG-2 / QG-4 の受け入れ義務保存拡張」節）。

| 評価区分 | 意味 |
|---------|------|
| `pass` | 当該条件を証拠で達成判定した |
| `fail` | 当該条件の未達・未証明 |
| `blocked` | 当該条件の判定に必要な証拠が取得できない。残余証拠の取得後に再判定する |
| `not applicable` | 正規契約上の根拠をもって当該条件が対象外と判定された |

この評価区分は完了条件単位の評価値であり、Gate の判定値（`pass`/ `warn`/ `fail`/ `partial`）ではない。
新しい結果状態を追加しない。
Gate 判定値への写像の正規所有は v4-quality-gate-model Design「判定値と遷移接続」節であり、本契約は写像境界のみ扱う。

- 必須条件の未達・未証明を Gate 全体の `warn` で通過させない
- 完了条件単位の評価を既存の Gate 判定結果・Issue 状態と混在させない。完了条件の達成判定を既存の Gate 判定の結果で代替しない
- `not applicable` の判定には正規契約上の根拠を要求する。根拠の確認手順は QG-4 の not applicable 根拠確認（qg-4-final-acceptance.md）を参照する

### 受け入れ義務保存の機構追加禁止

受け入れ義務保存（正規契約からの検証義務導出と完了判定への適用）の実現に際して、次の機構を追加しない。

- 新しい中央判断ルーター
- 恒久的な受け入れ義務台帳
- 新しい品質ゲート
- 新しい結果状態

検証義務の導出と適用は既存の QG-1〜QG-4 判定手順、既存の証拠チャネル（Gate 結果コメント、PR 本文検証差分、SSoT コメント）で実現する。
既存責務だけでは実現不能と判明した場合は自動的に機構を追加せず、追加設計判断として停止する。

## See Also

- [qg-1-definition-integrity.md](qg-1-definition-integrity.md)
- [qg-2-acceptance-criteria-coverage.md](qg-2-acceptance-criteria-coverage.md)
- [qg-3-implementation-deviation.md](qg-3-implementation-deviation.md)
- [qg-4-final-acceptance.md](qg-4-final-acceptance.md)

