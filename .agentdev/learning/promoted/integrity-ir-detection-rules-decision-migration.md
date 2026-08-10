# IR-005/036/055 検出ルールの ADR → Decision 移行残存修復

## 背景

ADR → Decision の大規模 rename 移行（DEC-009）を実施したが、検証ルール IR-005、IR-036、IR-055 が ADR 語彙・旧責務のまま残存している。特に IR-055 は Decision ID を説明しながら正規表現が `ADR-\d{4}` のまま残っている。これにより検証基盤が ADR 参照残存を検出できず（false negative）、移行の網羅性担保が機能していない。現在進行中のギャップ。

## 問題

- IR-005（ADR-REQ 双方向参照）: 本文が ADR 語彙・旧責務のまま
- IR-036（ADR 作業手段検出）: 本文が ADR 語彙・旧責務のまま
- IR-055（runtime 未解決参照）: Decision ID と説明しながら正規表現が `ADR-\d{4}` のまま
- check_integrity.ts: 上記ルールを呼び出す実装

検証基盤の false negative により、ADR 参照残存を検出できず、将来の参照破壊に気づけない。

## 望ましい変更

1. IR-005、IR-036、IR-055 のルール本文を Decision 移行後の語彙・責務へ更新
2. IR-055 の正規表現を `ADR-\d{4}` から Decision 識別子形式（`DEC-\d{3}` 等、現在の Decision 命名規約に従う）へ更新
3. check_integrity.ts の対応する検出ロジックを Decision 形式へ更新
4. 更新後に ADR 参照残存を検出できることをテストで確認

## 対象範囲

### 対象

- `docs/specs/integrity/rules/IR-005-adr-req-bidirectional-reference.md`
- `docs/specs/integrity/rules/IR-036-adr-work-means-detection.md`
- `docs/specs/integrity/rules/IR-055-runtime-unresolved-reference.md`
- `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`

### 対象外

- 過去の ADR 文書（`docs/decisions/` 配下）自体の修正
- IR ルールの意味論的責務の変更（語彙・形式の移行のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/specs/integrity/rules/IR-005-adr-req-bidirectional-reference.md | ADR → Decision 語彙・責務へ更新（記事タイトル・本文・検出対象 ID 形式）|
| spec | docs/specs/integrity/rules/IR-036-adr-work-means-detection.md | ADR → Decision 語彙・責務へ更新 |
| spec | docs/specs/integrity/rules/IR-055-runtime-unresolved-reference.md | Decision ID 説明へ訂正、正規表現 `ADR-\d{4}` → Decision 形式へ更新 |
| code | src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts | 対応する検出ロジックを Decision 形式へ更新 |

## 既存対策確認

- **確認結果**: 既存対策あり（移行途中）
- **該当ファイル**: IR-005、IR-036、IR-055、check_integrity.ts
- **ギャップ分類**: fix gap
- **ギャップ詳細**: ADR → Decision 移行が実施されたが検証ルール自体の移行が未完了。IR-005/036 は ADR 語彙・旧責務のまま、IR-055 は正規表現が `ADR-\d{4}` のまで Decision 移行残存

## 制約

- IR ルールの意味論的責務は維持し、語彙・形式のみを移行する
- check_integrity.ts の変更は下位互換性を保つ（過去ログとの整合性）。必要に応じて ADR 形式と Decision 形式の両方を検出できる移行期間を設ける
- ADR → Decision 移行は DEC-009 AG-010/016 の履歴参照保護契約に従う（v2:ADR-* 履歴参照を破壊しない）

## 受け入れ条件

- [ ] IR-005 のルール本文が Decision 語彙・責務へ更新されている
- [ ] IR-036 のルール本文が Decision 語彙・責務へ更新されている
- [ ] IR-055 のルール本文が Decision 語彙・責務へ更新され、正規表現が Decision 形式へ更新されている
- [ ] check_integrity.ts の該当検出ロジックが Decision 形式へ更新されている
- [ ] ADR 参照残存を検出するテストが追加されている（意図的に ADR 参照を残した fixture で false negative 解消を確認）

## 元learning item / 根拠

- **要約**: ADR → Decision 大規模 rename 移行で検証ルール自体の移行対象網羅を管理するチェックリストが不明瞭
- **根拠**: ADR → Decision 移行後も IR-005/036/055 が ADR 語彙・旧責務のまま残存。IR-055 は Decision ID と説明しながら正規表現が `ADR-\d{4}` のまま
- **再発条件**: 現在進行中。ADR 参照残存を検出できず false negative
- **横展開可能性**: 高い。IR-* ルール網羅性は全 rename 移行で問題となる

### source entry（個別証拠）

- **title**: 横断 grep パターン設計の改善余地 — IR-005/036/055 ADR 残存
- **観測事実**: ADR → Decision 移行後も IR-005/036/055 が ADR 語彙・旧責務のまま残存。IR-055 は Decision ID と説明しながら正規表現が `ADR-\d{4}` のまま
- **関連PR/Issue**: 別 Issue で対応予定（残留リスクとして明記）
- **対象 path**: `docs/specs/integrity/rules/IR-005-*`, `IR-036-*`, `IR-055-*`, `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- **再発条件**: 現在進行中（未解決）
- **処分**: staged（高優先）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, integrity, decision-migration
- **関連Issue**: なし（新規起票推奨。別 Issue で対応予定の記録あり）
