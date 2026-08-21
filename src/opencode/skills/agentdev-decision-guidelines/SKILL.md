---
name: agentdev-decision-guidelines
description: Evaluates whether architectural decisions require a Decision record. USE FOR: proposing architecture changes, selecting tech stacks, making hard-to-reverse technical decisions. DO NOT USE FOR: creating or managing Decision files, requirement analysis, implementation planning.
---
<!-- ADF-COVERS(implementation): REQ-001-023, REQ-001-024 -->

# Decision評価ガイドライン

## 原本（SSoT）

本スキルの原本仕様は `agentdev-decision-guidelines` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 評価基準（いずれかに該当すればDecision作成推奨）

1. **アーキテクチャ上の重要性**: システム全体の構造、主要コンポーネント間の関係に影響
2. **長期的影響**: 将来の開発や運用に長期的に影響を与える
3. **逆転の困難さ**: 後で変更するコストが高い、困難

## Decision作成ガイドライン

### Decisionを作成すべき基準
すべての変更に対してDecisionを作成する必要はない。
「アーキテクチャ上重要である（Architecturally Significant）」と判断される決定に対して作成する。

### 作成が必要な例
- **技術スタックの選定**: 言語、フレームワーク、ライブラリ、ミドルウェアの採用や変更
- **アーキテクチャパターン**: フォルダ構成、通信プロトコル、データアクセスパターン（例：Repositoryパターンの採用）
- **セキュリティ、認証**: 認証、認可方式の決定、暗号化アルゴリズムの選定
- **データモデル**: データベースのスキーマ設計における重要な方針、外部サービスとのデータ同期戦略
- **主要な外部サービス**: 決済、メール配信、監視などのサードパーティサービスの選定

### 作成が不要な例
- **バグ修正**: 既存の設計に基づいた不具合の修正
- **UIの微調整**: レイアウトやスタイルの変更（デザインシステム全体の変更はDecision対象となり得る）
- **軽微なリファクタリング**: 外部仕様やアーキテクチャに影響しないコードの整理
- **機能実装**: 既存のアーキテクチャパターンに従った新機能の追加

### Decisionを作成してはならない条件

以下に該当する変更は、たとえDecisionの評価基準（アーキテクチャ上の重要性等）に該当しそうであっても、Decisionとして扱ってはならない:

1. **仕様変更のみ**: 技術的決定を含まない仕様の変更、追加、整理
2. **command動作仕様**: コマンドの入力、出力、振る舞いの定義
3. **workflow定義**: ワークフローの状態遷移、フェーズ定義、パイプライン定義
4. **命名規約、directory規約**: ファイル、ディレクトリの命名規則
5. **artifact contract変更**: REQ/Decision/Design等の文書形式、frontmatter規約の変更
6. **運用ルール**: 運用手順、レビュープロセスの変更
7. **template変更**: テンプレート形式、セクション構成の変更
8. **入出力形式**: コマンドの入出力形式の変更
9. **非技術的合意**: 合意事項、方針の記録（技術的決定を伴わないもの）
10. **既存文書種別への適合**: 内容が既存のREQ/Design/guideの適用範囲に収まる場合

上記に該当する場合は、DecisionではなくREQ/Design/guideの更新として扱う。

### False Negative 防止基準

Decision要否判定で、以下の兆候が検出された場合は、たとえ上記「Decisionを作成してはならない条件」に該当しそうであっても、再度技術判断の有無を確認すること:

| 兆候 | 確認内容 |
|------|---------|
| 文書種別が境界上 | REQ/Design と Decision の境界付近にある場合、技術判断を含むか再確認 |
| 既存Decisionの内容が Design 相当 | 既存Decisionに振る舞い、schema記述が含まれる場合、Design への移管を検討 |
| 新規Decisionの必要性が微妙 | 「Decisionを作成してはならない条件」に該当するが、将来の設計、運用、文書システムを制約する決定を含む場合は例外としてDecisionを認める |

**方針**: false negative（Decisionが必要なのに見逃し）を防止する。
false positive（不要なDecisionの作成）は後に整理できるため、微妙な場合はDecision側に寄せる。
ただし「Decision作成可否条件」の作成不可条件（作業手段を主題とするもの等）に該当する場合は寄せの対象外とし、retire/supersede または REQ/Design/guide で処理する。

## Decision作成可否条件

Decisionの主題として適格かを判定する境界ルール。
本条件は「Decisionを作成してはならない条件」「False Negative 防止基準」より優先して適用される主題妥当性の最終境界である。

### 作成可条件

- 新規Decisionは、旧判断を置き換える新しい「あるべき状態」の意思決定が存在する場合のみ作成する
- Decisionは将来の構造、責務境界、運用原則などの「あるべき状態」を意思決定として記述する

### 作成不可条件

- 削除、廃止、移行、統合、再構築、完全削除そのものを主題にしたDecisionは作成しない
- 過去判断を現行基盤から外すだけの場合は、新規Decisionではなくretire/supersedeで処理する

### 既存Decision重複確認

- Decision作成前に既存accepted Decisionとの内容重複を確認し、重複時は新規Decision作成ではなく既存DecisionのUPDATEを優先する

## Decisionのライフサイクル
Decisionの状態は以下のいずれかをとる。
一度 Accepted になった Decision は意味的に不変とし、決定を覆す場合は新しい Decision を作成して古いものを Superseded/Deprecated にする。
ただし明示承認済みの非意味修正（タイポ、リンク切れ、表記統一等）に限り直接更新を認める。
判定は後述「accepted Decision の更新規則」に従う。

- **Proposed**: 提案中。議論が行われている状態。
- **Accepted**: 承認済み。現在のプロジェクトに適用されている状態。
- **Superseded**: 他の新しい決定（別のDecision）によって置き換えられた状態。後継Decision番号を `superseded-by:[DEC-MMM]` 形式で示す（詳細は `agentdev-decision-file-manager` を参照）。
- **Deprecated**: 推奨されなくなった、または廃止された状態。

## 運用ルール
- **不変性**: 承認済み Decision は意味的に不変（Immutable）として扱う。背景が変わり決定を覆す場合は、新しい連番で Decision を作成する。非意味修正の直接更新は「accepted Decision の更新規則」を参照。
- **レビュー**: Decision はプルリクエストを通じて提案され、チームメンバーによる合意（Accepted）を得る必要がある。
- **AIエージェントへの指示**: AIエージェントが開発を行う際は、本ガイドラインに従い、アーキテクチャ上の重要な決定を伴う場合は自律的に Decision を起草する。

## accepted Decision の更新規則

accepted Decision は意味的に不変とする。
ただし明示承認済みの非意味修正に限り、直接更新を認める。
詳細は Design `agentdev-decision-guidelines` の「accepted Decision の更新規則」を正とし、本節は実行入口の要約を示す。

### 非意味修正と意味変更の区分

| 区分 | 扱い | 適用例 |
|---|---|---|
| 非意味修正（直接更新可能） | 明示承認後に直接更新 | 誤字・文字化け修正、壊れたリンク・誤ったファイルパス修正、タイトルと本文の不一致修正、意味を変えない表記統一、決定内容でも制約でもない移行時ラベル除去、履歴注記・関連リンク・日付等の補助情報修正 |
| 意味変更（後継 Decision 必須） | 新規 Decision を作成し、旧 Decision を superseded | 決定内容の追加・削除、適用範囲の変更、必須条件・制約の変更、正規所有者の変更、採用方式の変更、外部から観測可能な結果の変更 |

### 直接更新の実行条件

- 対象 Decision の frontmatter `status` が `accepted` であり、変更箇所が非意味修正リストのいずれかに該当する
- 直接更新前に明示承認記録が存在する
- 意味変更を表記修正として扱わない（意味変更の場合は後継 Decision を作成する）
- Report へ規範要件または必達条件を移さない
- accepted Decision の過去版を無言で書き換えない

### 憲章 Decision の移行時識別子の扱い

憲章 Decision（charter Decision）に残存する移行時識別子は次の通り処理する。
判定の詳細は Design に委ねる。

| 識別子 | 扱い | 理由 |
|---|---|---|
| `WS-{N}` | 直接削除可 | 非意味ラベル。決定内容を変えない |
| `案B` ラベル | 案番号のみ削除可（決定内容は具体文で維持） | 決定内容を維持する非意味修正 |
| 10シナリオの抽象条件化 | 後継 Decision 必須（直接編集不可） | 意味変更に該当する |
| 10シナリオの定義 | Design が所有 | - |
| 10シナリオの実行結果 | Release Report が所有 | Release Report に規範表現は存在しない |

## 出力形式

- Decision作成推奨: `[アーキテクチャ的な重要性や判断理由]`
- Decision不要: `[不要と判断した理由]`

---

## See Also

- **agentdev-decision-file-manager**: Decisionファイルの作成、追記、更新操作とバリデーション
- **agentdev-req-analysis**: 要件分析におけるDecision閾値判定ブリッジ
- **agentdev-workflow-lifecycle**: agentdev-*ワークフロー統括ハブ（フェーズ定義、SSoT遷移、パターン判定）


