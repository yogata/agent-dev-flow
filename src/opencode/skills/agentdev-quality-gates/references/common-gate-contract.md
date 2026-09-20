# 共通ゲート契約

QG-1〜QG-4 全 Gate が共通して従う契約を定義する。
各 Gate の参照ファイルは本契約を前提とする。

## 判定結果

各 Gate は以下のいずれかの判定結果を返す。

| 結果 | 意味 | 後続アクション |
|------|------|---------------|
| `pass` | 全検査観点を満たす | 次フェーズへ進行 |
| `warn` | 構造は保たれているが改善推奨事項がある | 進行可能（警告を併記） |
| `fail` | 構造的欠陥、重大乖離、未達項目がある | 差し戻しまたは停止（ユーザー判断） |
| `partial` | 一部検査が未完了、判定保留 | 判定保留理由を報告しユーザー判断を仰ぐ |

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
- **推奨アクション**: {pass: 進行 / warn: 警告併記して進行 / fail: 差し戻し先}
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


### 3. 自動修正禁止


全 Gate で、fail 判定時の自動修正は行わない。
エージェントは推奨アクションを提示し、ユーザーが決定する。
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

## See Also

- [qg-1-definition-integrity.md](qg-1-definition-integrity.md)
- [qg-2-acceptance-criteria-coverage.md](qg-2-acceptance-criteria-coverage.md)
- [qg-3-implementation-deviation.md](qg-3-implementation-deviation.md)
- [qg-4-final-acceptance.md](qg-4-final-acceptance.md)

