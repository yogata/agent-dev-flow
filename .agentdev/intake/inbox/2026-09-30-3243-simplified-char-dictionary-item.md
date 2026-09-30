# intake: content-corruption checker 簡体字字形ペア辞書への「项」追加候補

- 観測日: 2026-09-30
- 観測元: case-close #3243 Capture 回収（PR #3272 本文 Findings。case-run DEL-3243-1 で検出）
- 種別: 変更候補（検出シグナル強化）

## 内容

- content-corruption checker の simplified-chinese ルールの字形ペア辞書（实→実、态→状、义→意 の 3 組）に「项」（U+9879 → 正字「項」）が未収録のため、docs/designs/commands/case-run.md 内の「项」3 箇所が自動検出されずに残存していた（Case #3243 の TS-002 手動 grep で検出・是正済み）。
- 走査対象自体は docs/designs を含む（Case #3166 RA-007 で拡張済み）ため、辞書拡張が実施されれば同種混入の自動検出が有効になる。
- 辞書拡張は content-corruption-checker Design「簡体字検出（simplified-chinese）」節の正規所有範囲（検出シグナル変更）であり、Case #3243 の RA-001（走査範囲の反映）責務境界を超えるため本件では実施しなかった。辞書追加時は「项→項」ペアの追加と、辞書拡張に伴う既存許容例（integrity/content-corruption-checker.md の file×rule 単位許容例）への影響確認が期待される。

## 再導出手段

- Case #3243（DEL-3243-1）の PR #3272 本文「Findings / Capture候補」(intake) 項目・「docs-check 走査範囲拡張の評価」節を参照。
- 対応候補先: docs/designs/integrity/content-corruption-checker.md「簡体字検出（simplified-chinese）」節、check_content_corruption.ts の字形ペア辞書。
