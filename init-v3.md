以下は**PowerShell 7**で実行してください。

---

# 1. 変数を設定する

```powershell
$OriginalRepo = 'C:\Users\ogatay\work\agent-dev-flow'
$V3Repo       = 'C:\Users\ogatay\work\agent-dev-flow-v3'
$Bootstrap    = 'C:\Users\ogatay\work\agent-dev-flow-v2-bootstrap'
$SmokeRepo    = 'C:\Users\ogatay\work\agent-dev-flow-v3-smoke'
$RepoUrl      = 'https://github.com/yogata/agent-dev-flow.git'
$V3Branch     = 'v3/rebuild'
```

---

# 2. 元リポジトリを最新化する

まず、現在の`agent-dev-flow`に未保存変更がないことを確認します。

```powershell
Set-Location $OriginalRepo

git status --short
```

何も表示されないことが成功条件です。

変更が表示された場合、その内容の扱いは不明です。commit、stash、破棄のいずれかを決めてから続行してください。

remoteとtagを更新します。

```powershell
git fetch origin --prune --tags
```

現在利用可能なv2 tagを確認します。

```powershell
git tag --list 'v2.*' --sort=-v:refname |
    Select-Object -First 20
```

最新のv2 tagを自動取得します。

```powershell
$V2Tag = git tag --list 'v2.*' --sort=-v:refname |
    Select-Object -First 1

if (-not $V2Tag) {
    throw 'v2.x.y tagが見つかりません。'
}

$V2Commit = git rev-list -n 1 $V2Tag

Write-Host "V2 tag    : $V2Tag"
Write-Host "V2 commit : $V2Commit"
```

表示されたtagが、v3移行元として固定する正しいv2最終版であることを確認します。

自動選択されたtagを採用しない場合は、明示的に変更します。

```powershell
$V2Tag = 'v2.x.y'
$V2Commit = git rev-list -n 1 $V2Tag
```

---

# 3. 空の`agent-dev-flow-v3`をworktree化する

現在の`agent-dev-flow-v3`は空なので、いったん削除してworktreeとして作り直します。

```powershell
Set-Location 'C:\Users\ogatay\work'

if (Test-Path -LiteralPath $V3Repo) {
    $existingItems = Get-ChildItem -LiteralPath $V3Repo -Force

    if ($existingItems.Count -gt 0) {
        throw "$V3Repo は空ではありません。削除せず内容を確認してください。"
    }

    Remove-Item -LiteralPath $V3Repo -Force
}
```

v2最終commitを起点に、v3用branchとworktreeを作ります。

```powershell
git -C $OriginalRepo worktree add `
    -b $V3Branch `
    $V3Repo `
    $V2Commit
```

確認します。

```powershell
git -C $OriginalRepo worktree list
git -C $V3Repo branch --show-current
git -C $V3Repo rev-parse HEAD
```

期待値：

```text
branch: v3/rebuild
HEAD:   $V2Commit
```

`v3/rebuild`がすでに存在している場合は、状態を確認します。

```powershell
git -C $OriginalRepo branch --list $V3Branch
git -C $OriginalRepo worktree list
```

既存branchを再利用するか削除するかは、そのbranchの内容次第なので不明です。

---

# 4. v2 bootstrap checkoutを作る

作業treeとは別に、v2ランタイム専用checkoutを作ります。

```powershell
if (Test-Path -LiteralPath $Bootstrap) {
    throw "$Bootstrap はすでに存在します。内容を確認してください。"
}

git clone --no-checkout $RepoUrl $Bootstrap
git -C $Bootstrap checkout --detach $V2Commit
```

bootstrapが指定commitで固定されたことを確認します。

```powershell
$BootstrapHead = git -C $Bootstrap rev-parse HEAD
$BootstrapStatus = git -C $Bootstrap status --short

Write-Host "Expected : $V2Commit"
Write-Host "Actual   : $BootstrapHead"

if ($BootstrapHead -ne $V2Commit) {
    throw 'bootstrap checkoutのcommitが一致しません。'
}

if ($BootstrapStatus) {
    throw 'bootstrap checkoutに変更があります。'
}
```

bootstrapのbranchがdetached HEADであることも確認します。

```powershell
git -C $Bootstrap status --branch --short
```

期待値：

```text
## HEAD (no branch)
```

これ以降、`$Bootstrap`では以下を禁止します。

* `git pull`
* `git checkout main`
* `git reset origin/main`
* ファイル編集
* formatter実行
* 自動修正ツール実行

---

# 5. v3 worktreeの`.opencode`をv2 bootstrapへ接続する

v3 worktreeへ移動します。

```powershell
Set-Location $V3Repo
```

親ディレクトリを作ります。

```powershell
New-Item -ItemType Directory `
    -Path '.opencode\commands' `
    -Force | Out-Null

New-Item -ItemType Directory `
    -Path '.opencode\skills' `
    -Force | Out-Null
```

## 5.1 commandを接続する

リンク元とリンク先を設定します。

```powershell
$CommandSource = Join-Path $Bootstrap 'src\opencode\commands\agentdev'
$CommandTarget = Join-Path $V3Repo '.opencode\commands\agentdev'

if (-not (Test-Path -LiteralPath $CommandSource)) {
    throw "command sourceがありません: $CommandSource"
}
```

既存の`agentdev` projectionだけを削除します。

```powershell
if (Test-Path -LiteralPath $CommandTarget) {
    cmd /c rmdir "`"$CommandTarget`""

    if (Test-Path -LiteralPath $CommandTarget) {
        throw "既存command projectionを削除できませんでした: $CommandTarget"
    }
}
```

ジャンクションを作成します。

```powershell
New-Item `
    -ItemType Junction `
    -Path $CommandTarget `
    -Target $CommandSource | Out-Null
```

## 5.2 skillsを接続する

bootstrap側の公開skillを取得します。

```powershell
$BootstrapSkillsDir = Join-Path $Bootstrap 'src\opencode\skills'

$SkillSources = @(
    Get-ChildItem `
        -LiteralPath $BootstrapSkillsDir `
        -Directory `
        -Filter 'agentdev-*'
)

$JapaneseWritingSkill = Join-Path $BootstrapSkillsDir 'japanese-tech-writing'

if (Test-Path -LiteralPath $JapaneseWritingSkill) {
    $SkillSources += Get-Item -LiteralPath $JapaneseWritingSkill
}

if ($SkillSources.Count -eq 0) {
    throw 'bootstrap側に公開skillが見つかりません。'
}
```

各skillを接続します。

```powershell
foreach ($SkillSource in $SkillSources) {
    $SkillTarget = Join-Path $V3Repo ".opencode\skills\$($SkillSource.Name)"

    if (Test-Path -LiteralPath $SkillTarget) {
        cmd /c rmdir "`"$SkillTarget`""

        if (Test-Path -LiteralPath $SkillTarget) {
            throw "既存skill projectionを削除できませんでした: $SkillTarget"
        }
    }

    New-Item `
        -ItemType Junction `
        -Path $SkillTarget `
        -Target $SkillSource.FullName | Out-Null
}
```

ここでは`.opencode/commands/repo/`や`.opencode/skills/repo-*`を削除しません。

---

# 6. ジャンクションを検証する

commandを検証します。

```powershell
$CommandItem = Get-Item -LiteralPath $CommandTarget -Force

$CommandItem |
    Select-Object FullName, LinkType, Target
```

期待値：

* `LinkType`が`Junction`
* `Target`が`agent-dev-flow-v2-bootstrap\src\opencode\commands\agentdev`

skillsを検証します。

```powershell
Get-ChildItem -LiteralPath '.opencode\skills' -Directory -Force |
    Where-Object {
        $_.Name -like 'agentdev-*' -or
        $_.Name -eq 'japanese-tech-writing'
    } |
    Select-Object Name, LinkType, Target
```

すべて`Junction`で、Targetがbootstrap側であることを確認します。

リンク切れを検査します。

```powershell
$BrokenLinks = @()

$ProjectionItems = @(
    Get-Item -LiteralPath $CommandTarget -Force
    Get-ChildItem -LiteralPath '.opencode\skills' -Directory -Force |
        Where-Object {
            $_.Name -like 'agentdev-*' -or
            $_.Name -eq 'japanese-tech-writing'
        }
)

foreach ($Item in $ProjectionItems) {
    foreach ($Target in @($Item.Target)) {
        if (-not (Test-Path -LiteralPath $Target)) {
            $BrokenLinks += "$($Item.FullName) -> $Target"
        }
    }
}

if ($BrokenLinks.Count -gt 0) {
    $BrokenLinks
    throw 'リンク切れがあります。'
}

Write-Host 'すべてのbootstrap projectionが有効です。'
```

---

# 7. `plan.md`を配置する

`plan.md`を次へ配置します。

```text
C:\Users\ogatay\work\agent-dev-flow-v3\plan.md
```

確認します。

```powershell
$PlanPath = Join-Path $V3Repo 'plan.md'

if (-not (Test-Path -LiteralPath $PlanPath)) {
    throw 'plan.mdがまだ配置されていません。'
}

Get-Item -LiteralPath $PlanPath |
    Select-Object FullName, Length, LastWriteTime
```

`plan.md`をリポジトリ成果物としてcommitしない場合は、ローカル除外へ追加します。

```powershell
$ExcludePath = git -C $V3Repo rev-parse --git-path info/exclude
$ExcludeContent = Get-Content -LiteralPath $ExcludePath -ErrorAction SilentlyContinue

if ($ExcludeContent -notcontains '/plan.md') {
    Add-Content -LiteralPath $ExcludePath -Value '/plan.md'
}
```

注意点：linked worktreeの`info/exclude`は元リポジトリと共有される可能性があります。これはローカルGit設定であり、commitやpushはされません。

`plan.md`をv3成果物として管理する方針の場合、この除外操作は行いません。

---

# 8. 作業開始前の基準状態を記録する

v3 worktreeの状態を確認します。

```powershell
Set-Location $V3Repo

git status --short
git branch --show-current
git rev-parse HEAD
```

`plan.md`を除外した場合、`git status --short`は空であることが成功条件です。

bootstrapも再確認します。

```powershell
git -C $Bootstrap status --short
git -C $Bootstrap rev-parse HEAD
```

期待値：

* bootstrap statusは空
* bootstrap HEADは`$V2Commit`

基準情報を変数として保持します。

```powershell
$BootstrapBaselineCommit = git -C $Bootstrap rev-parse HEAD
$V3BaselineCommit = git -C $V3Repo rev-parse HEAD

Write-Host "Bootstrap baseline : $BootstrapBaselineCommit"
Write-Host "V3 baseline        : $V3BaselineCommit"
```

必要ならローカルファイルへ保存します。

```powershell
@"
bootstrap_tag=$V2Tag
bootstrap_commit=$BootstrapBaselineCommit
v3_branch=$V3Branch
v3_start_commit=$V3BaselineCommit
"@ | Set-Content `
    -LiteralPath (Join-Path $V3Repo '.v3-bootstrap-baseline.txt') `
    -Encoding utf8
```

このファイルもcommitしない場合は除外します。

```powershell
if ($ExcludeContent -notcontains '/.v3-bootstrap-baseline.txt') {
    Add-Content `
        -LiteralPath $ExcludePath `
        -Value '/.v3-bootstrap-baseline.txt'
}
```

---

# 9. OpenCodeを完全に再起動する

すでにOpenCodeを起動している場合、セッションを終了します。

ジャンクション切替前から動いているプロセスを使い続けると、commands/skillsのキャッシュやロード済み定義が残る可能性があります。

新しいターミナルで次を実行します。

```powershell
Set-Location $V3Repo
opencode .
```

OpenCodeの起動コマンドが異なる場合、その実行形式は不明です。現在利用している通常の起動方法を使用してください。

---

# 10. 実行エージェントへ最初に渡す制約

実行エージェントには、`plan.md`の実施に加えて、次を明示します。

```text
C:\Users\ogatay\work\agent-dev-flow-v3\plan.md を読み、
記載された実行計画を順番に実施すること。

実行環境に関する絶対制約:

- 作業対象リポジトリは
  C:\Users\ogatay\work\agent-dev-flow-v3
- 現在ロードされているAgentDevFlow command/skillは、
  C:\Users\ogatay\work\agent-dev-flow-v2-bootstrap
  のv2固定checkoutから提供されている
- 次のディレクトリは変更禁止:
  C:\Users\ogatay\work\agent-dev-flow-v2-bootstrap
- .opencode/commands/agentdev および
  .opencode/skills/agentdev-* はbootstrapへのjunctionであり、
  編集・削除・再生成・リンク変更を禁止する
- v3のcommand/skill変更は、
  src/opencode/
  src/opencode-local/
  その他plan.mdで指定された正規ソースだけに行う
- 作業途中で.opencodeをv3側srcへ切り替えない
- bootstrap checkoutでgit pull、checkout、resetを行わない
- plan.mdに記載されていないcommit、push、Issue作成、PR作成は行わない
- 未合意事項を推測して実装しない
```

実行エージェントが`src/opencode/`を書き換えても、現在実行中のcommand/skillはbootstrap側のv2なので影響を受けません。

---

# 11. 作業中の定期検査

各主要段階の終了時に、bootstrapが変更されていないことを確認します。

```powershell
$CurrentBootstrapCommit = git -C $Bootstrap rev-parse HEAD
$CurrentBootstrapStatus = git -C $Bootstrap status --short

if ($CurrentBootstrapCommit -ne $BootstrapBaselineCommit) {
    throw 'bootstrapのHEADが変更されています。作業を停止してください。'
}

if ($CurrentBootstrapStatus) {
    Write-Host $CurrentBootstrapStatus
    throw 'bootstrap checkoutが変更されています。作業を停止してください。'
}
```

`.opencode`がbootstrapを参照し続けていることも確認します。

```powershell
$ActualCommandTarget = (Get-Item -LiteralPath $CommandTarget -Force).Target

if (
    (Resolve-Path -LiteralPath $ActualCommandTarget).Path -ne
    (Resolve-Path -LiteralPath $CommandSource).Path
) {
    throw '.opencode commandの参照先が変更されています。'
}
```

skillsも確認します。

```powershell
foreach ($SkillSource in $SkillSources) {
    $SkillTarget = Join-Path $V3Repo ".opencode\skills\$($SkillSource.Name)"
    $ActualTarget = (Get-Item -LiteralPath $SkillTarget -Force).Target

    if (
        (Resolve-Path -LiteralPath $ActualTarget).Path -ne
        (Resolve-Path -LiteralPath $SkillSource.FullName).Path
    ) {
        throw "skillの参照先が変更されています: $($SkillSource.Name)"
    }
}
```

---

# 12. v3候補の検証用commitを作る

`plan.md`の作業が完了しても、作業treeの`src/`を直接`.opencode`へ接続してはいけません。

まずv3変更をcommitします。

```powershell
Set-Location $V3Repo

git status --short
git diff --stat
git diff
```

内容を確認後、plan.mdでcommitが許可されている場合だけcommitします。

```powershell
git add <plan.mdで指定された対象>
git commit -m "feat!: rebuild AgentDevFlow for v3"
```

検証対象commitを取得します。

```powershell
$V3CandidateCommit = git rev-parse HEAD
Write-Host "V3 candidate: $V3CandidateCommit"
```

commitメッセージは例です。実際のメッセージは実行計画またはリポジトリ規約に従ってください。

---

# 13. v3 smoke検証環境を作る

v3候補の実行確認は、現在の作業treeではなく別checkoutで行います。

```powershell
if (Test-Path -LiteralPath $SmokeRepo) {
    throw "$SmokeRepo はすでに存在します。"
}

git clone --no-checkout $RepoUrl $SmokeRepo
git -C $SmokeRepo checkout --detach $V3CandidateCommit
```

ただし、v3候補commitがまだremoteへpushされていない場合、GitHub cloneからは取得できません。

その場合は、元のローカルrepositoryをclone元にします。

```powershell
if (Test-Path -LiteralPath $SmokeRepo) {
    Remove-Item -LiteralPath $SmokeRepo -Recurse -Force
}

git clone --no-checkout $OriginalRepo $SmokeRepo
git -C $SmokeRepo checkout --detach $V3CandidateCommit
```

smoke checkoutがクリーンであることを確認します。

```powershell
git -C $SmokeRepo status --short
git -C $SmokeRepo rev-parse HEAD
```

---

# 14. smoke環境へv3 runtimeを投影する

smoke環境では、そのcheckout自身の`src/opencode/`を`.opencode/`へ接続します。

```powershell
$SmokeCommands = Join-Path $SmokeRepo '.opencode\commands'
$SmokeSkills   = Join-Path $SmokeRepo '.opencode\skills'

New-Item -ItemType Directory -Path $SmokeCommands -Force | Out-Null
New-Item -ItemType Directory -Path $SmokeSkills -Force | Out-Null
```

commandを接続します。

```powershell
$SmokeCommandSource = Join-Path $SmokeRepo 'src\opencode\commands\agentdev'
$SmokeCommandTarget = Join-Path $SmokeCommands 'agentdev'

if (Test-Path -LiteralPath $SmokeCommandTarget) {
    cmd /c rmdir "`"$SmokeCommandTarget`""
}

New-Item `
    -ItemType Junction `
    -Path $SmokeCommandTarget `
    -Target $SmokeCommandSource | Out-Null
```

skillsを接続します。

```powershell
$SmokeSkillSources = @(
    Get-ChildItem `
        -LiteralPath (Join-Path $SmokeRepo 'src\opencode\skills') `
        -Directory `
        -Filter 'agentdev-*'
)

$SmokeJapaneseSkill = Join-Path `
    $SmokeRepo `
    'src\opencode\skills\japanese-tech-writing'

if (Test-Path -LiteralPath $SmokeJapaneseSkill) {
    $SmokeSkillSources += Get-Item -LiteralPath $SmokeJapaneseSkill
}

foreach ($SkillSource in $SmokeSkillSources) {
    $Target = Join-Path $SmokeSkills $SkillSource.Name

    if (Test-Path -LiteralPath $Target) {
        cmd /c rmdir "`"$Target`""
    }

    New-Item `
        -ItemType Junction `
        -Path $Target `
        -Target $SkillSource.FullName | Out-Null
}
```

v3のinstallスクリプトが完成済みなら、手動ジャンクションではなく、その新しいinstall手順自体をsmoke test対象にします。

---

# 15. v3 smoke testを実施する

別のOpenCodeプロセスをsmoke環境で起動します。

```powershell
Set-Location $SmokeRepo
opencode .
```

最低限、以下を確認します。

1. command discoveryが成功する
2. `/agentdev/*`が認識される
3. `agentdev-*` skillsが認識される
4. commandから参照されるskill、script、templateにリンク切れがない
5. `docs-check`相当の検査が成功する
6. installのdry-run、check、applyが成功する
7. v3の最小ワークフローが隔離環境で実行できる
8. v2 bootstrapを参照していない
9. 作業treeの未commit差分を参照していない

具体的な検証コマンドは`plan.md`の内容に依存するため不明です。

---

# 16. v3切替前の最終確認

v3作業treeに戻ります。

```powershell
Set-Location $V3Repo
```

確認項目：

```powershell
git status --short
git log -1 --oneline
git rev-parse HEAD
```

bootstrap：

```powershell
git -C $Bootstrap status --short
git -C $Bootstrap rev-parse HEAD
```

smoke：

```powershell
git -C $SmokeRepo status --short
git -C $SmokeRepo rev-parse HEAD
```

成功条件：

* v3 worktreeの変更がすべて意図したcommitに含まれる
* bootstrapがv2固定commitのまま
* bootstrapに変更がない
* smokeがv3候補commitと一致する
* smoke checkoutに変更がない
* 必須検査がすべて成功している
* ロールバック先のv2 bootstrapが残っている

---

# 17. v3 runtimeへ切り替える

v3候補が承認された後だけ、作業treeの`.opencode`をv3確定checkoutへ切り替えます。

**作業tree自身の`src/`へ直接接続するのではなく、確定commitのクリーンcheckoutへ接続します。**

専用checkoutを作ります。

```powershell
$V3Runtime = 'C:\Users\ogatay\work\agent-dev-flow-v3-runtime'

if (Test-Path -LiteralPath $V3Runtime) {
    throw "$V3Runtime はすでに存在します。"
}

git clone --no-checkout $OriginalRepo $V3Runtime
git -C $V3Runtime checkout --detach $V3CandidateCommit
```

commandリンクをv3 runtimeへ切り替えます。

```powershell
Set-Location $V3Repo

cmd /c rmdir "`"$CommandTarget`""

$V3CommandSource = Join-Path `
    $V3Runtime `
    'src\opencode\commands\agentdev'

New-Item `
    -ItemType Junction `
    -Path $CommandTarget `
    -Target $V3CommandSource | Out-Null
```

skillsも切り替えます。

```powershell
$V3SkillsDir = Join-Path $V3Runtime 'src\opencode\skills'

$V3SkillSources = @(
    Get-ChildItem `
        -LiteralPath $V3SkillsDir `
        -Directory `
        -Filter 'agentdev-*'
)

$V3JapaneseSkill = Join-Path $V3SkillsDir 'japanese-tech-writing'

if (Test-Path -LiteralPath $V3JapaneseSkill) {
    $V3SkillSources += Get-Item -LiteralPath $V3JapaneseSkill
}

foreach ($OldSkill in $SkillSources) {
    $OldTarget = Join-Path $V3Repo ".opencode\skills\$($OldSkill.Name)"

    if (Test-Path -LiteralPath $OldTarget) {
        cmd /c rmdir "`"$OldTarget`""
    }
}

foreach ($V3SkillSource in $V3SkillSources) {
    $Target = Join-Path $V3Repo ".opencode\skills\$($V3SkillSource.Name)"

    New-Item `
        -ItemType Junction `
        -Path $Target `
        -Target $V3SkillSource.FullName | Out-Null
}
```

OpenCodeを完全に終了し、再起動します。

---

# 18. 問題発生時のロールバック

OpenCodeを終了します。

commandをv2へ戻します。

```powershell
Set-Location $V3Repo

if (Test-Path -LiteralPath $CommandTarget) {
    cmd /c rmdir "`"$CommandTarget`""
}

New-Item `
    -ItemType Junction `
    -Path $CommandTarget `
    -Target $CommandSource | Out-Null
```

v3 skillリンクを削除します。

```powershell
foreach ($V3SkillSource in $V3SkillSources) {
    $Target = Join-Path $V3Repo ".opencode\skills\$($V3SkillSource.Name)"

    if (Test-Path -LiteralPath $Target) {
        cmd /c rmdir "`"$Target`""
    }
}
```

v2 skillリンクを復旧します。

```powershell
foreach ($SkillSource in $SkillSources) {
    $Target = Join-Path $V3Repo ".opencode\skills\$($SkillSource.Name)"

    New-Item `
        -ItemType Junction `
        -Path $Target `
        -Target $SkillSource.FullName | Out-Null
}
```

OpenCodeを再起動します。

このロールバックで戻るのはcommand/skillランタイムです。v3作業によって`.agentdev/`の状態形式や管理ファイルを破壊的に移行していた場合、そのデータ復旧方法は別途`plan.md`に必要です。

---

# 最終ディレクトリ構成

```text
C:\Users\ogatay\work\
├─ agent-dev-flow\
│  └─ 元リポジトリ・worktree管理元
│
├─ agent-dev-flow-v3\
│  ├─ plan.md
│  ├─ src\                       v3変更対象
│  ├─ docs\                      v3変更対象
│  ├─ scripts\                   v3変更対象
│  └─ .opencode\
│     ├─ commands\agentdev\      → v2 bootstrap
│     └─ skills\agentdev-*\      → v2 bootstrap
│
├─ agent-dev-flow-v2-bootstrap\
│  └─ v2確定commit・変更禁止
│
├─ agent-dev-flow-v3-smoke\
│  └─ v3候補commitの隔離検証環境
│
└─ agent-dev-flow-v3-runtime\
   └─ 承認後のv3確定runtime
```

作業開始時点では、`v3-smoke`と`v3-runtime`はまだ作成不要です。最初に必要なのは次の3点です。

1. `agent-dev-flow-v3`をv2最終commit起点のworktreeにする
2. `agent-dev-flow-v2-bootstrap`をdetached HEADで固定する
3. `agent-dev-flow-v3/.opencode`をbootstrapへ向けた後、`plan.md`を実行する

