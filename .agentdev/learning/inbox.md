# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

## 2026-09-23: targeted docs guard の --base-ref はコミット前 working tree 未コミット変更を検出しない

- **問題事象**: check_changed_docs.ts の --base-ref はヘルプで worktree 環境（マージ前・コミット前、case-run 等）の標準と案内されるが、コミット前の working tree 未コミット変更は git diff ベースのため検出されず、対象ファイル 0 件で warning となった（PR #3074 case-run 実測）
- **発生局面**: case-run worktree での targeted docs guard 実行（DEL-3068-3）
- **検知方法**: 対象ファイル 0 件 warning の観察
- **根本原因**: --base-ref のヘルプ文言（コミット前想定）と実挙動（git diff ベース・未コミット変更非対象）の不整合
- **自律対応内容**: コミット後の worktree HEAD での実行が前提と解釈して再実行し、挙動を PR 本文に記録
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（checker 実装変更は対象外）
- **横展開観点**: check_changed_docs.ts を使用する全 workflow（case-run / case-close / docs-check）
- **再発条件**: case-run worktree でコミット前に targeted docs guard を --base-ref で実行した場合
- **予防策候補**: ヘルプ文言と実挙動の整合確認、実行タイミング（コミット後 HEAD）の文書化
- **想定反映先**: check_changed_docs.ts ヘルプ、case-run STEP-S3-4 手順の実行タイミング明記
- **関連**: PR #3074（Issue #3068・Case #3063）
- **タグ**: #targeted-docs-guard #worktree

---

## 2026-09-23: worktree では textlint gate 実体が junction 未伝播のため main root gate.ts 実行 + --root 指定で代替する

- **問題事象**: worktree では .opencode/plugins/（agentdev-textlint-guard の gate.ts 実体）が junction 未伝播のため、worktree 内で textlint gate を直接実行できない（PR #3074 case-run 実測）
- **発生局面**: case-run worktree での文書品質査読（textlint 最終 gate）
- **検知方法**: case-run 実行時の gate.ts 起動不能の観察
- **根本原因**: worktree への .opencode/plugins/ junction 未伝播（既知の構造的制約）
- **自律対応内容**: メインリポジトリ root の gate.ts 実行 + 検査対象 root に worktree を指定する方式で代替し、配布 Skill 変更時の品質統制を textlint gate + 配布境界検査で充足
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: textlint gate を worktree で実行する全 workflow
- **再発条件**: worktree で textlint gate を直接実行する場合全般
- **予防策候補**: gate 実行方式（main root gate.ts 実行 + --root worktree 指定）の汎用手順明文化（REQ-018-005 で整備済みの --root 指定実行手順領域への追記候補）
- **想定反映先**: agentdev-git-worktree worktree-operations.md の checker 実行手順
- **関連**: PR #3074（Issue #3068・Case #3063）
- **タグ**: #textlint #junction #worktree

---

## 2026-09-23: 自己完結 checker への実装共有は fixture 進行テスト構成と衝突するため同一形式リーダー複製 + 対決テストで担保する

- **問題事象**: 自己完結実行が前提の repo-local checker（.opencode/skills/repo-* 配下）に他 skill 配下の決定的実装を静的 import で共有すると、checker を一時 fixture へ copy して実行する fixture 進行テスト構成で import 解決失敗により全テストが起動不能になる（PR #3075 case-run 実測）
- **発生局面**: check_integrity への既知欠番レジストリ免除実装（alloc-req-number.ts の extractKnownGapNumbers との単一情報源共有）
- **検知方法**: case-run（DEL-3069-3）実装時の fixture テスト構成分析
- **根本原因**: fixture 進行テスト構成（一時 fixture への copy + 実行）と絶対パス静的 import の前提衝突
- **自律対応内容**: 同一形式リーダー複製（抽出ロジック文字列レベル同一・データ単一情報源 numbering-policy 動的読込維持）+ 対決テスト（実リポジトリ numbering-policy + 合成 policy 6パターンで両リーダー出力の同値性を機械検証）で単一情報源を恒常担保
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（単一情報源契約は維持・第二のレジストリ〔欠番データ実体〕は存在しない）
- **横展開観点**: repo-local checker 系（.opencode/skills/repo-*）の決定的実装共有全般
- **再発条件**: 自己完結 checker への決定的実装共有が必要になった場合
- **予防策候補**: 「同一形式リーダー複製 + 対決テストで機械担保」パターンの手順としての文書化
- **想定反映先**: repo-agentdev-integrity の実装規約、guides
- **関連**: PR #3075（Issue #3069・Case #3063）
- **タグ**: #integrity-checker #fixture-test #import-share

---
