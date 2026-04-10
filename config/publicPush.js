
// publish-zhui.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ========== 配置 ==========
const rootDir = process.cwd();                     // 项目根目录
const tempPackagePath = path.join(rootDir, 'temp', 'package.json');
const zhuiDir = path.join(rootDir, 'ZHUI');        // ZHUI 包所在目录
const zhuiPackagePath = path.join(zhuiDir, 'package.json');
// ==========================

// 1. 检查必要文件/目录
if (!fs.existsSync(tempPackagePath)) {
    console.error(`❌ 错误：找不到 ${tempPackagePath}`);
    console.error('   请确保 temp/package.json 存在');
    process.exit(1);
}

if (!fs.existsSync(zhuiDir)) {
    console.error(`❌ 错误：找不到 ZHUI 目录 ${zhuiDir}`);
    console.error('   请确保根目录下存在 ZHUI 文件夹（内含待发布的包内容）');
    process.exit(1);
}

// 2. 读取并自增版本号（patch +1）
let pkg;
try {
    pkg = JSON.parse(fs.readFileSync(tempPackagePath, 'utf-8'));
} catch (err) {
    console.error(`❌ 错误：解析 ${tempPackagePath} 失败`, err.message);
    process.exit(1);
}

const oldVersion = pkg.version;
if (!oldVersion) {
    console.error(`❌ 错误：${tempPackagePath} 中没有 version 字段`);
    process.exit(1);
}

const versionParts = oldVersion.split('.').map(Number);
// 默认递增 patch 版本（第三位），可根据需要修改
versionParts[2] = (versionParts[2] || 0) + 1;
const newVersion = versionParts.join('.');
pkg.version = newVersion;

console.log(`📦 版本自增: ${oldVersion} → ${newVersion}`);

// 3. 将更新后的 package.json 写回 temp（保留变更）
fs.writeFileSync(tempPackagePath, JSON.stringify(pkg, null, 2));
console.log(`✅ 已更新 ${tempPackagePath}`);

// 4. 复制 package.json 到 ZHUI 目录
fs.copyFileSync(tempPackagePath, zhuiPackagePath);
console.log(`✅ 已复制 package.json 到 ${zhuiPackagePath}`);

// 5. 执行 npm publish（在 ZHUI 目录内）
console.log(`🚀 正在发布 ZHUI 包到 npm...`);
try {
    execSync('npm publish', { cwd: zhuiDir, stdio: 'inherit' });
    console.log(`🎉 发布成功！新版本 ${newVersion} 已上传至 npm`);
} catch (error) {
    console.error(`❌ 发布失败：${error.message}`);
    process.exit(1);
}
