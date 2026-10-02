---
name: agentdev-skill-resolution
description: Owns the host-independent deterministic contract for skill discovery, bundled asset resolution, and workspace root resolution. USE FOR: resolving parent/child skills via entry projections with canonical fallback and workspace containment checks. DO NOT USE FOR: host runtime bindings, skill content judgment, editing skills, installing distributions.
---

# Skill 探索・読込と workspace 解決（skill-resolution）

このスキルは、親と子の Skill 読込、同梱 reference・template・script の参照解決、実行時 workspace の解決を、ホスト差の背後で同一に保つ決定的契約の**正規所有者**として機能する。業務契約の正本は共通正本側に置かれ、ホスト接続領域（`src/opencode/`、`src/senpi/`）は公開入口の束縛のみを行い、解決規則を重複実装しない。

- **このスキル（契約本体）**: 探索・読込・同梱参照解決・workspace 解決の決定的 lib と対応 test、公開契約の記述
- **適用先**: 各ホスト接続領域の Skill 探索・読込接続（共通 lib への束縛）、Skill 読込経路の契約検証

---

## 責務

本スキルは**決定的解決のみ**を所有する。Skill 本文の内容判断、Skill の編集、配布・導入、ホストランタイムの結合は対象外。

| 責務 | 本スキル | 対象外（他の責務） |
|------|----------|--------------------|
| 親・子 Skill の探索・読込契約 | ✓ | ホスト接続領域（entry root の束縛） |
| 同梱 reference・template・script の参照解決 | ✓ | Skill 本文の内容判断 |
| 実行時 workspace root の解決と収束検証 | ✓ | 編集操作・Tool・guard の個別意味論 |
| 破損した投影 entry（stale・未伝播リンク相当）の skip | ✓ | 投影の再構築（installer・運用） |
| Skill 読込経路の契約 test | ✓ | 実ランタイムでの全組合せ試験記録 |

## 解決規約（fail-closed）

1. **workspace root 解決**: ADF ドメイン状態ディレクトリ（`.agentdev/`）を workspace root の唯一の認識根拠とする。マーカーが存在しない場合、workspace root を解決せず、失敗を返す。cwd、環境変数、ドライブ構成からの推測を行わない。
2. **workspace 収束**: 編集対象と Tool・guard が解決したパスは、指定された workspace root 配下に収まることを要請する。兄弟 workspace、親ディレクトリ、無関係なドライブへの越出しは、副作用の前に拒否する。
3. **Skill 探索**: Skill 名はディレクトリ名の形状（英数字とハイフン）に限定し、名前経由の越出しを成立させない。解決はホストの公開入口投影を優先し、読める `SKILL.md` を持たない entry（stale 相当）は skip して共通正本へ fallback する。どこにも存在しない場合は推測せず見つからないを返す。
4. **親と子**: 子 Skill は親 Skill ディレクトリ相対ではなく、親と同一のホスト契約で解決する。
5. **同梱参照解決**: Skill に同梱された reference・template・script は Skill ディレクトリ相対で解決し、Skill ディレクトリの外へ越出しする参照は、ファイルシステムへ触れる前に拒否する。Skill root 内に収まる相対パスは合法であり、不在の場合は不在を返す。
6. **決定性**: 存在確認以外の読み込みを行わず、環境に依存せず、結果は入力のみから決まる。

## 公開契約（`scripts/src/skill-resolution.ts`）

| 関数 | 役割 |
|------|------|
| `resolveWorkspaceRoot(startDir)` | `.agentdev/` マーカーを根拠に workspace root を解決する |
| `isWithinWorkspace(workspaceRoot, target)` / `assertWithinWorkspace(...)` | 指定 workspace への収束を検証する（fail-closed gate） |
| `discoverSkill({ skillName, entrySkillsDirs, canonicalSkillsDir })` | 公開入口投影を優先し、共通正本へ fallback して親・子 Skill を解決する |
| `resolveSkillAsset(entry, relativeRef)` | 同梱 reference・template・script を Skill root 相対で解決する |
| `isValidSkillName(skillName)` | Skill 名の形状を検証する |

各関数は成否を明示した判別結果（`ok` と失敗理由）を返し、例外を解決経路の制御に使わない。

## 実行方法

```bash
bun test ./src/common/skills/agentdev-skill-resolution/scripts/tests/skill-resolution.test.ts
```

テストは一時ディレクトリ配下に workspace を構成し、メインリポジトリや他 worktree に書き込まない。

## 関連

- マルチホスト正本モデル Design: 共通正本とホスト接続領域の配置契約。本スキルは「Skill 探索の業務契約は共通正本側所有」を lib として実装する
- **agentdev-project-extensions**: 実行時プロジェクト固有拡張の読み込み。Skill 読込契約の上に接続される
- **agentdev-case-run-execution-adapter**: worktree 隔離と委譲契約。指定 workspace への収束の利用側

## See Also

- **agentdev-project-extensions**
- **agentdev-case-run-execution-adapter**
