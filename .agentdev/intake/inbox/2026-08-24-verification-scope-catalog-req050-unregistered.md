# verification-scope-catalog に REQ-050 の判定エントリが未登録

## 観測

case-run の traceability check（PR #2416、Issue 2415、REQ-050 実装）で、`docs/designs/foundations/references/verification-scope-catalog.md` に REQ-050（REQ-050-001〜014）の判定エントリが未登録であることを検出した。Issue #2362 による検証対応要否カタログの棚卸しは REQ-044 まで実施済みであり、REQ-050 は棚卸し対象外のまま追加された。REQ-050 の動作系要件行（モード提供、誤実行防止等）の検証対応要否の棚卸し判断が未実施の状態である（PR #2416 本文「Findings / Capture候補」intake）。

## 今回扱わない理由

検証対応要否カタログの行登録は traceability-model / 検証スコープ運用の責務であり、実装 PR（case-run）の変更範囲に含めない。REQ-050 の QG-4 評価は TS-001〜TS-013 の検証実績とフル suite 2619 pass で担保済みであり、マージは阻断していない。

## 影響

agentdev-traceability check において、REQ-050 の未登録行は検証対応必須扱いで評価される。REQ-050 の動作系行に検証対応任意行が相当する場合、check の見かけ上の未解決不合格として残存する可能性がある（missing-verification は今回全行 pass であったが、これは PR 本文の検証記録を verification 証拠とする評価に依存する）。

## レビューで決めること

- REQ-050-001〜014 の検証対応要否の行別判定（動作系行〔モード・誤実行防止・check 能力等〕を検証対応任意行とするか、必須のまま TS 記録と紐付けるか）
- verification-scope-catalog.md への REQ-050 行登録の実施単位（Issue #2362 系列の棚卸し案件に加えるか、個別に処理するか）

## 根拠

- PR #2416 本文「Findings / Capture候補」intake 2件目（発見元: traceability check）
- docs/designs/foundations/references/verification-scope-catalog.md（REQ-044 まで登録、REQ-050 未登録）
- Issue #2362（検証対応要否カタログ棚卸し、REQ-044 まで実施の前例）
