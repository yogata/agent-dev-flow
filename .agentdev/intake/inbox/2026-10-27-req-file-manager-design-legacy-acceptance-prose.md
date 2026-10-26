# 2026-10-27 agentdev-req-file-manager Design の旧受理記述（L64〜74）の canonical DRIFT 解消（Definition Amendment 候補）

## 内容

- docs/designs/skills/agentdev-req-file-manager.md L64〜74 の「3桁と4桁の両形式を認識する（d{3,4}）」「新規採番結果は4桁へ正規化」の記述が、実装（DEC-062 後の単一共通実装・桁数上限なし・pad3/pad4 最小幅表示）と矛盾したまま残っている
- PR #3865（Definition Amendment）は同ファイル L40 の修正のみで、L64〜74 は改訂対象外だった。修正には Definition 変更（case-revise 経由の再合意）が必要なため、本 Case では編集せず後続 amendment 候補として記録した
- 作業候補: req-define で当該記述の再合意を確定した上で case-revise → case-ready 経由で Design 文言を現行受理意味論（形式妥当性のみ・桁数上限なし・最小幅表示）へ更新する

## 根拠

- 観測元: PR #3864 本文「Findings / Capture候補（2026-10-26 修正ラウンド）」セクション
- 関連: Case #3862、Definition Amendment PR #3865（merged 68f5492ad）、DEC-062（accepted）

---
