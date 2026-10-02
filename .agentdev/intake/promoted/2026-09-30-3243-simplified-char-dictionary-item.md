# intake: content-corruption checker 簡体字字形ペア辞書への「项」追加候補

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- content-corruption checker の simplified-chinese ルールの字形ペア辞書（实→実、态→状、义→意 の 3 組）に「项」（U+9879 → 正字「項」）が未収録のため、docs/designs/commands/case-run.md 内の「项」3 箇所が自動検出されずに残存していた（Case #3243 の TS-002 手動 grep で検出・是正済み）
- 走査対象自体は docs/designs を含む（Case #3166 RA-007 で拡張済み）ため、辞書拡張が実施されれば同種混入の自動検出が有効になる

## 影響・課題

- 簡体字混入の自動検出の網羅性が辞書の収録状況に依存しており、「项」のような高頻度簡体字の未収録は検出漏れに直結する
- 辞書拡張は content-corruption-checker Design「簡体字検出（simplified-chinese）」節の正規所有範囲（検出シグナル変更）であり、Case #3243 の RA-001（走査範囲の反映）責務境界を超えるため本件では実施されなかった

## 既存要件・成果物との関連

- docs/designs/integrity/content-corruption-checker.md「簡体字検出（simplified-chinese）」節（検出シグナルの正規所有者）
- check_content_corruption.ts（字形ペア辞書の実装）
- integrity/content-corruption-checker.md の file×rule 単位許容例（辞書拡張時の影響確認対象）

## 対応候補

- 「项→項」ペアの辞書追加
- 辞書拡張に伴う既存許容例（file×rule 単位）への影響確認

## 元 item

- 観測日: 2026-09-30
- 観測元: case-close #3243 Capture 回収（PR #3272 本文 Findings。case-run DEL-3243-1 で検出）
- 再導出手段: Case #3243（DEL-3243-1）の PR #3272 本文「Findings / Capture候補」(intake) 項目・「docs-check 走査範囲拡張の評価」節を参照
