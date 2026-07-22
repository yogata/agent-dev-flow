# 評価レポート

## メタデータ
- **実行日時**: 2026-07-22
- **対象エントリ数**: 56件（inbox: 31件, deferred: 25件）
- **問題クラス数**: 6（未分類: 15単独エントリ）

## 問題クラス一覧

### 問題クラス1: Windows worktree ジャンクション未伝播による projection 配下ツール実行障害

- **根本原因**: git worktree 作成時にメインリポジトリのジャンクションリンク（`.opencode/` 配下）は伝播しない。`.opencode/` 配下は git 管理対象外（`.gitignore`）のため worktree 側に再現されない。
- **再発条件**: (1) Windows 環境、(2) git worktree を使用、(3) `.opencode/` 配下を走査する検査ツール・テストコードを worktree 内で実行
- **予防策**: projection → source の段階的パス解決（fallback）の標準化、または検証対象のみの一時ジャンクション作成パターン

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（lint_skills.ts、README fallback） |
| 影響度 | 3/5 | 検査 WARNING 評価不能・テスト fail で検証信頼性低下 |
| 横展開性 | 3/5 | Windows+worktree に固有だが複数ツールで発生 |
| 反映先明確度 | 4/5 | case-run skill references、repo-agentdev-integrity 規約 |
| 自動化適性 | 3/5 | fallback パス解決ヘルパの共通化は可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows+junction+worktree 固有の落とし穴 |
| 再発可能性 | 4/5 | worktree 使用継続限り確実に再発 |
| 費用対効果 | 3/5 | fallback 実装で吸収可能だが全ツールへの展開コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: deferred（既存制約の運用補強。fallback パス共通化は有望だが単独では成熟度不足。repo-agentdev-integrity skill テストコード規約への追記候補として living pool で維持）

#### エントリ一覧
- Windows worktree 環境で lint_skills.ts を実行するためのジャンクション一時作成パターン [inbox]
- worktree ジャンクション未伝播環境での README 参照 fallback 実装パターン [inbox]

---

### 問題クラス2: call_omo_agent ハーネス制約（explore/librarian 型のみ許可）と adapter protocol インライン逐次実行

- **根本原因**: oh-my-openagent ハーネスの `call_omo_agent` API が explore/librarian 型のみ許可し、実行担当サブエージェント（custom agent 型）を起動できない。
- **再発条件**: (1) oh-my-openagent ハーネス（または同等の API 制限）で case-run 委譲起動を試みる
- **予防策**: 事前 probe（ハーネス能力検出）+ adapter protocol delegation-unavailable パス（インライン逐次実行）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 5/5 | inbox 2件 + deferred に L-004/L-010/case-auto フォールバック等多数 |
| 影響度 | 2/5 | 委譲不可だがインライン逐次実行で完結可能 |
| 横展開性 | 4/5 | ハーネス移行時にも発生し得る |
| 反映先明確度 | 5/5 | adapter skill「ハーネス制約適応」節、capture-boundaries.md に既に新設済み |
| 自動化適性 | 4/5 | 事前 probe は自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | ハーネス非依存設計の知見 |
| 再発可能性 | 5/5 | 現ハーネス継続限りほぼ確実 |
| 費用対効果 | 4/5 | 既に adapter skill + REQ-0149-012 で完全カバー済み |
| **加重合計** | **32/40** | |

- **推奨処分案**: duplicate（adapter skill L131-148 + REQ-0149-012 + deferred pool L-004/L-010/case-auto フォールバックで完全カバー。inbox 2件は既存知識の再実証記録。事前 probe 強化は PR #1576 で要件化・実装済み）

#### エントリ一覧
- call_omo_agent schema 制約による委譲起動不可とインライン逐次実行時の adapter protocol 遵守 [inbox]
- call_omo_agent が explore/librarian 型のみ許可されるハーネス制約と adapter protocol の運用 [inbox]

---

### 問題クラス3: bg task 異常終了回復（case-auto → case-run 子 task 破棄時の成果物行き場消失）

- **根本原因**: case-run 子 task のライフサイクルと成果物（commit/working tree）のライフサイクルが分離されておらず、task 破棄で成果物が行き場を失う。
- **再発条件**: (1) case-run 子 task が commit 作成後またはファイル編集中にハーネスの bg task 機能で task 破棄される、(2) case-auto 親ループが子 task の中断を検知できる
- **予防策**: case-auto 親ループに「子 task 中断検知 → worktree git status 確認 → commit/rebase/push/PR 作成代行」の標準回復パスを組み込む。子 task は細粒度で commit を作成する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（commit 済み・PR 未作成 / 未コミット変更あり） |
| 影響度 | 3/5 | 成果物消失のリスクだが親ループで回復可能 |
| 横展開性 | 3/5 | case-auto + Epic Wave 並列委譲でも発生可能性 |
| 反映先明確度 | 4/5 | case-auto command SPEC、workflow-orchestration skill |
| 自動化適性 | 4/5 | 回復パスの自動化（git status → commit → push → PR）は容易 |
| プロジェクト固有知識再利用性 | 3/5 | case-auto 固有のワークフロー知見 |
| 再発可能性 | 4/5 | bg task の仕様上継続的に発生 |
| 費用対効果 | 4/5 | 回復パス標準化でリスク大幅低減、コスト低 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 昇華（既存 command へ反映）— case-auto command SPEC への子 task 中断回復パス標準化、workflow-orchestration skill の子 task ライフサイクルと成果物ライフサイクル分離。2パターン（commit 済み・未コミット）が実証済みで具体性あり。

#### エントリ一覧
- bg task 異常終了からの回復パターン（commit 作成済み・PR 作成前 task 破棄）[inbox]
- bg task 異常終了からの回復パターン（未コミット変更あり・作業中 task 破棄）[inbox]

---

### 問題クラス4: 監査台帳ライフサイクル（SC-003）適用パターンの未具体化

- **根本原因**: 大規模変更計画で監査フェーズ（Phase1）と再編フェーズ（Phase2）のライフサイクル分離と引き継ぎ形式が SC-003 SPEC で未具体化。適用例が未整備。
- **再発条件**: (1) 監査台帳を前提情報とする大規模変更計画を立ち上げる
- **予防策**: SC-003 SPEC の「既知の適用例」「次フェーズ用入力」節へ 4 パターン（フェーズ分割、書き戻し形式、2 commit 構成、6要素構成）を追記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | inbox 4件（one-time 独立、書き戻し、2 commit 構成、6要素構成） |
| 影響度 | 3/5 | 大規模変更のトレーサビリティ・完遂証跡の欠落 |
| 横展開性 | 4/5 | 大規模変更計画全般で適用可能 |
| 反映先明確度 | 5/5 | SC-003 SPEC（`docs/specs/local/audit-ledger-lifecycle.md`、既存 accepted） |
| 自動化適性 | 2/5 | 手順の標準化だが自動化は低い |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow 監査台帳運用固有 |
| 再発可能性 | 4/5 | フェーズ分割アプローチは継続利用 |
| 費用対効果 | 5/5 | 既存 SPEC への適用例追記で低コスト・高効果 |
| **加重合計** | **31/40** | |

- **推奨処分案**: 昇華（既存 SPEC へ反映）— SC-003 SPEC「既知の適用例」「次フェーズ用入力」節へ 4 パターンを追記。既存 SPEC の補強。

#### エントリ一覧
- 監査フェーズを one-time ライフサイクルとして独立させると未決事項確定不可制約を守りやすい [inbox]
- 監査→実装 PR→監査台帳書き戻しの紐付けを明示的にする運用 [inbox]
- 中間成果物ライフサイクル完遂を 2 commit 構成で証明するパターン [inbox]
- 次フェーズ用入力の自足性を6要素構成で確保する転記パターン [inbox]

---

### 問題クラス5: 索引類自動生成（SC-002）の整合性維持と複数PR跨ぎ再生成漏れ

- **根本原因**: 索引類（README/DOC-MAP）の AUTOGEN block と人手編集領域の分離基準が未明文化。複数PRが同じ索引ファイルを編集する際、最後にマージされるPRが generate_indexes.ts を実行せず AUTOGEN block の不整合が発生。
- **再発条件**: (1) 複数PRが同じ索引ファイルの AUTOGEN block に依存する変更を行う、(2) 各PRが独立して索引更新を試みるか委譲する、(3) case-close で generate_indexes.ts が必須実行されない
- **予防策**: case-close SPEC Step 3/E5b へ generate_indexes.ts 必須実行ステップ追加。SC-002 SPEC「混合領域」許容と frontmatter 由来情報と人手編集情報の分離基準を明文化。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 3件（GENERATE 可能、混合領域分離、複数PR跨ぎ再生成漏れ） |
| 影響度 | 3/5 | docs-check NG で case-close QG-4 ブロック |
| 横展開性 | 4/5 | 索引類 AUTOGEN 化全般、Wave 3/4 でも同様の判断が必要 |
| 反映先明確度 | 5/5 | SC-002 SPEC、case-close SPEC |
| 自動化適性 | 5/5 | generate_indexes.ts 必須実行は自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | SC-002/IR-061 運用の知見 |
| 再発可能性 | 4/5 | 複数PR構成は継続、索引編集は頻繁 |
| 費用対効果 | 5/5 | case-close へのステップ追加で低コスト・高効果 |
| **加重合計** | **33/40** | |

- **推奨処分案**: 昇華（既存 SPEC/command へ反映）— SC-002 SPEC「混合領域」明文化 + case-close SPEC Step 3/E5b へ generate_indexes.ts 必須実行ステップ追加。3エントリ中最も具体性と費用対効果が高い。

#### エントリ一覧
- 索引類の件数表明は実ファイルから GENERATE 可能で人手更新漏れを根絶できる [inbox]
- 索引類自動生成における frontmatter 由来情報と人手編集情報の分離パターン（Wave 2 実証）[inbox]
- 複数PR跨ぎの索引 AUTOGEN 再生成忘れによる docs-check NG 発生 [inbox]

---

### 問題クラス6: Windows PowerShell/gh CLI の UTF-8 出力取り回しによるエンコーディング損傷

- **根本原因**: Windows 環境で PowerShell がネイティブコマンド（gh CLI, git, bun 等）の UTF-8 出力をパイプライン経由で取得する際、cp932（Shift-JIS）へ再エンコードし文字化け・LF 数不正・JSON parse エラーを生じる。
- **再発条件**: (1) Windows 環境、(2) PowerShell からネイティブコマンドの UTF-8 出力をパイプライン経由で取得、(3) 結果を文字列操作・正規表現・JSON parse に直接渡す
- **予防策**: Node.js `execSync`（encoding:'utf-8'）経由の直接取得、`[System.IO.File]::WriteAllText` UTF8Encoding($false) によるファイル経由（`--body-file`）、subprocess 側での明示的 encoding 指定

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 3件（Issue 本文崩壊修復、gh CLI pipeline、subprocess JSON empty stdout） |
| 影響度 | 3/5 | 文字化け・LF 不正で検証 信頼性低下、JSON parse エラーでテスト fail |
| 横展開性 | 4/5 | Windows 環境のネイティブコマンド出力全般 |
| 反映先明確度 | 5/5 | agentdev-gh-cli standard-procedures.md Section 3（既規定） |
| 自動化適性 | 3/5 | execSync 使用ルールは徹底可能だが運用依存 |
| プロジェクト固有知識再利用性 | 4/5 | Windows+PowerShell 固有の落とし穴 |
| 再発可能性 | 4/5 | Windows 継続限り確実 |
| 費用対効果 | 4/5 | 既規定（REQ-0132-024/025/026、REQ-0149-010）の運用徹底 |
| **加重合計** | **30/40** | |

- **推奨処分案**: deferred（Entry 13/14 は agentdev-gh-cli standard-procedures.md Section 3 既規定の運用補強。Entry 30（subprocess JSON empty stdout）は別 Issue 推奨の pre-existing 環境問題。既に REQ-0132-024/025/026、REQ-0149-010 で構造的に防止済み）

#### エントリ一覧
- Issue 本文崩壊（LF 圧縮・見出し消失）の修復手法と予防線 [inbox]
- gh CLI 出力の PowerShell パイプライン経由読み取りによる UTF-8 損傷と Node.js execSync 回避 [inbox]
- Windows worktree 環境で check_integrity.ts の subprocess JSON が空 stdout を返す問題 [inbox]

---

## 未分類

単独エントリ（最小クラスタサイズ2未満）。全て deferred（living pool）で維持し、再発時に具体化して再評価する。

| # | エントリ | 想定反映先候補 | 備考 |
|---|---|---|---|
| 1 | 要件追加が既存基準の明文化で実変換を伴わない no-op パターン | workflow-templates pr_desc.md、quality-gates qg-4 | pass_criteria 運用知見 |
| 2 | extension が未サポート形式の brief 授権で意味マッピング処理するパターン | req-save SPEC、workflow-lifecycle | brief 授権経路の明文化候補、未成熟 |
| 3 | TS-004 subagent 委譲プロトコル適用効果の実証を record-in-findings で処理した判断基準 | quality-gates qg-4、workflow-templates issue_desc | record-in-findings 判断基準の共通化候補 |
| 4 | ADR frontmatter の relates-to/supersedes を本文と Decision Map で表現する運用 | ADR 形式 SPEC、agentdev-adr-file-manager | 有望だが単発、再発時に具体化 |
| 5 | req-save/spec-save 統合委譲で生成された SPEC 本文への中国語文字混入 | agentdev-gh-cli verify.md、inspect-docs | CJK 検出 VERIFY 追加候補、既に修正済み |
| 6 | 要件行は進捗値ではなく仕様としてベースライン値を記述すべき | document-type-responsibilities、workflow-templates req_* | 要件行記述ガイドライン候補 |
| 7 | 再構成検証型 Issue で「決定」更新後に「結果・影響」節が取り残される内部矛盾パターン | case-run 検証テンプレート、inspect-docs | 派生節整合性確認の観点追加候補 |
| 8 | 物理統合時の参照更新網羅性チェックパターン | workflow-templates、inspect-docs | 既存 obsolete-path-map.yaml 運用の実証 |
| 9 | AG-001 制約内で公開 SKILL.md の文書構成を是正する REFERENCE 強化パターン | document-type-responsibilities、case-run 検証 | 動作不改範囲での文書構成是正の標準化候補 |
| 10 | IR-* frontmatter の Related REQ/SPEC フィールド不在と本文 prose 抽出代替パターン | IR-* 形式 SPEC、Phase E | frontmatter 標準形式への移行候補 |
| 11 | 配布物 SKILL.md の DERIVE 宣言に内部 ID を含めると IR-055 strict violation となる設計制約 | document-type-responsibilities、SC-002、agentdev-skill-authoring | 設計指針明文化候補、有望だが単発 |
| 12 | worktree 委譲先での cd 操作誤りによるメインリポジトリ一時汚染と検出・是正パターン | adapter skill、case-auto SPEC | worktree 隔離原則違反時の検出・是正手順候補 |
| 13 | verification-only 空 PR の squash merge 許容性 | REQ-0108-279 実証根拠 | 実証結果、新規対策不要 |
| 14 | CaptureBoundary チェックと配布物参照境界（IR-059）の相互作用と両立運用 | integrity-contracts.md、capture-boundaries.md SPEC | 概念名括弧書き残存の運用明文化候補 |
| 15 | 複数PR跨ぎ semantically 競合の Level 2 コンフリクト解消パターン | case-open Wave 構成ロジック、case-auto | 共通ファイル依存検出の標準化候補 |

## promote時prune結果

- **対象エントリ数**: 31件（inbox 全エントリを deferred.md へ移動後に prune 対象を判定）
- **prune実施**: あり（Step 14 で実施予定）
- **prune候補**: 11件（staged 9件 + duplicate 2件）
- **prune却下**: 20件（deferred 判定で living pool へ残置）

## 全体傾向

- **高スコアクラス（加重合計 30以上）**: 問題クラス2（32/40, duplicate）、問題クラス5（33/40, 昇華）、問題クラス4（31/40, 昇華）。既存 SPEC/command への反映余地が明確なものが高スコア。
- **既存対策カバー率の高さ**: 問題クラス2（adapter skill 完全覆盖）、問題クラス6（gh-cli standard-procedures 既規定）は既存対策で大部分がカバーされており、新規昇華不要。AgentDevFlow の知識基盤が成熟している領域。
- **Windows 環境固有の知見集中**: 問題クラス1（worktree junction）、問題クラス6（PowerShell encoding）で Windows 固有の落とし穴が2クラスタを形成。Linux/macOS では発生しない知見が living pool で維持される。
- **監査台帳・索引自動生成の運用パターン蓄積**: 問題クラス4（SC-003）、問題クラス5（SC-002）で大規模変更計画・索引類自動生成の運用パターンが4件+3件蓄積。既存 SPEC への適用例追記で再利用性が高まる。
- **bg task 回復パターンの具体化**: 問題クラス3で case-auto 子 task 破棄時の回復パスが2パターン（commit 済み・未コミット）実証済み。case-auto SPEC への標準化が有望。

## ADR候補除外記録

全問題クラスについて `agentdev-adr-guidelines` の除外基準（禁止条件フィルタリングゲート）を適用した結果、ADR候補は0件。全クラスは運用ルール・手順・command仕様・既存SPEC拡張であり、技術判断不在。

| 問題クラス | 除外基準 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| 1 | 運用ルール | worktree 環境での検証手順・パス解決の運用知見 | case-run skill、repo-agentdev-integrity |
| 2 | 運用ルール | ハーネス制約時のフォールバック運用（既に adapter skill で規定済み） | adapter skill（既存） |
| 3 | command仕様・運用ルール | case-auto 子 task 中断回復手順の標準化 | case-auto SPEC、workflow-orchestration skill |
| 4 | 仕様変更のみ・運用ルール | 既存 SC-003 SPEC への適用例追記 | SC-003 SPEC（既存） |
| 5 | command仕様・仕様変更 | case-close へのステップ追加、SC-002 SPEC の明文化 | case-close SPEC、SC-002 SPEC |
| 6 | 運用ルール | PowerShell/gh CLI 出力取り回しの運用規定（既に standard-procedures.md で規定済み） | agentdev-gh-cli（既存） |
