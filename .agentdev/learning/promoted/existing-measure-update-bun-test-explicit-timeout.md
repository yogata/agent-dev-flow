# bun test 既定 5 秒 timeout の suite 負荷 flake 対策を明示 timeout 設定へ反映する

## 背景

bun test 既定 timeout 5 秒に対し、フル suite 実行時の並列負荷で個別テストの実行時間が約 2 倍に増幅され、非決定的に timeout する flake が Epic #3530 Wave 1（Case #3532）と Wave 2-2（Case #3534）で連続再現し、さらに Wave 2-5（Case #3537）でも workflow_body_contract.test.ts が同名の flake を起こした（単独実行は 2.3〜2.5 秒で常に pass。3 回のフル再実行コスト発生）。

## 問題

scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts に明示 timeout 記述がない（grep 実測 0 件）。agentdev-quality-gates の bun test 実行形態契約にも suite 負荷による既定 timeout 増幅の注意がない。

## 望ましい変更

workflow_body_contract.test.ts へ明示 timeout 設定（例: 30 秒）を追加する。あわせて bun test 実行形態契約へ「フル suite 並列負荷で個別テスト実行時間が増幅し既定 5 秒 timeout を超え得る。重いテストには明示 timeout または先行/分割実行」の注記を追加する。

## 対象範囲

### 対象
- scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts
- src/common/skills/agentdev-quality-gates/references/（bun test 実行形態契約）

### 対象外
- 他の重いテストの個別対応（発見順に個別対応）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| repo-local test | scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts | 明示 timeout 設定 |
| 配布skill reference | src/common/skills/agentdev-quality-gates/references/ | suite 負荷 timeout の注記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: bun test 実行形態契約（単独実行・root 実行等）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 明示 timeout 記述なし（grep 0 件・実測）、suite 負荷増幅の注意なし

## 制約

- timeout 値の選定は実行環境の実測に基づく（30 秒は候補値）

## 受け入れ条件

- [ ] workflow_body_contract.test.ts に明示 timeout が設定される
- [ ] 実行形態契約に suite 負荷 timeout の注記が追加される
- [ ] フル suite 実行で当該 flake が再現しないことが確認される

## 元learning item / 根拠

- **要約**: bun test 既定 5 秒 timeout の suite 負荷相互作用 flake（2エントリ: Case #3532/#3534 + #3537 で 3 Case 実証）
- **根拠**: 単独実行 2.3〜2.5 秒常時 pass vs フル suite で増幅 timeout。2 Case 連続再現の実績
- **再発条件**: 分割③ フル suite 実行
- **横展開可能性**: 並列テストランナーの負荷相互作用一般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, flaky-test
- **関連Issue**: なし
