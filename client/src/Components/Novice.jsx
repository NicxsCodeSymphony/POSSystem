import axios from "axios";
import { useState, useEffect } from "react";

const Checkout = ({ refreshCheckout }) => {
    const [checkout, setCheckout] = useState([]);
    const [discountType, setDiscountType] = useState("none"); // Add state for discount type
    const [discountAmount, setDiscountAmount] = useState(0); // Add state for discount amount

    const fetchCheckoutData = async () => {
        try {
            const res = await axios.get('http://localhost:3000/checkout');
            setCheckout(res.data.checkouts);
        } catch (error) {
            console.error('Error fetching checkout data:', error.message);
        }
    };

    useEffect(() => {
        fetchCheckoutData();
    }, [refreshCheckout]);

    useEffect(() => {
        // Update discount amount when discount type changes
        if (discountType === "student") {
            setDiscountAmount(10); // 10% discount for students
        } else if (discountType === "senior") {
            setDiscountAmount(15); // 15% discount for seniors
        } else {
            setDiscountAmount(0); // No discount
        }
    }, [discountType]);

    const changeQuantity = async (id, quantity) => {
        try {
            if (quantity === 0) {
                await axios.delete(`http://localhost:3000/checkout/${id}`);
                setCheckout(checkout.filter(item => item.id !== id));
            } else {
                const updatedCheckout = checkout.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: quantity, total: item.price * quantity };
                    }
                    return item;
                });
                setCheckout(updatedCheckout);

                await axios.put(`http://localhost:3000/checkout/${id}`, {
                    quantity: quantity,
                    total: updatedCheckout.find(item => item.id === id).total
                });
            }
        } catch (error) {
            console.error('Error updating quantity:', error.message);
        }
    };

    const handlePurchase = async () => {
        try {
            const purchasedItems = checkout.map(item => ({
                product_name: item.product_name,
                sku: item.sku,
                price: item.price,
                quantity: item.quantity,
                total: item.total 
            }));
    
            // Calculate the initial total amount (sum of all item totals)
            const initialTotal = checkout.reduce((acc, item) => acc + (item.total || 0), 0); // Ensure item.total is valid
            const discount = (initialTotal * discountAmount) / 100;
            const finalTotal = initialTotal - discount;
    
            const purchaseData = {
                purchased: JSON.stringify(purchasedItems),
                initial_total: initialTotal.toFixed(2), 
                total: finalTotal.toFixed(2),
                discount: discount.toFixed(2)
            };
    
            console.log('Sending purchase data:', purchaseData); // Debugging line
    
            await axios.post('http://localhost:3000/history', purchaseData);
    
            setCheckout([]);
            alert('Purchase completed successfully!');
        } catch (error) {
            console.error('Error processing purchase:', error.message);
        }
    };
    
    

    return (
        <div className="flex-1 h-screen bg-white py-10 px-10">
            <h1 className="text-2xl font-bold mb-10">Current Order</h1>

            <div className="h-[55%] overflow-y-auto">
                {checkout.length > 0 ? (
                    checkout.map((item, index) => (
                        <div className="mt-5" key={index}>
                            <div className="flex gap-4">
                                <img
                                    className="w-16 h-16 rounded-xl"
                                    src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIbVFCS-v-eqewRtdVZNp18I5m2P__ul2Hng&s`}
                                    alt={item.product_name}
                                />
                                <div className="relative w-full">
                                    <div>
                                        <h1 className="text-lg font-bold">{item.product_name} <span className="text-xs font-light">{item.sku}</span></h1>
                                    </div>
                                    <div className="absolute bottom-0 mt-5 flex w-full justify-between">
                                        <h1 className="text-[#f46601] font-bold">₱{item.total}</h1>
                                        <div className="flex gap-6">
                                            <button
                                                className="text-xs bg-[#f46601] text-white w-5 rounded"
                                                onClick={() => changeQuantity(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <p>{item.quantity}</p>
                                            <button
                                                className="text-xs text-white bg-[#f46601] w-5 rounded"
                                                onClick={() => changeQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No items in the checkout.</p>
                )}
            </div>

            <div className="w-full mt-10 h-[20%] bg-[#f8f8f8] rounded p-4">
                <p className="flex justify-between text-sm text-gray-600">Subtotal <span>₱{checkout.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span></p>
                <p className="flex justify-between text-sm text-gray-600 mt-2">Discount <span>-₱{(checkout.reduce((acc, item) => acc + (item.price * item.quantity), 0) * discountAmount / 100).toFixed(2)}</span></p>
                <div className="border border-dashed mt-8"></div>
                <h1 className="flex justify-between text-sm text-gray-600 mt-5 font-bold text-xl">Total <span>₱{(checkout.reduce((acc, item) => acc + (item.price * item.quantity), 0) - (checkout.reduce((acc, item) => acc + (item.price * item.quantity), 0) * discountAmount / 100)).toFixed(2)}</span></h1>
            </div>

            <div className="mt-10">
                <label className="block mb-2 text-sm font-medium text-gray-700">Discount Type</label>
                <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="student">Student (10% off)</option>
                    <option value="senior">Senior (15% off)</option>
                </select>
            </div>

            <button
                className="mt-10 bg-[#f46601] p-3 text-white rounded-lg w-full"
                onClick={handlePurchase}
            >
                Purchase Now
            </button>
        </div>
    );
};

export default Checkout;
