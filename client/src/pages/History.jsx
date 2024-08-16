import { useState, useEffect } from "react";
import axios from "axios";

const History = () => {
    const [data, setData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [details, setDetails] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/history');
                const groupedData = groupDataByDate(res.data.history);
                setData(groupedData);
            } catch (error) {
                console.error('Error fetching history data:', error.message);
            }
        };

        fetchData();
    }, []);

    const groupDataByDate = (data) => {
        const grouped = data.reduce((acc, entry) => {
            const date = new Date(entry.time).toDateString();
            if (!acc[date]) {
                acc[date] = {  date, total: 0, discount: 0, initial_total: 0, actions: [] };
            }
            acc[date].initial_total += entry.initial_total;
            acc[date].discount += entry.discount;
            acc[date].total += entry.total;
            acc[date].actions.push(entry);
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const handleViewPurchased = (date) => {
        const selectedDetails = data
            .find(entry => entry.date === date)
            .actions.map(item => ({
                ...item,
                purchased_item: JSON.parse(item.purchased_item) 
            }));

        setDetails(selectedDetails);
        setSelectedDate(date);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedDate(null);
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      // Options for time formatting
      const options = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      };
      return date.toLocaleTimeString([], options);
  };
  
    return (
        <div>
            <h2 className='2xl:text-4xl xl:text-2xl font-bold mt-6'>History</h2>
            <p className='2xl:mt-4 xl:mt-3 2xl:text-sm'>View transaction history here</p>

            <div className='mt-8 w-full'>
                {data.length > 0 && (
                    <table className='w-full table-fixed'>
                        <thead className='text-sm bg-blue text-gray-500 font-semibold h-12 border-b'>
                            <tr>
                                <th className='p-2 text-left'>Date</th>
                                <th className='p-2 text-left'>Subtotal</th>
                                <th className='p-2 text-left'>Discount</th>
                                <th className='p-2 text-left'>Total</th>
                                <th className='p-2 text-left'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, index) => (
                                <tr className='h-16 border-b' key={index}>
                                    <td className='p-2'>{entry.date}</td>
                                    <td className='p-2'>₱{entry.initial_total}</td>
                                    <td className='p-2'>₱{entry.discount}</td>
                                    <td className='p-2'>₱{entry.total.toFixed(2)}</td>
                                    <td className='p-2'>
                                        <button
                                            className="text-blue-500 hover:underline"
                                            onClick={() => handleViewPurchased(entry.date)}
                                        >
                                            View Purchased
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {data.length === 0 && (
                    <div className='overflow-y-auto scrollbar-container' style={{ maxHeight: '38rem' }}>
                        <table className='w-full table-fixed'>
                            <tbody>
                                <tr>
                                    <td colSpan={3} className='py-15 text-center text-gray-500 font-medium'>
                                        <div className='bg-gray-100 p-4 rounded border border-gray-300'>
                                            <p>No History Data Available</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Component */}
            {modalVisible && (
                <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl relative'>
                        <h3 className='text-xl font-bold mb-4'>Details for {selectedDate}</h3>
                        <button
                            onClick={closeModal}
                            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <table className='w-full table-fixed'>
                            <thead className='text-sm bg-blue text-gray-500 font-semibold h-12 border-b'>
                                <tr>
                                    <th className='p-2 text-left'>Transaction ID</th>
                                    <th className='p-2 text-left'>Product Name</th>
                                    <th className='p-2 text-left'>Stock Keeping Unit</th>
                                    <th className='p-2 text-left'>Quantity</th>
                                    <th className='p-2 text-left'>Price</th>
                                    <th className='p-2 text-left'>Total</th>
                                    <th className='p-2 text-left'>Time</th>
                                    <th className='p-2 text-left'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((entry, index) => (
                                    entry.purchased_item.map((item, subIndex) => (
                                        <tr className='h-16 border-b' key={subIndex}>
                                            <td className='p-2'>{entry.transaction_id}</td>
                                            <td className='p-2'>{item.product_name}</td>
                                            <td className='p-2'>{item.sku}</td>
                                            <td className='p-2'>{item.quantity}</td>
                                            <td className='p-2'>₱{(item.total / item.quantity).toFixed(2)}</td>
                                            <td className='p-2'>₱{item.total.toFixed(2)}</td>
                                            <td className='p-2'>{formatTimestamp(entry.time)}</td>
                                            <td className='p-2'>{entry.purchased_item ? 'Purchased' : 'N/A'}</td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
