# case-auto.md が capture-boundaries 参照を欠く（CaptureBoundary NG）

## 観測内容
- `check_integrity.ts` の CaptureBoundary 検査が `case-auto.md` を NG として検出
- case-auto は PR 作成・Issue クローズを伴う command であるにもかかわらず、capture-boundaries 参照を欠いている

## 影響
- case-auto 実行時にキャプチャ境界の取り扱いが明示されておらず、capture 対象・対象外の判断が実行時都度に委ねられる
- 他の agentdev command（case-open, case-close, case-run 等）との一貫性がない

## 課題
- `src/opencode/commands/agentdev/case-auto.md` に capture-boundaries への参照を追加する

## 既存要件との関連
- REQ-0105: Intake / Learning / Backlog lifecycle（キャプチャ境界）
- SPEC: `docs/specs/workflows/capture-boundaries.md`

## 対応方針の方向性
- case-open / case-close / case-run の capture-boundaries 参照記述を参考に、case-auto にも同様の節を追加
- 追記後に `check_integrity.ts` で該当 NG が解消したことを確認

## 出典
- 元 intake item: intake-2026-07-18-1337-case-auto-missing-capture-boundaries-ref.md
