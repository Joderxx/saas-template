echo off

cd /d %~dp0

if not exist "prisma" (
    mkdir prisma
)

copy "..\saas-boilerplate\prisma\*.prisma" ".\prisma\"

if not exist "public" (
    mkdir public
)

xcopy /s /e "..\saas-boilerplate\public\" ".\public\"

if not exist "src" (
    mkdir src
)

xcopy /s /e "..\saas-boilerplate\src\" ".\src\"

copy "..\saas-boilerplate\package.json" ".\package.json"
copy "..\saas-boilerplate\next.config.js" ".\next.config.js"
copy "..\saas-boilerplate\tsconfig.json" ".\tsconfig.json"
copy "..\saas-boilerplate\.env.example" ".\.env"
copy "..\saas-boilerplate\.eslintrc.json" ".\.eslintrc.json"
copy "..\saas-boilerplate\.gitignore" ".\.gitignore"
copy "..\saas-boilerplate\components.json" ".\components.json"
copy "..\saas-boilerplate\next-env.d.ts" ".\next-env.d.ts"
copy "..\saas-boilerplate\next.config.mjs" ".\next.config.mjs"
copy "..\saas-boilerplate\postcss.config.mjs" ".\postcss.config.mjs"
copy "..\saas-boilerplate\tailwind.config.ts" ".\tailwind.config.ts"

@REM cmd /c 7z a -tzip .\code.zip .\

pause
