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


import { NewChatButton } from "../../modal/chatButton";

export const List = ({showModal}) => {

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

      <NewChatButton showModal={showModal} />

    </div>
  );
  
<div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
    <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
    </div>
    <div className="w-full">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
    </div>
    <span className="sr-only">Loading...</span>
</div>


};

export const List = () => {
  return <ChatSkeleton />;
};