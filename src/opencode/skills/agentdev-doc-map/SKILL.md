---
name: agentdev-doc-map
description: DOC-MAP reading guide and document exploration order. USE FOR: understanding document structure, finding related documents, determining exploration order. DO NOT USE FOR: creating REQ/ADR/SPEC files, implementing changes, or replacing canonical document content.
---

# DOC-MAP ガイド

DOC-MAP（`docs/DOC-MAP.md`）は、AgentDevFlow ドキュメント体系の探索経路インデックスである。
このスキルは DOC-MAP の位置づけ、読み方、および関連ドキュメント探索順序を定義する。

---

## skill extension 参照方針

本スキルは以下の方針に従う（ADR-0135）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-doc-map.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 基準と補助の境界

| ドキュメント種別 | パス | 基準/補助 | 役割 |
|-----------------|------|----------|------|
| REQ | `docs/requirements/REQ-{NNNN}.md` | 基準 | 要件定義の唯一の情報源 |
| ADR | `docs/adr/ADR-{NNNN}.md` | 基準 | アーキテクチャ決定記録の唯一の情報源 |
| SPEC | `docs/specs/**/*.md` | 基準 | システム仕様、実装パターンの唯一の情報源 |
| DOC-MAP | `docs/DOC-MAP.md` | 補助 | ドキュメント探索経路のインデックス |
| README | `docs/README.md`, 各サブディレクトリ README | 補助 | ドキュメントハブ、エントリポイント |

### DOC-MAP の位置づけ

- DOC-MAP は基準文書ではない。REQ/ADR/SPEC の内容を置き換え、複製しない
- DOC-MAP にのみ記載されている情報は、基準（REQ/ADR/SPEC）に根拠を持たなければならない
- DOC-MAP と基準が矛盾する場合、基準を優先する

---

## ドキュメント探索順序

要件定義、実装、検証の各フェーズで、関連ドキュメントを探索する際の順序:

1. **明示入力ファイル** -- ユーザーが指定した入力ファイル（要件ソース）
2. **DOC-MAP.md** -- `docs/DOC-MAP.md` で対象領域の関連ドキュメント構造を把握
3. **各 README/ SPEC 入口** -- `docs/README.md`, `docs/requirements/README.md`, foundations/system SPEC 等
4. **基準 REQ/ADR/SPEC** -- 具体的な要件、判断、仕様の確認
5. **キーワード限定探索** -- req-define の抽出キーワードベース限定探索

### 廃止: requirements/views

- `docs/requirements/views/` は廃止済みである。views を参照、作成、更新してはならない
- views が提供していた観点別体系化機能は DOC-MAP に統合されている

---

## DOC-MAP 読み方ガイド

### 目的

DOC-MAP は「どのドキュメントが何を扱っているか」を俯瞰し、対象領域に関連する基準文書を迅速に特定するための索引である。

### 読み方

1. DOC-MAP の対象領域セクションを特定する
2. 該当セクションに列挙されている基準（REQ/ADR/SPEC）のパスを確認する
3. 必要に応じて基準文書を直接読み込む（DOC-MAP の要約のみで判断しない）
4. 基準に記載がない情報は DOC-MAP からも取得できない

### 探索での利用

- req-define の限定探索前に、DOC-MAP を参照して探索範囲を絞り込む
- case-run の関連ドキュメント影響範囲探索で、DOC-MAP を起点に対象ドキュメントを特定する
- case-close の docs 検証で、DOC-MAP の記載と実際の基準文書の整合性を確認する

---

## 影響確認ルール

基準の追加、変更、削除時に DOC-MAP への影響を確認するルール。

### 影響確認フロー

| 操作 | DOC-MAP 影響確認対象 | 説明 |
|------|---------------------|------|
| REQ 追加 | `docs/requirements/README.md`, `docs/DOC-MAP.md` | 新規REQがDOC-MAPの対象領域セクションに含まれるか確認し、必要に応じて更新 |
| ADR 追加 | `docs/adr/README.md`, `docs/DOC-MAP.md` | 新規ADRがDOC-MAPの対象領域セクションに含まれるか確認し、必要に応じて更新 |
| SPEC 追加/分割/削除 | `docs/specs/README.md`, `docs/DOC-MAP.md` | SPEC構成変更がDOC-MAPの記載に影響するか確認し、必要に応じて更新 |
| DOC-MAP 更新 | -- | DOC-MAPの更新は探索経路の更新であり、要件/判断/仕様の更新ではない |

### 優先順位

- DOC-MAP と基準が矛盾する場合、基準を優先する
- DOC-MAP の更新は基準の更新に付随する作業であり、独立した要件変更としては扱わない

### 更新タイミング

- `req-save`: REQ/ADR 保存時に DOC-MAP への影響を確認
- SPEC 更新時に DOC-MAP への影響を確認
- DOC-MAP と基準の整合性を検証

---

## See Also

- **agentdev-req-file-manager**: REQ ファイル管理、採番、整合性チェック
- **agentdev-adr-file-manager**: ADR ファイル管理

