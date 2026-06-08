# 診断・メンテナンス

AgentDevFlow の整合性検査と REQ 体系の健全性診断について説明する。

## docs-check（repo-local 自己監査）

agent-dev-flow リポジトリの自己監査コマンド。ドキュメント・スキル・コマンドの横断的整合性を検証する。AgentDevFlow の consumer 配布対象外であり、self-hosting repo のみで利用する（ADR-0106、REQ-0115-001）。

### 基本フロー

```
検査契機発生 → /repo/docs-check → 検証レポート生成 → 乖離があれば対応コマンドへ
```

### 検査対象

REQ/ADR/Skill/Command/Template/Workflow/Link/Canonical/Lifecycle/Namespace/ImplementationPattern 等の検査集合をスキャンする。

### 検査内容

- inventory 整合性
- link 整合性
- canonical 境界
- lifecycle 境界
- 旧 namespace 残存
- implementation pattern 診断
- ADR current/retired collection 区別（REQ-0112-050）

### Finding 分類

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

docs-check は ADR を current collection と retired collection に区別して検査する（REQ-0112-050）:

- **current ADR collection**（`docs/adr/ADR-01XX.md`）: status 遷移妥当性、参照 REQ 存在確認、誤分類兆候検出を検査
- **retired ADR collection**（`docs/adr/retired/ADR-00XX.md`）: 配置確認。現行根拠としての引用を警告
- retired ADR への履歴参照は、現行根拠引用の warning と区別される

### Route 判定

Finding ごとに以下の route で後続処理に送る。

| Route | 送り先 |
|-------|--------|
| `intake` | intake パイプライン |
| `intake+learning` | intake と learning 両方 |
| `req-define` | 要件定義 |
| `learning` | learning パイプライン |
| `none` | ユーザー判断待ち |

### レポート

結果は `.agentdev/integrity/reports/` に JSON または Markdown 形式で出力する。結果分類は NG / warning / info の3段階。

## docs-review

docs 全体の意味整合レビューと REQ 体系の健全性診断を行うコマンド（REQ-0115）。旧 `req-restructure-review` を統合し、REQ 再構成観点を含む全体意味レビューを担う。

### 基本フロー

```
docs 全体の整合性を確認したい → /agentdev/docs-review → 診断レポート生成
```

### 診断対象

- REQ の粒度・重複・隙間
- retired REQ と active REQ の整合性
- 移行表の正確性

## 整合性の考え方

AgentDevFlow では以下の整合性レイヤーを意識する。

1. **文書間整合性**: REQ → ADR → SPEC → DOC-MAP → guides の間で矛盾がないこと
2. **実装整合性**: 実装コード・設定が SPEC と一致していること
3. **ドメイン状態整合性**: `.agentdev/` 内の成果物がパイプライン境界を守っていること

整合性に問題が見つかったら、まず `/repo/docs-check` を実行して全体像を把握し、Finding の route に沿って対応する。
