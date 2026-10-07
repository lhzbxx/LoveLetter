# LoveLetter 项目合集

本仓库整合相关历史项目，各项目仍在独立子目录中维护。

| 项目 | 目录 | 来源 |
|---|---|---|
| LoveLetter | [projects/LoveLetter](projects/LoveLetter/) | [原仓库](https://github.com/lhzbxx/LoveLetter) |
| love_letter_bot | [projects/love_letter_bot](projects/love_letter_bot/) | [原仓库](https://github.com/lhzbxx/love_letter_bot) |
| TRPG-tools | [projects/TRPG-tools](projects/TRPG-tools/) | [原仓库](https://github.com/lhzbxx/TRPG-tools) |

## 使用与历史

- 在对应项目目录中安装依赖、构建或运行；原项目的文件、配置与说明保持原样。
- 这是仓库组织整合，未统一依赖、接口或部署方式，也未承诺旧项目仍能在当前环境运行。
- 导入时保留默认分支的完整提交历史和原提交 ID；原路径下的历史可通过 `git log <CONSOLIDATION.json 中的 commit> -- <原路径>` 查看。路径迁移后的历史不保证能由 `git log --follow` 连续显示。
- `CONSOLIDATION.json` 记录每个来源的导入提交和目录。其他分支、标签留在原仓库，并另有本地 Git bundle 备份。
- 原仓库暂时保留，待整合结果审阅后再决定后续处理。
- 原项目 CI/部署配置在子目录中保留，不会自动作为合集根目录的工作流运行；相对路径需要从对应子目录执行。
