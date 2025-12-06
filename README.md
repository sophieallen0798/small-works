# Small Works Boise

A professional website for Small Works Boise, a construction company specializing in home renovations and remodeling services in Boise, Idaho.

## Features

- **Home Page** - Company overview with services highlight and call-to-action
- **Services Page** - Detailed list of all services offered
- **Our Work Page** - Portfolio showcase with Zillow link integration for project examples
- **Contact Page** - Contact form using Formspree (GitHub Pages compatible)
- **Responsive Design** - Mobile-friendly layout that works on all devices
- **Thank You Page** - Confirmation page after form submission

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository Settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "Deploy from a branch"
4. Select "main" (or your default branch) and "/ (root)"
5. Click Save

Your site will be available at: `https://[username].github.io/small-works/`

### 2. Configure Contact Form (Formspree)

The contact form uses [Formspree](https://formspree.io/) to handle submissions (free tier available):

1. Go to [formspree.io](https://formspree.io/) and create a free account
2. Create a new form in your Formspree dashboard
3. Copy your form endpoint (looks like: `https://formspree.io/f/xabcdefg`)
4. Edit `contact.html` and replace `YOUR_FORMSPREE_ENDPOINT` with your actual endpoint

### 3. Add Your Images

Place your project images in the `images/` folder and update the HTML files to reference them.

### 4. Add Zillow Links

Edit `projects.html` to add your actual Zillow property links:

```html
<a href="https://www.zillow.com/homedetails/YOUR-PROPERTY-LINK" class="zillow-badge" target="_blank" rel="noopener noreferrer">
    View on Zillow
</a>
```

## File Structure

```
small-works/
├── index.html          # Home page
├── services.html       # Services page
├── contact.html        # Contact page with form
├── thank-you.html      # Form submission confirmation
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── main.js         # JavaScript for navigation
├── images/             # Image assets (add your photos here)
└── README.md           # This file
```

## Customization

### Colors

The color scheme can be customized in `css/styles.css` by modifying the CSS variables at the top:

```css
:root {
    --primary-color: #2c5530;      /* Main green */
    --primary-dark: #1e3a21;       /* Darker green */
    --secondary-color: #d4a857;    /* Gold accent */
    /* ... */
}
```

### Content

- Edit the HTML files directly to update text content
- Replace placeholder images with actual project photos
- Update Zillow links in `projects.html`

## Services Offered

- Full House Renovations
- Kitchen Remodeling
- Bathroom Renovations
- Home Additions
- Basement Finishing
- Structural Work
- Interior Finishing
- General Repairs

## License

© 2024 Small Works Boise. All rights reserved.
