# worktree 上の bun 実行形式（./ prefix）と junction projection 挙動

## 背景

Case #3144（DEL-3144-1）の worktree 上での検証実行で、`.opencode` projection 配下のスキルスクリプトを `bun <path>` 形式で実行すると Module not found となり、`./` prefix 形式（`bun run ./.opencode/...`、`bun test ./.opencode/...`）のみ動作した。また bun test の `import.meta.dir` は junction パス（worktree 側実ファイル）を返した。

## 問題

- bun の path filter 解析は相対 path 指定に `./` prefix を要求する
- worktree の `.opencode` projection は junction 未伝播のため、checker 本体は projection 側（main root 側実装）を解決し、検査対象は worktree root になる
- テストの import.meta.dir は junction パスを返すためテストは worktree の実ファイルを読む
- この実行形式・解決挙動が検証手順に明記されていない（REQ-060・既存知識文書・checker 実行契約 Design は bun test 中心。harness-delegation.md に実行形式の明示なし）

## 望ましい変更

worktree 上の検証実行手順に「bun は ./ prefix 形式で実行する」「check_templates.ts 単独実行は worktree で skip（junction 未伝播）するが check_templates.test.ts が補完する」「probe test でテストが読むツリーを事前確認する」を明記する。

## 対象範囲

### 対象

- agentdev-case-run-execution-adapter references/harness-delegation.md（実行コマンド形式指示）
- worktree 上の検証実行を行う工程（case-run / case-close STEP-3）

### 対象外

- bun・junction の挙動自体の変更（環境観測）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md | bun ./ prefix 形式・junction 挙動・probe test 手順を明記 |
| knowledge | docs/knowledge/bun-test-execution-form-drift-signals.md | checker スクリプト実行への ./ prefix 適用と junction projection 挙動を追記 |

## 既存対策確認

- **確認結果**: なし（fix gap）
- **該当ファイル**: docs/knowledge/bun-test-execution-form-drift-signals.md（bun test 中心）、REQ-060、checker 実行契約 Design
- **ギャップ分類**: fix gap
- **ギャップ詳細**: checker スクリプト実行への `./` prefix 適用と junction projection 挙動（checker 本体は projection 側解決・テストは worktree 実ファイルを読む）が未記載

## 制約

- Windows 環境固有の挙動（junction は NTFS）

## 受け入れ条件

- [ ] worktree 検証手順で bun 実行形式が指示レベルで明記されること
- [ ] check_templates 系の worktree での扱い（単独 skip + test 補完）が読み取れること

## 元 learning item / 根拠

- inbox 2026-09-26「worktree 上の bun スクリプト実行は ./ prefix 形式のみ動作し、テストの import.meta.dir は junction パスを返す」（Case #3144、PR #3155、DEL-3144-1）
- 関連 deferred（同一でない）: L2299「bun run による .ts 直接実行は package.json なし環境で Module not found」、L2455「worktree 内 checker 直接実行は junction 伝播なしで完結」、L1691「契約テスト2本は main repo untracked 実体であり worktree から起動できない」
