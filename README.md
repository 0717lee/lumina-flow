# React + TypeScript + Vite

该模板提供了一个最小的设置，可以让 React 在 Vite 中与 HMR 和一些 ESLint 规则一起工作。

目前官方提供了两个插件：

-[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) 使用 [Babel](https://babeljs.io/) （或 [oxc](https://oxc.rs) 在 [rolldown-vite](https://vite.dev/guide/rolldown) 中使用时）进行快速刷新
-[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) 使用 [SWC](https://swc.rs/) 进行快速刷新

## 反应编译器

此模板上未启用 React 编译器，因为它会影响开发和构建性能。要添加它，请参阅[本文档](https://react.dev/learn/react-compiler/installation)。

## 扩展 ESLint 配置
如果您正在开发生产应用程序，我们建议更新配置以启用类型感知的 lint 规则：

````js
导出默认定义配置（[
  全局忽略（['dist']），
  {
    文件：['**/*.{ts,tsx}'],
    延伸：[
      //其他配置...

      //删除 tseslint.configs.recommended 并替换为此
      tseslint.configs.recommendedTypeChecked，
      //或者，使用它来实现更严格的规则
      tseslint.configs.strictTypeChecked，
//可选地，为风格规则添加此内容
      tseslint.configs.stylisticTypeChecked，

      //其他配置...
    ],
    语言选项：{
      解析器选项：{
        项目：['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      //其他选项...
    },
  },
]）
````
您还可以安装 [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) 和 [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) React 特定的 lint 规则：

````js
//eslint.config.js
从“eslint-plugin-react-x”导入reactX
从“eslint-plugin-react-dom”导入reactDom

导出默认定义配置（[
  全局忽略（['dist']），
  {
    文件：['**/*.{ts,tsx}'],
延伸：[
      //其他配置...
      //为 React 启用 lint 规则
      reactX.configs['推荐的打字稿'],
      //为 React DOM 启用 lint 规则
      reactDom.configs.推荐，
    ],
    语言选项：{
      解析器选项：{
        项目：['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      //其他选项...
    },
  },
]）
````
