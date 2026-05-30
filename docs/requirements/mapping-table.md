---
id: mapping-table
title: "旧REQ↔新基準REQ対応表"
created: "2026-05-30"
updated: "2026-05-30"
---

## 目的

REQ体系再基準化（REQ-0041 / ADR-0009）に伴い、旧REQ全40件（REQ-0001〜REQ-0040）と新基準REQ群（REQ-0042〜REQ-0049）の対応関係を明記する。各旧REQについて、現行分類・後継REQ・継承内容・非継承内容・反映作業の移送先を一覧化し、後続工程での参照可能性を確保する。

## 対応表

| 旧REQ ID | 現行分類 | 後継REQ | 継承する内容 | 継承しない内容 | 反映作業の移送先 | 備考 |
|---|---|---|---|---|---|---|
| REQ-0001 | retained | —（現行有効） | 全文現行仕様 | — | — | ワークフローアーキテクチャ。3フェーズ構成・SSoT遷移・エラー回復はREQ-0045と重複するが、REQ-0001自体がアーキテクチャ基盤として独立有効 |
| REQ-0002 | partially superseded | REQ-0045 | 入出力契約・フェーズ境界の基本概念 | 既存REQ照合ロジック（→REQ-0043）・Pattern拡張（→REQ-0045）・SSoT遷移詳細（→REQ-0045） | 関連ドキュメント更新候補 | コマンドプロトコルの基礎はREQ-0045に再定義済み |
| REQ-0003 | retained | —（現行有効） | 全文現行仕様 | — | — | Case並列実行・Wave実行モデル |
| REQ-0004 | partially superseded | REQ-0042 | REQ/ADRのper-file基準構造・frontmatter規約 | views関連（→REQ-0035で廃止済み）・finding protocol（→REQ-0042）・SPLIT検出時の操作（→REQ-0042） | 関連ドキュメント更新候補 | ドキュメントシステムの基準構造はREQ-0042に再定義済み |
| REQ-0005 | retained | —（現行有効） | 全文現行仕様 | — | — | Epic Issue管理・親子関係・自動クローズ |
| REQ-0006 | retained | —（現行有効） | 全文現行仕様 | — | — | Sisyphusプラン基盤 |
| REQ-0007 | partially superseded | REQ-0046 | learning pipeline の3目的（再発防止・抽象化・反映） | staging stub管理（→REQ-0046）・旧tips-*コマンド参照・具体的なコマンド手順（→REQ-0046） | follow-up | ナレッジパイプラインの目的はREQ-0046に再定義済み |
| REQ-0008 | retained | —（現行有効） | 全文現行仕様 | — | — | スキル品質フレームワーク。frontmatter・description・トークン予算 |
| REQ-0009 | partially superseded | REQ-0044 | テンプレートの命名・配置・変数規約の基本概念 | テンプレート選択ルール（→REQ-0044）・テンプレート構造詳細（→REQ-0044） | 関連ドキュメント更新候補 | テンプレートシステムはREQ-0044に再定義済み |
| REQ-0010 | partially superseded | REQ-0045 | Pattern拡張・SSoT明確化・エラー回復の基本方針 | draft状態遷移・Guardrails整理・旧issue-*コマンド参照 | 関連ドキュメント更新候補 | Command実装改善の基本方針はREQ-0045に統合済み |
| REQ-0011 | partially superseded | REQ-0048 | Issue/PR書き込み後の品質検証（3観点・リトライ） | 個別コマンド手順・テンプレート参照 | 関連ドキュメント更新候補 | 内容品質自動検証はREQ-0048に再定義済み |
| REQ-0012 | retained | —（現行有効） | 全文現行仕様 | — | — | 自然言語ポリシー（日本語統一） |
| REQ-0013 | superseded | REQ-0046 | —（全面置き換え） | 全面置き換え | — | intake承認フロー分割はREQ-0039→REQ-0046に統合。旧intake-from-github手順は全面置き換え |
| REQ-0014 | partially superseded | REQ-0047 | case-run自律修正ループの基本方針 | Step番号依存の詳細手順・旧issue-work参照・CI/CD具体手順 | follow-up | 自律修正ループはREQ-0047に再定義済み |
| REQ-0015 | partially superseded | REQ-0047 | 関連ドキュメントの要件達成対象化の基本方針 | 個別ドキュメント更新指示 | 関連ドキュメント更新候補 | 要件達成対象化はREQ-0047に再定義済み |
| REQ-0016 | partially superseded | REQ-0044 | Command/Skill/Template/Script責任分界の基本概念 | learning要件ソース化の旧手順（→REQ-0043）・旧staging stub参照 | 関連ドキュメント更新候補 | 責任分界はREQ-0044に再定義済み |
| REQ-0017 | partially superseded | REQ-0044 | plugin namespace統一（agentdev）・domain state定義 | 旧issue-*→agentdev移行手順・旧tips-*参照 | follow-up | namespace統一はREQ-0044に再定義済み |
| REQ-0018 | retained | —（現行有効） | 全文現行仕様 | — | — | 未決分岐解消メソドロジー |
| REQ-0019 | partially superseded | REQ-0046 | intake / learning 責任境界の基本方針 | 個別コマンド手順・旧intake-open参照 | follow-up | 責任境界明確化はREQ-0046に再定義済み |
| REQ-0020 | retained | —（現行有効） | 全文現行仕様 | — | — | Epic Issue実行順序SSoT・Epic Orchestrator |
| REQ-0021 | retained | —（現行有効） | 全文現行仕様 | — | — | ガードレールのスクリプト化・skill-local scripts配置 |
| REQ-0022 | partially superseded | REQ-0049 | .agentdev git永続化の基本パターン | 個別コマンド手順・旧コマンド名参照 | follow-up | git永続化はREQ-0049に再定義済み |
| REQ-0023 | superseded | REQ-0046 | —（全面置き換え） | 全面置き換え | — | staging stubの取り込み追跡はREQ-0046のRU lifecycleに全面置き換え |
| REQ-0024 | partially superseded | REQ-0048 | 完了報告フォーマット統一の基本方針 | 個別コマンド手順・旧完了報告形式 | 関連ドキュメント更新候補 | 完了報告フォーマットはREQ-0048に再定義済み |
| REQ-0025 | partially superseded | REQ-0049 | intake系コマンドのgit永続化パターン | 個別コマンド手順・旧コマンド名参照 | follow-up | git永続化はREQ-0049に再定義済み |
| REQ-0026 | partially superseded | REQ-0046 | intake lifecycleのqueue/archive再定義の基本方針 | 個別ディレクトリ構造詳細・旧コマンド名参照 | 関連ドキュメント更新候補 | intake lifecycleはREQ-0046に再定義済み |
| REQ-0027 | partially superseded | REQ-0046 | learning artifact lifecycleの責任範囲の基本方針 | 個別artifactの詳細手順・旧コマンド名参照 | 関連ドキュメント更新候補 | learning lifecycleはREQ-0046に再定義済み |
| REQ-0028 | superseded | REQ-0042 | —（全面置き換え） | 全面置き換え | — | ドキュメント粒度・責務再構築はREQ-0042の基準構造定義に全面置き換え |
| REQ-0029 | superseded | REQ-0046 | —（全面置き換え） | 全面置き換え | — | intake-open一括処理はREQ-0039→REQ-0046に全面置き換え |
| REQ-0030 | retained | —（現行有効） | 全文現行仕様 | — | — | コマンド群の体系的テスト実装 |
| REQ-0031 | retained | —（現行有効） | 全文現行仕様 | — | — | GitHub本文内リポジトリ参照リンクの正規化 |
| REQ-0032 | retained | —（現行有効） | 全文現行仕様 | — | — | case-close未チェック項目達成判定 |
| REQ-0033 | superseded | REQ-0049 | —（全面置き換え） | 全面置き換え | — | 二次整合性是正はREQ-0049のintegrity/validationに全面置き換え |
| REQ-0034 | retained | —（現行有効） | 全文現行仕様 | — | — | req-define関連ドキュメント更新候補抽出 |
| REQ-0035 | retained | —（現行有効） | 全文現行仕様 | — | — | DOC-MAP導入とviews廃止 |
| REQ-0036 | partially superseded | REQ-0048 | AI-slop検出・文章品質ゲートの基本方針 | Skill定義の詳細手順 | follow-up | 文章品質ゲートはREQ-0048に再定義済み |
| REQ-0037 | partially superseded | REQ-0047 | worktree削除時の残存ファイル対策の基本方針 | 個別Step手順 | follow-up | worktree残存ファイル対策はREQ-0047に再定義済み |
| REQ-0038 | retained | —（現行有効） | 全文現行仕様 | — | — | case実行信頼性向上 |
| REQ-0039 | partially superseded | REQ-0046 | req-backlog/RUパイプラインの基本概念 | promoted artifact詳細手順・旧コマンド名参照 | 関連ドキュメント更新候補 | RU lifecycleはREQ-0046に再定義済み |
| REQ-0040 | partially superseded | REQ-0047 | Findings/Intake候補のPR本文永続化・回収の基本方針 | 個別Step手順・Epic横断回収詳細 | follow-up | Findings回収はREQ-0047に再定義済み |

## 凡例

### 分類の意味

| 分類 | 意味 |
|---|---|
| retained | 旧REQのID・本文をそのまま現行基準として維持する。後継REQなし |
| partially superseded | 旧REQの一部だけを後継REQへ移行し、残りは履歴または限定的基準として残す |
| superseded | 旧REQを現行基準として読まず、後継REQまたは履歴参照に置き換える |

### 記号の説明

| 記号 | 意味 |
|---|---|
| —（現行有効） | 後継REQなし。旧REQ自体が現行仕様として有効 |
| —（全面置き換え） | 旧REQの内容は全て後継REQに置き換わっている |
| — | 該当項目なし |

### 反映作業の移送先

| 移送先 | 意味 |
|---|---|
| 関連ドキュメント更新候補 | req-define / case-run で関連ドキュメント更新候補として扱う |
| follow-up | 後続Caseまたは別Issueで対応する |
| — | 移送対象なし（retainedまたはsupersededで移送不要） |

### 新基準REQ群の概要

| REQ ID | タイトル | 対象領域 |
|---|---|---|
| REQ-0042 | REQ/ADR/SPEC/DOC-MAP 基準構造 | 文書種別の責務・基準境界・参照関係・操作モデル |
| REQ-0043 | req-define / req-save / REQ分類ゲート | 入出力契約・操作分類・反映作業混入防止 |
| REQ-0044 | Command / Skill / Template / Script 責任分界 | 各artifactの責務境界・配置規約・品質基準 |
| REQ-0045 | AgentDevFlow command protocol | 入出力契約・実行順序・Pattern体系・SSoT遷移 |
| REQ-0046 | intake / learning / req-backlog / RU lifecycle | パイプライン責務境界・成果物lifecycle・状態遷移 |
| REQ-0047 | case-run / case-close / post-run capture | 実行プロセス・信頼性・Findings回収・完了ゲート |
| REQ-0048 | reporting / GitHub body / link / writing quality | 完了報告・本文品質検証・リンク正規化・AI-slop抑止 |
| REQ-0049 | integrity / validation / tests | 横断的整合性検証・バリデーション・テスト体系 |

## 分類統計

| 分類 | 件数 | REQ |
|---|---|---|
| retained | 15 | REQ-0001, 0003, 0005, 0006, 0008, 0012, 0018, 0020, 0021, 0030, 0031, 0032, 0034, 0035, 0038 |
| partially superseded | 20 | REQ-0002, 0004, 0007, 0009, 0010, 0011, 0014, 0015, 0016, 0017, 0019, 0022, 0024, 0025, 0026, 0027, 0036, 0037, 0039, 0040 |
| superseded | 5 | REQ-0013, 0023, 0028, 0029, 0033 |

## 関連情報

- **Related**: REQ-0041（REQ体系再基準化）
- **Related ADRs**: ADR-0009（REQ体系再基準化）
- **Related**: REQ-0042〜REQ-0049（新基準REQ群）
