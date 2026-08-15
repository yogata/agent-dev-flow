# Intake Item: check_extensions フルスイート実行時のみの order-dependent 失敗の切り分け

## 発生源

- PR: #2149 (Issue #2138 / OU-004, Epic #2134 Wave 1)
- 発生 phase: case-run 検証（scripts フルテスト 82 ファイル実行）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

scripts フルテストの既知失敗のうち、check_extensions はフルスイート実行時のみ発生し単体実行では base・変更後とも 10 pass / 0 fail となる。テスト間の実行順序依存の汚染が疑われるため切り分け対象。

## 推奨対応

フルスイート時のテスト間状態汚染（作業ディレクトリ・環境変数・一時ファイル等）の切り分けを実施し、汚染源を特定する。OU-002（#2136）の NG 由来分類と併せて処理するのが自然。

## 関連

- Issue: #2138 (CLOSED), Epic: #2134
- PR: #2149 (Findings / Capture候補 セクション intake 2)
- 同 PR learning: フルスイート失敗は単体実行と base commit 再現の双方で帰属を確認してから修正対象と判断する手順
