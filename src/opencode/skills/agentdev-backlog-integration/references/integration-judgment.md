# バックログレビュー判定ロジック（backlog-review）

採用済み成果物（promoted artifact）の読み込み、分析、統合、分割判定、矛盾検出、RU 生成ロジックを定義する。

## 成果物の読み込み、分析

各 採用済み成果物を読み込み、内容を分析する:

| 項目 | 内容 |
|------|------|
| 成果物パス | 元ファイルパス |
| source type | intake/ learning |
| 主要テーマ | 抽出された主論点 |
| 関連成果物群 | 同一趣旨の可能性がある他の成果物 |

**前工程からの引き継ぎ（upstream handoff）メタデータ付与**: 成果物が AgentDevFlow 本体の不具合、改善点を扱う場合、分析結果に `agentdev_handoff: true` を記録する。判定は `agentdev-workflow-lifecycle` の前工程からの引き継ぎ判定に従う

**暫定分類付与**: 各 RU 候補について document-model SPEC の文書7分類モデル（REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外）を参照して暫定分類を付与する。
暫定分類は後続 `/agentdev/req-define` の Step 5-2 で最終確定される候補であり、本コマンドが確定しない。
RU frontmatter の `tentative_classification` フィールドに記録する。

## 統合、分割判定 + depends_on 依存解決 + ユーザー承認

分析結果に基づき、RU への統合、分割を判定し、ユーザーに提示して承認を得る:

- **N:1 統合**: 同一関心領域の複数成果物 → 1 RU
- **1:N 分割**: 1成果物内の複数独立論点 → 複数 RU
- **1:1**: 特別な統合、分割不要

**depends_on 依存解決**:
- RU 間に依存関係がある場合、`depends_on` に RU-ID を指定する
- 依存先 RU が同一バッチ内または既存 RU（`.agentdev/backlog/req-units/`）として存在することを確認
- 循環依存が存在しないことを確認
- 依存順に並べ替え可能であることを確認
- 未解決、循環、同時処理対象外の依存がある場合、当該 RU を処理せず理由を提示

ユーザーの調整指示があれば反映する。

## 矛盾検出 + ユーザー承認

統合対象の成果物間に矛盾がないか確認し、矛盾があればユーザーに委ねる:

| 項目 | 内容 |
|------|------|
| 成果物ペア | `{artifact_A} vs {artifact_B}` |
| 矛盾の内容 | 両立不可能な要求の概要 |
| A の主張 | A の該当記述と要約 |
| B の主張 | B の該当記述と要約 |

矛盾する成果物は RU 化対象から除外し `promoted/` に残置する。
矛盾しない成果物は通常通り処理継続（partial success）。

## RU 生成

ユーザー承認済みの判定結果に基づいて RU を生成する:

1. `.agentdev/backlog/req-units/` が存在しない場合は作成
2. 各 RU について:
 - frontmatter 生成（source_type, generated_by: backlog-review, generated_at, status: draft, depends_on（任意）, tentative_classification, sources）
 - **前工程からの引き継ぎメタデータ転記**: 分析結果に `agentdev_handoff: true` が存在する場合、RU frontmatter に転記する。RU 本文に現在プロジェクトでは実装しない前工程からの引き継ぎ用 RU であることを記載する
 - Sources セクション: 各 source の要点（パススルー禁止）
 - Source Summary セクション: 統合サマリ
 - 統合理由セクション: N:1/1:N の理由
 - 要件化の方向セクション: req-define への推奨方向
3. ファイル名: `RU-{NNNN}.md`（既存ファイルの最大番号 +1 から採番）
4. **depends_on 検証**:
 - depends_on 値は RU-ID に限定（採用済み成果物のパス不可）
 - 依存先 RU が存在することを確認
 - 循環依存がないことを確認
 - 依存順に並べ替え可能であることを確認
 - 検証失敗時は当該 RU を生成せず理由を提示

## adversarial-review 候補判断と内部挿入（経路E）

backlog-review 経路Eにおける adversarial-review の候補判断基準と内部手続きの実行時参照。
正規原本は `agentdev-backlog-integration` SPEC「adversarial-review 候補判断と内部挿入」節である。
本節は実行時参照として SPEC を補完し、SPEC と矛盾する場合は SPEC を正とする。
共通 caller integration 契約は adversarial-review SPEC が正規所有者であり、本節は再定義しない。

### 候補判断基準

review 対象は backlog-review command Step 4（統合・分割判定 + depends_on 依存解決）完了時点の RU 構成案である。
adversarial-review 候補は次のいずれかを満たす RU 構成案を対象とする。

- 複数採用済み成果物を統合する RU（N:1 統合）で、統合理由の妥当性が self-evident でないもの
- 1成果物を複数 RU へ分割する（1:N 分割）で、分割境界の妥当性が self-evident でないもの
- depends_on 依存を含み、依存順序、循環性、並べ替え可能性に判断余地があるもの
- 暫定分類（tentative_classification）が複数候補から迷い得るもの

候補判断基準は review 対象の意味的型を整理する補助情報であり、自動発動の根拠ではない。
発動条件はユーザー明示指定のみを正とし、候補該当の有無は従来フロー維持に影響しない。

### 内部手続き

#### 候補確定位置

RU 構成案は backlog-review command Step 4（統合・分割判定 + depends_on 依存解決）完了時点で確定する。
候補確定前の暫定分類、未解決依存、未確定統合判定は review 対象としない。

#### 呼出タイミング

adversarial-review の呼出は、Step 4 完了後、Step 5（矛盾検出）開始前に挿入する（RU構成→review→承認の順）。
ユーザー承認（Step 4 承認 / Step 5 矛盾検出時追加判断）の前に review を実行し、review 結果を踏まえて承認段階へ進む。
呼出タイミングの正規所有者は backlog-review command SPEC であり、本節は参照レベルに留める。

#### 矛盾検出への引き渡し

adversarial-review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は前節「矛盾検出 + ユーザー承認」（既存矛盾検出ロジック）へ引き渡す。
adversarial-review 自身は矛盾を自動解決せず、矛盾の判定、partial success 扱い、ユーザー追加判断への委ねは既存矛盾検出ロジックが正である。

### 副作用境界と委譲契約

adversarial-review は delegation-contracts SPEC の `semantic_review`（書き込み禁止型）として適用する。
許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする。
審議結果は中間成果として呼出元へ返却し、新規正規 artifact を生成しない。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する。

### accepted finding 反映と再 review

accepted finding の RU 構成案（統合・分割判定、depends_on、暫定分類）への反映は backlog-review command（呼出元）の責務である。
反映後に必要な既存検証（depends_on 再解決、矛盾検出再実行）を行う。
意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動でき、新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する。


