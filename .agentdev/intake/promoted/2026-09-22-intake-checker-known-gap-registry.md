# broken-req-ref / adr-req-crossref が numbering-policy 既知欠番レジストリを考慮しない

## 観測内容

Case #3056（REQ-090 Jev 先行評価 Stage 1）の Definition PR #3057 において、AG-011（REQ-089 を既知の欠番として 3 ファイルへ記録し、新規 REQ は REQ-090 を採用）に従い欠番明記を行った結果、check_integrity（source profile）が新規 NG 3 件を検出した:

- adr-req-crossref: REQ-089 referenced in DEC-040.md but REQ file does not exist
- broken-req-ref: REQ-090.md の REQ-089 参照
- broken-req-ref: docs/README.md の REQ-089 参照（欠番明記行そのもの）

REQ-089 は完全 revert 済みで active/retired のいずれにもファイルが存在せず、numbering-policy「既知の欠番」節への正規の欠番記録（REQ-087-002 義務）と broken-req-ref / adr-req-crossref の「active または retired ファイル存在」判定が構造的に衝突する。既知欠番 REQ-063〜081 は範囲表現（isRefOnlyInsideRangeSpan 免除）でのみ参照されており、単体番号の欠番明記は本 Case が初の恒久記録となる。2026-09-22 の intake-promote 実行時に check_integrity.ts の現行実装を再確認し、broken-req-ref 判定は active/retired ファイル存在チェックのみで行われ（range span 免除のみで既知欠番レジストリ読込の免除は未実装）であることを確認済み。解決済み問題ではない。

## 影響

- numbering-policy「既知の欠番」節への正規の欠番記録を行うと、check_integrity が source profile で恒久的に NG を出し続ける
- 誤検出回避のため欠番記録を省略すると、REQ-087-002（無記録の欠番検出）に違反する。REQ-087-002 の義務と checker が構造的に衝突したままのため、将来の欠番記録毎に同様の誤検出が再発する

## 課題

- broken-req-ref / adr-req-crossref 検出が、numbering-policy.md「既知の欠番」節の欠番レジストリを情報源として考慮していない

## 提案する修正

- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` の broken-req-ref / adr-req-crossref 検出において、numbering-policy.md「既知の欠番」節の行頭 `REQ-NNN:` エントリ（alloc-req-number.ts と同一の欠番レジストリ形式）を読み込み、既知欠番への参照を合格扱いにする免除を追加する（alloc-req-number.ts との欠番レジストリ単一情報源化）

## 既存要件との関連

- REQ-087（採番例外の記録と REQ 番号ギャップ検査）: REQ-087-002/003 による欠番記録義務と checker 判定の整合が本件の論点。REQ は要求を既に保持しており、REQ の作成・拡張は不要
- numbering-policy「既知の欠番」節（欠番レジストリの正規配置）
- 関連観測源: Case #3056、Definition PR #3057（case-open deviation。合意済み本文を変更せず、実測 NG として記録し route: intake で処理済み）

## 分類根拠

- change_nature: nonconformance_fix（REQ-087-002 の欠番記録義務と checker 判定の不適合修正。単体番号の欠番明記が初の恒久記録であるエッジケース側面を含むが、不適合修正を主とする）
- req_impact: no
- target_stakeholder: 開発者（integrity checker の運用者、ドキュメント管理者）
- user_visible_change: no
- canonical_owner: repo-agentdev-integrity（check_integrity.ts の broken-req-ref / adr-req-crossref 検出）
- observed_evidence: PR #3057 での欠番明記（AG-011）に伴う check_integrity source profile の新規 NG 3 件。2026-09-22 時点で現行実装に既知欠番免除なしを確認済み

## 元 intake item

- .agentdev/intake/inbox/intake-checker-known-gap-registry.md（source: case-open-deviation、Case #3056 / PR #3057、captured 2026-09-22）
