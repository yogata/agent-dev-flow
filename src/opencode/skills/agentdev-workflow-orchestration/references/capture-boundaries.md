# Capture Boundaries — Intake / Learning 境界定義

AgentDevFlow コマンド群における intake / learning capture の責務境界を定義する一次参照。各コマンドの capture 関連振る舞いは本ファイルに基づく。

## Capture 候補の定義

### Intake 候補

具体的な修正対象が特定できる作業候補。

- **性質**: 積み残し作業・バグ・設定不備・ドキュメント矛盾など、具体的なアクションアイテム
- **保存先**: `.agentdev/intake/inbox/`（intake workflow 経由のみ）
- **後続ルート**: `/agentdev/intake-promote` → `/agentdev/backlog-review` → RU

### Learning 候補

再発防止に向けた知見・判断基準・運用ルール。

- **性質**: 予防策・判断ミスの分析・手順漏レの気づきなど、汎用的な知見
- **保存先**: `.agentdev/learning/inbox.md`（learning-capture スキル経由のみ）
- **後続ルート**: `/agentdev/learning-promote` → `/agentdev/backlog-review` → RU

## Split Rule（観測の分割）

単一の観測から intake 内容と learning 内容の両方が得られる場合、別々の成果物に分離する。

| 内容の性質 | 向け先 | 理由 |
|---|---|---|
| 具体的な修正対象 | intake 候補 | 具体的作業は intake workflow が管理 |
| 再発防止知見 | learning 候補 | 知見の蓄積・昇華は learning pipeline が管理 |
| 両方含まれる | 両方に分割 | 1観測 = 最大 1 learning item + 1 intake item |

**禁止事項**: intake/learning を混ぜた単一成果物を作成してはならない。

## 判断質問

観測内容の分類に迷った場合、以下の質問で判定する:

1. **具体的な修正対象（ファイル・設定・コード）が特定できるか？**
   - YES → intake 候補の可能性が高い
2. **将来同じ問題を防ぐための知見か？**
   - YES → learning 候補の可能性が高い
3. **両方の性質を持つか？**
   - YES → Split Rule に従い両方に分割

## 代表例・非対象例

### Intake 候補の代表例

- 実装中に発見した既存バグ（Issue 完了条件外）
- ドキュメントの矛盾（SPEC と実装の不一致）
- 設定不備による動作差異
- 今回は対応しないが後で直すべき箇所

### Learning 候補の代表例

- CI 失敗の根本原因と回避策
- テンプレート逸脱の検知方法
- gh/git 操作でのワークアラウンド
- エラー対応時の判断基準

### Capture 非対象

- Issue 完了条件内の作業（本筋の実装）
- 既に REQ として扱われている内容
- ユーザーの新規要望（req-define で扱う）
- 推測のみで実観測のない内容

## PR 本文 = 唯一の Capture Handoff

`case-run` から `case-close` への capture 情報の引き継ぎは、**PR 本文のみ**を経由する。

- **PR 本文セクション**: `## Findings / Capture候補`（`### intake` と `### learning` 小見出しを含む）
- **case-run の責務**: 本筋外 finding を PR 本文に記録する。`.agentdev/` の直接変更は禁止
- **case-close の責務**: PR 本文から intake / learning を分離回収し、それぞれのドメイン状態に保存する
- **禁止事項**: case-run が一時会話コンテキスト・ローカル変数・中間ファイル経由で capture 情報を case-close に渡すこと

## コマンド責務境界

| コマンド | Capture 関与 | 詳細 |
|----------|-------------|------|
| case-run | **記録のみ** | 本筋外 finding を PR 本文に記録。`.agentdev/intake/inbox/` と `.agentdev/learning/inbox.md` の直接変更は禁止 |
| case-close | **回収・保存** | PR 本文から intake / learning を分離回収。自身の実観測も Split Rule に基づいて保存。ユーザーに「学びがあるか」質問禁止 |
| req-save | **原則非関与** | 通常は capture を行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能 |
| case-open | **非関与** | intake / learning capture を行わない |
| case-auto | **委譲** | 構成コマンド（case-run / case-close）の責務境界に従う。case-auto 固有の capture 振る舞いは持たない |

## See Also

- **agentdev-learning-capture**: learning 抽出の具体的スキル（13 項目形式・実観測ベース原則）
- **agentdev-workflow-lifecycle**: Split Rule の上位概念（intake / learning 境界）
- **agentdev-workflow-templates**: PR 本文テンプレート（`pr_desc.md`）
