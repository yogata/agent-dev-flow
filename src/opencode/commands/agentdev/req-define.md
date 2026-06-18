---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: sisyphus
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義する。壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て read-only（G04）
- req-save SPLIT 検出時の finding（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の finding（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。read-only input として扱い、未確認事項・採否未確定事項を要件本文に混入させない（inspect lifecycle、REQ-0103-140-151 相当）
- **promoted 直読み禁止**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は直接読み込まない。backlog-review による RU 化を経由すること

## Output

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通）

## Steps

0. **セッションコンテキスト検知**（引数なし単体実行時のみ）: 当該セッション履歴・現在コンテキストを最優先の Requirement Source 候補として評価する（REQ-0102-058）。`agentdev-req-analysis` に従い、セッション履歴から6項目（要件内容・work_type・scale・ADR・構造化・適用範囲）を推論し、信頼度付きで表示。推論結果に応じて以下のルーティングを行う:
   - Confirmed のみで要件doc自足可能 → 当該セッション履歴・現在コンテキストを入力として処理を継続（Step 2 以降へ。RU 自動検出に進まない）
   - 部分的に不足し補足質問で解消可能 → RU 自動検出に進まず壁打ち対話を継続（Step 2 へ）（REQ-0102-060）
   - 有効な Requirement Source を構成できない → Step 1（RU 自動検出）へ進む（REQ-0102-059）
   引数ありの場合は Step 1 から開始

1. **明示入力ファイルの読み込み**（指定時）: Read tool で読み込み、壁打ちの初期コンテキストとして扱う。複数ファイル指定時は全て読み込む。引数なしの場合で、かつ Step 0 でセッション履歴・現在コンテキストから有効な Requirement Source を構成できなかった場合のみ、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し1件なら自動検出。0件なら Step 2 へ。2件以上なら候補一覧を表示し自動選択しない（REQ-0102-061）。セッション履歴・現在コンテキストおよび RU のいずれからも有効な入力を構成できない場合、壁打ち対話を開始する（REQ-0102-062）

2. **壁打ち対話** → `agentdev-req-analysis` に従って深掘り。明示入力ファイルがある場合、その内容を開始点として活用

   **2-1. upstream handoff 判定**: 入力が AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script の不具合または改善点を対象とする場合、`agentdev-workflow-lifecycle` に従い upstream handoff 用 RU 入力として整理する。現在プロジェクトの通常要件docとして定義せず、出力に `agentdev_handoff: true` を含める

3. **既存REQ照合** → `agentdev-req-file-manager` の照合方法論に従って実行。CREATE 前に APPEND/UPDATE 候補を必ず評価すること。要件の分割が必要な場合は保存操作ではなく requirements review 候補として扱うこと。操作分類結果は `draft-meta` に記録

   **3-1. 定量的データ検証**: `glob docs/requirements/REQ-*.md`（および副次的に `glob docs/adr/ADR-*.md`）で実ファイルを列挙し、AGENTS.md 等の文書記載レンジ（例: "REQ-0101〜REQ-0133"）と照合すること。乖離を発見した場合は文書修正または実ファイル確認により解消すること（REQ-0102-002）。詳細手順は `agentdev-req-analysis` を参照

   **3-2. SPLIT 予兆計測（既存REQ）**: APPEND/UPDATE 対象の既存 REQ が特定された場合、当該 REQ の健全性メトリクス（要件行数・関心分類数・artifact 種別数）を計測し、`docs/specs/req-health-metrics.md` の定量閾値に基づき SPLIT シグナルを算出して `draft-meta.split-forecast` に記録すること（REQ-0136-011）。計測対象は当該 REQ の要件テーブル行（`^| REQ-NNNN-MMM |`）とする。SPLIT シグナル合計が 2 以上の場合、APPEND 実施前にユーザーへ SPLIT 要否を提案すること。閾値・計算式の詳細は `agentdev-req-analysis` を参照

4. **要件展開** → `agentdev-req-analysis` の分析観点に従って網羅。詳細ゲートは `agentdev-req-analysis` を参照
   - **4-1. 変更影響候補抽出**: 変更影響候補を抽出し、ドラフトに保持する。委譲接続点: サブエージェントは探索結果・分類候補・根拠のみを返し、親エージェントがドラフト反映を判断する
   - **4-2. 分類ゲート**: 各要件行候補を「変更後仕様」or「反映作業」に分類する。併せて REQ/SPEC 境界判定（REQ-0101-067〜069）を行い、SPEC 等に配置すべき要件行候補を SPEC 候補として分離し、`draft-meta.spec-candidates`（想定配置先 SPEC・分離根拠・元候補）に記録すること（REQ-0136-010）。委譲接続点: サブエージェントは分類候補・SPEC 候補と根拠のみを返し、親エージェントが要件doc混入可否を判断する
   - **4-3. 文書分類妥当性検証**: 各要件の対象ドキュメント種別を検証する。REQ 要件行として残った行に SPEC 分離基準（REQ-0101-068）違反の残留がないか検出し、検出時は当該行を SPEC 候補へ移送して `draft-meta.spec-candidates` に追加すること（安定契約例外 REQ-0101-069 は検出対象外）。委譲接続点: サブエージェントは不適合候補・SPEC 残留候補と根拠のみを返し、親エージェントがflag記録を判断する

5. **ADR判断** → `agentdev-adr-guidelines`（manual reference）に従ってADR判断を記録（ADRファイル作成は req-save で実行）

   **5-0. 既存ADR重複確認**: ADR候補を提示する前に、`docs/adr/README.md` の accepted ADR一覧と意味的重複を確認する。重複時は新規ADR作成ではなく既存ADRのUPDATEを推奨する（REQ-0101-051）。委譲接続点: サブエージェントは重複候補と根拠のみを返し、親エージェントがCREATE vs UPDATEを判断する

   **5-1. ADR禁止ゲート**: ADR候補を提示する前に、REQ/SPEC相当判定を行う。詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは除外候補と根拠のみを返し、親エージェントがADR候補提示可否を判断する

   **5-2. ADR判断根拠の記録**: ADR判断後、判断根拠をドラフトに保存する。詳細は `agentdev-req-analysis` を参照。委譲接続点: 親エージェントのみがドラフトへ記録する

   **5-3. 作業手段ADR拒否ゲート**: ADR候補が削除・廃止・移行・統合・再構築・完全削除そのものを主題にしている場合、ADR候補から除外する（REQ-0101-044）。過去判断の除去は新規ADRではなくretire/supersedeで処理する（REQ-0101-045）。委譲接続点: サブエージェントは除外候補と根拠のみを返し、親エージェントがADR候補提示可否を判断する

6. **要件doc生成** → テンプレート: `.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md` を Read → 目的/要件/適用範囲の【必須】構造に従って生成。【必須】セクションの欠落禁止。Step 4-2/4-3 で分離した SPEC 候補がある場合、テンプレートの補助セクション `## SPEC候補` を生成し、`draft-meta.spec-candidates` の内容（SC-ID・想定配置先SPEC・分離根拠・元候補）を人間可読な一覧として記載すること（REQ-0136-009, 010）。SPEC 候補がない場合は同セクションを省略する
   - **6-0. 定義完全性ゲート（QG-1）**: 要件doc生成後、`agentdev-quality-gates` の QG-1（Definition Integrity Gate）に従い、REQ/SPEC 分類・ADR ゲート・チェックボックス測可能性・必須セクション完全性・SPEC 候補分離の妥当性を検証する。判定基準・検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md` を参照。fail 時は壁打ち（Step 2）へ差し戻し
   - **6-1. operation_units セクション生成**: 複数RU入力時の統合/分離結果（Step 10-2）を基に `operation_units` セクションを生成する。各 OU は `ou_id`, `source_ru`, `target_req`, `operation`, `scale`, `depends_on`, `recommended_order`, `issue_policy`, `result` フィールドを持つ（REQ-0102-033〜035）。単一REQ操作の場合も 1 件の OU として出力する
   - **6-2. execution_groups セクション生成**: OU 群を分析し、Epic 候補グループを `execution_groups` セクションに記録する。各 execution_group は `id`, `type`, `purpose`, `included_ou`, `rationale` を持つ（REQ-0102-036）。記録は提案であり、Issue 発行は行わない（REQ-0102-038）

7. **work_type 判定**: ラベルに基づき4値分類（bugfix/feature/maintenance/docs_chore）。bugfix + ADR必要時は feature に昇格

8. **Scale判断**（feature のみ）: `agentdev-workflow-lifecycle` で standard/large を判定。large 時はユーザーと分解計画を協議
   - **8-1. 実装スコープシグナル確認**（REQ-0102-056）: ドラフト内に実装詳細セクション（修正候補リスト・findings catalog・影響ファイル一覧等）が存在する場合、`agentdev-workflow-lifecycle` の実装スコープシグナル基準に基づき scale: large への昇格を判定すること。昇格時は昇格理由をユーザーに提示し、Step 8 の分解計画協議を実施すること

9. **ドラフト保存**:
   全 work_type（feature / bugfix / maintenance / docs_chore）で `.agentdev/drafts/req-draft-{topic-slug}.md` に保存。draft-meta セクション（work_type/req-operation/target-req/adr-required/topic-slug/scale/status 等）を追加。Step 6-1 で生成した `operation_units` セクションと Step 6-2 で生成した `execution_groups` セクションを含める。Step 4-2/4-3 で分離した SPEC 候補は `draft-meta.spec-candidates`（SC-ID・content・intended_spec・classification・source）に、Step 3-2/10-2 で計測した SPLIT 予兆は `draft-meta.split-forecast`（target・metrics・signals・total・recommended_action・thresholds_ref）に記録すること（REQ-0136-010, 011）。draft-meta の work_type が後続コマンドの消費パターンを決定する（feature: req-save が消費、bugfix/maintenance/docs_chore: req-save をスキップして case-open が消費）。`spec-candidates` / `split-forecast` は省略可能だが、spec-save・case-auto はこれらの有無で spec-save スキップ判定を行う（ADR-0123）
   - **9-1. 実装詳細の分離**（REQ-0102-057）: ドラフトに実装詳細（個別ファイルの編集指示・修正候補リスト・findings catalog 等）が含まれる場合、当該内容を要件定義部分（要件行・acceptance criteria・適用範囲）とは分離されたセクションに配置し、要件定義部分の判読性を確保すること。実装詳細がドラフト全体の過半を占める場合は、完了条件チェックボックスへの要約をユーザーに提案すること

10. **要件doc確認**: 生成した要件docをユーザーに提示（承認は求めず提示のみ）。差し戻し時は壁打ち継続（Step 1 へ）。次コマンド実行を確定の意思表示として扱う

    **10-1. 複数RU同時入力受付**: 詳細は `agentdev-req-analysis` を参照

    **10-2. 統合/分離判定**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは統合/分離候補と根拠のみを返し、親エージェントがdraft-metaへ記録する。併せて生成ドラフト自身の健全性メトリクス（要件行数・関心分類数・artifact 種別数）を計測し、`docs/specs/req-health-metrics.md` の閾値で SPLIT シグナルを算出して `draft-meta.split-forecast` に記録すること（REQ-0136-011）。新規 CREATE のドラフトであっても、要件行数が 51 行を超える場合は肥大化傾向としてユーザーへ SPLIT 要否を提案すること

    **10-3. 操作単位ごとの出力生成**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: 親エージェントがreq-save消費形式を確定する

    **10-4. Epic 規模検出時の記録**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは分解候補のみを返し、親エージェントがdraft-metaへ記録する

    **10-5. Wave 候補・依存関係の記録**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは依存候補のみを返し、親エージェントが順序依存を確定する

    **10-6. OU 構造検証**: 生成した `operation_units` セクションについて以下を確認する: (a) 各 OU に `ou_id`, `target_req`, `operation` が設定されている (b) `execution_groups` の `included_ou` が実在する `ou_id` を参照している (c) `depends_on` が実在する `ou_id` を参照している (d) `result` セクションが空である（req-save/case-open が書き戻すため）

11. **完了報告**: 完了報告templateに従って出力。work_type に応じたvariantを選択:
    - feature standard → .opencode/commands/agentdev/templates/req-define/feature.md
    - feature large (Epic)規模 → .opencode/commands/agentdev/templates/req-define/feature-epic.md
    - bugfix / maintenance / docs_chore → .opencode/commands/agentdev/templates/req-define/lightweight.md

## Guardrails

- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない
- G03: ファイル編集スコープ: `.agentdev/drafts/**` のみ作成・編集を許可
- G04: ユーザーが明示した入力ファイルは read-only。`.agentdev/backlog/req-units/RU-*.md` の削除は行わない（後続の case-open 成功後に実行）
- G05: `docs/` 配下の広範な探索禁止（例外: 明示入力ファイルと docs/requirements/\*\* の read-only 参照、Step 4-1 の限定探索は許可）
- G06: inbox.md / archive/active.md を直接ロードしない
- G07: promoted artifact の直読み禁止
- G08: `git` コマンドは実行しない
- G09: チェックボックスは測定可能で一意（`agentdev-req-analysis` 品質基準）
- G10: 要件doc構造は doc_requirement.md テンプレートに厳密に従う
- G11: ADR閾値以上の判断は `agentdev-adr-guidelines` へ
- G12: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G13: req-define は Issue 階層を決定しない。Issue 階層の決定は case-open の責務範囲
- G14: req-define は draft に `operation_units` と `execution_groups` セクションを出力すること（REQ-0102-033, 036）。単一REQ操作の場合も 1 件の OU として出力する
- G15: SPEC 分離基準（REQ-0101-068）に該当する要件行候補は REQ 要件行に残留させず、`draft-meta.spec-candidates` と `## SPEC候補` 補助セクションへ分離すること（REQ-0136-010）。安定契約例外（REQ-0101-069）は分離対象外。最終 REQ ファイルに SPEC候補セクションは残さない（spec-save が消費）
