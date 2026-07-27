# 評価レポート

## メタデータ
- **実行日時**: 2026-07-27 (タイムゾーン: Etc/GMT-9)
- **対象エントリ数**: 5件（inbox: 5件、deferred: 既存多数は参照せず）
- **問題クラス数**: 5（全て未分類クラスタ。inbox 5エントリは根本原因・再発条件・予防策が相互に異なり、同一問題クラスにグループ化不可）
- **inbox フォーマット**: 全エントリ新13項目フォーマット準拠。正規化不要

## 問題クラス一覧

### 問題クラス1: PowerShell regex MatchEvaluator 内 -replace 演算子で全件置換されない

- **根本原因**: PowerShell の `[regex]::Replace` の MatchEvaluator（ScriptBlock）内で `-replace` 演算子を使用した際、.NET Regex.Replace と PowerShell -replace の相互作用により全件置換が期待通り動作しない（正確なメカニズムは未特定だが、ScriptBlock スコープ、-replace の置換文字列解釈、MatchEvaluator 呼び出し回数のいずれかが関与）
- **再発条件**: PowerShell で gh CLI から取得した本文を `[regex]::Replace` + ScriptBlock 内 `-replace` で処理し、セクション内の複数件を置換しようとする際
- **予防策**: 本文置換に Node.js（`String.split/join`）または PowerShell の `String.Replace`（.NET メソッド、regex 非使用）を使用し、MatchEvaluator 内 `-replace` を避ける

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件、deferred に類似なし |
| 影響度 | 3/5 | 中。完了条件チェックボックス 7個中1個しか置換されず、VERIFY で検知したが手戻り発生 |
| 横展開性 | 4/5 | 高い。Windows PowerShell 環境全般。gh-cli に限らず PowerShell regex 利用全般で発生 |
| 反映先明確度 | 5/5 | 特定済み。`agentdev-gh-cli` references/standard-procedures.md（本文置換手続き） |
| 自動化適性 | 4/5 | 容易。standard-procedures.md の手続きで MatchEvaluator 内 -replace 使用を禁止し、Node.js/String.Replace を推奨すれば予防可能 |
| プロジェクト固有知識再利用性 | 4/5 | 高い。AgentDevFlow 全体で PowerShell + gh-cli を使う場面で有効 |
| 再発可能性 | 3/5 | 中程度。PowerShell regex を使い続ける限り発生し得る |
| 費用対効果 | 4/5 | 良い。standard-procedures.md への注意喚起追記で済む |
| **加重合計** | **28/40** | |

- **推奨処分案**: **staged**（既存 skill へ反映）。`agentdev-gh-cli` references/standard-procedures.md へ MatchEvaluator 内 -replace 演算子の使用注意と回避策（Node.js / String.Replace）を追記

#### エントリ一覧
- 2026-07-27: PowerShell regex MatchEvaluator 内の -replace 演算子で全件置換されず Node.js で回避した事象 [inbox]

---

### 問題クラス2: case-close QG-4 で pass_criteria 文言違いを意味的等価として承認（REQ-0129-012）

- **根本原因**: 複数 REQ への共通 pass_criteria を起票する場合、各 REQ の pipeline stage の違い（promote 系 vs review 系等）を吸収せず文字列一致を要求する表現を起票。REQ-0129-012 は backlog-review 専用で pipeline stage が異なるため、REQ-0127-023/0128-010 と共通化された pass_criteria 期待文字列と content 表現が食い違う
- **再発条件**: 複数 REQ で共通の観測可能振る舞いを追加する Issue の test_strategy で、pass_criteria を共通化して文字列一致を要求した場合
- **予防策**: case-open 時の test strategy 起票で、複数 REQ の共通 pass_criteria を避け REQ ごとの個別期待値を記述する、または pass_criteria に「意味的等価を許容」旨を明記する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 小。QG-4 評価で意味的等価性確認の上 F-001「意味的等価・承認」として処理。実害限定的 |
| 横展開性 | 3/5 | 中程度。複数 REQ への共通 pass_criteria を書く全ケース |
| 反映先明確度 | 4/5 | 明確。`agentdev-workflow-templates`（issue_desc_*.md テンプレートの test strategy 記述ガイド）、`agentdev-req-analysis`（pass_criteria 記述基準） |
| 自動化適性 | 3/5 | 可能。テンプレートガイドへの追記で予防 |
| プロジェクト固有知識再利用性 | 3/5 | 中程度。AgentDevFlow 固有の pipeline stage 別表現問題 |
| 再発可能性 | 3/5 | 中程度。共通化の誘因は常在 |
| 費用対効果 | 4/5 | 良い。ガイド追記で済む |
| **加重合計** | **23/40** | |

- **推奨処分案**: **staged**（既存 skill へ反映）。`agentdev-workflow-templates` と `agentdev-req-analysis` へ pass_criteria 記述ガイド（共通化回避、意味的等価許容）を追記

#### エントリ一覧
- 2026-07-27: case-close QG-4 で pass_criteria 文言違いを意味的等価として承認した事象（REQ-0129-012） [inbox]

---

### 問題クラス3: pass_criteria の「存在しないこと」が「変更されていないこと」を意図した誤表現（REQ-0147-010）

- **根本原因**: test strategy 起票時に「変更対象外 REQ の変更がないこと」を「存在しないこと」と誤表現。検証の意図（diff がないこと）と検証の表現（存在確認）がずれた
- **再発条件**: 変更対象外 REQ を pass_criteria で検証する際、「存在しないこと」と誤って記述した場合
- **予防策**: case-open 時の test strategy 起票で、変更対象外 REQ の検証は「diff がないこと」「変更されていないこと」で表現する。存在確認は新規作成禁止（「REQ-0164 が存在しないこと」等）の場合のみ使用する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 小。REQ-0147-010 は変更されていないことが正しい状態。F-002 として記録処理 |
| 横展開性 | 3/5 | 中程度。変更対象外 REQ の検証全般 |
| 反映先明確度 | 4/5 | 明確。`agentdev-workflow-templates`（issue_desc_*.md テンプレートの test strategy 記述ガイド）、`agentdev-req-analysis`（pass_criteria 記述基準） |
| 自動化適性 | 3/5 | 可能。ガイド追記で予防 |
| プロジェクト固有知識再利用性 | 3/5 | 中程度。test strategy 記述の汎用ガイドライン |
| 再発可能性 | 3/5 | 中程度。表現ミスの誘因は常在 |
| 費用対効果 | 4/5 | 良い。ガイド追記で済む |
| **加重合計** | **23/40** | |

- **推奨処分案**: **staged**（既存 skill へ反映）。`agentdev-workflow-templates` と `agentdev-req-analysis` へ pass_criteria 表現ガイド（存在確認 vs diff 確認の使い分け）を追記

#### エントリ一覧
- 2026-07-27: pass_criteria の「存在しないこと」が「変更されていないこと」を意図した誤表現（REQ-0147-010） [inbox]

---

### 問題クラス4: gh-cli 一時ファイル lifecycle（$env:TEMP 並列非安全 + cleanup 非一体化）

- **根本原因**: (1) standard-procedures.md で `$env:TEMP/agentdev/` を指定するが、Windows で `$env:TEMP` が `C:\WINDOWS\TEMP`（システム共有）へ解決し並列タスクが cp932 で同名ファイルを上書きする問題、(2) cleanup が I/O 手続きと一体化しておらず後段注記のみで省略可能
- **再発条件**: 並列 case-open/case-close 実行時、または `$env:TEMP` が共有領域へ解決される環境での gh WRITE 操作
- **予防策**: (1) 配置場所を `.agentdev/tmp/`（workspace-local）へ変更、(2) create → gh実行 → VERIFY → cleanup を1手順ユニットとし cleanup を省略不可ステップにする

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（case-auto run で23件の残存ファイル） |
| 影響度 | 3/5 | 中。23件の不要ファイル残存。並列実行時の暫定配置逸脱発生 |
| 横展開性 | 4/5 | 高い。全 gh WRITE 操作。Windows で特に顕著。非 Windows でも cleanup 漏れは発生し得る |
| 反映先明確度 | 5/5 | 特定済み。`agentdev-gh-cli` references/standard-procedures.md（L45, L62-64, L83, L96, L111 周辺） |
| 自動化適性 | 4/5 | 容易。cleanup を省略不可ステップに組み込める |
| プロジェクト固有知識再利用性 | 4/5 | 高い。AgentDevFlow 全体で gh WRITE 操作を行う場面で有効 |
| 再発可能性 | 4/5 | 高い。並列実行時や Windows 環境で常在 |
| 費用対効果 | 4/5 | 良い。手続き追記で済む |
| **加重合計** | **29/40** | |

- **推奨処分案**: **staged**（既存 skill へ反映）。`agentdev-gh-cli` references/standard-procedures.md へ `.agentdev/tmp/` 配置と cleanup 省略不可化を追記

#### エントリ一覧
- 2026-07-27: gh-cli 一時ファイル lifecycle（$env:TEMP 並列非安全 + cleanup 非一体化） [inbox]

---

### 問題クラス5: gh CLI --title 引数の Windows cp932 化けと REST API PATCH 回避策

- **根本原因**: gh CLI の `--title` / inline `--input` 引数パーサーが Windows ACP（cp932）で文字列を decode する仕様。PowerShell 側の Console encoding 設定（Step 0 の3行初期化）では gh CLI 内部の引数 decode に影響しない
- **再発条件**: Windows 環境で gh CLI の `--title` / inline `--input` 引数へ日本語を渡す全操作
- **予防策**: (1) Windows 環境では `--title` / inline `--input` を使用せず、`--body-file` または `gh api --input <utf8-file>` を使用、(2) title 修正が必要な場合は REST API PATCH（`gh api -X PATCH /repos/{owner}/{repo}/issues/{N}` へ UTF-8 JSON body を `--input` file 経由で送信）を標準手続き化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | Draft 6 Epic #1845 mojibake 事象 1件（Draft 7-8 で標準運用化済み） |
| 影響度 | 3/5 | 中。Issue/PR タイトルの mojibake。GitHub 上の表示が日本語読解不能になる |
| 横展開性 | 4/5 | 高い。全 gh WRITE 操作で `--title` / inline `--input` を使用する手続き。Windows 環境全般 |
| 反映先明確度 | 5/5 | 特定済み。`agentdev-gh-cli` references/standard-procedures.md Section 2, Section 4 の各操作手続き |
| 自動化適性 | 4/5 | 容易。`--body-file` や REST API PATCH を使う手続きを標準化すれば予防可能 |
| プロジェクト固有知識再利用性 | 4/5 | 高い。Windows 環境での gh CLI 運用知見 |
| 再発可能性 | 4/5 | 高い。Windows 環境で継続的に発生し得る |
| 費用対効果 | 4/5 | 良い。手続き追記で済む |
| **加重合計** | **29/40** | |

- **推奨処分案**: **staged**（既存 skill へ反映）。`agentdev-gh-cli` references/standard-procedures.md Section 2, 4 へ `--title` / inline `--input` 使用制限と REST API PATCH 標準手続き化を追記

#### エントリ一覧
- 2026-07-27: gh CLI --title 引数の Windows cp932 化けと REST API PATCH 回避策 [inbox]

---

## 全体傾向

- **高頻出・高影響の問題クラス**: 5件中3件（問題クラス1, 4, 5）が Windows 環境での gh-cli / PowerShell 取り扱いに関する知見。AgentDevFlow を Windows 環境で運用する場合の固有の落とし穴が集中。全て `agentdev-gh-cli` references/standard-procedures.md への反映対象
- **横展開性が高い問題クラス**: 問題クラス1, 4, 5（4/5）。Windows 環境全般、gh WRITE 操作全般で発生し得る
- **自動化適性が高い問題クラス**: 全5件とも標準的な手続き書類（references, templates, SKILL.md）への追記で予防可能
- **全体的な観察所見**: 5件中3件が `agentdev-gh-cli` references/standard-procedures.md への反映対象。Windows 環境運用に関する手続き強化が直近で必要。残り2件（問題クラス2, 3）は test strategy の pass_criteria 記述品質ガイドの拡充で対応可能。Epic #1758 Wave 2（PR #1762, #1763）の case-close から回収された知見群で、実装・レビュー局面の Windows 環境固有問題と test strategy 記述品質問題に大別される

## ADR候補除外記録

全5問題クラスについて `agentdev-adr-guidelines` の除外基準を適用:

### 問題クラス1（PowerShell regex MatchEvaluator 内 -replace）
- **除外理由**: 運用ルール（standard-procedures.md の手続き追記）。技術的トレードオフを含まない
- **根拠事実**: 予防策が「MatchEvaluator 内 -replace 使用禁止」「Node.js / String.Replace 推奨」のいずれも、既存 references の手続き追記であり、新技術導入や設計判断ではない
- **代替反映先候補**: skill（`agentdev-gh-cli` references/standard-procedures.md）

### 問題クラス2（pass_criteria 共通化による文字列一致要求）
- **除外理由**: 運用ルール（test strategy 記述ガイド）。技術的トレードオフを含まない
- **根拠事実**: 予防策が「REQ ごとの個別期待値記述」「意味的等価許容の明記」のいずれも、作業手順・運用制約の定義であり、技術判断ではない
- **代替反映先候補**: skill（`agentdev-workflow-templates` issue_desc_*.md テンプレート、`agentdev-req-analysis` pass_criteria 記述基準）

### 問題クラス3（pass_criteria「存在しないこと」誤表現）
- **除外理由**: 運用ルール（test strategy 記述ガイド）。技術的トレードオフを含まない
- **根拠事実**: 予防策が「変更対象外 REQ 検証は diff がないことで表現」「存在確認は新規作成禁止の場合のみ使用」のいずれも、作業手順・運用制約の定義であり、技術判断ではない
- **代替反映先候補**: skill（`agentdev-workflow-templates` issue_desc_*.md テンプレート、`agentdev-req-analysis` pass_criteria 記述基準）

### 問題クラス4（gh-cli 一時ファイル lifecycle）
- **除外理由**: 運用ルール（standard-procedures.md の手続き追記）。技術的トレードオフを含まない
- **根拠事実**: 予防策が「配置場所を .agentdev/tmp/ へ変更」「cleanup 省略不可ステップ化」のいずれも、既存 references の手続き追記であり、新技術導入や設計判断ではない
- **代替反映先候補**: skill（`agentdev-gh-cli` references/standard-procedures.md）

### 問題クラス5（gh CLI --title cp932 化け）
- **除外理由**: 運用ルール（standard-procedures.md の手続き追記）。技術的トレードオフを含まない
- **根拠事実**: 予防策が「--title / inline --input 使用制限」「REST API PATCH 標準手続き化」のいずれも、既存 references の手続き追記であり、新技術導入や設計判断ではない
- **代替反映先候補**: skill（`agentdev-gh-cli` references/standard-procedures.md）

## promote 時prune結果

- **対象エントリ数**: 5件（全件 staged 判定のため、Step 14 で prune 対象）
- **prune実施**: あり（Step 13 で deferred.md へ移動後、Step 14 で staged 5件を除外。採用済み成果物の「元learning item / 根拠」セクションに証拠保存済み）
- **prune候補**: 5件
- **prune却下**: 0件

## 既存対策照合サマリ

must_not「実装本文（src/opencode/**）は読まない」に従い、既存対策確認は `docs/specs/skills/` 配下の SPEC のみで実施（`agentdev-gh-cli.md`、`agentdev-workflow-templates.md`、`agentdev-req-analysis.md`）。learning item 自身の記述と SPEC の突き合わせで判定。

| 問題クラス | 既存対策確認結果 | 該当ファイル | ギャップ分類 | ギャップ詳細 |
|---|---|---|---|---|
| 1（MatchEvaluator 内 -replace） | 既存対策なし | `docs/specs/skills/agentdev-gh-cli.md`、同 references/standard-procedures.md | fix gap | MatchEvaluator 内 -replace 演算子で全件置換されない問題と回避策（Node.js / String.Replace）が未記載。既存の PowerShell regex backreference `$N` 対策（L31-37 相当）は別問題 |
| 2（pass_criteria 共通化） | 既存対策なし | `docs/specs/skills/agentdev-workflow-templates.md`、`docs/specs/skills/agentdev-req-analysis.md` | fix gap | 複数 REQ 共通 pass_criteria の文字列一致要求に対するガイド未記載。req-analysis SPEC はチェックボックス品質基準（測定可能、一意、実装可能）のみ規定で、共通化・意味的等価は未規定 |
| 3（pass_criteria 誤表現） | 既存対策なし | `docs/specs/skills/agentdev-workflow-templates.md`、`docs/specs/skills/agentdev-req-analysis.md` | fix gap | 変更対象外 REQ 検証の表現（「存在しないこと」vs「変更されていないこと（diff がないこと）」）に対するガイド未記載 |
| 4（gh-cli 一時ファイル lifecycle） | 既存対策一部あり（不完全） | `docs/specs/skills/agentdev-gh-cli.md` L65（references 参照）、同 references/standard-procedures.md | fix gap + guardrail insufficiency | `$env:TEMP/agentdev/` 配置と cleanup は既規定。ただしユーザー確定事項「`.agentdev/tmp/` 配置」が未反映。cleanup が後段注記のみで省略可能 |
| 5（gh CLI --title cp932） | 既存対策一部あり（不完全） | `docs/specs/skills/agentdev-gh-cli.md` L79-106（WRITE 手続きの Windows encoding 初期化必須化、REQ-011-009）、同 references/standard-procedures.md | fix gap | Step 0 コンソールエンコーディング初期化は規定済みだが、Step 0 では --title cp932 化けが解消しない境界ケースが未記載。`--body-file` / REST API PATCH 標準手続き化も未記載 |

## 判定結果サマリ（Step 9 提示用）

| 問題クラス | 加重合計 | 推奨処分案 | 主な理由 |
|---|---|---|---|
| 1（MatchEvaluator 内 -replace） | 28/40 | **staged**（既存 skill 反映: `agentdev-gh-cli` standard-procedures.md） | 高スコア、Windows 環境で汎用、反映先特定済み |
| 2（pass_criteria 共通化） | 23/40 | **staged**（既存 skill 反映: `agentdev-workflow-templates` + `agentdev-req-analysis`） | 中スコアだが具体的、test strategy 品質向上で汎用 |
| 3（pass_criteria 誤表現） | 23/40 | **staged**（既存 skill 反映: `agentdev-workflow-templates` + `agentdev-req-analysis`） | 中スコアだが具体的、test strategy 品質向上で汎用 |
| 4（gh-cli 一時ファイル lifecycle） | 29/40 | **staged**（既存 skill 反映: `agentdev-gh-cli` standard-procedures.md） | 高スコア、並列実行時の cp932 衝突回避と cleanup 必須化で確実な予防 |
| 5（gh CLI --title cp932） | 29/40 | **staged**（既存 skill 反映: `agentdev-gh-cli` standard-procedures.md） | 高スコア、Windows 環境で継続再発、REST API PATCH 標準化で予防 |

## 後続ルート

全5件の採用済み成果物は `.agentdev/learning/promoted/` へ生成後、`/agentdev/backlog-review` が読み込み、RU 化を経て `/agentdev/req-define` に合流する。`.opencode/` 直接反映、`case-run` への直接受け渡しは行わない。
