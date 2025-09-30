import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import SpinnerLoader from "./loaders/SpinnerLoader";

const Chat = ({
  chatOpen,
  chatMessages,
  chatContainerRef,
  handleScroll,
  bottomRef,
}) => {
  const loadingSlice = useSelector((state) => state.loading);

  return (
    <>
      {chatOpen && (
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4"
        >
          {loadingSlice?.chatLoading ? (
            <div className="flex w-full h-full items-center justify-center">
              <SpinnerLoader />
            </div>
          ) : chatMessages && chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <div
                key={`${msg._id} ${index}`}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg?.type === "status" ? (
                  // 👇 Custom single updating bubble
                  <div className="max-w-[80%] px-4 py-2 rounded-lg flex-col   text-gray-200 italic flex items-start gap-2">
                    <span className="animate-pulse text-[#525252] ">
                      {"Working on It..."}
                    </span>
                    <span className="text-[#737373]">{msg?.text}</span>
                  </div>
                ) : (
                  // 👇 Regular bubbles with markdown

                  <div
                    className={`max-w-[90%] whitespace-pre-line px-4 py-2 flex items-center justify-center flex-col gap-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#232323] text-gray-200"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="my-0" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-semibold text-white"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="flex flex-col list-disc gap-1"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="flex flex-col list-decimal gap-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4 my-0" {...props} />
                        ),
                      }}
                    >
                      {msg.text.replace(/\n{2,}/g, "\n")}
                    </ReactMarkdown>
                  </div>
                )}
                <div ref={bottomRef}></div>
              </div>
            ))
          ) : (
            <div
              key={"empty"}
              className="flex items-center justify-center h-full"
            >
              <p className="text-[#525252]">Start a conversation</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
