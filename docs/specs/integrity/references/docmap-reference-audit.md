# integrity DOC-MAP 参照個別生死判定監査

> 本ファイルは REQ-013-020 が要求する integrity スクリプト群の DOC-MAP 参照45件（実測: 行レベル109件、論理ユニット51件）の個別生死判定結果を保持する。`docs/DOC-MAP.md` は REQ-013-001（PR #1953/#1958）で除去済みであり、本監査は残存参照の除去優先度整備を目的とし、除去作業そのものは後続 Issue が担う。

## 目的

`docs/DOC-MAP.md` は REQ-013-001（PR #1953/#1958）で除去済みである。本監査は integrity スクリプト群に残存する DOC-MAP 参照全件について、一律の dead code 断定を禁じ（REQ-013-020）、参照ごとに「生きている（必要）」「死んでいる（除去可能）」を個別に判定し、判定結果の記録様式と除去優先度を整備する。

前提事実を以下に示す。

- `docs/DOC-MAP.md` は存在しない（REQ-013-001 達成済み）。
- DOC-MAP が担っていた導線は `docs/specs/README.md`、`docs/README.md`、各 README へ統合済み（REQ-013-018/019）。
- `agentdev-doc-map` 配布スキル、`docs/specs/skills/agentdev-doc-map.md` SPEC は REQ-013-002/003 で除去済み。
- IR-017（DOC-MAP ↔ 実体整合性）は REQ-013-006 で抹消済み。

## 監査範囲

対象は `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の TypeScript ファイルである。本スキルは自己ホスティング専用であり、`src/opencode/skills/` には実体を持たない（ジャンクションでもない）。

対象ファイル 9 点（アルファベット順）。

1. `check_autogen_freshness.ts`
2. `check_changed_docs.ts`
3. `check_integrity.ts`
4. `check_integrity.test.ts`
5. `cli_utils.ts`
6. `generate_indexes.ts`
7. `regression_issue616.test.ts`
8. `regression_mapping_table_contract_removed.test.ts`
9. `regression_req_id_width.test.ts`

行レベルマッチはパターン（`DOC-MAP`、`docmap`、`DocMap`、`DOC_MAP`）の組合せで 100 件超、論理ユニット（関数、定数、ブロック単位の集合）は 44 件である。Issue #1996 が挙げる「45件」は主スクリプト群（テスト除く）の論理ユニット概算と解釈し、本監査は過不足なく全件を扱う。

対象外。

- `src/opencode/skills/agentdev-*/`（配布スキル）。REQ-013-013/014/015 で個別に扱う。
- `docs/` 配下の SPEC、ガイド、README。REQ-013-010/016/017/018/019 で個別に扱う。
- 過去版 tag `v2.11.0` の歴史記録（REQ-013 適用範囲外）。

## 監査手法

各参照について次の 4 分類のいずれかを割り当てる。分類は「参照先（DOC-MAP 本体または DOC-MAP 概念）が現在も機能しているか」と「参照元コードが実行時 no-op または dead code か」の組合せで決まる。

| 分類 | 記号 | 定義 | 除去可否 |
|------|------|------|----------|
| 機能維持 | `LIVE` | 参照先が現行体系で必要、または除去すると検査体系が破壊される | 除去不可 |
| 機能死亡 | `DEAD-FN` | 参照先が既に不在、コードが実行時エラーまたは恒久的 no-op になる | 除去可能 |
| 誘導死亡 | `DEAD-REDIRECT` | 参照は存在チェック等で保護されており無害だが、到達不能パスである | 除去可能（低優先） |
| 注釈死亡 | `DEAD-DOC` | コメント、メッセージ、ログ中の言及。動作に影響しない | 除去可能（最低優先） |

テストフィクスチャは被テストコード（`DEAD-FN`）と運命を共にするため `DEAD-FN` 扱いとし、被テストコードの除去単位で一括更新する。

## 判定結果サマリ

論理ユニット 44 件の分類集計。

| 分類 | 件数 | 内訳 |
|------|------|------|
| `LIVE` | 1 | DOC-MAP 除去後に「分類なし」を表現する `scanned.DocMap` の `0` 固定値（参照 31）。現行の inventory 出力互換性のため一時維持。Phase 2 で inventory 出力項目自体を削除する候補 |
| `DEAD-FN` | 27 | checkDocMap* 関数群、generateDocMapInventory、AG-013 AUTOGEN 検証、docmap-update-required ルール、結合解決、分類ポリシー、テストフィクスチャ |
| `DEAD-REDIRECT` | 8 | `fs.existsSync` で保護された到達不能スキャン対象、`rel ===` ガード、存在しないパスの正規表現 |
| `DEAD-DOC` | 8 | コメント、エラーメッセージ、ログ文字列、OK メッセージ中の言及 |

Phase 別集計（除去 Roadmap対応）。

| Phase | 件数 | 概要 |
|-------|------|------|
| Phase 1（高優先） | 27 | 機能的 dead code（`DEAD-FN`） |
| Phase 2（中優先） | 9 | 到達不能パス整理（`DEAD-REDIRECT` 8件 + `LIVE` 1件の再評価候補） |
| Phase 3（低優先） | 8 | コメント・メッセージ整理（`DEAD-DOC`） |

ファイル別件数。

| ファイル | 件数 | 主分類 |
|----------|------|--------|
| `check_integrity.ts` | 18 | `DEAD-FN`（関数群、分類ポリシー、AUTOGEN 検証、呼び出し）、`DEAD-REDIRECT`（スキャンリスト）、`LIVE`（inventory 出力）、`DEAD-DOC`（コメント、メッセージ） |
| `check_changed_docs.ts` | 8 | `DEAD-FN`（ルール、結合解決、ロジック）、`DEAD-REDIRECT`（appliesTo、正規表現）、`DEAD-DOC`（コメント） |
| `generate_indexes.ts` | 5 | `DEAD-FN`（生成関数、更新セクション）、`DEAD-DOC`（コメント） |
| `check_integrity.test.ts` | 4 | `DEAD-FN`（フィクスチャ、分類件数検査） |
| `check_autogen_freshness.ts` | 3 | `DEAD-FN`（検証ブロック、import、パス定数） |
| `cli_utils.ts` | 3 | `DEAD-FN`（分類マップ、判定分岐）、`DEAD-DOC`（JSDoc） |
| `regression_*.test.ts`（3 ファイル） | 3 | `DEAD-FN`（フィクスチャ、assertion） |

生存 1 件は後段「参照 31」で詳述する。生存が 1 件のみにとどまる理由は、DOC-MAP が完全除去（REQ-013-001）された結果、DOC-MAP を読む全コードが到達不能になったためである。生存 1 件も「参照しないと inventory 出力形式が変わり下遊互換性が壊れる」だけであり、本質的には DOC-MAP を必要としていない。

## 個別判定

各エントリの形式は「ID、ファイル:行、コード断片、分類、根拠、Phase」である。Phase は「除去優先度」節の Roadmap に対応する。

### check_integrity.ts

#### 参照 1: import generateDocMapInventory

- ファイル: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts:47`
- 断片: `generateDocMapInventory,`
- 分類: `DEAD-FN`
- 根拠: 参照 28（AG-013 検証）でのみ使用。参照 28 が dead のため連鎖 dead
- Phase: 1

#### 参照 2-5: コメント中の DOC-MAP 言及（AC-7 コメントブロック）

- ファイル: `check_integrity.ts:161-166, 182`
- 断片: `checkUpdateNotesInDocs, scanned.Specs, SPEC inventory 照合、DOC-MAP と SPEC の…`（複数行コメント）
- 分類: `DEAD-DOC`
- 根拠: コメント内の設計説明。動作無関係。DOC-MAP 除去後は SPEC inventory 照合が README と docs/specs/README.md で完結する旨へ修正する候補
- Phase: 3

#### 参照 6: 検出パターン名 `DOC-MAP更新時`

- ファイル: `check_integrity.ts:1207`
- 断片: `{ pattern: /DOC-MAP更新時/, name: "DOC-MAP更新時" },`
- 分類: `DEAD-FN`
- 根拠: 現行 REQ 体系に「DOC-MAP更新時」パターンは存在しない。検出対象文書が存在しないため恒久的非検出
- Phase: 1

#### 参照 7: checkCanonicalBoundary 内 DOC-MAP ブロック

- ファイル: `check_integrity.ts:1779-1801`
- 断片:

```typescript
const docMapPath = path.join(root, "docs", "DOC-MAP.md");
const docMapContent = readText(docMapPath);
if (docMapContent) { ... }
```

- 分類: `DEAD-REDIRECT`
- 根拠: `readText` が `null` を返すため `if` ブロックは実行されない。checkCanonicalBoundary 本体は guides 検査で成立するため DOC-MAP ブロック除去で機能不変
- Phase: 2

#### 参照 8: filesToCheck への DOC-MAP push（expanded legacy namespace scan）

- ファイル: `check_integrity.ts:2008-2010`
- 断片:

```typescript
const docMapPath = path.join(root, "docs", "DOC-MAP.md");
if (fs.existsSync(docMapPath)) filesToCheck.push(docMapPath);
```

- 分類: `DEAD-REDIRECT`
- 根拠: `fs.existsSync` が false を返すため push 不可。残りのスキャン対象で検査は成立
- Phase: 2

#### 参照 9-11: checkDocMapReqSync 関数

- ファイル: `check_integrity.ts:2154-2202`
- 断片: 関数全体（`docMapPath`、`docmap-req-sync` check id、`DOC-MAP.md not found` info メッセージ、`referenced in DOC-MAP but REQ file does not exist` ng、`All DOC-MAP REQ references match existing files` ok）
- 分類: `DEAD-FN`
- 根拠: DOC-MAP 本体不在のため冒頭 `if (!docMapContent)` で `return results` する。info `DOC-MAP.md not found` を発するのみで検査実質なし
- Phase: 1

#### 参照 12-14: checkDocMapSpecSync 関数

- ファイル: `check_integrity.ts:2204-2257`
- 断片: 関数全体（`docmap-spec-sync` check id 含む）
- 分類: `DEAD-FN`
- 根拠: 参照 9-11 と同構造。SPEC 同期は docs/specs/README.md（IR-039）で担保済み
- Phase: 1

#### 参照 15-17: checkDocMapGuideSync 関数

- ファイル: `check_integrity.ts:2259-2311`
- 断片: 関数全体（`docmap-guide-sync` check id 含む）
- 分類: `DEAD-FN`
- 根拠: 参照 9-11 と同構造。guide 同期は別経路で担保済み
- Phase: 1

#### 参照 18: filesToScan の DOC-MAP エントリ（checkUpdateNotesInDocs スキャン）

- ファイル: `check_integrity.ts:4072`
- 断片: `path.join(root, "docs", "DOC-MAP.md"),`
- 分類: `DEAD-REDIRECT`
- 根拠: ループ内 `if (!fs.existsSync(scanTarget)) continue;` で skip される
- Phase: 2

#### 参照 19: checkAbolishedSkillReferences の DOC-MAP スコープ

- ファイル: `check_integrity.ts:4445-4447`
- 断片:

```typescript
const docMap = path.join(root, "docs", "DOC-MAP.md");
if (fs.existsSync(docMap)) filesToScan.push(docMap);
```

- 分類: `DEAD-REDIRECT`
- 根拠: 存在チェックで保護。DOC-MAP を除いても廃止スキル検査は specs/guides で成立
- Phase: 2

#### 参照 20: checkReqRangeStaleness の filesToCheck DOC-MAP エントリ

- ファイル: `check_integrity.ts:4533`
- 断片: `{ absPath: path.join(root, "docs", "DOC-MAP.md"), label: "DOC-MAP.md" },`
- 分類: `DEAD-REDIRECT`
- 根拠: 後続の `readText` で null、skip される。REQ 範囲表記検査は AGENTS.md、system.md、guides で成立
- Phase: 2

#### 参照 21: DOCUMENT_CLASSIFICATIONS の DOC-MAP エントリ

- ファイル: `check_integrity.ts:5661`
- 断片: `const DOCUMENT_CLASSIFICATIONS = ["REQ", "ADR", "SPEC", "Guide", "Report", "DOC-MAP"] as const;`
- 分類: `DEAD-FN`
- 根拠: DOC-MAP 分類の実体（docs/DOC-MAP.md）が不在。参照 22 とセットで 5 分類へ縮退する。件数検査 `DOCUMENT_CLASSIFICATIONS.length !== 6` も 5 へ更新が必要
- Phase: 1

#### 参照 22: checkDocumentClassificationPolicy の DOC-MAP 存在確認

- ファイル: `check_integrity.ts:5713-5728`
- 断片: `docmap-collection` check（`DOC-MAP collection exists at docs/DOC-MAP.md` / `DOC-MAP.md not found — DOC-MAP classification has no instances`）
- 分類: `DEAD-FN`
- 根拠: DOC-MAP 不在のため恒常的に「not found — no instances」info を発する。分類体系から DOC-MAP を除去（参照 21）すれば本チェック自体が不要
- Phase: 1

#### 参照 23: dirsToScan の DOC-MAP エントリ（checkWorkflowStatusProhibition 系）

- ファイル: `check_integrity.ts:5942`
- 断片: `path.join(root, "docs", "DOC-MAP.md"),`
- 分類: `DEAD-REDIRECT`
- 根拠: `if (!fs.existsSync(target)) continue;` で skip。guides、specs で検査成立
- Phase: 2

#### 参照 24-27: AG-013 DOC-MAP AUTOGEN ブロック検証

- ファイル: `check_integrity.ts:8204-8231`
- 断片:

```typescript
const docMapPath = path.join(root, "docs", "DOC-MAP.md");
const docMapContent = readText(docMapPath);
if (docMapContent !== null) { ... verifyAutogenBlocksInFile ... }
```

- 分類: `DEAD-FN`
- 根拠: `readText` が null を返すため `if` ブロック全体が実行されない。AUTOGEN 検証対象から DOC-MAP を除去しても検査体系は不変（IR-061 は README 群で構成）
- Phase: 1

#### 参照 28: IndexGenerationConsistency OK メッセージ

- ファイル: `check_integrity.ts:8312`
- 断片: `... ADR README + REQ README + DOC-MAP + req-health-metrics + ...`
- 分類: `DEAD-DOC`
- 根拠: メッセージ文字列。DOC-MAP 除去後にメッセージも更新する候補
- Phase: 3

#### 参照 29-30: checkDocMap*Sync 呼び出し

- ファイル: `check_integrity.ts:8771-8773`
- 断片:

```typescript
...checkDocMapReqSync(root),
...checkDocMapSpecSync(root),
...checkDocMapGuideSync(root),
```

- 分類: `DEAD-FN`
- 根拠: 参照 9-17 の関数呼び出し。関数除去とセットで削除
- Phase: 1

#### 参照 31: scanned.DocMap カウント

- ファイル: `check_integrity.ts:8712`
- 断片: `DocMap: fs.existsSync(path.join(root, "docs", "DOC-MAP.md")) ? 1 : 0,`
- 分類: `LIVE`
- 根拠: `scanned` オブジェクトは dry-run 出力および inventory 形式の一部。現状 `0` 固定だが、`scanned` オブジェクトの形状を変えると dry-run 出力を消費する下遊（未確認だが可能性として存在）が壊れる。Phase 2 で `scanned` オブジェクト形状自体の見直し候補。即時除去は避ける
- Phase: 2

### generate_indexes.ts

#### 参照 32: generateDocMapInventory import 元コメント

- ファイル: `generate_indexes.ts:457`
- 断片: `* REQ メタデータ（AG-009 REQ README / AG-013 DOC-MAP 自動生成の source）。`
- 分類: `DEAD-DOC`
- 根拠: コメント。AG-013 は廃止概念
- Phase: 3

#### 参照 33-36: AG-013 DOC-MAP 生成セクション

- ファイル: `generate_indexes.ts:729-760`
- 断片: セクションヘッダコメント、`DOCMAP_INVENTORY_BLOCK_ID` 定数、`generateDocMapInventory` 関数
- 分類: `DEAD-FN`
- 根拠: docs/DOC-MAP.md が存在しないため生成先がない。関数は参照 24-27（検証側）と参照 38-39（更新側）でのみ呼ばれ、いずれも dead
- Phase: 1

#### 参照 37: AG-013 対象ファイルリストコメント

- ファイル: `generate_indexes.ts:1130`
- 断片: `- docs/DOC-MAP.md (inventory stats)`
- 分類: `DEAD-DOC`
- 根拠: ヘルプテキスト相当のコメント
- Phase: 3

#### 参照 38: docMapPath 代入

- ファイル: `generate_indexes.ts:1186`
- 断片: `const docMapPath = path.join(root, "docs", "DOC-MAP.md");`
- 分類: `DEAD-FN`
- 根拠: 参照 39 でのみ使用
- Phase: 1

#### 参照 39-43: DOC-MAP 更新（AG-013）セクション

- ファイル: `generate_indexes.ts:1397-1417, 1515`
- 断片:

```typescript
// DOC-MAP 更新 (AG-013)
const docMapOriginal = readText(docMapPath);
if (docMapOriginal === null) {
  console.error(`[generate_indexes] DOC-MAP not found: ${docMapPath}`);
  process.exit(EXIT_ERROR);
}
```

- 分類: `DEAD-FN`
- 根拠: `readText` が null を返すため `process.exit(EXIT_ERROR)` で異常終了する。`bun run generate_indexes.ts` は現行 repo では実行不能（exit code 1）。ただし `bun run generate_indexes.ts --help` 等でパス処理前に抜ける経路を除き、本セクション到達で即異常終了する。これは実質的に generate_indexes.ts の全面起動を妨げる重大 dead code である。Phase 1 で最優先除去
- Phase: 1

### check_changed_docs.ts

#### 参照 44: モジュールヘッダコメント

- ファイル: `check_changed_docs.ts:11`
- 断片: `*   3. coupled file resolver     — 変更ファイルに連動する README/DOC-MAP/related を特定`
- 分類: `DEAD-DOC`
- 根拠: コメント。結合解決から DOC-MAP を除去後に更新
- Phase: 3

#### 参照 45-47: docmap-update-required ルール（3 プロファイル）

- ファイル: `check_changed_docs.ts:247, 266, 290`
- 断片: `"docmap-update-required",`（req-save、spec-save、case-run プロファイル）
- 分類: `DEAD-FN`
- 根拠: 参照 50（docMapUpdateRequired ロジック）を発動させるルール。DOC-MAP 本体不在のため更新要否判定自体が無意味
- Phase: 1

#### 参照 48: case-run appliesTo の DOC-MAP 条件

- ファイル: `check_changed_docs.ts:283`
- 断片: `rel === "docs/DOC-MAP.md" ||`
- 分類: `DEAD-REDIRECT`
- 根拠: 変更ファイルに `docs/DOC-MAP.md` が含まれることはない（ファイル不在）。appliesTo から当該条件を除去しても判定結果不変
- Phase: 2

#### 参照 49-51: couplingFor* の DOC-MAP 結合

- ファイル: `check_changed_docs.ts:322, 333, 341`
- 断片: `coupled.add("docs/DOC-MAP.md");`（couplingForReq、couplingForSpec、defaultCoupling）
- 分類: `DEAD-FN`
- 根拠: 結合先ファイルが不在。`resolveCoupledFiles` で `fs.existsSync(full)` が false を返し除外されるため実行時無害だが、結合解決の意図が DOC-MAP 更新連動である以上 dead。README 結合だけ残す
- Phase: 1

#### 参照 52: 行レベル差分コメント

- ファイル: `check_changed_docs.ts:539`
- 断片: `// extension 参照対象、DOC-MAP/README 生成元）へ影響するかで判定する（SPEC`
- 分類: `DEAD-DOC`
- 根拠: コメント
- Phase: 3

#### 参照 53-54: docMapUpdateRequired ロジック

- ファイル: `check_changed_docs.ts:818-825`
- 断片:

```typescript
const docMapUpdateRequired = profile.rules.includes("docmap-update-required")
  ? detectUpdateRequired(
      root,
      changedFiles,
      "docs/DOC-MAP.md",
      (rel) => rel.includes("REQ-") || rel.includes("docs/specs/"),
    )
  : false;
```

- 分類: `DEAD-FN`
- 根拠: 参照 45-47 がルールリストから除去されれば `false` 固定。DOC-MAP 本体不在のため `detectUpdateRequired` の戻り値に関わらず出力 JSON の `docmap_update_required` は意味を持たない。参照 45-47 とセットで除去
- Phase: 1

#### 参照 55: full_docs_check_recommended コメント

- ファイル: `check_changed_docs.ts:848`
- 断片: `// full_docs_check_recommended: integrity rule 追加/削除、DOC-MAP 構造変更、docs/specs 大規模移動、extensions 変更等`
- 分類: `DEAD-DOC`
- 根拠: コメント
- Phase: 3

#### 参照 56: full_docs_check_recommended 正規表現

- ファイル: `check_changed_docs.ts:859`
- 断片: `/docs\/DOC-MAP\.md/.test(rel) ||`
- 分類: `DEAD-REDIRECT`
- 根拠: 変更ファイルに DOC-MAP は含まれ得ないため、この条件は恒久的 false。除去しても `full_docs_check_recommended` 判定不変
- Phase: 2

### check_autogen_freshness.ts

#### 参照 57-58: import と DOC-MAP inventory 定数参照

- ファイル: `check_autogen_freshness.ts:47, 65`
- 断片: `generateDocMapInventory,` import、`DOCMAP_INVENTORY_BLOCK_ID,` import
- 分類: `DEAD-FN`
- 根拠: 参照 60 でのみ使用
- Phase: 1

#### 参照 59: docMapPath 代入

- ファイル: `check_autogen_freshness.ts:302`
- 断片: `const docMapPath = path.join(root, "docs", "DOC-MAP.md");`
- 分類: `DEAD-FN`
- 根拠: 参照 60 で使用。DOC-MAP 不在のため検査対象外
- Phase: 1

#### 参照 60: DOC-MAP AUTOGEN ブロック検証

- ファイル: `check_autogen_freshness.ts:395-399`
- 断片:

```typescript
// DOC-MAP（1ブロック）。
{
  blockId: DOCMAP_INVENTORY_BLOCK_ID,
  expected: generateDocMapInventory({ ... }),
}
```

- 分類: `DEAD-FN`
- 根拠: 検査対象の `docs/DOC-MAP.md` が存在しないため検証自体が意味を持たない。ファイル存在確認で保護されている場合は no-op、されていない場合は `readText` が null で skip
- Phase: 1

### cli_utils.ts

#### 参照 61: artifact 型コメント

- ファイル: `cli_utils.ts:61`
- 断片: `/** Type of artifact: "req", "adr", "skill", "command", "spec", "template", "guide", "docmap", "retired" */`
- 分類: `DEAD-DOC`
- 根拠: JSDoc コメント。`"docmap"` は参照 64 とセットで除去
- Phase: 3

#### 参照 62-64: docmap-* finding マッピング

- ファイル: `cli_utils.ts:455-457`
- 断片:

```typescript
"docmap-req-sync": "broken-reference",
"docmap-spec-sync": "broken-reference",
"docmap-guide-sync": "broken-reference",
```

- 分類: `DEAD-FN`
- 根拠: check id `docmap-*` を発する checkDocMap* 関数（参照 9-17）が dead。マッピングも dead
- Phase: 1

#### 参照 65: classifyArtifactType docmap 分岐

- ファイル: `cli_utils.ts:512`
- 断片: `if (lower.includes("docmap")) return "docmap";`
- 分類: `DEAD-FN`
- 根拠: `docmap-*` check が発動しないため到達不能
- Phase: 1

### check_integrity.test.ts

#### 参照 66-67: DOC-MAP.md フィクスチャ作成

- ファイル: `check_integrity.test.ts:187-189`
- 断片: `join(docsDir, "DOC-MAP.md"),`、`"# DOC-MAP",`
- 分類: `DEAD-FN`
- 根拠: checkDocMap* 関数をテストするためのフィクスチャ。被テスト関数（参照 9-17）除去とセットで削除
- Phase: 1

#### 参照 68-69: 分類ポリシーテスト

- ファイル: `check_integrity.test.ts:826-835`
- 断片: `it("verifies DOC-MAP classification instance exists", ...)`、`res.check === "docmap-collection"`
- 分類: `DEAD-FN`
- 根拠: docmap-collection check（参照 22）が dead。テストも dead
- Phase: 1

#### 参照 70-71: 分類件数検査

- ファイル: `check_integrity.test.ts:856-857`
- 断片: `it("6 classifications are recognized: REQ, ADR, SPEC, Guide, Report, DOC-MAP", ...)`、`const expectedClassifications = ["REQ", "ADR", "SPEC", "Guide", "Report", "DOC-MAP"];`
- 分類: `DEAD-FN`
- 根拠: 参照 21 で DOC-MAP を分類リストから除去する際、件数を 6 → 5 へ更新する
- Phase: 1

#### 参照 72: docmap-req-sync フィクスチャ

- ファイル: `check_integrity.test.ts:2043`
- 断片: `writeFileSync(join(root, "docs", "DOC-MAP.md"), "# DOC-MAP\n\n| 分類 | パス |\n...`
- 分類: `DEAD-FN`
- 根拠: regression テスト用フィクスチャ。被テストコード除去で削除
- Phase: 1

### regression_*.test.ts（3 ファイル）

#### 参照 73: regression_issue616.test.ts の ng フィクスチャ

- ファイル: `regression_issue616.test.ts:57`
- 断片: `ng("LinkIntegrity", "broken-file-link", "link broken", "docs/DOC-MAP.md"),`
- 分類: `DEAD-FN`
- 根拠: Issue #616 回帰テストの期待値データ。`docs/DOC-MAP.md` を被リンク先とする想定だが、現行体系に同ファイルは存在しない。テストの意図（broken-file-link 検出）自体は他ファイルで代替可能。Phase 1 で被テストコードと同期、または代替ファイル名へ置換
- Phase: 1

#### 参照 74-75: regression_mapping_table_contract_removed.test.ts のフィクスチャ

- ファイル: `regression_mapping_table_contract_removed.test.ts:192-193`
- 断片: `join(root, "docs", "DOC-MAP.md"),`、`["# DOC-MAP", "", "Lists REQ-001 and ADR-001.", ""].join("\n"),`
- 分類: `DEAD-FN`
- 根拠: マッピングテーブル除去回帰テストのフィクスチャ。DOC-MAP を必要とするテスト対象が既に存在しない
- Phase: 1

#### 参照 76-77: regression_req_id_width.test.ts のフィクスチャと検索

- ファイル: `regression_req_id_width.test.ts:180-182, 249`
- 断片: `join(root, "docs", "DOC-MAP.md"),`、`"# DOC-MAP",`、`containsFinding(report.results, "docmap-req-sync", "REQ-0102"),`
- 分類: `DEAD-FN`
- 根拠: REQ ID 桁数回帰テストのフィクスチャ。`docmap-req-sync` check が dead のため、この assertion も dead
- Phase: 1

## 除去優先度

除去は本監査の対象外（REQ-013-020 は「判定と記録様式と優先度の整備」を要求）。後続 Issue が Phase 順に実施する。各 Phase は独立して実施可能だが、Phase 1 内のエントリは相互に依存するため一括実施を推奨する。

### Phase 1: 機能的 dead code 除去（高優先）

対象 27 件（`DEAD-FN`）。checkDocMap* 関数群、generateDocMapInventory、AG-013 AUTOGEN 検証、docmap-update-required ルール、結合解決、分類ポリシー、テストフィクスチャ。実施にあたっての注意点を以下に示す。

- **check_integrity.ts**: 参照 9-17（関数群）、21-22（分類ポリシー）、24-30（呼び出し、AUTOGEN 検証、inventory）を一括削除。参照 21 で `DOCUMENT_CLASSIFICATIONS` を 5 分類へ縮退、参照 70-71 のテスト件数を 6 → 5 へ更新。参照 31（`scanned.DocMap`）は Phase 2 で扱うため Phase 1 では残置。
- **generate_indexes.ts**: 参照 39-43 の DOC-MAP 更新セクションが `process.exit(EXIT_ERROR)` を呼ぶため、本セクション除去が最優先。現行 repo で `generate_indexes.ts` の全面起動を妨げている。参照 33-38 も併せて削除。
- **check_changed_docs.ts**: 参照 45-47（ルール）、49-51（結合）、53-54（ロジック）を一括削除。出力 JSON の `docmap_update_required` フィールドも削除。下遊（PR 本文記録等）で当該フィールドを参照する箇所があるか確認が必要（SPEC targeted-docs-guard-implementation.md の JSON schema 定義）。
- **check_autogen_freshness.ts**: 参照 57-60 を一括削除。
- **cli_utils.ts**: 参照 62-65 を一括削除。
- **テストファイル**: 被テストコードと同 PR で削除・更新。

依存確認事項。

- check_changed_docs.ts 出力 JSON の `docmap_update_required` フィールド消費者が他にいないか grep 確認。
- `DOCUMENT_CLASSIFICATIONS` の 5 分類縮退が他検査（document-model SPEC の分類定義）と矛盾しないか確認。

### Phase 2: 到達不能パスと inventory 形状の整理（中優先）

対象 9 件（`DEAD-REDIRECT` 8 件 + `LIVE` 1 件）。`fs.existsSync` 等で保護された到達不能スキャン対象、`scanned.DocMap` 出力項目。

Phase 1 完了後に実施する。Phase 1 で checkDocMap* 関数を除去した時点で、それらが参照していた DOC-MAP パス定数も未使用になるため、Phase 2 で残存スキャンリスト（参照 7、8、18、19、20、23、48、56）を整理する。

参照 31（`scanned.DocMap`）は dry-run 出力形式の一部。当該項目を削除すると dry-run 消費者がいる場合に影響する。消費者確認の上、削除または `0` 固定のまま残置を判断する。

### Phase 3: コメント・メッセージ整理（低優先）

対象 8 件（`DEAD-DOC`）。コメント、エラーメッセージ、ログ文字列、OK メッセージ中の DOC-MAP 言及。Phase 1-2 完了後に実施し、コードの意図と発言を一致させる。

## 判定結果の記録様式

本監査で確立した記録様式を以下に示す。後続の DOC-MAP 関連作業、類似の dead code 監査で再利用する。

### 個別判定エントリ様式

各参照は次の 7 要素で記録する。

1. **ID**: 連番（参照 N）。監査内で一意。
2. **ファイル:行**: `相対パス:開始行`（複数行にわたる場合は `開始行-終了行`）。
3. **断片**: コードスニペット。関数・ブロック単位のときは要点を示す数行。
4. **分類**: `LIVE` / `DEAD-FN` / `DEAD-REDIRECT` / `DEAD-DOC` のいずれか。
5. **根拠**: 分類に至った理由。存在チェックの有無、被参照先の状態、代替経路の有無を明記。
6. **Phase**: 除去 Roadmap の Phase 番号。`LIVE` は除去対象外だが Phase 2 で再評価候補なら明記。

### サマリ様式

監査結果の冒頭に次の 2 表を置く。

1. **分類別集計表**: 分類、件数、内訳の 3 列。
2. **ファイル別件数表**: ファイル、件数、主分類の 3 列。

### 除去優先度様式

Phase ごとに「対象件数、対象エントリ概要、実施時の注意点、依存確認事項」を記載する。Phase は 1（高）〜 3（低）の 3 段階を基本とし、必要に応じて増やす。

## 関連情報

- 根拠 REQ: [REQ-013](../../../requirements/REQ-013.md)（REQ-013-020）
- DOC-MAP 本体除去: PR #1953、PR #1958
- 親 Epic: #1992
- 本 Issue: #1996
- 関連 SPEC: [integrity-contracts.md](../integrity-contracts.md)、[integrity-rule-catalog.md](../integrity-rule-catalog.md)、[rule-ownership.md](../rule-ownership.md)
- 類似監査: なし（本監査が DOC-MAP 参照個別生死判定の初回）
