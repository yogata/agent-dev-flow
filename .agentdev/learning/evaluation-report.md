# 評価レポート

## メタデータ

- **実行日時**: 2026-07-18
- **対象エントリ数**: 9件（inbox: 9件、deferred: 既存 living pool あり）
- **問題クラス数**: 9（厳密な問題クラス基準「根本原因+再発条件+予防策が同じ」では全エントリが単独エントリのため、未分類9件を個別掲載）
- **テーマ関連**: QG/case-close 完了条件解釈（#2/#5/#8）、SPEC/command 境界ケース明文化（#3/#4/#6/#9）、ハーネス制約（#1, deferred L-004/L-010 と同根）、運用知見（#7）

## 問題クラス一覧

### 問題クラス1: ハーネス call_omo_agent 制約で case-run 実行担当サブエージェント委譲不可

- **根本原因**: ハーネス（oh-my-openagent）の call_omo_agent ツール schema が explore/librarian agent 型のみを許可し、agentdev-case-run-execution-adapter が定義する実行担当サブエージェント型（custom agent）を起動できない
- **再発条件**: call_omo_agent が explore/librarian のみを許可するハーネス環境で case-run を実行した場合に必ず発生
- **予防策**: (a) call_omo_agent schema で custom agents サポート、(b) adapter skill の委譲プロトコルにハーネス能力に応じたフォールバック定義、(c) case-run がハーネス能力を事前検出して委譲可否を判断し Inability を冒頭で明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred L-004/L-010 で実質3件（同根） |
| 影響度 | 3/5 | Epic Wave 並列委譲の速度優位性消失、インライン実行で完結 |
| 横展開性 | 4/5 | 同一ハーネス環境で動作する全 case-run で発生 |
| 反映先明確度 | 4/5 | agentdev-case-run-execution-adapter SKILL、workflow-orchestration、REQ-0149 |
| 自動化適性 | 3/5 | 事前 probe + フォールバック定義で自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | ハーネス制約知識として再利用価値高い |
| 再発可能性 | 5/5 | call_omo_agent が限定的な環境で必ず発生 |
| 費用対効果 | 4/5 | probe 実装で回避可能、効果高い |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-case-run-execution-adapter に call_omo_agent 制約時の挙動と Epic Wave 影響を追記）。新規 skill/command 化ではなく既存 adapter skill の補強。deferred.md の L-004/L-010 と統合して1つの採用済み成果物にまとめる候補

#### エントリ一覧

- inbox: case-run 実行担当サブエージェント委譲不可 (ハーネス call_omo_agent 制約)
- deferred（同根参照）: L-004 (PR #1068)、L-010 (PR #1103)

#### ADR候補除外記録

- **除外理由**: 運用ルール（フォールバック定義・事前検出手順）
- **根拠事実**: call_omo_agent schema 制約への対応はアーキテクチャ決定ではなく運用対応・adapter skill 拡張
- **代替反映先候補**: agentdev-case-run-execution-adapter SKILL（既存）

---

### 問題クラス2: QG-4 spec-bug acceptance で Issue 完了条件 vs Epic 対象外 の矛盾調整

- **根本原因**: Epic 完了条件のテスト戦略（TS-004「配布 command 6ファイル実行制御パラメータ直接記述 0件」）と Epic 対象外（配布 command/skill/docs の実装本体改修）が矛盾。REQ-0162-002 は要件として追加されたが src/opencode/ command 本文からの除去は未実施で、それを要求する TS-004 がスコープ外と衝突
- **再発条件**: Epic 完了条件のテスト戦略が達成不可能な実装を要求し、同時に Epic がその実装を対象外とする場合
- **予防策**: (a) case-open 時に Epic 完了条件のテスト戦略と対象外の整合性を自動検証、(b) QG-2 (Acceptance Criteria Coverage Gate) でテスト戦略の実現可能性を検証、(c) spec-bug 分類時の case-close QG-4 判断基準を SPEC 化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（#1516/TS-004） |
| 影響度 | 3/5 | Epic 完了判定に影響、case-close QG-4 で調整必要 |
| 横展開性 | 4/5 | 他 Epic でも同様の矛盾が発生し得る |
| 反映先明確度 | 4/5 | agentdev-quality-gates QG-2、agentdev-req-analysis、agentdev-workflow-templates |
| 自動化適性 | 3/5 | case-open での整合性自動検証が可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の QG 運用 |
| 再発可能性 | 4/5 | テスト戦略 vs 対象外の矛盾は今後も発生し得る |
| 費用対効果 | 4/5 | QG-2 強化で予防可能 |
| **加重合計** | **26/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-quality-gates QG-2 acceptance-criteria-coverage、agentdev-req-analysis テスト戦略実現可能性検証）。テーマ関連: #5、#8 と「QG/case-close 完了条件解釈」で束ね可能

#### エントリ一覧

- inbox: QG-4 spec-bug acceptance: Issue完了条件 vs Epic対象外 の調整判断 (#1516/TS-004)

#### ADR候補除外記録

- **除外理由**: 運用ルール・command 仕様（QG-2/QG-4 検証手順・完了条件解釈基準）
- **根拠事実**: テスト戦略と対象外の整合性検証は QG 運用・command 手順の拡充であり技術判断ではない
- **代替反映先候補**: agentdev-quality-gates QG-2 reference、agentdev-req-analysis、agentdev-workflow-templates（Epic 完了条件テンプレート）

---

### 問題クラス3: verification-only PR の squash merge と files_checked 空の正当ケース

- **根本原因**: verification-only case-run（実装差分なし、検証のみ）の成果物である空 PR の取り扱いが command SPEC に未明文化。GitHub は空 PR の squash merge を許容し空 commit を生成するが、case-close 側は files_checked 空 を正当理由で処理する手順（REQ Phase 3）を踏む必要がある
- **再発条件**: case-run が verification-only（実装差分なし）で PR を作成し、case-close が targeted docs guard を実行する場合
- **予防策**: (a) case-run SPEC に verification-only PR の取り扱い（空 commit 許容、case-close への引継ぎ）を明文化、(b) check_changed_docs.ts が files_checked 空時に verification-only フラグを考慮、(c) case-close Step 3-1 に verification-only PR の確認手順を明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（Epic #1515 Wave 2 PR #1527） |
| 影響度 | 3/5 | case-close の手順不明、QG-4 判定に影響 |
| 横展開性 | 3/5 | REQ/SPEC 受け入れ基準が既存 repo 状態で満たされる場合に発生し得る |
| 反映先明確度 | 4/5 | docs/specs/commands/case-run.md、case-close.md、REQ-0158 |
| 自動化適性 | 4/5 | case-close Step 3-1 への手順追加は容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の PR ワークフロー |
| 再発可能性 | 3/5 | verification-only case で発生 |
| 費用対効果 | 4/5 | SPEC 明文化で解決 |
| **加重合計** | **25/40** | |

- **推奨処分案**: spec 候補（docs/specs/commands/case-run.md に verification-only セクション、docs/specs/commands/case-close.md Step 3-1 に verification-only 確認手順）。false-clean 3層防御（REQ-0158）との相互作用も文書化

#### エントリ一覧

- inbox: verification-only PR の squash merge と files_checked 空の正当ケース (Epic #1515 Wave 2)

#### ADR候補除外記録

- **除外理由**: command 仕様（case-run/case-close SPEC の手順拡張）
- **根拠事実**: verification-only PR の取り扱いは command SPEC の境界ケース明文化であり技術判断ではない
- **代替反映先候補**: docs/specs/commands/case-run.md、docs/specs/commands/case-close.md、REQ-0158（false-clean 3層防御）

---

### 問題クラス4: check_changed_docs.ts --files 引数の区切り形式（comma vs space）

- **根本原因**: check_changed_docs.ts の --files パーサが space 区切り仕様（`while (i < args.length && !args[i].startsWith("--")) parsed.files.push(args[i])`）だが、case-close.md Step 3-1 の実行コマンド例は `--files <PR 変更ファイル一覧>` と抽象表記で区切り文字が未明示。comma 区切りは 1 file 扱いになり files_checked が空になり TARGET-EMPTY (strict severity) が発火
- **再発条件**: --files に comma 区切りで複数ファイルを渡す場合
- **予防策**: (a) check_changed_docs.ts ヘルプ/エラーメッセージで区切り形式を明示、(b) comma 区切りも併用受入（split on comma）、(c) case-close.md / SPEC 呼出例で space 区切りを明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（Epic #1515 Wave 2） |
| 影響度 | 2/5 | TARGET-EMPTY strict failure で一時停止するが即時回避可能 |
| 横展開性 | 4/5 | case-run、spec-save 等 --files を使用する全 workflow で発生し得る |
| 反映先明確度 | 4/5 | check_changed_docs.ts、targeted-docs-guard-implementation.md、case-close.md Step 3-1 |
| 自動化適性 | 4/5 | usage メッセージ改修、comma 受入は容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有のスクリプト |
| 再発可能性 | 4/5 | comma 区切りで渡すと必ず再発 |
| 費用対効果 | 5/5 | 簡単な修正（usage 明示 + comma 受入）で解決 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存 command/skill/spec へ反映（check_changed_docs.ts usage メッセージ、targeted-docs-guard-implementation.md 呼出例、case-close.md Step 3-1 実行コマンド）。comma 区切り受入（split on comma）の実装も推奨

#### エントリ一覧

- inbox: check_changed_docs.ts --files 引数解析 (comma 区切り vs space 区切り) (Epic #1515 Wave 2)

#### ADR候補除外記録

- **除外理由**: command 仕様（スクリプト usage/SPEC 呼出例の明示）
- **根拠事実**: CLI 引数の区切り形式明示は command 仕様の整備であり技術判断ではない
- **代替反映先候補**: check_changed_docs.ts、docs/specs/integrity/targeted-docs-guard-implementation.md、src/opencode/commands/agentdev/case-close.md

---

### 問題クラス5: 識別子中心評価（REQ-0146-011）での完了条件解釈: PR 範囲 vs 全体

- **根本原因**: case-close.md / QG-4 reference に「PR 対象範囲 vs 全体」の判定ルールが未明文。識別子中心評価（REQ-0146-011）は完了条件の「識別子」が PR で満たされているかを問うが、「0件」という実測値要求が主評価か補助値かの境界が曖昧
- **再発条件**: 完了条件が「違反0件」「全配布物適合」等の全体評価を含み、PR が一部ファイル修正で残対応が Findings 記録・後続PR計画されている場合
- **予防策**: (a) QG-4 reference に「PR 対象範囲 vs 全体」の判定マトリクスを明記、(b) case-open 時に完了条件の「スコープ」（本 Issue 対象範囲 vs 全体）を明示、(c) 識別子中心評価の運用実例集を QG-4 reference に蓄積

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件（#1532/TS-006）+ #1532 完了条件7で同様問題既発生 |
| 影響度 | 3/5 | case-close QG-4 判定に影響、横断評価を含む完了条件で毎回直面 |
| 横展開性 | 4/5 | 今後同様の「横断評価を含む完了条件」で発生 |
| 反映先明確度 | 4/5 | agentdev-quality-gates qg-4-final-acceptance.md、case-close.md、case-open.md |
| 自動化適性 | 3/5 | case-open で完了条件スコープ明示は可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の QG-4 運用 |
| 再発可能性 | 4/5 | 横断評価を含む完了条件の PR が一部修正の場合に発生 |
| 費用対効果 | 4/5 | QG-4 reference 整備で予防可能 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-quality-gates qg-4-final-acceptance.md に判定マトリクス・運用実例）。テーマ関連: #2、#8 と「QG/case-close 完了条件解釈」で束ねて1つの採用済み成果物にまとめる候補

#### エントリ一覧

- inbox: 識別子中心評価（REQ-0146-011）での完了条件解釈: PR 範囲 vs 全体 (#1532/TS-006)

#### ADR候補除外記録

- **除外理由**: 運用ルール・command 仕様（QG-4 判定基準・case-open 完了条件スコープ明示）
- **根拠事実**: PR 範囲 vs 全体の判定ルールは QG 運用・command 手順の拡充であり技術判断ではない
- **代替反映先候補**: agentdev-quality-gates qg-4-final-acceptance.md、case-close.md Step 2、case-open.md（完了条件スコープ明示）

---

### 問題クラス6: SPEC 重複許容基準（REQ-0147-001）の適用事例: project extensions boilerplate

- **根本原因**: SPEC 重複許容基準（REQ-0147-001）の適用事例が SPEC に未蓄積。今後同様の boilerplate 重複が発生した際に「許容か違反か」の判断基準が不明確。REQ-0119-034（同一契約再定義抑止）に形式的には違反するが、例外基準への該当性判断が必要
- **再発条件**: 複数 command で同一の手順・宣言・boilerplate が重複し、SPEC 例外基準（SKILL ↔ command 同一ルール等）への該当性を判断する必要がある場合
- **予防策**: (a) artifact-responsibilities.md SPEC に重複許容基準の適用事例を追記、(b) boilerplate 重複時に「公開契約宣言」と「詳細契約」の分離フローを標準化、(c) inspect-skills で boilerplate 重複を検出した際の判定マトリクスを用意

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（#1532 project extensions boilerplate 15 command） |
| 影響度 | 2/5 | SPEC 運用・inspect-skills 判断に影響、実害は小 |
| 横展開性 | 4/5 | 今後同様の boilerplate 重複で毎回直面 |
| 反映先明確度 | 4/5 | artifact-responsibilities.md、command-authoring-standards.md、agentdev-project-extensions |
| 自動化適性 | 3/5 | inspect-skills での判定マトリクス実装は可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の SPEC 運用 |
| 再発可能性 | 4/5 | 同一 boilerplate 重複で発生 |
| 費用対効果 | 4/5 | SPEC への事例追記で解決 |
| **加重合計** | **25/40** | |

- **推奨処分案**: spec 候補（artifact-responsibilities.md SPEC、command-authoring-standards.md に事例追記）。「公開契約宣言」と「詳細契約」の分離フロー標準化

#### エントリ一覧

- inbox: SPEC 重複許容基準（REQ-0147-001）の適用事例: project extensions boilerplate (#1532)

#### ADR候補除外記録

- **除外理由**: 仕様変更のみ（SPEC への適用事例追記）
- **根拠事実**: 重複許容基準の適用事例蓄積は SPEC 整備であり技術判断ではない
- **代替反映先候補**: docs/specs/responsibilities/artifact-responsibilities.md、docs/specs/responsibilities/command-authoring-standards.md、agentdev-project-extensions SKILL.md

---

### 問題クラス7: inspect 連鎖委任の正規 Issue/PR による追跡パターン

- **根本原因**: inspect-docs は検出と主題分割に専念し、具体的 skill 改修は個別 Issue で実施する責務分界。しかし「委任」と明示的に記録しないと連鎖が途切れる
- **再発条件**: inspect-docs が複数配布物にまたがる改善候補を検出し、各配布物ごとに個別 skill 改修 Issue を起票する場合
- **予防策**: (a) inspect-docs の Findings 形式に「委任先 Issue 番号」欄を明示、(b) case-open が inspect 由来 Issue に「委任元 Issue」リンクを自動付与、(c) inspect-promote が主題分割を自動提案

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（#1532 → #1533） |
| 影響度 | 2/5 | 連鎖委任の追跡、実害は小 |
| 横展開性 | 3/5 | inspect-docs で複数配布物改善候補検出時に発生 |
| 反映先明確度 | 3/5 | agentdev-intake-pipeline、agentdev-workflow-orchestration capture-boundaries.md |
| 自動化適性 | 3/5 | Findings 形式拡張、case-open での自動リンクは可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の inspect フロー |
| 再発可能性 | 3/5 | inspect-docs で主題独立な改善候補複数検出時に発生 |
| 費用対効果 | 3/5 | 運用徹底レベル、現状フローで完結 |
| **加重合計** | **21/40** | |

- **推奨処分案**: deferred（出現1件・ADR/REQ/spec影響なし・運用知見。現状の inspect-docs/inspect-skills/case-open/case-close フローで完結する運用知見。情報断片的）

#### エントリ一覧

- inbox: inspect 連鎖委任の正規 Issue/PR による追跡パターン (#1532 → #1533)

#### ADR候補除外記録

- **除外理由**: 該当なし（ADR/REQ/spec影響なし、運用知見）
- **根拠事実**: 既存の inspect-docs/inspect-skills/case-open/case-close フローで完結する運用知見であり、恒久契約への昇華不要
- **代替反映先候補**: なし（deferred で維持）

---

### 問題クラス8: Issue 完了条件の数値閾値到達不能問題

- **根本原因**: 完了条件の数値閾値（LF 数 200 以上等）を、対象成果物の自然な構造（テンプレート適用後）で到達可能な範囲を事前計測せずに設定。draft（要件定義書）と case-open 生成 Issue 本文（テンプレート要約、重複 TS マージ等）は構造が異なるため、draft の LF 数を基準にすると到達不能閾値になる
- **再発条件**: 完了条件に「N 個以上」「N 件以上」等の数値閾値を設定し、対象成果物の自然な構造で到達可能かを事前計測しない場合
- **予防策**: (a) case-open が完了条件の数値閾値を検証して到達不能場合は警告、(b) QG-2 で数値閾値の実現可能性を同種既存成果物の実測値で検証、(c) test strategy 策定時に基準値を同種の既存成果物から実測、(d) draft の絶対数を基準にする場合はテンプレート適用後の自然構造での数値も併記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件（#1538/TS-007）+ #1532 完了条件7で同様問題既発生 |
| 影響度 | 3/5 | 完了条件到達不能、PR 本文に WARN 記録必要 |
| 横展開性 | 4/5 | 完了条件に数値閾値を設定する全場面で発生し得る |
| 反映先明確度 | 4/5 | agentdev-quality-gates qg-2-acceptance-criteria-coverage、agentdev-req-analysis、case-open.md |
| 自動化適性 | 3/5 | case-open での閾値検証、QG-2 での実現可能性検証 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の test strategy 策定 |
| 再発可能性 | 4/5 | 数値閾値を設定する完了条件で発生 |
| 費用対効果 | 4/5 | QG-2 強化で予防可能 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-quality-gates QG-2 acceptance-criteria-coverage、agentdev-req-analysis test strategy 策定ガイド）。テーマ関連: #2、#5 と「QG/case-close 完了条件解釈」で束ね可能

#### エントリ一覧

- inbox: Issue 完了条件の数値閾値到達不能問題: draft LF 数を基準にした閾値が自然な本文構造で到達不能 (#1538/TS-007)

#### ADR候補除外記録

- **除外理由**: 運用ルール・command 仕様（QG-2 検証手順・test strategy 策定ガイド）
- **根拠事実**: 数値閾値の到達可能性検証は QG 運用・要件定義手順の拡充であり技術判断ではない
- **代替反映先候補**: agentdev-quality-gates qg-2-acceptance-criteria-coverage、agentdev-req-analysis（test strategy 策定ガイド）、case-open.md（完了条件の数値閾値検証）

---

### 問題クラス9: case-open subagent 委譲での手順逸脱（category=writing が文書監査的振る舞いを誘発）

- **根本原因**: (1) category=writing が「文書作業」を連想させ subagent が文書監査・校正的振る舞いを誘発（japanese-tech-writing 等の発火スキルとの相互作用）、(2) subagent プロンプトで禁止事項（MUST NOT DO）が明示されておらずスコープ境界が弱かった、(3) writing category が「書く」作業全般を意味するため case-open の事務的手続き作業と認識されなかった
- **再発条件**: (1) case-open 等の事務的手続き作業を category=writing で委譲した場合、(2) subagent プロンプトに MUST NOT DO が明示されていない場合、(3) category 名が subagent の「作業の意味」を誤誘導する場合
- **予防策**: (a) case-auto から subagent 委譲時の category 選定ガイドラインを SPEC 化（事務的手続きは unspecified-high を推奨、writing は執筆作業のみ）、(b) subagent プロンプトテンプレートに MUST NOT DO セクションを必須化、(c) writing category の発火スキル（japanese-tech-writing 等）を case-open 等、事務的手続き委譲時は無効化する仕組み、(d) category 別の subagent 振る舞い事例集を蓄積

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件（複数回試行で同一事象） |
| 影響度 | 3/5 | スコープ逸脱、リソース浪費 |
| 横展開性 | 4/5 | case-auto から subagent 委譲する全場面（case-open, case-run, case-update, case-close） |
| 反映先明確度 | 4/5 | case-auto.md、workflow-orchestration capture-boundaries.md、case-run-execution-adapter |
| 自動化適性 | 4/5 | subagent プロンプトテンプレート MUST NOT DO 必須化は容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の委譲プロトコル |
| 再発可能性 | 4/5 | case-open 等を category=writing で委譲、MUST NOT DO 未明示で再発 |
| 費用対効果 | 4/5 | category 選定ガイドライン + MUST NOT DO 必須化で予防 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command/skill へ反映（case-auto.md subagent 委譲ガイドライン・category 選定指針、workflow-orchestration capture-boundaries.md subagent プロトコル・MUST NOT DO 記載要件、case-run-execution-adapter category 設計）

#### エントリ一覧

- inbox: case-open subagent 委譲での手順逸脱: category=writing が文書監査的振る舞いを誘発、draft 作成へスコープ拡大 (#1538 case-auto 委譲)

#### ADR候補除外記録

- **除外理由**: command 仕様・運用ルール（case-auto subagent 委譲ガイドライン・MUST NOT DO 記載要件）
- **根拠事実**: category 選定基準・MUST NOT DO 必須化は command 手順・委譲プロトコルの拡充であり技術判断ではない
- **代替反映先候補**: case-auto.md、agentdev-workflow-orchestration capture-boundaries.md、agentdev-case-run-execution-adapter

---

## promote 時 prune 結果

- **対象エントリ数**: 9件（inbox 全エントリ）
- **prune 実施**: あり（Step 14 で実行予定）
- **prune 候補**: staged（採用済み成果物生成済み）/ rejected / duplicate のエントリ。今回は全エントリ staged or deferred のため、staged のみ prune 対象
- **prune 却下**: 0件

## 全体傾向

- **高頻出・高影響の問題クラス**: ハーネス制約で委譲不可（#1, 29/40）、case-open subagent 委譲手順逸脱（#9, 28/40）
- **横展開性が高い問題クラス**: 全エントリで横展開性スコア 3-5。特にハーネス制約（#1）、--files 区切り（#4）、識別子中心評価（#5）、SPEC 重複許容（#6）、数値閾値（#8）、subagent category（#9）は 4-5
- **自動化適性が高い問題クラス**: verification-only PR（#3, 4/5）、--files 区切り（#4, 4/5）、subagent category（#9, 4/5）
- **全体的な観察所見**:
  - 今回の9エントリは「AgentDevFlow 実運用（Epic #1515/#1532/#1538 等）で顕在化した境界ケース・運用知見」が中心
  - 厳密な問題クラス基準では全エントリが単独（未分類）だが、3つのテーマクラスタに束ね可能: (A) QG/case-close 完了条件解釈（#2/#5/#8）、(B) SPEC/command 境界ケース明文化（#3/#4/#6/#9）、(C) ハーネス制約（#1、deferred L-004/L-010 と同根）
  - 全エントリが ADR 候補除外（運用ルール・command 仕様・仕様変更のみ）。技術判断不在のため ADR 不要
  - inbox#7（inspect 連鎖委任）のみ ADR/REQ/spec影響なし・運用知見・スコア 21/40 で deferred 推奨。他8エントリは staged（採用済み成果物生成）推奨

## ADR候補除外記録（サマリ）

| # | エントリ | 除外理由 | 代替反映先候補 |
|---|---------|---------|---------------|
| 1 | call_omo_agent 制約 | 運用ルール | agentdev-case-run-execution-adapter SKILL（既存） |
| 2 | QG-4 spec-bug acceptance | 運用ルール・command 仕様 | agentdev-quality-gates QG-2、agentdev-req-analysis、workflow-templates |
| 3 | verification-only PR | command 仕様 | docs/specs/commands/case-run.md、case-close.md、REQ-0158 |
| 4 | --files 区切り | command 仕様 | check_changed_docs.ts、targeted-docs-guard-implementation.md、case-close.md |
| 5 | 識別子中心評価 | 運用ルール・command 仕様 | agentdev-quality-gates qg-4-final-acceptance.md、case-close.md、case-open.md |
| 6 | SPEC 重複許容 | 仕様変更のみ | artifact-responsibilities.md、command-authoring-standards.md |
| 7 | inspect 連鎖委任 | 該当なし（運用知見） | なし（deferred） |
| 8 | 数値閾値到達不能 | 運用ルール・command 仕様 | agentdev-quality-gates qg-2、agentdev-req-analysis、case-open.md |
| 9 | subagent category | command 仕様・運用ルール | case-auto.md、workflow-orchestration、case-run-execution-adapter |
