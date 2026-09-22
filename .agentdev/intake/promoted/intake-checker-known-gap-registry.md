# broken-req-ref / adr-req-crossref が numbering-policy 既知欠番レジストリを考慮しない

## 観測内容

Case #3056（REQ-090 Jev 先行評価 Stage 1）の Definition PR #3057 において、AG-011（REQ-089 を既知の欠番として 3 ファイルへ記録し、新規 REQ は REQ-090 を採用）に従い欠番明記を行った結果、check_integrity（source profile）が新規 NG 3 件を検出した:

- adr-req-crossref: REQ-089 referenced in DEC-040.md but REQ file does not exist
- broken-req-ref: REQ-090.md の REQ-089 参照
- broken-req-ref: docs/README.md の REQ-089 参照（欠番明記行そのもの）

REQ-089 は完全 revert 済みで active/retired のいずれにもファイルが存在しないため、numbering-policy「既知の欠番」節への正規の欠番記録（REQ-087-002 義務）と broken-req-ref / adr-req-crossref の「active または retired ファイル存在」判定が構造的に衝突する。既知欠番 REQ-063〜081 は範囲表現（isRefOnlyInsideRangeSpan 免除）でのみ参照されており、単体番号の欠番明記は本 Case が初の恒久記録となる。

adversarial-review の技術検証による実装確認（2026-09-22 時点、check_integrity.ts）:

- broken-req-ref の免除は isTemplateLike / isDeletionSelfReference / isRefOnlyInsideRangeSpan（範囲表現 span 内のみの参照を免除）のみで、欠番レジストリの読込は存在しない。
- adr-req-crossref は active + retired の REQ ファイル名集合による存在判定のみで、isRefOnlyInsideRangeSpan も欠番レジストリも未適用。
- IR-069 の欠番明記検査は「無記録の欠番」の検出（両 README 明記の必須性検査）であり、既知欠番への参照を合格扱いにする機構ではない（目的が異なる）。
- 欠番レジストリ（numbering-policy「既知の欠番」節の行頭 `REQ-NNN:` エントリ）を読み込む既存実装は採番スクリプト alloc-req-number.ts（extractKnownGapNumbers）側のみであり、checker 側は未接続。

## 影響

- REQ-087-002 の記録義務を正しく履行するたびに、broken-req-ref / adr-req-crossref が偽陽性 NG を発生させる。既知欠番の恒久記録と checker の合格判定が構造的に両立しない。
- checker の信頼性を損ない、正規の記録作業が毎回 NG 対応（実測 NG としての記録・route 判定）を強制される運用コストが継続する。

## 課題

- 欠番レジストリの単一情報源化（numbering-policy「既知の欠番」節）が採番スクリプト側でのみ実装されており、checker 側が同一レジストリを共有していない。
- 提案の免除形式（行頭 `REQ-NNN:` エントリ読込）は現行レジストリの実体と整合する。REQ-063〜081 は範囲表現のため行頭単体エントリの対象外で、REQ-089 のみが行頭単体エントリとして正規表現で拾える。

## 提案する修正対象

- check_integrity.ts の broken-req-ref / adr-req-crossref 検出において、numbering-policy.md「既知の欠番」節の行頭 `REQ-NNN:` エントリ（alloc-req-number.ts と同一の欠番レジストリ形式）を読み込み、既知欠番への参照を合格扱いにする免除を追加する（alloc-req-number.ts との欠番レジストリ単一情報源化）。

## 既存要件との関連

- REQ-087（採番例外の記録と REQ 番号ギャップ検査。REQ-087-002 が既知欠番の記録と無記録の機械検出を義務付け）、numbering-policy「既知の欠番」節（採番スクリプトによるレジストリ読込を規定）。本提案は当該 REQ 群の実装面のギャップ解消であり、REQ 本文の変更を含まない。

## 出典

- case-open-deviation、Case #3056 / PR #3057、captured_at 2026-09-22。
- Definition PR #3057 では合意済み本文を変更せず、実測 NG として記録し intake 経路で処理済み。
