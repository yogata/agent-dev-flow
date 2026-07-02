---
name: agentdev-backlog-integration
description: backlog-review の採用済み成果物（promoted artifact）統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決の知識ベース。USE FOR: 採用済み成果物の統合、分割判定、矛盾検出、RU 生成ルール、depends_on 依存解決基準、成果物読み込み、分析メタデータ項目。DO NOT USE FOR: intake 抽出、promote（`agentdev-intake-pipeline`）、REQ 構造診断（`agentdev-req-structure-diagnostics`）、work_type 判定（`agentdev-workflow-lifecycle`）
---

# バックログレビュー統合知識ベース（backlog-review）

backlog-review コマンドの統合判定知識ベース。
採用済み成果物（promoted artifact）の読み込み、分析、RU への統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決の判定基準と詳細構造を提供する。

## skill doc-input 参照方針

本スキルは以下の方針に従う（ADR-0133）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **doc-input の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill doc-input（`.agentdev/doc-inputs/skills/agentdev-backlog-integration.yaml`）を読む。skill doc-input はスキル単位で1ファイルに集約し、reference ごとの doc-input は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: doc-input に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **doc-input 未配置時の挙動**: skill doc-input が存在しない場合は `config.yaml` の `roots` と明示入力のみを使い、推測で docs を読みに行かない
## USE FOR

- 採用済み成果物の統合、分割判定（N:1 統合/ 1:N 分割/ 1:1）
- 採用済み成果物間の矛盾検出と partial success 扱い
- RU 生成ルール（frontmatter、セクション構成、採番、前工程からの引き継ぎ（upstream handoff）転記）
- depends_on 依存解決基準（未解決、循環、並べ替え可能性の検証）
- 採用済み成果物の読み込み、分析メタデータ項目

## DO NOT USE FOR

- intake の抽出、promote（`agentdev-intake-pipeline` を参照）
- REQ 構造診断（`agentdev-req-structure-diagnostics` を参照）
- work_type 判定（`agentdev-workflow-lifecycle` を参照）

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| `.opencode/commands/agentdev/backlog-review.md` | 採用済み成果物を読み込み、分析し、統合、分割判定、矛盾検出を経て RU を生成する |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| `references/integration-judgment.md` | 成果物の読み込み、分析、統合分割判定、depends_on 依存解決、矛盾検出、RU 生成の判定ロジック |

backlog-review コマンドの実行時投影先パスは `.opencode/commands/agentdev/backlog-review.md`。
command 本文内で backlog-review を参照する場合はこちらを使用。

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定基準、フェーズ定義、前工程からの引き継ぎ（upstream handoff）判定
- **agentdev-intake-pipeline**: intake 抽出、promote 判定
- **agentdev-req-structure-diagnostics**: REQ 構造診断

