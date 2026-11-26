# AV-SAFE Security & Credentials Audit Report

## 1. Remediation of Hardcoded Credentials
- **Prior Leaks Found**: In historical commits (prior to refactoring), a hardcoded MongoDB Atlas direct URI string (`mongodb://gaming182006:tanay1826@...`) was present in `backend/config/mongodb.js`.
- **Status in Active Working Tree**: **Completely Eliminated**.
  - All database connection logic in `backend/config/mongodb.js` strictly reads from `process.env.MONGODB_URI` and `process.env.MONGODB_DIRECT_URI`.
  - No fallback credentials or hardcoded passwords exist in any active file.
  - A clean `.env.example` provides safe placeholders (`<username>`, `<password>`).
  - `.gitignore` strictly blocks all `.env*` files from inclusion.

## 2. Recommendation for GitHub Secret Rotation
Because commit `b4462b7421bcb1edaf9a567d6a41e4756b0288fb` previously touched credentials:
1. **Immediate Action**: The MongoDB Atlas user password for `gaming182006` on cluster `cluster0.g7yen.mongodb.net` should be rotated immediately in the MongoDB Atlas console.
2. **Git History Cleanliness**: If the repository is published publicly, run `git filter-repo` or BFG Repo-Cleaner to permanently purge commit `b4462b74` from the git history object database.

## 3. Large Datasets & Serialized Models Exclusion
- Large raw CSVs (`PhiUSIIL_Phishing_URL_Dataset.csv`) and parquet splits were removed from git tracking and added to root `.gitignore`.
- Heavy binary `.joblib` model weights were safely untracked while preserving full training source scripts in `backend/ml/training/`.
