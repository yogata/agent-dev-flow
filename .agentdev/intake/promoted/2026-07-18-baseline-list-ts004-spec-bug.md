# baseline 11件 SPEC 追記（件数定義・具体リスト化）と TS-004 spec-bug 調整

## 観測内容
- SPEC `harness-separation-model.md`「baseline 既知違反」サブセクションに baseline 11件の具体リストが未記載。件数定義（ファイル単位 vs マッチ単位）も未明記
- TS-004（配布 command 6ファイル実行制御パラメータ直接記述 0件）が FAIL（16件残留）。Epic #1515「対象外: 配布 command/skill/docs の実装本体改修」と矛盾

## 影響
- TS-001/002 の機械化判定が不可。grep 結果がすべて baseline 扱いか否かの厳密判定ができない
- Epic #1515 の完了条件の TS-004 checkbox は最終 Wave まで未達の可能性
- Issue #1516 は CLOSED/COMPLETED だが、TS-004 は spec-bug 分類

## 課題
- SPEC `harness-separation-model.md` に baseline 11件の具体リストと件数定義（ファイル単位かマッチ単位か）を追記する
- TS-004 spec-bug の対応方針（推奨修正候補 a/b/c のいずれか）を決定し、Issue 本文と Epic 完了条件の整合性を回復する

## 既存要件との関連
- REQ-0162-007
- REQ-0162-008
- Epic #1515
- Issue #1516

## 対応方針の方向性
- baseline 11件の抽出: `check_integrity.ts` または `check_distribution_boundary.ts` の現在の出力から取得
- 件数定義を SPEC に明記し、TS-001/002 判定基準との整合性を取る
- TS-004 spec-bug は下記いずれかの方針を採用:
  - a: Epic 完了条件から TS-004 を外す（対象外明記）
  - b: 16件残留を baseline に追加し TS-004 を pass 扱いにする
  - c: 16件を実装改修で 0件にする（Epic 対象外との整合性確認が必要）
- Epic #1515 進行中のため、早期に方針確定が望ましい

## 出典
- 元 intake item:
  - intake-2026-07-15-1516-baseline-list.md
  - intake-2026-07-15-1516-ts004-spec-bug.md
