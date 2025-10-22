# Waitlist + Referral System - Deployment Guide

## 🚀 Quick Start

### Step 1: Run the Database Migration

You need to apply the migration to create the waitlist tables in your Supabase database.

#### Option A: Via Supabase CLI (Recommended)

```bash
# Make sure you're logged in to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration to your database
supabase db push
```

#### Option B: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250627000000_waitlist_referral_system.sql`
4. Paste into the SQL editor
5. Click **Run**

### Step 2: Update Supabase Types (Optional but Recommended)

After running the migration, regenerate your TypeScript types:

```bash
supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
```

This will add the new `waitlist`, `invite_codes`, `referrals`, and `user_invites` tables to your TypeScript types.

### Step 3: Test the Waitlist

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the landing page

3. Scroll to the "Join Waitlist" section

4. Fill out the form and submit

5. You should see:
   - Success message with your position
   - Your unique referral link
   - Social sharing buttons

### Step 4: Test Referral System

1. Copy your referral link from the success screen

2. Open in an incognito window (or different browser)

3. The referral code should auto-populate

4. Submit the form

5. Check that:
   - The referrer moved up 10 positions
   - The referee was linked to the referrer
   - Both entries appear in the database

## 📊 Database Tables Created

### 1. `waitlist`
Stores everyone who joins the waitlist.

**Key Fields:**
- `email` - User's email (unique)
- `full_name` - User's name
- `referral_code` - Unique code for sharing
- `referred_by` - UUID of referrer (if applicable)
- `position` - Current position in line
- `referral_count` - Number of successful referrals
- `status` - waiting | invited | signed_up | rejected

### 2. `invite_codes`
Tracks invite codes given to users to invite others.

**Key Fields:**
- `code` - Unique invite code
- `created_by` - User who owns the code
- `used_by` - User who used the code
- `status` - active | used | expired | revoked

### 3. `referrals`
Tracks referral relationships.

**Key Fields:**
- `referrer_id` - Person who referred
- `referee_id` - Person who was referred
- `reward_points` - Points earned (default 10)

### 4. `user_invites`
Tracks invite code allocation for registered users.

**Key Fields:**
- `user_id` - User who owns invites
- `invites_remaining` - Codes left to give
- `invites_accepted` - Successfully used codes

## 🔧 Database Functions Available

### `generate_referral_code(user_email TEXT)`
Generates a unique 8-character referral code.

```sql
SELECT generate_referral_code('user@example.com');
-- Returns: 'A3F9C2E1'
```

### `calculate_waitlist_position(waitlist_id UUID)`
Calculates user's current position considering referrals.

```sql
SELECT calculate_waitlist_position('uuid-here');
-- Returns: 42
```

### `process_referral(referrer_code TEXT, referee_id UUID)`
Processes a referral and updates positions.

```sql
SELECT process_referral('A3F9C2E1', 'uuid-here');
-- Returns: JSON with success status and details
```

### `get_waitlist_stats()`
Gets overview statistics.

```sql
SELECT get_waitlist_stats();
-- Returns: JSON with total_waiting, total_invited, top_referrers, etc.
```

### `use_invite_code(code_to_use TEXT, user_id UUID)`
Validates and uses an invite code during signup.

```sql
SELECT use_invite_code('INV-ABC12-1234567890', 'uuid-here');
-- Returns: JSON with success status
```

### `create_user_invite_codes(user_id UUID, num_codes INTEGER)`
Creates invite codes for new users.

```sql
SELECT create_user_invite_codes('uuid-here', 3);
-- Creates 3 invite codes for the user
```

## 🎯 Referral Rewards System

### Automatic Position Bonuses

- **Each referral** = Move up 10 positions
- **3 referrals** = Top 30% + Priority support badge
- **5 referrals** = **Instant Access** ⚡ (status → 'invited')
- **10 referrals** = Platinum tier + lifetime perks

### Position Calculation Formula

```
position = base_position - (referral_count × 10)
minimum position = 1
```

Example:
- User joins at position 247
- Gets 5 referrals
- New position: 247 - (5 × 10) = 197
- Status automatically changes to 'invited'

## 🔒 Security (Row Level Security)

### Waitlist Table
- ✅ Anyone can insert (anon users)
- ✅ Users can view their own entry
- ✅ Admins can view all entries

### Invite Codes Table
- ✅ Users can view their own codes
- ✅ Users can create codes
- ✅ Admins can manage all codes

### Referrals Table
- ✅ Users can view their referrals
- ✅ Admins can view all referrals

### User Invites Table
- ✅ Users can view/update their own invites
- ✅ Admins can manage all user invites

## 📧 Email Automation (TODO)

You'll want to set up these email triggers:

1. **Waitlist Confirmation** - When someone joins
   - Send welcome email
   - Include referral link
   - Show current position

2. **Referral Success** - When someone uses your link
   - Notify referrer
   - Show new position
   - Encourage more sharing

3. **Position Update** - Every X referrals
   - Celebrate milestones (Top 100, Top 50, etc.)
   - Show progress

4. **Instant Access** - When 5 referrals reached
   - Send invite code
   - Congratulate on achievement

5. **You're Next** - When in top 50
   - Build anticipation
   - Prepare for access

6. **Welcome to Alo—Sales** - When invited
   - Send invite code
   - Onboarding instructions

### Email Implementation Options

**Option 1: Supabase Edge Functions**
```typescript
// supabase/functions/send-waitlist-email/index.ts
Deno.serve(async (req) => {
  // Send email using Resend, SendGrid, etc.
});
```

**Option 2: Database Triggers + Webhooks**
```sql
CREATE TRIGGER on_waitlist_insert
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook();
```

**Option 3: Third-party Services**
- Resend
- SendGrid
- Mailgun
- AWS SES

## 🎨 Admin Dashboard (Coming Soon)

Create an admin page to:
- View all waitlist entries
- Manually approve/invite users
- Generate bulk invite codes
- View referral leaderboard
- Export waitlist to CSV
- Send bulk emails
- Track conversion metrics

See `WAITLIST_REFERRAL_SYSTEM.md` for the full admin dashboard design.

## 🧪 Testing Checklist

### Basic Flow
- [ ] Join waitlist with valid email
- [ ] Receive success message with position
- [ ] Get unique referral link
- [ ] Referral code auto-populates from URL
- [ ] Form submission with referral code works
- [ ] Position updates correctly

### Referral Flow
- [ ] Referrer's count increases
- [ ] Referrer's position improves
- [ ] Referee is linked to referrer
- [ ] 5 referrals triggers instant access
- [ ] Status changes to 'invited'

### Edge Cases
- [ ] Duplicate email shows error
- [ ] Invalid referral code is ignored
- [ ] Self-referral is prevented
- [ ] Position never goes below 1
- [ ] Large referral counts work

### Social Sharing
- [ ] Copy link works
- [ ] Twitter share works
- [ ] LinkedIn share works
- [ ] WhatsApp share works
- [ ] Email share works

## 🐛 Troubleshooting

### "Table waitlist does not exist"
You haven't run the migration yet. See Step 1 above.

### TypeScript errors in WaitlistForm
Types haven't been regenerated. Either:
1. Run `supabase gen types` (Step 2 above)
2. Keep the `as any` type assertions (works but not ideal)

### Referral code not auto-populating
Check the URL has `?ref=CODE` parameter. The useEffect should pick it up.

### Position not updating
Run in SQL editor:
```sql
SELECT update_all_waitlist_positions();
```

### Instant access not triggering at 5 referrals
Check the `process_referral` function runs successfully. Look for errors in Supabase logs.

## 📈 Monitoring

### Key Metrics to Track

```sql
-- Total waitlist size
SELECT COUNT(*) FROM waitlist WHERE status = 'waiting';

-- Viral coefficient (referrals per user)
SELECT AVG(referral_count) FROM waitlist;

-- Top referrers
SELECT full_name, email, referral_count
FROM waitlist
ORDER BY referral_count DESC
LIMIT 10;

-- Conversion funnel
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM waitlist
GROUP BY status;

-- Growth rate (last 7 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as signups
FROM waitlist
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

## 🎓 Next Steps

1. **Run the migration** ✅
2. **Test the waitlist form** ✅
3. **Test referral system** ✅
4. **Set up email automation** (recommended)
5. **Create admin dashboard** (optional)
6. **Add analytics tracking** (recommended)
7. **Monitor growth metrics** (essential)

## 💡 Pro Tips

1. **Seed Initial Users**: Invite 50-100 beta users to kickstart growth
2. **Create Urgency**: "Only 10 spots released this week"
3. **Show Social Proof**: Display real-time join notifications
4. **Celebrate Milestones**: "You're in the top 10%!"
5. **Surprise & Delight**: Random instant access for active referrers
6. **Leaderboard**: Public or semi-public top referrers
7. **Time Limits**: "Double referral bonus ends in 48h"

## 📚 Resources

- Full system documentation: `WAITLIST_REFERRAL_SYSTEM.md`
- Email templates: Check the documentation file
- Supabase docs: https://supabase.com/docs
- RLS policies: https://supabase.com/docs/guides/auth/row-level-security

---

**Need help?** Open an issue or contact the development team!
