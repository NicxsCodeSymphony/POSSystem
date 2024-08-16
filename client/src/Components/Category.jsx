import { useState, useEffect } from "react";
import axios from "axios";

const Category = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('http://localhost:3000/category');
                setCategories(res.data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetch();
    }, []);

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        onSelectCategory(categoryId);
    };

    return (
        <div className="flex w-full mt-10 gap-5">
            {categories.map((data) => (
                <div
                    key={data.id}
                    className={`px-6 py-2 rounded-xl cursor-pointer ${activeCategory === data.category_id ? 'bg-[#f46601] text-white' : 'bg-white text-black'}`}
                    onClick={() => handleCategoryClick(data.category_id)}
                >
                    {data.category_name}
                </div>
            ))}
        </div>
    );
};

export default Category;
