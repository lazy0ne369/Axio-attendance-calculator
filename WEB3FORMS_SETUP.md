# Web3Forms Setup Instructions

## Quick Setup (2 minutes)

### Step 1: Get Your Access Key

1. Visit: https://web3forms.com
2. Enter your email address (where you want to receive feedback)
3. Click "Get Access Key"
4. Copy the access key they send to your email

### Step 2: Add Access Key to Your App

1. Open the file: `src/pages/Feedback.jsx`
2. Find line 30: `access_key: "YOUR_ACCESS_KEY_HERE",`
3. Replace `YOUR_ACCESS_KEY_HERE` with your actual access key
4. Save the file

Example:

```javascript
access_key: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
```

### Step 3: Test It Out

1. Run your app: `npm run dev`
2. Go to the Feedback page
3. Submit a test feedback
4. Check your email - you should receive the feedback!

## Features Included

✅ Email notifications sent to your inbox
✅ All feedback details included (name, email, type, message)
✅ Professional email formatting
✅ Loading state during submission
✅ Error handling for network issues
✅ Success confirmation message

## Free Tier Limits

- ✅ Unlimited submissions
- ✅ No credit card required
- ✅ No expiration

## Email Format

You'll receive emails with:

- Subject: "Axio Feedback - [Type]"
- Sender: "Axio Feedback Form"
- Content: Name, Email, Type, and Message

---

That's it! Your feedback form is now connected to a real backend. 🎉
