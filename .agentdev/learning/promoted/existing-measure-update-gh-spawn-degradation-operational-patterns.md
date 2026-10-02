# gh spawn 起動環境劣化・障害の運用パターン追補

処分区分: 5 既存対策の更新（fix gap）

## 背景

harness serve 内での gh spawn 障害（gh exit 66・stderr 空。REQ-093 既知の起動環境障害）が 2026-09-30〜10-01 に 7 事象観測された。単発障害ではなく、serve 再起動後も約 8 呼出で再発する劣化サイクル、起動直後〜2 呼出以内の再発（窓枯渇）、case-open と case-run の write-proxy 経路が同時に遮断される二重遮断など、反復性のある劣化像である。case-open 段階での durable state 先行ステージングによる再開コスト最小化と、gh exit 66 恒常失敗時に bash gh 例外手順で PR 作成を完遂した証跡が得られている。

## 問題

- `issue-operation-safety.md`「起動環境障害の known-issues」節は診断・回復・作業再開を所有するが、劣化サイクルの定量観測（再発までの呼出数・再発局面）と縮退運用パターンの体系記述が未蓄積である
- REQ-093 known-issues に今期の観測（劣化サイクル・窓枯渇・二重遮断）が未蓄積である
- 委譲前の疎通確認、gh 呼出を伴う処理の最小副作用単位分割、write-proxy payload の標準配置方針が各 workflow に明文化されていない

## 望ましい変更

1. 委譲前疎通確認: gh 呼出を伴うサブエージェント委譲前に軽量読取 1 操作（例: issue_read）で疎通を確認する
2. 最小副作用単位分割と durable state 先行: gh 呼出を含む処理は再開可能な最小単位に分割し、失敗時の再開コストを最小化するため durable state を先行ステージングする
3. write-proxy payload の標準配置: payload を `.agentdev/drafts/proxy-{stage}-{slug}.md` に標準配置し、再実行時の再利用を可能にする
4. bash gh 例外手順の周知: gh exit 66 恒常失敗時の委譲手順定義（bash gh 例外手順）を運用周知し、証跡様式を整える
5. agentdev_gh 側の自動 respawn 検討: 恒久対応候補として agentdev_gh Custom Tool 側での自動 respawn・再接続検討を記録する（adversarial-review B1）
6. REQ-093 known-issues への観測蓄積: 劣化サイクル（約 8 呼出再発）・窓枯渇（起動直後〜2 呼出）・二重遮断（case-open と case-run 経路同時）の観測を追記する

## 対象範囲

### 対象

- `src/common/skills/agentdev-issue-management/references/issue-operation-safety.md`（起動環境障害の known-issues 節）
- REQ-093 関連ドキュメントの known-issues 記述
- gh 呼出を伴う workflow（case-open / case-ready / case-run）の委譲手順

### 対象外

- agentdev_gh Custom Tool 実装そのものの変更（respawn 検討は候補記録に留める）
- harness 側（oh-my-openagent）の修正

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-issue-management/references/issue-operation-safety.md | 起動環境障害節へ劣化サイクル・窓枯渇・縮退運用パターン（疎通確認・durable state 先行・payload 標準配置・bash gh 例外手順）を追補 |
| REQ | docs/requirements/REQ-093.md（関連 Design/known-issues） | known-issues へ今期観測（劣化サイクル・二重遮断）を蓄積 |
| Design | gh 呼出を伴う workflow Design の contingency 記述 | 委譲前疎通確認・最小副作用単位分割の契約候補 |
| 配布skill | Custom Tool 契約参照ドキュメント（custom-tool-contracts.md contingency 節） | agentdev_gh respawn 検討の記録 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: issue-operation-safety.md「起動環境障害の known-issues」節、REQ-093
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 診断・回復・作業再開は所有するが、劣化サイクルの定量観測と縮退運用パターン（疎通確認・durable state 先行・payload 標準配置・例外手順証跡）の体系記述が未蓄積

## 制約

- 運用パターンの追補は既存の診断・回復手順を置き換えない（追補として追加する）
- bash gh 例外手順は agentdev_gh の verify 契約を迂回する手段のため、証跡様式の維持を前提とする

## 受け入れ条件

- [ ] issue-operation-safety.md 起動環境障害節に劣化サイクル・窓枯渇・縮退運用パターンが追補されている
- [ ] REQ-093 known-issues に今期観測が蓄積されている
- [ ] 委譲前疎通確認と payload 標準配置が運用周知されている

## 元learning item / 根拠

- **要約**: gh spawn 起動環境障害（REQ-093 既知）の反復観測 7 事象と、障害下での運用パターン実績
- **根拠**: (1) 2026-09-30 RU-0136: サブエージェント側から回復不能な gh exit 66・stderr 空、(2) 2026-09-30 RU-0149: 冪等検出と重複生成防止完了後の blocked 停止、(3) 2026-10-01 Case #3278: serve 再起動後も約 8 呼用で再発する劣化サイクルと多段 lifecycle を跨ぐ冪等再実行の実効性、(4) 2026-10-01 Case #3278 case-ready 段階: 起動直後〜2 呼出以内の再発（窓枯渇）、(5) 2026-10-01 Case #3278 Wave 1: write-proxy 実行経路の二重遮断、(6) 2026-10-01 third-party-presupposition case-open: durable state 先行ステージングで再開コスト最小化、(7) 2026-10-01 Case #3289: bash gh 例外手順で PR 作成完遂の証跡
- **再発条件**: harness serve 内 gh spawn の劣化が再燃した場合（環境起因・制御外）
- **横展開可能性**: gh を利用する全 workflow（case-open/case-ready/case-run/case-close）で共通

## 推奨Issue分類

- **分類**: chore（ドキュメント追補）／ respawn 検討は feature 候補
- **推奨ラベル**: documentation, reliability
- **関連Issue**: RU-0136, RU-0149, Case #3278, Case #3289
