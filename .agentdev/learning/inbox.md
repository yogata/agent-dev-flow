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

## 2026-06-23 Epic #1075 Wave 1 close

### L-005: Windows 環境で Write ツールが既存 UTF-8 ファイルを cp932 (Shift-JIS) で書き出す落とし穴

- **発生源**: PR #1085 (#1077 / OU-005)
- **学び**: Windows 環境で OpenCode の Write ツールが、既存 UTF-8 (BOM なし) ファイルを上書きする際にシステムデフォルトエンコーディング (cp932/Shift-JIS) で書き出す事象を確認。`docs/requirements/README.md` の編集時に発生し、edit ツール (per-line string replace) を使用することで回避した。配布物配布先環境 (consumer repo) でも同様の落とし穴が発生する可能性がある。`agentdev-gh-cli` スキルは gh CLI 用に `[System.IO.File]::WriteAllText` または Write ツールを許可しているが、既存 UTF-8 ファイルの編集では edit ツールが安全。
- **適用場面**: Windows 環境で既存 UTF-8 (BOM なし) ファイルを編集する場合。特に README.md 等、改行・エンコーディングが厳格なファイル。edit ツール (per-line string replace) を優先し、Write ツールの全面上書きは新規ファイル作成時に限定する。

## 2026-06-23 Epic #1093 Wave 1 close

### L-007: REQ の手続き列挙に中核操作（PR 作成）が抜けていた場合の SPEC 拡張判断

- **発生源**: PR #1098 (#1094 / REQ-0149 + ADR-0130)
- **学び**: REQ-0149-002 は agentdev-gh-cli の8手続きを列挙したが「PR 作成」が含まれていなかった。Sisyphus-Junior が PR を作成する中核操作のため、実装（SPEC/contracts/standard-procedures）に「PR 作成」を追加しないと REQ-0149-001「PR 操作の委譲」が実装できない。本 PR では SPEC 拡張として「PR 作成」を追加（9手続き）し、REQ-0149-002 本体への追記は別途検討とした。要件定義で「列挙」を明示した場合、実装上必須の中核操作が漏れることがある。実装段階で SPEC を拡張して補完しつつ、REQ との整合は別途 req-save で処理する二段階判断が有効。
- **適用場面**: REQ で手続き・API・コマンド等を列挙定義した場合。実装で中核操作の欠落に気づいた際、SPEC 拡張で即時対応しつつ REQ 更新を後続工程に委ねる判断基準。

## 2026-06-23 Epic #1093 Wave 2 close

### L-008: worktree + .gitignore で junction が切れた環境では src/opencode/skills/ を直接参照

- **発生源**: PR #1099 (#1095 / REQ-0150 + ADR-0130)
- **学び**: worktree 内で `.opencode/skills/` への junction が切れている環境（git worktree + .gitignore で `.opencode/*` を除外）では、標準版スキルは `src/opencode/skills/` を直接読む必要がある。今回そのパターンに遭遇し、`src/opencode/skills/agentdev-gh-cli/` を直接参照して標準版構造を把握した。worktree 前提の作業では SoT パス（`src/opencode/`）を直接参照する運用が有用。L-003（source-projection-sync の偽陽性）と同じ根因だが、検査対象ではなく実装時の参照パス問題として再発。worktree 環境の junction 非伝播は検査・実装の両面で影響する。
- **適用場面**: worktree 環境で標準版スキル・コマンドの構造を確認する場合。`.opencode/` 経由ではなく `src/opencode/` を直接参照する運用の判断基準。

### L-009: Windows + worktree 環境で git mv の実行形式による成否差異

- **発生源**: PR #1099 (#1095 / REQ-0150 + ADR-0130)
- **学び**: git mv でディレクトリを移動する際、`git -C <worktree> mv <src> <dst>` が `fatal: renaming ... failed: No such file or directory` で失敗した。`workdir` パラメータで worktree を作業ディレクトリにして `git mv` を実行すると成功した。Windows + worktree 環境では、`git -C` と `workdir` + 平置き `git` コマンドで挙動が異なる場合がある。`git -C <path>` はカレントディレクトリを変更せずにパスを指定するが、worktree 内の相対パス解決と Windows のパス処理が干渉したと推測される。ディレクトリ移動を伴う git mv では workdir 指定を優先する。
- **適用場面**: Windows + worktree 環境で git mv によるディレクトリ移動を実行する場合。`git -C` 失敗時のフォールバックとして workdir 指定 + 平置き git mv を試す判断基準。

## 2026-06-23 Epic #1075 Wave 2 close

### L-006: 並列機械的テキスト置換 OU の Wave 実行で文字レベルマージが必要になる

- **発生源**: PR #1088/#1089/#1090/#1091 (#1078/#1076/#1079/#1080 / OU-001〜004)
- **学び**: 異なる文字種（中黒・em-dash・LLM表現・一文一行）の機械的置換を並列 Wave で実行した場合、同一行に複数種の変更が及ぶと行レベルの git merge が必ず競合する。競合解消には文字レベルの SequenceMatcher 結合（ours の文字変更を保持しつつ theirs の行分割を挿入）が有効。`git apply --3way` で 3-way マージを試行した後、残った競合マーカーを Python スクリプトで文字レベル結合するアプローチが実用十分だった。Wave 設計時は、異なる文字種の置換を同一 Wave で並列実行する場合の競合解消コストを見積もるべき。
- **適用場面**: 複数の機械的テキスト置換 OU を並列 Wave で実行する場合の競合解消計画。文字レベルマージツールの事前準備。


