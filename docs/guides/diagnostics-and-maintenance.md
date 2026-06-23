# 診断、メンテナンス

AgentDevFlow の整合性検査と REQ 体系の健全性診断について説明する。

## docs-check（AgentDevFlow 本体リポジトリの自己監査）

agent-dev-flow リポジトリの自己監査コマンド。ドキュメント、スキル、コマンドの横断的整合性を検証する。AgentDevFlow の配布対象外であり、AgentDevFlow 本体リポジトリでのみ利用する（ADR-0106、REQ-0108-156）。

### 基本フロー

```
検査契機発生 → /repo/docs-check → 検証レポート生成 → 乖離があれば対応コマンドへ
```

### 検査対象

REQ/ADR/Skill/Command/Template/Workflow/Link/Canonical/Lifecycle/Namespace/ImplementationPattern 等の検査集合をスキャンする。

### 検査内容

- インベントリ整合性
- リンク整合性
- 正規境界
- ライフサイクル境界
- 旧 namespace 残存
- 実装分類（Implementation Pattern）の診断
- ADR の現行/廃止済み番号帯の区別（REQ-0112-050）

### 検出事項の分類

検出された乖離は以下の分類で扱う。

| 分類 | 意味 |
|------|------|
| `document-drift` | 文書内容の乖離 |
| `broken-reference` | 参照リンクの崩れ |
| `obsolete-structure` | 廃止済み構造の残存 |
| `canonical-conflict` | 基準境界の衝突 |
| `workflow-gap` | ワークフロー定義の欠落 |
| `integrity-rule-gap` | 整合性ルール自体の欠落 |

### ADR 関連検査

docs-check は ADR を現行の番号帯と廃止済みの番号帯に区別して検査する（REQ-0112-050）:

- **現行 ADR 番号帯**（`docs/adr/ADR-01XX.md`）: status 遷移の妥当性、参照先 REQ の存在確認、誤分類の兆候検出を検査する
- **廃止済み ADR 番号帯**（`docs/adr/retired/ADR-00XX.md`）: 配置を確認する。現行根拠としての引用を警告する
- 廃止済み ADR への履歴参照は、現行根拠としての引用による警告とは区別して扱う

### 振り分け先の判定

検出事項ごとに以下の振り分け先で後続処理に送る。

| 振り分け先 | 送り先 |
|-------|--------|
| `intake` | Intake パイプライン |
| `intake+learning` | Intake と Learning の双方 |
| `req-define` | 要件定義 |
| `learning` | Learning パイプライン |
| `none` | ユーザー判断待ち |

### レポート

結果は `.agentdev/integrity/reports/` に JSON または Markdown 形式で出力する。結果分類は NG / warning / info の3段階。

## inspect-docs

docs 全体の意味整合性と REQ 体系の健全性を検出するコマンド（REQ-0109）。旧 `req-restructure-review` を統合し、REQ 再構成観点を含む全体意味検出を担う。

### 基本フロー

```
docs 全体の整合性を確認したい → /agentdev/inspect-docs → 検出レポート生成
```

### 診断対象

- REQ の粒度、重複、隙間
- 廃止済み REQ と現行 REQ の整合性
- 移行表の正確性

## 3層ゲートと達成記録先

整合性検査は3層ゲート構造で運用し、検査結果と達成状況は各層、各ルールの正規記録先に配置する（REQ-0101-075、REQ-0108-153）。

### 3層ゲート概念

integrity 検査は検査範囲に応じて3層に分かれる。各層の検査水準（strict / heuristic / observation）の定義と対応方針は `.opencode/skills/repo-agentdev-integrity/references/gate-levels.md` を参照する。

| 層 | 検査範囲 | 典型的な契機 |
|----|---------|------------|
| full audit | 全ルールを実行 | 定期実行、重大変更後 |
| delta guard | 変更関連ルールのみ実行 | PR 作成時・通常開発時 |
| impact guard | 影響範囲ルールのみ実行 | 特定アーティファクト変更時 |

### 達成状況の正規記録先

各達成項目の正規記録先は以下の標準に従う（REQ-0101-075、REQ-0136-026）。

| 達成項目 | 正規記録先 |
|---------|----------|
| 3層ゲート達成状況（実装、稼働、再発 finding 対応） | 当ガイド `diagnostics-and-maintenance.md` の3層ゲートセクション（本セクション） |
| false positive 対応、既知パターン | `docs/specs/integrity-rule-catalog.md` の各 IR エントリ `false_positive_risk` フィールド、および `.opencode/skills/repo-agentdev-integrity/references/gate-levels.md` の「False Positive 扱い」セクション |
| 要件行（達成要件、検証要件） | 当該 REQ ファイルの要件行テーブル |

### 記録時の遵守事項

- Update Notes セクションは使用しない（REQ-0101-071 遵守）。
- 変更履歴は frontmatter `updated` フィールドのみで追跡する（REQ-0101-073 遵守）。

## 整合性の考え方

AgentDevFlow では以下の整合性レイヤーを意識する。

1. **文書間整合性**: REQ → ADR → SPEC → DOC-MAP → guides の間で矛盾がないこと
2. **実装整合性**: 実装コード、設定が SPEC と一致していること
3. **ドメイン状態整合性**: `.agentdev/` 内の成果物がパイプライン境界を守っていること

整合性に問題が見つかったら、まず `/repo/docs-check` を実行して全体像を把握し、検出事項の振り分け先に沿って対応する。
