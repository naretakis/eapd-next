# Deployment Guide

## Simple Single-Branch Deployment Strategy

eAPD-Next uses a simplified deployment approach focused on reliability and ease of use.

## 🚀 How It Works

### Production Deployment

- **Branch**: `main`
- **URL**: https://naretakis.github.io/eapd-next/
- **Trigger**: Automatic on push to `main` branch
- **Process**: GitHub Actions builds and deploys to GitHub Pages

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Develop locally**: `npm run dev`
3. **Test thoroughly**: `npm test` and `npm run lint`
4. **Merge to main**: When ready for production
5. **Automatic deployment**: GitHub Actions handles the rest

## 🔧 Local Development

### Setup

```bash
git clone https://github.com/naretakis/eapd-next.git
cd eapd-next
npm install
npm run dev
```

### Testing

```bash
npm test              # Run all tests
npm run lint          # Check code quality
npm run type-check    # TypeScript validation
npm run build         # Test production build
```

### Quality Gates

Before merging to main, ensure:

- ✅ All tests pass locally
- ✅ No linting errors
- ✅ TypeScript compiles successfully
- ✅ Application works in development mode
- ✅ Production build succeeds

## 📦 Deployment Process

### Automatic Deployment (Recommended)

```bash
# When ready to deploy
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main  # Triggers deployment
```

### Manual Deployment

Use GitHub Actions workflow dispatch for manual deployments:

1. Go to Actions tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow" on main branch

## 🔍 Monitoring

### Deployment Status

- **GitHub Actions**: Check workflow status at `/actions`
- **Production Site**: Verify at https://naretakis.github.io/eapd-next/
- **Build Logs**: Review in GitHub Actions for any issues

### Verification Script

```bash
./test-deployment.sh  # Automated deployment verification
```

## 🚨 Troubleshooting

### Common Issues

**Deployment Failed**

- Check GitHub Actions logs
- Verify all tests pass locally
- Ensure no TypeScript errors

**Site Not Updating**

- Wait 5-10 minutes for GitHub Pages propagation
- Check if deployment completed successfully
- Clear browser cache

**Build Errors**

- Run `npm run build` locally to reproduce
- Check for missing dependencies
- Verify environment variables

### Rollback Process

```bash
# Revert to previous commit
git checkout main
git revert HEAD
git push origin main  # Triggers new deployment with rollback
```

## 🎯 Benefits

### Simplicity

- ✅ Single deployment target
- ✅ No complex branching logic
- ✅ Easy to understand and maintain

### Reliability

- ✅ Direct main-to-production deployment
- ✅ Automated quality checks
- ✅ Fast rollback capability

### Developer Experience

- ✅ Work on any branch locally
- ✅ Test thoroughly before deployment
- ✅ Clear deployment process

## 📋 Checklist

### Before Deploying

- [ ] Feature is complete and tested
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Local testing completed (`npm run dev`)
- [ ] Production build works (`npm run build`)

### After Deploying

- [ ] GitHub Actions workflow completed successfully
- [ ] Production site is accessible
- [ ] New features work as expected
- [ ] No console errors or broken functionality

## 🔗 Resources

- **Production Site**: https://naretakis.github.io/eapd-next/
- **Repository**: https://github.com/naretakis/eapd-next
- **Actions**: https://github.com/naretakis/eapd-next/actions
- **Issues**: https://github.com/naretakis/eapd-next/issues

---

_This simple deployment strategy prioritizes reliability and ease of use over complex multi-environment setups._
