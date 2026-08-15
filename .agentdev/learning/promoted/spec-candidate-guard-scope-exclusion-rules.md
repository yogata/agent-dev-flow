# guard / checker の検出対象除外規定の明文化（非 SPEC ファイル・歴史参照・worktree 環境差）（spec 候補）

## 背景

guard / checker が検出対象の除外規定を持たないため、3種の false positive・判定揺れが発生した:

1. **非 SPEC ファイル**: `docs/specs/` 配下の baseline snapshot 等 SPEC schema を持たないファイルが、targeted docs guard に機械的に SPEC README 登録候補（`spec_readme_update_required: true`）として検出される（PR #2084、`pre-audit-baseline-20260811.md`）
2. **廃止識別子の歴史参照**: IR 廃止・MERGE 時、監査文書・baseline の歴史的言及が機能的残存と区別されない。DEC-013 AG-008「履歴性は Git で担保」の適用範囲が歴史記録ファイルを含むか不明確（PR #2089、IR-019/022/026/036、TS-017）
3. **worktree 環境差**: Windows + junction 環境の worktree で `.opencode/skills/agentdev-*` が空洞化し、check_templates.ts 等が template 参照を解決できず false positive（PR #2090。main merge 後に解消）

## 問題

検出対象の範囲規定（何を除外するか）が不在で、検証ノイズと判定揺れが反復する。E6 は false positive そのものではなく「判定基準の未規定による解釈判断」（残置判断）であり、クラス題名は「対象範囲規定の未整備」と読むのが正確。

## 望ましい変更

1. targeted docs guard が frontmatter または配置ディレクトリに基づき SPEC 判定を行い、非 SPEC ファイルは `spec_readme_update_required` フラグを抑止（または `docs/specs/README.md` の登録対象基準を明文化）
2. 歴史記録ファイル（`docs/specs/integrity/audits/`、`docs/specs/integrity/baselines/` 等）を残存参照判定の対象外とする規定を DEC-013 AG-008 または TS-017 判定基準へ明記
3. worktree 上で実行する checker が `.opencode/skills/` の空洞化を検知した場合の warning/skip フラグ（または main リポジトリ projection 参照のフォールバック）

## 対象範囲

### 対象

- `check_changed_docs.ts`（targeted docs guard）の SPEC 判定ロジック
- DEC-013 AG-008 / TS-017 の残存参照判定基準
- `check_templates.ts` 等の worktree 環境検知

### 対象外

- check_templates.ts の `--dry-run` 系テスト3件の安定化（パス解決の worktree 耐性）— `intake-2026-08-15-check-templates-dryrun-worktree-failures.md`（intake inbox）が管理。backlog-review で統合前提
- 監査文書・baseline の識別子言及の削除（歴史担保原則により残置が正）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| script | `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` | frontmatter/配置による SPEC 判定とフラグ制御 |
| spec 候補 / docs | `docs/decisions/DEC-013.md`（AG-008 適用範囲明確化）、`docs/specs/integrity/integrity-contracts.md` 等の IR 運用 SPEC（TS-017 判定基準）、`docs/specs/README.md`（登録対象基準） | 歴史記録ファイルの対象外規定 |
| script | `src/opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts` | worktree 空洞化検知時の skip/warning ロジック |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `agentdev-workflow-orchestration` SKILL.md「準備フェーズの既知の制約」（junction 未伝播の既知事実）、intake item（テスト側安定化）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 非 SPEC ファイル・歴史参照・worktree 環境差の対象外規定が checker 仕様・SPEC に存在しない

## 制約

- 本クラスは3つの単発顕現（厳密な3要素同一規則では分解しうる）を単一の予防策族（対象外規定の明文化）に集約した構成である。経路D review でこの構成を維持したが、将来の再評価で分解を検討しうる
- 歴史参照の残置判断（時点 snapshot は編集しない）を損なわない

## 受け入れ条件

- [ ] 非 SPEC ファイルの README 登録候補抑止（または登録対象基準の明文化）が実施されている
- [ ] 歴史記録ディレクトリの残存参照判定対象外規定が明文化されている
- [ ] worktree 空洞化検知の warning/skip が check_templates.ts に実装されている（またはその要否が判断されている）

## 元learning item / 根拠

- **要約**: guard/checker の検出対象除外規定不在で、非 SPEC 判定・歴史参照・worktree 環境差の3種の false positive・判定揺れが発生
- **根拠**: PR #2084（spec_readme_update_required フラグ、warning 扱い継続）、PR #2089（TS-017 で5件検出、時点 snapshot 残置判断）、PR #2090（worktree 12 fail / main 11 fail の差分分析）
- **再発条件**: docs/specs/ 配下に非 SPEC ファイルを新規作成 / IR 廃止・MERGE で歴史記録に言及が残る / Windows+junction worktree で .opencode/skills/ 参照 checker を実行する場合
- **横展開可能性**: 中程度。guard を持つプロジェクト全般。環境差検知は Windows/junction 固有

## 推奨Issue分類

- **分類**: fix（checker 仕様改善）または chore（規定明文化のみの場合）
- **推奨ラベル**: integrity, false-positive, windows
- **関連Issue**: Epic #2076（PR #2084、#2089、#2090）、intake-2026-08-15-check-templates-dryrun-worktree-failures.md
