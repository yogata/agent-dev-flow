# ローカル版 OpenCode 生成時ソース領域

> **非正規文書**: 本ディレクトリは AgentDevFlow 本体リポジトリの `docs/`（リポジトリ内部設計文書）ではなく、ローカル版 OpenCode 生成のための「生成時ソース領域」である（ADR-0126）。要件は `docs/requirements/REQ-0141.md`、仕様は `docs/specs/local-*.md` を正とする。

## 目的

GitHub Issue / PR を使えない個人利用環境（ローカル版 OpenCode）向けに、AgentDevFlow のコマンド / スキル / ひな形を生成先リポジトリの `.opencode/` に直接生成するためのスキーマ、変換プロンプト、変換仕様、生成フローを保持する（REQ-0141-003, 004, 031）。
生成済みコマンド / スキル / ひな形は配置しない。

## ディレクトリ構成

```text
src/opencode-local/
├── README.md              ← 本ファイル（ローカル版生成の実行手順）
├── case-schema/           ← Case ファイルの定義
│   ├── case-file.md       ← スキーマ定義（YAML 前書き・status enum・labels・headings・採番）
│   └── rules/
│       ├── frontmatter.yaml   ← YAML 前書きスキーマの機械可読定義
│       ├── status.yaml        ← status enum と状態遷移表の機械可読定義
│       ├── labels.yaml        ← labels 値域の機械可読定義
│       └── headings.yaml      ← 見出し一覧の機械可読定義
├── transform/             ← 変換プロンプトと変換仕様
│   ├── generate.md        ← 変換用プロンプト（AI エージェントがローカル版を生成するための指示）
│   ├── review.md          ← レビュー用プロンプト（生成結果を検証するための指示）
│   └── spec.md            ← 変換仕様（変換対象・ガードレール一覧・レポートフォーマット）
└── generation-flow.md     ← 生成フロー定義（手順・安全確認・generated_by 形式）
```

### 作成しないディレクトリ（REQ-0141-005）

以下は作成しない。
`requirements/` と `specs/` は `docs/` 配下の同名ディレクトリと概念衝突するため不採用。

- `src/opencode-local/_conv/`
- `src/opencode-local/commands/`
- `src/opencode-local/skills/`
- `src/opencode-local/requirements/`
- `src/opencode-local/specs/`

## ローカル版生成の実行手順

ローカル版 OpenCode の生成は、OpenCode 等 AI エージェントで `transform/generate.md`（変換用プロンプト）を入力またはファイル参照して実行する（REQ-0141-031, 032）。
決定的な変換ロジックを実装した変換スクリプトは使用しない。

### 前提

- 生成先リポジトリが AgentDevFlow 本体リポジトリでないこと（REQ-0141-006）
- 仕様管理リポジトリ（AgentDevFlow 本体）の `src/opencode/` と `src/opencode-local/` にアクセスできること
- 生成先リポジトリに `.opencode/` ディレクトリが存在すること（または作成可能であること）
- GitHub 版とローカル版を同じ `.opencode/` に同居させないこと（REQ-0141-015）

### 手順

1. **生成先リポジトリで OpenCode 等 AI エージェントを起動する**
   - AgentDevFlow 本体リポジトリでは実行しない（REQ-0141-006）

2. **AI エージェントに `transform/generate.md` を入力またはファイル参照で渡す**
   - 入力方法例: `@src/opencode-local/transform/generate.md` でファイル参照
   - または `transform/generate.md` の内容をプロンプトとして入力

3. **AI エージェントが生成フロー（`generation-flow.md` 参照）に従って実行する**
   - 実行環境の特定（Step 1）
   - 入力の読み込み（Step 2）
   - ジャンクション検出安全ゲート（Step 3）
   - 同名ファイル確認（Step 4）
   - 変換の実行（Step 5）
   - 生成物の配置（Step 6）
   - レポート出力（Step 7）

4. **生成レポートを確認する**
   - 結果が `PASS` の場合: 生成完了
   - 結果が `FAIL` の場合: 違反一覧を確認し、手動で修正または再生成

5. **必要に応じてレビューを実行する**
   - `transform/review.md`（レビュー用プロンプト）を AI エージェントに入力し、生成物を検証

### 実行例

```text
[生成先リポジトリにて]

1. OpenCode を起動
2. AI エージェントへ指示:
   「@<仕様管理リポジトリへのパス>/src/opencode-local/transform/generate.md
    に従ってローカル版 OpenCode を生成してください。
    仕様管理リポジトリ: <パス>
    生成先: 現在のリポジトリの .opencode/」
3. AI エージェントが generate.md の指示に従い生成を実行
4. 生成レポートを確認
```

## 更新運用（全削除して作り直し）

ローカル版の高頻度更新は想定しない。
更新時は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す（REQ-0141-033）。
差分更新は想定しない。

全削除により `generated_by` 識別子による上書き保護を迂回できるが、これは利用者自身の明示的操作によるものであり、ローカル版生成プロンプトによる自動上書きとは区別する。

### 更新手順

1. 生成先リポジトリの `.opencode/commands/agentdev/` を全削除
2. 生成先リポジトリの `.opencode/skills/agentdev-*/` を全削除
3. 「ローカル版生成の実行手順」に従い、再度生成を実行

## 安全性制約

ローカル版生成は以下の安全性制約に従う（ADR-0126）。
詳細は `generation-flow.md` 参照。

- **原本保護**: `src/opencode/` は GitHub 版専用の原本であり、ローカル版のために変更しない（REQ-0141-014, ADR-0126 decision #4）
- **`generated_by` 識別子**: 生成物に `generated_by: local-opencode-transform` を記録し、同名ファイル上書きは識別子存在時のみ許可（REQ-0141-011, 012, 013, ADR-0126 decision #2）
- **ジャンクション検出安全ゲート**: `.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止（REQ-0141-010, ADR-0126 decision #3）

## リポジトリ管理対象

- **管理対象外**: 生成された `.opencode/commands/` 、 `.opencode/skills/` 、 `.opencode/` 配下ひな形、変換スクリプト（REQ-0141-008, 009）。生成先リポジトリの `.gitignore` で除外することを推奨
- **管理対象**: `.agentdev/cases/` 配下の Case ファイル（REQ-0141-016）

## 関連項目

- [生成フロー定義](generation-flow.md) — 手順、安全確認、`generated_by` 形式
- [変換用プロンプト](transform/generate.md) — ローカル版生成の指示書
- [レビュー用プロンプト](transform/review.md) — 生成結果の検証指示
- [変換仕様](transform/spec.md) — 変換対象一覧、ガードレール一覧、レポートフォーマット
- [Case ファイルスキーマ定義](case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/requirements/REQ-0141.md` — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義（正本）
- `docs/specs/local-case-file.md` — Case ファイルスキーマの正本 SPEC
- `docs/specs/local-generation.md` — 生成フロー、安全ゲートの正本 SPEC
- `docs/specs/local-transform.md` — 変換プロンプト、レビュープロンプト要件の正本 SPEC
- `docs/adr/ADR-0126.md` — source model 拡張と生成安全性制約
