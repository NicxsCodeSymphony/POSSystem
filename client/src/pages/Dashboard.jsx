import Checkout from "../Components/Novice";
import Category from "../Components/Category";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [productList, setProductList] = useState([]);
    const [error, setError] = useState(null);
    const [select, setSelect] = useState([]);
    const [checkoutTrigger, setCheckoutTrigger] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'product'

    const handleCategorySelect = async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:3000/products/${categoryId}`);
            if (response.data && response.data.products) {
                if (response.data.products.length > 0) {
                    setProductList(response.data.products);
                    setError(null); // Clear previous errors
                    setViewMode('list'); // Reset to product list view
                } else {
                    setError('No products available for the selected category.');
                }
            } else {
                setProductList([]);
                setError('Product data is not available.');
            }
            console.log("Selected category ID:", categoryId);
        } catch (error) {
            setError('Error fetching product data. Please try again later.');
            console.error('Error fetching product data:', error.message);
        }
    };

    const selectedProduct = async (productName) => {
        try {
            const res = await axios.get(`http://localhost:3000/selectedProduct?productName=${productName}`);
            if (res.data && res.data.products) {
                setSelect(res.data.products);
                setViewMode('product'); // Switch to product view
            } else {
                console.error('No data available for the selected product.');
            }
        } catch (error) {
            console.error('Error fetching selected product data:', error.message);
        }
    };

    const checkout = async (product) => {
        try {
            const res = await axios.post('http://localhost:3000/checkout', {
                product_name: product.product_name,
                sku: product.sku,
                price: product.price,
                category_id: product.category_id
            });
            console.log("Checkout Response:", res.data);
            setCheckoutTrigger(prev => !prev); // Toggle trigger to refresh checkout
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error("Server responded with an error:", error.response.data);
            } else if (error.request) {
                // Request was made but no response was received
                console.error("No response received from server:", error.request);
            } else {
                // Something happened in setting up the request
                console.error("Error during checkout:", error.message);
            }
        }
    };

    return (
        <div className="flex">
            <div className="w-9/12 py-10 px-20">
                <h1 className="font-bold text-2xl">Welcome, John Nico!</h1>
                <p className="mt-2 text-sm text-slate-400">Choose what your customers need</p>
                <Category onSelectCategory={handleCategorySelect} />

                {error ? (
                    <div className="mt-10 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
                        {error}
                    </div>
                ) : (
                    <div className="mt-10 w-full flex flex-wrap gap-7">
                        {viewMode === 'list' ? (
                            productList.length > 0 ? (
                                productList.map((product) => (
                                    <div
                                        key={product.id}
                                        className="w-48 h-72 border rounded-xl py-3 px-4 relative cursor-pointer"
                                        onClick={() => selectedProduct(product.product_name)}
                                    >
                                        <img
                                            className="w-full h-32 rounded-lg object-cover"
                                            src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIbVFCS-v-eqewRtdVZNp18I5m2P__ul2Hng&s`}
                                            alt={product.product_name}
                                        />
                                        <h4 className="mt-4 font-bold text-lg">{product.product_name}</h4>
                                        <p className="mt-2 text-xs text-gray-700">
                                            Refreshing and crisp, {product.product_name} is the perfect drink
                                        </p>
                                        <h6 className="mt-1 absolute bottom-5 font-bold text-xs text-[#f46601]">
                                           Choose Product
                                        </h6>
                                    </div>
                                ))
                            ) : (
                                <p>No products found.</p>
                            )
                        ) : viewMode === 'product' && select.length > 0 ? (
                            select.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-48 h-72 border rounded-xl py-3 px-4 relative"
                                    onClick={() => checkout(product)} // Ensure checkout is triggered
                                >
                                    <img
                                        className="w-full h-32 rounded-lg object-cover"
                                        src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIbVFCS-v-eqewRtdVZNp18I5m2P__ul2Hng&s`}
                                        alt={product.product_name}
                                    />
                                    <h4 className="mt-4 font-bold text-lg">{product.product_name}</h4>
                                    <p className="mt-2 text-xs text-gray-700">
                                        Refreshing and crisp, <span className="text-[#f46601] font-bold">{product.sku}</span> is the perfect drink
                                    </p>
                                    <h6 className="mt-1 absolute bottom-5 font-bold text-lg text-[#f46601]">
                                        ₱{product.price.toFixed(2)}
                                    </h6>
                                </div>
                            ))
                        ) : (
                            <p>No products found.</p>
                        )}
                    </div>
                )}

                {viewMode === 'product' && (
                    <button
                        className="mt-10 bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setViewMode('list')} // Back to product list
                    >
                        Back to Products
                    </button>
                )}
            </div>

            <Checkout refreshCheckout={checkoutTrigger} />
        </div>
    );
};

export default Dashboard;
