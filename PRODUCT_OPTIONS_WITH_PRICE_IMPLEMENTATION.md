# Product Options With Price - Implementation Guide

## Overview
Added Product Options with Prices feature to admin panel. This allows admins to define product variants (like Weight: 500g, 1kg) with different pricing for each option.

## Example Use Cases
- **Weight variants**: 500g ₹500, 1kg ₹900, 2kg ₹1800
- **Size variants**: Small ₹299, Medium ₹499, Large ₹699
- **RAM variants**: 4GB ₹15,999, 8GB ₹18,999, 16GB ₹24,999
- **Storage**: 128GB ₹25,999, 256GB ₹29,999, 512GB ₹35,999

## Backend Implementation

### Schema (product.modal.js)
```javascript
productOptions: [{
  name: { type: String, required: true },  // e.g., "Weight", "Size", "RAM"
  values: [{
    value: { type: String, required: true },  // e.g., "500g", "1kg"
    price: { type: Number, required: true },  // e.g., 500, 900
    mrp: { type: Number, default: 0 }        // e.g., 600, 1000
  }]
}]
```

### Location
File: `backend/models/product.modal.js` (line ~48, after colorOptions)

## Admin Panel Implementation

### Component Created
**File**: `admin/src/Components/ProductOptionsWithPrice/index.jsx`
**CSS**: `admin/src/Components/ProductOptionsWithPrice/style.css`

**Features**:
- Add/remove product option types (Weight, Size, RAM, etc.)
- Add/remove values for each option type
- Set Price and MRP for each value
- Clean, professional UI with validation
- Auto-filters empty options before saving

### Integration in AddProduct.jsx

**Changes Made**:
1. **Import**: Added `import ProductOptionsWithPrice from '../../Components/ProductOptionsWithPrice';`
2. **State**: Added `productOptions: []` to formFields initial state
3. **JSX**: Added component after Specifications section:
   ```jsx
   <div className='col w-full p-5 px-0'>
       <ProductOptionsWithPrice 
           value={formFields.productOptions}
           onChange={(updatedOptions) => {
               setFormFields((prev) => ({
                   ...prev,
                   productOptions: updatedOptions
               }));
           }}
       />
   </div>
   ```
4. **Payload Mapping**: Added filtering and transformation in handleSubmitg():
   ```javascript
   productOptions: (formFields.productOptions || [])
       .filter((opt) => opt.name && opt.values && opt.values.length > 0)
       .map((opt) => ({
           name: opt.name,
           values: opt.values.filter((v) => v.value && v.price).map((v) => ({
               value: v.value,
               price: Number(v.price),
               mrp: Number(v.mrp) || 0
           }))
       }))
   ```

### Integration in EditProduct.jsx

**Changes Made**:
1. **Import**: Added `import ProductOptionsWithPrice from '../../Components/ProductOptionsWithPrice';`
2. **State**: Added `productOptions: []` to formFields initial state
3. **Load Data**: Added productOptions loading from API response:
   ```javascript
   productOptions: (res?.product?.productOptions || []).length !== 0 ? res?.product?.productOptions : []
   ```
4. **JSX**: Added component after Specifications section (same as AddProduct)
5. **Payload Mapping**: Added same filtering/transformation as AddProduct

## Data Flow

### Admin Add/Edit Flow
1. Admin fills product details
2. Clicks "Product Options with Price" section
3. Adds option (e.g., "Weight")
4. Adds values with prices:
   - Value: 500g, Price: 500, MRP: 600
   - Value: 1kg, Price: 900, MRP: 1000
5. On submit, data is filtered and sent to backend
6. Backend validates and stores in MongoDB

### Data Structure Example
```javascript
// Sent to backend
{
  productOptions: [
    {
      name: "Weight",
      values: [
        { value: "500g", price: 500, mrp: 600 },
        { value: "1kg", price: 900, mrp: 1000 }
      ]
    },
    {
      name: "Size",
      values: [
        { value: "Small", price: 299, mrp: 399 },
        { value: "Large", price: 499, mrp: 599 }
      ]
    }
  ]
}
```

## Files Modified

### Backend
- `backend/models/product.modal.js` - Added productOptions schema

### Admin Panel
- `admin/src/Components/ProductOptionsWithPrice/index.jsx` - NEW component
- `admin/src/Components/ProductOptionsWithPrice/style.css` - NEW styles
- `admin/src/Pages/Products/addProduct.jsx` - Integrated component
- `admin/src/Pages/Products/editProduct.jsx` - Integrated component

## Next Steps (Client-Side Implementation)

### 1. Display in Product Details (Web Client)
File: `client/src/Pages/ProductDetails/index.jsx`

**Requirements**:
- Display available options (Weight, Size, etc.)
- Show values with prices
- Allow user to select option
- Update displayed price dynamically based on selection
- Pass selected option to cart

### 2. Display in Product Details (Mobile App)
File: `application/app/(tabs)/productDetails/[id].tsx`

**Requirements**:
- Same as web client
- Native UI components (TouchableOpacity, Radio buttons)
- Price animation on selection change

### 3. Cart Integration
**Requirements**:
- Store selected option with cart item
- Display selected option in cart
- Use option-specific price for calculations
- Handle option display in checkout

## Testing Checklist

### Admin Panel
- [x] Add new product with options
- [x] Edit existing product options
- [ ] Delete product with options
- [ ] Validation: empty option names rejected
- [ ] Validation: values without price rejected
- [ ] Multiple option types work correctly

### Client (To Do)
- [ ] Options display correctly
- [ ] Price changes on option selection
- [ ] Selected option passed to cart
- [ ] Cart shows selected option
- [ ] Checkout uses correct price
- [ ] Order confirmation shows option

### Mobile (To Do)
- [ ] All client tests but on mobile
- [ ] Native UI works smoothly
- [ ] Touch interactions responsive

## UI/UX Notes

### Admin Panel
- Clean, professional card-based layout
- Add/remove buttons clearly labeled
- Price and MRP fields side-by-side
- Empty options auto-filtered on save
- No clutter from empty rows

### Client Display (Planned)
- Radio buttons or dropdown for single selection
- Price clearly shows change when selecting
- Original price strikethrough if MRP exists
- Clear visual feedback on selection
- "Add to Cart" button updates with selected price

## API Endpoints

### Used
- `POST /api/product/uploadImages` - Image upload for products
- `POST /api/product/createProduct` - Create with productOptions
- `PUT /api/product/updateProduct/:id` - Update with productOptions
- `GET /api/product/:id` - Fetch product with options

### Client Will Use
- `GET /api/product/:id` - Fetch product details with options
- `POST /api/cart/add` - Add to cart with selected option

## Known Limitations
1. Single selection only (one option value per type)
2. No option combinations (can't do Size + Color together yet)
3. No stock tracking per option value
4. No images per option value (except colorOptions which has separate handling)

## Future Enhancements
1. **Option Combinations**: Size + Color variants with unique pricing
2. **Stock per Option**: Track inventory for each option value
3. **Images per Option**: Different images for different weights/sizes
4. **Option Groups**: Group related options (Storage + RAM as "Configuration")
5. **Bulk Import**: CSV import for products with many option variants

## Implementation Status
- [x] Backend schema
- [x] Admin component creation
- [x] AddProduct integration
- [x] EditProduct integration
- [ ] Client display
- [ ] Mobile display
- [ ] Cart integration
- [ ] Checkout flow
- [ ] Order tracking with options

---
**Last Updated**: Current Session
**Backend**: ✅ Complete
**Admin**: ✅ Complete  
**Client**: ⏳ Pending
**Mobile**: ⏳ Pending
