# case-close Epic Wave クローズ（E1-E6）の lettered prefix 形式の取り扱い

## 観測

PR #1014 (Issue #1013 / REQ-0143) で全 command 定義ファイルを `docs/specs/command-file-format.md` の Step 形式へ準拠させた。その際 `case-close.md` の Epic Wave クローズフロー（`## 手順` → `### Epic Wave クローズ` 配下）が `**E1.**` `**E2.**` ... の lettered prefix 形式を使用していることが判明した。これらは `### Step N:` 見出しではないが、代替フロー（Epic Issue 入力時）内のサブステップとして機能しているため、今回の準拠作業では手つかずとした。現在の `check_command_format.ts` は `### Step N:` 形式のみを主手順として扱い、`**EN.**` 形式を検査対象外としている。

## 影響

- Epic Wave クローズフローのサブステップ表現が `### Step N:` 規約から外れており、command file format の一貫性が完全ではない。
- 将来のフォーマット拡張で `**EN.**` 形式を許容するか・`### Step N:` へ統合するか・代替フロー専用の表現として SPEC へ明記するかの判断が未定。

## レビューで決めること

- `**EN.**` lettered prefix を command file format SPEC で「代替フロー内サブステップ」として公式に許容するか。
- 許容する場合、`check_command_format.ts` の検査対象を拡張して代替フロー内の形式を検証するか、それとも検査対象外のままにするか。
- 許容しない場合、`case-close.md` の E1-E6 を `### Step N:` 形式へ再構成するか。

## 根拠

- PR #1014: https://github.com/yogata/agent-dev-flow/pull/1014
- Issue #1013: https://github.com/yogata/agent-dev-flow/issues/1013
- SPEC: `docs/specs/command-file-format.md`
- 対象: `src/opencode/commands/agentdev/case-close.md`（Epic Wave クローズ E1-E6）
- チェッカー: `src/opencode/skills/repo-agentdev-integrity/scripts/check_command_format.ts`
