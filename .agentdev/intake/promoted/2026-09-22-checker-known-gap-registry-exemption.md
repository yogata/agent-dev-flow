# checker の broken-req-ref / adr-req-crossref が既知欠番レジストリを考慮しない構造衝突の解消

## 観測内容

Case #3056（REQ-090 Jev 先行評価 Stage 1）の Definition PR #3057 において、AG-011（REQ-089 を既知の欠番として 3 ファイルへ記録し、新規 REQ は REQ-090 を採用）に従い欠番明記を行った結果、check_integrity（source profile）が新規 NG 3 件を検出した:

- adr-req-crossref: REQ-089 referenced in DEC-040.md but REQ file does not exist
- broken-req-ref: REQ-090.md の REQ-089 参照
- broken-req-ref: docs/README.md の REQ-089 参照（欠番明記行そのもの）

REQ-089 は完全 revert 済みで active/retired のいずれにもファイルが存在しないため、numbering-policy「既知の欠番」節への正規の欠番記録（REQ-087-002 義務）と broken-req-ref / adr-req-crossref の「active または retired ファイル存在」判定が構造的に衝突する。既知欠番 REQ-063〜081 は範囲表現（isRefOnlyInsideRangeSpan 免除）でのみ参照されており、単体番号の欠番明記は Case #3056 が初の恒久記録である。

## 影響

- AG-011 / REQ-087-002 に従った正規の欠番記録が checker 上で偽陽性 NG となるため、今後の欠番発生 Case で同種 NG 3 件が毎回検出され、実測増減の説明コストとゲート判断のノイズになる。
- 欠番明記の運用と検証基盤の整合が取れない状態が恒常化する。

## 課題（改善要求）

`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` の broken-req-ref / adr-req-crossref 検出において、numbering-policy.md「既知の欠番」節の行頭 `REQ-NNN:` エントリ（alloc-req-number.ts と同一の欠番レジストリ形式）を読み込み、既知欠番への参照を合格扱いにする免除を追加する。alloc-req-number.ts との欠番レジストリ単一情報源化を図る。

## 既存要件との関連

- REQ-087（採番例外の記録と REQ 番号ギャップ検査）— REQ-087-002 の欠番記録義務と checker 判定の衝突解消
- numbering-policy「既知の欠番」節 — 免除の正規情報源
- DEC-040（REQ-089 を参照した Decision）— 検出対象の参照元

## 出典

- intake item: `.agentdev/intake/inbox/intake-checker-known-gap-registry.md`（source: case-open-deviation、Case #3056、PR #3057、captured_at: 2026-09-22）
- Definition PR #3057 では合意済み本文を変更せず、実測 NG として記録し route: intake で処理
