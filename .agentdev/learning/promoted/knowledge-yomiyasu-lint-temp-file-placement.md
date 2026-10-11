# yomiyasu-lint-temp-file-placement

## 背景

GitHub 文章の書込み前推敲（yomiyasu lint）で検査専用本文ファイルを作成する際、extension rule が「非永続領域〔一時ディレクトリ等のリポジトリ外〕への新規作成」を指示する一方、実行環境の workspace 外書込み guard がリポジトリ外パスへのツール書込みを fail-closed で拒否する。この前提衝突により、case-open STEP-2・STEP-4、case-ready STEP-4 で同一事象が 3 Case（Issue #3552、Issue #3585、Case #3605）にわたり再発した。各実行とも guard の解除・迂回を行わず標準手段へ切替して回復しており、実害は切替の都度判断コストだが、同じ衝突が 3 回独立に観測された。Issue #3585 の観測では、git-bash の heredoc（UTF-8 生バイト保持）でリポジトリ外一時ディレクトリへのファイル作成自体は成立する一方、Write ツール経由では guard 拒否となるという、手段別の差異も観測されている。

## 問題

`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の `yomiyasu-application-before-write` rule（現行 L30）は、検査専用本文ファイルの作成先を「非永続領域〔一時ディレクトリ等のリポジトリ外〕」と指示しているが、workspace 外書込み guard が有効な環境では Write ツールによるリポジトリ外書込みが fail-closed ブロックされる。rule 側には guard ブロック時の contingency（代替手段・代替置き場所）が未規定であり、実行者が毎回切替先を自力判断する構造になっている。

## 望ましい変更

yomiyasu 適用を指示する extension rule（case-open、および同等 rule を持つ他 workflow extension）の文面に、次の contingency を追加する:

- Write ツールの guard 拒否時は、(a) bash heredoc または node fs.writeFileSync（UTF-8 明示）でリポジトリ外一時ディレクトリへ作成する、または (b) 置き場所を project root 内の git 管理対象外領域（例: `.agentdev/integrity/reports/`）へ変更し、検査後に削除する
- 同等の置き場所指針の先例が `src/common/skills/agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」節に存在する旨を参照させる

## 対象範囲

### 対象

- `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の `yomiyasu-application-before-write` rule 文面
- 同等の yomiyasu 適用 rule を持つ他 workflow extension（例: `.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml`）

### 対象外

- guard 本体（agentdev-textlint-guard）の fail-closed 契約の変更
- AGENTS.md 等の共通規律の変更（既に標準手段切替指針は記載済み）
- yomiyasu lint の実行方法自体（パイプ・リダイレクト禁止等の既存指示）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| project extension（rules） | `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` | yomiyasu-application-before-write rule への contingency 追加 |
| project extension（rules） | `.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml`（同等 rule が存在する場合） | 同 contingency の追加 |
| knowledge（候補） | docs/knowledge/ | workspace 外書込み guard 環境での検査専用一時ファイル置き場所パターンの記録候補 |

既存解答の参照先として、`src/common/skills/agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」節（project root 内限定・commit 対象外・検査後削除）がある。

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`（rule L30 現行文を実測確認。grep: 「リポジトリ外」指示はあるが contingency 表記なし）/ `src/common/skills/agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」節（同種制約への先例）/ AGENTS.md「標準手段への切替」指針
- **ギャップ分類**: guardrail insufficiency（rule 側の contingency 欠落）
- **ギャップ詳細**: inspect_cross_dependencies scripts README には同一問題への既存解答（置き場所指針）が規定されているが、yomiyasu rule 側には同等の contingency が未反映。3 Case 連続で同一衝突が観測された

## 制約

- guard の解除・迂回は行わない（fail-closed 契約の維持）。対応はあくまで指示側の contingency 追加である
- extensions はプロジェクト固有管理であり、配布物（src/common/**）ではない。case-open extension の rules 表現補足は「配布物更新を伴うため req-define 再合意経路で評価」が必要（Issue #3585 の学びが指摘済み）
- Windows 環境固有の問題（パイプ・リダイレクト禁止の経緯と同根）であり、rule 文面変更は Windows 前提の注記を崩さない

## 受け入れ条件

- [ ] yomiyasu 適用を指示する extension rule に、guard ブロック時の contingency（heredoc / node fs.writeFileSync / project root 内除外領域への切替）が明記されている
- [ ] contingency は既存の置き場所指針（scripts/README.md）と矛盾しない
- [ ] 同等 rule を持つ他 workflow extension へも同一 contingency が適用されている

## 元learning item / 根拠

- **要約**: workspace 外一時ディレクトリへの yomiyasu lint 用本文ファイル作成が書込み guard に fail-closed ブロックされ、project root 内 git 管理対象外領域への切替（または heredoc・node fs による作成）が正経路になる（エントリ: 「yomiyasu 検査専用本文ファイルの workspace 外作成指示が書込み guard に fail-closed ブロックされ project root 内へ切替した」「workspace 外一時ディレクトリへの lint 用本文ファイル作成が書込み guard に fail-closed 拒否される」「yomiyasu lint 一時ファイルの workspace 外書込みは guard fail-closed でブロックされるため project root 内除外領域へ切替する」の 3 エントリ統合）
- **根拠**: 3 Case（#3552・#3585・#3605）で同一衝突を観測。根本原因は extension rule（リポジトリ外指示）と実行基盤 guard（fail-closed）の前提衝突。各実行とも guard 解除・迂回なしで標準手段切替により回復。先例（inspect_cross_dependencies scripts README 置き場所指針）の存在が切替先の妥当性を裏付ける
- **再発条件**: workspace 外書込み guard が有効な環境で、extension rule や手順文書がリポジトリ外への一時ファイル作成を指示した場合
- **横展開可能性**: 検査専用一時ファイルが必要な全工程（yomiyasu lint、横断依存検査入力 JSON、prepare_definition_pr 入力 JSON）で同様の衝突が発生し得る

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: docs
- **関連Issue**: #3552、#3585（Root Case Issue #3585 に報告済み）
