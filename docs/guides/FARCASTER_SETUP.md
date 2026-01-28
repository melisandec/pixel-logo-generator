# Farcaster Mini App Setup Guide

## Manifest File Location

The Farcaster manifest is located at:
```
public/.well-known/farcaster.json
```

This file must be publicly accessible at:
```
https://YOUR_DOMAIN.com/.well-known/farcaster.json
```

## Required Steps

### 1. Update Domain and URLs

Replace all instances of `YOUR_DOMAIN.com` in `farcaster.json` with your actual domain:

- `iconUrl`: URL to a 128x128px icon image
- `homeUrl`: Your app's main URL
- `splashImageUrl`: Splash screen image (optional but recommended)
- `heroImageUrl`: Hero image for social sharing
- `imageUrl`: Open Graph image for social previews
- `canonicalDomain`: Your canonical domain

### 2. Generate Account Association

The `accountAssociation` section proves domain ownership. You need to generate and sign it:

**Option A: Using Farcaster Developer Tools**
1. Go to [Farcaster Developer Tools](https://warpcast.com/~/developers) or [Warpcast Developer Portal](https://warpcast.com/~/developers)
2. Navigate to "Mini App Manifest Tool"
3. Enter your domain
4. Sign with your Farcaster custody address
5. Copy the generated `header`, `payload`, and `signature` values
6. Replace the placeholders in `farcaster.json`

**Option B: Using Command Line Tools**
```bash
# Install Farcaster CLI tools (if available)
npm install -g @farcaster/cli

# Generate manifest signature
farcaster manifest sign --domain YOUR_DOMAIN.com
```

### 3. Create Required Assets

Create and upload these images to your domain:

- **icon-128.png**: 128x128px app icon
- **splash.png**: Splash screen image (recommended: 1200x630px)
- **hero.png**: Hero image for embeds (recommended: 1200x630px)
- **og-image.png**: Open Graph image for social sharing (recommended: 1200x630px)

### 4. Deploy and Verify

1. Deploy your app to a production domain with HTTPS
2. Ensure `public/.well-known/farcaster.json` is accessible
3. Verify the manifest is valid:
   - Visit `https://YOUR_DOMAIN.com/.well-known/farcaster.json` in a browser
   - Use Farcaster's manifest validator (if available)
   - Test in Warpcast by sharing your app URL

### 5. Test in Warpcast

1. Open Warpcast
2. Share your app URL: `https://YOUR_DOMAIN.com`
3. The app should appear as a mini app with your icon and name
4. Users can add it to their home screen

## Manifest Fields Explained

### Required Fields
- **version**: Manifest version (currently "1")
- **name**: App name as shown to users
- **iconUrl**: Public URL to app icon (128x128px recommended)
- **homeUrl**: Main URL where your app lives

### Recommended Fields
- **description**: App description for discovery
- **splashImageUrl**: Image shown during app loading
- **splashBackgroundColor**: Background color for splash screen
- **heroImageUrl**: Large image for app previews
- **imageUrl**: Open Graph image for social sharing
- **buttonTitle**: Call-to-action button text
- **tags**: Array of tags for discoverability
- **webhookUrl**: URL to receive app events (optional)
- **canonicalDomain**: Your canonical domain for migrations

## Next.js Configuration

Next.js will automatically serve files from the `public` directory. The manifest will be accessible at:

```
https://YOUR_DOMAIN.com/.well-known/farcaster.json
```

No additional configuration needed!

## Resources

- [Farcaster Mini Apps Specification](https://miniapps.farcaster.xyz/docs/specification)
- [Neynar Documentation](https://docs.neynar.com/docs/convert-web-app-to-mini-app)
- [Farcaster Developer Tools](https://warpcast.com/~/developers)

## Troubleshooting

**Manifest not accessible?**
- Ensure the file is in `public/.well-known/farcaster.json`
- Check that Next.js is serving static files correctly
- Verify your domain has HTTPS enabled

**Account association invalid?**
- Regenerate the signature with the correct domain
- Ensure you're signing with the correct Farcaster account
- Check that the domain matches exactly (no trailing slashes)

**App not appearing in Warpcast?**
- Verify manifest is accessible and valid JSON
- Check that all required fields are present
- Ensure accountAssociation is properly signed
- Try clearing Warpcast cache
