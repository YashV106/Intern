# ESLint Next.js 15 Warning Fix - TODO

- [ ] Update `internshala-clone-main/internarea/package.json` to add missing ESLint packages required for Next.js flat config.
- [ ] Replace empty `internshala-clone-main/internarea/eslint.config.mjs` with a valid ESLint 9 flat config using `eslint-config-next` (Next.js 15).
- [ ] Run `npm install` in `internshala-clone-main/internarea`.
- [ ] Run `npm run lint` in `internshala-clone-main/internarea` and ensure the Next.js plugin warning is gone.
- [ ] Run `npm run build` in `internshala-clone-main/internarea` and ensure it completes without the warning.
- [ ] If lint/build surfaces other ESLint config errors, iterate only ESLint config (no functional code changes).
