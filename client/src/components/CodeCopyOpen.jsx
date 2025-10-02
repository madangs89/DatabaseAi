import React from 'react'
import { CodeBlock, dracula } from "react-code-blocks";


const CodeCopyOpen = ({llmCodeFromServer, copyOpen}) => {
  return (
    <>
      
      {copyOpen && (
            <div className="flex-1 text-white px-3  overflow-y-auto rounded-lg shadow-lg w-full">
              {llmCodeFromServer.length > 0 ? (
                <CodeBlock

                  text={llmCodeFromServer}
                  language="javascript"
                  showLineNumbers={true}
                  theme={dracula}
                  wrapLines
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#525252]">
                    Please create your database.
                    <br /> then we handle the coding part
                  </p>
                </div>
              )}
            </div>
          )}
    </>
  )
}

export default CodeCopyOpen
