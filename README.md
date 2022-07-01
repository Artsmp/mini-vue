## 项目初始化

- 使用 pnpm workspace
- 在 packages 目录下创建子包
- 安装依赖

```bash
pnpm install typescript rollup rollup-plugin-typescript2 @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-commonjs minimist execa@4 esbuild   -D -w
```

- 初始化 ts 配置，并配置 baseUrl 和 paths
- 子包初始化 package.json，加入 buildOptions 自定义选项
