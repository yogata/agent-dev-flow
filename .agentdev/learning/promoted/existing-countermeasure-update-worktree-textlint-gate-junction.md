# existing-countermeasure-update: worktree 構造的制約手順の plugins 系 junction 実体（textlint gate）適用追記

## 背景

PR #3074 case-run（Case #3063・Issue #3068）の worktree で文書品質査読（textlint 最終 gate）を実行しようとしたところ、worktree では `.opencode/plugins/`（agentdev-textlint-guard の gate.ts 実体）が junction 未伝播のため gate を直接実行できなかった。メインリポジトリ root の gate.ts 実行 + 検査対象 root に worktree を指定する方式で代替し完遂した。同族事例として、worktree での targeted docs guard・traceability check・契約テスト実行不能が 2026-09-05 以降に2回記録されている（本件が3事例目）。

## 問題

REQ-018-005 と `agentdev-git-worktree` worktree-operations.md L172-202「main root 実体 + --root 指定による読取系 checker 実行手順」の汎用手順は「**junction 系 skill scripts**」を対象とし、実行例は targeted docs guard・traceability check・契約テスト（いずれも `.opencode/skills/agentdev-*` 配下 scripts）に限定されている。textlint gate 等 **plugins 配下の junction 実体**（実体 `src/opencode/plugins/agentdev-textlint-guard/gate.ts` を投影する `.opencode/plugins/agentdev-textlint-guard/gate.ts`）の実行代替（main root 実体起動 + 検査対象 root 指定）は未明文化で、gate 実行者が毎回構造的制約を自力で解決する事態が繰り返される。

## 望ましい変更

worktree-operations.md 構造的制約節（main root 実体 + --root 指定手順）に、plugins 配下 junction 実体（textlint gate gate.ts）への適用を追記する。main root 実体から gate.ts を起動し、検査対象 root に worktree を指定する方式を汎用手順として明記する。REQ-018（REQ-018-005）の要件行の範囲拡張要否は req-define が判断する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` 構造的制約節（L172-202 手順への plugins 系適用追記）
- `docs/requirements/REQ-018.md` REQ-018-005（範囲拡張の要否判断。req-define が判断する反映先候補）

### 対象外

- gate.ts の実装変更、textlint guard の fail-closed 挙動の変更
- bun test 環境前提（L135-163）の node_modules junction 手順（plugins gate 実行とは別系統の依存整備）
- skill scripts 系手順そのもの（既に整備済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 構造的制約節（main root 実体 + --root 指定手順）に plugins 配下 junction 実体（textlint gate）の実行代替手順を追記 |
| REQ | docs/requirements/REQ-018.md | REQ-018-005 の適用範囲（skill scripts → plugins 系 gate を含むか）の拡張要否判断 |

## 既存対策確認

- **確認結果**: あり（skill scripts 系の汎用手順は整備済み。plugins 系が未カバー）
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L172-202（main root 実体 + --root 指定手順。実行例: targeted docs guard L186-187、traceability check L190、契約テスト L193）、docs/requirements/REQ-018.md REQ-018-005
- **ギャップ分類**: fix gap（既存手順の適用範囲欠落）
- **ギャップ詳細**: 手順節が「junction 系 skill scripts」限定で、`.opencode/plugins/` 配下 junction 実体（textlint gate）の実行代替が未明文化。統合クラスタ2件目として突合した deferred 既存エントリ（targeted docs guard --root + --files、2026-09-05記録・出現2回・2回 defer 判定）は、内容が worktree-operations.md L186-187 に実行例として正典化済み（PR #3073・git commit cec91c9b）のため duplicate 判定として prune 済み（本成果物の関連セクションに要約を保存）

## 制約

- 発生事例は代替実行（main root gate.ts 実行 + 検査対象 root 指定）で完遂済み。本件は再発予防（手順明文化）の反映である
- textlint gate の検査対象指定引数（--root 相当）の実装詳細・実在引数名は req-define が実装を再調査して確定する
- 配布 skill reference の変更は src 側原本面（src/opencode/**）経由で行う（配布依存境界）
- main root 実体からの実行は読取系の限定・環境ラベル記録・結果混在禁止など既存手順節の制約（L196-200）に従う

## 受け入れ条件

- [ ] worktree 構造的制約節に textlint gate（plugins 配下 junction 実体）の main root 実体起動 + 検査対象 root 指定の代替手順が明文化されている
- [ ] 手順の適用範囲（skill scripts と plugins 系 gate）が誤解なく記述されている
- [ ] REQ-018-005 との整合（範囲拡張の要否）が req-define で判断・記録されている

## 元learning item / 根拠

- **要約**: worktree では textlint gate 実体が junction 未伝播のため main root gate.ts 実行 + --root 指定で代替する（統合クラスタ: deferred 既存 targeted docs guard 事例と同属）
- **根拠**: PR #3074 case-run 実測。gate.ts 起動不能の観察 → main root gate.ts 実行 + 検査対象 root に worktree を指定する方式で代替し、配布 Skill 変更時の品質統制を textlint gate + 配布境界検査で充足。REQ-018-005・worktree-operations.md L172-202 の「junction 系 skill scripts」限定を本評価実行で機械確認、gate.ts 実体（src/opencode/plugins/agentdev-textlint-guard/gate.ts）を glob 確認
- **再発条件**: worktree で textlint gate を直接実行する場合全般（および worktree で junction 系実体に依存する検査・gate を直接実行する場合）
- **横展開可能性**: textlint gate を worktree で実行する全 workflow（case-run / case-close / case-ready）。worktree で junction 系実体に依存する gate/check 全般
- **統合クラスタ2件目（deferred、duplicate として prune）の保存要約**: 「2026-09-05: worktree 内変更の targeted docs guard は main repo から --root + --files 併用で検査できる」（移動日 2026-09-07、処分判定 defer ×2回）。内容（main repo から `--root <worktreeパス>` + `--files` 併用で worktree 内変更を検査）は worktree-operations.md L174・L186-187 に実行例として正典化済みのため、living pool での保持を終了

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #3068・Case #3063（PR #3074）。関連: PR #3073（worktree 構造的制約手順の先行整備）
