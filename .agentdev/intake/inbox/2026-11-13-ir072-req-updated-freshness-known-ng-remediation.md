# IR-072（req-updated-freshness）の既知 NG（frontmatter updated と最終内容変更 commit 日付の不一致）の是正

## 観測事実

- Case #4026 Wave 1（PR #4039）の検証で、IR-072（req-updated-freshness）の base 6d43065de 時点 NG 10〜16 件（REQ-012/REQ-047/REQ-110・Design 10 件以上の updated と最終内容変更 commit 日付の不一致）が観測された。
- PR #4039 は本 PR の updated 進行分 2〜3 件を解消したが（case-close Wave-1 境界の check_integrity NG 対照で req-updated-freshness -2 を確認済み）、残存分は対象外領域として本 PR では修正せず、是正は別検討候補として申告済み。

## 具体的な修正対象

- IR-072 の NG 残存対象 REQ/Design（updated と最終内容変更 commit 日付の不一致）の updated を実施日へ更新する、または IR-072 検査の許容幅（例: 同日内差分の扱い）の規則調整を検討する。
- 意図的な updated 進行を伴う PR では merge 後に IR-072 が新規検出される構造的な性質があるため、updated 更新の運用規則（REQ 更新手順の一手順化）の整備も併せて候補。

## 関連

- Case #4026・PR #4039 本文 Findings / Capture候補（DEL-4029-1）
- IR-072（docs/designs/integrity/rules/IR-072-req-updated-freshness.md）・case-close Wave-1 検証差分コメント（#4029 issuecomment-6832119228）
