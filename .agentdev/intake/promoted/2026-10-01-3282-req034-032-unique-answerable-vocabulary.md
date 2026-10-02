# intake: REQ-034-032（bounded parent decision resolution 正典行）の「一意に回答可能」語彙の新モデル語彙移行候補

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- REQ-034-032（case-auto の bounded parent decision resolution の正典行）に「現行正規成果物（…）から一意に回答可能な場合はユーザー停止せず回答して下位 command を resume させること」という旧判断モデル語彙（一意性中心）が残存している
- Issue #3282（RA-003）の対象範囲は REQ-034-038 のみのため本行は意図的に未変更であり、PR #3286 が intake 候補として申告した
- v4-delegation-contracts.md:185 側は同 PR で「正規契約から導出可能」へ語彙化済みであり、正典行側のみ旧語彙が残る非対称状態

## 影響・課題

- 正典 REQ 行と Design の語彙非対称は、判断モデル（REQ-096）の移行完了度を損なう
- 将来の語彙横断パス（REQ-096 判定表語彙への全正典行移行）の対象行として確定しておく必要がある

## 既存要件・成果物との関連

- REQ-096（判断方法3分類・確定権限3分類の正典）
- REQ-096-014（case-auto の委譲された裁量）
- docs/designs/workflows/v4-delegation-contracts.md:185 付近（「正規契約から導出可能」語彙化済み行）

## 対応候補

- REQ-034-032 を REQ-096 の新モデル語彙（正規契約からの導出 / 委譲された裁量の範囲）へ語彙移行し、v4-delegation-contracts.md 側との対称性を回復する
- 語彙横断パスの候補行として処理する

## 元 item

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 2 case-close Capture 回収（PR #3286 本文 Findings。Issue #3282 / RA-003 で検出）
- 再導出手段: PR #3286 本文「Findings / Capture候補」第1項を参照。docs/requirements/REQ-034.md:48（REQ-034-032 行）と docs/designs/workflows/v4-delegation-contracts.md:185 付近の対照で再導出可能
