# intake: req-impact-map.md の「REQ-004-053〜055」行が存在しない REQ-004-054/055 を参照（dangling reference）

## 発生日

2026-08-15

## 発生元

- Epic: #2119 (REQ-006 分割とレビューループ・非機能前倒し・決定論的実行中核の適用、Wave 3)
- 取得元: case-close 実行（Issue 2122 / PR 2127 クローズ）における PR 本文 `## Findings / Capture候補` intake セクションからの回収

## 問題事象

`docs/specs/responsibilities/req-impact-map.md` の要件行影響表「REQ-004-053〜055」（v3.0.0 移行 9952ec63 由来）が、存在しない REQ-004-054/055 を参照している。Issue 2122（OU-003）で REQ-004-053 が新設されたことで参照先の意味が変化しており、影響マップ行の更新候補となる。本 Issue の対象範囲外のため未対応。

## 影響

- req-impact-map の REQ-004 系行が dangling reference を含み、REQ → 影響ルール/アーティファクトの逆引きが不正確
- 影響マップと rule-ownership の対応確認を行う工程（inspect 系、docs-check）での誤誘導リスク

## 発生局面

完了処理（PR #2127 Findings intake セクション）

## 検知方法

PR #2127 検証時（Issue 2122 / OU-003）の文書確認。REQ-004-050〜053 の新設実在（docs/requirements/REQ-004.md 66〜69行目）と req-impact-map 記載行の突き合わせ

## 想定される対応方向

- (a) 影響マップ行を REQ-004-053 のみへ更新（REQ-004-054/055 参照の削除）
- (b) v3.0.0 移行時の意図（将来行の予約等）を確認のうえ行を再構成
- (a)/(b) の選定は backlog-review で判断する

## 関連

- Epic: #2119
- Issue: 2122（OU-003）, PR: 2127
- 対象文書: `docs/specs/responsibilities/req-impact-map.md`
- 起源 commit: `9952ec63`（v3.0.0 移行）

## 出典引用

PR #2127 本文 `## Findings / Capture候補` intake セクションより:

> `docs/specs/responsibilities/req-impact-map.md` の要件行影響表「REQ-004-053〜055」（v3.0.0 移行 9952ec63 由来）が存在しない REQ-004-054/055 を参照している。本 Issue で REQ-004-053 が新設されたことで参照先の意味が変化しており、影響マップ行の更新候補。本 Issue の対象範囲外のため未対応。

## タグ

#intake #req-impact-map #dangling-reference #req-004 #epic-2119
