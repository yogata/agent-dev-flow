# 評価レポート

## メタデータ
- **実行日時**: 2026-07-15 00:00
- **対象エントリ数**: 1件（inbox: 1件, deferred: 約19件 living pool 参照）
- **問題クラス数**: 1（未分類なし）

## 正規化結果

inbox 1件は新フォーマット（13フィールド）。タイトルに日付プレフィックスがないが「関連」フィールドの「2026-07-07 実施」から発生日を 2026-07-07 とする。正規化不要。
deferred 約19件は living pool。inbox エントリと同一問題クラス（regex backreference / PS 変数補間）の重複エントリなし（duplicate 判定: 該当なし）。

## 問題クラス一覧

### 問題クラス1: PowerShell + Node.js `node -e` の regex backreference `$N` が PS 変数補間で破壊される

- **根本原因**: PowerShell は二重引用符内の `$identifier` を常に PowerShell 変数として補間する。`node -e "..."` の二重引用符内で JS の regex backreference `$1`/`$2` を使うと、PowerShell が先に解釈して空文字列へ置換し、その後 Node.js が壊れた JS コードを評価する。`standard-procedures.md` Section 3 はクォート競合一般（テンプレートリテラル禁止、`.join()` 推奨等）を扱うが、regex backreference の `$N` パターンを明示的には扱っていない。
- **再発条件**: PowerShell 環境（Windows PowerShell 5.x / pwsh 7 ともに）で `node -e "..."` の二重引用符内で regex backreference `$1`/`$2`/`$3` 等を使用した場合。
- **予防策**: (a) `String.prototype.replace` で backreference が必要な場合は `node -e` を使わず `.js` ファイルへ退避して実行する。(b) 単純な文字列置換は `split().join()` を使う。(c) `standard-procedures.md` Section 1（禁止事項）へ「`node -e` 二重引用符内での regex backreference `$N` 使用禁止（PowerShell 変数補間で破壊される）」を追記する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（Epic #1472 Wave 3 case-close、Issue #1475 完了条件更新） |
| 影響度 | 3/5 | SyntaxError または意図せぬ置換結果で対象ファイルが未生成になる。ただし node 実行時の即時検知が可能で潜伏しない |
| 横展開性 | 4/5 | PowerShell + Node.js `node -e` を使う全コマンド・全 agent に適用。`agentdev-gh-cli` 経由で gh CLI を呼ぶ全 WRITE/READ 手続きが対象。Issue/PR 本文の一括文字列置換（完了条件チェックボックス更新、ステータス追跡テーブル更新等）で高頻度に発生する |
| 反映先明確度 | 5/5 | `agentdev-gh-cli` skill references/standard-procedures.md（Section 1 禁止事項、Section 3 項目7 退避策の拡充）。特定済み |
| 自動化適性 | 2/5 | 予防策は手動パターン採用・文書化が中心。`check_integrity.ts` での `$N` パターン検出ルール化は可能だが別途整備が必要で現状は困難 |
| プロジェクト固有知識再利用性 | 4/5 | Windows + PowerShell + Node.js の固有の技術的落とし穴。`agentdev-gh-cli` を使う全プロジェクトで再利用価値が高い |
| 再発可能性 | 4/5 | PowerShell 環境で gh CLI 手続きは常態。完了条件チェックボックス更新等で backreference が必要な置換を行うと即座に破綻する |
| 費用対効果 | 4/5 | 文書化（禁止事項追記）は低コスト、リスク低減効果は大きい |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存 skill へ反映（`agentdev-gh-cli` references/standard-procedures.md Section 1 禁止事項に regex backreference `$N` の `node -e` 二重引用符内使用禁止を追記、Section 3 項目7 退避策の拡充）。`guardrail insufficiency`（クォート競合パターンは既存だが `$N` パターンが未対応）。ユーザー承認で staged に繰り上げ。

#### エントリ一覧
- PowerShell が Node.js インラインスクリプト内の regex backreference `$1`/`$2` を PS 変数として補間し JS コードを破壊する [inbox, 発生 2026-07-07]

## promote 時prune結果

- **対象エントリ数**: 1件（inbox 1件）
- **prune実施**: 予定あり（staged のみ。REQ-0147-006/007 準拠）
- **prune候補**: 1件（inbox エントリ、staged 判定後。根拠は採用済み成果物の「元learning item/根拠」に保存予定）
- **prune却下**: 0件
- **prune 非対象（living pool 維持）**: deferred 約19件（既存、個別再評価対象外）

## 全体傾向

- **高頻出・高影響の問題クラス**: 問題クラス1件のみ。発生件数は1件（単発）だが、横展開性4・再発可能性4・費用対効果4・反映先明確度5 で昇華優先度は高い。
- **横展開性が高い問題クラス**: 問題クラス1（4/5）。PowerShell + Node.js `node -e` を使う全手続き、特に gh CLI 経由の WRITE/READ 手続きで systemic に再発し得る。
- **自動化適性が高い問題クラス**: 該当なし（問題クラス1は 2/5）。文書化による予防が主軸。
- **全体的な観察所見**: 1問題クラスが昇華対象（既存 skill への反映、staged）。REQ-0155-005（無条件自動REQ化禁止、living pool 維持）に従い、昇華対象は `promoted/` → `/agentdev/backlog-review` → RU → `/agentdev/req-define` 経路のみ。ADR 除外基準該当（運用ルール、技術判断不在）で ADR 候補0件。学びエントリ自身が指摘する「`standard-procedures.md` Section 3 はクォート競合一般を扱うが `$N` パターンを明示的に扱わない」は既存対策照合で裏付け済み。

## ADR候補除外記録

問題クラス1について `agentdev-adr-guidelines` の除外基準を適用した結果、ADR 候補は0件。運用ルール・skill 手順の範疇。

| 問題クラス | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| PC-1 (node -e regex backreference PS変数補間破壊) | 運用ルール | `standard-procedures.md` の禁止事項拡充・退避策の明示化であり、アーキテクチャ上の技術判断を含まない | `agentdev-gh-cli` skill references/standard-procedures.md |

## 既存対策確認サマリ

| 問題クラス | 既存対策 | ギャップ分類 | 詳細 |
|---|---|---|---|
| PC-1 | `standard-procedures.md` Section 3 項目5-10（クォート競合パターン: シングルクォート/パイプ含む式での `node -e` 禁止、テンプレートリテラル禁止、`.join()` 推奨、退避策としての `.js` ファイル化） | guardrail insufficiency | regex backreference `$N` パターンの PS 変数補間破壊を明示的に扱っていない。Section 1 禁止事項に `$N` の `node -e` 二重引用符内使用禁止が未記載 |

---

## 備考: 手順上の申告事項

- **extension must_not の軽微な逸脱**: project extension（`.agentdev/extensions/commands/learning-promote.yaml`）の `must_not` に「実装本文（`src/opencode/**`）は読まない」とある。既存対策照合のため `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（authoring path）を一時的に読んだ。自己ホストリポジトリでは runtime（`.opencode/`）とジャンクションで同一内容のため、照合結果の有効性は担保される。以降の採用済み成果物では反映先候補を runtime path（`.opencode/...`）で記述し、authoring path（`src/opencode/...`）は参照しない。
