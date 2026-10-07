# LoveLetter 项目合集

相关历史项目集中保存，各子项目保持独立的目录、依赖和运行方式。

| 项目 | 目录 | 导入时的历史版本 |
|---|---|---|
| LoveLetter | [projects/LoveLetter](projects/LoveLetter/) | [6e29dfc](https://github.com/lhzbxx/LoveLetter/tree/6e29dfc5cc316bb3906aa9774b35cb58dddd5032) |
| love_letter_bot | [projects/love_letter_bot](projects/love_letter_bot/) | [3e369a1](https://github.com/lhzbxx/LoveLetter/tree/3e369a1fa20b8a566098a17902e52046844488e4) |
| TRPG-tools | [projects/TRPG-tools](projects/TRPG-tools/) | [bc0c21b](https://github.com/lhzbxx/LoveLetter/tree/bc0c21bb9d6de293a87452bcffe35944113d4ec8) |

## 使用与提交历史

- 在相应项目子目录中安装依赖、构建和运行。原始文件、许可证、配置和项目说明原样保留。
- 各来源默认分支历史与原提交 ID 已保留在合集的主分支历史中；来源与导入版本见 [CONSOLIDATION.json](CONSOLIDATION.json)。
- 原来的独立来源仓库已按用户确认移除。上表历史链接指向本合集中的原提交，不依赖已经删除的仓库。
- 全部来源分支、标签另存为 `archive/<来源仓库>/<原分支或标签>`，对象 ID 保持一致；完整映射见 [SOURCE_REFS.json](SOURCE_REFS.json)。归档分支保留当时的原目录结构。
- 查看迁移前某个文件的历史，可使用 `git log <来源 commit> -- <原路径>`；跨目录迁移不保证 `git log --follow` 连续显示全部历史。
- 完整 Git bundle 离线备份已保留。GitHub Issue、PR、星标、运行日志及其他仓库级资料不包含在 Git 历史中，移除来源不代表这些资料也已迁移。

## 验证与运行范围

导入目录的 Git tree ID 与来源一致，来源提交的祖先关系及全部归档引用均已核对。未运行这些旧应用的构建或运行测试，也未统一应用接口、CI、部署或依赖版本。原 CI 和部署配置随各项目保存在子目录中，不会自动成为合集根目录工作流。
