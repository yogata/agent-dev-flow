# Worktree 作成、削除、ブランチ操作の詳細手順

## 目次

- [作成手順](#作成手順)
- [worktree 内判定ヘルパー](#worktree-内判定ヘルパー)
- [worktree 標準運用ガイド](#worktree-標準運用ガイド)
- [worktree 構造的制約（agentdev-git-worktree-test-fallback Design）](#worktree-構造的制約agentdev-git-worktree-test-fallback-design)
- [bun test 実行の環境前提](#bun-test-実行の環境前提)
- [書込み guard 運用指針（Windows エンコーディング破壊回避の集約）](#書込み-guard-運用指針windows-エンコーディング破壊回避の集約)
- [git stash 運用手順（一時退避）](#git-stash-運用手順一時退避)
- [削除手順](#削除手順)
- [ツール実行規約](#ツール実行規約)
- [Merge Conflict 対応パターン](#merge-conflict-対応パターン)

## 作成手順

### 1. worktree 作成元

worktree の作成元は main（以下 `origin/main`）である。
worktree の作成元、PR の base、rebase・同期基準、鮮度確認、squash merge 先、Epic 後続 Wave の作業起点は main を参照する。

作成元の検出（従来どおり）:

```bash
git remote show origin | grep 'HEAD branch' | sed 's/.*: //'
```

検出結果を `origin/main` として使用。
デフォルトは `main`。
ローカルのベースブランチは古くなっている可能性があるため、常にリモートの最新状態を起点とする。

### 2. worktree作成コマンド

```bash
git worktree add ".worktrees/{N}-{type}" -b "{type}/issue-{N}" origin/main
```

### 3. 重要事項

- **worktreeプレフィクス必須**: ファイルパスには `.worktrees/{N}-{type}/` を含めること
 - 正: `<repo-root>/.worktrees/516-fix/src/components/App.tsx`
 - 正: `.worktrees/516-fix/src/components/App.tsx`
 - 誤: `src/components/App.tsx`（メインリポジトリのファイルを誤編集リスク）
- Windows環境: パスにスペースが含まれる可能性があるためダブルクォート必須
- 作成後: `git worktree list` で正しく追加されたことを検証

### 4. 既存worktree衝突時の対応

| 状況 | 対応 |
|------|------|
| 同名worktree既存 | 既存worktreeを再利用（作成コマンド実行しない） |
| ブランチのみ既存 | `git worktree add ".worktrees/{N}-{type}" "{type}/issue-{N}"` |
| ダーティなworktree | 削除禁止。未コミット変更時はエラー停止 |

## worktree 内判定ヘルパー

現在 worktree 内にいるか（メインリポジトリで作業していないか）を判定する検証ヘルパー手順。
case-run の precondition gate（STEP-S3 前置 gate 群）および実行担当サブエージェントの自己検証から参照される。
2つの検証を組合せて判定する。

### 1. 検証コマンド

**検証A**: `git worktree list` で当該 worktree が登録されていることの確認

```bash
git worktree list
```

出力に当該 Issue の worktree（`.worktrees/{N}-{type}`）が含まれることを確認する。

**検証B**: `git rev-parse --show-toplevel` で現在の作業ディレクトリのルートがメインリポジトリルートと**一致しない**ことの確認

```bash
# worktree 内で実行
git rev-parse --show-toplevel
```

この結果がメインリポジトリルート（`.worktrees/` を含まないパス）と**一致しない**ことを確認する。
一致する場合はメインリポジトリにいる（worktree 内ではない）。

### 2. 判定基準

| 検証A（worktree list 登録） | 検証B（toplevel ≠ メインルート） | 判定 |
|---|---|---|
| 当該 worktree あり | 一致しない（worktree 内） | ✅ worktree 内にいる（隔離されている） |
| 当該 worktree あり | 一致する（メインルート） | ❌ メインリポジトリにいる（隔離されていない） |
| 当該 worktree なし | - | ❌ worktree 未作成 |

### 3. 適用箇所

- **case-run STEP-S3（precondition gate）**: 実行担当サブエージェント起動前に本ヘルパーで検証し、worktree 内にいない場合は起動を停止して当該 STEP へ戻る
- **実行担当サブエージェントの自己検証**: 実装作業開始前に本ヘルパーで worktree 内にいることを自己検証する（詳細は `agentdev-case-run-execution-adapter` 参照）

## worktree 標準運用ガイド

worktree 環境の運用落とし穴に対する標準運用ガイド（L-003, L-008, L-009, L-013、PR #1036/#1099/#1128 由来）。

### source 側ツリー直接参照（SoT パス）

worktree 内では `.opencode/skills/` の junction が再作成されないため、junction 切断時に `.opencode/` 経由参照が失敗する。
整合性検査、スキル参照は、配置先（`.opencode/`）ではなく source 側ツリー（SoT パス）を直接参照すること。

### git 管理外実体の未投影に起因する運用

worktree へは git 管理外の実体（`node_modules`、`.opencode/skills/` の junction 等）が投影されない。
このため、worktree 内では次の3運用を守る。

1. **SoT パス起点実行**: 構造系テスト、整合性検査、スキル参照等の実行は source 側ツリー（SoT パス）を起点とする。背景と手順は「source 側ツリー直接参照（SoT パス）」を参照する
2. **src 側のみ編集**: 編集対象は git 管理対象の source 側ツリー（`src/` 配下）に限定する。配置先（`.opencode/`）配下の投影実体は git 管理外であり、編集しても main へ反映されず、install による再生成で失われる。gitignore 対象ファイルを参照・編集する場合の扱いは「gitignore 対象ファイル受け渡し不可」を参照する
3. **依存整備**: `node_modules` は gitignore 対象のため worktree へ未伝播である。bun test・tsc 型検証の実行前に依存整備を前置する。整備手段（対象ディレクトリでの `bun install`、または main 側 `node_modules` への junction 作成。検証後は junction エントリのみを削除し、参照先の main 側 `node_modules` は破壊しない）の詳細は「bun test 実行の環境前提」を参照する

### isInsideWorktree 適用

`isInsideWorktree` で worktree 実行を判定し、junction 依存検査（`checkSourceProjectionConsistency` 等）に適用すること。
worktree 内で junction が再作成されない場合の偽陽性を防止するためである。

### isInsideWorktree 適用範囲の拡張候補

`checkSourceProjectionConsistency` 以外の junction 依存検査に対する `isInsideWorktree` 適用を評価対象として明記すること。
junction 依存の整合性検査全般に worktree 実行判定を拡張する候補を個別に評価し、偽陽性の発生する検査から順次適用する。

## worktree 構造的制約（agentdev-git-worktree-test-fallback Design）

worktree は独立した working tree を持つため、本体リポジトリ直下を前提とする検査が worktree 内では成立しない事象がある。
次の構造的制約を前提として運用する。

### gitignore 対象ファイル受け渡し不可

worktree は独立した working tree であるため、メインリポジトリで `.gitignore` 対象となっているファイル（`.opencode/skills/agentdev-*/` ジャンクション配下、`.agentdev-plugin/` 等）は worktree 側へ受け渡しできない。
worktree 内で当該ファイルを参照する検査は失敗する。

worktree 内で gitignore 対象ファイルを参照・編集する必要がある場合は、`git add -f` で強制追加して worktree の working tree に存在させるか、source 側ツリー（SoT パス）へ fallback して参照する。

### bun test 実行の環境前提

bun test によるフル suite 実行は、次の環境前提を踏まえて実行する。
フル suite の実行形態（3 cwd 分割実行・./ prefix・環境ラベル）の正規形は `agentdev-quality-gates`（QG-4 bun test フル suite 正規形）が品質統制側として所有する。

- worktree は独立した working tree のため、gitignore 対象の `node_modules` は worktree へ未伝播である。bun test（フル suite 正規形、bun test 単独実行の別を問わない）および tsc 型検証の実行前に依存整備を前置する。未実施の場合、integrity suite の一部テスト・tsc 型検証が依存解決失敗で fail する。依存整備の対象ディレクトリ集合と前置の実行形態は正規形（`agentdev-quality-gates` QG-4 の依存パッケージ前置）を参照する。worktree における依存整備前提は次のとおり:
  - **対象ディレクトリ集合**: Project Extensions の scripts ディレクトリ（source 側ツリー配下。zod 等の依存解決。integrity suite からの相対 import 参照の前提を含む）と、本体リポジトリ専用の整合性検査 skill の scripts ディレクトリ（配置先配下の worktree 実体。`typescript`・`@types/bun`・`@types/node` の依存解決）の両方。片方のみ整備した場合、未整備側を参照するテスト・型検証が依存解決失敗で fail する
  - **tsc 型検証の型解決前提**: tsc 型検証（`tsc --noEmit`）を含む場合は、対象パッケージでの `bun install` により `@types/bun` 等の型定義と `typescript` を復元済みであること。node_modules 未整備の状態では tsc の型解決が失敗する
  - **依存整備の正規手段（フル suite 正規形を含む全 bun test 実行形態で共通）**: 依存解決が必要な場合は、次のいずれかの手段で整備する（QG-4 の依存パッケージ前置と同じ許容手段・適用範囲）
    1. main 側の当該 scripts ディレクトリ配下の `node_modules` への junction を worktree 側に作成する。検証後に junction を削除する（junction エントリのみの削除とし、参照先の main 側 `node_modules` は破壊しない）
    2. worktree の当該 skill ディレクトリで `bun install` を実行し、worktree 内に `node_modules` を生成する

       junction 作成・削除の例（main root で実行、`{N}-{type}` は対象 worktree 名に置換）:

       ```powershell
       cmd /c mklink /J ".worktrees\{N}-{type}\src\opencode\skills\agentdev-project-extensions\scripts\node_modules" "src\opencode\skills\agentdev-project-extensions\scripts\node_modules"
       # 検証後の削除（junction エントリのみ）
       Remove-Item -LiteralPath ".worktrees\{N}-{type}\src\opencode\skills\agentdev-project-extensions\scripts\node_modules"
       ```

  - **整備後の再実行手順**: 依存整備実施後、依存解決失敗で fail したテスト・型検証を同一 worktree で再実行し、当該 fail が解消したことを確認する。再実行結果には依存整備実施済みの旨を環境ラベル（依存パッケージ状態）へ記録し、整備前の fail と整備後の結果を混在させない
  - **整備手段の選択基準（junction 作成と bun install の使い分け）**: 上記2手段は次の判断基準で使い分ける。判断根拠は検証記録の環境ラベルへ記録する
    - **`bun install` を選択する**: (a) worktree 内で `package.json`・`bun.lock` を変更する Case（依存定義の変更を伴う実装）。(b) 検証結果の再現性が依存状態そのものに依存する検証（依存状態を実験条件の一部として扱う場合）。junction 経由では依存実体が main 側の現在状態に依存し、main 側の整備操作が worktree 側の検証結果へ干渉するため、この条件では junction を使わない
    - **junction 作成を選択する**: (a) 依存定義の変更がなく、main 側の整備済み依存と同一の状態で足りる一時的な検証。(b) 検証後に worktree へ `node_modules` 実体を残したくない場合（junction エントリ削除のみでクリーンアップが完結し、gitignore 対象の実体が worktree に残留しない）。(c) `bun install` による復元時間を要しない速い前置が有利な場合
    - **共通制約**: いずれの手段でも、選択根拠と依存パッケージ状態を環境ラベルとして検証記録に残す。整備手段の切替（junction → bun install 等）を行った場合は切替後の結果を正とし、切替前の結果を再利用しない
  - **package rename 時の bun.lock 確認**: package rename を伴う変更で `bun install` を実行した場合は、bun.lock の root workspace name が新パッケージ名へ追従していることを確認する（確認手順は runtime-package-boundary Design「本体リポジトリ sync」節参照）
- worktree の `.opencode/` 配下 junction は未伝播である。junction を前提とする構造系テストは source パス（SoT パス）への fallback で実行される
- worktree の構造上の理由でテストスイートが実行できない場合は、メインリポジトリからの読取専用実行でエビデンスを採取できる。この場合は実行環境（worktree または main、junction 伝播状態、依存パッケージ状態）を環境ラベルとして検証記録に明記し、fail 全件の由来分類（既知欠陥・環境依存・当該変更起因）を行う

### junction 依存 checker の skip 挙動

`.opencode/skills/agentdev-*` ジャンクションは worktree へ伝播しない。
このため junction の存在を前提とする checker（`checkSourceProjectionConsistency` 等）は worktree 内で偽陽性を発生させる。

junction 依存 checker は worktree 実行時（`isInsideWorktree` 判定で worktree 内と判定された場合）に skip する。
skip せずに検査が必要な場合は構造系テスト fallback（commands_e2e / skills_structure / templates_structure の source パス切替）を適用する。

### main root 実体 + --root 指定による読取系 checker 実行手順

junction 系 skill scripts を用いる検査で、skip せずに実行する必要がある読取系 check は、main root 実体から `--root <worktree root>` 指定（必要に応じ `--files` 併用）で実行できる。
worktree 内から `.opencode/skills/agentdev-*` 配下の script を直接実行すると junction 未伝播により Module not found で失敗するため、script の起動パスを main root 実体側へ置き、検査対象だけを worktree へ向ける。

手順:

1. main root（メインリポジトリルート）を cwd として、script 実体を `bun <path>` 形式で起動する
2. 検査対象の worktree root を `--root <worktree root>` で指定する（絶対パスを推奨。相対パスは実行時のカレントディレクトリ基準で解決される）
3. 変更ファイル限定検査では `--files` を併用する（`--files` と `--base-ref` は排他。worktree 上のコミット前検証では untracked ファイルを含む `--files` による明示指定を標準とする。`--files` は checker の workflow profile の対象に一致するファイルを指定する。docs/** 変更を含まない PR では `--workflow case-run` の gate がスキップ対象となるため、文書品質の targeted 検査は `--workflow docs-check`（全ファイル対象）で行う）

実行手順例（代表検査。`<worktree 絶対パス>` は検査対象 worktree の root に置換する）:

```bash
# targeted docs guard（--root 対応、--files 併用）
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-run --root <worktree 絶対パス> --files src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md --json

# traceability check（--root 必須。--req は対象要件行 ID のカンマ区切り個別指定のみ。.. 範囲構文は非対応）
bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root <worktree 絶対パス> --req REQ-{NNNN}-{MMM}

# 契約テスト（配布物の構造様式を固定する *.test.ts。--root を取らないため main root 実体側の状態が検査対象になる）
bun test ./.opencode/skills/repo-agentdev-integrity/scripts/skills_structure.test.ts
```

制約:

- **読取系 check の実行のみに限定**: main 側 root での実行は読取系 check の実行のみに限定する。書込み・状態変更を伴う操作（索引再生成、auto-fix 等）を main root 実体から実行しない
- **結果混在禁止**: worktree 内検査結果と main root 実体からの検査結果を混在させない。実行記録には環境ラベル（実行環境: main root 実体、検査対象: `--root` 指定の worktree root、ブランチ名・HEAD hash、junction 伝播状態）を付す。環境ラベルの記録運用は「bun test 実行の環境前提」に従う
- **検査対象状態の明示**: `--root` を取らない契約テストを main root 実体から実行した場合、検査対象は main root 実体側の状態であり、worktree 内の未マージ変更は含まれない。worktree 内の変更を検査する契約テストは構造系テスト fallback（前節参照）を用いる

QG-4 の traceability check における main 側 root 再実行の前提手順との相互参照は、`agentdev-quality-gates` references `qg-4-final-acceptance.md`「traceability check の横断 durable state 前提手順」を参照する。

## 書込み guard 運用指針（Windows エンコーディング破壊回避の集約）

worktree 操作（実装、検証、証跡退避を含む）におけるファイル書込みは、Windows 環境のエンコーディング破壊回避 guard の対象である。
本節は worktree 操作文脈での運用指針を集約する。規範の正は AGENTS.md 行動規範と `docs/knowledge/windows-powershell-bulk-io-corruption.md` とし、本節はそれらを worktree 操作から参照できるようにした集約点である。

### guard が書込みをブロックする操作（worktree 内で実行禁止）

- PowerShell 標準 cmdlet（`Get-Content` / `Set-Content` / `Out-File`）経由の既存 UTF-8（BOM なし）/LF ファイルの一括読み書き（cp932 解釈・CRLF 書き出しによる破壊）
- PowerShell のリダイレクト演算子（`>` / `>>` / `*>`）やパイプによるファイル出力（checker stdout・gh CLI 出力等の証跡退避を含む）
- Write ツールによる既存 UTF-8（BOM なし）ファイルの全面上書き（新規ファイル作成に限定する）

### 標準手段（guard ブロック時の切替先）

- 既存ファイルの部分編集: edit ツール（per-line string replace）
- プログラム経由の一括読み書き: node の `readFileSync` / `writeFileSync`（エンコーディング明示）または `[System.IO.File]` の明示エンコーディング指定
- 証跡退避（checker CLI stdout、gh CLI 出力等）: `spawnSync` + `fs.writeFileSync`（UTF-8 明示）

### fail-closed の維持

guard が書込みをブロックした場合、ブロックの解除・迂回（エンコーディング指定の変更、リダイレクト回避ハック等）で進めず、上記の標準手段へ切替する。
ブロックを検知した edit の oldString がファイル実内容と不一致の場合は、ファイルを再読取して正確な内容で再試行する（本規定は guard の fail-closed 挙動自体を維持対象とする）。

git 出力のエンコーディング処理の詳細は `git-common-procedures.md`「Windows git 出力のエンコーディング処理」を参照する。

## git stash 運用手順（一時退避）

worktree での検証における一時退避の標準手順と、やむ得ない stash 利用時の規則を定める。
stash スタックはリポジトリ全体で共有され、複数 worktree 並列環境では他セッションの退避内容と混在する。
本手順はその混在に起因する障害の再発防止として定めた（関連Issue/PRは履歴参照）。

### 1. detached worktree による baseline 比較（標準手順）

worktree 検証で一時退避が必要な場合、`git stash` を使わない。
検証対象 worktree の working tree を変更せず、baseline commit 上の detached worktree で検証を実行して結果を比較する。

**手順**:

1. baseline commit を確定する: 検証対象 worktree の `HEAD`（PR 差分の検証では `origin/main`）
2. baseline 用の detached worktree を作成する: `git worktree add --detach ".worktrees/baseline-verify" {baseline_commit}`
3. detached worktree 内で検証（checker、test 等）を実行する
4. 検証対象 worktree と detached worktree の検証結果を比較し、失敗が本次変更起因か既存起因かを判定する
5. detached worktree を削除する: `git worktree remove ".worktrees/baseline-verify"`

baseline 用 worktree は Issue 用の命名規則（`.worktrees/{N}-{type}`）の対象外の一時領域である。
検証完了時に必ず削除し、削除時のエラーハンドリングは「削除手順」に従う。
並列セッションで同時実行する場合はパスが衝突しないよう一意な接尾辞を付ける。

**理由**: `git stash` は working tree と stash スタックを変更する。
detached worktree は検証対象の working tree を変更せず、stash スタックも消費しないため、並列セッションへ影響しない。

### 2. やむ得ない stash 利用時の規則

detached worktree による代替が成立しない場合に限り、`git stash` の利用を認める。
利用時は以下の2規則を守る。

**規則1: `@{}` 引数の引用符必須**

`stash@{N}` 形式の引数は、シェルの解釈により意図しない引数へ変わる（bash のブレース展開で `stash@{0}` が `stash@0` となる、PowerShell で `@{...}` がハッシュリテラルとして解析される等）。
`stash@{N}` を含む引数は必ず引用符で囲む。

```bash
# 正
git stash pop 'stash@{0}'
git stash show --name-only 'stash@{1}'

# 誤（シェルが @{} を解釈する）
git stash pop stash@{0}
```

**規則2: `-u` 使用時の除外 pathspec**

`git stash push -u` は未追跡ファイルを退避対象に巻き込む。
ドメイン状態（`.agentdev/` 配下）や実行時作業領域を退避対象から除外するため、除外 pathspec を指定する。

```bash
git stash push -u -- . ':(exclude).agentdev/**'
```

除外対象は実行環境に応じて追加する（ビルド成果物等）。

共有作業ツリー（main worktree）では、`git stash` を含むスイープ操作は並列実行安全ステージングプロシージャ（`references/git-common-procedures.md` 手順 3）の禁止対象である。

### 3. 複数 worktree 環境での stash 往復前確認

stash スタックはリポジトリ全体で共有される。
自セッションの stash 以外に、他 worktree、他セッションの stash が同一スタックに混在し得る。

stash の退避（push）と復元（pop、apply）を往復する前に、以下を確認する。

1. `git stash list` で既存エントリを確認する
2. 復元対象エントリが自セッションのものであることを確認する: `git stash show --name-only 'stash@{0}'`
3. 自セッション以外のエントリが混在する場合、スタック先頭を暗黙に復元する `pop` を使わず、引用符付きの index で自セッションのエントリを明示して `git stash apply 'stash@{N}'` で復元する

他セッションの stash エントリの削除（`git stash drop`）、スタック全体のクリア（`git stash clear`）は行わない。

## 削除手順

**追跡済みファイル削除禁止**: クリーンアップ操作中は追跡済みファイルを削除してはならない。
削除対象は未追跡ファイルのみ（実行時作業領域配下の一時ファイル、ビルド成果物等）。

### 1. 未追跡ファイルのクリーンアップ

worktree 内の未追跡ファイル（実行時作業領域配下の一時ファイル、ビルド成果物等）が `git worktree remove` エラーの原因になるため削除:

**Windows**: `git -C ".worktrees/{N}-{type}" clean -fd`
**POSIX**: `git -C ".worktrees/{N}-{type}" clean -fd`

**重要**: 追跡済みファイル（ドメイン状態を含む可能性あり）は削除禁止。
未追跡ファイルのみを削除対象とする。
未追跡ファイルが存在しない場合はエラーにせず続行。

### 2. worktreeの削除

```bash
git worktree remove ".worktrees/{N}-{type}"
```

**削除前のシェル cwd ハンドル解放**: 永続シェルセッションの `workdir` が削除対象 worktree パス（またはその配下）を指している場合、cwd ハンドルがディレクトリを掴んだままとなり、`git worktree remove` の成功後も空ディレクトリが残留する（Windows 環境で顕著）。
削除を実行する前に、削除操作に使用するセッションの `workdir` をリポジトリルート（`.worktrees/` を含まないパス）へ変更し、当該 worktree パスに対する cwd ハンドルを解放してから削除を実行する。

**解放不能時の削除完了判定**: 削除実行セッション以外のシェルセッションが worktree パスを `workdir` に使用しており解放できない場合、ディレクトリの物理削除を断念し、git 管理状態のみで削除完了を判定する。
削除完了の判定基準は次の2点である。

1. `git worktree list` の出力から当該 worktree が消滅していること
2. 当該 worktree のローカルブランチ（`{type}/issue-{N}`）が削除されていること

上記を満たす場合は削除完了として扱う。
worktree パスの空ディレクトリが残留している場合は、残留ディレクトリの警告を記録する（例: `WARN: worktree directory remains at {path}: cwd handle held by another session. Git-managed state is clean.`）。
残留ディレクトリの実削除は、当該セッション終了後またはハンドル解放後の手動削除に委ねる。
本完了判定は `git worktree remove` 自体の失敗リトライ（後述の Permission denied 時のリトライ）を代替するものではなく、コマンド成功後にディレクトリが残留した場合の完了判定にのみ適用する。

**Permission denied 時のリトライ**: ファイルハンドル解放待ちのため短い待機を挟んでリトライ。
最大3回。
リトライ条件は "Permission denied" を含む場合のみ。
上限到達時は警告表示して停止。

**リトライ前の復元**: リトライ時、worktree 内に変更された追跡済みファイルがある場合は `git checkout .` を実行して追跡済みファイルをクリーンな状態に復元してから再試行する。

### 3. クリーンアップ

```bash
git worktree prune
```

成功時: `git worktree remove` 正常終了後の管理情報のクリーンアップ。

失敗時: `git worktree remove` がすべてのリトライ後に失敗した場合のフォールバッククリーンアップ。
`prune` は無効な worktree 管理情報のみを削除し、worktree ディレクトリ自体は削除しない。

#### Windows + ジャンクション環境の削除フォールバック

**エラーパターン**: Windows + ジャンクション環境で `git worktree remove` が `Not a directory` を含むエラーで失敗する場合。

**原因**: ジャンクションの reparse point により、git 内部の削除処理がディレクトリを正しく辿れないことがある。

**適用条件**: `git worktree remove` が上記エラーで失敗した場合のみ。
通常の削除成功時は実行しない。

**手順**:
1. worktree 管理情報を更新: `git worktree prune`
2. ジャンクションディレクトリを手動削除: `Remove-Item -LiteralPath "{worktree_path}" -Recurse -Force` または `rmdir /s /q "{worktree_path}"`
3. ローカルブランチを削除: `git branch -d {branch_name}`（必要時のみ `-D`）
4. リモートブランチがある場合のみ削除: `git push origin --delete {branch_name}`

**注意**: `install.ps1` が作成するジャンクション link 経由の worktree で発生する Windows 固有の挙動。
背景: worktree ジャンクション削除フォールバック要件（関連Issue/PRは履歴参照）。

### 4. ローカルブランチの削除

```bash
git branch -d "{type}/issue-{N}"
```

**squash merge 後の条件付き `-D` 許可**:
1. PR が `state: MERGED` と確認できること
2. 呼び出し元が squash merge 済みを明示的に判定していること
3. 条件を満たさない場合は `-D` 実行せず警告表示して停止

### 5. リモートブランチの削除

```bash
git push origin --delete "{type}/issue-{N}"
```

- リモートにブランチが存在しない場合はエラーを無視して続行
- 削除失敗時は警告表示して停止

## ツール実行規約

- worktree 内で作業する場合、`workdir` パラメータに worktree パスを指定する
- `cd` によるディレクトリ移動は行わない
- Edit/Write ツールでもパスに `.worktrees/{N}-{type}/` を含める

## Merge Conflict 対応パターン

### worktree内でmerge conflictが発生した場合の対応手順

#### 1. conflict検出時の即座停止ルール

worktree内で以下のいずれかの操作でconflictが検出された場合、即座に処理を停止しユーザーに報告する:
- `git pull --ff-only` 実行時
- `git merge` 実行時
- `git rebase` 実行時

停止時は以下の情報を報告:
- 発生した操作（例: `git pull --ff-only`）
- conflictが発生したファイル一覧
- worktreeパス

```markdown
## Merge Conflict 検出エラー

**操作**: {operation}
**worktree**: {worktree_path}
**停止理由**: merge conflictが発生したため、安全に操作を継続できません
**対象ファイル**: {conflicted_files}
**ユーザーアクション**: 手動でconflictを解決してください
```

#### 2. conflict markersの確認手順

conflict markers（`<<<<<<<`, `=======`, `>>>>>>>`）が含まれるファイルを確認:

```bash
git diff --name-only --diff-filter=U
```

または

```bash
git status --short | grep '^UU'
```

#### 3. 手動解決またはabort手順

**オプションA: 手動解決**
1. conflictファイルを手動で編集し、conflict markersを削除
2. 解決したファイルをstage: `git add {resolved_file}`
3. commit: `git commit -m "Resolve merge conflicts"`
4. 解決確認: `git status` でclean状態を確認

**オプションB: 操作の中止（abort）**
- mergeの場合: `git merge --abort`
- rebaseの場合: `git rebase --abort`

abort後、worktreeを元の状態に復元し、ユーザーに対応を依頼する。

#### 4. 解決後のcommit手順

conflictを手動解決した場合:
1. 変更をstage: `git add -u`
2. commit: `git commit -m "Resolve merge conflicts"`
3. 必要に応じてpush: `git push`

rebase中にconflictを解決した場合:
1. 変更をstage: `git add -u`
2. rebase継続: `git rebase --continue`
3. rebase完了後push: `git push --force-with-lease`（必要に応じて）

**rebase 解消編集の永続化確認（境界跨ぎ編集の取り込み確認）**:
- rebase の解消編集は `git rebase --continue` の前に `git add` で stage 確定する。stage 前に `--continue` を実行すると解消編集が rebase 完了後の状態に取り込まれず、squash merge 内容から欠落する事故（main 破壊と fix コミットの誘発）の原因となる
- squash merge の実行前に worktree が clean であることを確認する（`git status` で変更・stage 残存なしを確認）

**重要**: force pushは慎重に実行すること。
リモートの変更を上書きするリスクがあるため、事前に確認が必要。
