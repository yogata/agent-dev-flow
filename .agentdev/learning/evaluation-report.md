# 評価レポート

## メタデータ
- **実行日時**: 2026-06-22 00:00
- **対象エントリ数**: 18件（inbox: 18件, archive: 0件新規参照）
- **問題クラス数**: 5（未分類含む）

## 問題クラス一覧

### 問題クラス1: 機械的HOW除去残余violation検出とスキル恒久反映

- **根本原因**: 複数HOWカテゴリ（ファイルパス/CLIコマンド詳細/旧名称参照/スキル名直参照/プロンプト文字列/【廃止】履歴/APIシグネチャ）の機械的除去は単一パスで抜けが生じる
- **再発条件**: 複数カテゴリの機械的除去を単一パスで実施 + acceptance criteria が細粒度（REQ-NNNN-NNN単位）
- **予防策**: acceptance criteria順位検証の必須化 + カテゴリ別チェックリスト + 検出パターンのスキル恒久反映

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | N/A | duplicate判定のため評価対象外 |
| 影響度 | N/A | duplicate判定のため評価対象外 |
| 横展開性 | N/A | duplicate判定のため評価対象外 |
| 反映先明確度 | N/A | duplicate判定のため評価対象外 |
| 自動化適性 | N/A | duplicate判定のため評価対象外 |
| プロジェクト固有知識再利用性 | N/A | duplicate判定のため評価対象外 |
| 再発可能性 | N/A | duplicate判定のため評価対象外 |
| 費用対効果 | N/A | duplicate判定のため評価対象外 |
| **加重合計** | **N/A** | |

- **推奨処分案**: **duplicate** — 既存スキル（`agentdev-req-structure-diagnostics/references/req-structure-review.md` 行186-207 + `agentdev-req-file-manager/SKILL.md` 行240-272）で完全カバー。残余violation 6パターン、acceptance criteria順位検証手順、スキル恒久反映の仕組み（learning-capture経由のパターン拡充）全てが既存スキルに記述済み。

#### エントリ一覧
- 2026-06-21 PR #1009: 前工程実施済みの機械的除去でも acceptance criteria 順位検証が残余 violation を捕える [inbox]
- 2026-06-21 PR #1010: 機械的除去後の残余 violation パターンを再発防止ルールとしてスキルへ恒久反映 [inbox]

---

### 問題クラス2: 文書種別責務境界誤分類の横断波与と3層検出構造

- **根本原因**: 委譲契約設計段階で「adapter skill / command / subagent / harness」の4分類が不明示。単発バグ是正でも同型違反が他文書種別へ伝播。伝播先の検出には複数層（機械/意味/査読）の直交する検出観点が必要。
- **再発条件**: (1) 実行主体分類を初期要件で明示しない + (2) 単発バグ是正で同型違反の横断検出を実施しない + (3) 検出能力を単一層に限定
- **予防策**: (1) req-defineでの分類表必須テンプレート化 (2) 3層検出構造（機械/意味/査読）の責務分担SPEC化 (3) Wave分割パターン（基準正規化→実装系反映→横断適用）のテンプレート化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（PR #1022, PR #1025） |
| 影響度 | 4/5 | 7ファイル修正が必要、横断波与 |
| 横展開性 | 4/5 | 委譲契約・統合契約全般で発生し得る |
| 反映先明確度 | 4/5 | integrity-contracts.md/writing-style.md 等 |
| 自動化適性 | 3/5 | grep検出は自動化可能、分類表必須はフロー |
| プロジェクト固有知識再利用性 | 3/5 | 委譲契約モデルはAgentDevFlow固有、パターンは汎用 |
| 再発可能性 | 4/5 | 新規契約追加時に再発し得る |
| 費用対効果 | 4/5 | 3層構造は確立済み、SPEC化コスト低 |
| **加重合計** | **28/40** | |

- **推奨処分案**: **spec候補** — 実行主体分類の査読基準は既存（writing-style.md, execution-subject-classification.md）だが、3層検出構造の責務分担をSPECレベルで明文化 + req-defineでの分類表必須テンプレート化が未実施。`docs/specs/integrity-contracts.md` または `docs/specs/writing-style.md` への3層検出構造の責務分担明文化 + `docs/specs/workflows/delegation-contracts.md` または req-define 手順への分類表テンプレート埋め込みが望ましい。

#### エントリ一覧
- 2026-06-22 PR #1022: command/skill/harness 境界の誤分類が横断波与する現象と req-define/spec-save 段階の分類明示の有効性 [inbox]
- 2026-06-22 PR #1025: 3層検出構造（docs-check + inspect-skills + doc-writing）の横断適用が同型違反の残存を零化した事例 [inbox]

---

### 問題クラス3: case-auto/open/close工程間の状態管理・委譲契約設計

- **根本原因**: 複数工程パイプライン（req-save→spec-save→case-open→case-run→case-close）で、中間成果物のcommit/pushタイミング・委譲契約のMUST NOT DO範囲・squash merge後の分岐ハンドリングが不明確。機械的状態遷移（lifecycle状態更新・ファイル削除）と実質的編集が区別されていない。
- **再発条件**: (1) case-autoが中間成果物をmainにcommit+pushせずworktree作成 + (2) 委譲契約MUST NOT DOが状態遷移まで包括禁止 + (3) case-close Step 9がgit pull --ff-onlyのみでsquash merge分岐を想定しない
- **予防策**: (1) case-openの.agentdev/ commit即時push手順 (2) MUST NOT DO精密化（実質編集禁止・状態遷移は許容） (3) squash merge後のローカル先行commit検出→内容重複確認→reset手順

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（Epic #979 #982, PR #1012, PR #1014） |
| 影響度 | 4/5 | PRスコープ違反クローズ・SPEC昇格見送り・git分岐 |
| 横展開性 | 4/5 | 複数工程パイプライン全般 |
| 反映先明確度 | 4/5 | case-auto/open/close/git-worktree |
| 自動化適性 | 3/5 | 即時push手順化可能、分岐ハンドリング半自動 |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow固有工程パイプライン |
| 再発可能性 | 4/5 | case-auto実行時に潜在 |
| 費用対効果 | 4/5 | 手順追加コスト低、スコープ違反防止効果大 |
| **加重合計** | **30/40** | |

- **推奨処分案**: **既存command/skill反映** — 既存のForm Zero（即時ステージ・コミット）はdraft/RU削除について定義済みだが、(a) case-openの.agentdev/ commit即時push、(b) case-auto委譲契約MUST NOT DOの精密化（状態遷移許容）、(c) case-close Step 9のsquash merge分岐ハンドリング（reset手順）の3点が未整備。`case-open.md`, `case-auto.md`, `case-close.md`, `agentdev-git-worktree/references/git-common-procedures.md` への手順追加が必要。

#### エントリ一覧
- 2026-06-21 Epic #979 Wave1 #982: case-auto worktree作成タイミングと中間成果物commitタイミングの不整合 [inbox]
- 2026-06-22 PR #1012: case-auto 委譲契約 MUST NOT DO と case-close G22 SPEC 昇格責務の衝突 [inbox]
- 2026-06-22 PR #1014: case-open の未 push `.agentdev/` commit と squash merge による post-merge ローカル分岐 [inbox]

---

### 問題クラス4: docs-check設計判断のSPEC化不足

- **根本原因**: docs-checkの設計判断（対象ファイル拡張子設計・項目役割範囲・NG ルール間依存関係）がSPECに明示されておらず、checker拡張時に毎回手動で副作用を評価する必要がある
- **再発条件**: (1) 新たな検査カテゴリをdocs-checkに追加する要件発生 + (2) 既存NGルール（skill-category-gap等）との相互作用をSPEC化していない
- **予防策**: (1) docs-check項目役割範囲（バックエンド対象 vs skill定義対象）のSPEC明文化 (2) docs-check対象ファイル設計（.mdのみ・正当使用例外）のSPEC明文化 (3) NGルール間依存関係マップの整備

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（PR #1012, PR #1010） |
| 影響度 | 3/5 | checker拡張時の判断基準不明確 |
| 横展開性 | 3/5 | docs-check固有だが他checkerでも同パターン |
| 反映先明確度 | 4/5 | integrity-rule-catalog.md/repo-agentdev-integrity |
| 自動化適性 | 3/5 | NG依存関係マップ構築可能 |
| プロジェクト固有知識再利用性 | 3/5 | docs-check固有 |
| 再発可能性 | 3/5 | checker拡張時に再発 |
| 費用対効果 | 4/5 | SPEC明文化コスト低 |
| **加重合計** | **25/40** | |

- **推奨処分案**: **spec候補** — 検査カテゴリ自体は定義済み（repo-agentdev-integrity SKILL.md L52-76）だが、docs-check項目役割範囲（バックエンド vs skill定義）と対象ファイル設計（.mdのみ・正当使用例外）が未SPEC化。`docs/specs/integrity-rule-catalog.md` への設計判断明文化 + `repo-agentdev-integrity/SKILL.md` への新カテゴリ追加判定フロー追加が必要。

#### エントリ一覧
- 2026-06-22 PR #1012: docs-check バックエンドへの検査カテゴリ追加と skill-category-gap NG 汚染のトレードオフ [inbox]
- 2026-06-21 PR #1010: 配布物 ID 除外のテストフィクスチャ例外設計（docs-check 対象ファイル設計） [inbox]

---

### 未分類

#### A3: oh-my-openagent の Findings / Capture候補 セクション自動生成未対応
- **8軸加重合計**: 25/40
- **推奨処分案**: **既存skill反映** — `references/oh-my-openagent.md` の指示プロンプト雛形に `## Findings / Capture候補`（`### intake` / `### learning` 小見出し）テンプレート埋め込みが未実施。毎回case-run実行担当が事後補完している。
- **既存対策**: なし（oh-my-openagent.md にFindings/Capture候補セクションの記述なし）

#### B1: REQ 要件行の振る舞い単位記述と既存 REQ の遡及適用
- **8軸加重合計**: 23/40
- **推奨処分案**: **既存skill反映** — 「既存REQは現状維持・新規REQから適用」の運用ルールがAGENTS.md/REQ-0101等に文書化されていない。要件行記述内容（REQ-0102-006/007/023）は定義済みだが、新旧REQ適用タイミングの運用ルールは暗黙。
- **既存対策**: あり（部分的）。AGENTS.md L41に要件行記述内容は明記。新旧適用タイミングは未記述。

#### B2: ADR 採番ルールの SKILL↔command 重複と同期リスク
- **8軸加重合計**: 21/40
- **推奨処分案**: **既存skill反映** — SKILL↔command の同一ルール重複を許容するか・一方向参照にするかの判断基準が明示されていない。ADR採番ルール自体は `agentdev-adr-file-manager/SKILL.md` に詳細定義済み。
- **既存対策**: あり（部分的）。ADR採番ルールは定義済み。重複許容基準は未記述。

#### C1: SPEC catalog と実装の同期重要
- **8軸加重合計**: 24/40
- **推奨処分案**: **既存SPEC反映** — SPEC catalog↔実装の双方向同期運用（削除時baseline_status変更等）がSPEC化されていない。baseline_status フィールド（known/new/resolved）とIR-020は定義済み。
- **既存対策**: あり（部分的）。baseline_status定義とIR-020は既存。同期運用手順は未記述。

#### H1: 検証中心 Issue と実装中心 Issue の明示的区別が二重実施を防ぐ
- **8軸加重合計**: 27/40
- **推奨処分案**: **spec候補** — Epic Wave実行における「前工程完了度: 完全完了/検証のみ/補完あり」の3段階分類が未整備。epic-wave-model.md にIssue状態enum（pending/ready/running/completed/blocked/failed）は定義済みだが、検証中心vs実装中心の明示的区別は未記述。
- **既存対策**: あり（間接的）。Issue状態enumで実行状態は区別済み。検証/実装中心の区別は未記述。

---

### 除外エントリ（duplicate/rejected/deferred）

#### A1: PowerShell ヒアドキュメント選択のガードレール明文化候補
- **推奨処分案**: **duplicate** — `agentdev-gh-cli/SKILL.md` で `<<EOF` ヒアドキュメント禁止（L38-43）+ `[System.IO.File]::WriteAllText` 必須（L60-62）が既に定義済み。PowerShell展開ヒアドキュメントの問題は WriteAllText 使用により回避される。

#### A2: SKILL VERIFY 操作の有効性証左
- **推奨処分案**: **rejected** — 観察記録（SKILL手順化が有効だったという実証）。対策を必要とする問題ではなく、記録価値のみ。

#### C2: import.meta.main ガードパターン（bun）
- **推奨処分案**: **deferred** — 汎用的なbun/TypeScriptパターン。AgentDevFlowの枠組み（command/skill/SPEC）では扱いにくい。情報が断片的で出現回数も少ない。

#### D1: ハーネスタイムアウト事後処理の実証
- **推奨処分案**: **duplicate** — OU-013で事後処理手順（CLI引数事前検証・worktree git status確認・REQ/ADR/SPEC再確認）はSKILL化済み。本エントリはSKILL化された手順の自己適用実証記録。

## promote 時prune結果

- **対象エントリ数**: 18件（inbox から移動した新規エントリ）
- **prune実施**: あり
- **prune候補**: 17件（staged 12件 + duplicate 4件 + rejected 1件）— 証拠は各採用済み成果物の「元learning item / 根拠」セクションに保存済み
- **prune却下**: 0件
- **残存エントリ**: 既存6件（deferred/未処理）+ C2（deferred: import.meta.mainガードパターン）= 7件

## 全体傾向
- **高頻出・高影響の問題クラス**: 問題クラス3（case-auto/open/close工程間状態管理、30/40）が最高スコア。複数工程パイプラインの状態管理不備はPRスコープ違反・SPEC昇格見送り・git分岐等の重大な影響を招く。
- **横展開性が高い問題クラス**: 問題クラス2（文書種別境界、28/40）と問題クラス3（工程間状態管理、30/40）は共に横展開性4/5。委譲契約・統合契約・複数工程パイプライン全般で再発し得る。
- **自動化適性が高い問題クラス**: 全クラスで自動化適性3/5。完全自動化は困難だが、手順化・チェックリスト化により再発防止可能。
- **全体的な観察所見**: PR #974〜#1025（2026-06-21〜22）の集中的な学び蓄積。文書体系再構築Epic（#990）完了後の横断検査・是正フェーズで得た知見が中心。既存スキル（req-structure-diagnostics, req-file-manager）へのHOW除去検出ルールの恒久反映が完了しており、学びのサイクル（capture→promote→skill反映）が機能している証左。

## ADR候補除外記録

全promote候補に対して `agentdev-adr-guidelines` の除外基準を適用:

| 対象item | 除外理由 | 根拠事実 | 代替反映先候補 |
|----------|---------|---------|--------------|
| 問題クラス2（3層検出構造） | 運用ルール | 既存の実行主体分類・検出構造の運用責務分担の文書化であり、技術選定・設計判断を含まない | SPEC（integrity-contracts.md/writing-style.md） |
| 問題クラス3（工程間状態管理） | command仕様・運用ルール | case-auto/open/closeのコマンド手順・ガードレールの追加・精密化であり、アーキテクチャ決定を含まない | command（case-auto/open/close.md）, skill（git-worktree） |
| 問題クラス4（docs-check設計） | 運用ルール | docs-checkの設計判断の文書化であり、技術選定を含まない | SPEC（integrity-rule-catalog.md）, skill（repo-agentdev-integrity） |
| A3（Findings template） | command仕様 | oh-my-openagent指示プロンプトのテンプレート追加 | skill（case-run-execution-adapter） |
| B1（REQ適用運用ルール） | 運用ルール | 新旧REQ適用タイミングの運用ルール文書化 | AGENTS.md, skill（req-file-manager） |
| B2（SKILL↔command重複許容） | 運用ルール | SKILL↔command重複の許容基準の文書化 | SPEC/SKILL（doc-writing, artifact-responsibilities） |
| C1（catalog同期運用） | 運用ルール | SPEC catalog↔実装の同期運用手順の文書化 | SPEC（integrity-rule-catalog.md） |
| H1（検証中心Issue区別） | 仕様変更のみ・運用ルール | Epic Wave実行のIssue分類属性の追加・case-openプロンプト指示 | SPEC（epic-wave-model.md）, command（case-open.md） |
