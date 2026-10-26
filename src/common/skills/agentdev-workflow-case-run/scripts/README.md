# `agentdev-workflow-case-run` scripts（工程記録コメント検証・機械工程入口仕様）

本ディレクトリは case-run の機械工程・検証 script 群（`record-comments.ts`〔工程記録コメント検証〕）と、機械工程 script の入力検証専用入口（validateInput 分離入口）の script 契約を定める。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── record-comments.ts      # 工程記録コメント検証（種別別必須項目検証、進行状況・結果セクション構築と既存本文への適用）
└── tests/
    └── record-comments.test.ts
```

## 機械工程 script の入力検証専用入口仕様

配布 skill の機械工程 script（`agentdev-workflow-case-open` scripts `prepare_definition_pr.ts`、`agentdev-workflow-case-ready` scripts `accept_definition_checks.ts`、`agentdev-workflow-case-close` scripts `close_mechanical_steps.ts`）は、入力検証専用入口（`--validate-input` フラグ）を正規入口として持つ。入口仕様の正規所有は各機械工程 script の script 契約（配布 skill 配下 README）であり、本節は導入時検証（`scripts/install.ps1 -Mode check`）から見た入口の統一契約を記述する（install-script-usability Design「機械工程 script の実行時前提の導入時検証」節の所有関係に従う）。

- **検証範囲**: 入力 JSON の契約検証（validateInput）、既知 gate 引数契約の事前検査（preValidateGateSpec 相当）、必須ゲート実行体の存在確認（exists 確認・availability 含む）のみ
- **副作用なし契約**: worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル変更を行わない（check モードの非破壊契約）。既存 `dryRun` 入口はゲート実行体が揃うと検証以外のステップ（worktree 作成等）へ到達し得るため、check 用入口としては使用しない（`--validate-input` 正規入口のみを使用）
- **fail-closed**: 検証不合格（入力検証失敗・引数契約違反・ゲート実行体不在）は stderr へ `error:` 行を出力して終了コード 1 で失敗する。終了コード 1 と理由報告をもってゲート実行体欠如を検出する
- **check モードからの呼出し可否**: `scripts/install.ps1 -Mode check` は本入口（`--validate-input`）を呼出し、応答（終了コード 0 かつ報告 JSON `ok===true`）を検証成立の証拠とする。呼出し先は `MechanicalStepProbeContract` で宣言された実在 script の検証専用経路であり、install.ps1 側で入口契約を再構成しない（producer 契約の重複実装の解消）
- **検査入力**: 配布先の実際の consumer 条件（実在する repoRoot と branch、実在するゲート実行体を指す品質ゲート実行仕様、有効な REQ 行 ID）を表現する fixture で構成する。空 JSON の受理拒否や bun の起動だけを前提成立の証拠としない

## 工程記録コメント検証（record-comments.ts）

- 入力: argv（記録種別・本文・テンプレートパス等。詳細は `--help` とテスト参照）
- 出力: stdout に検証結果・構築済みセクション本文
- 決定的処理: 種別別必須項目検証、進行状況・結果セクション構築と既存本文への適用（applySection は置換・追記両分岐で見出し直前に空行 1 行保証）
- テスト: `tests/record-comments.test.ts`（bun test）

## 型検査

```bash
# scripts ディレクトリを cwd として起動
bun run typecheck
```

case-run scripts 配下（record-comments.ts・tests を含む）は tsconfig.json の型検査対象であり、integrity suite 経由の typecheck gate テストから品質検査経路へ組み込まれる。
