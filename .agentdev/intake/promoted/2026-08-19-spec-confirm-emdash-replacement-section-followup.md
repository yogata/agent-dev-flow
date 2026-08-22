# document-type-responsibilities SPEC「em-dash 置換形式」節の判別基準追随の要否

## 観測

document-type-responsibilities SPEC「em-dash 置換形式」節は「テーブルセル内の em-dash（N/A プレースホルダ用途）は | - | へ機械置換する」「文脈判断を要しない安全な機械置換である」と記述する。

PR 2271 の判別基準導入後も判定は機械的（肯定記号併存の grep）で完結するため「文脈判断を要しない」性質は維持されるが、「テーブルセル em-dash = N/A プレースホルダ用途」の等式は意図的マトリックス表記クラスの導入により過大表現となった。

## 今回扱わない理由

Issue 2234（OU-0017）の変更対象成果物は mechanical-replacement-rules.md（配布スキル reference）のみ。SPEC 側の確定事項として本 PR では変更していない。

## 影響

SPEC と確定済み判別基準の間に表現精度の乖離が残る。実装運用への影響はない（判定は機械的）。

## レビューで決めること

- 同節を判別基準（肯定記号併存で意図的マトリックス表記を維持）へ追随させるか

## 根拠

- PR 2271 本文「SPEC確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2271）
