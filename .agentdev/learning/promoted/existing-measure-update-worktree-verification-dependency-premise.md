# worktree 検証の依存整備前提の完全化（分散 node_modules・tsc 型解決・junction 代替）

## 背景

worktree 環境で integrity suite・契約テスト・型検証を実行するたびに、依存解決失敗による環境起因 fail が反復して発生している。2026-09-01 以降だけで7観測（PR #2413、#2432、#2440、#2443、#2585、#2587、#2615）を数える。既存の依存前置規定は agentdev-project-extensions/scripts 1 ディレクトリのみを対象としており、実際の依存配置は複数ディレクトリに分散しているため、規定を守けても環境依存 fail が残存する。環境依存 fail は AG-010 既知 fail 分離判定を妨げ、検証差分の由来分類コストを毎回発生させている。

## 問題

1. 既存の依存前置規定（agentdev-git-worktree references/worktree-operations.md、agentdev-quality-gates references/qg-4-final-acceptance.md の依存パッケージ前置）が対象とするディレクトリは `src/opencode/skills/agentdev-project-extensions/scripts` のみである。実際には `.opencode/skills/repo-agentdev-integrity/scripts` 側の node_modules も未伝播であり、こちらの bun install も前提になる（PR #2615 で環境依存 fail 4件 / errors 4件として観測）。
2. `bun install` 前置だけでは tsc の型解決（`@types/bun` 等）が復元されないケースがある（PR #2585 で `bun run tsc --noEmit` の node types 未解決エラーとして観測）。
3. per-skill node_modules（zod / typescript 等）は bun run によるスクリプト直接実行では解決し、bun test 単独実行では解決しない非対称がある。main 側 node_modules への junction 作成（検証後削除）が暫定手段として有効（PR #2587 で実証）。
4. 依存解決状態が不明のまま検証を実行すると、環境依存 fail が changeset 起因と誤判定されるリスクが毎回生じる（bun run と bun test の非対称、フル suite と単体実行の非対称など）。

## 望ましい変更

worktree で検証（integrity suite・契約テスト・tsc 型検証）を実行する前提手順として、依存整備の対象ディレクトリ集合・型解決の前提・代替手段を既存規定（worktree-operations.md、qg-4-final-acceptance.md の依存パッケージ前置）へ完全な形で反映する。少なくとも次を満たすこと:

- 依存前置の対象ディレクトリ集合を `src/opencode/skills/agentdev-project-extensions/scripts` と `.opencode/skills/repo-agentdev-integrity/scripts`（worktree 実体）の両方として明示する
- tsc 型検証を含む場合は型解決の前提（当該パッケージでの bun install による `@types/bun` 等の復元）を明記する
- bun test 単独実行の依存解決前提と、junction 作成（検証後削除）または当該 skill ディレクトリでの bun install という代替手段を記録する
- 環境依存 fail の分離判定は、依存整備実施後に Winston 再実行してから行う手順とする

## 対象範囲

### 対象

- worktree で integrity suite・checker 系テスト・tsc 型検証を実行する全 workflow（case-run 委譲、case-close QG-4 独立再検査、実行担当サブエージェント、docs-check 系検証）
- worktree 作成後の検証環境整備手順を規定する配布 skill references・品質ゲート資料

### 対象外

- main repo（junction 環境）での検証実行（依存が伝播しているため対象外）
- node_modules の git 管理化・依存配置の一元化（リポジトリ構造変更であり、本変更の対象外）
- REQ-018 worktree 構造的制約・テスト fallback 契約そのものの変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 依存前置の対象ディレクトリ集合（両 scripts ディレクトリ）・tsc 型解決前提・bun test 単独実行の依存前提と junction 代替の追記 |
| 配布skill reference | src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 「依存パッケージ前置」の対象ディレクトリ集合の完全化（repo-agentdev-integrity/scripts 側の追加） |
| Design | docs/designs/skills/agentdev-git-worktree-test-fallback.md | worktree テスト fallback 契約の依存解決前提に関する補足候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（一部適用）
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L130 付近、src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「依存パッケージ前置」
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 依存前置の規定は存在するが対象ディレクトリが agentdev-project-extensions/scripts 1 ディレクトリに限られ、repo-agentdev-integrity/scripts 側の node_modules、tsc 型解決（@types/bun）、per-skill node_modules の bun test 単独実行時の扱いと junction 代替が未規定。規定遵守後も環境依存 fail が残存する不全。

## 制約

- 既存の QG-4 正規形（3 cwd 分割実行・./ prefix・環境ラベル）の実行形態契約は変更しない（本変更はその依存前提の補完）。
- 配布成果物（ADF core）は一般規則のみを保持する原則（配布成果物の責務境界）に従う。本知見の技術固有部分は worktree 運用 reference が担う。
- junction は worktree へ伝播しない構造的制約（REQ-018）は前提条件であり、本変更で扱わない。

## 受け入れ条件

- [ ] worktree 検証手順に依存前置の対象ディレクトリ集合が明示され、対象ディレクトリが両 scripts ディレクトリを含むこと
- [ ] tsc 型検証を含む worktree 検証で型解決の前提が手順化されていること
- [ ] 新規 worktree で依存整備後に integrity suite を実行したとき、依存解決起因の fail / error が 0 件であること（PR #2615 で実証済みの状態）
- [ ] bun test 単独実行の依存前提と代替手段（junction または当該ディレクトリの bun install）が記録されていること

## 元learning item / 根拠

- **要約**: worktree は git 管理対象のみを引き継ぐため、gitignore 対象の node_modules は依存配置の分散数だけ個別整備が必要。既存規定はその一部のみを対象としており、環境依存 fail の反復と既知 fail 判定の妨害が続いている。
- **根拠**: (1) PR #2585（Issue #2564）: worktree で `bun run tsc --noEmit` と zod 依存契約テストが node_modules 欠落で失敗、bun install で解消。(2) PR #2587（Issue #2560）: per-skill node_modules（zod）未伝播で bun test 単独実行のみ失敗（bun run は成功の非対称）、main 側 node_modules への junction（検証後削除）で bun test 15 pass。(3) PR #2615（Issue #2602）: repo-agentdev-integrity/scripts と agentdev-project-extensions/scripts の両方で bun install 前置により環境依存 fail 4件 / errors 4件を消滅。(4) 同一ファミリーの過去観測: PR #2413（zod bun install 前置）、#2432（bun install --cwd による worktree ローカル解消）、#2440（node_modules 未伝播）、#2443（分散 node_modules の個別 install 必要）。
- **再発条件**: 新規 worktree で依存解決を伴う検証（integrity suite・契約テスト・tsc）を事前整備なし、または不完全な整備（1 ディレクトリのみ）で実行する場合。
- **横展開可能性**: worktree で依存解決を伴う検証を実行する全 workflow（case-run / case-close / 実行担当サブエージェント / docs-check 系）に共通。依存が多層分散配置のリポジトリ一般に適用可能。

## 推奨Issue分類

- **分類**: docs_chore（配布 skill reference・品質ゲート資料の手順追記）
- **推奨ラベル**: documentation
- **関連Issue**: なし（PR #2585 / #2587 / #2615 は起因観測の実装 Case）
