# FixIt QC - Deployment Guide

This guide will walk you through deploying your FixIt QC marketing site to Firebase Hosting.

## Quick Start (5 minutes)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

### 3. Deploy the Site

From the `fixitqc-site` directory:

```bash
firebase deploy --only hosting
```

That's it! Your site will be live at: `https://fixit-prod-71fcb.web.app`

## Detailed Setup

### Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the project `fixit-prod-71fcb`
3. Click on "Authentication" in the left sidebar
4. Click "Get Started"
5. Click on "Email/Password" under Sign-in method
6. Toggle "Enable" to ON
7. Click "Save"

### Add Admin Users

To create users who can access the admin panel:

1. In Firebase Console > Authentication
2. Click on the "Users" tab
3. Click "Add user"
4. Enter an email address and password
5. Click "Add user"

These credentials can now be used to log in at `/login.html`.

### Configure Authorized Domains

1. In Firebase Console > Authentication > Settings
2. Scroll to "Authorized domains"
3. Add any custom domains you'll use (Firebase domains are pre-authorized)

## Local Testing

Before deploying, test locally:

### Option 1: Firebase Emulator (Recommended)

```bash
firebase serve
```

This serves your site at `http://localhost:5000` and works exactly like production.

### Option 2: Simple HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000
```

Note: Firebase auth may not work perfectly with simple HTTP servers due to redirect rules.

## Custom Domain Setup

### 1. Add Custom Domain in Firebase

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `fixitqc.com`)
4. Follow the verification steps

### 2. Update DNS Records

Add the DNS records provided by Firebase to your domain registrar:

- **A Record**: Points to Firebase IP addresses
- **TXT Record**: For domain verification

DNS propagation can take 24-48 hours.

### 3. SSL Certificate

Firebase automatically provisions and renews SSL certificates for custom domains.

## Deployment Commands

### Deploy Everything

```bash
firebase deploy
```

### Deploy Hosting Only

```bash
firebase deploy --only hosting
```

### Preview Before Deploy

```bash
firebase hosting:channel:deploy preview
```

## Post-Deployment Checklist

- [ ] Site loads at Firebase URL
- [ ] All pages accessible
- [ ] Navigation menu works
- [ ] Login page accessible
- [ ] Admin login works with test credentials
- [ ] All images load correctly
- [ ] Mobile responsive design works
- [ ] Contact form displays (note: backend not implemented)

## Updating the Site

When you make changes to the site:

1. Edit the HTML/CSS/JS files
2. Test locally with `firebase serve`
3. Deploy with `firebase deploy --only hosting`

## Troubleshooting

### "Not authorized" errors

Make sure you're logged in to the correct Firebase account:

```bash
firebase logout
firebase login
```

### Site not updating after deploy

Clear your browser cache or use incognito mode. Firebase Hosting uses CDN caching.

### Authentication not working

1. Verify Email/Password auth is enabled in Firebase Console
2. Check that your domain is in the authorized domains list
3. Make sure you've created at least one user

### Images not loading

Check that all image files are in `assets/img/` and referenced correctly in the HTML.

## Firebase Hosting Features

Your site includes:

- ✅ **Global CDN** - Fast loading worldwide
- ✅ **SSL/HTTPS** - Automatic and free
- ✅ **Custom domains** - Easy to add
- ✅ **Automatic scaling** - Handles any traffic
- ✅ **Rollback support** - Revert to previous versions
- ✅ **Preview channels** - Test before going live

## Support Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Cost Estimate

Firebase Hosting free tier includes:

- 10 GB storage
- 360 MB/day bandwidth (10 GB/month)
- Free SSL certificate
- Free custom domain

For most marketing sites, this is more than sufficient. Pricing only applies if you exceed these limits.

---

Need help? Check the Firebase documentation or contact Caleb Owen.
