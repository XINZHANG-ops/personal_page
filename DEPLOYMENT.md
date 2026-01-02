# GitLab Pages Deployment Guide

This document provides instructions for deploying the personal portfolio site to GitLab Pages.

## Prerequisites

- GitLab repository with the portfolio code
- GitLab Pages enabled for your project (usually enabled by default)
- Node.js and npm installed for local development and testing

## Automatic Deployment

The site is configured for automatic deployment using GitLab CI/CD:

1. **Push to main/master branch**: Any push to the main or master branch will trigger the deployment pipeline
2. **Pipeline stages**:
   - **Test**: Validates HTML structure and runs all tests
   - **Build**: Optimizes assets and creates the `public` directory
   - **Deploy**: Deploys the optimized site to GitLab Pages

## Manual Deployment Verification

Before pushing to trigger deployment, you can verify your site locally:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Verify deployment readiness
npm run verify-deployment

# Run complete deployment check (tests + verification)
npm run deploy-check

# Build optimized version
npm run build
```

## GitLab Pages Configuration

The deployment is configured in `.gitlab-ci.yml` with the following features:

- **Automated testing**: HTML validation and unit tests
- **Asset optimization**: Minification and compression
- **Clean deployment**: Removes development files from the deployed version
- **Performance monitoring**: Optional performance testing job

## Site URL

After successful deployment, your site will be available at:
```
https://[username].gitlab.io/[repository-name]
```

Replace `[username]` with your GitLab username and `[repository-name]` with your repository name.

## Deployment Pipeline Jobs

### 1. Test Job
- Validates HTML structure using html-validate
- Runs unit tests and property-based tests
- Generates test reports

### 2. Build Job
- Runs asset optimization (minification, compression)
- Creates clean `public` directory
- Removes development files
- Copies only production-ready files

### 3. Pages Job
- Deploys the `public` directory to GitLab Pages
- Verifies required files exist
- Provides deployment confirmation

### 4. Performance Job (Manual)
- Optional performance testing
- Can be triggered manually from GitLab CI/CD interface

## Troubleshooting

### Common Issues

1. **Pipeline fails on test stage**:
   - Check HTML validation errors
   - Ensure all tests pass locally first
   - Review test output in GitLab CI logs

2. **Build stage fails**:
   - Verify Node.js dependencies are correctly specified
   - Check that all required files exist
   - Review build script output

3. **Site not accessible after deployment**:
   - Verify GitLab Pages is enabled in project settings
   - Check that `index.html` exists in the `public` directory
   - Ensure no server-side code is being used

4. **Assets not loading**:
   - Verify all asset paths are relative (not absolute)
   - Check that assets are copied to the `public` directory
   - Ensure proper file organization

### Debugging Steps

1. **Check GitLab CI/CD pipeline**:
   - Go to your GitLab project → CI/CD → Pipelines
   - Click on the failed pipeline to see detailed logs
   - Review each job's output for specific errors

2. **Local verification**:
   ```bash
   # Run the same checks as CI
   npm run deploy-check
   
   # Test the built version locally
   npm run build
   cd public
   python -m http.server 8000  # or use any local server
   ```

3. **GitLab Pages settings**:
   - Go to your GitLab project → Settings → Pages
   - Verify the source is set to "CI/CD"
   - Check the deployment status and any error messages

## File Structure

The deployed site will have this structure in the `public` directory:

```
public/
├── index.html          # Main page
├── css/
│   ├── main.css       # Styles
│   └── main.min.css   # Minified styles
├── js/
│   ├── main.js        # Scripts
│   └── main.min.js    # Minified scripts
├── assets/
│   ├── images/        # Optimized images
│   └── icons/         # Icon files
├── favicon.ico        # Site icon (if present)
├── robots.txt         # SEO file (if present)
└── sitemap.xml        # SEO file (if present)
```

## Performance Optimization

The deployment pipeline includes several optimizations:

- **CSS minification**: Reduces file sizes
- **JavaScript minification**: Compresses scripts
- **Image optimization**: Ensures reasonable file sizes
- **Asset organization**: Clean directory structure
- **Development file removal**: Excludes unnecessary files

## Security Considerations

- Only static files are deployed (no server-side code)
- Development dependencies are not included in deployment
- Sensitive files (like `.env`) are automatically excluded
- All external links open in new tabs for security

## Monitoring and Maintenance

- **Performance**: Use the manual performance job to check site speed
- **Updates**: The pipeline runs automatically on every push
- **Rollback**: Use GitLab's environment history to rollback if needed
- **Monitoring**: Check GitLab Pages analytics in project insights

## Support

If you encounter issues:

1. Check the [GitLab Pages documentation](https://docs.gitlab.com/ee/user/project/pages/)
2. Review the pipeline logs for specific error messages
3. Verify your site works locally before deploying
4. Ensure all tests pass with `npm run deploy-check`

---

**Note**: This deployment configuration is optimized for static sites. If you need dynamic functionality, consider using GitLab's serverless functions or external services.