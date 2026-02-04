# Deploy to Vercel

## Quick Deploy

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default: `pixel-logo-generate`)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Using GitHub Integration

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Automatic Deployments**:
   - Every push to `main` will trigger a production deployment
   - Pull requests will create preview deployments

## Post-Deployment Steps

### 1. Update Farcaster Manifest

After deployment, you'll get a Vercel URL like: `https://pixel-logo-generate.vercel.app`

Update `public/.well-known/farcaster.json`:

1. Replace all `YOUR_DOMAIN.com` with your Vercel domain
2. Or better: Use a custom domain (see below)

Example:
```json
{
  "miniapp": {
    "homeUrl": "https://pixel-logo-generate.vercel.app",
    "iconUrl": "https://pixel-logo-generate.vercel.app/icon-128.png",
    ...
  }
}
```

### 2. Generate Account Association

1. Go to [Farcaster Developer Tools](https://warpcast.com/~/developers)
2. Use the Mini App Manifest Tool
3. Enter your Vercel domain
4. Sign with your Farcaster account
5. Copy the generated `header`, `payload`, and `signature`
6. Update `public/.well-known/farcaster.json`
7. Commit and push (Vercel will auto-deploy)

### 3. Create Required Assets

Create and add these images to `public/`:

- `icon-128.png` - 128x128px app icon
- `splash.png` - Splash screen (1200x630px recommended)
- `hero.png` - Hero image (1200x630px recommended)
- `og-image.png` - Open Graph image (1200x630px recommended)

### 4. Add Custom Domain (Optional but Recommended)

1. Go to your project on Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `farcaster.json` with your custom domain

## Environment Variables

If you need environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `NEXT_PUBLIC_APP_URL` - Your app URL
   - Any other API keys or secrets

## Verify Deployment

1. **Check Manifest**:
   Visit: `https://YOUR_DOMAIN.vercel.app/.well-known/farcaster.json`
   
   Should return valid JSON with your manifest

2. **Test in Warpcast**:
   - Share your app URL in Warpcast
   - Should appear as a mini app
   - Icon and name should display correctly

3. **Check Build Logs**:
   - Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check for any build errors

## Troubleshooting

### Build Fails

- Check Node.js version (Vercel uses Node 18.x by default)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Manifest Not Accessible

- Verify file is at `public/.well-known/farcaster.json`
- Check Vercel rewrites in `vercel.json`
- Ensure file is committed to git

### 404 on Manifest

- The `vercel.json` includes rewrites for `.well-known` paths
- If still not working, check Vercel project settings
- Try accessing: `https://YOUR_DOMAIN.vercel.app/.well-known/farcaster.json`

### Account Association Issues

- Regenerate after deployment with correct domain
- Ensure domain matches exactly (no trailing slash)
- Check signature is valid in Farcaster tools

## Continuous Deployment

Once set up:
- Every push to `main` branch = Production deployment
- Every pull request = Preview deployment
- Automatic HTTPS and CDN included

## Vercel CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```
