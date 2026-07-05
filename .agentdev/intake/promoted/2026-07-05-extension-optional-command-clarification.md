# extension 未所持 command の正常性の運用明記

## 観測内容

PR #1410（Epic #1403 Wave 2, Issue #1406）の移行作業で、`.agentdev/extensions/commands/` 配下に16個の extension が作成された。配布 command 総数は17個のため、1個の command が extension を持たない。これは `inspect-extensions` command（SPEC 直接参照を持たず project 非依存で動作するため extension 不要、標準動作で継続）。

`docs/specs/foundations/project-extensions.md` line 61「対象extension が存在しない場合は標準動作で続行する」に既述だが、実際の運用観点（「extension を持たない command が存在し正常である」旨）の明記がない。

## 影響

- `check_extensions.ts` は `public_commands=17` に対して extension 数が16以下を正常扱いする（ok=true）のため、機能上の実害はない
- ただし新規 command 追加時に「extension 必須」と誤解されるリスクが残る

## 課題

- `docs/specs/foundations/project-extensions.md` へ「extension を持たない command が存在し正常である」旨を追記するか
- SPEC status の昇格（draft→accepted）タイミングを本追記と同時に行うか、独立 case として切り出すか

## 既存要件との関連

- `docs/specs/foundations/project-extensions.md`（status: draft、line 61 に標準動作継続の記述あり）
- PR #1410 SPEC確定候補 S-1（case-close Step 3-2 で見送り + intake 保存）
- ADR-0135（project extensions 機構）
