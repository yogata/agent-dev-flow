# agentdev-req-file-manager Design の旧受理記述（L64〜74）の canonical DRIFT 解消（Definition Amendment 候補）

## 観測内容

- docs/designs/skills/agentdev-req-file-manager.md L64〜74 の「3桁と4桁の両形式を認識する（d{3,4}）」「新規採番結果は4桁へ正規化」の記述が、実装（DEC-062 後の単一共通実装・桁数上限なし・pad3/pad4 最小幅表示）と矛盾したまま残っている
- PR #3865（Definition Amendment）は同ファイル L40 の修正のみで、L64〜74 は改訂対象外だった

## 影響

- canonical Design と実装の矛盾が残り、旧帯（桁数上限あり）の誤った受理意味論の再導入リスクになる。

## 課題

- req-define で当該記述の再合意を確定した上で case-revise → case-ready 経由で Design 文言を現行受理意味論（形式妥当性のみ・桁数上限なし・最小幅表示）へ更新する

## 既存要件との関連

- DEC-062（accepted）、Definition Amendment PR #3865（merged 68f5492ad）、Case #3862

## 出典

- 観測元: PR #3864 本文「Findings / Capture候補（2026-10-26 修正ラウンド）」セクション
