// Modal.js
const Modal = ({ title, onClose, onSave, resetForm, children }) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        &times;
                    </button>
                </div>
                <div>
                    {children}
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
