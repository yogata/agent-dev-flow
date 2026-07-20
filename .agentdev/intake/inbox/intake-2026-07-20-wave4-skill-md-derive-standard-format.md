# Wave 4 SKILL.md DERIVE 機構 - SPEC確定候補

## 由来
- PR #1631, Issue #1627, Epic #1622 Wave 4
- SC-002 Phase D（文書品質ドメイン完結）
- REQ-0140-041/042, AG-012, U-012

## 候補1: SKILL.md 原本節の標準フォーマット

### 現状
Wave 4 で25ファイルの SKILL.md（中核7 + 補助18）に frontmatter 直後の原本（SSoT）節を新設した。各 SKILL.md で節タイトル、配置位置、記述形式が揃っているが、標準フォーマットとして SPEC で明文化されていない。

### 確定候補内容
document-type-responsibilities.md の「SKILL 構造（概要節/機能節役割分担）」セクション（L130-142）に、原本節の標準フォーマットを追記:

```
### 原本節（SSoT 宣言）

SKILL.md の frontmatter 直後に「原本」節を配置し、以下を明示する:
- SPEC（`docs/specs/skills/agentdev-{name}.md`）への相対パスリンクを原本（SSoT）として明示
- 本 SKILL.md は実行入口であり、SPEC を SSoT として DERIVE する宣言
- extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、重複しない補完情報のみを提供する関係（U-012 解消）

**禁止**: 原本節に AgentDevFlow 内部 ID（REQ-XXXX/ADR-XXXX/SPEC-{KIND}-{NNN}/IR-XX 等）を直接含めること（IR-055 strict violation 対策、詳細は学習 inbox の Wave 4 実証エントリ参照）。
```

### 想定反映先
- `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL 構造セクション）
- `src/opencode/skills/agentdev-skill-authoring/`（SKILL.md テンプレート）

### 優先度
medium（運用実績は Wave 4 で確立済、SPEC 明文化は保守性向上）

## 候補2: U-012 解消パターン

### 現状
U-012（extension と SKILL.md の記載重複）は Wave 4 で原本節に extension と SKILL.md の関係宣言を含める形式で解消した。この解消パターンが SPEC で明文化されていない。

### 確定候補内容
document-type-responsibilities.md の「SKILL 構造」セクションに、U-012 解消パターンを追記:

```
### extension と SKILL.md の関係（U-012 解消）

extension（`.agentdev/extensions/skills/{name}.yaml`）は標準 SKILL.md（`src/opencode/skills/{name}/SKILL.md`）を前提として補完する関係とする:
- SKILL.md が原本（配布物、自然言語記述の SSoT）
- extension は SKILL.md に記載されないプロジェクト固有の設定（パス解決、プロジェクト ID 等）のみを提供
- 同じ内容を両方に記載しない（重複回避）

この関係は SKILL.md の原本節で宣言し、extension ファイルのヘッダコメントでも再宣言する。
```

### 想定反映先
- `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL 構造セクション）
- `src/opencode/skills/agentdev-skill-authoring/`（SKILL.md テンプレート、extension テンプレート）

### 優先度
medium（U-012 解消は Wave 4 で実施済、SPEC 明文化は再発防止）

## 候補3: check_integrity.ts のベースライン delta 計測の整理（低優先）

### 現状
Wave 4 の check_integrity.ts 実行で「381 new NG (delta)」が報告された。これはベースライン（d72b8f0b）時点の既存コードに由来する NG であり、Wave 4 の変更による新規 NG は0件。ただし「new NG (delta)」という表現が、ベースライン比較ロジックの仕様を正確に反映していない可能性。

### 確定候補内容
check_integrity.ts のベースライン比較ロジックと出力メッセージの整理:
- ベースライン時点の既知 NG と、今回の変更による新規 NG を明確に区別
- 出力メッセージの「delta」の意味を明確化

### 想定反映先
- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（ベースライン比較ロジック）

### 優先度
low（機能的には問題ない、報告の明確化のみ）

## 関連
- Wave 1 capture: intake-2026-07-20-ir-060-related-req-normalization.md
- Wave 2 capture: intake-2026-07-20-wave2-autogen-block-spec.md
- Wave 3 capture: intake-2026-07-20-wave3-spec-line-count-autogen-exclusion.md
- Wave 4 learning: learning/inbox.md「配布物 SKILL.md の DERIVE 宣言に内部 ID を含めると IR-055 strict violation となる設計制約」
