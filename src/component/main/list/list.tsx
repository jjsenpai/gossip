import React from 'react';
import SearchIcon from "../../../assets/main/search.svg";

const ChatSkeleton: React.FC = () => {
  const renderChatMessages = () => {
    const messages = [];
    for (let i = 0; i < 10; i++) {
      messages.push(
        <div key={i} className="flex items-start space-x-4">
          <div className="bg-gray-300 h-12 w-20 rounded-full animate-pulse"></div>
          <div className="bg-gray-300 h-12 rounded animate-pulse w-full"></div>
        </div>
      );
    }
    return messages;
  };

  return (
    <div className="h-full w-full border py-[30px] px-[30px] relative">
      {/* Search Bar */}
      <div className="relative">
        <input
          id="search-input"
          placeholder="Search"
          className="w-full pl-[50px] h-[40px] rounded-xl bg-[#dbdcff] animate-pulse"
        />
        <label htmlFor="search-input" className="absolute top-1/2 transform -translate-y-1/2 left-2">
          <img
            src={SearchIcon}
            alt="search icon"
            className="w-5 h-5 text-gray-500"
            aria-hidden="true"
          />
          <span className="sr-only">Search</span>
        </label>
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-4">
        {renderChatMessages()}
      </div>
    </div>
  );
};

export const List = () => {
  return <ChatSkeleton />;
};