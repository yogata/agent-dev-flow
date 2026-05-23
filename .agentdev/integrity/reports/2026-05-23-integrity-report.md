# Integrity Check Report

- **実行日時**: 2026-05-23 13:09
- **スキャン対象**: REQ 27件、ADR 6件、Skill 20件、Command 14件

## サマリ

| 検査カテゴリ | OK | NG | 備考 |
|-------------|----|----|------|
| REQ frontmatter↔ファイル名 | 27 | 0 | — |
| ADR↔REQ 相互参照 | 6 | 0 | 一方向トレーサビリティギャップ 2件（info） |
| Skill↔load_skills 参照 | 17 | 0 | 未使用スキル 3件（meta-tooling、info） |
| Command-map↔実体 | 14 | 0 | description不一致 1件（warning）、詳細リンク不足（warning） |
| 旧 namespace 残存 | 8 | 0 | warning 2件、未実装 2件 |

**総合判定**: NG（修正必須）0件 / Warning（確認推奨）4件 / Info 4件

---

## 詳細

### REQ frontmatter↔ファイル名

#### step2a: frontmatter id ↔ filename
**問題なし** — 27/27 ファイル全てで frontmatter `id` とファイル名の数字が一致。

#### step2b: frontmatter 必須フィールド
**問題なし** — 27/27 ファイル全てで `id`, `title`, `created`, `updated`, `tags` が存在。

#### step2c: README インデックス整合性
**問題なし** — `docs/requirements/README.md` に REQ-0001〜REQ-0027 が全て記載。逆にファイルが存在しないREADME エントリもなし。

---

### ADR↔REQ 相互参照

#### step3a: ADR→REQ 参照
**問題なし** — 全ての ADR 内 REQ 参照が実在するファイルを指している。

| ADR | 参照REQ | 状態 |
|-----|---------|------|
| ADR-0001 | なし | — |
| ADR-0002 | なし | — |
| ADR-0003 | REQ-0007 | ✅ |
| ADR-0004 | REQ-0004 | ✅ |
| ADR-0005 | REQ-0017 | ✅ |
| ADR-0006 | REQ-0020 | ✅ |

#### step3b: REQ→ADR 参照
**問題なし** — 全ての REQ 内 ADR 参照が実在するファイルを指している。

| REQ | 参照ADR | 状態 |
|-----|---------|------|
| REQ-0017 | ADR-0005 | ✅ |
| REQ-0020 | ADR-0006 | ✅ |

#### step3c: ステータス整合性
**問題なし** — 不自然なステータス組み合わせなし。

#### info: 一方向トレーサビリティギャップ（修正不要・参考情報）

| ADR | REQ | ギャップ内容 |
|-----|-----|-------------|
| ADR-0003 | REQ-0007 | ADR→REQ 参照あり、REQ→ADR 逆参照なし |
| ADR-0004 | REQ-0004 | ADR→REQ 参照あり、REQ→ADR 逆参照なし |

---

### Skill↔load_skills 参照

#### step4a: load_skills 参照先の存在
**問題なし** — 14コマンドの load_skills 合計17種、全て SKILL.md が存在。

#### step4b: agentdev プレフィクス規約
**問題なし** — 全 load_skills エントリが `agentdev-` プレフィクスを持つ。

#### step4c: 未使用スキル（info — 修正不要）
以下3スキルは meta-tooling 用途であり、load_skills に含まれないのは正常。

| 未使用スキル | 用途 |
|-------------|------|
| `agentdev-command-creator` | コマンド開発用ツール |
| `agentdev-command-authoring` | コマンド作成規約リファレンス |
| `agentdev-skill-authoring` | スキル作成規約リファレンス |

---

### Command-map↔実体

#### step5a: README→file 存在
**問題なし** — README 記載の14コマンド全てに対応ファイルが存在。

#### step5b: file→README 存在
**問題なし** — 実在する14コマンドファイル全てが README に記載。

#### step5c: description 一致性（⚠️ warning 1件）

| コマンド | README description | frontmatter description | 差異 |
|---------|-------------------|------------------------|------|
| `case-update` | `Issue本文の更新やコメント追加` | `既存Caseの本文更新、コメント追加、またはREQファイル更新を行う` | READMEに「REQファイル更新」が欠落 |

---

### 旧 namespace 残存

#### step6a: 旧 public command namespace (`/issue/issue-*`)
**問題なし** — アクティブガイダンスに残存なし。全24件の検出は ADR/REQ 内の旧称・移行テーブル。

#### step6b: 旧 tips namespace (`/tips/tips-*`)
**問題なし** — アクティブガイダンスに残存なし。全8件の検出は ADR/REQ 内の旧称・移行テーブル。

#### step6c: 二重プレフィクス (`agentdev-agentdev-*`)
**問題なし** — 検出1件（REQ-0021 の検査仕様定義内パターン文字列のみ）。

#### step6d: 存在しない skill 名
**問題なし** — 全 `agentdev-*` 参照が実在する SKILL.md に対応。

#### step6e: load_skills 存在確認
**問題なし** — 全コマンドの load_skills が実在するスキルを参照。

#### step6f: Command inventory 整合性（⚠️ warning 1件）

| 比較対象 | 結果 |
|---------|------|
| Command README テーブル ↔ 実ファイル | ✅ OK (14/14) |
| Root README テーブル ↔ 実ファイル | ✅ OK (14/14) |
| system.md テーブル ↔ 実ファイル | ✅ OK (15/15) |

**⚠️ warning**: `.opencode/commands/agentdev/README.md` 詳細リンクセクションが 7/14 コマンドのみ。
- 欠落コマンド: `learning-refine`, `learning-promote`, `intake-capture`, `intake-from-github`, `intake-review`, `intake-promote`, `integrity-check`

#### step6g: 旧 bare command name 残存
**問題なし** — アクティブガイダンスに残存なし。全検出は REQ/ADR 内の履歴記述。

#### step6h: 旧 command path 残存
**問題なし** — `.opencode/commands/issue/` への参照6件は全て REQ 内の履歴記述。`.opencode/commands/tips/` への参照なし。

#### step6i: 旧 skill name 残存（⚠️ warning 1件）

**⚠️ warning**: 以下の旧スキル名がアクティブな ADR/REQ 内に残存。

| 旧スキル名 | 現行名 | 検出先 | 行 |
|-----------|--------|--------|------|
| `issue-work-orchestration` | `agentdev-workflow-orchestration` | ADR-0001 | L37 |
| `issue-work-orchestration` | `agentdev-workflow-orchestration` | ADR-0002 | L34 |
| `tips-pipeline-orchestration` | `agentdev-learning-pipeline` | ADR-0001 | L37 |
| `tips-pipeline-orchestration` | `agentdev-learning-pipeline` | ADR-0002 | L34 |
| `command-authoring-best-practices` | `agentdev-command-authoring` | ADR-0001 | L37 |
| `issue-lifecycle` | `agentdev-workflow-lifecycle` | REQ-0004 | L39 |
| `issue-lifecycle` | `agentdev-workflow-lifecycle` | REQ-0010 | L51, L57 |
| `issue-lifecycle` | `agentdev-workflow-lifecycle` | REQ-0015 | L32 |

**備考**: ADR の性質上「作成時の記録」として許容するか、現行名に更新するかはユーザー判断。

#### step6j: 旧 data path 残存（📋 未実装）
`docs/tips/` への参照が REQ 内に4件。全て REQ-0019 の意図的な canonical storage 指定（REQ-0019-032）。検出結果は info として報告。

#### step6k: 旧 terminology 残存（📋 未実装）
`tips` 語は REQ/ADR 内の履歴・移行定義に限定。コマンド・スキル・spec・README にアクティブな参照なし。

---

## Warning 一覧（確認推奨）

| # | カテゴリ | 内容 | 影響度 |
|---|---------|------|--------|
| W1 | Step 5c | `case-update` README description に「REQファイル更新」が欠落 | low |
| W2 | Step 6f | Command README 詳細リンクセクション 7/14 のみ | low |
| W3 | Step 6i | ADR-0001/0002 内に旧スキル名 5箇所 | low |
| W4 | Step 6i | REQ-0004/0010/0015 内に旧スキル名 `issue-lifecycle` 3箇所 | low |
