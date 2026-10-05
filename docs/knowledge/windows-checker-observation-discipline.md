---
title: Windows Git Bash 経由 checker 観測の規律（終了コード・出力分離・パス形式・0件合格の区別）
created: 2026-10-05
updated: 2026-10-05
---

# Windows Git Bash 経由 checker 観測の規律（終了コード・出力分離・パス形式・0件合格の区別）

## 知識内容

Windows Git Bash 経由で checker・検証コマンドを実行・観測する際、checker 契約自体は正常でも観測方法の誤りで誤合格・誤 fail が生じ得る。観測は次の規律に従う。

1. **終了コードの取得**: `cmd | tail; echo $?` の `$?` はパイプ最終コマンド（tail）の終了コードを返し、checker の exit 1 を exit 0 と誤読する。終了コードはパイプなし実行、または `PIPESTATUS`（bash）で取得する
2. **stdout / stderr の分離取得**: `2>&1` による結合で stderr の git fatal（履歴再作成ファイル起因の `sha^:path` 参照エラー等）が JSON 先頭に混入しパース失敗する。stdout をファイル退避し、stderr は別ファイルへ分離取得する（統合キャプチャに起因する JSON パース失敗の詳細は [checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md) が所有する）
3. **`--root` 系引数のパス形式**: `$(pwd)` 展開の MSYS 形式パス（`/c/...`）を渡すと対象解決が空振りする。Windows 形式絶対パス（`C:/...` forward slash 記法）を直書きする（MSYS 形式パスの破損機構と推奨記法の詳細は [windows-checker-msys-path-argument.md](windows-checker-msys-path-argument.md) が所有する）
4. **検査対象 0 件の合格の区別**: 検査対象 0 件での PASS（0 inspected PASS 等）は検査不能であり品質確認として扱わない。検査対象件数を合格記録に含め、0 件を検出する。実装側契約も 0 inspected を異常扱いとする方向へ統一されている（textlint gate は対象解決 0 件を不合格〔fail-closed〕とする。手順規律側の本項は観測者が 0 件を検出・記録することを要求し、実装側契約は gate 自身が 0 件を合格扱いにしないことで両面から fail-open を防止する）

## 適用条件

- Windows + Git Bash（MSYS）環境で checker・検証スクリプトの実行結果を観測・証跡化する場合
- checker stdout の JSON を検証記録として退避・突合する場合
- `--root` 等のパス引数、パイプ・リダイレクトを伴う観測を実施する場合

## 適用対象

- check_integrity・check_distribution_boundary・traceability check・textlint gate 等、全 checker・gate の観測経路
- case-run / case-close の検証差分記録・QG 記録の証跡取得
- Windows Git Bash 環境で汎用

## 根拠

- Case #3337（exit=1 を exit=0 と誤観測しかけ・パイプなし再実行で是正）、Case #3340（同型・証跡訂正）
- Root Case #3407（`2>&1` で fatal が JSON に混入・分離取得で解消）
- Case #3420（traceability check --root の MSYS 形式で全 missing-* 誤 fail・C:/ 形式で 9/9 pass）
- Root Case #3410（Git Bash $(pwd) + bun --root で 0 inspected PASS の fail-open）
- Case #3431（freshness checker の再作成履歴 fatal の stderr 混入）
- 前回 promote の U12（MSYS パス静かな空走査）を含む拡張系統

## 関連知識

- [windows-checker-msys-path-argument.md](windows-checker-msys-path-argument.md)（MSYS 形式パス引数の破損機構と推奨記法の専門文書）
- [checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md)（stdout ロスと統合キャプチャ起因の JSON パース失敗）
- [windows-git-bash-inline-content-corruption.md](windows-git-bash-inline-content-corruption.md)（bash 経由コンテンツ伝達の破損回避）
