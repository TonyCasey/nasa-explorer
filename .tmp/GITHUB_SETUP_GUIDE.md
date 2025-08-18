# GitHub CI/CD Setup Guide

## 🎯 **Goal**
Set up efficient GitHub workflow with automated CI/CD for:
- **Frontend**: Vercel auto-deployment
- **Backend**: Heroku auto-deployment  
- **CI**: Automated testing on pull requests

## 📋 **Step-by-Step Setup**

### 1. **Create GitHub Repository**

1. Go to [GitHub](https://github.com) and create a new repository:
   - Repository name: `nasa-space-explorer`
   - Description: `NASA Space Explorer - Full-stack web application showcasing NASA's space data`
   - Set to Public or Private (your choice)
   - Don't initialize with README (we already have one)

### 2. **Connect Local Repository to GitHub**

```bash
# Add GitHub as origin remote
git remote add origin https://github.com/YOUR_USERNAME/nasa-space-explorer.git

# Rename master to main (GitHub standard)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. **Set Up Branch Protection (Recommended)**

Go to GitHub → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 4. **Configure Vercel GitHub Integration**

#### Option A: Automatic Setup (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### Option B: Manual GitHub Integration
1. In Vercel project settings → Git
2. Connect to GitHub repository
3. Set production branch to `main`
4. Enable automatic deployments

### 5. **Configure Heroku GitHub Integration**

#### Option A: Heroku Dashboard (Easiest)
1. Go to [Heroku Dashboard](https://dashboard.heroku.com/apps/nasa-explorer)
2. Go to Deploy tab
3. In "Deployment method", select "GitHub"
4. Connect to your GitHub repository
5. Enable "Automatic deploys from main"
6. Set `Procfile` to point to correct location:
   ```
   web: cd backend && npm start
   ```

#### Option B: GitHub Actions (More Control)
Use the `deploy-production.yml` workflow we created (requires secrets setup)

### 6. **Set Up GitHub Secrets** (For GitHub Actions)

Go to GitHub → Settings → Secrets and variables → Actions:

#### Vercel Secrets:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

#### Heroku Secrets:
```
HEROKU_API_KEY=your_heroku_api_key
HEROKU_EMAIL=your_heroku_email
```

### 7. **Test the Workflow**

1. Create a new branch:
   ```bash
   git checkout -b feature/test-workflow
   ```

2. Make a small change (e.g., update README)

3. Push and create PR:
   ```bash
   git add .
   git commit -m "Test GitHub workflow"
   git push origin feature/test-workflow
   ```

4. Go to GitHub and create a Pull Request
5. Watch CI tests run automatically
6. Merge PR to trigger deployment

## 🔄 **Recommended Workflow**

### Daily Development:
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push and create PR
git push origin feature/new-feature

# 4. GitHub Actions run tests automatically
# 5. Review code, merge PR
# 6. Automatic deployment to production
```

### Branch Strategy:
- **`main`**: Production branch (auto-deploys)
- **`develop`**: Development branch (optional)
- **`feature/*`**: Feature branches
- **`hotfix/*`**: Emergency fixes

## 🎛️ **Customization Options**

### Deployment Triggers:
- **Current**: Deploy on every push to `main`
- **Alternative**: Deploy only on tags/releases
- **Advanced**: Deploy different branches to staging/production

### Testing Strategy:
- **Current**: Run tests on PRs and main branch
- **Enhanced**: Add E2E tests, visual regression tests
- **Advanced**: Parallel testing, multiple Node versions

### Notifications:
- **Slack integration**: Get notified of deployments
- **Email notifications**: On build failures
- **Discord webhooks**: Team notifications

## 🚨 **Important Notes**

1. **Environment Variables**: Ensure all required env vars are set in both Vercel and Heroku
2. **Build Scripts**: Make sure build commands work in CI environment
3. **Dependencies**: Keep package-lock.json files up to date
4. **Secrets Management**: Never commit API keys or secrets

## 🔧 **Troubleshooting**

### Common Issues:
1. **Build failures**: Check Node version compatibility
2. **Deployment failures**: Verify environment variables
3. **Test failures**: Ensure tests pass locally first
4. **Permission errors**: Check GitHub secrets and tokens

### Debug Commands:
```bash
# Check current remotes
git remote -v

# Check current branch
git branch

# Check GitHub Actions status
# (View in GitHub repository → Actions tab)
```

## 📈 **Benefits of This Setup**

1. **Automated Testing**: Catch bugs before deployment
2. **Code Review**: Ensure quality through PRs
3. **Easy Rollbacks**: Git-based deployment history
4. **Parallel Development**: Multiple developers can work safely
5. **Zero Downtime**: Automated deployments
6. **Audit Trail**: Full history of changes and deployments

## 🎯 **Next Steps After Setup**

1. Set up code coverage reporting
2. Add E2E tests with Playwright
3. Implement staging environment
4. Add performance monitoring
5. Set up error tracking (Sentry)

---

**Ready to implement?** Follow the steps above and you'll have a professional GitHub workflow! 🚀