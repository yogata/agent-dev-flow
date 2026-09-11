# worktree fallback 運用開始に伴う main 既知違反の ng-baseline / exemptions 登録判断

## 概要

case 2777 で checker の worktree SoT fallback（junction 未伝播時の src/opencode 直参照）が実装され、worktree の case-run 前段で IR-062 等が常時発火するようになった。これにより main 既知の違反が全 case の前段で可視化されるため、ng-baseline への正式登録・修復・exemptions 登録のいずれかへの対応判断が残課題。

## 内容

- main 既知の IR-062 ng 15 件（agentdev-inspect-skills の `references/contracts.md` 参照。contracts.md は main の src/projection 双方に不在）が worktree fallback 運用開始により case-run 前段で常時検出される。ng-baseline への正式登録（`--update-ng-baseline --ng-baseline-additions` 手順）は case 2777 の対象範囲外のため未実施
- 同様に main 既知の warning 2 件が前段可視化される: IR-053（single.md の `gh issue edit` 直接呼び出し・agentdev_gh Custom Tool 経由へ迂回すべき）と obsolete-vocabulary（agentdev-artifact-validation の `REQ/ADR/` 語彙）。修復または baseline / exemptions 登録の判断先が未決
- 参考: case-close 再検証（2026-09-12）で main（881acb56 マージ直前 4dcf3d16・junction 環境）と worktree（4e23a7d1・fallback 環境）の双方で同一違反を確認。main のみで追加検出される agentdev-doc-writing projection ng 1 件（junction 投影環境固有・base 既知）あり

## 根拠

- 観測元: PR 2778（case 2777 / issue 2777、`## Findings / Capture候補` intake セクション）、case-close（2026-09-12）で回収
- 元テキスト: 「worktree fallback 運用開始により、main 既知の IR-062 ng 15 件（agentdev-inspect-skills の references/contracts.md 参照）が case-run 前段で常時見えるようになる。ng-baseline への正式登録（--update-ng-baseline --ng-baseline-additions 手順）は本 case 対象範囲外のため、baseline 運用への反映判断が残課題」および「同様に main 既知の warning 2 件（IR-053 single.md gh issue edit・obsolete-vocabulary agentdev-artifact-validation）が前段可視化される。修復または baseline/exemptions 登録の判断先が未決」
