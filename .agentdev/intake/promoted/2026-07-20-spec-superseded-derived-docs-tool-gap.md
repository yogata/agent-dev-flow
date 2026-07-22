# SPEC superseded status の派生文書・ツール反映不備

## 観測内容

REQ-0101-076 により SPEC lifecycle に `superseded` が追加されたが、派生文書と整合性検査ツールの一部が未更新である。2点の不備を観測した。

1. `docs/specs/README.md` の SPEC status 追跡情報源節に「status 値: ADR-0123 で定義される draft / accepted のみ」との記載がある。REQ-0101-076 により SPEC lifecycle に `superseded` が追加されており、当該記述は現在 stale である。Issue #1638 のスコープ（SC-003 superseded 表示是正）を超えるため未更新のまま残置された。
2. `check_changed_docs.ts:551-561`（checkSpecFrontmatter）は SPEC status を `draft`/`accepted` のみ有効と判定し、`superseded` を warning 扱いする。REQ-0101-077 は superseded 宣言された SPEC を docs-check/inspect-docs の検査対象外とすることを規定するが、ツール実装が追従していない。

- 由来 PR: #1644（squash merge: fdfba0cf）
- 由来 Issue: #1638
- Epic: #1635 Wave 2

## 影響

重要度: medium。SPEC status 定義と派生文書・検査ツールの乖離が継続する。superseded 宣言された SPEC が docs-check で誤って検査対象になり得る（REQ-0101-077 違反）。README の status 記述が実態と不一致のまま読者に誤情報を提供する。

## 課題

REQ-0101-076/077 の SPEC lifecycle 拡張に対し、派生文書（README）と検査ツール（check_changed_docs.ts）の追従が漏れている。SPEC（要件定義）→派生文書・ツールの伝播経路に抜けがある。

## 既存要件・仕様との関連

- REQ-0101-076（SPEC lifecycle superseded 追加）: 定義元。派生文書・ツールがこれに未追従（矛盾・陳腐化）。
- REQ-0101-077（superseded SPEC の docs-check 検査対象外）: 規定元。check_changed_docs.ts が未実装（差分）。
- ADR-0123（SPEC status 定義、draft/accepted）: superseded 追加前の定義。README がこれを参照したまま stale。

## 対応方針の方向性

1. `docs/specs/README.md` の更新: SPEC status 値記述へ `superseded` を追加。ADR-0123 参照を REQ-0101-076 へ更新または併記。
2. `check_changed_docs.ts` の更新: checkSpecFrontmatter で `superseded` を有効 status として扱う。superseded SPEC の docs-check 検査対象外を実装（REQ-0101-077 準拠）。

Wave 3 #1641（OU-006: 派生文書の再生成と docs-check 最終確認）で対応可能。
