# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-22 Epic #1028 Wave 1 close

### L-001: check_integrity.ts 検出ルール追加時の fixture/categoryMap ペア更新

- **発生源**: PR #1035 (#1029 / REQ-0144)
- **学び**: check_integrity.ts の新規検出ルール追加時は、テスト fixture の更新と categoryToCheckPattern map の更新をペアで行う必要がある。copyScripts + drift detection テストがこの乖離を自動検出する仕組みが有効。
- **適用場面**: integrity 検出ルールの新規追加・変更時

### L-002: HITL 境界精密化パターンの汎用性

- **発生源**: PR #1033 (#1031 / REQ-0147)
- **学び**: HITL 境界の精密化パターン（判断確定→自動実行・破壊的変更は別承認）は promote/review 系以外のコマンド（case-close 等）にも適用可能な汎用パターン。別途整備候補。
- **適用場面**: HITL 境界設計全般

## 2026-06-22 Epic #1028 Wave 2 close

### L-003: worktree 環境で junction 未伝播に起因する偽陽性の汎用化

- **発生源**: PR #1036 (#1032 / REQ-0145)
- **学び**: worktree 環境では `.opencode/skills/` の junction が再作成されないため、source-projection-sync に限らず junction 依存の検査全般で偽陽性が発生する可能性がある。`checkSourceProjectionConsistency` に `isInsideWorktree` ヘルパー（`.git` が file かどうかで判定）を適用して偽陽性 27 件を解消した。このヘルパーは他の junction 依存検査（`source-projection-sync` 系・`.opencode/commands/agentdev/` 系）にも適用できるか今後評価すべき。
- **適用場面**: worktree 環境で junction 依存の整合性検査を追加・変更する場合。`isInsideWorktree` の適用範囲拡張候補の評価。

## 2026-06-23 Epic #1060 Wave 1 close

### L-004: docs 系 Issue で case-run task() 委譲不可時に adapter skill フォールバックパスが有効

- **発生源**: PR #1068 (#1061 / REQ-0148 + ADR-0129)
- **学び**: docs 系（REQ/ADR ファイル検証・カタログ参照追加）の Issue では、case-run の実行担当サブエージェント（Sisyphus-Junior）への task() 委譲がハーネス制約で利用不可になる場合がある。この時 `agentdev-case-run-execution-adapter` スキルの「task() 起動失敗時事後処理（Item 5）」パス（手動修正または PR 化）に従い、検証とカタログ更新を直接実施して PR 化する経路が有効に機能した。委譲不可を理由にブロックせず、フォールバックパスで完結できる。
- **適用場面**: case-run で docs 系 Issue を扱い task() 委譲が利用不可の場合。adapter skill のフォールバック判断基準の運用実証。

