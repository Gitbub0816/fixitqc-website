# FixIt QC Marketing Website v7.0

A modern, responsive marketing website for FixIt QC with enhanced glassmorphism design, icon-based navigation, and comprehensive admin panel.

## ✨ What's New in v7.0

- **Icon-Based Navigation**: Replaced emojis with clean SVG icons in orange
- **Enhanced Glass Cards**: Violet backglow on default, orange glow on hover/active
- **Comprehensive Admin Panel**: Full user and equipment management with CRUD operations
- **Better Visual Hierarchy**: Improved spacing, typography, and interactive elements
- **10 Sample Users**: 3 admins, 6 technicians, 1 user pre-populated
- **Equipment Management**: Track and manage equipment with status indicators

## 🎨 Design Features

- Modern glassmorphism with liquid glass effects
- Responsive layout optimized for all devices
- Firebase Authentication integration ready
- Mobile-first cascade menu navigation
- Clean, professional presentation

## 📁 File Structure

```
fixitqc-site/
├── index.html              # Homepage with hero and feature highlights
├── features.html           # Detailed features page
├── pricing.html            # Pricing tiers and plans
├── screenshots.html        # UI gallery
├── contact.html            # Contact form
├── login.html              # Admin login page
├── admin.html              # Protected admin console with full management
├── assets/
│   ├── css/
│   │   └── site.css        # Enhanced stylesheet with new effects
│   ├── js/
│   │   ├── site.js         # General site functionality
│   │   ├── firebase-config.mjs    # Firebase configuration (placeholder)
│   │   ├── login.mjs              # Login page logic (placeholder)
│   │   └── admin.mjs              # Admin page logic (placeholder)
│   └── img/
│       ├── fixitqc-logo.png       # Your logo (ADD THIS)
│       └── screen1-6.png          # Screenshot images (ADD THESE)
├── firebase.json           # Firebase hosting configuration
├── .firebaserc             # Firebase project configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Add Your Logo

Replace `assets/img/fixitqc-logo.png` with your actual logo file. The logo you provided should be placed here.

### 2. Add Screenshots (Optional)

Add screenshot images to `assets/img/`:
- `screen1.png` through `screen6.png`
- Recommended size: 400x800px

### 3. Test Locally

Open `index.html` in a web browser, or use a local server:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000
```

### 4. Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

## 🎯 Admin Panel Features

The admin panel (`admin.html`) includes:

### User Management
- **View all users** with role badges (Admin/Tech/User)
- **Add new users** with role and station assignment
- **Edit existing users** - modify any user details
- **Delete users** with confirmation
- **Promote users** - upgrade from User → Tech → Admin
- **Status indicators** - Active/Inactive visual status

### Equipment Management
- **View all equipment** with status indicators
- **Add new equipment** with ID, type, location, and status
- **Edit equipment** details
- **Delete equipment** with confirmation
- **Status tracking** - Active/Maintenance/Inactive states
- **Service history** - Last service date tracking

### Sample Data
- **10 Pre-loaded Users**:
  - 3 Administrators (John Martinez, Sarah Chen, Mike Johnson)
  - 6 Technicians (David, Emily, James, Lisa, Robert, Jennifer)
  - 1 Regular User (Michael Brown)
- **8 Equipment Items** across 4 stations (LAX, JFK, ORD, DFW)

### Quick Stats Dashboard
- Active stations count
- Total users (updates live)
- Total equipment (updates live)

## 🎨 Color Scheme

The site uses a sophisticated dark theme with copper and violet accents:

```css
--bg: #101318          /* Primary background */
--copper: #EC9C42      /* Primary accent (orange) */
--violet: #8B5CF6      /* Secondary accent (violet) */
--text: #EDEFF4        /* Primary text */
--muted: #9aa3b2       /* Secondary text */
```

### Glass Card Effects
- **Default state**: Violet glow (`rgba(139, 92, 246, 0.4)`)
- **Hover/Active**: Orange glow (`rgba(236, 156, 66, 0.5)`)

## 🔧 Customization

### Updating Firebase Config

Edit `assets/js/firebase-config.mjs` with your Firebase project details:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

### Changing Colors

Edit the CSS custom properties in `assets/css/site.css`:

```css
:root {
  --copper: #EC9C42;  /* Change your primary accent */
  --violet: #8B5CF6;  /* Change your secondary accent */
  /* ... other variables */
}
```

### Adding Navigation Items

Add new menu items in the cascade menu section of each HTML file:

```html
<a class="mini-card" href="your-page.html">
  <span class="ico">
    <svg viewBox="0 0 24 24">
      <!-- Your SVG icon path -->
    </svg>
  </span>
  <span>Your Label</span>
</a>
```

## 📱 Responsive Design

The site is fully responsive with breakpoints at:
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adjusted grid)
- **Mobile**: <768px (single column, mobile menu)

## 🔐 Firebase Authentication

To enable actual authentication:

1. Set up Firebase Authentication in Firebase Console
2. Enable Email/Password sign-in method
3. Update `firebase-config.mjs` with your config
4. Add Firebase SDK scripts to your HTML
5. Implement auth logic in `login.mjs` and `admin.mjs`

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- The contact form is frontend-only (no backend)
- Admin panel works in demo mode without Firebase
- All user/equipment data is stored in browser memory only
- Logo and screenshots need to be added manually

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

### Quick Deploy

```bash
firebase deploy --only hosting
```

Your site will be live at: `https://fixit-prod-71fcb.web.app`

## 💡 Tips

1. **Logo Format**: PNG or SVG recommended, ~300x60px
2. **Screenshots**: Use actual app screenshots for best results
3. **Testing**: Always test on mobile devices before deploying
4. **Performance**: Images should be optimized (compressed)
5. **SEO**: Update meta tags in each HTML file's `<head>`

## 📄 License

© Caleb Owen 2025 • FixIt QC • Internal-friendly demo.

---

**Need Help?** Check the Firebase documentation or contact Caleb Owen.
# fixitqc-website
