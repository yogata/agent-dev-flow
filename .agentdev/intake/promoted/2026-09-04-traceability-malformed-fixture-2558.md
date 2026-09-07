# traceability check による malformed fixture 誤検出

## 観測内容
PR #2578 の回帰テスト fixture `REQ-\\u0030\\u0031` が、実宣言ではないにもかかわらず traceability の corpus 走査で既知ロールの malformed declaration として検出される。

## 影響
fail-closed 回帰テストを保持したままでは malformed-declarations が常時1件となり、検証結果が false fail になる。

## 課題
fixture を文字列連結等で走査時に完全宣言として見えない構築へ変更するか、テスト除外または検査対象宣言 exemption を checker 側へ適用するかを判断する。E4-1 の再検証範囲も確認する。

## 既存要件・正規成果物との関連
Issue #2558、PR #2578（82186d71）、`distribution-boundary.test.ts` 1367行目、REQ-057-023。
