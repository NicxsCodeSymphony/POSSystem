import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../Components/Modal";

const Settings = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const [addCategoryName, setAddCategoryName] = useState('');
    const [productId, setProductId] = useState(null);
    const [addProductName, setAddProductName] = useState('');
    const [addProductCategory, setAddProductCategory] = useState('');
    const [addProductSku, setAddProductSku] = useState('');
    const [addProductPrice, setAddProductPrice] = useState('');

    // State for error handling
    const [categoryError, setCategoryError] = useState('');
    const [productError, setProductError] = useState('');

    // Fetch categories and products when component mounts
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/category');
            setCategories(res.data.categories);
            setCategoryError(''); // Clear error if successful
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategoryError('Failed to fetch categories. Please try again.');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:3000/product');
            setProducts(res.data.product);
            setProductError(''); // Clear error if successful
        } catch (error) {
            console.error("Error fetching products:", error);
            setProductError('Failed to fetch products. Please try again.');
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    // Save or Edit Product
    const saveProduct = async () => {
        try {
            if (productId) {
                // If editing a product
                const res = await axios.put(`http://localhost:3000/products/${productId}`, {
                    product_name: addProductName,
                    category_id: addProductCategory,
                    sku: addProductSku,
                    price: addProductPrice
                });
                // Update products list
                setProducts(products.map(prod => prod.id === productId ? res.data : prod));
            } else {
                // If adding a new product
                const res = await axios.post('http://localhost:3000/products', {
                    product_name: addProductName,
                    category_id: addProductCategory,
                    sku: addProductSku,
                    price: addProductPrice
                });
                // Update products list
                setProducts([...products, res.data]);
            }

            // Close modal and reset state
            setIsProductModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error saving product:", error);
            if (error.response && error.response.data) {
                if (error.response.data.message === 'Product name already exists') {
                    setProductError('A product with this name already exists.');
                } else if (error.response.data.message === 'SKU already exists') {
                    setProductError('A product with this SKU already exists.');
                } else {
                    setProductError('Failed to save product. Please try again.');
                }
            } else {
                setProductError('Failed to save product. Please try again.');
            }
        }
    };

    // Save or Edit Category
    const saveCategory = async () => {
        try {
            // If adding a new category
            const res = await axios.post('http://localhost:3000/category', {
                category_name: addCategoryName,
            });

            // Update categories list
            setCategories([...categories, res.data]);

            // Close modal and reset state
            setIsCategoryModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error saving category:", error);
            if (error.response && error.response.data) {
                if (error.response.data.message === 'Category name already exists') {
                    setCategoryError('A category with this name already exists.');
                } else {
                    setCategoryError('Failed to save category. Please try again.');
                }
            } else {
                setCategoryError('Failed to save category. Please try again.');
            }
        }
    };

    // Reset Product Form
    const resetProductForm = () => {
        setProductId(null);
        setAddProductName('');
        setAddProductCategory('');
        setAddProductSku('');
        setAddProductPrice('');
        setProductError(''); // Clear any existing error message
    };

    // Open the Edit Product Modal
    const editProduct = (product) => {
        setProductId(product.id);
        setAddProductName(product.product_name);
        setAddProductCategory(product.category_id);
        setAddProductSku(product.sku);
        setAddProductPrice(product.price);
        setIsProductModalOpen(true);
    };

    const deleteProduct = async (productId) => {
        try {
            await axios.delete(`http://localhost:3000/products/${productId}`);
            setProducts(products.filter(prod => prod.id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
            setProductError('Failed to delete product. Please try again.');
        }
    };

    const deleteCategory = async (categoryId) => {
        try {
            await axios.delete(`http://localhost:3000/category/${categoryId}`);
            setCategories(categories.filter(cat => cat.category_id !== categoryId));
        } catch (error) {
            console.error("Error deleting category:", error);
            setCategoryError('Failed to delete category. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">Settings</h2>

            {/* Categories Section */}
            <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4">Manage Categories</h3>
                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-[#f46601] text-white px-4 py-2 rounded mb-4">
                    Add Category
                </button>
                {categoryError && <p className="text-red-500 mb-4">{categoryError}</p>}
                <div className="overflow-y-auto max-h-60">
                    <table className="w-full table-fixed border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Category Name</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        No categories available
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.category_id}>
                                        <td className="p-2 border">{category.category_id}</td>
                                        <td className="p-2 border">{category.category_name}</td>
                                        <td className="p-2 border">
                                            <button
                                                className="text-red-500 hover:underline"
                                                onClick={() => deleteCategory(category.category_id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <h3 className="text-2xl font-semibold mb-4">Manage Products</h3>
                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-[#f46601] text-white px-4 py-2 rounded mb-4">
                    Add Product
                </button>
                {productError && <p className="text-red-500 mb-4">{productError}</p>}
                <div className="overflow-y-auto max-h-60">
                    <table className="w-full table-fixed border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Product Name</th>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">SKU</th>
                                <th className="p-2 border">Price</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No products available
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="p-2 border">{product.product_name}</td>
                                        <td className="p-2 border">{product.category_id}</td>
                                        <td className="p-2 border">{product.sku}</td>
                                        <td className="p-2 border">{product.price}</td>
                                        <td className="p-2 border">
                                            <button
                                                className="text-blue-500 hover:underline mr-2"
                                                onClick={() => editProduct(product)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-500 hover:underline"
                                                onClick={() => deleteProduct(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <Modal
                    title="Add Category"
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSave={saveCategory}
                    resetForm={() => setAddCategoryName('')}
                >
                    <input
                        type="text"
                        value={addCategoryName}
                        onChange={(e) => setAddCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="border p-2 mb-4 w-full"
                    />
                    {categoryError && <p className="text-red-500 mb-4">{categoryError}</p>}
                </Modal>
            )}

            {/* Product Modal */}
            {isProductModalOpen && (
                <Modal
                    title={productId ? "Edit Product" : "Add Product"}
                    onClose={() => {
                        setIsProductModalOpen(false);
                        resetProductForm();
                    }}
                    onSave={saveProduct}
                    resetForm={resetProductForm}
                >
                    <input
                        type="text"
                        value={addProductName}
                        onChange={(e) => setAddProductName(e.target.value)}
                        placeholder="Product Name"
                        className="border p-2 mb-4 w-full"
                    />
                    <select
                        value={addProductCategory}
                        onChange={(e) => setAddProductCategory(e.target.value)}
                        className="border p-2 mb-4 w-full"
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={addProductSku}
                        onChange={(e) => setAddProductSku(e.target.value)}
                        placeholder="SKU"
                        className="border p-2 mb-4 w-full"
                    />
                    <input
                        type="number"
                        value={addProductPrice}
                        onChange={(e) => setAddProductPrice(e.target.value)}
                        placeholder="Price"
                        className="border p-2 mb-4 w-full"
                    />
                    {productError && <p className="text-red-500 mb-4">{productError}</p>}
                </Modal>
            )}
        </div>
    );
};

export default Settings;
