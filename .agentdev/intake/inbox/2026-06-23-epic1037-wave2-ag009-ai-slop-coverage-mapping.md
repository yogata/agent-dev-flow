# AG-009 カタログ作成時: 削除した AI-slop 10 基準と japanese-tech-writing の覆盖関係明示の検討

## 発生源

- Epic: #1037 (Wave 2)
- Issue: #1039 (AG-007・agentdev-doc-writing スキル更新)
- PR: #1049 (merged, squash b2a6367a)
- 発生日: 2026-06-23

## 内容

PR #1049 の `references/rewrite-patterns.md` で AI-slop 10 基準パターン（結論第一・抽象評価語・曖昧動詞・主語なし・根拠なし推測・無条件同調・比喩・水増し締め・「できるようにする」の濫用）を削除した。これらの一部は `japanese-tech-writing` スキルの「LLM っぽい表現の禁止・空虚な形容・空虚な動詞」が実質カバーする。

Epic #1037 は「カバレッジ穴許容」の方針（REQ-0140-023）だが、覆盖関係の明示がない状態で AG-009（規範逸脱カタログ作成・Wave 4 #1041-#1047）を実施すると、カタログの検出精度にばらつきが出る可能性がある。`japanese-tech-writing` が実質カバーする範囲との対応表を整理することで、AG-009 の査読基準を安定化できる。

## 推奨対応先

Wave 4 AG-009 カタログ作成 Issue（#1041-#1047）の実行時検討事項。特に `src/opencode/skills/` (#1042)・`docs/specs/` (#1047) のカタログ作成時に、覆盖関係を参照表としてカタログ冒頭または `japanese-tech-writing` 側に整理することを検討する。

現時点では blocker ではなく検討候補。Epic #1037 の「カバレッジ穴許容」方針に従い、覆盖関係未整理でもカタログ作成は可能。

## 現在の追跡状態

- `references/rewrite-patterns.md`: AI-slop 10 基準パターン削除済み（PR #1049）
- `japanese-tech-writing` スキル: LLM っぽい表現の禁止・空虚な形容・空虚な動詞等の規範を保持
- 覆盖関係対応表: 未作成（AG-009 カタログ作成時に検討）
