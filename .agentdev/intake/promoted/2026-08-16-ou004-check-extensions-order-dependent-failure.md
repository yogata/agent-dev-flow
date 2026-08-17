# check_extensions フルスイート実行時のみの order-dependent 失敗の切り分け

## 観測内容

scripts フルテストの既知失敗のうち、check_extensions はフルスイート実行時のみ発生し単体実行では base・変更後とも 10 pass / 0 fail となる。テスト間の実行順序依存の汚染が疑われるため切り分け対象。

## 影響

- フルスイート実行の信頼性が下がり、QG 判定に恒常的な失敗計上が混入する

## 課題

フルスイート時のテスト間状態汚染（作業ディレクトリ・環境変数・一時ファイル等）の切り分けを実施し、汚染源を特定する。OU-002（#2136）の NG 由来分類と併せて処理するのが自然。

## 既存要件・成果物との関連

- 対象: check_extensions テスト
- 関連: 2026-08-16-ou007-checkextensions-worktree-junction-failure.md（worktree 環境失敗）、2026-08-16-ou001-check-extensions-cwd-dependency.md（cwd 依存）— 同一根かどうかは切り分け対象（統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2149 (Issue #2138 / OU-004, Epic #2134 Wave 1) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou004-check-extensions-order-dependent-failure.md
