# 一時ファイル置き場所指針の具体候補明示と書込み標準手段の集約

## 背景

Case #3145（case-open STEP-5）で横断依存検査エンジンの検査入力 JSON をワークスペース外一時ディレクトリへ書込もうとして write guard（agentdev-textlint-guard）に fail-closed ブロックされた。 guard によるブロックは設計どおりであり、標準手段（project root 内配置）への切替で解消した。 同一事象クラスは 2026-08-15 / 2026-09-19 / 2026-09-20 を含め計4回発生している。

## 問題

- guard の書込み範囲制御は project root を境界とし、承認済み一時ディレクトリも含む外部パスを一律 fail-closed ブロックする（設計どおり。guard と環境側一時許可の粒度差）
- scripts/README.md「検査入力 JSON の置き場所指針」（RU-0131 実施済み）は4方針のみで、置き場所の具体候補（`.agentdev/integrity/reports/` 等 gitignore 領域）の明示がない
- worktree-operations.md「書込み guard 運用指針」節への標準手段集約（node writeFileSync、一時スクリプトファイル経由、PowerShell 単一引用符ヒアドキュメント代替技法）が未実施

## 望ましい変更

一時ファイル置き場所指針に具体候補（`.agentdev/integrity/reports/` 等、git 管理対象外・検査後削除）を明示し、worktree-operations.md「書込み guard 運用指針」節へ標準手段を集約する。 guard による書込みブロックは fail-closed として維持し、ブロック解除・迂回ではなく標準手段へ切替する（AGENTS.md 既存指針どおり）。

## 対象範囲

### 対象

- agentdev-workflow-case-open scripts/README.md（検査入力 JSON の置き場所指針）
- src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md「書込み guard 運用指針」節

### 対象外

- guard 設計の変更（fail-closed 維持）
- OS 一時ディレクトリの許可設定変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill scripts | src/opencode/skills/agentdev-workflow-case-open/scripts/README.md | 置き場所具体候補（.agentdev/integrity/reports/ 等）の明示 |
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 書込み標準手段（node writeFileSync・一時スクリプトファイル経由・PowerShell 単一引用符ヒアドキュメント技法）の集約 |

## 既存対策確認

- **確認結果**: あり（fix gap）
- **該当ファイル**: AGENTS.md 書込み guard 運用指針、agentdev-workflow-case-open/scripts/README.md「検査入力 JSON の置き場所指針」
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 具体候補明示と worktree-operations.md「書込み guard 運用指針」節への標準手段集約が未実施

## 制約

- 検査入力 JSON 等の runtime artifact は commit 対象外（検査後削除）
- 大規模編集の代替実行形式としての「node -e + PowerShell 単一引用符ヒアドキュメント」技法は、CL-4 知識（Git Bash inline は破損）と補完関係にあるため、両者の使い分けを明記する（shell inline 一律禁止への過剰一般化をしない）

## 受け入れ条件

- [ ] 置き場所指針に具体候補が明示されること
- [ ] worktree-operations.md に標準手段が集約されること
- [ ] PowerShell 単一引用符ヒアドキュメント技法と Git Bash 破損知識の相互参照が明記されること

## 元 learning item / 根拠

- inbox 2026-09-26「write guard が workspace 外一時ファイル書込みを fail-closed ブロック、git 管理対象外の .agentdev/integrity/reports/ への配置で解消」（Case #3145）
- deferred「ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロックされる（worktree 内配置で回避）」（移動日 2026-08-15）: worktree 内配置の回避知見。再評価条件の記述なし（包摂再評価）
- deferred「証跡退避先・一時作業先の OS 一時ディレクトリも textlint guard の project root 外判定で fail-closed ブロックされる」（移動日 2026-09-19）: .agentdev/integrity/reports/ + GitHub 恒久証跡 routing の知見。再評価条件（外部 worktree・TEMP 経由の証跡退避・一時作業の再開時）を E6 が直接トリガー
- deferred「write tool の guard は承認済み temp dir 含む project root 外を fail-closed block する（node -e + PS ヒアドキュメントで大規模編集を実行）」（移動日 2026-09-20）: node -e + PowerShell 単一引用符ヒアドキュメントによる大規模編集技法を明示保持（処分判定 L2419）。再評価条件（大規模編集再開時）は E6 では厳密には未トリガーのため包摂再評価として staged 化
