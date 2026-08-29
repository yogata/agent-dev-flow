# IR-055 baseline 未管理の strict 違反: agentdev-workflow-third-party-sync/SKILL.md:89 の DEC-023 参照

## 観測

`src/opencode/skills/agentdev-workflow-third-party-sync/SKILL.md:89` が `DEC-023` を参照するが、IR-055 baseline に未登録のため strict 違反 1 件が発生している（"New strict violation: DEC-NNN reference 'DEC-023' detected (IR-055 delta from baseline)"）。

- 発生源は Wave 1 PR #2457（squash commit dbe16aa5、third-party-sync command と Workflow Skill の新設）
- Wave 2 の 5 PR（#2460〜#2464）は当該ファイルに触れておらず、悪化なし
- Epic #2446 Wave 2 case-close 実施時に main HEAD（005d05dd）で確認

## 今回扱わない理由

Epic #2446 の子 Issue の変更対象成果物外（#2457 由来の既存条件）。case-close は検証差分の記録と intake 回収のみを行い、修正しない。

## 影響

check_integrity（IR-055 runtime-unresolved-reference）が baseline delta として strict 違反 1 件を報告し続ける。IR-055 を完了条件に持つ後続 Case で誤検知のように見える残存ノイズになる。

## レビューで決めること

- IR-055 baseline への該当エントリ登録（baseline 更新）と、参照文言の是正（Distribution 内での concrete-id 記述方法の変更）のどちらで解消するか
- 登録する場合の baseline エントリの正当性根拠の記録方法

## 根拠

- PR #2464 本文「Findings / Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2464 ）
- Epic #2446 Wave 2 case-close 検証差分（Issue #2451〜#2455 対応記録コメント）
