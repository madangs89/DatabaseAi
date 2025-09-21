import ReactMarkdown from "react-markdown";

const Chat = ({
  chatOpen,
  chatMessages,
  chatContainerRef,
  handleScroll,
  bottomRef,
}) => {
  return (
    <>
      {chatOpen && (
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4"
        >
          {chatMessages && chatMessages.length > 0 ? (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex  ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-line  px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#232323] text-gray-200"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => {
                        const text = String(props.children);
                        if (/^[A-Z].*:$/g.test(text)) {
                          return (
                            <h3 className="font-bold text-white mt-2 mb-1">
                              {text}
                            </h3>
                          );
                        }
                        return (
                          <p {...props} className="mb-1 leading-relaxed" />
                        );
                      },
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc ml-5 mb-1" />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} className="mb-0.5" />
                      ),
                    }}
                  >
                    {msg.text.replace(/\n{2,}/g, "\n")}
                  </ReactMarkdown>
                </div>
                <div ref={bottomRef} />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#525252]">Start a conversation</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
