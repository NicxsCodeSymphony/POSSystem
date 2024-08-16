import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';

const Sidebar = () => {
    return (
        <div className="w-36 h-screen border-r flex flex-col items-center py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[#f46601]">POS</h1>
            </div>
            <div className="flex flex-col mt-10 items-center gap-10">
                <a href="/" className="text-gray-700 hover:text-[#f46601] transition-colors">
                    <FaTachometerAlt size={24} />
                </a>
                <a href="/history" className="text-gray-700 hover:text-[#f46601] transition-colors">
                    <FaUser size={24} />
                </a>
                <a href="/settings" className="text-gray-700 hover:text-[#f46601] transition-colors">
                    <FaCog size={24} />
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
