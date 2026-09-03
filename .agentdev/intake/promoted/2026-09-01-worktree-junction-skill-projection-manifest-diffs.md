# worktree junction 環境での skill-projection-manifest 突合検出差分の扱い

## 観測内容

worktree 環境（.opencode/ junction 未伝播）では skill-projection-manifest 突合の検出差分（4件 NG）が現れる。REQ-018 worktree 制約に基づく環境差であり、Epic #2497 Wave 1（Issue #2498）では検知を記録したのみ。

恒久対応の要否は Issue #2498 の対象範囲外（PR 本文に明記）。環境差の吸収要否は checker 側の判断事項であり、case-close の capture 責務は回収・保存までだった。

## 影響

worktree 内で check_integrity 系検証を実行すると、junction 未伝播に起因する manifest 突合 NG が常時現れ、本来の変更起因の検出と混在し得る。

## 課題（レビューで決めること）

- skill-projection-manifest 突合検査を worktree 環境でどう扱うか（junction 伝播の前提化、検査除外、環境差としての baseline 化のいずれか）
- REQ-018 worktree 制約との整合の確認

## 既存要件・契約との関連

- REQ-018（worktree 構造的制約とテスト fallback）、skill-projection-manifest 突合検査（check_integrity、IR-068 関連）。
- 関連 item: IR-068 checker の third-party Skill 許容拡張（2026-09-02、同じ skill-projection-manifest 突合検査の検出扱い課題）。

## 根拠

- PR #2501 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2501 ）
