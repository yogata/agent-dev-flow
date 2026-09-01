# gh-cli 手続き・Custom Tool 契約の Design 反映（7件統合）

## 背景

agentdev-gh-cli skill 解消後の gh CLI 手続きの在り方（Design 再編）と、Custom Tool（agentdev_gh）の運用契約の Design 反映が未了（7件）。REQ-011 系の確定事項・未確認事項が Design に反映されていない。

## 問題

- ghcli Design が現存し docs README L130 も accepted「gh CLI 手続き委譲」のまま（再編候補・残務）
- Custom Tool の迂回防止・ツール名・環境変数等の Plugin 設定契約、ローダーシム・.gitignore 推奨、runner-local 実行細目、delegation-contracts の agentdev_gh 経路が Design に記載なし

## 望ましい変更

- gh CLI 手続きの正規所有（Design 扱い）を確定し、README 一覧・guides を整合更新する
- custom-tool-contracts.md / runtime-package-boundary.md / local-case-file.md / delegation-contracts.md へ確定事項を反映する（反映内容の設計は req-define で確定）

## 対象範囲

### 対象

| item | 対応 |
|---|---|
| ghcli-design-full-restructure-candidate | ghcli Design の扱い（再編/統合/削除）の決定と README L130 整合 |
| ghcli-docs-residual-ou004 | ghcli 残務（Design 本体・README 一覧・guides）の更新（REQ-011-008 は更新済み・部分解消） |
| custom-tool-contracts-pending-confirmations | 迂回防止節に Plugin 設定契約（環境変数名等）を追加 |
| design-confirm-custom-tool-contracts | ツール名 agentdev_gh 等の確定事項を Design へ反映 |
| design-confirm-runtime-package-boundary | ローダーシム・.gitignore 推奨を runtime-package-boundary へ反映（接続表は更新済み・部分解消） |
| subagent-agentdev-gh-tool-availability | delegation-contracts.md へ agentdev_gh/driver 経路を記載 |
| req011-006-local-impl-design-candidate | runner-local 固有細目の runtime-package-boundary / local-case-file への反映 |

### 対象外

- agentdev_gh Tool 本体の実装変更
- REQ-011 の REQ 行変更（Design 反映が主）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/responsibilities/custom-tool-contracts.md、docs/designs/local/runtime-package-boundary.md、docs/designs/local/local-case-file.md、docs/designs/workflows/delegation-contracts.md | 確定事項の反映 |
| spec/README | docs/designs/skills/agentdev-gh-cli.md（現存）、docs/README.md L130、guides | gh CLI 手続きの扱い整合 |

## 既存対策確認

- **確認結果**: 部分解消（REQ-011-008・接続表）、Design 本体は未反映
- **ギャップ分類**: fix gap

## 制約

- REF-001-008/009 の stable contract 変更手順に従う（意味変更は行わない）
- 反映内容の詳細設計は req-define で確定する

## 受け入れ条件

- [ ] gh CLI 手続きの正規所有が確定し README・guides と整合している
- [ ] 上表の Design 反映が完了している

## 元learning item / 根拠

- **根拠**: 各 intake item の Design 検索ゼロ実証（agentdev_gh 等の記載なし確認済み）
- **横展開可能性**: Custom Tool 契約・委譲契約の運用全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
