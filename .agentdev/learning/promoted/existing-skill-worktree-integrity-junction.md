# worktree 環境での integrity スクリプト junction 対応

## 背景

worktree（`.worktrees/{N}-{type}`）で integrity スクリプト（`check_integrity.ts`）を実行すると、`source-projection-sync` チェックが失敗する。worktree は独立したチェックアウトであり、`install-consumer-opencode.ps1` が作成する junction link がメインリポジトリから伝播しないため。毎回 AGENTS.md 記載の手順で junction を手動再作成する必要があり、運用上の既知制約として PR Findings に記録されていた。

REQ-0108-173 で「broken junction 検出 gate」は規定されており、`check_integrity.ts` には `resolvePathWithFallback` 関数（`/opencode/` → `src/opencode/` フォールバック）も存在する。しかし worktree 環境特有の手順が `agentdev-workflow-orchestration` に未整備であり、case-run で worktree セットアップ後に integrity 検証を行う際のフリクションが継続していた。

## 問題

- worktree 環境で `source-projection-sync` チェックが失敗し、手動 junction 再作成が毎回必要
- `agentdev-workflow-orchestration` に worktree 環境での integrity 実行時の注意事項が未記載
- `check_integrity.ts` に worktree 環境の明示的検知ロジックが不在（汎用 fallback のみ）
- AGENTS.md に worktree junction 関連のガードレールなし

## 望ましい変更

case-run worktree セットアップ手順に、worktree 環境で integrity/projection 関連検証を行う際の junction 再作成ステップ（または該当チェックのスキップ/警告条件）を明記する。これにより手動 workaround から手順化された標準運用に移行する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（case-run worktree セットアップ手順、準備フェーズ Step 4 周辺）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（worktree 検知ロジック追加の副次候補）

### 対象外

- `agentdev-git-worktree` スキル（worktree 作成・削除手順の本体。junction 再作成は worktree ライフサイクルではなく integrity 実行時の前提）
- `install-consumer-opencode.ps1`（メインリポジトリ向け junction 作成スクリプト本体の変更は想定していない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` | 準備フェーズ Step 4（worktree作成・ブランチ準備）に worktree 環境で integrity 検証を行う際の junction 再作成前提条件またはスキップ条件を追記 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | worktree 環境で source-projection-sync が失敗した際のエラーハンドリング手順を追記 |
| script | `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` | （副次）worktree 環境を検知して該当チェックを警告レベルに緩和、またはメッセージに junction 再作成を案内するロジック追加を検討 |

## 既存対策確認

- **確認結果**: 既存対策 partial
- **該当ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（`resolvePathWithFallback` 関数 lines 133-141、REQ-0108-189 fallback）、REQ-0108-173 broken junction 検出 gate、`agentdev-git-worktree/references/worktree-operations.md` lines 69-83（Windows+junction 削除フォールバック）
- **ギャップ分類**: application miss
- **ギャップ詳細**: fallback logic（`resolvePathWithFallback`）と broken junction 検出 gate は存在するが、(1) `agentdev-workflow-orchestration` に worktree 環境での integrity 実行時の手順が未記載、(2) integrity スクリプトに worktree の明示的検知ロジックが不在（汎用 fallback のみで worktree 特有の失敗パターンを案内しない）、(3) AGENTS.md にガードレールなし

## 制約

- 既存の `resolvePathWithFallback` および REQ-0108-173 broken junction 検出 gate との整合性を保つこと
- worktree 環境での junction 再作成手順は AGENTS.md 記載の既存手順を踏襲すること（新規手順の発明ではない）
- integrity スクリプトの変更は副次的候補であり、まずは workflow-orchestration の手順追記で運用上のフリクションを解消することを優先する
- Windows + junction 環境に特化した記述であることを明示すること（非 Windows 環境では発生しない）

## 受け入れ条件

- [ ] `agentdev-workflow-orchestration` の準備フェーズ（または該当する参照ドキュメント）に worktree 環境での integrity 実行時の注意事項が追記されている
- [ ] junction 再作成が必要な条件、または該当チェックをスキップ/警告できる条件が明記されている
- [ ] 既存の `resolvePathWithFallback` および broken junction 検出 gate との関係が説明されている
- [ ] （副次）integrity スクリプトに worktree 検知の検討メモまたは TODO が残されている

## 元learning item / 根拠

- **要約**: worktree 環境では junction link が伝播せず、integrity スクリプトの source-projection-sync チェックが失敗する。手動 junction 再作成で対応可能だが、手順化されていないため毎回のフリクションが発生。
- **根拠**: PR #804 Findings, Issue #803 で実証。worktree は独立チェックアウトであり `install-consumer-opencode.ps1` の junction が伝播しないことが根本原因。
- **再発条件**: worktree 上で integrity スクリプトまたは projection 関連チェックを実行する全ケース
- **横展開可能性**: 全 case-run worktree 環境で発生し得る。特に Windows + junction 環境で顕著

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #803, PR #804 Findings
