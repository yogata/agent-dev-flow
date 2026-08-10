# skill rename 時の src ↔ docs/specs/skills 対称性 guard

## 背景

Wave 2 #2034 で skill rename を実施した際、`src/opencode/skills/{old}` と `docs/specs/skills/{old}` の対称性（SPEC ファイル rename、frontmatter id、Artifact Graph node 関係）を全体管理する手順が不明瞭だった。rename 完了後に SPEC 側の参照更新漏れや node 関係の不整合が発覚し、手戻りが発生した。

## 問題

skill rename 実施時に `src/opencode/** ↔ docs/specs/**` の対称性検査が deterministic に走査されない。repo-local targeted docs guard の実装ギャップにより、rename 完了まで気づかない参照更新漏れが発生する。

## 望ましい変更

skill rename を伴う作業手順に、`src/opencode/skills/{name}` ↔ `docs/specs/skills/{name}` の対称性を deterministic に検査する観点を追加する。検査は物理 path の一致、frontmatter id の一致、Artifact Graph node 関係の整合を含む。

## 対象範囲

### 対象

- `docs/specs/integrity/targeted-docs-guard-implementation.md`（観点追加）
- `src/opencode/skills/repo-agentdev-integrity/SKILL.md`（検査手順）

### 対象外

- 配布 skill（`src/opencode/skills/agentdev-inspect-skills` 等）への固定内部 path 持ち込み。配布物境界（REQ-002）と衝突するため対象外。

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/specs/integrity/targeted-docs-guard-implementation.md | skill rename 時の src ↔ docs/specs/skills 対称性走査を観点に追加 |
| skill | src/opencode/skills/repo-agentdev-integrity/SKILL.md | 対称性検査手順を guard 手順へ統合 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `docs/specs/integrity/targeted-docs-guard-implementation.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: repo-local targeted docs guard の契約は存在するが、skill rename 時の `src ↔ docs/specs/skills` 対称性走査が明示されていない

## 制約

- 配布 skill（`src/opencode/skills/agentdev-inspect-skills` 等）へ repo 固有 path を持ち込まない（REQ-002 配布物境界）
- 対称性判定は frontmatter id と物理 path の一致を含む
- Artifact Graph node 関係の整合判定を含む

## 受け入れ条件

- [ ] skill rename を伴う作業手順に src ↔ docs/specs/skills 対称性検査が含まれる
- [ ] 対称性検査が targeted docs guard の観点に追加されている
- [ ] frontmatter id と物理 path の不一致を検出できる
- [ ] Artifact Graph node 関係の不整合を検出できる

## 元learning item / 根拠

- **要約**: skill rename 時の src/opencode/skills ↔ docs/specs/skills 対称性管理手順の不明瞭さ
- **根拠**: Wave 2 #2034 で skill rename 実施時に SPEC ファイル rename、frontmatter id、Artifact Graph node 関係の全体管理手順が不明瞭であった
- **再発条件**: skill rename を伴う作業
- **横展開可能性**: 将来の skill rename で再発。src/spec 対称性パターンは他の rename 作業にも適用可能

### source entry（個別証拠）

- **title**: skill rename 時の src/ と docs/specs/skills/ の対称性担保
- **観測事実**: skill rename 時に src ↔ docs/specs/skills 対称性の全体管理手順が不明瞭だった
- **関連PR/Issue**: #2034
- **対象 path**: `docs/specs/integrity/targeted-docs-guard-implementation.md`, `src/opencode/skills/repo-agentdev-integrity/SKILL.md`
- **再発条件**: skill rename を伴う作業
- **処分**: staged（repo-local）

## 推奨Issue分類

- **分類**: fix（検査基盤の拡充）
- **推奨ラベル**: enhancement, integrity
- **関連Issue**: #2034
