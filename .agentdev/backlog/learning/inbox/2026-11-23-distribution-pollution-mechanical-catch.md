---
id: 2026-11-23-distribution-pollution-mechanical-catch
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4210 本文 Findings の回収)
status: unreviewed
---

# 配布物ゼロ汚染の機械検査が実害を fail-closed で捕捉した実例

- **問題事象**: PR #4210 の実装中、配布物（workflow SKILL.md）の usage コメント例へ docs/ パスが混入したが、既存の機械検査 `workflow_body_contract` が fail-closed で捕捉し、コミット前に修正された。REQ-102-005（配布物ゼロ汚染）の機械強制が実効している実例。
- **発生局面**: 読取集約スクリプト追加（PR #4210・REQ-125-006・2026-11-22）
- **検知方法**: bun test ./scripts/ の workflow_body_contract fail（修正後の単独再検証 13 pass / 0 fail）
- **効果の確認**: REQ-125-008 の検証義務（配布物本文への開発用 ID・docs/ 参照の混入 0 件）を機械検査が直接支えており、トレーサビリティ check が pass 12 / fail 0 を維持できた背景の一つ
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 検査が有効に働いた具体例の蓄積は、同種検査の維持判断（Zero-Base Filter で「今日作るか」を問うときの根拠）に使える
- **再発条件**: 該当なし（検査が正しく働いた実例の記録）
- **予防策候補**: なし
- **想定反映先**: learning-promote での評価、REQ-102 関連の維持根拠としての参照
- **関連**: `.agentdev/learning/inbox/2026-11-23-cross-component-pin-full-run-detection.md`（同じく機械検査の捕捉実例）
- **タグ**: `#配布物` `#ゼロ汚染` `#機械検査` `#fail-closed`
