# Order Analytics - Testing Checklist ✅

## Pre-Testing Setup
- [ ] Admin panel khol lo: `http://localhost:5173` (ya production URL)
- [ ] Login kar lo admin credentials se
- [ ] Dashboard → Order Analytics page par jao

---

## Test 1: Data Loading 🔄

### Expected:
- [ ] Page load ho raha hai bina error ke
- [ ] Loading spinner dikhai de raha hai initially
- [ ] Data load hone ke baad:
  - [ ] Summary stats show ho rahe hain
  - [ ] Shop list visible hai
  - [ ] Charts render ho rahe hain

### Debugging:
```
Console check karo:
- Koi error to nahi?
- API calls successful?
- /api/order/order-list ✅
- /api/go-market/grocery-shops ✅
```

---

## Test 2: Weekly View (Default) 📅

### Filters:
- [ ] Date From: Default last 7 days
- [ ] Date To: Default today
- [ ] Status Filter: All
- [ ] Shop Filter: All

### Expected Results:
- [ ] Summary cards show correct data:
  - [ ] Total Orders count
  - [ ] Total Revenue
  - [ ] Average Order Value
  - [ ] Total Items

- [ ] Shop-wise table:
  - [ ] **सभी shops listed हैं** (registered shops की total count check karo)
  - [ ] Orders वाली shops पहले (revenue high to low)
  - [ ] Zero orders वाली shops बाद में (alphabetically)
  - [ ] हर shop में correct data:
    - Shop Name ✅
    - Shop ID ✅
    - Total Orders (0 for inactive)
    - Total Revenue (₹0 for inactive)
    - Total Items (0 for inactive)

### Visual Indicators:
- [ ] Active shops: 🏪 icon
- [ ] Inactive shops: 🔒 icon
- [ ] Inactive shops: "No Sales" red badge visible

---

## Test 3: Monthly View 📆

### Switch to Monthly:
- [ ] Click "Monthly" toggle button
- [ ] Month selector appears
- [ ] Select current month

### Expected Results:
- [ ] Monthly Report header visible
- [ ] Month summary with 6 stats:
  - [ ] Total Orders ✅
  - [ ] **Total Shops** (सभी registered) ✅
  - [ ] **Active Shops** (सिर्फ order वाली) ✅
  - [ ] Total Revenue ✅
  - [ ] Items Sold ✅
  - [ ] Unique Products ✅

### Shop Sections:
#### For Active Shops:
- [ ] Shop header with name and stats
- [ ] Green revenue badge
- [ ] 🏪 icon
- [ ] Product Sales Analysis section:
  - [ ] Top 6 products visible
  - [ ] Product images showing
  - [ ] Quantity badges
  - [ ] Order count badges
  - [ ] Revenue per product
  - [ ] "+X more products" if >6
- [ ] Order Details section:
  - [ ] All orders listed
  - [ ] Customer info visible
  - [ ] Payment method shown
  - [ ] Product list per order
  - [ ] Correct totals

#### For Inactive Shops:
- [ ] Shop header with name
- [ ] 🔒 icon
- [ ] "No Sales" red badge
- [ ] Grey revenue badge showing ₹0
- [ ] All stats showing 0
- [ ] Empty state message:
  - [ ] 📭 icon
  - [ ] "No orders this month" text
  - [ ] Description visible

---

## Test 4: Filters 🔍

### Date Range (Weekly View):
- [ ] Change "From Date": older date
- [ ] Change "To Date": recent date
- [ ] Data updates correctly
- [ ] Shop counts update
- [ ] Revenue recalculates

### Status Filter:
- [ ] Select "Delivered"
- [ ] Only delivered orders show
- [ ] Shop stats update accordingly
- [ ] Select "All" again - all orders back

### Shop Filter:
- [ ] Select specific shop from dropdown
- [ ] Only that shop's orders show
- [ ] Stats update correctly
- [ ] Select "All" - all shops back

### Month Selector (Monthly View):
- [ ] Change month
- [ ] Data updates for selected month
- [ ] Shop sections refresh
- [ ] Summary stats recalculate

---

## Test 5: Sorting Verification 📊

### Check Shop Order:
1. **Active Shops** (with orders):
   - [ ] Highest revenue shop पहले
   - [ ] Lowest revenue shop (with orders) last in active section
   - [ ] Revenue descending order confirmed

2. **Inactive Shops** (zero orders):
   - [ ] All zero-order shops के बाद
   - [ ] Alphabetical order confirmed (A to Z)
   - [ ] सभी shops visible

### Manual Check:
```
Example:
Active (by revenue):
1. Shop A - ₹50,000
2. Shop B - ₹30,000
3. Shop C - ₹10,000

Inactive (alphabetical):
4. ABC Store - ₹0
5. City Mart - ₹0
6. Quick Store - ₹0
```

---

## Test 6: Print Functionality 🖨️

### Weekly View Print:
- [ ] Click Print button
- [ ] Print preview opens
- [ ] Check print layout:
  - [ ] Header with title and date range
  - [ ] Summary stats table
  - [ ] Shop-wise data table
  - [ ] All shops included (active + inactive)
  - [ ] Page breaks proper
  - [ ] Footer with page numbers

### Monthly View Print:
- [ ] Click Print button
- [ ] Print preview opens
- [ ] Check print layout:
  - [ ] Monthly header with month name
  - [ ] Month summary box (colored)
  - [ ] Each shop section:
    - [ ] Separate page for each shop
    - [ ] Active shops: Full details with products
    - [ ] Inactive shops: Empty state message
  - [ ] Colors printing correctly
  - [ ] Icons visible
  - [ ] Badges showing

### Print Color Check:
- [ ] Gradients visible (header, badges)
- [ ] Green badges for revenue
- [ ] Red badges for "No Sales"
- [ ] Grey badges for ₹0

---

## Test 7: CSV Export 📥

### Shop Summary Export:
- [ ] Click "Export CSV" → "Shop Summary"
- [ ] CSV file downloads
- [ ] Open in Excel/Sheets
- [ ] Check columns:
  - [ ] Shop ID ✅
  - [ ] Shop Name ✅
  - [ ] Total Orders ✅
  - [ ] Total Revenue ✅
  - [ ] Total Items ✅
  - [ ] Avg Order Value ✅
- [ ] Check data:
  - [ ] **सभी shops present** (including ₹0 ones)
  - [ ] Numbers correct
  - [ ] No missing rows
  - [ ] Sorted correctly (active first, then alphabetical)

### Detailed Orders Export:
- [ ] Click "Export CSV" → "Detailed Orders"
- [ ] CSV file downloads
- [ ] Open in Excel/Sheets
- [ ] Check columns:
  - [ ] Order ID ✅
  - [ ] Date ✅
  - [ ] Shop Name ✅
  - [ ] Customer Name ✅
  - [ ] Product Name ✅
  - [ ] Quantity ✅
  - [ ] Unit Price ✅
  - [ ] Total Amount ✅
- [ ] Check data:
  - [ ] Only orders with actual data (no zero-order shops here)
  - [ ] All orders included
  - [ ] Product-level breakdown
  - [ ] Correct calculations

---

## Test 8: Responsive Design 📱

### Desktop (> 1200px):
- [ ] Shops grid: 2-3 columns
- [ ] Product cards: proper grid
- [ ] All sections visible side-by-side

### Tablet (768px - 1200px):
- [ ] Shops: 1-2 columns
- [ ] Product cards: 2 columns
- [ ] Readable text sizes

### Mobile (< 768px):
- [ ] Shops: 1 column (full width)
- [ ] Product cards: 1 column
- [ ] Buttons stack vertically
- [ ] Header wraps properly
- [ ] Stats cards stack
- [ ] Filters wrap to multiple rows
- [ ] All text readable
- [ ] Touch targets big enough

---

## Test 9: Edge Cases 🔍

### No Orders at All:
- [ ] Select date range with no orders
- [ ] Empty state shows
- [ ] But ALL shops still listed?
- [ ] All shops show "No Sales"

### Only 1 Shop with Orders:
- [ ] Filter to show just 1 active shop
- [ ] That 1 shop shows properly
- [ ] All other shops show as inactive

### All Shops Have Orders:
- [ ] Month where all shops were active
- [ ] No "No Sales" badges
- [ ] All shops show in active section
- [ ] Proper revenue sorting

### 50+ Shops:
- [ ] Page scrollable
- [ ] Performance okay (no lag)
- [ ] All shops render
- [ ] Search/filter works

---

## Test 10: Data Accuracy 🎯

### Manual Verification:
1. **Pick one shop manually:**
   - [ ] Count its orders manually from Orders page
   - [ ] Match with Analytics count
   - [ ] Calculate revenue manually
   - [ ] Match with Analytics revenue

2. **Check totals:**
   - [ ] Total Orders = Sum of all order counts
   - [ ] Total Revenue = Sum of all shop revenues
   - [ ] Total Shops = Registered shops count
   - [ ] Active Shops = Shops with orders > 0

3. **Product counts:**
   - [ ] Pick one shop
   - [ ] Verify top products match actual orders
   - [ ] Quantities add up correctly
   - [ ] Revenue per product correct

---

## Test 11: Performance ⚡

### Load Times:
- [ ] Initial page load < 3 seconds
- [ ] Data fetch < 2 seconds
- [ ] Filter changes < 1 second
- [ ] Print preview < 2 seconds
- [ ] CSV export instant

### Browser Check:
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Edge ✅
- [ ] Safari (if available) ✅

---

## Test 12: Error Handling ⚠️

### API Failures:
1. **Simulate order API failure:**
   - [ ] Error handled gracefully
   - [ ] User-friendly message
   - [ ] Page doesn't crash

2. **Simulate shops API failure:**
   - [ ] Error handled gracefully
   - [ ] Falls back to orders-only shops
   - [ ] No crash

### Network Issues:
- [ ] Slow network: Loading spinner shows
- [ ] Offline: Proper error message
- [ ] Retry works when network back

---

## Bug Report Template 🐛

Agar koi issue mile, iss format me report karo:

```
BUG: [Short description]

Steps to Reproduce:
1. Go to Order Analytics
2. Select Monthly view
3. Choose December 2024
4. [etc.]

Expected:
All 50 shops should show

Actual:
Only 8 shops showing

Screenshots:
[Attach screenshot]

Console Errors:
[Paste any console errors]

Browser:
Chrome 120.0.0

Date/Time:
2024-12-22, 3:45 PM
```

---

## Success Criteria ✅

Implementation successful hai agar:

- [x] सभी registered shops visible हैं (Weekly + Monthly)
- [x] Active vs Inactive clearly distinguishable
- [x] Sorting correct (Revenue → Alphabetical)
- [x] Stats accurate (Total vs Active shops)
- [x] Print works (all shops)
- [x] CSV exports complete data
- [x] Mobile responsive
- [x] No console errors
- [x] Performance acceptable
- [x] Visual indicators clear

---

## Final Checklist Summary 📋

```
□ 1. Data Loading        [5 checks]
□ 2. Weekly View         [12 checks]
□ 3. Monthly View        [18 checks]
□ 4. Filters             [11 checks]
□ 5. Sorting             [7 checks]
□ 6. Print               [14 checks]
□ 7. CSV Export          [12 checks]
□ 8. Responsive          [12 checks]
□ 9. Edge Cases          [8 checks]
□ 10. Data Accuracy      [9 checks]
□ 11. Performance        [9 checks]
□ 12. Error Handling     [6 checks]

Total: 123 checks
```

---

## Quick Test (5 Minutes) ⚡

Agar time kam hai, ye minimum tests karo:

1. ✅ Page load ho raha hai
2. ✅ Weekly view me ALL shops dikhai de rahi hain
3. ✅ Monthly view me ALL shops dikhai de rahi hain
4. ✅ Inactive shops me "No Sales" badge hai
5. ✅ Print working hai
6. ✅ CSV export me all shops hain
7. ✅ Mobile me properly display ho raha hai
8. ✅ No console errors

---

**Happy Testing! 🎉**
