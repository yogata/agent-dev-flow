# Requirements Index

## 現行基準（REQ-0042〜REQ-0050）

REQ体系再基準化（REQ-0041 / ADR-0009）により、旧REQ群（REQ-0001〜REQ-0040）を整理統合した新基準REQ群。現在の仕様参照は以下のREQを第一参照先とすること。

| REQ ID | タイトル | 対象領域 |
| ------ | -------- | -------- |
| REQ-0042 | REQ/ADR/SPEC/DOC-MAP 基準構造 | 文書種別の責務・基準境界・参照関係・操作モデル |
| REQ-0043 | req-define / req-save / REQ分類ゲート | 入出力契約・操作分類・反映作業混入防止 |
| REQ-0044 | Command / Skill / Template / Script 責任分界 | 各artifactの責務境界・配置規約・品質基準 |
| REQ-0045 | AgentDevFlow command protocol | 入出力契約・実行順序・Pattern体系・SSoT遷移 |
| REQ-0046 | intake / learning / req-backlog / RU lifecycle | パイプライン責務境界・成果物lifecycle・状態遷移 |
| REQ-0047 | case-run / case-close / post-run capture | 実行プロセス・信頼性・Findings回収・完了ゲート |
| REQ-0048 | reporting / GitHub body / link / writing quality | 完了報告・本文品質検証・リンク正規化・AI-slop抑止 |
| REQ-0049 | integrity / validation / tests | 横断的整合性検証・バリデーション・テスト体系 |
| REQ-0050 | REQ再構成intakeの分離保存と回収導線 | REQ再構成候補の分離保存・回収サイクル・検知観点 |

> 旧REQ群との対応関係は [mapping-table.md](mapping-table.md) を参照。

## Retained（現行有効な旧REQ）

後継REQなし。旧REQ自体が現行仕様として独立有効。

| REQ ID | タイトル | 領域 |
| ------ | -------- | ---- |
| REQ-0001 | AgentDevFlow ワークフローアーキテクチャ | workflow |
| REQ-0003 | Case 並列実行 | parallel |
| REQ-0005 | Epic Issue 管理 | epic |
| REQ-0006 | Sisyphus プラン基盤 | sisyphus |
| REQ-0008 | スキル品質フレームワーク | skill |
| REQ-0012 | AI-slop 執筆品質基準 | writing-quality/ai-slop |
| REQ-0018 | agentdev-req-analysis 未決分岐解消メソドロジー | req-analysis/wall-discussion |
| REQ-0020 | Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化 | epic/orchestration/ssot |
| REQ-0021 | AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針 | integrity/scripts |
| REQ-0030 | agentdev コマンド群の体系的テスト実装 | testing/quality |
| REQ-0031 | GitHub本文内リポジトリ参照リンクの正規化 | github/link-normalization |
| REQ-0032 | case-close 未チェック項目達成判定 | enhancement/case-close |
| REQ-0034 | req-define 関連ドキュメント更新候補抽出と後続工程への伝播 | enhancement/req-define |
| REQ-0035 | DOC-MAP導入と requirements/views 廃止による文書探索・維持管理再設計 | doc-map |
| REQ-0038 | case実行信頼性向上（チェックボックス確認・pull前チェック・docs整合性grep） | enhancement/reliability |

## Partially Superseded（一部が後継REQに移行済みの旧REQ）

旧REQの一部だけを後継REQへ移行し、残りは履歴または限定的基準として残す。

| REQ ID | タイトル | 後継REQ | 領域 |
| ------ | -------- | ------- | ---- |
| REQ-0002 | AgentDevFlow コマンドプロトコル | REQ-0045 | commands |
| REQ-0004 | 要件・ADRドキュメントシステム | REQ-0042 | requirements/adr |
| REQ-0007 | ナレッジパイプライン高度化 | REQ-0046 | knowledge/learning |
| REQ-0009 | テンプレートシステム | REQ-0044 | templates |
| REQ-0010 | AgentDevFlow Command実装改善：安全性・品質・状態管理 | REQ-0045 | workflow/safety |
| REQ-0011 | Issue/PR書き込み後の内容品質自動検証 | REQ-0048 | quality-assurance |
| REQ-0014 | case-run 自律修正ループと責務分離の明確化 | REQ-0047 | workflow/self-healing |
| REQ-0015 | 関連ドキュメントの要件達成対象化 | REQ-0047 | workflow/documentation |
| REQ-0016 | Command/Skill/Template/Script責任分界とtips要件ソース化 | REQ-0044 | commands/skills |
| REQ-0017 | AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化 | REQ-0044 | agentdev/namespace |
| REQ-0019 | intake / learning の責任境界明確化と workflow 組み込み | REQ-0046 | agentdev/intake/learning |
| REQ-0022 | .agentdev domain state 更新後の git 永続化 | REQ-0049 | agentdev/git |
| REQ-0024 | 全 agentdev コマンドの完了報告フォーマット統一 | REQ-0048 | enhancement/workflow-reporting |
| REQ-0025 | intake 系コマンドの .agentdev/intake 更新後の git 永続化 | REQ-0049 | agentdev/git |
| REQ-0026 | intake lifecycle の queue/archive 再定義 | REQ-0046 | agentdev/intake |
| REQ-0027 | learning artifact lifecycle の責任範囲明確化 | REQ-0046 | learning/lifecycle |
| REQ-0036 | agentdev-no-ai-slop-writing Skill 追加 | REQ-0048 | skill/writing-quality |
| REQ-0037 | worktree 削除時の残存ファイル対策強化 | REQ-0047 | case-close/worktree |
| REQ-0039 | req-backlog コマンドと Requirement Unit パイプライン | REQ-0046 | workflow/req-backlog |
| REQ-0040 | 子Issue PRに Findings / Intake候補を永続化し、case-closeで回収する | REQ-0047 | intake/pr-template |

## Superseded（全面置き換え済み）

旧REQを現行基準として読まず、後継REQまたは履歴参照に置き換える。

| REQ ID | タイトル | 後継REQ |
| ------ | -------- | ------- |
| REQ-0013 | intake 承認フロー分割と解消済み確認機能 | REQ-0046 |
| REQ-0023 | learning staging stub の取り込み追跡と取り込み後アーカイブ | REQ-0046 |
| REQ-0028 | Documentation granularity and responsibility restructuring | REQ-0042 |
| REQ-0029 | intake-open promoted artifact 一括処理 | REQ-0046 |
| REQ-0033 | AgentDevFlow command / skill 定義の二次整合性是正 | REQ-0049 |

## 分類ゲート

REQ-0041（REQ体系再基準化）で定義された分類ゲートに基づき、全40件の旧REQ（REQ-0001〜REQ-0040）を以下の3カテゴリに分類している。

| 分類 | 件数 | 意味 |
| ---- | ---- | ---- |
| retained | 15 | 旧REQのID・本文をそのまま現行基準として維持。後継REQなし |
| partially superseded | 20 | 旧REQの一部だけを後継REQへ移行し、残りは履歴または限定的基準として残す |
| superseded | 5 | 旧REQを現行基準として読まず、後継REQまたは履歴参照に置き換える |

## 基準構造

### per-file 基準

`REQ-{NNNN}.md` を要件の永続基準とする（REQ-0042-001）。各要件が1ファイルに対応する。要件の判断・更新において REQ を基準とし、`docs/DOC-MAP.md` は文書探索の参照入口として使用する。文書間の記述に矛盾がある場合は、REQ を優先する。

### DOC-MAP（文書探索入口）

`docs/DOC-MAP.md` は文書探索・参照経路の入口として機能する参照用文書である（REQ-0042 / REQ-0035 / ADR-0008）。基準は各 `REQ-{NNNN}.md` ファイルである。

### 関連

- REQ-0041: REQ体系再基準化
- ADR-0009: REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入
- [mapping-table.md](mapping-table.md): 旧REQ↔新基準REQ対応表
