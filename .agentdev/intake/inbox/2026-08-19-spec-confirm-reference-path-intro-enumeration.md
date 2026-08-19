# SPEC確定候補: reference-path-existence 節の導入文における抽出元列挙の精確化

## 観測

integrity-contracts.md「reference-path-existence 検出における backtick 囲みパスの扱い」節の導入文（302行）「command 定義と SKILL.md から抽出したパス参照」の抽出元列挙に references 配下ファイルが含まれていない。322行の拡張点2記載（skill references/*.md 走査）で補完されるため読手の誤解は生じにくい。

## 今回扱わない理由

本 Issue（#2212）は拡張4点の反映確認がスコープで SPEC 変更なし（no-change 完了）。導入文の精確化は accepted SPEC（integrity-contracts.md）への追記要求であり、case-close の SPEC 確定フローでは扱わない（見送り、パターン c）。

## 影響

導入文のみを読んだ読手は references 配下ファイルが検出対象外と誤解する可能性が残る。

## レビューで決めること

- 導入文の抽出元列挙へ references 配下ファイルを追記するか
- 併せて他の検出系節の導入文にも同種の列挙漏れがないか確認するか

## 根拠

- Issue 2212 完了判定記録コメント「Findings（本筋外の検出事項）」2件目（回収元: https://github.com/yogata/agent-dev-flow/issues/2212#issuecomment-5329994482）
