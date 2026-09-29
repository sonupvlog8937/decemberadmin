import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FiPlus } from 'react-icons/fi';
import './style.css';

/**
 * ProductOptionsWithPrice Component
 * 
 * Allows admin to add product options with different prices
 * Example: Weight → 500g ₹500, 1000g ₹1200
 * 
 * Props:
 * - value: Array of option groups
 * - onChange: Callback when options change
 */
const ProductOptionsWithPrice = ({ value = [], onChange }) => {
  const [options, setOptions] = useState(value.length > 0 ? value : []);

  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      values: [
        { id: Date.now() + 1, value: '', price: '', mrp: '' }
      ]
    };
    const updated = [...options, newOption];
    setOptions(updated);
    onChange(updated);
  };

  const handleRemoveOption = (optionId) => {
    const updated = options.filter(opt => opt.id !== optionId);
    setOptions(updated);
    onChange(updated);
  };

  const handleOptionNameChange = (optionId, name) => {
    const updated = options.map(opt =>
      opt.id === optionId ? { ...opt, name } : opt
    );
    setOptions(updated);
    onChange(updated);
  };

  const handleAddValue = (optionId) => {
    const updated = options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          values: [
            ...opt.values,
            { id: Date.now(), value: '', price: '', mrp: '' }
          ]
        };
      }
      return opt;
    });
    setOptions(updated);
    onChange(updated);
  };

  const handleRemoveValue = (optionId, valueId) => {
    const updated = options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          values: opt.values.filter(v => v.id !== valueId)
        };
      }
      return opt;
    });
    setOptions(updated);
    onChange(updated);
  };

  const handleValueChange = (optionId, valueId, field, fieldValue) => {
    const updated = options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          values: opt.values.map(v =>
            v.id === valueId ? { ...v, [field]: fieldValue } : v
          )
        };
      }
      return opt;
    });
    setOptions(updated);
    onChange(updated);
  };

  return (
    <div className="product-options-with-price">
      <div className="options-header">
        <div>
          <h4>Product options with prices</h4>
          <p className="options-description">
            Example: Weight → 500g ₹500, 1000g ₹1200. Customer price changes dynamically.
          </p>
        </div>
        <button
          type="button"
          className="btn-add-option"
          onClick={handleAddOption}
        >
          <FiPlus /> Add option
        </button>
      </div>

      {options.map((option, optIndex) => (
        <div key={option.id} className="option-group">
          <div className="option-header-row">
            <input
              type="text"
              className="option-name-input"
              placeholder="Option name e.g. Weight"
              value={option.name}
              onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
            />
            <button
              type="button"
              className="btn-remove-option"
              onClick={() => handleRemoveOption(option.id)}
              title="Remove option"
            >
              <IoMdClose />
            </button>
          </div>

          <div className="option-values">
            {option.values.map((val, valIndex) => (
              <div key={val.id} className="value-row">
                <input
                  type="text"
                  className="value-input"
                  placeholder="500g"
                  value={val.value}
                  onChange={(e) =>
                    handleValueChange(option.id, val.id, 'value', e.target.value)
                  }
                />
                <input
                  type="number"
                  className="price-input"
                  placeholder="Price ₹"
                  value={val.price}
                  onChange={(e) =>
                    handleValueChange(option.id, val.id, 'price', e.target.value)
                  }
                />
                <input
                  type="number"
                  className="mrp-input"
                  placeholder="MRP ₹"
                  value={val.mrp}
                  onChange={(e) =>
                    handleValueChange(option.id, val.id, 'mrp', e.target.value)
                  }
                />
                <button
                  type="button"
                  className="btn-remove-value"
                  onClick={() => handleRemoveValue(option.id, val.id)}
                  title="Remove value"
                >
                  <IoMdClose />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-add-value"
            onClick={() => handleAddValue(option.id)}
          >
            <FiPlus /> Add value and price
          </button>
        </div>
      ))}

      {options.length === 0 && (
        <div className="empty-state">
          <p>No product options added yet. Click "Add option" to create pricing variants.</p>
        </div>
      )}
    </div>
  );
};

export default ProductOptionsWithPrice;
