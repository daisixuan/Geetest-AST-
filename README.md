### 一键反混淆Geetest的混淆JS框架 

### 支持反混淆fullpage.js gcaptcha4.js等Geetest框架混淆的JS

- 环境依赖
  - nodejs >= v18.15.0

- 使用步骤
    - 1. 安装依赖 npm install
    - 2. 运行node main_ast.js 需要反混淆的文件路径 反混淆后的文件路径
      - 例如
        - node main_ast.js gcaptcha4.js gcaptcha4_out.js
    - 3. 1秒不到即可反混淆 享受阅读源码的丝滑 效果见gcapthca4_out.js