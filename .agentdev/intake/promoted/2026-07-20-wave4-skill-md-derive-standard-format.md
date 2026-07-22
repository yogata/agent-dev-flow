# Wave 4 SKILL.md DERIVE 機構の標準フォーマット SPEC 確定候補

## 観測内容

Wave 4（PR #1631）で25ファイルの SKILL.md（中核7 + 補助18）に frontmatter 直後の原本（SSoT）節を新設した。各 SKILL.md で節タイトル、配置位置、記述形式が揃っているが、標準フォーマットとして SPEC で明文化されていない。

U-012（extension と SKILL.md の記載重複）は Wave 4 で原本節に extension と SKILL.md の関係宣言を含める形式で解消した。この解消パターンも SPEC で明文化されていない。

加えて、Wave 4 の check_integrity.ts 実行で「381 new NG (delta)」が報告された。これはベースライン（d72b8f0b）時点の既存コードに由来する NG であり、Wave 4 の変更による新規 NG は0件。「new NG (delta)」という表現が、ベースライン比較ロジックの仕様を正確に反映していない可能性がある。

- 由来 PR: #1631
- 由来 Issue: #1627
- Epic: #1622 Wave 4（SC-002 Phase D: 文書品質ドメイン完結）

## 影響

重要度: 候補1・2 は medium、候補3 は low。候補1（原本節標準フォーマット）と候補2（U-012 解消パターン）は Wave 4 で運用実績が確立済だが SPEC 化されておらず、新規 SKILL.md 作成時にフォーマットが揺らぐ。候補3 は報告メッセージの明確化のみで機能問題はない。

## 課題

3つの独立した候補が混在する。

- 候補1: SKILL.md 原本節（SSoT 宣言）の標準フォーマットが SPEC 未明文化。
- 候補2: extension と SKILL.md の関係（U-012 解消パターン）が SPEC 未明文化。
- 候補3: check_integrity.ts のベースライン delta 計測の出力メッセージが、既知 NG と新規 NG を明確に区別していない。

## 既存要件・仕様との関連

- `document-type-responsibilities.md`「SKILL 構造（概要節/機能節役割分担）」セクション（L130-142）: 原本節の標準フォーマット・extension との関係が未記載（差分）。
- REQ-0140-041/042、AG-012: Wave 4 DERIVE 機構の要件・監査項目。
- U-012: extension と SKILL.md の記載重複問題。Wave 4 で解消済みだが SPEC 未明文化。
- IR-055（strict violation）: 配布物 SKILL.md の DERIVE 宣言に内部 ID（REQ-XXXX/ADR-XXXX/SPEC-{KIND}-{NNN}/IR-XX 等）を含めると strict violation となる設計制約。原本節フォーマットの禁止事項の根拠。

## 対応方針の方向性

候補1（優先度 medium）: `document-type-responsibilities.md` の SKILL 構造セクションへ原本節（SSoT 宣言）の標準フォーマットを追記。SPEC への相対パスリンク明示、DERIVE 宣言、extension との関係（U-012 解消）を含める。原本節に AgentDevFlow 内部 ID を直接含めることを禁止（IR-055 strict violation 対策）。

候補2（優先度 medium）: 同セクションへ U-012 解消パターンを追記。SKILL.md が原本（配布物、自然言語記述の SSoT）、extension は SKILL.md に記載されないプロジェクト固有設定のみを提供する関係を明文化。同じ内容を両方に記載しない（重複回避）。この関係を SKILL.md 原本節で宣言し、extension ファイルのヘッダコメントでも再宣言する。

候補3（優先度 low）: check_integrity.ts のベースライン比較ロジックと出力メッセージを整理。ベースライン時点の既知 NG と今回の変更による新規 NG を明確に区別し、「delta」の意味を明確化。

想定反映先: `document-type-responsibilities.md`（SKILL 構造セクション）、`agentdev-skill-authoring/`（SKILL.md テンプレート、extension テンプレート）、`check_integrity.ts`（ベースライン比較ロジック）。
