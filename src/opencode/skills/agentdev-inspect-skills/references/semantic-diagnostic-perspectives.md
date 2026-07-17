# 意味的診断観点の判定基準

> **原本**: REQ-0119-033（正規な定義元の原則）、REQ-0119-034（同一契約再定義抑止の原則）、artifact-responsibilities SPEC（責務分担マッピング、重複許容基準）。
> 本ファイルは inspect-skills 診断観点「意味的重複」「意味的矛盾」「正規な定義元からの逸脱」「セマンティクス欠落」（REQ-0125-003 根拠明記）の判定基準詳細を集約する運用ビューである（REQ-0125-004 準拠）。
> 原本と内容が重複する場合は原本を優先する。

## 目次

1. [適用範囲](#適用範囲)
2. [根拠原則](#根拠原則)
3. [診断観点](#診断観点)
4. [診断手順](#診断手順)
5. [誤認パターンと診断分類](#誤認パターンと診断分類)
6. [重複許容例外](#重複許容例外artifact-responsibilities-spec)
7. [出力形式](#出力形式)
8. [対象外](#対象外)

## 適用範囲

Command→Skill 参照妥当性診断で、Command/Skill/Template/Script 定義間の意味的整合性を横断的に検出する。各観点は REQ-0119-033（正規な定義元の原則）および REQ-0119-034（同一契約再定義抑止の原則）に照らして検出する（REQ-0125-003 根拠明記要件）。

従来の構造・参照の妥当性検査（USE FOR 照合、Skill 分割候補、実行主体分類、frontmatter 整合等）と互补関係にあり、本観点は意味段階の重複、矛盾、責務越境、契約欠落を担う。

## 根拠原則

### REQ-0119-033（正規な定義元の原則）

配布物種別間で責務ごとに正規な定義元を指定する原則。正規な定義元の候補は配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC のいずれかであり、責務ごとに最も安定した最小の定義元を正規とする。詳細な責務分担マッピングは artifact-responsibilities SPEC に委譲する。本原則は ADR-0107（Command/Skill/Template/Script 責任分界）の適用条件の精緻化である。

### REQ-0119-034（同一契約再定義抑止の原則）

同一の契約、手順、判定基準を複数の配布物で再定義しない原則。参照元は正規な定義元の再記述ではなく、参照先への参照と差分のみを保持する。例外として artifact-responsibilities SPEC が定める重複許容基準（SKILL ↔ command 同一ルール等）に該当する場合は、正の情報源を明示した上で重複を認める。例外基準の詳細は SPEC 側で維持する。

## 診断観点

### 意味的重複

同一の契約、手順、判定基準が複数の配布物で再定義されている箇所の検出。REQ-0119-034（同一契約再定義抑止の原則）に照らして検出する（REQ-0125-003 根拠明記）。

判定基準:

- 複数ファイルで同一の手続き契約（入力、出力、エラー扱い、前提、後続）が重複定義されている
- 複数ファイルで同一の判定ルール、閾値、分類基準、名前付け規則が再定義されている
- 複数ファイルで同一の操作手順（git / gh / worktree 等の安全手順）が重複している
- 参照元が正規な定義元への参照と差分を保持せず、本体を再記述している

例外: artifact-responsibilities SPEC の重複許容基準に該当し、正の情報源が明示されている場合は対象外（後述「重複許容例外」参照）。

診断分類: `semantic-duplication`

### 意味的矛盾

Command と Skill 間で工程、状態、責務、停止条件の意味が矛盾している検出。REQ-0119-033（正規な定義元の原則）および REQ-0119-034（同一契約再定義抑止の原則）に照らして検出する（REQ-0125-003 根拠明記）。

判定基準:

- 同一の手続き名に対する入力・出力・停止条件が Command と Skill 間で異なる
- 同一の状態名（Phase、Step、Result 型等）が異なる意味で使われている
- 同一の責務に対する責任主体が複数配布物で矛盾する（例: Command が自前実装を前提とするが、Skill が委譲を前提とする）
- 委譲契約の境界（何を委譲し、何を残すか）が Command と Skill 間で食い違う
- 停止条件、失敗時の扱い、リトライ境界が Command と Skill で矛盾する

診断分類: `semantic-contradiction`

### 正規な定義元からの逸脱

各責務が artifact-responsibilities SPEC のマッピングに照らして正規な定義元（配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC）に置かれているかの検出。REQ-0119-033（正規な定義元の原則）に照らして検出する（REQ-0125-003 根拠明記）。

判定基準:

- 配布 Command に Skill 側が持つべき判断基準、分類、プロトコルが記述されている（責務越境）
- Skill 本文に特定 Command の手順、Phase 名、Step 番号、局所導線が記述されている（責務越境）
- Template にロジック、分岐、判定が含まれ、Script または Skill の責務を越境している
- Script に宣言的ルール、判断基準、再利用可能なプロトコルが含まれ、Skill の責務を越境している
- REQ / ADR / SPEC で正規化されるべき内容が配布物に再定義されている
- harness 側の責務（外部実行基盤の実行制御等）が配布 Command / Skill に越境している

診断分類: `canonical-definition-deviation`

### セマンティクス欠落

疎結合化、抽象化、縮約により、意味、条件、成果物契約が欠落している検出。REQ-0119-034（同一契約再定義抑止の原則）に照らして検出する（REQ-0125-003 根拠明記）。

判定基準:

- 委譲先への参照があるが、受け渡すべき入力・前提・停止条件の記述が欠落している
- Skill が `USE FOR` / `DO NOT USE FOR` を持たず、適用境界が不明確
- references への参照があるが、参照元で前提とする文脈が説明されていない
- 抽象化、共通化により、元の意味・条件・成果物契約の一部が失われている
- 委譲契約で結果状態（success / blocked / failed 等）の定義が欠落している
- 公開契約（公開目的、入力、出力、停止条件、永続成果物、委譲接続点）の一部が欠落している

診断分類: `semantic-contract-missing`

## 診断手順

### 1. 対象配布物の特定

`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/` 配下の配布物を対象とする。関連する template / reference / script も必要に応じて含める。`src/opencode-local/` は別系統として扱うが、標準版との契約一致性を確認する場合は対象に含める。

### 2. 意味的重複の検出

複数配布物を横断し、同一の契約・手順・判定基準の重複を探す。検出時は以下を確認する:

- 重複している契約・手順・判定基準の特定（入力、出力、エラー扱い、前提、後続等）
- 正規な定義元の候補（REQ-0119-033）の特定
- artifact-responsibilities SPEC の重複許容基準への合致性（後述「重複許容例外」）
- 合致する場合、正の情報源が明示されているか

### 3. 意味的矛盾の検出

Command と参照先 Skill の対応箇所を突き合わせ、工程・状態・責務・停止条件の意味差異を検出する。委譲契約記述の一致性、結果状態の定義一致性、失敗時の扱いの一貫性を確認する。

### 4. 正規な定義元からの逸脱の検出

各配布物の記述が artifact-responsibilities SPEC のマッピングに照らして正規な定義元に置かれているかを確認する。責務越境（Command に Skill 要素、Skill に Command 固有手順、Template / Script の責務越境等）を検出する。

### 5. セマンティクス欠落の検出

参照・委譲・抽象化の箇所で、必要な契約要素（入力・前提・停止条件・適用境界・出力等）が欠落していないかを確認する。公開契約の網羅性を確認する。

### 6. 検出事項の報告

検出した事項を各診断分類で報告する。Recommended route は対象配布物の種別（`command` / `skill` / `references` / `template` / `script`）と修正方向（正規な定義元への移送、差分への置換、欠落契約の補充等）による。

## 誤認パターンと診断分類

| 検出パターン | 例 | 診断分類 |
|---|---|---|
| 手続き契約の重複定義 | 複数 Skill で「Issue 作成」手続きの入力・出力・エラー扱いが重複し、正の情報源が明示されていない | semantic-duplication |
| 判定基準の重複 | 複数ファイルで同一の名前付け規則、分類閾値が再定義されている | semantic-duplication |
| 操作手順の重複 | 複数 Skill で同一の git / gh 安全手順が再記述されている（operation Skill への参照で足りる） | semantic-duplication |
| 状態名の意味矛盾 | Command の `completed` 状態と Skill の `completed` 状態が異なる結果を意味する | semantic-contradiction |
| 委譲境界の食い違い | Command が委譲すると主張する処理を Skill 側が受け持っていない、あるいはその逆 | semantic-contradiction |
| 停止条件の矛盾 | Command は `failed` で即停止するが、Skill は `failed` 後のリカバリを前提とする | semantic-contradiction |
| Command に Skill 要素越境 | 配布 Command に複数 Command で再利用される判断基準・分類が埋め込まれている | canonical-definition-deviation |
| Skill に Command 固有手順越境 | Skill 本文に特定 Command の Phase 名・Step 番号が記述されている | canonical-definition-deviation |
| Template にロジック越境 | Template に分岐・判定が含まれ、Script または Skill の責務を越境している | canonical-definition-deviation |
| Script に宣言ルール越境 | Script に再利用可能な宣言的ルール・判断基準が含まれ、Skill の責務を越境している | canonical-definition-deviation |
| REQ/ADR/SPEC 内容の配布物再定義 | REQ で正規化されるべき契約・分類が配布物に再定義されている | canonical-definition-deviation |
| 参照の前提欠落 | references への参照があるが参照元で前提文脈が記述されない | semantic-contract-missing |
| 適用境界不明確 | Skill が `USE FOR` / `DO NOT USE FOR` を持たず、適用境界が不明確 | semantic-contract-missing |
| 結果状態の定義欠落 | 委譲契約で success / blocked / failed 等の結果状態が定義されていない | semantic-contract-missing |
| 公開契約の一部欠落 | 公開目的、入力、出力、停止条件、永続成果物、委譲接続点のいずれかが欠落 | semantic-contract-missing |

## 重複許容例外（artifact-responsibilities SPEC）

artifact-responsibilities SPEC が定める重複許容基準に該当する場合、正の情報源を明示した上で重複を認める（REQ-0119-034 例外）。本診断では該当する場合でも以下を確認する:

- 重複が許容基準に合致すること（SKILL ↔ command 同一ルール等、SPEC が定める基準）
- 正の情報源が明示されていること（どちらを正とし、どちらを差分として扱うかの明示）
- 差分（あるいは意図的同一である旨）が記述されていること

許容基準に合致しない重複、正の情報源が明示されていない重複は `semantic-duplication` として報告する。

## 出力形式

検出した事項は SKILL.md「出力形式」セクションの Finding 形式で報告する（REQ-0125-005 形式: 対象・観点・分類・根拠・推奨経路）。Classification には各診断分類（`semantic-duplication` / `semantic-contradiction` / `canonical-definition-deviation` / `semantic-contract-missing`）を使用する。Recommended route には対象配布物の種別と修正方向を提示する。

報告例:

```markdown
- Finding: Issue 作成手続きの契約が agentdev-gh-cli/references/contracts.md と別 Skill で重複定義されている
- Target: src/opencode/skills/agentdev-XXX/references/foo.md
- Perspective: 意味的重複
- Classification: semantic-duplication
- Evidence: 入力（Issue 番号、本文）と出力（Issue URL）が contracts.md と同一だが、正の情報源が明示されていない。REQ-0119-034 の重複許容例外（artifact-responsibilities SPEC）に合致しない
- Recommended route: references
```

```markdown
- Finding: Skill 本文に case-open 固有の Phase 名が記述され、Command 固有手順が越境している
- Target: src/opencode/skills/agentdev-YYY/SKILL.md
- Perspective: 正規な定義元からの逸脱
- Classification: canonical-definition-deviation
- Evidence: SKILL.md「## 手順」に case-open の Phase 2「Issue 作成」という Command 固有記述がある。REQ-0119-033 の正規な定義元の原則に照らし、当該手順は case-open Command が正規な定義元
- Recommended route: command
```

## 対象外

- 機械的パターンマッチングによる検出（`load_skills` 誤指定、`/` 先頭識別子表記等）は integrity-rule-catalog SPEC（IR-050、IR-051、REQ 準拠）が担う。本観点は意味的・文脈的な検出を担う。
- SPEC 操作契約テーブルと references/contracts.md のフィールド一致性は別観点（[spec-operation-contract-consistency.md](spec-operation-contract-consistency.md)）が担う。本観点は意味段階の重複・矛盾・越境・欠落に限定し、SPEC- contracts.md 間のフィールド単位の突合は含まない。
- 配布物の Markdown 構文健全性、frontmatter 構文は別観点（配布物 frontmatter 構文健全性等）が担う。
- 公開契約の維持（横断是正の前後で公開目的・入力・出力・停止条件等を維持すること）は REQ-0119-035 が担う。本観点は静的記述の意味整合性に限定し、是正作業の前後比較は含まない。
- 横断評価の対象範囲の網羅（全配布 Command/Skill を対象とすること）は REQ-0119-036 が担う。本観点は個別の検出基準を扱う。

## See Also

- **原本**: REQ-0119-033（正規な定義元の原則）、REQ-0119-034（同一契約再定義抑止の原則）
- **artifact-responsibilities SPEC**: 責務分担マッピング、重複許容基準
- **REQ-0125-003**: 診断観点列挙と根拠明記要件
- **REQ-0125-005**: 検出事項の報告形式（対象・観点・分類・根拠・推奨経路）
- **ADR-0107**: Command/Skill/Template/Script 責任分界
- **[spec-operation-contract-consistency.md](spec-operation-contract-consistency.md)**: SPEC 操作契約テーブルと contracts.md のフィールド一致性（本観点と互补）
