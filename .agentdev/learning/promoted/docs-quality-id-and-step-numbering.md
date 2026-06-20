# ドキュメント作成品質ガイドの強化（ID 桁数・Step 番号・ADR 番号）

## 背景

AgentDevFlow の文書作成・要件定義・パーサ実装において、ID 桁数・REQ の Step 番号記述・ADR 番号取り扱いに関する品質ガイドの欠落が3件のトラブルとして現れた。いずれも「規定の一部は存在するが、実践者向けのガイドが不明確」または「規定自体が欠落」というパターン。個別の是正ではなく、関連する3件をまとめて品質ガイドを整備することで、今後のドキュメント作成・パーサ実装での手戻りを包括的に予防する。

## 問題

以下の3つの品質ガイド欠落が、それぞれ異なる場面でトラブルを引き起こした：

1. **IR ID の桁数規定（3桁）が docs/specs/system.md / REQ-0101 / AGENTS.md のいずれにも不在**（Issue #898）
   - REQ ID は4桁（REQ-0101）と REQ-0101-003 で規定済み
   - しかし IR ID は3桁（IR-001 等）という規定が全くなく、REQ ID との対比注意喚起もない
   - catalog/impact-map パーサ実装で、REQ ID の正規表現を `/^REQ-\d{3}$/` と3桁で書いてしまい、REQ ID が一切マッチしない不具合が発生
   - 正規表現サンプルや実データ併記の慣習も不在

2. **REQ-0101-068 で規定済みの「Step 番号は command reference 等へ配置」が実践ガイドに反映されていない**（Issue #903 RU-5 IR-044）
   - REQ-0101-068 は「要件行が Step 番号のみを主たる文意とする場合、SPEC・ルールカタログ・command reference・skill reference・test docs のいずれかに配置する対象であること」を規定済み
   - しかし req-file-manager SKILL / command-authoring SKILL / AGENTS.md 編集ガードレールのいずれにも、この規定の実践ガイド（「REQ には振る舞いを書く」「Step 番号は command reference へ」「REQ に command の Step 番号を直接書かない」）が不在
   - 実際に REQ-0131-010 / REQ-0104-047 / REQ-0114-060/063 / REQ-0136-010 で Step 番号固定の drift が発生し、IR-044 で検出された

3. **req-define で ADR 番号を推測指定すると adr-file-manager 採番ルール（max+1, 欠番埋め禁止）と矛盾する**（Issue #944 Epic）
   - case-auto 並列 Wave 実行モデルの req-save で、draft の artifact_actions に ADR-0115 と指定されていた
   - adr-file-manager 採番ルールは「欠番の再利用禁止（常に最大番号+1）」であり、ADR-0115 は ADR-0114 と ADR-0123 の間の欠番
   - 最大番号は ADR-0124 のため正しい番号は ADR-0125 となり、draft 内の全参照（AG-006, AG-007, REQ改訂内容, SPEC改訂内容）で ADR-0115 → ADR-0125 の置換が必要だった
   - req-define / req-save / adr-file-manager のいずれにも、ADR 番号を req-define 側で推測指定すべきでない（`new:{slug}` 形式を推奨）というガイドが不在

## 望ましい変更

3つの品質ガイド欠落を、それぞれ適切な反映先に整備する。

### 1. IR ID 桁数規定の整備

`docs/specs/system.md` の ID 体系セクション、または REQ-0101（ID 関連項目）に、以下を追記：

- IR ID は3桁ゼロ埋め（`IR-NNN`、例: IR-001）であること
- REQ ID は4桁（`REQ-NNNN`、例: REQ-0101）との対比注意喚起
- パーサ・バリデータ実装時の正規表現サンプル（`/^REQ-\d{4}$/`, `/^IR-\d{3}$/`）

### 2. REQ Step 番号ガイドの実践反映

REQ-0101-068 の実践ガイドを、以下に追記：

- `agentdev-req-file-manager/SKILL.md`: 「REQ には振る舞いを書く」「Step 番号は command reference へ委ねる」「REQ に command の Step 番号を直接書かない」
- `AGENTS.md` 編集ガードレール: 上記ガイドの要約
- `agentdev-command-authoring/SKILL.md`: REQ と command の責務分離观点からのガイド

### 3. ADR 番号取り扱いガイドの整備

`req-define` / `req-save` / `agentdev-adr-file-manager` に、以下を追記：

- req-define 側では ADR 番号を推測指定せず、`new:{slug}` 形式を使用することを推奨
- req-save は artifact_actions 処理時に ADR 番号を adr-file-manager 採番ルール（max+1, 欠番埋め禁止）で再検証し、矛盾時に自動修正またはユーザー確認すること
- adr-file-manager SKILL の採番ルールを強調し、req-define / req-save から参照しやすくすること

## 対象範囲

### 対象

- `docs/specs/system.md`（ID 体系セクション）
- `docs/requirements/REQ-0101.md`（必要に応じて IR ID 桁数の要件行追加、または REQ-0101-068 の実践ガイド参照追記）
- `AGENTS.md`（編集ガードレール・信頼できる情報源）
- `src/opencode/skills/agentdev-req-file-manager/SKILL.md`（REQ 作成ガイド・APPEND セクション）
- `src/opencode/skills/agentdev-command-authoring/SKILL.md`（REQ と command の責務分離）
- `src/opencode/skills/agentdev-adr-file-manager/SKILL.md`（採番ルールの強調）
- `src/opencode/commands/agentdev/req-define.md`（artifact_actions の ADR 番号ガイド）
- `src/opencode/commands/agentdev/req-save.md`（ADR 番号再検証ガイド）

### 対象外

- integrity スクリプト（check_integrity.ts）での Step 番号検出ルールの追加（別途 inspect-skills / req-structure-diagnostics で検討）
- 既存の drift した REQ（REQ-0131-010 等）の是正（本 artifact の適用後に個別是正 Issue で対応）
- 新規スキル・コマンドの作成

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/system.md` | ID 体系セクションに IR ID 3桁規定・REQ ID 4桁との対比・正規表現サンプルを追記 |
| req | `docs/requirements/REQ-0101.md` | （オプション）IR ID 桁数の要件行追加、または REQ-0101-068 の実践ガイド参照を明記 |
| agents | `AGENTS.md` | 編集ガードレールに「REQ には振る舞いを書く・Step 番号は command reference へ・ADR 番号は req-save が決定」を要約追記 |
| skill | `src/opencode/skills/agentdev-req-file-manager/SKILL.md` | REQ 作成ガイドに「REQ には振る舞いを書く」「Step 番号は command reference へ」を追記。ADR 番号は `new:{slug}` を推奨し req-save が採番ルールで検証する旨を追記 |
| skill | `src/opencode/skills/agentdev-command-authoring/SKILL.md` | REQ と command の責務分離セクションに、Step 番号は command reference 側に保持し REQ から抽象化するガイドを追記 |
| skill | `src/opencode/skills/agentdev-adr-file-manager/SKILL.md` | 採番ルール（max+1, 欠番埋め禁止）を強調表示し、req-define / req-save から参照されることを明記 |
| command | `src/opencode/commands/agentdev/req-define.md` | artifact_actions で ADR を新規作成する場合、`new:{slug}` 形式を推奨し番号の直接指定を避けるガイドを追記 |
| command | `src/opencode/commands/agentdev/req-save.md` | artifact_actions 処理時に ADR 番号を adr-file-manager 採番ルールで再検証し、矛盾時に修正するガイドを追記 |

## 既存対策確認

- **確認結果**: 3エントリとも partial（fix gap / application miss）
- **該当ファイル**:
  - `docs/requirements/REQ-0101.md:18`（REQ-0101-003「REQ ID は4桁ゼロ埋めの安定ID」）
  - `src/opencode/skills/agentdev-req-file-manager/SKILL.md:25, 182`（`REQ-{NNNN}` 4桁ゼロ埋め）
  - `docs/requirements/REQ-0101.md:71`（REQ-0101-068「Step 番号のみを主たる文意とする場合は command reference 等に配置」）
  - `src/opencode/commands/agentdev/req-define.md:64`（`target_spec` の `new:{topic-slug}` 仕様）
  - `src/opencode/commands/agentdev/req-save.md:6`（artifact_actions 処理）
- **ギャップ分類**:
  - #2 REQ/IR 桁数: **fix gap**（IR ID 3桁規定が全ファイルで不在）
  - #5 REQ Step 番号 drift: **application miss**（REQ-0101-068 で規定済み、実践ガイドが不在）
  - #7 ADR 番号矛盾: **部分**（target:new:{slug} 仕様あり、req-define 側推測指定のガイド不在）
- **ギャップ詳細**:
  - IR ID 桁数（3桁 IR-NNN）が docs/specs/system.md / REQ-0101 / AGENTS.md のいずれにも不在。REQ ID との対比注意喚起も不在。正規表現サンプルの慣習も不在
  - REQ-0101-068 で Step 番号配置は規定済みだが、req-file-manager SKILL / AGENTS.md 編集ガードレール / command-authoring SKILL のいずれにも実践ガイド（「REQ には振る舞いを書く」「Step 番号は command reference へ」）が不在
  - `target_spec` の `new:{topic-slug}` 仕様はあるが、req-define が ADR 番号を推測指定した場合の問題と推奨形式（`new:{slug}`）が req-define.md に明示されていない。req-save 側での番号再検証ガイドも不在

## 制約

- AGENTS.md「信頼できる情報源の優先順位」に従い、矛盾がないこと。矛盾がある場合は現行 REQ > ADR > SPEC > ガイドの順で優先
- AGENTS.md「編集ガードレール」に従い、正となる文書を追加・移動する際、関連するインデックス・DOC-MAP・リンク・相互参照を更新すること
- REQ-0101-068 を変更するのではなく、実践ガイドを補強する形（REQ-0101-068 自体は現行維持）
- 新しい要件または更新された要件に裏付けられた場合を除き、新しいワークフロー状態を発明しないこと
- IR ID 桁数の規定は既存 REQ-0101-003（REQ ID 4桁）との整合性を保つこと。新規 REQ の追加ではなく SPEC または既存 REQ への追記で対応できるかを優先
- source（`src/opencode/`）と projection（`.opencode/`）の両辺を編集すること

## 受け入れ条件

- [ ] `docs/specs/system.md` または REQ-0101 に IR ID 3桁規定（`IR-NNN`）と REQ ID 4桁との対比が追記されている
- [ ] `docs/specs/system.md` または関連ドキュメントに正規表現サンプル（`/^REQ-\d{4}$/`, `/^IR-\d{3}$/`）が併記されている
- [ ] `agentdev-req-file-manager/SKILL.md` に「REQ には振る舞いを書く」「Step 番号は command reference へ」「REQ に command の Step 番号を直接書かない」ガイドが追記されている
- [ ] `AGENTS.md` 編集ガードレールに REQ Step 番号ガイドの要約が追記されている
- [ ] `agentdev-command-authoring/SKILL.md` に REQ と command の責務分離ガイドが追記されている
- [ ] `req-define.md` に ADR 新規作成時の `new:{slug}` 推奨と番号直接指定回避のガイドが追記されている
- [ ] `req-save.md` に artifact_actions 処理時の ADR 番号再検証ガイドが追記されている
- [ ] `agentdev-adr-file-manager/SKILL.md` で採番ルール（max+1, 欠番埋め禁止）が req-define / req-save からの参照対象として強調されている
- [ ] source（`src/opencode/`）と projection（`.opencode/`）の両辺が編集されている
- [ ] `agentdev-inspect-skills` / `agentdev-req-structure-diagnostics` で参照整合性エラーが検出されない
- [ ] AGENTS.md の「信頼できる情報源の優先順位」と矛盾しない

## 元learning item / 根拠

- **要約**: AgentDevFlow の文書作成品質ガイドに3つの欠落（IR ID 桁数規定・REQ Step 番号の実践ガイド・ADR 番号取り扱いガイド）があり、それぞれ別の場面でトラブルを引き起こした。いずれも「規定の一部は存在するが実践ガイドが不明確」または「規定自体が欠落」というパターン
- **根拠**:
  - **#2 (2026-06-18, Issue #898)**: catalog/impact-map パーサ実装で REQ ID の正規表現を3桁で書いてしまいマッチしない不具合。REQ ID は4桁（REQ-0101）・IR ID は3桁（IR-001）の桁数差を認識せず正規表現を書いたことが原因
  - **#5 (2026-06-18, Issue #903 RU-5 IR-044)**: REQ-0131-010 等 が command の Step 番号を固定しており、command リファクタで drift。REQ-0104-047 / REQ-0114-060/063 / REQ-0136-010 でも同様。REQ-0101-068 で規定済みだが実践ガイドが不在
  - **#7 (2026-06-20, Issue #944 Epic)**: req-define で ADR-0115 を指定したが adr-file-manager 採番ルール（max+1, 欠番埋め禁止）と矛盾。正しくは ADR-0125。draft 内の全参照で番号置換が必要だった
- **再発条件**:
  - パーサ・バリデータ実装時に ID 体系を確認せず正規表現を書く全ケース（#2）
  - REQ を新規作成・更新する際、要件行に command の Step 番号を直接書く全ケース（#5）
  - req-define で ADR 番号を content タイトルに直接書く全ケース（#7）
- **横展開可能性**: いずれも AgentDevFlow 固有だが、文書作成・パーサ実装・要件定義の全場面で発生し得る。特に新規参加者がガイドなしに作業する場合に高確率で再発

## 推奨Issue分類

- **分類**: enhancement（既存スキル・コマンド・SPEC へのガイド追記）または documentation
- **推奨ラベル**: enhancement, documentation, agentdev
- **関連Issue**: Issue #898, #903, #944
