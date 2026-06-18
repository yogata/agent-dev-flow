# 診断・メンテナンス

AgentDevFlow の整合性検査と REQ 体系の健全性診断について説明する。

## docs-check（AgentDevFlow本体リポジトリ自己監査）

agent-dev-flow リポジトリの自己監査コマンド。ドキュメント・スキル・コマンドの横断的整合性を検証する。AgentDevFlow の配布対象外であり、AgentDevFlow本体リポジトリでのみ利用する（ADR-0106、REQ-0108-156）。

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

## 3層ゲート（自動実行）

docs-check は3層構成で自動実行され、事前予防（commit / push 時）から定期・事後監査までを機械的に担保する（REQ-0108-153, REQ-0136-004/005/007/008）。各層は同じ `check_integrity.ts` を起動し、ゲート種別（`--gate`）と検出水準（`--strict-only`）で検査範囲を切り替える。

| 層 | Gate | 起動タイミング | 検査範囲 | 実行方法 | ブロック条件 |
|----|------|---------------|----------|----------|-------------|
| 事前予防 | **Delta Guard** | `git commit` 実行時 | staged files に関連する strict 違反のみ | `.githooks/pre-commit` | strict 違反で commit block |
| 事前予防 | **Impact Guard** | `git push` 実行時 | 未 push 範囲の変更 REQ/ADR に関連する strict 違反 | `.githooks/pre-push` | strict 違反で push block |
| 定期・事後 | **Full Audit** | 月次 schedule・catalog/ADR 変更時・手動 | 全 rule（strict + heuristic + observation） | `.github/workflows/full-audit.yml` | PR 上で strict 違反で fail |

Delta / Impact Guard は `--strict-only` 付きで起動し、heuristic / observation finding は警告表示のみで commit / push をブロックしない。3層の検出水準（strict / heuristic / observation）の定義は [gate-levels.md](../../.opencode/skills/repo-agentdev-integrity/references/gate-levels.md) を参照。

### セットアップ（初回のみ）

Delta / Impact Guard を有効化するには、各プラットフォームの setup スクリプトを1回実行する。スクリプトは `git config core.hooksPath .githooks` を設定するだけで冪等であり、何度実行しても安全。

```powershell
# Windows (PowerShell 7+)
./.githooks/setup-hooks.ps1
```

```sh
# Unix / macOS / Linux / Git Bash
./.githooks/setup-hooks.sh
```

有効化確認・一時無効化・再有効化:

```powershell
./.githooks/setup-hooks.ps1 -Action status
./.githooks/setup-hooks.ps1 -Action disable
./.githooks/setup-hooks.ps1 -Action enable
```

前提: bun（`check_integrity.ts` 起動に使用）と Git 2.9+（`core.hooksPath` サポート）。bun が PATH にない場合、hook は警告を出してスキップする（ブロックしない）。setup の詳細・bypass・troubleshooting は [.githooks/README.md](../../.githooks/README.md) を参照。

### Full Audit

Full Audit は GitHub Actions で実行され、月次（cron）・`integrity-rule-catalog.md` 変更・ADR 変更・REQ retire 時に起動し、手動（`workflow_dispatch`）でも実行できる。結果は artifact として upload され、定期/手動実行時は `.agentdev/integrity/reports/` へ commit される。PR 上で strict 違反がある場合は fail する。ワークフロー定義は [`.github/workflows/full-audit.yml`](../../.github/workflows/full-audit.yml) を参照。

## inspect-docs

docs 全体の意味整合検出と REQ 体系の健全性検出を行うコマンド（REQ-0109）。旧 `req-restructure-review` を統合し、REQ 再構成観点を含む全体意味検出を担う。

### 基本フロー

```
docs 全体の整合性を確認したい → /agentdev/inspect-docs → 検出レポート生成
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
