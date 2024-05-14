import React from "react";

const ServerMaintenancePage = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-100 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Server Under Maintenance
        </h1>
        <p className="text-gray-700 text-base mb-6">
          We're currently performing some scheduled maintenance to improve our
          services.
        </p>
        <p className="text-gray-700 text-base">
          We'll be back soon. In the meantime, please try again later.
        </p>
      </div>
    </div>
  );
};

export default ServerMaintenancePage;
