import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FilterSidebar({
    categories = [],
    selectedCategory,
    onSelectCategory,
    title = "Categories",

    // Product attribute filters
    attributes = {},
    selectedAttributes = {},
    onSelectAttribute,

    // Blog type filter
    types = [],
    selectedType,
    onSelectType
}) {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        attributes: true,
        types: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleAttributeToggle = (attrName, value) => {
        if (!onSelectAttribute) return;

        const currentValues = selectedAttributes[attrName] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onSelectAttribute(attrName, newValues);
    };

    const hasAttributes = Object.keys(attributes).length > 0;
    const hasTypes = types.length > 0;

    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 h-fit space-y-4">

            {/* Categories Section */}
            {categories.length > 0 && (
                <div>
                    <button
                        onClick={() => toggleSection('categories')}
                        className="w-full flex items-center justify-between mb-3"
                    >
                        <h3 className="font-semibold text-base text-gray-800 dark:text-white">{title}</h3>
                        {expandedSections.categories ?
                            <ChevronUp className="w-4 h-4 text-gray-500" /> :
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        }
                    </button>

                    {expandedSections.categories && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => onSelectCategory("")}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory
                                    ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onSelectCategory(category)}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${selectedCategory === category
                                        ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Attributes Section (for Products) */}
            {hasAttributes && Object.entries(attributes).map(([attrName, values]) => (
                <div key={attrName} className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button
                        onClick={() => toggleSection(`attr_${attrName}`)}
                        className="w-full flex items-center justify-between mb-3"
                    >
                        <h3 className="font-semibold text-base text-gray-800 dark:text-white capitalize">{attrName}</h3>
                        {expandedSections[`attr_${attrName}`] !== false ?
                            <ChevronUp className="w-4 h-4 text-gray-500" /> :
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        }
                    </button>

                    {expandedSections[`attr_${attrName}`] !== false && (
                        <div className="flex flex-col gap-2">
                            {values.map((value) => {
                                const isSelected = (selectedAttributes[attrName] || []).includes(value);
                                return (
                                    <label
                                        key={value}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleAttributeToggle(attrName, value)}
                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                            {value}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Types Section (for Blogs) */}
            {hasTypes && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button
                        onClick={() => toggleSection('types')}
                        className="w-full flex items-center justify-between mb-3"
                    >
                        <h3 className="font-semibold text-base text-gray-800 dark:text-white">Type</h3>
                        {expandedSections.types ?
                            <ChevronUp className="w-4 h-4 text-gray-500" /> :
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        }
                    </button>

                    {expandedSections.types && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => onSelectType("")}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedType
                                    ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                All Types
                            </button>
                            {types.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onSelectType(type)}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${selectedType === type
                                        ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FilterSidebar;
