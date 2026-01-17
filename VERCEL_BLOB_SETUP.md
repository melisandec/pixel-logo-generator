# Vercel Blob Setup Guide

## ✅ Code Updated

The API route now uses **Vercel Blob** for permanent image storage. This fixes the broken image links in casts.

## 🚀 Setup Steps

### 1. Install Package

```bash
npm install @vercel/blob
```

### 2. Enable Vercel Blob in Your Project

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Storage**
3. Click **Create Database** or **Add Integration**
4. Select **Blob** (Vercel Blob Storage)
5. This will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

### 3. Environment Variable

The token is automatically added by Vercel, but if you need to set it manually:

**In Vercel Dashboard:**
- Go to **Settings** → **Environment Variables**
- Add: `BLOB_READ_WRITE_TOKEN` (automatically set when you enable Blob)

**For Local Development:**
- Create `.env.local`:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

## 🔄 How It Works

### Production (Vercel with Blob enabled):
- Images are uploaded to Vercel Blob Storage
- Returns permanent CDN URLs like: `https://[hash].public.blob.vercel-storage.com/logo-xxx.png`
- **No URL length limits**
- **Fast CDN delivery**
- **Permanent storage**

### Development (No Blob token):
- Falls back to in-memory storage
- Uses short URLs: `/api/logo-image?id=xxx`
- Works locally without setup

## ✅ Benefits

1. **No Broken Links** - Permanent URLs that never expire
2. **Fast Loading** - CDN delivery worldwide
3. **No Size Limits** - Can handle large images
4. **Reliable** - Works with Farcaster embeds
5. **Scalable** - Handles high traffic

## 🧪 Testing

After enabling Blob:

1. Deploy to Vercel
2. Generate a logo
3. Click "CAST THIS LOGO"
4. Check console - should see Blob URL
5. Image should load in cast preview

## 📝 Notes

- Blob storage is **free** for reasonable usage
- Images are stored permanently (unless you delete them)
- URLs are public and accessible
- No additional configuration needed after enabling

---

**Status:** Code is ready! Just enable Blob in Vercel and deploy.
